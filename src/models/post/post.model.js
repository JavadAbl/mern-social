const mongoose = require("mongoose");
const postLogic = require("./post.logic");

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: [true, "Field <caption> is required"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    image: {
      type: String,
      default: "default.jpg",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  },
);

//-------------------------------------------------------
postSchema.virtual("commentsCount").get(function () {
  return this.comments && this.comments.length ? this.comments.length : 0;
});
//-------------------------------------------------------
postSchema.pre("save", async function (next) {
  await postLogic.saveOps(this);
  next();
});

//-------------------------------------------------------
postSchema.pre("deleteOne", { document: true }, async function (next) {
  await postLogic.deleteOps(this);
  next();
});
postSchema.pre("deleteMany", { query: true }, async (next) => {
  await postLogic.deleteManyOps();
  next();
});

//-------------------------------------------------------

const post = mongoose.model("Post", postSchema);

exports.Post = post;
