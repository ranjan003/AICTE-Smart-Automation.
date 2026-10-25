import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  FolderCheck, FileText, AlertTriangle, CheckCircle, 
  Clock, ShieldAlert, Search, Filter, Calendar
} from "lucide-react";

export default function DocumentManagement() {
  const { documents, simulatedDate } = useApp();
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");

  const today = new Date(simulatedDate);

  // Categorize document statuses
  const evaluatedDocs = documents.map(d => {
    let validityStatus = "Permanent / No Expiry";
    let statusClass = "bg-slate-100 text-slate-700 border-slate-200";
    let daysRemaining = null;

    if (d.expiryDate) {
      const expDate = new Date(d.expiryDate);
      daysRemaining = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        validityStatus = `EXPIRED (${Math.abs(daysRemaining)}d ago)`;
        statusClass = "bg-rose-100 text-rose-800 border-rose-300 font-bold";
      } else if (daysRemaining <= 7) {
        validityStatus = `CRITICAL (${daysRemaining}d left)`;
        statusClass = "bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse";
      } else if (daysRemaining <= 30) {
        validityStatus = `Expiring Soon (${daysRemaining}d)`;
        statusClass = "bg-amber-100 text-amber-800 border-amber-300 font-semibold";
      } else {
        validityStatus = `Valid (${daysRemaining}d)`;
        statusClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
      }
    }

    return { ...d, validityStatus, statusClass, daysRemaining };
  });

  const filteredDocs = evaluatedDocs.filter(d => {
    const matchesSearch = 
      d.documentType.toLowerCase().includes(search.toLowerCase()) ||
      d.applicationId.toLowerCase().includes(search.toLowerCase());

    if (filterType === "EXPIRED") return matchesSearch && d.daysRemaining !== null && d.daysRemaining < 0;
    if (filterType === "CRITICAL") return matchesSearch && d.daysRemaining !== null && d.daysRemaining >= 0 && d.daysRemaining <= 30;
    if (filterType === "VALID") return matchesSearch && (d.daysRemaining === null || d.daysRemaining > 30);
    return matchesSearch;
  });

  const expiredCount = evaluatedDocs.filter(d => d.daysRemaining !== null && d.daysRemaining < 0).length;
  const criticalCount = evaluatedDocs.filter(d => d.daysRemaining !== null && d.daysRemaining >= 0 && d.daysRemaining <= 30).length;
  const validCount = evaluatedDocs.filter(d => d.daysRemaining === null || d.daysRemaining > 30).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wide">
            <FolderCheck className="w-4 h-4" />
            <span>AICTE Document Vault & Statutory Compliance Tracker</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Institutional Document Validity Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Surveillance of Fire NOCs, Building Completion Certificates, Structural Safety Certificates, and Land Leases evaluated against simulated date ({simulatedDate}).
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setFilterType("VALID")}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
              filterType === "VALID" ? "bg-emerald-600 text-white border-emerald-600" : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {validCount} Valid
          </button>
          <button
            onClick={() => setFilterType("CRITICAL")}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
              filterType === "CRITICAL" ? "bg-amber-600 text-white border-amber-600" : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {criticalCount} Expiring &lt;30d
          </button>
          <button
            onClick={() => setFilterType("EXPIRED")}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
              filterType === "EXPIRED" ? "bg-rose-600 text-white border-rose-600" : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {expiredCount} Expired
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents or application ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        <button
          onClick={() => setFilterType("ALL")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            filterType === "ALL" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Reset Filter (Showing {filteredDocs.length})
        </button>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.documentId}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs leading-tight">
                    {doc.documentType}
                  </h4>
                  <span className="font-mono text-[10px] text-slate-400">
                    App: {doc.applicationId}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] border ${doc.statusClass}`}>
                {doc.validityStatus}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span>Expiry Date:</span>
                <span className="font-mono font-bold text-slate-800">
                  {doc.expiryDate || "Permanent / N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>OCR Status:</span>
                <span className="font-semibold text-indigo-700">{doc.ocrStatus || "Processed"}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Verification:</span>
                <span className="font-semibold text-slate-700">{doc.verificationStatus}</span>
              </div>
            </div>

            {doc.deficiencyReason && (
              <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                <strong>Deficiency Note:</strong> {doc.deficiencyReason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
