import React from "react";
import { useApp } from "../context/AppContext";
import { 
  ShieldAlert, BarChart3, AlertOctagon, CheckCircle, 
  Clock, Users, FileText, ArrowRight, Zap, RefreshCw
} from "lucide-react";

export default function BureauDashboard({ onSelectApp, onNavigate, onOpenSimModal }) {
  const { currentUser, applications, documents, auditLogs, simulatedDate } = useApp();

  const totalApps = applications.length;
  const approvedCount = applications.filter(a => a.currentStage === "Approved by Authorised Authority").length;
  const underScrutinyCount = applications.filter(a => a.currentStage.includes("Scrutiny") || a.currentStage.includes("Pre-Screening")).length;
  const evcCount = applications.filter(a => a.currentStage.includes("EVC")).length;
  const deficientCount = applications.filter(a => a.currentStage === "Deficiency Raised").length;

  // Escalated cases
  const escalatedApps = applications.filter(a => a.escalationStatus && a.escalationStatus !== "Normal");

  // Expired documents
  const expiredDocs = documents.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date(simulatedDate));

  return (
    <div className="space-y-6">
      {/* Bureau Officer Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>AICTE Approval Bureau Executive Console &bull; Central Control</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Director / Member Secretary Command Desk &bull; {currentUser.displayName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time compliance surveillance, reviewer scrutiny latency monitoring, automated document-expiry tracking, and statutory escalation management.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSimModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition shadow-md cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate Time Progression</span>
          </button>
        </div>
      </div>

      {/* Top Level Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Total Applications</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalApps}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across All Regions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">In Scrutiny Queue</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{underScrutinyCount}</div>
          <div className="text-[11px] text-indigo-500 mt-0.5">Regional committees</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">EVC Stage</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{evcCount}</div>
          <div className="text-[11px] text-purple-500 mt-0.5">Site visits & inspections</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs bg-rose-50/30">
          <div className="text-xs font-semibold text-rose-700 flex items-center justify-between">
            <span>Escalated Cases</span>
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{escalatedApps.length}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Requires Bureau intervention</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/30">
          <div className="text-xs font-semibold text-emerald-700">Approved Dossiers</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Statutory approvals</div>
        </div>
      </div>

      {/* Escalation Emergency Panel if any */}
      {escalatedApps.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs uppercase tracking-wide mb-2">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>Urgent Bureau Alerts & Escalated Files ({escalatedApps.length})</span>
          </div>
          <div className="space-y-2">
            {escalatedApps.map((escApp) => (
              <div
                key={escApp.applicationId}
                className="bg-white p-3 rounded-lg border border-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-rose-700">{escApp.applicationId}</span>
                    <span className="font-bold text-slate-800">{escApp.institutionName}</span>
                    <span className="bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                      {escApp.escalationStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Current Status: {escApp.currentStatus} &bull; Route: {escApp.processingRoute}
                  </p>
                </div>
                <button
                  onClick={() => onSelectApp(escApp)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer shadow-2xs"
                >
                  Inspect & Take Statutory Action
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Queue & Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">National AICTE Scrutiny Pipeline</h3>
            <p className="text-xs text-slate-500">Live consolidated database across Western, Northern, and Southern Regional Bureaus</p>
          </div>
          <button
            onClick={() => onNavigate("reports")}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <span>View Full Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Escalation Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {applications.map((app) => (
                <tr key={app.applicationId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {app.applicationId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{app.institutionName}</div>
                    <div className="text-[11px] text-slate-400">{app.applicationType}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                      {app.region}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">{app.currentStage}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      app.escalationStatus && app.escalationStatus !== "Normal"
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {app.escalationStatus || "Normal"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectApp(app)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Inspect File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
