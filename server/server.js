import express from 'express';
//import path from 'path';
//import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import messageRoutes from './routes/messageRoutes.js';

//import rubberDuckRoutes from './routes/rubberDucks.js'; // Import the routes

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

//app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve static images

app.use(cors({ 
  origin: process.env.CLIENT_URL
}));


app.use('/api/messages', messageRoutes);

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
