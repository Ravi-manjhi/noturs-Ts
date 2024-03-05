import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT = parseInt(process.env.SALT as string) || 12;

interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo: string;
  password: string;
  role: string;
  confirmPassword?: string | undefined;
  passwordChangeAt: any;
  passwordResetToken: string | undefined;
  passwordResetExpires: number | undefined;
  active: boolean;
  fullName?: string;
  correctPassword(candidatePassword: string): Promise<boolean>;
  isPasswordChanged(tokenTime: number): Promise<boolean>;
  createPasswordResetToken(): Promise<string>;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: [true, "first name is required"] },
    lastName: { type: String, required: [true, "last name is required"] },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "email is required"],
    },
    photo: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "lead-guide", "guide"],
      default: "user",
      select: false,
    },
    active: { type: Boolean, default: true, select: false },
    password: {
      type: String,
      minlength: 8,
      required: [true, "password is must"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "password is must"],
      validate: {
        validator: function (this: IUser, val: string) {
          return this.password === val;
        },
        message: "Password not same",
      },
    },
    passwordChangeAt: Date,
    passwordResetExpires: Date,
    passwordResetToken: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.pre("save", async function (this: IUser, next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, SALT);
  this.confirmPassword = undefined;

  next();
});

UserSchema.pre("save", async function (this: IUser, next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangeAt = Date.now() - 1000;

  next();
});

UserSchema.pre("find", function (next) {
  this.find({ active: { $ne: false } });

  next();
});

UserSchema.methods.correctPassword = async function (
  this: IUser,
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.isPasswordChanged = function (
  this: IUser,
  tokenTime: number
) {
  if (this.passwordChangeAt) {
    const changeTime = Math.ceil(this.passwordChangeAt.getTime() / 1000);
    return changeTime > tokenTime;
  }

  return false;
};

UserSchema.methods.createPasswordResetToken = function (this: IUser) {
  const resetToken = crypto.randomBytes(32).toString("hex");
  crypto.createHash("sha256").update(resetToken).digest("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.virtual("fullName").get(function (this: IUser) {
  return this.firstName + " " + this.lastName;
});

export default model<IUser>("User", UserSchema);
