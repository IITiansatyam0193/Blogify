const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const userPreferencesSchema = new Schema(
  {
    themeId: {
      type: Schema.Types.ObjectId,
      ref: "Theme",
    },
    // you can add more preferences later (language, notifications, etc.)
  },
  { _id: false }
);

const friendRequestSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: [true, "Password is required"] },
    preferences: userPreferencesSchema,
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    incomingRequests: [friendRequestSchema],
    outgoingRequests: [friendRequestSchema],
  },
  { timestamps: true }
);

// Instance method to compare password
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Static helper to hash password before creating user
userSchema.statics.hashPassword = async function (plainPassword) {
  const saltRounds = 10;
  return bcrypt.hash(plainPassword, saltRounds);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
