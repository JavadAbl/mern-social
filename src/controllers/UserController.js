/* eslint-disable no-unused-vars */

const AsyncHandler = require("express-async-handler");
const { User } = require("../models/index.model");
const userLogic = require("../models/user/user.logic");
const AppError = require("../utils/AppError");
const { generateToken } = require("../utils/TokenGenerator");
const sendEmail = require("../utils/EmailSender");
const { DEFAULT_PROFILE_PICTURE } = require("../utils/constants");
const {
  imageUpload,
  imageUnload,
  imageRename,
} = require("../utils/ImageUploader");

exports.test = AsyncHandler(async (req, res, next) => {
  /* const user = await User.findById("653661b63c0982a45ae441fa");
  user.deleteOne(); */
  await User.deleteMany();

  res.status(200).json({
    status: "success",
  });
});

//---------------------------------------------------------
exports.getUser = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) throw new AppError("User not found", 404);
  res.status(200).json({
    status: "success",
    user,
  });
});

//---------------------------------------------------------
exports.getUsers = AsyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    users,
  });
});

//---------------------------------------------------------
exports.getUsersByIds = AsyncHandler(async (req, res) => {
  const { ids } = req.body;

  const users = await User.find({
    _id: {
      $in: ids,
    },
  });

  res.status(200).json({
    status: "success",
    users,
  });
});

//---------------------------------------------------------
exports.getSuggestUsers = AsyncHandler(async (req, res) => {
  const size = Number(req.params.size);
  const userId = req.id;

  const user = await User.findById(userId);

  if (!size) throw new AppError("Invalid Size", 400);

  const users = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: user._id,
        },
      },
    },
    {
      $match: {
        _id: {
          $nin: user.following,
        },
      },
    },
    {
      $sample: { size },
    },
  ]);

  res.status(200).json({
    status: "success",
    result: users.length,
    users,
  });
});

//---------------------------------------------------------
exports.postUser = AsyncHandler(async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: "success",
    user,
    token: await generateToken(user._id),
  });
});

//---------------------------------------------------------
/* const customAsyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
}; */

//---------------------------------------------------------
exports.deleteUser = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) throw new AppError("Invalid id", 400);

  const deletedUser = await User.findById(id);
  if (!deletedUser) throw new AppError("User not found", 404);

  if (id !== req.id)
    throw new AppError("Cant delete other user than login user", 400);

  await deletedUser.deleteOne();

  res.status(200).json({
    status: "success",
    deletedUser,
  });
});

//---------------------------------------------------------
exports.deleteUsers = AsyncHandler(async (req, res, next) => {
  const adminUser = await User.findById(req.id);

  if (!adminUser.isAdmin)
    throw new AppError("Only admin user can delete all users", 400);

  const result = await User.deleteMany();

  res.status(200).json({
    status: "success",
    result: result.deletedCount,
  });
});

//---------------------------------------------------------
exports.loginUser = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    if (await userLogic.matchPassword(password, user.password))
      res.status(200).json({
        status: "ok",
        user,
        token: await generateToken(user._id),
      });
    else throw new AppError("password is incorrect", 400);
  } else throw new AppError("email is incorrect", 400);
});

//---------------------------------------------------------
exports.getUserProfile = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const profile = await User.findById(id).populate("posts");
  if (!profile) throw new AppError("User not found", 404);
  res.status(200).json({
    status: "success",
    profile,
  });
});

