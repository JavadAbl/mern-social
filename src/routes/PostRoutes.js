const express = require("express");
const controller = require("../controllers/PostController");
const authMiddleware = require("../utils/AuthMiddleware");
const formData = require("../utils/FormDataMiddleware");

const router = express.Router();

router
  .route("/")
  .all(authMiddleware)
  .get(controller.getPagePosts)
  .post(formData, controller.createPost)
  .delete(controller.deletePosts);

router.route("/user").all(authMiddleware).get(controller.getUserPosts);

router
  .route("/post/:id")
  .all(authMiddleware)
  .get(controller.getPost)
  .patch(controller.updatePost)
  .delete(controller.deletePost);

router.route("/like/:id").patch(authMiddleware, controller.toggleLike);

router.route("/fetch-feed").get(authMiddleware, controller.fetchFeed);
router.route("/fetch-explore").get(authMiddleware, controller.fetchExplore);

module.exports = router;
