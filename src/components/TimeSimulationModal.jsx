import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Clock, Zap, AlertTriangle, CheckCircle, ArrowRight, 
  Calendar, ShieldAlert, Sparkles, X, Mail
} from "lucide-react";

export default function TimeSimulationModal({ isOpen, onClose }) {
  const { simulatedDate, advanceTime } = useApp();
  const [selectedDays, setSelectedDays] = useState(7);
  const [customDays, setCustomDays] = useState(15);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  if (!isOpen) return null;

  const handleRunSimulation = async (days) => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const outcome = await advanceTime(days);
      setSimulationResult(outcome);
    } catch (e) {
      console.error("Simulation error:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>Simulate Time Progression</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  DEMO FEATURE
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Advance the virtual AICTE regulatory clock safely to evaluate stage deadlines, expired documents, and overdue escalations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Display */}
        <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-600 font-medium">Current Simulated Date:</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
              {simulatedDate}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>Actual OS clock is never altered</span>
          </div>
        </div>

        {/* Quick Progression Presets */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Choose Time Advance Increment:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* +7 Days */}
            <button
              onClick={() => handleRunSimulation(7)}
              disabled={isSimulating}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-700">
                  +7 Days
                </span>
                <Clock className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Triggers 7-day deficiency reminders & upcoming expiry warnings.
              </p>
            </button>

            {/* +15 Days */}
            <button
              onClick={() => handleRunSimulation(15)}
              disabled={isSimulating}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-700">
                  +15 Days
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Crosses correction deadlines; triggers Level 2 Bureau escalation.
              </p>
            </button>

            {/* +30 Days */}
            <button
              onClick={() => handleRunSimulation(30)}
              disabled={isSimulating}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-700">
                  +30 Days
                </span>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Triggers document expiry notices and Bureau Officer alerts.
              </p>
            </button>
          </div>
        </div>

        {/* Results Panel */}
        {simulationResult && (
          <div className="mt-5 p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 text-xs animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="font-bold text-emerald-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5" /> Simulation Executed Successfully
              </span>
              <span className="font-mono text-slate-400">
                New Simulated Date: {simulationResult.simulatedDate}
              </span>
            </div>

            <div className="space-y-1.5 mt-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Alerts Generated:</span>
                <span className="font-bold text-amber-400">{simulationResult.alerts.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Applications Escalated:</span>
                <span className="font-bold text-rose-400">{simulationResult.escalatedCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>n8n Webhook Status:</span>
                <span className="font-bold text-indigo-400">
                  {simulationResult.n8nResult?.isN8nLive ? "Triggered via ngrok" : "Simulated via Local Resilience Engine"}
                </span>
              </div>
            </div>

            {simulationResult.alerts.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Active Alerts Fired:
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {simulationResult.alerts.map((alert, idx) => (
                    <div 
                      key={idx}
                      className="p-1.5 rounded bg-slate-800/90 text-[11px] flex items-start space-x-1.5 border border-slate-700/60"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-200">[{alert.type}]</span> {alert.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            Audit logs automatically record the progression step.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
