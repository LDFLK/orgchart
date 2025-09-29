// XploreDataHomepage.jsx
import React, { useEffect, useState } from "react";
import {
  Clock, TrendingUp, BarChart3, LineChart, PieChart as PieIcon, Activity,
  Database, Calendar, GitBranch, Eye, ChevronRight, Users,
  Building2, Layers, Target, Zap, Code, Globe
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

/**
 * Full monolithic XploreDataHomepage.jsx
 * - All components and mock data in one file
 * - Fixed duplicate export/import issues
 * - Props passed correctly: activeYear & setActiveYear where needed
 */

/* ===========================
   Mock / real-like data
   =========================== */

const timeSeriesData = [
  { year: "2019", budgetAllocation: 300, revenue: 450, growthRate: 2.1 },
  { year: "2020", budgetAllocation: 280, revenue: 380, growthRate: 1.8 },
  { year: "2021", budgetAllocation: 375, revenue: 400, growthRate: 2.5 },
  { year: "2022", budgetAllocation: 410, revenue: 440, growthRate: 2.8 },
  { year: "2023", budgetAllocation: 450, revenue: 500, growthRate: 3.2 }
];

const departments = ["Tourism", "Education", "Healthcare", "Infrastructure", "Defense", "Agriculture"];
const statTypes = ["Budget Allocation", "Budget Deficit/Surplus", "Expenditure", "Revenue", "Growth Rate", "Visitors by Country"];

const departmentData = [
  { name: "Tourism", datasets: 6, trend: 15, color: "#3B82F6" },
  { name: "Education", datasets: 5, trend: 8, color: "#10B981" },
  { name: "Healthcare", datasets: 4, trend: 12, color: "#8B5CF6" },
  { name: "Infrastructure", datasets: 5, trend: 6, color: "#F59E0B" },
  { name: "Defense", datasets: 4, trend: -2, color: "#EF4444" },
  { name: "Agriculture", datasets: 5, trend: 10, color: "#06B6D4" }
];

const visitorsData = [
  { name: "India", value: 123004, year: 2023 },
  { name: "Russian Federation", value: 91272, year: 2023 },
  { name: "United Kingdom", value: 85187, year: 2023 },
  { name: "Germany", value: 55542, year: 2023 },
  { name: "France", value: 35482, year: 2023 },
  { name: "Australia", value: 30924, year: 2023 },
  { name: "Canada", value: 26845, year: 2023 },
  { name: "United States", value: 22230, year: 2023 }
];

/* ===========================
   DataTimeline component
   - shows years, mini-charts, progress bar
   - receives activeYear and setActiveYear
   =========================== */

const DataTimeline = ({ activeYear, setActiveYear }) => {
  // auto-cycle years for demo
  useEffect(() => {
    const years = [2019, 2020, 2021, 2022, 2023];
    let idx = years.indexOf(activeYear) === -1 ? years.length - 1 : years.indexOf(activeYear);
    const t = setInterval(() => {
      idx = (idx + 1) % years.length;
      setActiveYear(years[idx]);
    }, 4500);
    return () => clearInterval(t);
  }, [activeYear, setActiveYear]);

  const years = [2019, 2020, 2021, 2022, 2023];

  return (
    <div className="relative p-4">
      {/* subtle grid background */}
      <div className="absolute inset-0 opacity-6 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id="timelineGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f172a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#timelineGrid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-end mb-6">
          {years.map((year) => {
            const isActive = year === activeYear;
            const miniData = [12, 18, 15, 22, 8]; // placeholder spark data
            return (
              <div
                key={year}
                className={`flex flex-col items-center transition-all duration-500 cursor-pointer select-none ${isActive ? "scale-110" : "opacity-80 hover:scale-105"}`}
                onClick={() => setActiveYear(year)}
              >
                <svg width="56" height="44" className="mb-2 overflow-visible">
                  <defs>
                    <linearGradient id={`g-${year}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isActive ? "#06B6D4" : "#475569"} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={isActive ? "#0891B2" : "#334155"} stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  {/* bars */}
                  {miniData.map((h, i) => (
                    <rect key={i} x={i * 8} y={30 - h} width="6" height={h} fill={`url(#g-${year})`} rx="1" />
                  ))}
                  <path d="M2,16 L9,9 L16,12 L23,6 L30,20" stroke={isActive ? "#06B6D4" : "#475569"} strokeWidth="1.5" fill="none" />
                </svg>

                <div className={`w-6 h-6 rounded-full mb-2 ${isActive ? "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg" : "bg-slate-600"}`} />

                <div className={`text-sm ${isActive ? "text-white font-bold" : "text-slate-400"}`}>
                  {year}
                </div>

                <div className={`text-xs ${isActive ? "text-cyan-400" : "text-slate-500"}`}>
                  {timeSeriesData.find(d => parseInt(d.year) === year)?.budgetAllocation || 0}M
                </div>
              </div>
            );
          })}
        </div>

        {/* progress line */}
        <div className="relative h-2 bg-slate-700 rounded-full mx-4">
          <div
            className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
            style={{ width: `${((activeYear - 2019) / (2023 - 2019)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/* ===========================
   InteractiveChart component
   - receives activeYear
   - metric toggles, trend chart
   =========================== */

const InteractiveChart = ({ activeYear }) => {
  const [activeMetric, setActiveMetric] = useState("budgetAllocation");

  const metrics = {
    budgetAllocation: { color: "#10B981", name: "Budget Allocation", unit: "M" },
    revenue: { color: "#3B82F6", name: "Revenue", unit: "M" },
    growthRate: { color: "#8B5CF6", name: "Growth Rate", unit: "%" }
  };

  // trendData = last 3 years up to activeYear
  const trendData = timeSeriesData
    .filter(d => parseInt(d.year) <= (activeYear || 2023))
    .slice(-3)
    .map(d => ({ year: d.year, value: d[activeMetric] || 0 }));

  const currentYearData = timeSeriesData.find(d => parseInt(d.year) === activeYear) || timeSeriesData[timeSeriesData.length - 1];

  const metric = metrics[activeMetric];

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(metrics).map(([key, m]) => (
          <button
            key={key}
            onClick={() => setActiveMetric(key)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden ${activeMetric === key ? "shadow-lg scale-105 bg-gradient-to-r from-emerald-500 to-green-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
          >
            {activeMetric === key && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
            <div className="relative z-10 flex items-center space-x-2">
              <div style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: m.color }} />
              <span>{m.name}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <div className="inline-block">
          <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {currentYearData[activeMetric] || 0}
            <span className="text-2xl ml-2">{metric.unit}</span>
          </div>
          <div className="text-slate-400 mt-1">{metric.name} in {activeYear}</div>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={metric.color} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
            <XAxis dataKey="year" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: 8, border: `1px solid ${metric.color}`, color: "#fff" }} formatter={(v) => [`${v}${metric.unit}`, metric.name]} />
            <Area type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2} fill="url(#metricGradient)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ===========================
   DataNode component (small reusable card)
   =========================== */

const DataNodeCard = ({ title, description, Icon, color = "cyan" }) => {
  return (
    <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 transition-all duration-300 hover:scale-105">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}10` }}>
          {Icon && <Icon className="w-6 h-6 text-cyan-400" />}
        </div>
        <div>
          <h4 className="text-lg font-bold">{title}</h4>
          <div className="text-sm text-slate-400">{description}</div>
        </div>
      </div>
    </div>
  );
};

