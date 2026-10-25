import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { submitApplication, uploadDocumentRecord } from "../services/api";
import { preScreenDocument } from "../services/ocrService";
import { 
  Building2, Upload, FileText, CheckCircle, AlertTriangle, 
  ArrowRight, ShieldCheck, Calendar, Sparkles, Send
} from "lucide-react";

export default function NewApplicationForm({ onNavigate, onSelectApp }) {
  const { currentUser, setApplications, setDocuments } = useApp();

  const [formData, setFormData] = useState({
    institutionName: currentUser.institutionName || "Imperial Institute of Science & Technology",
    registrationNumber: "AICTE/WRO/2026/1-994821",
    institutionEmail: currentUser.email || "director@imperialengg.ac.in",
    contactPerson: "Dr. Arvind Shrivastava (Director)",
    contactPhone: "+91 98230 11244",
    applicationType: "Extension of Approval (EoA) & New Course Addition",
    region: "Western",
    processingRoute: "Scrutiny followed by EVC",
    evcRequired: true,
    undertakingDescription: "Institutional declaration confirming strict adherence to AICTE Approval Process Handbook (APH 2026-27) norms regarding faculty ratio, laboratory equipment, and campus safety.",
    undertakingDueDate: "2026-12-31"
  });

  // Attached documents state
  const [docList, setDocList] = useState([
    {
      documentType: "Fire Safety Certificate",
      expiryDate: "2027-10-15",
      file: null,
      ocrResult: null,
      status: "Ready for Pre-Screening"
    },
    {
      documentType: "Occupancy or Building Completion Certificate",
      expiryDate: "2032-12-31",
      file: null,
      ocrResult: null,
      status: "Ready for Pre-Screening"
    },
    {
      documentType: "Structural Stability Certificate",
      expiryDate: "2029-06-30",
      file: null,
      ocrResult: null,
      status: "Ready for Pre-Screening"
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ocrLoadingIndex, setOcrLoadingIndex] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Trigger OCR Pre-Screening for a document
  const handleOcrRun = async (index) => {
    setOcrLoadingIndex(index);
    const targetDoc = docList[index];
    try {
      const ocrResult = await preScreenDocument(targetDoc.file, targetDoc.documentType);
      setDocList(prev => prev.map((d, i) => i === index ? {
        ...d,
        ocrResult,
        status: ocrResult.status
      } : d));
    } catch (err) {
      console.error("OCR Pre-screening failed:", err);
    } finally {
      setOcrLoadingIndex(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Submit application to Firestore and n8n
      const { applicationId, record, n8nResult } = await submitApplication(formData, currentUser);

      // 2. Upload and record each document
      const createdDocs = [];
      for (const docItem of docList) {
        const docRecord = await uploadDocumentRecord({
          applicationId,
          institutionId: record.institutionId,
          documentType: docItem.documentType,
          expiryDate: docItem.expiryDate,
          storageReference: `uploads/${record.institutionId}/${docItem.documentType.replace(/\s+/g, "_").toLowerCase()}.pdf`,
          verificationStatus: docItem.ocrResult ? docItem.ocrResult.status : "Pending Scrutiny Verification",
          ocrStatus: docItem.ocrResult ? `Keywords Match (${docItem.ocrResult.confidenceScore}%)` : "Pre-Screened Heuristic",
          ocrResult: docItem.ocrResult
        }, currentUser);
        createdDocs.push(docRecord.record);
      }

      // Update state
      setApplications(prev => [record, ...prev]);
      setDocuments(prev => [...createdDocs, ...prev]);

      setSubmissionSuccess({
        applicationId,
        record,
        n8nResult
      });
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 max-w-2xl mx-auto text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Application Submitted Successfully!
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Application ID <strong className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{submissionSuccess.applicationId}</strong> has been registered.
          The automated n8n workflow engine has initiated pre-screening and routed it to the Scrutiny Committee queue.
        </p>

        <div className="p-3 bg-slate-50 rounded-xl text-left text-xs border border-slate-200 space-y-1.5 font-mono">
          <div>Stage: <strong>Automated Pre-Screening &bull; Scrutiny In Progress</strong></div>
          <div>Processing Route: <strong>{submissionSuccess.record.processingRoute}</strong></div>
          <div>Assigned Committee: <strong>{submissionSuccess.record.assignedReviewerName}</strong></div>
          <div>n8n Webhook: <strong>{submissionSuccess.n8nResult?.isN8nLive ? "Triggered (/webhook/application-submit)" : "Local Engine Synchronized"}</strong></div>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-3">
          <button
            onClick={() => onSelectApp(submissionSuccess.record)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Inspect Application Dossier
          </button>
          <button
            onClick={() => onNavigate("applications")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wide">
          <Building2 className="w-4 h-4" />
          <span>Statutory AICTE Approval Application Form (APH 2026-27)</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-1">
          New Institutional Approval Application
        </h2>
        <p className="text-xs text-slate-500">
          Submit official institutional documentation. The automated n8n routing engine will validate certificates, calculate deadlines, and route the application to the Scrutiny Committee.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Institutional Particulars */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Institutional Particulars & Processing Route
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Institution Name *</label>
              <input
                type="text"
                required
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Registration / Permanent ID *</label>
              <input
                type="text"
                required
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Contact Email *</label>
              <input
                type="email"
                required
                value={formData.institutionEmail}
                onChange={(e) => setFormData({ ...formData, institutionEmail: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Application Type *</label>
              <select
                value={formData.applicationType}
                onChange={(e) => setFormData({ ...formData, applicationType: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option>Extension of Approval (EoA) & Course Intake Increase</option>
                <option>New Technical Campus Setup (B.Tech / MCA / Management)</option>
                <option>Introduction of New Integrated Degree/Diploma</option>
                <option>Closure / Change of Site / Name Change</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">AICTE Region *</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option>Western</option>
                <option>Northern</option>
                <option>Southern</option>
                <option>Eastern</option>
                <option>South-Western</option>
                <option>Central</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Prescribed Processing Route * (n8n Automated Engine)
              </label>
              <select
                value={formData.processingRoute}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  processingRoute: e.target.value,
                  evcRequired: e.target.value.includes("EVC")
                })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-indigo-50/50 font-semibold text-indigo-900 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option>Only Scrutiny</option>
                <option>Scrutiny followed by EVC</option>
                <option>EVC followed by SAC/SHC</option>
                <option>Scrutiny followed by EVC and SAC/SHC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Mandatory Certificates & OCR Pre-Screening */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Supporting Certificates & OCR Pre-Screening
            </div>
            <span className="text-[11px] text-slate-400">
              Powered by OCR.Space Free API ({import.meta.env.VITE_OCR_SPACE_API_KEY ? "Configured" : "Heuristic"})
            </span>
          </div>

          <div className="space-y-3">
            {docList.map((docItem, index) => (
              <div 
                key={docItem.documentType}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="grow max-w-sm">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>{docItem.documentType}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
                    <span>Expiry Date:</span>
                    <input
                      type="date"
                      value={docItem.expiryDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDocList(prev => prev.map((d, i) => i === index ? { ...d, expiryDate: val } : d));
                      }}
                      className="px-2 py-0.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOcrRun(index)}
                    disabled={ocrLoadingIndex === index}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{ocrLoadingIndex === index ? "Scanning OCR..." : "Test OCR Pre-Screen"}</span>
                  </button>

                  <span className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                    docItem.ocrResult 
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                      : "bg-slate-200 text-slate-700 border-slate-300"
                  }`}>
                    {docItem.ocrResult ? `Match: ${docItem.ocrResult.confidenceScore}%` : "Not Scanned"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Statutory Declaration & Submission */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Institutional Undertaking & Confirmation
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Undertaking Declaration Description:
              </label>
              <textarea
                rows={2}
                value={formData.undertakingDescription}
                onChange={(e) => setFormData({ ...formData, undertakingDescription: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
              <strong>Statutory Declaration:</strong> I hereby declare that all submitted documents, land titles, and building safety certificates strictly conform to AICTE regulations. I understand that automated pre-screening aids scrutiny, and formal approval requires statutory verification by the designated AICTE Committee.
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => onNavigate("applications")}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting Application & Triggering n8n..." : "Confirm & Submit Application"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
