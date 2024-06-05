const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

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
      message: "Role must be one of 'A', 'B', 'C', 'D', 'E'",
    },
  },
  status: {
    type: String,
    required: [true, "Status is required"],
    enum: {
      values: ["Todo", "Inprogress", "Inreview", "Done"],
      message: "Role must be one of 'A', 'B', 'C', 'D', 'E'",
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
TaskSchema.plugin(uniqueValidator);

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;