const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notificationController");

router.post("/notifications", NotificationController.createNotification);
router.get("/notifications", NotificationController.getNotifications);
router.patch("/notifications", NotificationController.updateNotification);
router.delete("/notifications/:notificationId/:userId", NotificationController.deleteNotificationForUser);

module.exports = router;
