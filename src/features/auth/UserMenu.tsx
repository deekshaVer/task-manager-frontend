import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetTasksQuery } from "../tasks/tasksApi";

const UserMenu = ({ user }: { user: { name: string } }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: tasks = [] } = useGetTasksQuery();

  // Calculate task stats
  const taskStats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    const total = tasks.length;
    return { completed, total };
  }, [tasks]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="user-menu">
      {/* Top Bar */}
      <div className="user-trigger" onClick={() => setOpen(!open)}>
        <div className="avatar">{user.name.charAt(0)}</div>
        <span>{user.name}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="dropdown">
          <div className="dropdown-item user-info">
            <strong>{user.name}</strong>
            <p>
              {taskStats.completed}/{taskStats.total} tasks
            </p>
          </div>

          <hr />

          <div className="dropdown-item logout" onClick={handleLogout}>
            Log out
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
