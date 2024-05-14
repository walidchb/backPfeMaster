const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/taskController");

router.post("/tasks", TaskController.createTask);
router.get("/tasks", TaskController.getTasks);
router.delete("/tasks/:id", TaskController.deleteTask);
router.patch("/tasks/:id", TaskController.updateTask);

module.exports = router;
