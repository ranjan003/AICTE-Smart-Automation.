import React from "react";
import { useApp } from "../context/AppContext";
import { 
  LayoutDashboard, FileText, PlusCircle, FolderCheck, 
  AlertOctagon, Calendar, BellRing, History, BarChart3, 
  Workflow, ShieldAlert
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser, applications, documents, notifications } = useApp();

  // Count metrics for badges
  const pendingScrutinyCount = applications.filter(a => 
    a.currentStage === "Scrutiny In Progress" || a.currentStage === "Automated Pre-Screening" || a.currentStage === "Pending Scrutiny"
  ).length;

  const deficiencyCount = applications.filter(a => a.currentStage === "Deficiency Raised").length;

  const criticalDocsCount = documents.filter(d => {
    if (!d.expiryDate) return false;
    const diff = Math.ceil((new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff <= 7;
  }).length;

  const escalatedCount = applications.filter(a => 
    a.escalationStatus && a.escalationStatus !== "Normal"
  ).length;

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["College Admin", "Reviewer", "Bureau Officer"]
    },
    {
      id: "applications",
      label: "Applications",
      icon: FileText,
      badge: currentUser.role === "Reviewer" ? pendingScrutinyCount : applications.length,
      roles: ["College Admin", "Reviewer", "Bureau Officer"]
    },
    {
      id: "new-application",
      label: "Submit Application",
      icon: PlusCircle,
      roles: ["College Admin"]
    },
    {
      id: "documents",
      label: "Document Vault & Expiry",
      icon: FolderCheck,
      badge: criticalDocsCount > 0 ? `${criticalDocsCount} critical` : null,
      badgeColor: "bg-rose-100 text-rose-700",
      roles: ["College Admin", "Reviewer", "Bureau Officer"]
    },
    {
      id: "compliance",
      label: "Compliance & Rectification",
      icon: AlertOctagon,
      badge: deficiencyCount > 0 ? deficiencyCount : null,
      badgeColor: "bg-amber-100 text-amber-700",
      roles: ["College Admin", "Reviewer", "Bureau Officer"]
    },
    {
      id: "evc",
      label: "EVC Committee & Visits",
      icon: Calendar,
      roles: ["Reviewer", "Bureau Officer"]
    },
    {
      id: "escalations",
      label: "Alerts & Escalations",
      icon: BellRing,
      badge: escalatedCount > 0 ? escalatedCount : null,
      badgeColor: "bg-red-500 text-white animate-pulse",
      roles: ["Reviewer", "Bureau Officer", "College Admin"]
    },
    {
      id: "audit",
      label: "Audit Trail",
      icon: History,
      roles: ["Bureau Officer", "Reviewer"]
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: BarChart3,
      roles: ["Bureau Officer", "Reviewer"]
    },
    {
      id: "n8n-engine",
      label: "n8n Automation Engine",
      icon: Workflow,
      badge: "6 Flows",
      roles: ["College Admin", "Reviewer", "Bureau Officer"]
    }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3 border-r border-slate-800">
      <div>
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Navigation &bull; {currentUser.role}
        </div>
        <nav className="space-y-1 mt-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badgeColor || (isActive ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-300")
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Role Context Card in Sidebar footer */}
      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-xs">
        <div className="flex items-center space-x-2 mb-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-white font-semibold text-[11px]">Active Access Scope</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {currentUser.role === "College Admin" && "Authorized for application submission, document updates, and compliance rectification."}
          {currentUser.role === "Reviewer" && "Authorized for scrutiny verification, deficiency issuance, and EVC recommendation."}
          {currentUser.role === "Bureau Officer" && "Consolidated authority over escalations, statutory final approvals, and audit review."}
        </p>
      </div>
    </aside>
  );
}
