const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const requestLogger = require("./utilities/requestLogger")
const errorLogger = require("./utilities/errorLogger")
const authRoutes = require("./routes/auth.routes")
const postRoutes = require("./routes/posts.routes")
const categoryRoutes = require("./routes/categories.routes")
const tagRoutes = require("./routes/tags.routes")
const commentRoutes = require("./routes/comments.routes")
const themeRoutes = require("./routes/themes.routes")
const friendRoutes = require("./routes/friends.routes")
const analyticsRoutes = require("./routes/analytics.routes");
const AnalyticsController = require("./services/analytics.service");
const User = require('./models/user.model');
const Post = require('./models/post.model');
const Comment = require('./models/comment.model')

const app = express();

// ============ MIDDLEWARES ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes)
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/analytics", analyticsRoutes);

app.locals.trackView = async (postId, userId) => {
  await AnalyticsController.trackView({ params: { postId }, user: { id: userId } }, {}, () => {});
};

app.use(cors({origin: 'http://localhost:3000', credentials: true}));
app.use(requestLogger);
app.use(errorLogger);

// ============ DATABASE CONNECTION ============
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogify');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// ============ ROUTES ============
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Capstone Backend API' });
});

app.get('/getusers', async (req, res) => {
  try{
    const users = await User.find()
    res.send(users)
  } catch(e) {
    console.log(e)
  }
  // res.json({ message: 'Welcome to Capstone Backend API' });
});

app.get('/getposts', async (req, res) => {
  try{
    const posts = await Post.find()
    res.send(posts)
  } catch(e) {
    console.log(e)
  }
  // res.json({ message: 'Welcome to Capstone Backend API' });
});

app.get('/getcomments', async (req, res) => {
  try{
    const comments = await Comment.find()
    res.send(comments)
  } catch(e) {
    console.log(e)
  }
  // res.json({ message: 'Welcome to Capstone Backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============ SERVER SETUP ============
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = app;
