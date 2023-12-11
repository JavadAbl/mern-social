const AsyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const { Post, Comment } = require("../models/index.model");

// /////////////////////////////////////////////////////////////

exports.getComment = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);
  if (!comment) throw new AppError("Comment not found", 404);

  res.status(200).json({
    status: "success",
    comment,
  });
});

// /////////////////////////////////////////////////////////////
exports.getComments = AsyncHandler(async (req, res) => {
  const comments = await Comment.find();

  res.status(200).json({
    status: "success",
    result: comments.length,
    comments,
  });
});
// /////////////////////////////////////////////////////////////

exports.getPostComments = AsyncHandler(async (req, res) => {
  const postId = req.params.id;

  const comments = await Comment.find({ post: postId }).populate(["user"]);

  res.status(200).json({
    status: "success",
    result: comments.length,
    comments,
  });
});
// /////////////////////////////////////////////////////////////

exports.createComment = async (req, res, next) => {
  let comment;
  try {
    const userId = req.id;
    const { postId, content } = req.body;

    const post = await Post.findById(postId);
    if (!post) throw new AppError("Post not found", 404);

    comment = await Comment.create({
      user: userId,
      post: postId,
      content,
    });

    await post.updateOne({ $push: { comments: comment._id } });

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (err) {
    if (comment) await comment.deleteOne();
    next(err);
  }
};
// /////////////////////////////////////////////////////////////

exports.updateComment = AsyncHandler(async (req, res) => {
  const { commentId, content } = req.body;

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!comment) throw new AppError("Comment not found", 404);

  res.status(200).json({
    success: true,
    comment,
  });
});

// /////////////////////////////////////////////////////////////

exports.deleteComment = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findByIdAndDelete(id);

  if (!comment) throw new AppError("Comment not found", 404);

  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: comment._id },
  });

  res.status(204).json({
    success: true,
    comment,
  });
});

// /////////////////////////////////////////////////////////////
