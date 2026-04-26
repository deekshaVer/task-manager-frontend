import { jwtDecode } from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);

    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
    };
  } catch {
    return null;
  }
};
