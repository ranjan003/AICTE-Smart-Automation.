import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { DEMO_PERSONAS } from "../data/mockData";
import { 
  Building2, ShieldCheck, Clock, Zap, RefreshCw, 
  ChevronDown, UserCheck, AlertTriangle, Radio
} from "lucide-react";

export default function Header({ onOpenSimModal }) {
  const { 
    currentUser, 
    switchPersona, 
    simulatedDate, 
    isN8nConnected, 
    resetDemoData 
  } = useApp();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner - AICTE & Hackathon Badge */}
      <div className="bg-slate-900 text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
            AICTE PS-26262
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Integrated AICTE Approval Workflow Automation, Compliance Monitoring & Alert System
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-slate-300">
            <Radio className={`w-3 h-3 mr-1 ${isN8nConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            n8n Webhook: <strong className="ml-1 text-white">{isN8nConnected ? 'Online (ngrok)' : 'Local Fallback'}</strong>
          </span>
          <button 
            onClick={resetDemoData}
            title="Reset to default mock data"
            className="text-slate-400 hover:text-white transition flex items-center text-[11px]"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Reset Demo Data
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Emblem & Portal Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center font-extrabold shadow-md shadow-indigo-900/20 text-lg">
            🏛️
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                AICTE Approval Automation
              </h1>
              <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                Prototype v2.6
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Department of Approval Bureau &bull; Ministry of Education
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center space-x-3">
          {/* Simulated Time Progression Badge & Trigger */}
          <div className="hidden md:flex items-center bg-slate-100 hover:bg-slate-200/80 transition rounded-lg p-1 border border-slate-200 text-xs">
            <div className="px-2.5 py-1 text-slate-700 font-medium flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Simulated Clock:</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs font-mono">
                {simulatedDate}
              </span>
            </div>
            <button
              onClick={onOpenSimModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-2.5 py-1 rounded shadow-xs flex items-center space-x-1 transition cursor-pointer"
            >
              <Zap className="w-3 h-3" />
              <span>Advance Time</span>
            </button>
          </div>

          {/* Quick Persona Switcher for Hackathon Judges */}
          <div className="relative">
            <button
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <div className="text-left hidden sm:block">
                <div className="font-bold leading-tight">{currentUser.displayName}</div>
                <div className="text-[10px] text-slate-500">{currentUser.role}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${currentUser.badgeColor}`}>
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isPersonaMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Switch Role / Persona (Demo Mode)
                </div>
                {DEMO_PERSONAS.map((persona) => (
                  <button
                    key={persona.role}
                    onClick={() => {
                      switchPersona(persona);
                      setIsPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-indigo-50/60 transition flex items-center justify-between ${
                      currentUser.role === persona.role ? "bg-indigo-50 font-semibold" : ""
                    }`}
                  >
                    <div>
                      <div className="text-slate-800 font-bold">{persona.displayName}</div>
                      <div className="text-slate-500 text-[11px]">{persona.email}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {persona.institutionName || persona.designation || persona.assignedRegion}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${persona.badgeColor}`}>
                      {persona.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
