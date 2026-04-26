import { useState } from "react";
import { useLoginMutation } from "./authApi";
import { useAppDispatch } from "../../app/hook";
import { setCredentials } from "./authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiMail, FiEye, FiEyeOff, FiLock } from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = { email: "", password: "" };

    if (!email.includes("@")) {
      newErrors.email = "Enter a valid email";
    }

    if (password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await login({ email, password }).unwrap();

      dispatch(
        setCredentials({
          user: res.user,
          token: res.token,
        }),
      );
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      toast.success("Logged in successfully");
      navigate("/tasks");
    } catch {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Welcome Back</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <div className="input-with-icon">
            <FiMail className="input-icon" />
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: "" });
              }}
            />
          </div>
          {errors.email && <p className="input-error">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <div className="password-wrapper">
            <FiLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: "" });
              }}
            />

            <span
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          {errors.password && <p className="input-error">{errors.password}</p>}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="auth-button"
        >
          {isLoading ? "Signing in..." : "Login"}
        </button>
      </form>

      {/* Links */}
      <p className="auth-footer">
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>

      <p className="auth-footer">
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