/* ===========================
   NetworkGraph component
   - shows nodes and connecting lines
   - receives activeYear
   =========================== */

const DataNode = ({ x, y, value, label, color, isActive }) => (
  <div
    className={`absolute transition-all duration-300 ${isActive ? "scale-110 z-20" : "scale-100"}`}
    style={{
      left: `${x}%`,
      top: `${y}%`,
      transform: "translate(-50%, -50%)"
    }}
    title={`${label}: ${value}`}
  >
    <div
      className={`rounded-full border-2`}
      style={{
        width: `${Math.max(24, value / 4)}px`,
        height: `${Math.max(24, value / 4)}px`,
        backgroundColor: color,
        borderColor: "#0f172a",
        boxShadow: `0 0 ${isActive ? "22px" : "10px"} ${color}60`
      }}
    />
    {isActive && (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs">
        {label}: {value}
      </div>
    )}
  </div>
);

const NetworkGraph = ({ activeYear }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
    { id: 1, x: 20, y: 30, value: 150, label: "Tourism", color: "#3B82F6" },
    { id: 2, x: 40, y: 20, value: 120, label: "Education", color: "#10B981" },
    { id: 3, x: 60, y: 45, value: 90, label: "Healthcare", color: "#8B5CF6" },
    { id: 4, x: 30, y: 70, value: 110, label: "Infrastructure", color: "#F59E0B" },
    { id: 5, x: 70, y: 25, value: 80, label: "Defense", color: "#EF4444" },
    { id: 6, x: 50, y: 60, value: 100, label: "Agriculture", color: "#06B6D4" }
  ];

  const connections = [
    { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
    { from: 4, to: 5 }, { from: 5, to: 6 }, { from: 6, to: 1 },
    { from: 1, to: 4 }, { from: 2, to: 5 }, { from: 3, to: 6 }
  ];

  return (
    <div className="relative h-56 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden border border-slate-700 p-4">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((c, idx) => {
          const f = nodes.find(n => n.id === c.from);
          const t = nodes.find(n => n.id === c.to);
          if (!f || !t) return null;
          return (
            <line
              key={idx}
              x1={`${f.x}%`}
              y1={`${f.y}%`}
              x2={`${t.x}%`}
              y2={`${t.y}%`}
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.9"
            />
          );
        })}
      </svg>

      {nodes.map(n => (
        <DataNode
          key={n.id}
          {...n}
          isActive={hoveredNode === n.id}
          value={n.value + (activeYear - 2019) * 8}
        />
      ))}

      <div className="absolute inset-0">
        {nodes.map(n => (
          <div
            key={`overlay-${n.id}`}
            className="absolute"
            style={{
              left: `${n.x - 6}%`,
              top: `${n.y - 6}%`,
              width: "12%",
              height: "12%",
            }}
            onMouseEnter={() => setHoveredNode(n.id)}
            onMouseLeave={() => setHoveredNode(null)}
          />
        ))}
      </div>

      <div className="absolute bottom-2 right-2 text-xs text-slate-400 bg-slate-900/70 px-2 py-1 rounded">
        Interactive Network • {activeYear}
      </div>
    </div>
  );
};

