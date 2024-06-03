const Notification = require("../models/notification");
const mongoose = require("mongoose");

// Get Notifications for a specific user
const getNotifications = async (req, res) => {
  const { recipientId } = req.query; // Assuming user ID is in the URL parameter
  console.log(req.query.recipientId);
  // Validate user ID format (optional)
  if (!mongoose.Types.ObjectId.isValid(recipientId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const notifications = await Notification.find({ recipientId: recipientId });
    res.json(notifications);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// Create a Notification
const createNotification = async (req, res) => {
  const { recipientId, type, content } = req.body; // Destructure required fields

  // Validate required fields
  if (!recipientId || !content) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate user ID format (optional)
  if (!mongoose.Types.ObjectId.isValid(recipientId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const newNotification = new Notification({
      recipientId,
      content,
      type,
      seen: false,
    });
    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification); // Created
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({ message: "Error creating notification" });
  }
};

// Update a Notification (assuming you want to update the `seen` field)
const updateNotification = async (req, res) => {
  const { notificationId } = req.params;

  // Validate notification ID format
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    return res.status(400).json({ message: "Invalid Notification ID" });
  }

  const updates = Object.keys(req.body); // Get update fields from request body
  const allowedUpdates = ["seen"]; // Only allow updating the `seen` field

  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { seen: true }, // Set `seen` to true
      { new: true } // Return the updated document
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({ message: "Error updating notification" });
  }
};

// Delete a Notification
const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  // Validate notification ID format
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    return res.status(400).json({ message: "Invalid Notification ID" });
  }

  try {
    const deletedNotification = await Notification.findByIdAndDelete(
      notificationId
    );

    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
};
