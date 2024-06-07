const Task = require("../models/task");
const User = require("../models/user");
const Project = require("../models/project");
const Team = require("../models/team");
const mongoose = require("mongoose");

// Get tasks based on dynamic attribute
const getTasks = async (req, res) => {
  const filters = req.query; // Expect multiple attribute-value pairs

  if (Object.keys(filters).length === 0) {
    return res.status(400).json({ message: "Missing filters in query" });
  }

  const filterObject = {};
  for (const key in filters) {
    // Validate ObjectId fields
    if (key === "affectedto" || key === "projet" || key === "team") {
      if (!mongoose.Types.ObjectId.isValid(filters[key])) {
        return res.status(400).json({ message: "Invalid ObjectId" });
      }
    }
    filterObject[key] = filters[key];
  }

  try {
    const tasks = await Task.find(filterObject)
      .populate("affectedto") // Populate affectedto field with name and email
      .populate("projet") // Populate projet field with project name
      .populate("team"); // Populate team field with team name

    res.json(tasks);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// Create task
const createTask = async (req, res) => {
  try {
    console.log("req.body = ", req.body);

    const { affectedto, projet, team, ...taskData } = req.body;

    // Find user by ID (if affectedto is provided)
    let affectedUser = null;
    if (affectedto) {
      affectedUser = await User.findOne({ _id: affectedto });
      if (!affectedUser) {
        return res.status(404).json({ error: "Affected user not found" });
      }
    }

    // Find project by ID
    const project = await Project.findOne({ _id: projet });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Find team by ID
    const teamObj = await Team.findOne({ _id: team });
    if (!teamObj) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Add affectedto, projet, and team fields to task data
    taskData.affectedto = affectedUser ? affectedUser._id : null;
    taskData.projet = project._id;
    taskData.team = teamObj._id;

    const newTask = new Task(taskData);

    // Validate task data before saving
    const validationErrors = newTask.validateSync();

    if (validationErrors) {
      const formattedErrors = Object.values(validationErrors.errors).map(
        (error) => ({
          message: error.message,
          field: error.path,
        })
      );
      return res.status(400).json({ errors: formattedErrors });
    }

    const savedTask = await newTask.save();

    res.status(201).json(savedTask); // Created
  } catch (err) {
    console.error(err); // Log the error for debugging

    if (err.name === "MongoServerError" && err.code === 11000) {
      // Handle duplicate key error (unique constraint violation)
      return res.status(409).json({
        error: "A task with the same information already exists.",
      });
    } else {
      // Handle other errors (e.g., database connection issues)
      return res.status(500).json({ error: err.message });
    }
  }
};

// Delete task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  // Validate ID format (optional)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }

  try {
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" }); // Internal server error
  }
};

// Update task
const updateTask = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "Name",
    "Description",
    "priorite",
    "status",
    "dateDebutEstim",
    "dateFinEstim",
    "dateDebutReel",
    "dateFinReel",
    "affectedto",
    "projet",
    "team",
  ];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if affectedto is being updated
    if (updates.includes("affectedto")) {
      const newAffectedtoId = req.body.affectedto;

      // Validate new affectedto ID format
      if (
        newAffectedtoId &&
        !mongoose.Types.ObjectId.isValid(newAffectedtoId)
      ) {
        return res.status(400).json({ message: "Invalid affectedto ID" });
      }

      // Check if new affectedto exists (if provided)
      if (newAffectedtoId) {
        const newAffectedto = await User.findById(newAffectedtoId);
        if (!newAffectedto) {
          return res
            .status(404)
            .json({ message: "New affectedto user not found" });
        }
      }
    }

    // Check if projet is being updated
    if (updates.includes("projet")) {
      const newProjetId = req.body.projet;

      // Validate new projet ID format
      if (!mongoose.Types.ObjectId.isValid(newProjetId)) {
        return res.status(400).json({ message: "Invalid projet ID" });
      }

      // Check if new projet exists
      const newProjet = await Project.findById(newProjetId);
      if (!newProjet) {
        return res.status(404).json({ message: "New projet not found" });
      }
    }

    // Check if team is being updated
    if (updates.includes("team")) {
      const newTeamId = req.body.team;

      // Validate new team ID format
      if (!mongoose.Types.ObjectId.isValid(newTeamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }

      // Check if new team exists
      const newTeam = await Team.findById(newTeamId);
      if (!newTeam) {
        return res.status(404).json({ message: "New team not found" });
      }
    }

    updates.forEach((update) => (task[update] = req.body[update]));

    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  deleteTask,
  updateTask,
};
