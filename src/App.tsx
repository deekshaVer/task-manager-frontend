import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useDispatch } from "react-redux";
import { setCredentials } from "./features/auth/authSlice";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { darkMode, toggleDarkMode } = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      dispatch(setCredentials({ user: null, token }));
    }
  }, [dispatch]);

  return (
    <>
      <button className="m-3" onClick={toggleDarkMode}>
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>
      <h2 className="logo" onClick={() => (window.location.href = "/")}>
        Task<span>Pilot</span>
      </h2>
      <div className="app">
        <div className="main">
          <AppRoutes />
        </div>
      </div>
    </>
  );
}

export default App;
