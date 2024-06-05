const express = require("express");
const router = express.Router();
const InvitationController = require("../controllers/invitationController");

router.post("/invitations", InvitationController.createInvitation);
router.get("/invitations", InvitationController.getInvitations);
router.delete("/invitations/:id", InvitationController.deleteInvitation);
router.patch("/invitations/:id", InvitationController.updateInvitation);

module.exports = router;
