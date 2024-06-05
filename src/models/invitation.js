const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  sendby: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model (who send the invitation)
  },
  sendto: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model (who receives the invitation)
  },
  roleinvitedto: {
    type: String,
    required: true,
    enum: ["employee", "teamBoss", "prjctBoss"], // Define notification types
  },
  team:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
  organisation:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Invitation", invitationSchema);
