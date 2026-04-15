import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { token } = useParams();
  const navigate = useNavigate();

  const validate = () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await fetch(`http://localhost:3000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      toast.success("Password updated successfully");
      navigate("/login");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Reset Password</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Password */}
        <div >
          
          <div className="password-wrapper">
            <FiLock className="input-icon" />

            <input
              type={showPassword ? "text" : "password"}
             
              className="form-input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />

            <span
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          {error && <p className="input-error">{error}</p>}
        </div>

        {/* Button */}
        <button className="auth-button" type="submit">
          <FiCheckCircle style={{ marginRight: "6px" }} />
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
