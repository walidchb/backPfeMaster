const Delegation = require("../models/delegation");
const User = require("../models/user");
const Organization = require("../models/organization");
const Team = require("../models/team");
const Task = require("../models/task");
const mongoose = require("mongoose");

// Get Delegations based on dynamic attributes
const getDelegations = async (req, res) => {
  const filters = req.query; // Expect multiple attribute-value pairs
  console.log(filters);
  if (Object.keys(filters).length === 0) {
    return res.status(400).json({ message: "Missing filters in query" });
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
    const delegations = await Delegation.find(filterObject)
      .populate("sendby") // Populate sendby field with name and email
      .populate("sendto") // Populate sendto field with name and email
      .populate("task")
      .populate("team") // Populate sendby field with name and email
      .populate("organisation");
    res.json(delegations);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// Create an Delegation
const createDelegation = async (req, res) => {
  const { sendby, sendto, task, team, organisation } = req.body;

  console.log(req.body);
  // Validate required fields
  if (!sendby || !sendto || !task || !organisation) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Check if sendby is valid ObjectId
  if (!sendby || !mongoose.Types.ObjectId.isValid(sendby)) {
    return res.status(400).json({ message: "Invalid or missing 'sendby' ID" });
  }

  // Check if sendto is valid ObjectId
  if (!sendto || !mongoose.Types.ObjectId.isValid(sendto)) {
    return res.status(400).json({ message: "Invalid or missing 'sendto' ID" });
  }

  // Check if organisation is valid ObjectId
  if (!organisation || !mongoose.Types.ObjectId.isValid(organisation)) {
    return res.status(400).json({ message: "Invalid or missing 'organisation' ID" });
  }

  // Check if task is provided and valid ObjectId
  if (task && !mongoose.Types.ObjectId.isValid(task)) {
    return res.status(400).json({ message: "Invalid 'task' ID" });
  }

  // Check if team is provided and valid ObjectId
  if (team && !mongoose.Types.ObjectId.isValid(team)) {
    return res.status(400).json({ message: "Invalid 'team' ID" });
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

    const newDelegation = new Delegation({
      sendby,
      sendto,
      task,
      team,
      organisation,
      accepted: false,
      annuler: false,
    });

    const savedDelegation = await newDelegation.save();
    res.status(201).json(savedDelegation);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error creating Delegation" });
  }
};

// Update an Delegation
const updateDelegation = async (req, res) => {
  const { id } = req.params;

  // Validate Delegation ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Delegation ID" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "sendby",
    "sendto",
    "task",
    "organisation",
    "team",
    "accepted",
    "annuler",
  ];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const delegation = await Delegation.findById(id);

    if (!delegation) {
      return res.status(404).json({ message: "Delegation not found" });
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

    // Check if new team exists
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

    updates.forEach((update) => (delegation[update] = req.body[update]));

    const updatedDelegation = await delegation.save();
    const populatedDelegation = await Delegation.findById(updatedDelegation._id)
      .populate("sendby")
      .populate("sendto")
      .populate("task")
      .populate("team")
      .populate("organisation");
    return res.json(populatedDelegation);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Error updating Delegation" });
  }
};

const updateDelegationsByTaskAndUser = async (req, res) => {
  const { taskId, userId } = req.params;
  const updates = req.body;

  // Validate taskId and userId format
  if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid Task ID or User ID" });
  }

  const allowedUpdates = [
    "sendto",
    "organisation",
    "team",
    "accepted",
    "annuler",
  ];
  const isValidUpdate = Object.keys(updates).every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    // Perform additional checks if necessary (e.g., check if new sendto, organisation, or team exist)

    const result = await Delegation.updateMany(
      { task: taskId, sendby: userId },
      { $set: updates }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: "No matching delegations found" });
    }

    // Fetch and return the updated delegations
    const updatedDelegations = await Delegation.find({ task: taskId, sendby: userId })
      .populate("sendby")
      .populate("sendto")
      .populate("task")
      .populate("team")
      .populate("organisation");

    return res.json(updatedDelegations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating Delegations" });
  }
};

// Delete an Delegation
const deleteDelegation = async (req, res) => {
  const { id } = req.params;

  // Validate Delegation ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Delegation ID" });
  }

  try {
    const deletedDelegation = await Delegation.findByIdAndDelete(id);

    if (!deletedDelegation) {
      return res.status(404).json({ message: "Delegation not found" });
    }
    res.json({ message: "Delegation deleted" });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getDelegations,
  createDelegation,
  updateDelegation,
  updateDelegationsByTaskAndUser,
  deleteDelegation,
};
