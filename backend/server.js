//todo)) Make a MERN app with RESTful API architecture along with JWT auth
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const youtubeRoutes = require('./routes/youtube');
const todoRoutes = require('./routes/todo');
const authRoutes = require('./routes/auth');

// initialize our web app
const app = express();

//? call our Database function
connectDB();

// using Middlewares 🥷🏼
app.use(cors());
app.use(express.json()); // parses JSON requests

// Routes
app.use('/api', youtubeRoutes);
app.use('/api', todoRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});
