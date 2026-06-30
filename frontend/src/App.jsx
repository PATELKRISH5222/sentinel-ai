import { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
const COLORS = [
  "#3b82f6",
  "#16a34a",
  "#dc2626",
  "#f59e0b",
  "#8b5cf6",
];

function App() {
  const previousCount = useRef(0);
    const audioRef = useRef(null);
  const [incidents, setIncidents] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Offline");
  const [typeData, setTypeData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const incidentsRes = await fetch(
          "https://sentinel-ai-backend-krish.onrender.com/incidents"
        );
        const incidentsData = await incidentsRes.json();

        setIncidents(incidentsData);
        console.log(
  "Previous:",
  previousCount.current,
  "Current:",
  incidentsData.length
);

if (incidentsData.length > previousCount.current) {
  console.log("NEW INCIDENT ADDED");
}
        console.log(
  "Previous:",
  previousCount.current,
  "Current:",
  incidentsData.length
);
if (
  previousCount.current !== 0 &&
  incidentsData.length !== previousCount.current
) {
  setAlertMessage(
    `🚨 Incident Count Changed! Total: ${incidentsData.length}`
  );

  audioRef.current?.play();

  alert(
    `🚨 New Incident Alert!\nTotal Incidents: ${incidentsData.length}`
  );

  setTimeout(() => {
    setAlertMessage("");
  }, 5000);
}

previousCount.current = incidentsData.length;

        const analyticsRes = await fetch(
          "https://sentinel-ai-backend-krish.onrender.com/analytics"
        );
        const analyticsData = await analyticsRes.json();

        setChartData(analyticsData);
        const typesRes = await fetch(
  "https://sentinel-ai-backend-krish.onrender.com/incident-types"
);

const typesData = await typesRes.json();

setTypeData(typesData);

        setStatus("Online");
      } catch (error) {
        console.log(error);
        setStatus("Offline");
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);
const deleteIncident = async (id) => {

  const confirmDelete = window.confirm(
    "Delete this incident?"
  );

  if (!confirmDelete) return;

  try {

    await fetch(
      `https://sentinel-ai-backend-krish.onrender.com/incidents/${id}`,
      {
        method: "DELETE",
      }
    );

    setIncidents(
      incidents.filter(
        (incident) => incident.id !== id
      )
    );

  } catch (error) {
    console.log(error);
  }
};
  return (
    <>
    <audio
  ref={audioRef}
  src="/alarm.mp3"
/>
    <div
      style={{
        padding: "20px",
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1
        style={{
          color: "#38bdf8",
          marginBottom: "20px",
          textAlign: "center",
          fontSize: "56px",
        }}
      >
        Sentinel AI Security Dashboard
      </h1>

      {alertMessage && (
        <div
          style={{
            background: "#dc2626",
            color: "white",
            padding: "15px",
            borderRadius: "10px",
            textAlign: "center",
            marginBottom: "20px",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          {alertMessage}
        </div>
      )}

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search incidents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "12px",
            width: "350px",
            borderRadius: "8px",
            border: "none",
            fontSize: "16px",
          }}
        />
      </div>

      {/* Dashboard Cards */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: "#2563eb",
            padding: "20px",
            borderRadius: "12px",
            width: "250px",
            textAlign: "center",
          }}
        >
          <h3>Total Incidents</h3>
          <h1>{incidents.length}</h1>
        </div>

        <div
          style={{
            background: "#16a34a",
            padding: "20px",
            borderRadius: "12px",
            width: "250px",
            textAlign: "center",
          }}
        >
          <h3>Persons Detected</h3>
          <h1>
            {
              incidents.filter(
                (i) => (i.type || "").toLowerCase() === "person"
              ).length
            }
          </h1>
        </div>

        <div
          style={{
            background: "#dc2626",
            padding: "20px",
            borderRadius: "12px",
            width: "250px",
            textAlign: "center",
          }}
        >
          <h3>System Status</h3>
          <h1
            style={{
              color:
                status === "Online"
                  ? "#4ade80"
                  : "#ffffff",
            }}
          >
            {status}
          </h1>
        </div>
      </div>

      {/* Analytics Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2
  style={{
    textAlign: "center",
    marginBottom: "20px",
  }}
>
  Live Camera Feed
</h2>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  }}
>
  <img
    /*src="http://127.0.0.1:8000/video_feed"*/
    alt="Live Feed"
    style={{
      width: "700px",
      borderRadius: "12px",
      border: "3px solid #38bdf8",
    }}
  />
</div>
        <h2>Incident Analytics</h2>

        <button
          onClick={() =>
            window.open(
              "https://sentinel-ai-backend-krish.onrender.com/report",
              "_blank"
            )
          }
          style={{
            background: "#16a34a",
            color: "white",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Download PDF Report
        </button>
        <button
  onClick={() =>
    window.open(
      "https://sentinel-ai-backend-krish.onrender.com/export-csv",
      "_blank"
    )
  }
  style={{
    background: "#2563eb",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "10px",
  }}
>
  Export CSV
</button>
      </div>

      {/* Chart */}
      <div
        style={{
          width: "100%",
          height: "400px",
          background: "#1e293b",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="incidents"
              fill="#38bdf8"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
<div
  style={{
    width: "100%",
    height: "400px",
    background: "#1e293b",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "30px",
  }}
>
  <h2
    style={{
      textAlign: "center",
      marginBottom: "20px",
    }}
  >
    Incident Types Distribution
  </h2>

  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={typeData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={120}
        label
      >
        {typeData.map((entry, index) => (
          <Cell
            key={index}
            fill={
              COLORS[
                index % COLORS.length
              ]
            }
          />
        ))}
      </Pie>
<Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Incident Records
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#1e293b",
          color: "white",
        }}
      >
        <thead
          style={{
            background: "#1e40af",
          }}
        >
          <tr>
            <th style={{ padding: "15px" }}>ID</th>
            <th style={{ padding: "15px" }}>Type</th>
            <th style={{ padding: "15px" }}>Confidence</th>
            <th style={{ padding: "15px" }}>Date & Time</th>
            <th style={{ padding: "15px" }}>Image</th>
            <th style={{ padding: "15px" }}>Delete</th>
          </tr>
        </thead>

        <tbody>
          {incidents
            .filter((incident) =>
              (incident.type || "")
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((incident) => (
              <tr
                key={incident.id}
                style={{
                  borderBottom:
                    "1px solid #334155",
                }}
              >
                <td
                  style={{
                    padding: "15px",
                    textAlign: "center",
                  }}
                >
                  {incident.id}
                </td>

                <td
                  style={{
                    padding: "15px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      background: "#3b82f6",
                      padding: "6px 12px",
                      borderRadius: "20px",
                    }}
                  >
                    {incident.type || "Unknown"}
                  </span>
                </td>

                <td
                  style={{
                    padding: "15px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      color: "white",
                      background:
                        (incident.confidence || 0) > 0.9
                          ? "green"
                          : (incident.confidence || 0) > 0.7
                          ? "orange"
                          : "red",
                    }}
                  >
                    {Number(
                      incident.confidence || 0
                    ).toFixed(2)}
                  </span>
                </td>
                <td
  style={{
    padding: "15px",
    textAlign: "center",
  }}
>
  {incident.timestamp}
</td>

                <td
  style={{
    padding: "15px",
    textAlign: "center",
  }}
>
  <img
    src={incident.image}
    alt="incident"
    onClick={() =>
      setSelectedImage(
incident.image
)
    }
    style={{
      width: "90px",
      height: "70px",
      objectFit: "cover",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  />
</td>
                <td
  style={{
    padding: "15px",
    textAlign: "center",
  }}
>
  <button
    onClick={() =>
      deleteIncident(incident.id)
    }
    style={{
      background: "#dc2626",
      color: "white",
      border: "none",
      padding: "8px 14px",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Delete
  </button>
</td>
              </tr>
            ))}
        </tbody>
      </table>
      {selectedImage && (
  <div
    onClick={() => setSelectedImage(null)}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
<td>
  <img
    src={incident.image}
    alt="incident"
    width="120"
    height="90"
  />
</td>
  </div>
)}
    </div>
    </>
  );
}
export default App;