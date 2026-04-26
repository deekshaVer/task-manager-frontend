import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import TasksPage from "../features/tasks/TasksPage";
import ForgotPassword from "../features/auth/ForgotPassword";
import ResetPassword from "../features/auth/ResetPassword";
import LandingPage from "../features/LandingPage";
import { setCredentials } from "../features/auth/authSlice";
import { getUserFromToken } from "../utils/decodeToken";
import { useEffect } from "react";
import { useAppDispatch } from "../app/hook";

const AppRoutes = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const user = getUserFromToken();
    const token = localStorage.getItem("token");

    if (user && token) {
      dispatch(setCredentials({ user, token }));
    }
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
