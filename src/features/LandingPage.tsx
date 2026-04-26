import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheckCircle, FiLayers, FiBarChart2 } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  return (
    <div className={darkMode ? "landing dark" : "landing"}>
      <nav className="nav glass">
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button
            className="nav-btn primary"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </nav>

      <section className="hero">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Organize your work and life, finally.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Focus, organize, and stay calm with TaskPilot.
        </motion.p>
        <motion.button
          className="nav-btn"
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            if (localStorage.getItem("token")) {
              navigate("/tasks");
            } else {
              navigate("/login");
            }
          }}
        >
          Start for free
        </motion.button>
      </section>

      <section className="features">
        {[
          {
            icon: <FiCheckCircle />,
            title: "Stay Organized",
            desc: "All tasks in one place.",
          },
          {
            icon: <FiLayers />,
            title: "Projects",
            desc: "Group tasks smartly.",
          },
          {
            icon: <FiBarChart2 />,
            title: "Track Progress",
            desc: "Visual insights with charts.",
          },
        ].map((f, i) => (
          <motion.div key={i} className="feature-card" whileHover={{ y: -8 }}>
            {f.icon}
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </section>

      <section className="cta-section">
        <h2>Ready to get productive?</h2>
        <button className="nav-btn" onClick={() => navigate("/register")}>
          Get Started
        </button>
      </section>

      <footer className="footer">© {new Date().getFullYear()} TaskPilot</footer>
    </div>
  );
}
