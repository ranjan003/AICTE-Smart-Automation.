import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  X, CheckCircle, AlertTriangle, Clock, Calendar, 
  FileText, ShieldCheck, ArrowRight, UserCheck, 
  Send, ExternalLink, HelpCircle
} from "lucide-react";
import { reviewApplicationStage, submitComplianceCorrection } from "../services/api";

export default function ApplicationDetailModal({ application, isOpen, onClose }) {
  const { currentUser, documents, setApplications } = useApp();

  const [reviewNotes, setReviewNotes] = useState("");
  const [deficiencyReason, setDeficiencyReason] = useState("");
  const [evcDate, setEvcDate] = useState("");
  const [complianceText, setComplianceText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen || !application) return null;

  // Filter documents belonging to this application
  const appDocs = documents.filter(d => d.applicationId === application.applicationId);

  // Stages in sequence
  const stagesOrder = [
    "Submitted",
    "Automated Pre-Screening",
    "Scrutiny In Progress",
    application.processingRoute?.includes("EVC") ? "Pending EVC" : null,
    application.processingRoute?.includes("EVC") ? "EVC Scheduled" : null,
    application.processingRoute?.includes("SAC/SHC") ? "Pending SAC/SHC" : null,
    "Final Review",
    "Approved by Authorised Authority"
  ].filter(Boolean);

  const currentStageIndex = stagesOrder.indexOf(application.currentStage);

  const handleReviewAction = async (action) => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const extra = {};
      let notes = reviewNotes;

      if (action === "RAISE_DEFICIENCY") {
        if (!deficiencyReason) {
          alert("Please provide the deficiency reason.");
          setIsSubmitting(false);
          return;
        }
        notes = deficiencyReason;
      }

      if (action === "SCHEDULE_EVC") {
        if (!evcDate) {
          alert("Please pick an EVC inspection date.");
          setIsSubmitting(false);
          return;
        }
        extra.evcDate = evcDate;
      }

      const res = await reviewApplicationStage(
        application.applicationId,
        application,
        action,
        notes,
        currentUser,
        extra
      );

      // Update local state
      setApplications(prev => prev.map(a => 
        a.applicationId === application.applicationId 
          ? { ...a, ...res.updates } 
          : a
      ));

      setStatusMessage({
        type: "success",
        text: `Action '${action}' recorded. Transitioned stage successfully.`
      });

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e) {
      setStatusMessage({
        type: "error",
        text: `Error performing review: ${e.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplianceSubmit = async () => {
    if (!complianceText) {
      alert("Please describe the rectification submitted.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitComplianceCorrection({
        applicationId: application.applicationId,
        institutionId: application.institutionId,
        undertakingDescription: complianceText,
        evidenceReference: `uploads/${application.institutionId}/rectified_evidence_${Date.now()}.pdf`
      }, currentUser);

      setApplications(prev => prev.map(a => 
        a.applicationId === application.applicationId
          ? { 
              ...a, 
              currentStage: "Resubmitted", 
              currentStatus: "Compliance Rectification Uploaded - Ready for Scrutiny",
              correctionDeadline: null
            }
          : a
      ));

      setStatusMessage({
        type: "success",
        text: "Compliance evidence submitted. Re-scrutiny initiated."
      });

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e) {
      setStatusMessage({ type: "error", text: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs border border-indigo-200">
                {application.applicationId}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                {application.region} Region
              </span>
              <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-200">
                Route: {application.processingRoute}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              {application.institutionName}
            </h2>
            <p className="text-xs text-slate-500">
              Registration: {application.registrationNumber} &bull; Type: {application.applicationType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-5 py-4 pr-1 grow text-xs">
          {/* Status and Escalation Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-slate-500 font-medium">Current Stage: </span>
              <span className="font-bold text-slate-900 ml-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                {application.currentStage}
              </span>
              <div className="text-slate-600 mt-0.5">
                Status: <strong>{application.currentStatus}</strong>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {application.escalationStatus && application.escalationStatus !== "Normal" && (
                <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full border border-rose-300 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  {application.escalationStatus}
                </span>
              )}
              {application.correctionDeadline && (
                <span className="bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded border border-amber-300 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Correction Due: {application.correctionDeadline.split("T")[0]}
                </span>
              )}
            </div>
          </div>

          {/* Timeline Pipeline */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Workflow Stage Progress:
            </div>
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 overflow-x-auto gap-2">
              {stagesOrder.map((stg, idx) => {
                const isPassed = currentStageIndex > idx;
                const isCurrent = application.currentStage === stg;
                return (
                  <div key={stg} className="flex items-center space-x-2 shrink-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isCurrent 
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-100" 
                          : isPassed 
                            ? "bg-emerald-500 text-white" 
                            : "bg-slate-200 text-slate-500"
                      }`}>
                        {isPassed ? "✓" : idx + 1}
                      </div>
                      <span className={`text-[10px] mt-1 font-medium text-center max-w-[70px] ${
                        isCurrent ? "text-indigo-700 font-bold" : "text-slate-600"
                      }`}>
                        {stg}
                      </span>
                    </div>
                    {idx < stagesOrder.length - 1 && (
                      <div className={`w-6 h-0.5 ${isPassed ? "bg-emerald-500" : "bg-slate-300"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Associated Documents with OCR Pre-Screening info */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Supporting Documents & Automated Pre-Screening ({appDocs.length}):
            </div>
            <div className="space-y-2">
              {appDocs.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-center">
                  No documents registered for this application.
                </div>
              ) : (
                appDocs.map((doc) => {
                  const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                  return (
                    <div
                      key={doc.documentId}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-slate-800">{doc.documentType}</span>
                          <span className="font-mono text-[10px] text-slate-400">({doc.documentId})</span>
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                          <span>Expiry: <strong className={isExpired ? "text-rose-600 font-bold" : "text-slate-700"}>
                            {doc.expiryDate || "Permanent / N/A"}
                          </strong></span>
                          <span>OCR Pre-Screening: <strong className="text-indigo-600">{doc.ocrStatus || "Processed"}</strong></span>
                        </div>
                        {doc.deficiencyReason && (
                          <div className="mt-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                            <strong>Deficiency:</strong> {doc.deficiencyReason}
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        isExpired 
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : doc.verificationStatus?.includes("Verified")
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}>
                        {doc.verificationStatus || "Pending Scrutiny"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Panel based on Role */}
          {/* 1. Reviewer Scrutiny Actions */}
          {currentUser.role === "Reviewer" && (
            <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 space-y-3">
              <div className="flex items-center space-x-2 text-purple-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>Authorized Reviewer Scrutiny Desk</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Scrutiny Observation Notes:
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record observations, building plan conformity, fire safety validation..."
                  className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => handleReviewAction("APPROVE_STAGE")}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center space-x-1 cursor-pointer transition shadow-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Approve Current Stage</span>
                </button>

                <button
                  onClick={() => {
                    const reason = prompt("Enter Deficiency Description for the College:");
                    if (reason) {
                      setDeficiencyReason(reason);
                      handleReviewAction("RAISE_DEFICIENCY");
                    }
                  }}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center space-x-1 cursor-pointer transition shadow-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  <span>Raise Deficiency (7-Day Clock)</span>
                </button>

                {application.currentStage === "Pending EVC" && (
                  <div className="flex items-center space-x-1">
                    <input
                      type="date"
                      value={evcDate}
                      onChange={(e) => setEvcDate(e.target.value)}
                      className="p-1.5 border border-purple-300 rounded text-xs bg-white"
                    />
                    <button
                      onClick={() => handleReviewAction("SCHEDULE_EVC")}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Schedule EVC Visit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. College Admin Rectification Action */}
          {currentUser.role === "College Admin" && application.currentStage === "Deficiency Raised" && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Submit Rectification & Compliance Evidence</span>
              </div>
              <p className="text-amber-800 text-[11px]">
                Your application has deficiencies flagged. Submit updated documents or undertaking before the deadline to resume scrutiny.
              </p>
              <textarea
                rows={2}
                value={complianceText}
                onChange={(e) => setComplianceText(e.target.value)}
                placeholder="Describe rectifications made (e.g., Attached renewed Fire Safety NOC valid till 2027)..."
                className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                onClick={handleComplianceSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center space-x-1 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                <span>Submit Compliance to Reopen Scrutiny</span>
              </button>
            </div>
          )}

          {/* 3. Bureau Officer Statutory Final Approval */}
          {currentUser.role === "Bureau Officer" && (
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Bureau Officer Statutory Final Action Desk</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                As authorized Bureau Officer, you hold final statutory authority to grant approval or reject following committee recommendations.
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReviewAction("FINAL_APPROVAL")}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Grant Statutory Approval
                </button>
                <button
                  onClick={() => {
                    const note = prompt("Enter Rejection Reason:");
                    if (note) {
                      setReviewNotes(note);
                      handleReviewAction("REJECT");
                    }
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Reject Application
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-2.5 rounded-lg text-xs font-semibold ${
              statusMessage.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}>
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            AICTE PS-26262 &bull; Statutory Scrutiny Automation
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
