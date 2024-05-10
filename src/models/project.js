const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  Name: String,
  Description: String,
  department: String,
  boss: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  Team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  Tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
