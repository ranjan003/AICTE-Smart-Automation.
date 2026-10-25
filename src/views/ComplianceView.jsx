import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  AlertOctagon, CheckCircle, Clock, FileText, 
  Send, ShieldCheck, ArrowRight, Upload
} from "lucide-react";
import { submitComplianceCorrection } from "../services/api";

export default function ComplianceView({ onSelectApp }) {
  const { currentUser, applications, setApplications, simulatedDate } = useApp();

  const [activeDefApp, setActiveDefApp] = useState(null);
  const [rectificationText, setRectificationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deficient applications
  const deficientApps = applications.filter(a => a.currentStage === "Deficiency Raised");
  const resubmittedApps = applications.filter(a => a.currentStage === "Resubmitted");

  const handleQuickSubmit = async (app) => {
    if (!rectificationText) {
      alert("Please provide the compliance explanation.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitComplianceCorrection({
        applicationId: app.applicationId,
        institutionId: app.institutionId,
        undertakingDescription: rectificationText,
        evidenceReference: `uploads/${app.institutionId}/rectified_evidence_${Date.now()}.pdf`
      }, currentUser);

      setApplications(prev => prev.map(a => 
        a.applicationId === app.applicationId
          ? {
              ...a,
              currentStage: "Resubmitted",
              currentStatus: "Compliance Rectification Uploaded - Ready for Scrutiny",
              correctionDeadline: null
            }
          : a
      ));

      alert("Compliance submitted successfully. Status updated to Resubmitted.");
      setActiveDefApp(null);
      setRectificationText("");
    } catch (e) {
      alert(`Error submitting compliance: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wide">
          <AlertOctagon className="w-4 h-4" />
          <span>Statutory Compliance & Deficiency Resolution Portal</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-1">
          Deficiency Rectification & Undertaking Monitoring
        </h2>
        <p className="text-xs text-slate-500">
          When statutory deficiencies are raised during scrutiny, institutions must upload evidence within the 7-day compliance window. Unresolved deficiencies escalate to the Bureau Officer.
        </p>
      </div>

      {/* Grid of Active Deficiencies */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Active Deficiencies Pending College Action ({deficientApps.length})</span>
          <span className="text-slate-400 font-mono text-[11px]">System Date: {simulatedDate}</span>
        </div>

        {deficientApps.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No active deficiencies pending resolution!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All applications are either progressing through scrutiny or cleared.</p>
          </div>
        ) : (
          deficientApps.map((app) => {
            const isEditing = activeDefApp?.applicationId === app.applicationId;
            const deadline = app.correctionDeadline ? new Date(app.correctionDeadline) : null;
            const isOverdue = deadline && deadline < new Date(simulatedDate);

            return (
              <div
                key={app.applicationId}
                className="bg-white rounded-xl border border-amber-200 shadow-2xs p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                        {app.applicationId}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{app.institutionName}</h4>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {app.region} Region
                      </span>
                    </div>
                    <div className="text-xs text-amber-800 mt-1">
                      Reason: <strong>{app.currentStatus}</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center ${
                      isOverdue 
                        ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {isOverdue ? "CORRECTION OVERDUE - ESCALATED" : `Deadline: ${app.correctionDeadline?.split("T")[0]}`}
                    </span>
                  </div>
                </div>

                {/* Deficiency detail note */}
                <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200/80 text-xs text-amber-900 space-y-1">
                  <div className="font-semibold">Reviewer Scrutiny Observation:</div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Institutional documents uploaded failed fire safety / building plan compliance. Please obtain certified endorsement from the competent state authority and upload the renewed certificate.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => onSelectApp(app)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    View Application Timeline & Docs
                  </button>

                  {currentUser.role === "College Admin" ? (
                    <button
                      onClick={() => setActiveDefApp(isEditing ? null : app)}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                    >
                      {isEditing ? "Close Form" : "Upload Rectification Evidence"}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Awaiting college compliance submission
                    </span>
                  )}
                </div>

                {/* Rectification Form if open */}
                {isEditing && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3 animate-in fade-in">
                    <label className="block text-slate-700 font-semibold">
                      Describe Rectifications Made & Upload Reference:
                    </label>
                    <textarea
                      rows={3}
                      value={rectificationText}
                      onChange={(e) => setRectificationText(e.target.value)}
                      placeholder="e.g. Obtained renewed Fire Safety NOC No. FS/2026/884 from Pune Municipal Fire Brigade valid till 30-Aug-2027..."
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />

                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleQuickSubmit(app)}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        <span>{isSubmitting ? "Submitting..." : "Submit Rectification to n8n"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Resubmitted Applications */}
        {resubmittedApps.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recently Resubmitted & Awaiting Scrutiny Re-Check ({resubmittedApps.length})
            </div>
            {resubmittedApps.map(app => (
              <div key={app.applicationId} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-indigo-700">{app.applicationId}</span>
                  <span className="ml-2 font-semibold text-slate-800">{app.institutionName}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">{app.currentStatus}</div>
                </div>
                <button
                  onClick={() => onSelectApp(app)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Inspect Dossier
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
