import mongoose from "mongoose";
const { Schema } = mongoose;
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return validator.isEmail(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 65,
      validate: {
        validator: function (v) {
          return Number.isInteger(v);
        },
        message: (props) => `${props.value} is not a valid age!`,
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return validator.isMobilePhone(v, "any", {
            strictMode: false,
          });
        },
      },
      unique: true,
      trim: true,
    },

    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: (props) => `${props.value} exceeds the limit of 5 skills!`,
      },
    },
    hobbies: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: (props) => `${props.value} exceeds the limit of 5 hobbies!`,
      },
    },
    photo: {
      default: "https://s3.amazonaws.com/37assets/svn/765-default-avatar.png",
      type: String,
      validate: {
        validator: function (v) {
          return validator.isURL(v);
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    about: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return v.length <= 200;
        },
        message: (props) =>
          `${props.value} exceeds the limit of 200 characters!`,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.method("getJWT", function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
});

userSchema.method("hashPassword", async function (password) {
  return await bcrypt.hash(password, 10);
});

userSchema.method("comparePassword", async function (password) {
  return await bcrypt.compare(password, this.password);
});

const User = mongoose.model("User", userSchema);

export default User;
