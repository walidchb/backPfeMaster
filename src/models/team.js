const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Team\'s name is required"],
    unique: [true, "Team\'s name is already in use"],
    trim: true,
  },
  Boss: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  Organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
});

const Team = mongoose.model("Team", TeamSchema);

module.exports = Team;
