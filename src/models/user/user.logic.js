const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const AppError = require("../../utils/AppError");
const { imageUnload } = require("../../utils/ImageUploader");

exports.deleteOps = async function (user) {
  const Post = mongoose.model("Post");
  const posts = await Post.find({ user: user._id });
  posts.forEach((p) => p.deleteOne());

  await imageUnload(user._id, "profile");
};

//------------------------------------------------------
exports.deleteManyOps = async function () {
  const User = mongoose.model("User");
  const Post = mongoose.model("Post");
  await Post.deleteMany();

  const users = User.find();
  users.array.forEach(async (user) => {
    await imageUnload(user._id, "profile");
  });
};

//------------------------------------------------------
exports.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

//------------------------------------------------------
exports.matchPassword = function (enteredPassword, hashedPassword) {
  return bcrypt.compare(enteredPassword, hashedPassword);
};

//------------------------------------------------------
exports.generateVerificationToken = function (mode, callback) {
  crypto.randomBytes(16, (err, buf) => {
    if (err) throw err;

    if (!mode) return;

    switch (mode) {
      case "verify":
        this.accountVerificationToken = buf.toString("hex");
        this.accountVerificationTokenExpires = Date.now() + 600000;
        break;
      case "password":
        this.passwordResetToken = buf.toString("hex");
        this.passwordResetTokenExpires = Date.now() + 600000;
        break;
      default:
        break;
    }
    callback();
  });
};

//------------------------------------------------------
exports.follow = async function (thisUser, userFollow) {
  if (thisUser.id === userFollow.id)
    throw new AppError("You cannot follow yourself", 400);

  if (thisUser.following.includes(userFollow.id))
    throw new AppError("You are already following this user", 400);

  await thisUser.updateOne({
    $addToSet: {
      following: userFollow.id,
    },
  });

  await userFollow.updateOne({
    $addToSet: {
      followers: thisUser.id,
    },
  });
};

//------------------------------------------------------
exports.unfollow = async function (thisUser, userUnfollow) {
  if (thisUser.id === userUnfollow.id)
    throw new AppError("You cannot unfollow yourself", 400);

  if (!thisUser.following.includes(userUnfollow.id))
    throw new AppError("You are not following this user", 400);

  await thisUser.updateOne({
    $pull: {
      following: userUnfollow.id,
    },
  });

  await userUnfollow.updateOne({
    $pull: {
      followers: thisUser.id,
    },
  });
};
//------------------------------------------------------
//------------------------------------------------------
