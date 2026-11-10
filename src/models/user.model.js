import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-zA-Z0-9]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      select: false, 
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile: {
      firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
      },
      birthDate: {
        type: Date,
      },
      phone: {
        type: String,
      },
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
userSchema.virtual("events", {
  ref: "Event",
  localField: "_id",
  foreignField: "organizer",
});

export const UserModel = model("User", userSchema);
