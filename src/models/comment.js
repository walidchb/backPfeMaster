const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  taskId: {
    // Optional - Include author information if needed
    type: mongoose.Schema.Types.ObjectId,
    ref: "task", // Reference to the User model (if applicable)
  },
  authorId: {
    // Optional - Include author information if needed
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Reference to the User model (if applicable)
  },
});

commentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Comment", commentSchema);