/* ===========================
   Full homepage component (single export)
   =========================== */

export default function XploreDataHomepage() {
  const [activeYear, setActiveYear] = useState(2023);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-x-hidden relative">
      {/* Enhanced background with gradients and tiny floating points */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400/10 to-blue-400/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-gradient-to-br from-green-400/10 to-teal-400/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full">
            <defs>
              <pattern id="dataGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#06B6D4" strokeWidth="1"/>
                <circle cx="20" cy="20" r="1" fill="#06B6D4"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dataGrid)" />
          </svg>
        </div>

        {[...Array(18)].map((_, i) => (
          <div
            key={`float-${i}`}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30 animate-ping"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              animationDelay: `${i * 0.25}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold">
                  Xplore<span className="ml-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Data</span>
                </h1>
                <div className="text-sm text-slate-400 mt-1">A Deep Dive into Sri Lanka's public datasets as timeseries</div>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800/50 border border-cyan-400/30 text-sm text-cyan-400">
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Live Demo Mode
                </div>
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg text-white">Sign in</button>
              </div>
            </div>
          </header>

          {/* Hero */}
          <section className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-slate-800/60 border border-cyan-400/30 text-sm text-cyan-400 mb-6">
              <Code className="w-4 h-4 mr-2" />
              Powered by OpenGIN
              <Globe className="w-4 h-4 ml-2" />
            </div>

            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                XploreData
              </span>
            </h2>

            <p className="text-lg text-slate-300 mb-6">Visualize Data Through Time — explore trends, compare sectors, and dive deep into the numbers.</p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 mb-3 rounded-lg flex items-center justify-center bg-cyan-900/30">
                  <Database className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="font-bold mb-2">Why</h4>
                <p className="text-slate-400 text-sm">Rendering aspects of life in Sri Lanka through public datasets as timeseries.</p>
              </div>

              <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 mb-3 rounded-lg flex items-center justify-center bg-purple-900/30">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="font-bold mb-2">What</h4>
                <p className="text-slate-400 text-sm">Vivid visualization methods for government datasets and time-series analysis.</p>
              </div>

              <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 mb-3 rounded-lg flex items-center justify-center bg-green-900/30">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="font-bold mb-2">How</h4>
                <p className="text-slate-400 text-sm">Connected datasets with interactive visualizations, filtering and timeline control.</p>
              </div>
            </div>
          </section>

          {/* main two-column area */}
          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* left: timeseries card */}
            <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-cyan-900/30">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Timeseries Data Analysis</h3>
                    <div className="text-sm text-slate-400">Track changes across years and datasets</div>
                  </div>
                </div>

                <div className="text-sm text-slate-400">Year: <span className="text-white ml-1">{activeYear}</span></div>
              </div>

              <DataTimeline activeYear={activeYear} setActiveYear={setActiveYear} />

              <div className="mt-6">
                <InteractiveChart activeYear={activeYear} />
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center p-3 rounded-lg bg-blue-950/20 border-l-4 border-blue-400">
                  <Calendar className="w-4 h-4 text-blue-400 mr-3" />
                  <span className="text-sm text-slate-300">Multi-year trend analysis</span>
                </div>
                <div className="flex items-center p-3 rounded-lg bg-purple-950/20 border-l-4 border-purple-400">
                  <GitBranch className="w-4 h-4 text-purple-400 mr-3" />
                  <span className="text-sm text-slate-300">Dataset evolution tracking</span>
                </div>
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-cyan-400 hover:to-blue-500 transition">
                <LineChart className="w-4 h-4" />
                <span>Explore Timeline</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* right: dataset visualizations */}
            <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-purple-900/30">
                    <Layers className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Dataset Visualizations</h3>
                    <div className="text-sm text-slate-400">Interactive charts and networks</div>
                  </div>
                </div>

                <div className="text-sm text-slate-400">Sectors: {departments.length}</div>
              </div>

              <NetworkGraph activeYear={activeYear} />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataNodeCard Icon={Building2} title="Government Data" description="Official datasets aggregated and visualized." color="cyan" />
                <DataNodeCard Icon={Target} title="Sector Analysis" description="Breakdowns by sector, trends and comparisons." color="purple" />
                <DataNodeCard Icon={Users} title="Visitors Insight" description="Tourism data and exports analysis." color="green" />
                <DataNodeCard Icon={Database} title="Data Sources" description="Public APIs and open data portals." color="teal" />
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-purple-400 hover:to-pink-500 transition">
                <Eye className="w-4 h-4" />
                <span>View Datasets</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </main>

          {/* stats */}
          <section className="mt-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold">Data at a <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Glance</span></h3>
              <p className="text-slate-400 max-w-2xl mx-auto mt-2">Explore the breadth and depth of Sri Lankan public data through our comprehensive platform</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gray-900/50 rounded-xl p-6 text-center border border-gray-700/30">
                <div className="text-3xl font-bold text-cyan-400 mb-2">{statTypes.length}</div>
                <div className="text-sm text-slate-400">Statistics Types</div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 text-center border border-gray-700/30">
                <div className="text-3xl font-bold text-purple-400 mb-2">{departments.length}</div>
                <div className="text-sm text-slate-400">Government Departments</div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 text-center border border-gray-700/30">
                <div className="text-3xl font-bold text-green-400 mb-2">{timeSeriesData.length}</div>
                <div className="text-sm text-slate-400">Years of Data</div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 text-center border border-gray-700/30">
                <div className="text-3xl font-bold text-blue-400 mb-2">{visitorsData.length}+</div>
                <div className="text-sm text-slate-400">Countries Tracked</div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center mt-12 mb-24">
            <h3 className="text-4xl font-bold mb-4">Start Exploring <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Today</span></h3>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8">Dive deep into Sri Lanka's data landscape and discover insights that matter.</p>

            <button className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition transform inline-flex items-center space-x-3">
              <Zap className="w-6 h-6" />
              <span>Launch XploreData</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}
