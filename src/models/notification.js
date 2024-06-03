const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model (who receives the notification)
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["project", "task", "reminder", "invitaion", "other"], // Define notification types
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Organization", // Reference to the Organization model
  },
  seen: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
