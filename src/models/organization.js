const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
  Name: String,
  Description: String,
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  Teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
});

module.exports = mongoose.model("Organization", OrganizationSchema);

