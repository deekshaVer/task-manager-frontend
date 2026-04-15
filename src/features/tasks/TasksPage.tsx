import { useState, useMemo, useCallback } from "react";
import type { Task } from "./tasksApi";
import {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useReorderTasksMutation,
} from "./tasksApi";
import { toast } from "react-toastify";
import Sidebar from "../Sidebar";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskChart from "./TaskChart";
import {
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

// Helper constants
const FILTER_OPTIONS = ["all", "active", "completed"] as const;

const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case "high":
      return "priority-high";
    case "medium":
      return "priority-medium";
    case "low":
      return "priority-low";
    default:
      return "";
  }
};

const getDueDateStatus = (date: string | undefined) => {
  if (!date) return "";

  const today = new Date();
  const due = new Date(date);

  // remove time
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (due < today) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  return "upcoming";
};

const filterTasks = (
  tasks: Task[],
  filter: string,
  selectedProject: string,
  search: string,
  dateFilter: string,
) => {
  return tasks.filter((task) => {
    if (selectedProject && task.projectId !== selectedProject) return false;
    if (filter === "active" && task.completed) return false;
    if (filter === "completed" && !task.completed) return false;
    if (search && !task.title.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (dateFilter !== "all" && task.dueDate) {
      const status = getDueDateStatus(task.dueDate);
      if (status !== dateFilter) return false;
    }

    return true;
  });
};

// TaskForm Component
const TaskForm = ({
  title,
  dueDate,
  priority,
  onTitleChange,
  onDueDateChange,
  onPriorityChange,
  onAddTask,
}: {
  title: string;
  dueDate: string;
  priority: string;
  onTitleChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onAddTask: () => void;
}) => (
  <div style={{ marginTop: "20px" }}>
    <h3>Add Task</h3>
    <div className="input-group">
      <input
        type="text"
        className="input"
        placeholder="Enter task..."
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <button className="button" onClick={onAddTask}>
         <FiPlus />
      </button>
    </div>

    <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => onDueDateChange(e.target.value)}
        style={{ flex: 1 }}
      />
      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        style={{ flex: 1 }}
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>
    </div>
  </div>
);

// SearchBar Component
const SearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <div style={{ marginTop: "20px" }}>
    <input
      type="text"
      placeholder="Search tasks..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
      }}
    />
  </div>
);

// FilterButtons Component
const FilterButtons = ({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) => (
  <div className="filter-buttons" style={{ marginTop: "15px" }}>
    {FILTER_OPTIONS.map((filter) => (
      <button
        key={filter}
        className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
        onClick={() => onFilterChange(filter)}
      >
        {filter.charAt(0).toUpperCase() + filter.slice(1)}
      </button>
    ))}
  </div>
);

// TaskListItem Component
const TaskListItem = ({
  task,
  onToggle,
  onDelete,
  onUpdate,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const handleSave = async () => {
    if (!editValue.trim()) return;

    await onUpdate(task._id, { title: editValue });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(task.title);
    setIsEditing(false);
  };
  return (
    <div ref={setNodeRef} style={style} className="task-item">
      {/*  Drag Handle */}
      <span
        {...attributes}
        {...listeners}
        style={{ cursor: "grab", marginRight: "10px" }}
      >
        ☰
      </span>

      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
      />

      {isEditing ? (
        <input
          value={editValue}
          autoFocus
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          style={{
            marginLeft: "8px",
            padding: "4px",
            borderRadius: "4px",
          }}
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          className={task.completed ? "completed" : ""}
          style={{ cursor: "text" }}
        >
          {task.title}
        </span>
      )}
      <div style={{ marginTop: "5px", marginLeft: "10px" }}>
        <small className={getPriorityClass(task.priority)}>
          {task.priority.toUpperCase()}
        </small>

        {task.dueDate && (
          <small className={`due-date ${getDueDateStatus(task.dueDate)}`}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </small>
        )}
      </div>
      <button className="delete-btn" onClick={() => onDelete(task._id)}>
         <FiTrash2 />
      </button>
    </div>
  );
};

// TaskList Component
const TaskList = ({
  tasks,
  onToggle,
  onDelete,
  onUpdate,
}: {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
}) => {
  const [reorderTasks] = useReorderTasksMutation();
  const [localTasks, setLocalTasks] = useState(tasks);

  // Sync localTasks when tasks prop changes
  useMemo(() => {
    setLocalTasks(tasks);
  }, [tasks]);
  //  Drag logic
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = localTasks.findIndex((t) => t._id === active.id);
    const newIndex = localTasks.findIndex((t) => t._id === over.id);

    const newTasks = arrayMove(localTasks, oldIndex, newIndex);
    setLocalTasks(newTasks); // Update local state immediately for smooth UI

    //  Prepare payload
    const updatedOrder = newTasks.map((task, index) => ({
      id: task._id,
      order: index,
    }));

    try {
      await reorderTasks(updatedOrder);
    } catch (err) {
      console.error("Reorder failed", err);
    }
  };
  return (
    <div style={{ marginTop: "20px" }}>
      {tasks.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999" }}>No tasks found</p>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localTasks.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            {localTasks.map((task) => (
              <TaskListItem
                key={task._id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

// Main Component
const TasksPage = () => {
  // Form state
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");

  // Filter state
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  // API hooks
  const { data: tasks = [], isLoading } = useGetTasksQuery();
  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  // Handlers
  const handleAddTask = useCallback(async () => {
    if (!title.trim()) return;

    await addTask({
      title,
      dueDate: dueDate || undefined,
      priority,
      projectId: selectedProject || undefined,
    });

    setTitle("");
    setDueDate("");
    setPriority("low");
    toast.success("Task added successfully ✅");
  }, [title, dueDate, priority, selectedProject, addTask]);

  const handleToggleTask = useCallback(
    async (task: Task) => {
      await updateTask({
        _id: task._id,
        completed: !task.completed,
      });
      toast.success("Task updated successfully ✅");
    },
    [updateTask],
  );
const handleUpdateTask = useCallback(
  async (id: string, data: Partial<Task>) => {
    try {
      await updateTask({
        _id: id,
        ...data,
      }).unwrap();

      toast.success("Task updated");
    } catch {
      toast.error("Update failed");
    }
  },
  [updateTask]
);
  const handleDeleteTask = useCallback(
    async (id: string) => {
      await deleteTask(id);
      toast.success("Task deleted successfully ✅");
    },
    [deleteTask],
  );

  // Filtered tasks
  const filteredTasks = useMemo(
    () => filterTasks(tasks, filter, selectedProject, search, dateFilter),
    [tasks, filter, selectedProject, search, dateFilter],
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
      />
      <main
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 className="title">Task Manager</h2>
        </div>
        <div className="chart-container">
          <TaskChart tasks={tasks} />
        </div>
        <TaskForm
          title={title}
          dueDate={dueDate}
          priority={priority}
          onTitleChange={setTitle}
          onDueDateChange={setDueDate}
          onPriorityChange={(value) =>
            setPriority(value as "low" | "medium" | "high")
          }
          onAddTask={handleAddTask}
        />

        <SearchBar value={search} onChange={setSearch} />
        <div className="filters-row">
          <FilterButtons
            activeFilter={filter}
            onFilterChange={(f) =>
              setFilter(f as "all" | "active" | "completed")
            }
          />

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-filter"
          >
            <option value="all">All Dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
        <TaskList
          tasks={filteredTasks}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          onUpdate={handleUpdateTask}
        />
      </main>
    </div>
  );
};

export default TasksPage;
