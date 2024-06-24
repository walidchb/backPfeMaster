const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to the User model (who receives the notification)
    },
  ],
  content: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "project",
      "task",
      "reminder",
      "invitation",
      "comment",
      "delegation",
    ],
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Organization", // Reference to the Organization model
  },
  seen: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      seen: {
        type: Boolean,
        default: false,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
