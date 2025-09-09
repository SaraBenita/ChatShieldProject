import classifyMessage from "../analyzer/openai/classifyMessage.js";
import Message from "../models/messageModel.js"; 

const sendMessage = async (req, res) => {
  try {

    const message = req.body.text;
    const userPhone = req.user.phone; 
    const chatName = req.body.chatName;
    const timeStemp = req.body.timestamp;


    const analysisResult = await classifyMessage(message);

    const responseMessage = `Warning!\nYour message: ${message}`;

    const [label, ...rest] = analysisResult.split(/\.(.+)/); 
    const explanation = rest.join('.').trim(); 
    if (label !== "Safe." && label !== "Safe") {
      const newMessage = new Message({
        phone: userPhone,
        chatName: chatName,
        timestamp: timeStemp,
        message: message,
        analysis: {
          label: label,
          explanation: explanation,
        },
      });


      await newMessage.save(); 
    }

    res.json({ success: true, message: responseMessage, label: label, explanation: explanation, chatName: chatName });
  }

  catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    console.log(error.error);
  }
};


const getMessagesByUser = async (req, res) => {
  try {
    const phonesParam = req.query.phones;
    const phoneParam = req.query.phone;

    let query = {};

    if (phonesParam) {
      const phones = phonesParam.split(',');
      query = { phone: { $in: phones } };
    } else if (phoneParam) {
      query = { phone: phoneParam };
    } else {
      return res.status(400).json({ success: false, message: "Missing phone parameter(s)" });
    }

    const messages = await Message.find(query).sort({ timestamp: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error("getMessagesByUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getStatsByUser = async (req, res) => {
  try {
    const phonesParam = req.query.phones;
    const phoneParam = req.query.phone;

    let query = {};

    if (phonesParam) {
      const phones = phonesParam.split(',');
      query = { phone: { $in: phones } };
    } else if (phoneParam) {
      query = { phone: phoneParam };
    } else {
      return res.status(400).json({ success: false, message: "Missing phone parameter(s)" });
    }

    const messages = await Message.find(query);

    const stats = {
      sensitiveCount: messages.length,
      labels: {
        "Personal Information": 0,
        "Location/Activity": 0,
        "Financial Information": 0,
        "Social Media Activity": 0,
      },
      hourlyActivity: Array(24).fill(0),
      dailyRisk: [],
    };

    const dailyMap = {};

    for (const msg of messages) {
      const label = msg.analysis?.label?.trim();
      const timestamp = new Date(msg.timestamp);

      if (label && stats.labels[label] !== undefined) {
        stats.labels[label]++;
      }

      const day = timestamp.toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;

      const hour = timestamp.getHours();
      stats.hourlyActivity[hour]++;
    }

    stats.dailyRisk = Object.entries(dailyMap).map(([date, sensitive]) => ({
      date,
      sensitive,
    }));

    res.json(stats);
  } catch (error) {
    console.error("getStatsByUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export {
  sendMessage, getMessagesByUser, getStatsByUser
};


