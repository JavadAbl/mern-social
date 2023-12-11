const mongoose = require("mongoose");

exports.deleteOps = async (comment) => {
  const Post = mongoose.model("Post");

  return Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: comment._id },
  });
};
