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
      <button onClick={toggleDarkMode}>
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <div className="app">
        <div className="main">
          <AppRoutes />
        </div>
      </div>
    </>
  );
}

export default App;
