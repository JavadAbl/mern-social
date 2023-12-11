const mongoose = require("mongoose");
const commentLogic = require("./comment.logic");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.pre("deleteOne", { document: true }, function (next) {
  commentLogic.deleteOps(this);
  next();
});
commentSchema.pre("deleteMany", { document: true }, function (next) {
  commentLogic.deleteOps(this);
  next();
});

const comment = mongoose.model("Comment", commentSchema);

exports.Comment = comment;
