const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Create a new post
router.post('/posts', postController.createPost);

// Get all posts for a user
router.get('/:username/posts', postController.getPostsByUsername);

// Update a post
router.put('/posts/:id', postController.updatePost);

// Delete a post
router.delete('/posts/:id', postController.deletePost);

module.exports = router;
