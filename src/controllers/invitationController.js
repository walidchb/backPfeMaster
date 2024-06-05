const Invitation = require("../models/invitation");
const User = require("../models/user");
const Organization = require("../models/organization");
const Team = require("../models/team");
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
  const { sendby, sendto, roleinvitedto, organisation } = req.body;

  // Validate required fields
  if (!sendby || !sendto || !roleinvitedto || !organisation) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate ID format
  if (
    !mongoose.Types.ObjectId.isValid(sendby) ||
    !mongoose.Types.ObjectId.isValid(sendto) ||
    !mongoose.Types.ObjectId.isValid(organisation)
  ) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    // Check if sender exists
    const sender = await User.findById(sendby);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Check if recipient exists
    const recipient = await User.findById(sendto);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Check if organization exists
    const org = await Organization.findById(organisation);
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const newInvitation = new Invitation({
      sendby,
      sendto,
      roleinvitedto,
      organisation,
      accepted: false,
    });

    const savedInvitation = await newInvitation.save();
    res.status(201).json(savedInvitation);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error creating invitation" });
  }
};

// Update an Invitation
const updateInvitation = async (req, res) => {
  const { id } = req.params;

  // Validate invitation ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Invitation ID" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["sendby", "sendto", "roleinvitedto", "organisation", "team", "accepted"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Check if new sender exists
    if (updates.includes("sendby")) {
      const newSenderId = req.body.sendby;
      if (!mongoose.Types.ObjectId.isValid(newSenderId)) {
        return res.status(400).json({ message: "Invalid Sender ID" });
      }
      const sender = await User.findById(newSenderId);
      if (!sender) {
        return res.status(404).json({ message: "New Sender not found" });
      }
    }

    // Check if new recipient exists
    if (updates.includes("sendto")) {
      const newRecipientId = req.body.sendto;
      if (!mongoose.Types.ObjectId.isValid(newRecipientId)) {
        return res.status(400).json({ message: "Invalid Recipient ID" });
      }
      const recipient = await User.findById(newRecipientId);
      if (!recipient) {
        return res.status(404).json({ message: "New Recipient not found" });
      }
    }

    // Check if new organization exists
    if (updates.includes("organization")) {
      const newOrganizationId = req.body.organization;
      if (!mongoose.Types.ObjectId.isValid(newOrganizationId)) {
        return res.status(400).json({ message: "Invalid Organization ID" });
      }
      const org = await Organization.findById(newOrganizationId);
      if (!org) {
        return res.status(404).json({ message: "New Organization not found" });
      }
    }
    if (updates.includes("team")) {
      const newTeamId = req.body.team;
      if (!mongoose.Types.ObjectId.isValid(newTeamId)) {
        return res.status(400).json({ message: "Invalid Team ID" });
      }
      const team = await Team.findById(newTeamId);
      if (!team) {
        return res.status(404).json({ message: "New Team not found" });
      }
    }

    updates.forEach((update) => (invitation[update] = req.body[update]));

    const updatedInvitation = await invitation.save();
    res.json(updatedInvitation);
  } catch (err) {
    console.error(err);
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