import React from "react";
import { useApp } from "../context/AppContext";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from "recharts";
import { BarChart3, TrendingUp, ShieldCheck, PieChart as PieIcon } from "lucide-react";

export default function ReportsView() {
  const { applications, documents, simulatedDate } = useApp();

  // Stage distribution
  const stageCounts = applications.reduce((acc, app) => {
    const stg = app.currentStage;
    acc[stg] = (acc[stg] || 0) + 1;
    return acc;
  }, {});

  const stageData = Object.keys(stageCounts).map(key => ({
    name: key.length > 18 ? key.slice(0, 16) + "..." : key,
    count: stageCounts[key]
  }));

  // Route distribution
  const routeCounts = applications.reduce((acc, app) => {
    const route = app.processingRoute || "Standard";
    acc[route] = (acc[route] || 0) + 1;
    return acc;
  }, {});

  const routeData = Object.keys(routeCounts).map(key => ({
    name: key,
    value: routeCounts[key]
  }));

  // Regional breakdown
  const regionalPerformance = [
    { region: "Western", applications: 12, avgDays: 8.4, complianceRate: 94 },
    { region: "Northern", applications: 8, avgDays: 11.2, complianceRate: 88 },
    { region: "Southern", applications: 14, avgDays: 7.9, complianceRate: 96 },
    { region: "Eastern", applications: 5, avgDays: 13.5, complianceRate: 82 },
    { region: "South-West", applications: 7, avgDays: 9.1, complianceRate: 91 }
  ];

  // Document health
  const today = new Date(simulatedDate);
  let validDocs = 0;
  let expiringSoonDocs = 0;
  let expiredDocs = 0;

  documents.forEach(d => {
    if (!d.expiryDate) {
      validDocs++;
    } else {
      const diff = Math.ceil((new Date(d.expiryDate) - today) / (1000 * 60 * 60 * 24));
      if (diff < 0) expiredDocs++;
      else if (diff <= 30) expiringSoonDocs++;
      else validDocs++;
    }
  });

  const docHealthData = [
    { name: "Compliant & Valid", value: validDocs, color: "#10b981" },
    { name: "Expiring (<30d)", value: expiringSoonDocs, color: "#f59e0b" },
    { name: "Expired / Deficient", value: expiredDocs, color: "#ef4444" }
  ];

  const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wide">
          <BarChart3 className="w-4 h-4" />
          <span>Statutory Executive Analytics & Regional Performance</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-1">
          National AICTE Approval Pipeline Visualizations
        </h2>
        <p className="text-xs text-slate-500">
          Consolidated real-time business intelligence for approval processing velocity, statutory scrutiny bottlenecks, and document compliance rates.
        </p>
      </div>

      {/* Top 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            Applications by Scrutiny Stage
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Validity Donut */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            National Document Health &amp; Expiry Surveillance
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={docHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {docHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Regional Performance Table & Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Regional Bureau Scrutiny Latency &amp; Compliance Scores
        </h3>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionalPerformance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="region" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" tick={{ fontSize: 10 }} label={{ value: 'Avg Days', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 10 }} label={{ value: 'Compliance %', angle: 90, position: 'insideRight', fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="avgDays" name="Avg Scrutiny Days" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="complianceRate" name="Compliance Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
