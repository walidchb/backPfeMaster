const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const ProjectSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Nom is required"],
  },
  Description: {
    type: String,
    required: [true, "Description is required"],
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
  progress: {
    type: Number,
    default: 0,
  },
  boss: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "chef projet is required"],
  },
  teams: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    validate: {
      validator: function (teams) {
        return teams.length > 0;
      },
      message: "Au moins une équipe est requise",
    },
    required: [true, "Teams is required"],
  },
});
ProjectSchema.plugin(uniqueValidator);

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;