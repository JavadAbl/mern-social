const mongoose = require("mongoose");
const { DEFAULT_PROFILE_PICTURE } = require("../../utils/constants");
const userLogic = require("./user.logic");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    profilePicture: {
      type: String,
      default: DEFAULT_PROFILE_PICTURE,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    accountVerificationToken: {
      type: String,
    },
    accountVerificationTokenExpires: {
      type: Date,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpires: {
      type: Date,
    },
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

// /////////////////////////////////////////////////////////////
userSchema.pre("deleteOne", { document: true }, async function (next) {
  await userLogic.deleteOps(this);
  next();
});

// /////////////////////////////////////////////////////////////
userSchema.pre("deleteMany", { query: true }, async (next) => {
  await userLogic.deleteManyOps();
  next();
});

// /////////////////////////////////////////////////////////////
userSchema.virtual("postsCount").get(function () {
  return this.posts && this.posts.length ? this.posts.length : 0;
});

// /////////////////////////////////////////////////////////////
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await userLogic.hashPassword(this.password);
  next();
});
// /////////////////////////////////////////////////////////////
userSchema.pre("findOneAndUpdate", async function (next) {
  if (this.getUpdate().password)
    this.setUpdate({
      ...this.getUpdate(),
      passwordChangedAt: Date.now(),
      password: await userLogic.hashPassword(this.getUpdate().password),
    });
  next();
});

// /////////////////////////////////////////////////////////////

const user = mongoose.model("User", userSchema);

exports.User = user;
