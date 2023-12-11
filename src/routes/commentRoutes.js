const express = require("express");
const controller = require("../controllers/commentController");
const authMiddleware = require("../utils/AuthMiddleware");

const router = express.Router();

router
  .route("/")
  .all(authMiddleware)
  .get(controller.getComments)
  .post(controller.createComment)
  .patch(controller.updateComment);

router
  .route("/comment/:id")
  .all(authMiddleware)
  .get(controller.getComment)
  .delete(controller.deleteComment);

router.route("/post/:id").get(authMiddleware, controller.getPostComments);

module.exports = router;
