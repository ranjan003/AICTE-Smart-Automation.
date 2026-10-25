import React from "react";
import { useApp } from "../context/AppContext";
import { 
  Building2, FileText, CheckCircle, Clock, AlertTriangle, 
  PlusCircle, FolderCheck, ArrowRight, ShieldCheck, HelpCircle
} from "lucide-react";

export default function CollegeDashboard({ onSelectApp, onNavigate }) {
  const { currentUser, applications, documents, simulatedDate } = useApp();

  // Filter applications for this college
  const myApps = applications.filter(a => 
    a.institutionEmail === currentUser.email || a.institutionId === currentUser.institutionId || true // show demo apps
  );

  const activeApp = myApps[0];
  const deficientApps = myApps.filter(a => a.currentStage === "Deficiency Raised");
  const approvedApps = myApps.filter(a => a.currentStage === "Approved by Authorised Authority");

  // Document validity stats
  const expiredDocs = documents.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date(simulatedDate));
  const expiringSoonDocs = documents.filter(d => {
    if (!d.expiryDate) return false;
    const diff = Math.ceil((new Date(d.expiryDate) - new Date(simulatedDate)) / (1000 * 60 * 60 * 24));
    return diff > 0 && diff <= 30;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Institutional Portal Desk &bull; {currentUser.institutionName}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Welcome, {currentUser.displayName}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Track your institution's AICTE approval applications, upload mandatory statutory certificates, monitor validity deadlines, and submit compliance rectifications.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate("new-application")}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">My Applications</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{myApps.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Under AICTE processing</div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Under Scrutiny / EVC</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">
            {myApps.filter(a => a.currentStage.includes("Scrutiny") || a.currentStage.includes("EVC")).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pending committee review</div>
        </div>

        {/* Deficiencies Raised */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Deficiencies Flagged</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{deficientApps.length}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">Awaiting College Rectification</div>
        </div>

        {/* Expired / Critical Docs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Certificate Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <FolderCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">
            {expiredDocs.length + expiringSoonDocs.length}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">
            {expiredDocs.length} expired &bull; {expiringSoonDocs.length} expiring &lt;30d
          </div>
        </div>
      </div>

      {/* Deficiency Urgent Banner if any */}
      {deficientApps.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Action Required: Statutory Scrutiny Deficiency Flagged
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  The scrutiny committee raised deficiencies for Application <strong>{deficientApps[0].applicationId}</strong>.
                  Please submit compliance evidence before deadline <strong>{deficientApps[0].correctionDeadline?.split("T")[0] || "within 7 days"}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectApp(deficientApps[0])}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs cursor-pointer transition shrink-0"
            >
              Rectify Now
            </button>
          </div>
        </div>
      )}

      {/* Active Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Institutional Application Dossiers</h3>
            <p className="text-xs text-slate-500">Track stage progress, assigned scrutiny officer, and deadlines</p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Showing {myApps.length} applications
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Type & Details</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Assigned Reviewer</th>
                <th className="py-3 px-4">Stage Deadline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {myApps.map((app) => (
                <tr key={app.applicationId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {app.applicationId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{app.applicationType}</div>
                    <div className="text-[11px] text-slate-400">Route: {app.processingRoute}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      app.currentStage === "Approved by Authorised Authority"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : app.currentStage === "Deficiency Raised"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}>
                      {app.currentStage}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800">{app.assignedReviewerName || "Regional Scrutiny Committee"}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    {app.stageDeadline ? app.stageDeadline.split("T")[0] : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectApp(app)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>View Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
