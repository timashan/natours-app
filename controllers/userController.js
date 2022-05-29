const factory = require('../controllers/handlerFactory');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const AppError = require('../utils/appError');
const sharp = require('sharp');

const filterObj = (object, ...fields) => {
  const obj = {};
  Object.keys(object).forEach(key => {
    if (fields.includes(key)) obj[key] = object[key];
  });
  return obj;
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError(400, 'Please upload an image.', 400));
  },
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.filename}`);
  }
  next();
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const update = filterObj(req.body, 'name', 'email');
  if (req.file) update['photo'] = req.filename;

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { data: user },
  });
});
