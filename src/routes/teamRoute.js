const express = require("express");
const router = express.Router();
const TeamController = require("../controllers/teamController");

router.post("/teams", TeamController.createTeam);
router.get("/teams", TeamController.getTeams);
router.delete("/teams/:id", TeamController.deleteTeam);
router.patch("/teams/:id", TeamController.updateTeam);

module.exports = router;
