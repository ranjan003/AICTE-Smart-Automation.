import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Calendar, Users, CheckCircle, Clock, ShieldCheck, 
  MapPin, FileText, ArrowRight 
} from "lucide-react";

export default function EvcManagement({ onSelectApp }) {
  const { applications, currentUser, setApplications } = useApp();

  const evcApps = applications.filter(a => a.processingRoute?.includes("EVC"));

  const pendingEvc = evcApps.filter(a => a.currentStage === "Pending EVC");
  const scheduledEvc = evcApps.filter(a => a.currentStage === "EVC Scheduled");
  const completedEvc = evcApps.filter(a => a.currentStage === "EVC Completed" || a.currentStage === "Final Review" || a.currentStage === "Approved by Authorised Authority");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wide">
          <Calendar className="w-4 h-4" />
          <span>Expert Visit Committee (EVC) Administration & Scheduling</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mt-1">
          EVC Site Inspection Management
        </h2>
        <p className="text-xs text-slate-500">
          Statutory on-site physical inspection tracking for technical institutions requiring lab, infrastructure, faculty, and barrier-free environment verification.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Awaiting EVC Schedule</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingEvc.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Scrutiny cleared, panel not fixed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Scheduled Visits</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{scheduledEvc.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Inspection date & committee notified</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Completed EVCs</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{completedEvc.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Report submitted to Bureau</div>
        </div>
      </div>

      {/* Scheduled Visits List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">EVC Inspection Schedule & Committee Roster</h3>
          <span className="text-xs text-slate-500">{evcApps.length} institutions in EVC pipeline</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {evcApps.map((app) => (
            <div key={app.applicationId} className="p-4 hover:bg-slate-50/80 transition flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {app.applicationId}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{app.institutionName}</span>
                  <span className="text-slate-500 text-[11px] flex items-center">
                    <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                    {app.region} Region
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] mt-1">
                  Assigned Inspection Committee: <strong>Prof. S. K. Mukherjee (IIT Bombay) &amp; Dr. P. K. Verma (VNIT)</strong>
                </div>
                {app.evcScheduledAt && (
                  <div className="text-indigo-700 font-semibold text-[11px] mt-0.5 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Visit Confirmed: {app.evcScheduledAt.split("T")[0]}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                  app.currentStage === "EVC Scheduled"
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : app.currentStage === "Pending EVC"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {app.currentStage}
                </span>

                <button
                  onClick={() => onSelectApp(app)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-700 rounded-lg font-semibold text-xs transition cursor-pointer"
                >
                  Manage EVC
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
