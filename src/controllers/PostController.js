const AsyncHandler = require("express-async-handler");
const { Post, User } = require("../models/index.model");
const AppError = require("../utils/AppError");
const { imageUpload, imageRename } = require("../utils/ImageUploader");

// /////////////////////////////////////////////////////////////
exports.getUserPosts = AsyncHandler(async (req, res) => {
  const { id } = req;
  const posts = await Post.find({ user: id });
  res.status(200).json({
    status: "success",
    result: posts.length,
    posts,
  });
});
// /////////////////////////////////////////////////////////////
exports.getPagePosts = AsyncHandler(async (req, res) => {
  let { page, limit } = req.query;

  if (!page || page <= 0) page = 1;
  if (!limit || limit <= -1) limit = 8;

  const posts = await Post.find()
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    status: "success",
    result: posts.length,
    posts,
  });
});
// /////////////////////////////////////////////////////////////
exports.fetchFeed = AsyncHandler(async (req, res) => {
  let { page, limit } = req.query;
  const userId = req.id;

  const user = await User.findById(userId);

  if (!page || page <= 0) page = 1;
  if (!limit || limit <= -1) limit = 8;

  const posts = await Post.find({
    $and: [{ user: { $ne: userId } }, { user: { $in: user.following } }],
  })

    .limit(limit * page)
    .populate(["user"]);

  res.status(200).json({
    status: "success",
    result: posts.length,
    posts,
  });
});

// /////////////////////////////////////////////////////////////
exports.fetchExplore = AsyncHandler(async (req, res) => {
  let { page, limit } = req.query;
  const userId = req.id;

  const user = await User.findById(userId);

  if (!page || page <= 0) page = 1;
  if (!limit || limit <= -1) limit = 8;

  /* 
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(["user"]); */

  const posts = await Post.find({
    $and: [{ user: { $ne: userId } }, { user: { $nin: user.following } }],
  }).limit(limit * page);

  res.status(200).json({
    status: "success",
    result: posts.length,
    posts,
  });
});
// /////////////////////////////////////////////////////////////
exports.getPost = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id).populate(["user", "comments"]);
  if (!post) throw new AppError("Post not found", 404);
  await post.updateOne({ $inc: { numViews: 1 } });

  res.status(200).json({
    status: "success",
    post,
  });
});
// /////////////////////////////////////////////////////////////
exports.createPost = async (req, res, next) => {
  let post;
  try {
    const userId = req.id;

    if (!req.file) throw new AppError("No post image uploaded", 400);

    post = await Post.create({
      ...req.body,
      user: userId,
    });

    const image = await imageRename(req.file, post._id, "post");
    const imageURL = await imageUpload(image, "post");

    await post.updateOne({ image: imageURL });

    res.status(201).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    if (post) await post.deleteOne();
    next(error);
  }
};
// /////////////////////////////////////////////////////////////
exports.updatePost = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: post,
  });
});
// /////////////////////////////////////////////////////////////
exports.deletePost = AsyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.id;

  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);

  if (post.user.toHexString() !== userId)
    throw new AppError("Unauthorized", 401);

  await post.deleteOne();

  res.status(200).json({
    success: true,
    post,
  });
});
// /////////////////////////////////////////////////////////////
exports.deletePosts = AsyncHandler(async (req, res) => {
  const post = await Post.deleteMany();

  res.status(200).json({
    success: true,
    result: post.deletedCount,
  });
});
// /////////////////////////////////////////////////////////////
exports.toggleLike = AsyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.id;

  let post = await Post.findOne({ _id: postId });
  if (!post) throw new AppError("Post not found", 404);

  let likes = post.likes.length;

  if (!post.likes.includes(userId)) {
    await post.updateOne({ $push: { likes: userId } });

    likes++;
  } else {
    await post.updateOne({ $pull: { likes: userId } });

    likes--;
  }

  post = await Post.findById(postId).populate(["user"]);

  res.status(200).json({
    success: true,
    post,
  });
});
// /////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////
