import { useState } from "react";
import { useRegisterMutation } from "./authApi";
import { useAppDispatch } from "../../app/hook";
import { setCredentials } from "./authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from "react-icons/fi";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = { name: "", email: "", password: "" };
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

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
      const res = await register({ name, email, password }).unwrap();
      localStorage.setItem("token", res.token);
      dispatch(
        setCredentials({
          user: {
            id: res.user.id,
            email: res.user.email,
            name: res.user.name,
          },
          token: res.token,
        }),
      );

      toast.success("Account created successfully");
      navigate("/");
    } catch {
      toast.error("Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Create Account</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Name</label>
          <div className="input-with-icon">
            <FiUser className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: "" });
              }}
            />
          </div>
          {errors.name && <p className="input-error">{errors.name}</p>}
        </div>

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
              placeholder="Create a password"
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
          {isLoading ? "Creating..." : "Register"}
        </button>
      </form>

      {/* Footer */}
      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
