const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'please tell us your name'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, 'A user must have a email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'lead-guide', 'guide', 'user'],
      message: 'A role must be: admib, lead-guide, guide or user',
    },
    default: 'user',
  },
  password: {
    type: String,
    select: false,
    required: ['Please type a passsword'],
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Passwords don't match",
    },
    required: ['Please retype password'],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (!this.isNew) this.passwordChangedAt = new Date() - 1000;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.verifyPassword = function (candidatePwd) {
  return bcrypt.compare(candidatePwd, this.password);
};

userSchema.methods.hasPasswordChanged = function (timestamp) {
  if (this.passwordChangedAt) {
    return timestamp < this.passwordChangedAt.getTime() / 1000;
  }
  return false;
};

userSchema.methods.createPwdResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpiresAt = Date.now() + 1000 * 60 * 10;
  return token;
};

module.exports = mongoose.model('User', userSchema);
