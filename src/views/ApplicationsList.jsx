import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  FileText, Search, Filter, ArrowRight, PlusCircle, 
  Clock, ShieldCheck, AlertTriangle 
} from "lucide-react";

export default function ApplicationsList({ onSelectApp, onNavigate }) {
  const { applications, currentUser } = useApp();

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [regionFilter, setRegionFilter] = useState("ALL");

  const filteredApps = applications.filter(a => {
    const matchesSearch = 
      a.applicationId.toLowerCase().includes(search.toLowerCase()) ||
      a.institutionName.toLowerCase().includes(search.toLowerCase()) ||
      a.registrationNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStage = stageFilter === "ALL" || a.currentStage === stageFilter;
    const matchesRegion = regionFilter === "ALL" || a.region === regionFilter;

    return matchesSearch && matchesStage && matchesRegion;
  });

  const uniqueStages = ["ALL", ...new Set(applications.map(a => a.currentStage))];
  const uniqueRegions = ["ALL", "Western", "Northern", "Southern", "Eastern", "Central"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wide">
            <FileText className="w-4 h-4" />
            <span>AICTE National Approval Registry</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Application Dossiers &amp; Processing Registry
          </h2>
          <p className="text-xs text-slate-500">
            Search, filter by regulatory scrutiny stage, inspect institutional documents, and track compliance milestones.
          </p>
        </div>

        {currentUser.role === "College Admin" && (
          <button
            onClick={() => onNavigate("new-application")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Application</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Institution, ID, or Reg No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500 text-[11px]">Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white outline-none"
            >
              {uniqueStages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-500 text-[11px]">Region:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white outline-none"
            >
              {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {(stageFilter !== "ALL" || regionFilter !== "ALL" || search) && (
            <button
              onClick={() => { setStageFilter("ALL"); setRegionFilter("ALL"); setSearch(""); }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 text-xs"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Processing Route</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Status &amp; Deadlines</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching applications found.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {app.applicationId}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{app.institutionName}</div>
                      <div className="text-[11px] text-slate-400">{app.applicationType}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                        {app.region}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {app.processingRoute}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        app.currentStage === "Approved by Authorised Authority"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : app.currentStage === "Deficiency Raised"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}>
                        {app.currentStage}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {app.correctionDeadline ? (
                        <span className="text-amber-700 font-bold flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Correction: {app.correctionDeadline.split("T")[0]}
                        </span>
                      ) : app.stageDeadline ? (
                        <span className="text-slate-600">
                          Due: {app.stageDeadline.split("T")[0]}
                        </span>
                      ) : (
                        "Normal"
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectApp(app)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Inspect File</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
