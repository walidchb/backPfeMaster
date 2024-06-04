const Invitation = require("../models/invitation");
const mongoose = require("mongoose");

// Get Invitations based on dynamic attributes
const getInvitations = async (req, res) => {
  const filters = req.query; // Expect multiple attribute-value pairs

  if (Object.keys(filters).length === 0) {
    return res
      .status(400)
      .json({ message: "Missing filters in query" });
  }

  const filterObject = {};
  for (const key in filters) {
    // Validate ObjectId fields
    if (key === "sendto" || key === "sendby") {
      if (!mongoose.Types.ObjectId.isValid(filters[key])) {
        return res.status(400).json({ message: "Invalid User ID" });
      }
    }
    filterObject[key] = filters[key];
  }

  try {
    const invitations = await Invitation.find(filterObject)
      .populate("sendby", "name email") // Populate sendby field with name and email
      .populate("sendto", "name email"); // Populate sendto field with name and email

    res.json(invitations);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// Create an Invitation
const createInvitation = async (req, res) => {
  const { sendby, sendto, roleinvitedto } = req.body; // Destructure required fields

  // Validate required fields
  if (!sendby || !sendto || !roleinvitedto) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate user ID format (optional)
  if (!mongoose.Types.ObjectId.isValid(sendby) || !mongoose.Types.ObjectId.isValid(sendto)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const newInvitation = new Invitation({
      sendby,
      sendto,
      roleinvitedto,
      accepted: false,
    });
    const savedInvitation = await newInvitation.save();
    res.status(201).json(savedInvitation); // Created
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({ message: "Error creating invitation" });
  }
};

// Update an Invitation (assuming you want to update the `accepted` field)
const updateInvitation = async (req, res) => {
  const { id } = req.params;

  // Validate invitation ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Invitation ID" });
  }

  const updates = Object.keys(req.body); // Get update fields from request body
  const allowedUpdates = ["accepted"]; // Only allow updating the `accepted` field

  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const invitation = await Invitation.findByIdAndUpdate(
      id,
      { accepted: true }, // Set `accepted` to true
      { new: true } // Return the updated document
    );

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }
    res.json(invitation);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({ message: "Error updating invitation" });
  }
};

// Delete an Invitation
const deleteInvitation = async (req, res) => {
  const { id } = req.params;

  // Validate invitation ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Invitation ID" });
  }

  try {
    const deletedInvitation = await Invitation.findByIdAndDelete(
      id
    );

    if (!deletedInvitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }
    res.json({ message: "Invitation deleted" });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getInvitations,
  createInvitation,
  updateInvitation,
  deleteInvitation,
};