import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { getN8nBaseUrl, setN8nBaseUrl } from "../services/api";
import { 
  Workflow, Radio, CheckCircle, AlertTriangle, Send, 
  RefreshCw, ExternalLink, Code, ShieldCheck, Mail
} from "lucide-react";

export default function N8nEngineView() {
  const { isN8nConnected, lastSyncTime } = useApp();
  const [baseUrlInput, setBaseUrlInput] = useState(getN8nBaseUrl());
  const [testResponses, setTestResponses] = useState({});
  const [testingEndpoint, setTestingEndpoint] = useState(null);

  const endpoints = [
    {
      id: "app-submit",
      name: "Workflow 1: Application Submission & Routing",
      path: "/webhook/application-submit",
      method: "POST",
      desc: "Validates application, evaluates route, logs audit entry, and sends submission email.",
      payload: {
        event: "APPLICATION_SUBMITTED",
        applicationId: "AICTE-TEST-9999",
        application: {
          institutionName: "National Test Campus",
          processingRoute: "Scrutiny followed by EVC",
          region: "Western"
        }
      }
    },
    {
      id: "app-review",
      name: "Workflow 2: Stage Review & Transition",
      path: "/webhook/application-review",
      method: "POST",
      desc: "Applies reviewer decision, routes to next stage, sets deadlines, dispatches alerts.",
      payload: {
        event: "STAGE_REVIEWED",
        applicationId: "AICTE-TEST-9999",
        reviewAction: "APPROVE_STAGE",
        reviewNotes: "All laboratory parameters verified."
      }
    },
    {
      id: "doc-upload",
      name: "Workflow 3: Document Pre-Screening (OCR.Space)",
      path: "/webhook/document-upload",
      method: "POST",
      desc: "Invokes OCR.Space API (Key: K8959362988051188957), extracts text, and evaluates keywords.",
      payload: {
        event: "DOCUMENT_UPLOADED",
        documentType: "Fire Safety Certificate",
        expiryDate: "2027-10-15"
      }
    },
    {
      id: "deadline-monitor",
      name: "Workflow 4: Daily Deadline & Expiry Monitoring",
      path: "/webhook/simulate-time",
      method: "POST",
      desc: "Evaluates applications against target date, flags expired certificates, triggers email reminders.",
      payload: {
        simulatedDaysAdvanced: 7,
        simulatedDate: new Date().toISOString().split("T")[0]
      }
    },
    {
      id: "compliance-submit",
      name: "Workflow 5: Compliance Submission",
      path: "/webhook/compliance-submit",
      method: "POST",
      desc: "Receives institutional rectification, logs audit, and notifies scrutiny officer.",
      payload: {
        event: "COMPLIANCE_SUBMITTED",
        applicationId: "AICTE-TEST-9999",
        description: "Attached renewed Fire Safety NOC"
      }
    },
    {
      id: "escalation-check",
      name: "Workflow 6: Overdue Escalation Engine",
      path: "/webhook/escalation-check",
      method: "POST",
      desc: "Identifies overdue files and dispatches Level 2 Bureau Officer escalation alerts.",
      payload: {
        action: "CHECK_ESCALATIONS",
        criteria: "OVERDUE_DEFICIENCIES"
      }
    }
  ];

  const handleTestWebhook = async (ep) => {
    setTestingEndpoint(ep.id);
    const fullUrl = `${baseUrlInput.replace(/\/+$/, "")}${ep.path}`;

    try {
      const start = performance.now();
      const res = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ep.payload)
      });
      const duration = Math.round(performance.now() - start);

      if (res.ok) {
        const json = await res.json().catch(() => ({ message: "Webhook accepted with 200 OK" }));
        setTestResponses(prev => ({
          ...prev,
          [ep.id]: {
            success: true,
            status: res.status,
            duration: `${duration}ms`,
            response: json
          }
        }));
      } else {
        setTestResponses(prev => ({
          ...prev,
          [ep.id]: {
            success: false,
            status: res.status,
            duration: `${duration}ms`,
            response: `HTTP ${res.status}: Webhook returned error or is unactivated`
          }
        }));
      }
    } catch (err) {
      setTestResponses(prev => ({
        ...prev,
        [ep.id]: {
          success: false,
          status: "Network Error",
          duration: "N/A",
          response: `${err.message}. Ngrok tunnel or n8n workflow might be inactive.`
        }
      }));
    } finally {
      setTestingEndpoint(null);
    }
  };

  const handleSaveBaseUrl = () => {
    setN8nBaseUrl(baseUrlInput);
    alert(`n8n Webhook base URL set to: ${baseUrlInput}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Workflow className="w-4 h-4" />
            <span>n8n Core Automation Engine &amp; Webhook Testbench</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            n8n Automation Architecture (6 Workflows)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live integration workbench connecting frontend triggers to your locally hosted n8n instance via ngrok tunnel with Gmail SMTP and OCR.Space APIs.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs">
          <Radio className={`w-4 h-4 ${isN8nConnected ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
          <div>
            <div className="text-slate-400 text-[10px]">Webhook Tunnel:</div>
            <div className="font-bold text-white">{isN8nConnected ? "Connected (ngrok)" : "Standby / Local Fallback"}</div>
          </div>
        </div>
      </div>

      {/* Webhook Base URL Configuration Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Configured ngrok Webhook Base URL
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={baseUrlInput}
            onChange={(e) => setBaseUrlInput(e.target.value)}
            className="grow p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <button
            onClick={handleSaveBaseUrl}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Update URL
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          This base URL is used by the frontend to trigger n8n webhooks. If your ngrok tunnel restarts, update the URL here or in your <code>.env</code> file.
        </p>
      </div>

      {/* 6 Required Workflows Test Bench */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Required n8n Workflows Specification &amp; Direct Test Triggers:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {endpoints.map((ep) => {
            const resp = testResponses[ep.id];
            const isTesting = testingEndpoint === ep.id;

            return (
              <div
                key={ep.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{ep.name}</h4>
                    <span className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mt-1 inline-block">
                      {ep.path}
                    </span>
                  </div>
                  <button
                    onClick={() => handleTestWebhook(ep)}
                    disabled={isTesting}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-indigo-600" />
                    <span>{isTesting ? "Testing..." : "Send Test Ping"}</span>
                  </button>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {ep.desc}
                </p>

                {resp && (
                  <div className={`p-2.5 rounded-lg text-[11px] font-mono border ${
                    resp.success 
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200" 
                      : "bg-amber-50 text-amber-900 border-amber-200"
                  }`}>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>Status: {resp.status}</span>
                      <span>Latency: {resp.duration}</span>
                    </div>
                    <pre className="text-[10px] overflow-x-auto whitespace-pre-wrap max-h-24">
                      {JSON.stringify(resp.response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
