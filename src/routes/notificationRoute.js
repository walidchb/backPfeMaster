const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notificationController");

router.post("/notifications", NotificationController.createNotification);
router.get("/notifications", NotificationController.getNotifications);
router.delete("/notifications/:id", NotificationController.deleteNotification);
router.patch("/notifications/:id", NotificationController.updateNotification);

module.exports = router;
