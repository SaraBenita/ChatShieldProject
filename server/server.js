import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import monitorRoutes from './routes/monitorRoutes.js';
import mongoose from 'mongoose';


dotenv.config();

const mongoKey = process.env.MONGO_KEY;

mongoose.connect(mongoKey, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});




const app = express();
app.use(express.json());


app.use(cors()); 


app.use('/messages', messageRoutes);
app.use('/user', userRoutes);
app.use('/monitor',monitorRoutes);

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
