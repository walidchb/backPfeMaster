const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");

router.post("/organizations", organizationController.createOrganization);
router.get("/organizations", organizationController.getOrganizations);
router.delete("/organizations/:id", organizationController.deleteOrganization);
router.patch("/organizations/:id", organizationController.updateOrganization);
router.get("/AllOrganizations", organizationController.getAllOrganizations);

module.exports = router;
