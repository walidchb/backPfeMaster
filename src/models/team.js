const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  Name: String,
  Description: String,
  boss: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  Organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  Projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  ],
});

const Team = mongoose.model("Team", TeamSchema);

module.exports = Team;