//---------------------------------------------------------
exports.updateUser = AsyncHandler(async (req, res, next) => {
  const { id } = req;
  let { name, bio } = req.body;

  if (name === undefined) name = "";
  if (bio === undefined) bio = "";

  console.log(bio);

  let user = await User.findByIdAndUpdate(
    id,
    {
      name,
      bio,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!user) throw new AppError("User not found", 404);

  if (req.file) {
    if (user.profilePicture !== DEFAULT_PROFILE_PICTURE) {
      await imageUnload(id, "profile");
    }

    const image = await imageRename(req.file, id, "profile");
    const imageURL = await imageUpload(image, "profile");

    user = await User.findByIdAndUpdate(
      id,
      { profilePicture: imageURL },
      { new: true, runValidators: true },
    );
  }

  res.status(200).json({
    status: "success",
    user,
  });
});

//---------------------------------------------------------
exports.followUser = AsyncHandler(async (req, res, next) => {
  const { followId, type } = req.body;
  const userId = req.id;

  if (!type)
    throw new AppError("Type is required, must be <follow> or <unfollow>", 400);

  const user = await User.findById(userId);
  let userFollow = await User.findById(followId);
  // user.save();
  if (!user) throw new AppError("User not found", 404);
  if (!userFollow) throw new AppError("Follow User not found", 404);

  switch (type) {
    case "follow":
      await userLogic.follow(user, userFollow);
      break;
    case "unfollow":
      await userLogic.unfollow(user, userFollow);
      break;
    default:
      throw new AppError(
        "Type is invalid, must be <follow> or <unfollow>",
        400,
      );
  }

  userFollow = await User.findById(followId).populate(["posts"]);

  res.status(200).json({
    status: "success",
    profile: userFollow,
  });
});

//---------------------------------------------------------
exports.genVerifyToken = AsyncHandler(async (req, res, next) => {
  const { id } = req;
  const user = await User.findById(id);

  const callback = async () => {
    await user.save();

    /*  await sendEmail(
      // email: user.email,
      "com.javadabl@gmail.com",
      "Account Verification",
      `<h1>Hello ${user.name}</h1><p>Please verify your account by clicking the link below</p><a href="${process.env.CLIENT_URL}/api/v1/auth/verify/${user.accountVerificationToken}">Verify</a>`
    ); */

    res.status(200).json({
      status: "success",
      token: user.accountVerificationToken,
    });
  };

  userLogic.generateVerificationToken("verify", callback);
});

//---------------------------------------------------------
exports.verifyToken = AsyncHandler(async (req, res, next) => {
  const { token } = req.body;
  const user = await User.findOne({
    accountVerificationToken: token,
    accountVerificationTokenExpires: { $gt: Date.now() },
  });
  if (user) {
    user.isAccountVerified = true;
    user.accountVerificationToken = undefined;
    user.accountVerificationTokenExpires = undefined;
    user.save();
  } else throw new AppError("Token is invalid", 400);
  res.status(200).json({
    status: "success",
    user,
  });
});

//---------------------------------------------------------
exports.genPassResetToken = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw new AppError("User not found", 404);
  const callback = async () => {
    await user.save();

    /*  await sendEmail(
      // email: user.email,
      "com.javadabl@gmail.com",
      "Account Verification",
      `<h1>Hello ${user.name}</h1><p>Please verify your account by clicking the link below</p><a href="${process.env.CLIENT_URL}/api/v1/auth/verify/${user.accountVerificationToken}">Verify</a>`
    ); */

    res.status(200).json({
      status: "success",
      token: user.accountVerificationToken,
    });
  };
  userLogic.generateVerificationToken("password", callback);
});

//---------------------------------------------------------
exports.verifyPasswordToken = AsyncHandler(async (req, res, next) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (user) {
    user.password = password;
    this.passwordChangedAt = Date.now();
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save();
  } else throw new AppError("Token is invalid", 400);
  res.status(200).json({
    status: "success",
    user,
  });
});

//---------------------------------------------------------
exports.imageUpload = AsyncHandler(async (req, res, next) => {
  const { id } = req;

  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", 404);

  const resizedFile = await imageRename(req.file, id, "profile");
  const url = await imageUpload(resizedFile, "profile");

  await user.updateOne(
    {
      profilePicture: url,
    },
    {
      new: true,
    },
  );

  res.status(200).json({
    status: "success",
    url: user.profilePicture,
  });
});

//----------------------------------------------------
exports.userAuth = AsyncHandler(async (req, res) => {
  const { id } = req;

  const user = await User.findById(id);

  if (!user) throw new AppError("User not found", 404);

  res.status(200).json({
    status: "success",
    user,
  });
});
