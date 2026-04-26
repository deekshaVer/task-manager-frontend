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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskChart from "./TaskChart";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const FILTER_OPTIONS = ["All", "Active", "Completed"] as const;

const getDueDateStatus = (date?: string) => {
  if (!date) return "";
  const today = new Date();
  const due = new Date(date);

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
  priorityFilter: string,
) => {
  return tasks.filter((task) => {
    if (selectedProject && task.projectId !== selectedProject) return false;

    if (filter === "Active" && task.completed) return false;
    if (filter === "Completed" && !task.completed) return false;

    if (search && !task.title.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (dateFilter !== "all" && task.dueDate) {
      const status = getDueDateStatus(task.dueDate);
      if (status !== dateFilter) return false;
    }

    if (priorityFilter !== "all" && task.priority !== priorityFilter) {
      return false;
    }

    return true;
  });
};

const TaskListItem = ({ task, onToggle, onDelete, onUpdate }: any) => {
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

  return (
    <div ref={setNodeRef} style={style} className="task-item">
      <span {...attributes} {...listeners} className="drag-handle">
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
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="edit-input"
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          className={task.completed ? "Completed" : ""}
        >
          {task.title}
        </span>
      )}

      {/* Priority Badge */}
      <span className={`priority-badge ${task.priority}`}>{task.priority}</span>

      <button onClick={() => onDelete(task._id)} className="delete-btn">
        <FiTrash2 />
      </button>
    </div>
  );
};

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

  useMemo(() => setLocalTasks(tasks), [tasks]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localTasks.findIndex((t) => t._id === active.id);
    const newIndex = localTasks.findIndex((t) => t._id === over.id);

    const newTasks = arrayMove(localTasks, oldIndex, newIndex);
    setLocalTasks(newTasks);

    await reorderTasks(newTasks.map((t, i) => ({ id: t._id, order: i })));
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
  );
};

const TasksPage = () => {
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const { data: tasks = [], isLoading } = useGetTasksQuery();
  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const handleAddTask = useCallback(async () => {
    if (!title.trim()) return;

    await addTask({ title });
    setTitle("");
    toast.success("Task added");
  }, [title, addTask]);

  const handleToggle = (task: Task) => {
    updateTask({ _id: task._id, completed: !task.completed });
  };

  const handleUpdateTask = async (id: string, data: Partial<Task>) => {
    await updateTask({ _id: id, ...data });
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
  };

  const filteredTasks = useMemo(
    () =>
      filterTasks(
        tasks,
        filter,
        selectedProject,
        search,
        dateFilter,
        priorityFilter,
      ),
    [tasks, filter, selectedProject, search, dateFilter, priorityFilter],
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
      />

      <main style={{ flex: 1, padding: "20px" }}>
        {/* Header */}
        <div className="dashboard-header">
          <h2>Dashboard</h2>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">Total: {tasks.length}</div>
          <div className="stat-card">
            Done: {tasks.filter((t) => t.completed).length}
          </div>
          <div className="stat-card">
            Active: {tasks.filter((t) => !t.completed).length}
          </div>
        </div>

        {/* Chart */}
        <TaskChart tasks={tasks} />

        {/* Add Task */}
        <div className="add-task">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add task..."
          />
          <button onClick={handleAddTask}>
            <FiPlus />
          </button>
        </div>

        {/* Search */}
        <input
          className="task-search"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="priority-filter"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onUpdate={handleUpdateTask}
        />
      </main>
    </div>
  );
};

export default TasksPage;
