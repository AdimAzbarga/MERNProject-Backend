const multer = require("multer");
var uuidv1 = require("uuidv1");

const MIME_TYPE_MAP = {
  "image/pngjpg": "pngjpg",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const fileUpload = multer({
  limits: 50000,
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "uploads/images"); // null=>first argument if it succeeded
    },
    filename: (req, file, callback) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      callback(null, uuidv1() + "." + ext);
    },
    fileFilter: (req, file, callback) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype]; //"!!" => double bang , convert undefined or null to false
      let err = isValid ? null : new Error("Invalid file type.");
      callback(err, isValid);
    },
  }),
});

module.exports = fileUpload;
