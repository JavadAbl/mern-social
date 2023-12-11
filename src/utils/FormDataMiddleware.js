const Multer = require("multer");

const storage = Multer.memoryStorage();

const filter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      {
        message: "Only images are allowed",
      },
      false,
    );
  }
};

const formData = Multer({
  storage,
  fileFilter: filter,
  limits: {
    fileSize: 1024 * 1024 * 10,
    files: 1,
  },
}).single("image");

module.exports = formData;
