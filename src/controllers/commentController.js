const Comment = require("../models/comment"); // Replace with your comment model path
const mongoose = require("mongoose");

// Get Comments for a specific task
const getComments = async (req, res) => {
  const { taskId } = req.body;

  // Validate ID format (optional)
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: "Invalid  Task ID" });
  }

  try {
    const comments = await Comment.find({ taskId }); // Filter by taskId
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a Comment for a specific task
const createComment = async (req, res) => {
  // const { taskId } = req.params;
  const { content, authorId, taskId } = req.body; // Assuming content is required

  // Validate ID format (optional)
  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return res.status(400).json({ message: "Invalid author ID" });
  }
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }

  if (!content) {
    return res.status(400).json({ message: "Missing comment content" });
  }

  try {
    const newComment = new Comment({
      content,
      authorId,
      taskId,
      // Add author field if applicable (requires User model integration)
    });
    const savedComment = await newComment.save();
    res.status(201).json(savedComment); // Created
  } catch (err) {
    res.status(400).json({ message: err.message }); // Bad request (validation errors)
  }
};

//updateComment
const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const updates = Object.keys(req.body); // Get update fields from request body

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: "Invalid Comment ID" });
  }

  const allowedUpdates = ["content"]; // List of allowed update fields

  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update allowed fields
    updates.forEach((update) => (comment[update] = req.body[update]));

    // Optional: Set updatedAt timestamp
    comment.updatedAt = Date.now();

    await comment.save();

    res.json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message }); // Bad request (validation errors)
  }
};

// Delete a Comment
const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ message: "Invalid Comment ID" });
  }

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};
