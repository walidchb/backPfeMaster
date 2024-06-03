const Task = require("../models/task");
const mongoose = require("mongoose");

// Get Tasks based on dynamic attribute
const getTasks = async (req, res) => {
    console.log(req.query);
    const { attribute, value } = req.query; // Get attribute and value from query parameters

    if (!attribute || !value) {
        
      return res
        .status(400)
        .json({ message: "Missing attribute or value in query" });
    }
  
    const filter = { [attribute]: value }; // Build dynamic filter object
  
    try {
      const tasks = await Task.find(filter);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: "Server error" }); // Internal server error
    }
}


// create Task
const createTask = async (req, res) => {
    try {
        console.log("req.body = ", req.body)
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask); // Created
      } catch (err) {
        res.status(400).json({ message: err.message }); // Bad request (validation errors)
        
      }
}

// delete Task
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
}

// update Task
const updateTask = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["Title", "Description", "CreatedBy", "assignee", "Project", "Team", "Comments"];
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

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


module.exports ={
    createTask,
    getTasks,
    deleteTask,
    updateTask
}