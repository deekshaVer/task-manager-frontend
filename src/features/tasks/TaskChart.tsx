import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import type { Task } from "./tasksApi";

const TaskChart = ({ tasks }: { tasks: Task[] }) => {
  const completed = tasks.filter((t) => t.completed).length;
  const active = tasks.filter((t) => !t.completed).length;

  const data = [
    { name: "Completed", value: completed, icon: <FiCheckCircle /> },
    { name: "Active", value: active, icon: <FiClock /> },
  ];

  const COLORS = ["#22c55e", "#3b82f6"];

  return (
    <div className="chart-card">
      {/* Header */}
      <div className="chart-header">
        <h3>Task Overview</h3>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={70}
              innerRadius={40}
              paddingAngle={4}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-stats">
        {data.map((item, index) => (
          <div key={item.name} className="chart-stat">
            <span className="dot" style={{ backgroundColor: COLORS[index] }} />
            <span className="icon">{item.icon}</span>
            <span className="label">{item.name}</span>
            <span className="value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskChart;
