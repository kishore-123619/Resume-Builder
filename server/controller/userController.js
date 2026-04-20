import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Resume from "../models/Resume.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import sendEmail from "../utils/SendEmail.js"; // ✅ fixed path

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      mobile,
    });

    const token = generateToken(user._id);
    user.password = undefined;

    res.status(201).json({
      message: "User created successfully",
      token,
      user,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    user.password = undefined;

    res.json({ message: "Login successful", token, user });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// ================= GOOGLE LOGIN =================
export const googleLoginUser = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: "google_auth",
        mobile: "0000000000",
      });
    }

    const jwtToken = generateToken(user._id);

    res.json({
      message: "Google login successful",
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// ================= SEND RESET OTP (EMAIL) =================
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = crypto.createHash("sha256").update(otp).digest("hex");
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // ✅ send email
    await sendEmail({
      to: user.email,
      subject: "Password Reset Code",
      text: `Your verification code is ${otp}. It is valid for 10 minutes.`,
    });

    res.json({ message: "Verification code sent to email" });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      resetOtp: hashedOtp,
      resetOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.json({ message: "OTP verified" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Missing data" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.json({ message: "Password updated successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ================= GET USER =================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = undefined;
    res.json({ user });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// ================= USER RESUMES =================
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId });
    res.json({ resumes });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
