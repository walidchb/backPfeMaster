const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/commentController");

router.post("/comments", CommentController.createComment);
router.get("/comments", CommentController.getComments);
router.delete("/comments/:id", CommentController.deleteComment);
router.patch("/comments/:id", CommentController.updateComment);

module.exports = router;
