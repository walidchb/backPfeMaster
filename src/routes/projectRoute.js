const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/projectController");

router.post("/projects", ProjectController.createProject);
router.get("/projects", ProjectController.getProjects);
router.delete("/projects/:id", ProjectController.deleteProject);
router.patch("/projects/:id", ProjectController.updateProject);

module.exports = router;
