import { useState } from "react";
import { toast } from "react-toastify";
import { FiMail } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL + "/api";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      if (!res.ok) {
        throw new Error("Request failed");
      }

      toast.success("Password reset link sent 📩");
      setEmail("");
    } catch (err) {
      toast.error("Unable to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Forgot Password</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-with-icon">
          <FiMail className="input-icon" />
          <input
            type="email"
            placeholder="Enter your email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="auth-button" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
