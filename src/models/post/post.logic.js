const mongoose = require("mongoose");
const {
  // imageUpload,
  imageUnload,
  // imageResize,
} = require("../../utils/ImageUploader");

exports.saveOps = function (post) {
  const User = mongoose.model("User");
  return User.findByIdAndUpdate(post.user, { $push: { posts: post._id } });
};

exports.deleteOps = async (post) => {
  const User = mongoose.model("User");
  const Comment = mongoose.model("Comment");

  await User.findByIdAndUpdate(post.user, {
    $pull: { posts: post._id },
  });

  await Comment.deleteMany({ post: post._id });

  await imageUnload(post._id, "post");
};

exports.deleteManyOps = async () => {
  const Post = mongoose.model("Post");
  const User = mongoose.model("User");
  const Comment = mongoose.model("Comment");

  const posts = await Post.find();

  posts.forEach(async (post) => {
    await User.findByIdAndUpdate(post.user, {
      $pull: { posts: post._id },
    });

    await Comment.deleteMany({ post: post._id });

    await imageUnload(post._id, "post");
  });
};
