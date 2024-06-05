const Comment = require("../models/comment");
const Task = require("../models/task");
const User = require("../models/user");
const mongoose = require("mongoose");

// Get comments based on dynamic attribute
const getComments = async (req, res) => {
  const filters = req.query; // Expect multiple attribute-value pairs

  if (Object.keys(filters).length === 0) {
    return res.status(400).json({ message: "Missing filters in query" });
  }

  const filterObject = {};
  for (const key in filters) {
    // Validate ObjectId fields
    if (key === "taskId" || key === "authorId") {
      if (!mongoose.Types.ObjectId.isValid(filters[key])) {
        return res.status(400).json({ message: "Invalid ObjectId" });
      }
    }
    filterObject[key] = filters[key];
  }

  try {
    const comments = await Comment.find(filterObject)
      .populate("authorId", "name email") // Populate authorId field with name and email
      .populate("taskId", "name"); // Populate taskId field with task name

    res.json(comments);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// Create a Comment for a specific task
const createComment = async (req, res) => {
  const { content, authorId, taskId } = req.body;

  // Validate ID format
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
    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if author exists
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const newComment = new Comment({
      content,
      authorId,
      taskId,
    });
    const savedComment = await newComment.save();
    res.status(201).json(savedComment); // Created
  } catch (err) {
    res.status(400).json({ message: err.message }); // Bad request (validation errors)
  }
};

//updateComment
const updateComment = async (req, res) => {
  const { id } = req.params;
  const updates = Object.keys(req.body);

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Comment ID" });
  }

  const allowedUpdates = ["content", "taskId", "authorId"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if new task exists
    if (updates.includes("taskId")) {
      const newTaskId = req.body.taskId;
      if (!mongoose.Types.ObjectId.isValid(newTaskId)) {
        return res.status(400).json({ message: "Invalid Task ID" });
      }
      const task = await Task.findById(newTaskId);
      if (!task) {
        return res.status(404).json({ message: "New Task not found" });
      }
    }

    // Check if new author exists
    if (updates.includes("authorId")) {
      const newAuthorId = req.body.authorId;
      if (!mongoose.Types.ObjectId.isValid(newAuthorId)) {
        return res.status(400).json({ message: "Invalid Author ID" });
      }
      const author = await User.findById(newAuthorId);
      if (!author) {
        return res.status(404).json({ message: "New Author not found" });
      }
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
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Comment ID" });
  }

  try {
    const deletedComment = await Comment.findByIdAndDelete(id);

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
