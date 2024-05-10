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

const Organization = mongoose.model("Organization", OrganizationSchema);

module.exports = Organization;
