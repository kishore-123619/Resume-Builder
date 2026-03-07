import React, { useState } from "react";
import api from "../configs/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Send OTP
  const sendOtp = async () => {
    if (!email) {
      return toast.error("Please enter your email");
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/forgot", { email });
      toast.success(res.data.message || "Verification code sent");
      setStep(2);
    } catch (e) {
      console.error("Send OTP error:", e);
      toast.error(e.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      return toast.error("Please enter the verification code");
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/verify-otp", {
        email,
        otp: otp.toString(),
      });
      toast.success(res.data.message || "OTP verified");
      setStep(3);
    } catch (e) {
      console.error("Verify OTP error:", e);
      toast.error(e.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reset Password
  const resetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return toast.error("Please fill all fields");
    }

    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await api.post("/api/users/reset-password", {
        email,
        newPassword,
      });
      toast.success(res.data.message || "Password updated");
      navigate("/login");
    } catch (e) {
      console.error("Reset password error:", e);
      toast.error(e.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl w-[400px] shadow">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Forgot Password
        </h2>

        {/* STEP 1 – EMAIL */}
        {step === 1 && (
          <>
            <input
              type="email"
              className="border w-full p-3 rounded mb-4"
              placeholder="Enter registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </>
        )}

        {/* STEP 2 – OTP */}
        {step === 2 && (
          <>
            <input
              className="border w-full p-3 rounded mb-4"
              placeholder="Enter verification code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </>
        )}

        {/* STEP 3 – RESET PASSWORD */}
        {step === 3 && (
          <>
            <input
              type="password"
              className="border w-full p-3 rounded mb-3"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              className="border w-full p-3 rounded mb-4"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
