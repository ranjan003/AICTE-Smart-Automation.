import React from "react";
import { useApp } from "../context/AppContext";
import { 
  BellRing, AlertTriangle, ShieldAlert, Mail, 
  CheckCircle, Clock, Zap, ArrowRight 
} from "lucide-react";

export default function AlertsEscalationView({ onSelectApp, onOpenSimModal }) {
  const { applications, documents, notifications, simulatedDate } = useApp();

  const escalatedApps = applications.filter(a => a.escalationStatus && a.escalationStatus !== "Normal");

  // Mock initial sent emails
  const emailLogs = [
    {
      id: "MAIL-001",
      recipient: "rolexleo345678@gmail.com",
      subject: "URGENT: AICTE Deficiency Notice & 7-Day Rectification Deadline",
      type: "Deficiency Notice",
      status: "Dispatched via Gmail SMTP",
      timestamp: "2026-10-20T14:32:00Z"
    },
    {
      id: "MAIL-002",
      recipient: "bureau.officer@aicte.gov.in",
      subject: "ESCALATION: Application AICTE-2026-9024 Exceeded Statutory Rectification Window",
      type: "Bureau Escalation (Level 2)",
      status: "Dispatched via Gmail SMTP",
      timestamp: `${simulatedDate}T10:00:00Z`
    },
    {
      id: "MAIL-003",
      recipient: "college.admin@apexengg.edu.in",
      subject: "AICTE Application Received & Scheduled for Automated Pre-Screening",
      type: "Submission Confirmation",
      status: "Dispatched via Gmail SMTP",
      timestamp: "2026-10-15T09:31:00Z"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
            <BellRing className="w-4 h-4" />
            <span>AICTE Escalation Engine & Automated Notification Dispatcher</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Overdue Cases & Statutory Escalations
          </h2>
          <p className="text-xs text-slate-500">
            Automated monitoring of 15-day scrutiny limits, 7-day deficiency windows, and expired documents with automatic n8n email dispatches to Bureau Officers.
          </p>
        </div>

        <button
          onClick={onOpenSimModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
        >
          <Zap className="w-4 h-4" />
          <span>Advance Clock & Test Escalations</span>
        </button>
      </div>

      {/* Escalation Hierarchy Architecture Card */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 text-xs">
        <div className="font-bold text-white mb-2 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Three-Tier Escalation Protocol (Configured in n8n Engine)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/80">
            <span className="text-amber-400 font-bold">Tier 1: Reminder Warning</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Triggered 2 days prior to stage/correction deadline. Automated email reminder dispatched to College Principal.
            </p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/80">
            <span className="text-rose-400 font-bold">Tier 2: Bureau Escalation</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Triggered on deadline expiry without compliance. Dossier escalated to Regional Director / Bureau Officer desk.
            </p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/80">
            <span className="text-purple-400 font-bold">Tier 3: Appellate Referral</span>
            <p className="text-[11px] text-slate-300 mt-1">
              Persistent deficiency referred to Standing Appellate Committee (SAC) for statutory rejection or special hearing.
            </p>
          </div>
        </div>
      </div>

      {/* Active Escalated Files */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Current Active Escalations ({escalatedApps.length})</h3>
          <span className="text-xs text-slate-400 font-mono">System Date: {simulatedDate}</span>
        </div>

        {escalatedApps.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No applications are currently in escalated state.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {escalatedApps.map((app) => (
              <div key={app.applicationId} className="p-4 hover:bg-rose-50/20 transition flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {app.applicationId}
                    </span>
                    <span className="font-bold text-slate-900">{app.institutionName}</span>
                    <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {app.escalationStatus}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-1">
                    Status: <strong>{app.currentStatus}</strong> &bull; Region: {app.region}
                  </div>
                </div>

                <button
                  onClick={() => onSelectApp(app)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer"
                >
                  Review Escalated File
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Automated Gmail SMTP Dispatch Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Automated Notification &amp; Email Dispatch Ledger</h3>
            <p className="text-xs text-slate-500">Sent via n8n Gmail SMTP node (authenticated securely)</p>
          </div>
          <span className="text-xs text-indigo-600 font-semibold flex items-center">
            <Mail className="w-3.5 h-3.5 mr-1" />
            SMTP Active
          </span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Message ID</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {emailLogs.map((mail) => (
                <tr key={mail.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-500">{mail.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{mail.recipient}</td>
                  <td className="py-3 px-4 max-w-xs truncate">{mail.subject}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                      {mail.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">{mail.status}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {mail.timestamp.split("T")[0]}
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
