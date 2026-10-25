import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  ShieldCheck, FileCheck, AlertTriangle, Clock, 
  Calendar, CheckCircle, ArrowRight, Search, Filter, 
  ExternalLink, Eye
} from "lucide-react";

export default function ReviewerDashboard({ onSelectApp }) {
  const { currentUser, applications, documents, simulatedDate } = useApp();

  const [filterStage, setFilterStage] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Reviewer queue
  const reviewerApps = applications.filter(a => {
    const matchesQuery = 
      a.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.institutionName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStage === "ALL") return matchesQuery;
    if (filterStage === "SCRUTINY") return matchesQuery && (a.currentStage.includes("Scrutiny") || a.currentStage.includes("Pre-Screening"));
    if (filterStage === "DEFICIENT") return matchesQuery && a.currentStage === "Deficiency Raised";
    if (filterStage === "EVC") return matchesQuery && a.currentStage.includes("EVC");
    return matchesQuery;
  });

  const pendingScrutinyCount = applications.filter(a => 
    a.currentStage === "Scrutiny In Progress" || a.currentStage === "Automated Pre-Screening"
  ).length;

  const awaitingCorrectionCount = applications.filter(a => a.currentStage === "Deficiency Raised").length;
  const pendingEvcCount = applications.filter(a => a.currentStage === "Pending EVC" || a.currentStage === "EVC Scheduled").length;

  return (
    <div className="space-y-6">
      {/* Reviewer Header */}
      <div className="bg-linear-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Scrutiny Committee &bull; {currentUser.assignedRegion || "Western Region"}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Scrutiny Officer Workdesk &bull; {currentUser.displayName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Review uploaded institutional documents, inspect OCR pre-screening extraction scores, verify building and fire safety norms, and advance processing stages.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-purple-950/60 p-2.5 rounded-xl border border-purple-700/60 text-xs">
          <Clock className="w-4 h-4 text-purple-300" />
          <span className="text-slate-300">Simulated Date:</span>
          <strong className="text-white font-mono bg-purple-900 px-2 py-0.5 rounded">{simulatedDate}</strong>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setFilterStage("SCRUTINY")}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterStage === "SCRUTINY" 
              ? "bg-purple-50/70 border-purple-500 shadow-xs" 
              : "bg-white border-slate-200 hover:border-purple-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Scrutiny</span>
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              {pendingScrutinyCount}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{pendingScrutinyCount}</div>
          <div className="text-[11px] text-purple-600 mt-1">Requires official scrutiny verification</div>
        </div>

        <div 
          onClick={() => setFilterStage("DEFICIENT")}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterStage === "DEFICIENT" 
              ? "bg-amber-50/70 border-amber-500 shadow-xs" 
              : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Deficiencies Raised</span>
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              {awaitingCorrectionCount}
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{awaitingCorrectionCount}</div>
          <div className="text-[11px] text-amber-700 mt-1">7-Day institutional correction period</div>
        </div>

        <div 
          onClick={() => setFilterStage("EVC")}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterStage === "EVC" 
              ? "bg-indigo-50/70 border-indigo-500 shadow-xs" 
              : "bg-white border-slate-200 hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending / Scheduled EVC</span>
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              {pendingEvcCount}
            </span>
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{pendingEvcCount}</div>
          <div className="text-[11px] text-indigo-600 mt-1">Expert Committee site inspections</div>
        </div>
      </div>

      {/* Scrutiny Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Institution or App ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-400 outline-none w-64"
              />
            </div>
            <button
              onClick={() => setFilterStage("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStage === "ALL" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Active Scrutiny Queue &bull; <strong>{reviewerApps.length}</strong> Dossiers
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Deadline Status</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reviewerApps.map((app) => (
                <tr key={app.applicationId} className="hover:bg-purple-50/30 transition">
                  <td className="py-3 px-4 font-mono font-bold text-purple-700">
                    {app.applicationId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{app.institutionName}</div>
                    <div className="text-[11px] text-slate-400">{app.applicationType}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      app.currentStage === "Deficiency Raised"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : app.currentStage.includes("EVC")
                          ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                          : "bg-purple-100 text-purple-800 border-purple-300"
                    }`}>
                      {app.currentStage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {app.processingRoute}
                  </td>
                  <td className="py-3 px-4">
                    {app.currentStage === "Deficiency Raised" && app.correctionDeadline ? (
                      <span className="text-amber-700 font-bold flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Due: {app.correctionDeadline.split("T")[0]}
                      </span>
                    ) : app.stageDeadline ? (
                      <span className="text-slate-600 font-mono">
                        {app.stageDeadline.split("T")[0]}
                      </span>
                    ) : (
                      "Normal"
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectApp(app)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold inline-flex items-center space-x-1 cursor-pointer transition shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Conduct Scrutiny</span>
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
