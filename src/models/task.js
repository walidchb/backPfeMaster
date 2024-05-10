const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  Title: String,
  Description: String,
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  Project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  Team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  Comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
