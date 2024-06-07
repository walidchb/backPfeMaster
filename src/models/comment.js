const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

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
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

commentSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Comment", commentSchema);
