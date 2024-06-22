const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Nom is required"],
  },
  Description: {
    type: String,
    required: [true, "Description is required"],
  },
  priorite: {
    type: String,
    required: [true, "Priorité is required"],
    enum: {
      values: ["A", "B", "C", "D", "E"],
      message: "status must be one of 'Todo', 'Inprogress', 'Inreview', 'Done'",
    },
  },
  status: {
    type: String,
    required: [true, "Status is required"],
    enum: {
      values: ["Todo", "Inprogress", "Inreview", "Done", "Cancel"],
      message: "status must be one of 'Todo', 'Inprogress', 'Inreview', 'Done'",
    },
    default: "Todo",
  },
  dateDebutEstim: {
    type: Date,
    required: [true, "Date début is required"],
  },
  dateFinEstim: {
    type: Date,
    required: [true, "Date fin is required"],
  },
  dateDebutReel: {
    type: Date,
    default: null,
  },
  dateFinReel: {
    type: Date,
    default: null,
  },
  affectedto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  projet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: [true, "Projet is required"],
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: [true, "Team is required"],
  },
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
