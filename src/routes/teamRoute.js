const express = require("express");
const router = express.Router();
const Team = require("../models/team");

const TeamController = require("../controllers/teamController");
const Project = require("../models/projectModel"); // Assuming your Project model is in a file named Project.js

async function fetchTeamsByBoss(projectBossId) {
  try {
    // Find all projects where the boss is the specified bossId
    const projects = await Project.find({ boss: projectBossId });

    // Extract team IDs from these projects
    const teamIds = projects.reduce((ids, project) => {
      ids.push(...project.teams);
      return ids;
    }, []);

    // Fetch teams using the extracted team IDs
    const teams = await Team.find({ _id: { $in: teamIds } })
      .populate("Boss") // Populate boss field with name and email
      .populate("Organization"); // Populate organization field with name;

    return teams;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
}

router.post("/teams", TeamController.createTeam);
router.get("/teams", TeamController.getTeams);
router.get("/teamsByBoss", async (req, res) => {
  const { projectBossId } = req.query;
  console.log("userId");

  // console.log(userId.userId);

  try {
    const teams = await fetchTeamsByBoss(projectBossId)
      
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/teams/:id", TeamController.deleteTeam);
router.patch("/teams", TeamController.updateTeam);

module.exports = router;
