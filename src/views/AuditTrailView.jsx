import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  History, ShieldCheck, Search, Filter, 
  FileText, ArrowRight, UserCheck 
} from "lucide-react";

export default function AuditTrailView() {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.applicationId?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.actorUid?.toLowerCase().includes(search.toLowerCase()) ||
      log.reason?.toLowerCase().includes(search.toLowerCase());

    if (filterRole === "ALL") return matchesSearch;
    return matchesSearch && log.actorRole === filterRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wide">
          <History className="w-4 h-4" />
          <span>Statutory Scrutiny Immutable Event Ledger</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-1">
          System Audit Trail & Compliance Verification Logs
        </h2>
        <p className="text-xs text-slate-500">
          Complete, tamper-evident chronological record of all application submissions, stage transitions, deficiency notices, reviewer observations, and time simulation events.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, application ID, actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500">Filter Role:</span>
          {["ALL", "College Admin", "Reviewer", "Bureau Officer"].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterRole === role ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Log ID & Timestamp</th>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Transition</th>
                <th className="py-3 px-4">Observation / Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.logId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-700">{log.logId}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-indigo-700">
                    {log.applicationId}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{log.actorRole}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {log.actorUid}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-[11px] text-slate-500">
                      From: <span className="text-slate-700 font-medium">{log.previousStatus || "N/A"}</span>
                    </div>
                    <div className="text-[11px] text-slate-900 font-semibold flex items-center">
                      <ArrowRight className="w-3 h-3 text-indigo-500 mr-1" />
                      {log.newStatus}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 max-w-xs text-[11px] leading-relaxed">
                    {log.reason || "Automatic system state transition"}
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
