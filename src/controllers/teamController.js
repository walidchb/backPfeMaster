const Team = require("../models/team");
const mongoose = require("mongoose");

// Get Teams based on dynamic attribute
const getTeams = async (req, res) => {
    console.log(req.query);
    const { attribute, value } = req.query; // Get attribute and value from query parameters

    if (!attribute || !value) {
        
      return res
        .status(400)
        .json({ message: "Missing attribute or value in query" });
    }
  
    const filter = { [attribute]: value }; // Build dynamic filter object
  
    try {
      const teams = await Team.find(filter);
      res.json(teams);
    } catch (err) {
      res.status(500).json({ message: "Server error" }); // Internal server error
    }
}


// create Team
const createTeam = async (req, res) => {
    try {
        const newTeam = new Team(req.body);
        const savedTeam = await newTeam.save();
        res.status(201).json(savedTeam); // Created
      } catch (err) {
        res.status(400).json({ message: err.message }); // Bad request (validation errors)
        
      }
}

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
}

// update Team
const updateTeam = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Team ID" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["Name", "Description", "boss", "Organization", "Projects"];
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

    updates.forEach((update) => (team[update] = req.body[update]));
    await team.save();

    res.json(team);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


module.exports ={
    createTeam,
    getTeams,
    deleteTeam,
    updateTeam
}