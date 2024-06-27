const Project = require("../models/projectModel");
const User = require("../models/user");
const Team = require("../models/team");
const Task = require("../models/task");
const Organization = require("../models/organization");
const mongoose = require("mongoose");

// Get projects based on dynamic attribute
const getProjects = async (req, res) => {
  const filters = req.query; // Expect multiple attribute-value pairs

  if (Object.keys(filters).length === 0) {
    return res.status(400).json({ message: "Missing filters in query" });
  }

  const filterObject = {};
  for (const key in filters) {
    // Validate ObjectId fields
    if (
      key === "organization" ||
      key === "boss" ||
      key === "teams" ||
      key === "tasks"
    ) {
      if (!mongoose.Types.ObjectId.isValid(filters[key])) {
        return res.status(400).json({ message: "Invalid ObjectId" });
      }
    }
    filterObject[key] = filters[key];
  }

  try {
    const projects = await Project.find(filterObject)
      .populate("organization")
      .populate("boss")
      .populate({
        path: "tasks",
        populate: [{ path: "projet" }, { path: "team" }],
      });
    res.json(projects);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

// create project
const createProject = async (req, res) => {
  try {
    console.log("req.body = ", req.body);
    console.log("req.files = ", req.files);

    const { organization, boss, teams, ...projectData } = req.body;

    const teamsArray = Array.isArray(teams) ? teams : [teams];

    // Find boss (user) by ID
    const Org = await Organization.findOne({ _id: organization });

    if (!Org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Find boss (user) by ID
    const bossUser = await User.findOne({ _id: boss });

    if (!bossUser) {
      return res.status(404).json({ error: "Boss (user) not found" });
    }

    // Find teams by their IDs
    const foundTeams = await Team.find({ _id: { $in: teamsArray } });

    if (foundTeams.length !== teamsArray.length) {
      const missingTeamIds = teamsArray.filter(
        (teamId) => !foundTeams.some((team) => team._id.equals(teamId))
      );
      return res.status(404).json({
        error: "One or more teams not found",
        missingTeamIds: missingTeamIds,
      });
    }

    // Add boss and teams fields to project data
    projectData.organization = Org._id;
    projectData.boss = bossUser._id;
    projectData.teams = foundTeams.map((team) => team._id);

    // Ajoutez les informations sur les documents uploadés
    if (req.files && req.files.length > 0) {
      projectData.documents = req.files.map(file => file.filename);
    }

    const newProject = new Project(projectData);

    // Validate project data before saving
    const validationErrors = newProject.validateSync();

    if (validationErrors) {
      const formattedErrors = Object.values(validationErrors.errors).map(
        (error) => ({
          message: error.message,
          field: error.path,
        })
      );
      return res.status(400).json({ errors: formattedErrors });
    }

    const savedProject = await newProject.save();

    res.status(201).json(savedProject);
  } catch (err) {
    console.error(err); // Log the error for debugging

    if (err.name === "MongoServerError" && err.code === 11000) {
      // Handle duplicate key error (unique constraint violation)
      return res.status(409).json({
        error: "A project with the same information already exists.",
      });
    } else {
      // Handle other errors (e.g., database connection issues)
      return res.status(500).json({ error: err.message });
    }
  }
};

// delete Project
const deleteProject = async (req, res) => {
  const { id } = req.params;

  // Validate ID format (optional)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Project ID" });
  }

  try {
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" }); // Internal server error
  }
};

// update Project
const updateProject = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Project ID" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "Name",
    "Description",
    "dateDebutEstim",
    "dateFinEstim",
    "dateDebutReel",
    "dateFinReel",
    "progress",
    "boss",
    "teams",
  ];
  const arrayUpdates = ["tasks"];
  const isValidUpdate = updates.every(
    (update) => allowedUpdates.includes(update) || arrayUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    // Separate regular updates and array updates
    const regularUpdates = {};
    const arrayUpdatesData = {};
    // Check if boss is being updated
    if (updates.includes("boss")) {
      const newBossId = req.body.boss;

      // Validate new boss ID format
      if (!mongoose.Types.ObjectId.isValid(newBossId)) {
        return res.status(400).json({ message: "Invalid boss ID" });
      }

      // Check if new boss exists
      const newBoss = await User.findById(newBossId);
      if (!newBoss) {
        return res.status(404).json({ message: "New boss not found" });
      }
    }

    // Check if teams are being updated
    if (updates.includes("teams")) {
      const newTeamIds = req.body.teams;

      // Validate new team IDs format
      const invalidTeamIds = newTeamIds.filter(
        (teamId) => !mongoose.Types.ObjectId.isValid(teamId)
      );
      if (invalidTeamIds.length > 0) {
        return res
          .status(400)
          .json({ message: "Invalid team IDs", invalidTeamIds });
      }

      // Check if new teams exist
      const newTeams = await Team.find({ _id: { $in: newTeamIds } });
      if (newTeams.length !== newTeamIds.length) {
        const missingTeamIds = newTeamIds.filter(
          (teamId) => !newTeams.some((team) => team._id.equals(teamId))
        );
        return res.status(404).json({
          message: "One or more teams not found",
          missingTeamIds,
        });
      }
    }
    
    updates.forEach((update) => {
      if (arrayUpdates.includes(update)) {
        arrayUpdatesData[update] = req.body[update];
      } else {
        regularUpdates[update] = req.body[update];
      }
    });

    const updatedProject = await Project.findByIdAndUpdate(id, regularUpdates, {
      new: true,
      runValidators: true,
    });

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Push new values to array fields
    for (let key in arrayUpdatesData) {
      if (arrayUpdatesData.hasOwnProperty(key)) {
        updatedProject[key].push(arrayUpdatesData[key]);
      }
    }

    await updatedProject.save();

    res.json(updatedProject);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({ message: err.message });
  }
};

const deleteDocument = async (req, res) => {
  const { id } = req.params;
  const { fileName } = req.body;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Filtrer le tableau de documents pour supprimer le fichier spécifié
    project.documents = project.documents.filter(doc => doc !== fileName);

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur', error });
  }
};

module.exports = {
  createProject,
  getProjects,
  deleteProject,
  updateProject,
  deleteDocument
};
