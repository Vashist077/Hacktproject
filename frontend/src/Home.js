import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  // Line Chart Data
  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Spending",
        data: [500, 1200, 2000, 1800, 2500, 2300],
        borderColor: "#007bff",
        fill: false,
      },
    ],
  };

  // Fraud Pattern Data
  const fraudData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Fraud Cases",
        data: [2, 3, 7, 5, 4],
        backgroundColor: "#007bff",
      },
    ],
  };

  // Top Services
  const servicesData = {
    labels: ["Netflix", "Spotify", "Prime", "Disney+", "Others"],
    datasets: [
      {
        label: "Usage",
        data: [10, 9, 8, 6, 4],
        backgroundColor: "#4da6ff",
      },
    ],
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f4f6f9", padding: "20px" }}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        
        {/* Sidebar */}
        <div style={{ width: "200px", background: "#fff", padding: "20px", boxShadow: "2px 0 5px rgba(0,0,0,0.1)" }}>
          <h2 style={{ color: "#007bff" }}>Dashboard</h2>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
            <li style={{ margin: "10px 0" }}>Overview</li>
            <li style={{ margin: "10px 0" }}>Analytics</li>
            <li style={{ margin: "10px 0" }}>Services</li>
            <li style={{ margin: "10px 0" }}>Settings</li>
          </ul>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px" }}>
          
          {/* Top Stats */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", flex: 1, marginRight: "10px", textAlign: "center" }}>
              <h3>Active Subscriptions</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>14</p>
            </div>
            <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", flex: 1, marginLeft: "10px", textAlign: "center" }}>
              <h3>Monthly Spending</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>₹4,200</p>
            </div>
          </div>

          {/* Middle Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
            {/* Line Chart */}
            <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
              <h4>Spending Over Time</h4>
              <Line data={lineData} />
            </div>

            {/* Alerts */}
            <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
              <h4>Live Alerts</h4>
              <div style={{ background: "#ffcccc", padding: "8px", borderRadius: "5px", margin: "5px 0" }}>⚠ Netflix Payment Pending</div>
              <div style={{ background: "#ffe0b3", padding: "8px", borderRadius: "5px", margin: "5px 0" }}>⚠ Spotify Renewal Soon</div>
              <div style={{ background: "#cce5ff", padding: "8px", borderRadius: "5px", margin: "5px 0" }}>ℹ Prime Membership Active</div>
            </div>
          </div>

          {/* Bottom Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
            <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
              <h4>Fraud Patterns</h4>
              <Bar data={fraudData} />
            </div>
            <div style={{ background: "#fff", padding: "20px", borderRadius: "8px" }}>
              <h4>Top Services</h4>
              <Bar data={servicesData} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;