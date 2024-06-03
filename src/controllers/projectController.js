const Project = require("../models/project");
const mongoose = require("mongoose");

// Get projects based on dynamic attribute
const getProjects = async (req, res) => {
    console.log(req.query);
    const { attribute, value } = req.query; // Get attribute and value from query parameters

    if (!attribute || !value) {
        
      return res
        .status(400)
        .json({ message: "Missing attribute or value in query" });
    }
  
    const filter = { [attribute]: value }; // Build dynamic filter object
  
    try {
      const projects = await Project.find(filter);
      res.json(projects);
    } catch (err) {
      res.status(500).json({ message: "Server error" }); // Internal server error
    }
}


// create project
const createProject = async (req, res) => {
    try {
        console.log("req.body = ", req.body)
        const newProject = new Project(req.body);
        const savedProject = await newProject.save();
        res.status(201).json(savedProject); // Created
      } catch (err) {
        res.status(400).json({ message: err.message }); // Bad request (validation errors)
        
      }
}

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
}

// update Project
const updateProject = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Project ID" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["Name", "Description", "department", "boss", "Team", "Tasks"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    updates.forEach((update) => (project[update] = req.body[update]));
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


module.exports ={
    createProject,
    getProjects,
    deleteProject,
    updateProject
}