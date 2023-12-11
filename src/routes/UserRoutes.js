const express = require("express");
const controller = require("../controllers/UserController");
const authMiddleware = require("../utils/AuthMiddleware");
const formData = require("../utils/FormDataMiddleware");

const router = express.Router();

router.route("/test").post(controller.test);

router
  .route("/")
  .get(controller.getUsers)
  .delete(controller.deleteUsers)
  .patch(authMiddleware, formData, controller.updateUser)
  .post(controller.postUser);
router
  .route("/user/:id")
  .all(authMiddleware)
  .get(controller.getUser)
  .delete(controller.deleteUser);
router.route("/auth").post(authMiddleware, controller.userAuth);
router.route("/login").post(controller.loginUser);
router.route("/profile/:id").get(authMiddleware, controller.getUserProfile);
router.route("/follow").post(authMiddleware, controller.followUser);
router
  .route("/gen-verify-token")
  .patch(authMiddleware, controller.genVerifyToken);
router.route("/verify-token").patch(controller.verifyToken);

router.route("gen-reset-password").patch(controller.genPassResetToken);
router.route("/verify-password-token").patch(controller.verifyPasswordToken);

router.route("/suggest/:size").get(authMiddleware, controller.getSuggestUsers);

router
  .route("/image-upload")
  .post(authMiddleware, formData, controller.imageUpload);

router.route("/ids").post(authMiddleware, controller.getUsersByIds);

module.exports = router;
