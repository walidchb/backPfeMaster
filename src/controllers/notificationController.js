const Notification = require("../models/notification");
const mongoose = require("mongoose");

// Get Notifications for a specific user
const getNotifications = async (req, res) => {
  const { recipient, organization } = req.body; // Assuming user ID and organization ID are in the request body

  console.log("recipientId", recipient);
  console.log("organizationId", organization);

  // Validate user ID and organization ID format
  if (!mongoose.Types.ObjectId.isValid(recipient)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }
  if (!mongoose.Types.ObjectId.isValid(organization)) {
    return res.status(400).json({ message: "Invalid Organization ID" });
  }

  try {
    const notifications = await Notification.find({
      recipients: { $in: [recipient] }, // Ensure the recipient is in the recipients array
      organization: organization,
    })
      .populate({
        path: "recipients",
        select: "_id nom prenom",
        match: { _id: recipient }, // Filter recipients to match only the specific user
      })
      .populate("organization", "_id Name"); // Populate organization details

    // Filter out notifications where recipients array might not match the specific user (although it's unlikely with the current query)
    const filteredNotifications = notifications.filter((notification) => notification.recipients.length > 0);

    // Map through notifications to filter seen status for the specific recipient
    const notificationsToSend = filteredNotifications.map((notification) => {
      const seenStatus = notification.seen.find((item) => item.userId.toString() === recipient);
      return {
        ...notification.toObject(),
        seen: seenStatus ? [seenStatus] : [], // Only include seen status for the specific recipient
      };
    });

    res.json(notificationsToSend);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// Create a Notification
const createNotification = async (req, res) => {
  const { recipients, type, content, organization } = req.body; // Destructure required fields

  // Validate required fields
  if (!recipients || !content || !content.message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate recipients format (array of valid ObjectIds)
  if (!Array.isArray(recipients) || recipients.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    return res.status(400).json({ message: "Invalid User IDs" });
  }

  try {
    const newNotification = new Notification({
      recipients: recipients.map((id) => id), // Convert each recipient to ObjectId
      organization: organization, // Convert organization to ObjectId
      content, // Utiliser l'objet content tel quel
      type,
      seen: recipients.map((id) => ({ userId: id, seen: false })), // Initialize seen status for each recipient
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
  const { notificationId, userId } = req.params;

  // Validate notification ID and user ID format
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    return res.status(400).json({ message: "Invalid Notification ID" });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, "seen.userId": userId },
      { $set: { "seen.$.seen": true } }, // Update the seen status for the specific user
      { new: true } // Return the updated document
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found or User not in recipients list" });
    }
    res.json(notification);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({ message: "Error updating notification" });
  }
};

// Delete a Notification for a specific user
const deleteNotificationForUser = async (req, res) => {
  const { notificationId, userId } = req.params;

  // Validate notification ID and user ID format
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    return res.status(400).json({ message: "Invalid Notification ID" });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Remove user from recipients and seen arrays
    notification.recipients = notification.recipients.filter((id) => id.toString() !== userId);
    notification.seen = notification.seen.filter((entry) => entry.userId.toString() !== userId);

    if (notification.recipients.length === 0) {
      // If no recipients are left, delete the notification
      await Notification.findByIdAndDelete(notificationId);
      return res.json({ message: "Notification deleted" });
    } else {
      // Otherwise, save the updated notification
      await notification.save();
      return res.json({ message: "Notification updated" });
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotificationForUser,
};