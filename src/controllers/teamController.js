const Team = require("../models/team");
const Organization = require("../models/organization");

const User = require("../models/user");
const mongoose = require("mongoose");

// Get Teams based on dynamic attribute
const getTeams = async (req, res) => {
  const filters = req.query; // Expect multiple attribute-value pairs

  if (Object.keys(filters).length === 0) {
    return res.status(400).json({ message: "Missing filters in query" });
  }

  const filterObject = {};
  for (const key in filters) {
    filterObject[key] = filters[key];
  }

  try {
    const teams = await Team.find(filterObject)
      .populate("Boss") // Populate boss field with name and email
      .populate("Organization"); // Populate organization field with name

    res.json(teams);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// create Team
const createTeam = async (req, res) => {
  try {
    console.log("req.body = ", req.body);

    // Extract user ID and organization ID from request body
    const { Name, OrganizationId } = req.body;
    // let bossAtr = null;
    // // Find user by ID
    // if (BossId) {
    //   const user = await User.findOne({ _id: BossId });
    //   if (!user) {
    //     return res.status(404).json({ error: "User not found" });
    //   }
    //   bossAtr = user._id;
    // }

    // Find organization by ID
    const organization = await Organization.findOne({ _id: OrganizationId });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Add boss and organization fields to team data

    const newTeam = new Team({
      // Boss: bossAtr,
      Organization: organization._id,
      Name,
    });

    // Validate team data before saving
    const validationErrors = newTeam.validateSync();

    if (validationErrors) {
      const formattedErrors = Object.values(validationErrors.errors).map(
        (error) => ({
          message: error.message,
          field: error.path,
        })
      );
      return res.status(400).json({ errors: formattedErrors });
    }

    const savedTeam = await newTeam.save();

    res.status(201).json(savedTeam); // Created
  } catch (err) {
    console.error(err); // Log the error for debugging

    if (err.name === "MongoServerError" && err.code === 11000) {
      // Handle duplicate key error (unique constraint violation)
      return res.status(409).json({
        error: "A team with this information already exists.",
      });
    } else {
      // Handle other errors (e.g., database connection issues)
      return res.status(500).json({ error: err.message });
    }
  }
};

// delete Team
const deleteTeam = async (req, res) => {
  const { id } = req.params;

  // Validate ID format (optional)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Team ID" });
  }

  try {
    const deletedTeam = await Team.findByIdAndDelete(id);

    if (!deletedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.json({ message: "Team deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" }); // Internal server error
  }
};

// update Team
const updateTeam = async (req, res) => {
  const { id } = req.query;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Team ID" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["Name", "Boss", "Organization"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if new name already exists in other teams
    if (updates.includes("Name")) {
      const newName = req.body.Name;
      const existingTeam = await Team.findOne({
        Name: newName,
        _id: { $ne: id },
      });
      if (existingTeam) {
        return res.status(400).json({ message: "Team name already exists" });
      }
    }

    // Check if new boss exists
    if (updates.includes("Boss")) {
      const newBossId = req.body.Boss;
      if (!mongoose.Types.ObjectId.isValid(newBossId)) {
        return res.status(400).json({ message: "Invalid Boss ID" });
      }
      const newBoss = await User.findById(newBossId);
      if (!newBoss) {
        return res.status(404).json({ message: "New Boss not found" });
      }
    }

    // Check if new organization exists
    if (updates.includes("Organization")) {
      const newOrganizationId = req.body.Organization;
      if (!mongoose.Types.ObjectId.isValid(newOrganizationId)) {
        return res.status(400).json({ message: "Invalid Organization ID" });
      }
      const newOrganization = await Organization.findById(newOrganizationId);
      if (!newOrganization) {
        return res.status(404).json({ message: "New Organization not found" });
      }
    }

    updates.forEach((update) => (team[update] = req.body[update]));
    await team.save();

    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createTeam,
  getTeams,
  deleteTeam,
  updateTeam,
};
