// controllers/postController.js

const Post = require('../models/post');
const User = require('../models/user');
const Enterprise = require('../models/enterprise');

// Create a new post
exports.createPost = async (req, res) => {
    try {
      const { content } = req.body;
      const userId = req.session.userId;
  
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
  
      const newPost = new Post({
        content,
        userId
      });
  
      await newPost.save();
      res.status(201).json(newPost);
    } catch (err) {
      res.status(500).json({ error: 'Error creating post' });
    }
  };
    // Get all posts for a user or enterprise
    exports.getPostsByUsername = async (req, res) => {
        try {
          const username = req.params.username;
      
          const user = await User.findOne({ username });
          const enterprise = await Enterprise.findOne({ username });
      
          if (!user && !enterprise) {
            return res.status(404).json({ error: 'User or enterprise not found' });
          }
      
          const userId = user ? user._id : enterprise._id;
      
          const posts = await Post.find({ userId }).sort({ createdAt: -1 });
      
          res.status(200).json(posts);
        } catch (err) {
          res.status(500).json({ error: 'Error fetching posts' });
        }
      };
      
// Update a post
exports.updatePost = async (req, res) => {
    try {
      const postId = req.params.id;
      const { content } = req.body;
      const userId = req.session.userId;
  
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      if (post.userId.toString() !== userId) {
        return res.status(403).json({ error: 'User not authorized to update this post' });
      }
  
      post.content = content;
      await post.save();
      res.status(200).json(post);
    } catch (err) {
      (res.status500).json({ error: 'Error updating post' });
    }
  };
  
  // Delete a post

exports.deletePost = async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.session.userId;
  
      console.log('Deleting post with ID:', postId);
      console.log('Current user ID from session:', userId);
  
      const post = await Post.findById(postId);
  
      if (!post) {
        console.log('Post not found');
        return res.status(404).json({ error: 'Post not found' });
      }
  
      console.log('Post found:', post);
  
      if (post.userId.toString() !== userId) {
        console.log('User not authorized to delete this post');
        return res.status(403).json({ error: 'User not authorized to delete this post' });
      }
  
      await Post.deleteOne({ _id: postId });
      console.log('Post deleted successfully');
      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
      console.error('Error deleting post:', err);
      res.status(500).json({ error: 'Error deleting post' });
    }
  };
  