import { useState, useCallback } from "react";
import {
  useGetProjectsQuery,
  useAddProjectMutation,
} from "../features/tasks/tasksApi";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";
import UserMenu from "./auth/UserMenu";
import { FiFolder, FiPlus, FiLayers } from "react-icons/fi";

interface SidebarProps {
  selectedProject: string;
  onSelectProject: (projectId: string) => void;
}

const user = {
  name: "Deeksha",
};

const Sidebar = ({ selectedProject, onSelectProject }: SidebarProps) => {
  const { darkMode } = useTheme();
  const [projectName, setProjectName] = useState("");

  const { data: projects = [] } = useGetProjectsQuery();
  const [addProject] = useAddProjectMutation();

  const handleAddProject = useCallback(async () => {
    if (!projectName.trim()) return;

    try {
      await addProject({ name: projectName }).unwrap();
      setProjectName("");
      toast.success("Project created");
    } catch {
      toast.error("Failed to create project");
    }
  }, [projectName, addProject]);

  return (
    <aside
      className={`sidebar ${darkMode ? "sidebar--dark" : "sidebar--light"}`}
    >
      {/*  User */}
      <UserMenu user={user} />

      {/*  Header */}
      <div className="sidebar-header">
        <FiLayers />
        <h3>Projects</h3>
      </div>

      {/*  Add Project */}
      <div className="sidebar__add-project-form">
        <div className="sidebar-input-wrapper">
          <input
            type="text"
            placeholder="New project..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
            className={`sidebar__input ${
              darkMode
                ? "sidebar__input--dark"
                : "sidebar__input--light"
            }`}
          />
          <button onClick={handleAddProject} className="icon-btn">
            <FiPlus />
          </button>
        </div>
      </div>

      <div className="project-list">
        {/* All Projects */}
        <div
          onClick={() => onSelectProject("")}
          className={`sidebar__project-item ${
            selectedProject === "" ? "sidebar__project-item--active" : ""
          }`}
        >
          <FiFolder />
          <span>All Projects</span>
        </div>

        {/* Dynamic Projects */}
        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() => onSelectProject(project._id)}
            className={`sidebar__project-item ${
              selectedProject === project._id
                ? "sidebar__project-item--active"
                : ""
            }`}
          >
            <FiFolder />
            <span>{project.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;