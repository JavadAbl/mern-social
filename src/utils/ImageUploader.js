const sharp = require("sharp");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

// /////////////////////////////////////////////////////////////
const fileNameGenerator = (id, mode) => {
  switch (mode) {
    case "profile":
      return `user-${id}`;
    case "post":
      return `post-${id}`;
    default:
      throw new Error("Invalid mode");
  }
};
// /////////////////////////////////////////////////////////////
const fileKeyGenerator = (fileName, mode) => {
  switch (mode) {
    case "profile":
      return `users/profile/${fileName}`;
    case "post":
      return `posts/images/${fileName}`;
    default:
      throw new Error("Invalid mode");
  }
};
// /////////////////////////////////////////////////////////////
const imageRename = async (_file, id, mode) => {
  const file = _file;

  file.filename = fileNameGenerator(id, mode);
  const buffer = await sharp(file.buffer).webp().toBuffer();

  /* if (mode === "profile") buffer = await sharp(file.buffer).webp().toBuffer();
  else buffer = await sharp(file.buffer).resize(1000).webp().toBuffer(); */

  file.buffer = buffer;
  return file;
};
// /////////////////////////////////////////////////////////////
const imageUpload = async (file, mode) => {
  const fileKey = fileKeyGenerator(file.filename, mode);

  const client = new S3Client({
    forcePathStyle: true,
    region: "us-east-1",
    endpoint: "https://s3.filebase.com",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });

  const command = new PutObjectCommand({
    Bucket: "node-social",
    Key: fileKey,
    // ContentType: "auto",
    Body: file.buffer,
    ACL: "public-read",
  });

  const commandGet = new GetObjectCommand({
    Bucket: "node-social",
    Key: fileKey,
  });

  await client.send(command);
  const result = await client.send(commandGet);
  return `https://ipfs.filebase.io/ipfs/${result.Metadata.cid}`;
};

// /////////////////////////////////////////////////////////////
const imageUnload = async (id, mode) => {
  const fileName = fileNameGenerator(id, mode);
  const fileKey = fileKeyGenerator(fileName, mode);

  const client = new S3Client({
    forcePathStyle: true,
    region: "us-east-1",
    endpoint: "https://s3.filebase.com",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });
  const commandDelete = new DeleteObjectCommand({
    Bucket: "node-social",
    Key: fileKey,
  });

  await client.send(commandDelete);
};

module.exports = {
  imageUpload,
  imageUnload,
  imageRename,
};
