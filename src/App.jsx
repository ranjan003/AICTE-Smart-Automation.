import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TimeSimulationModal from "./components/TimeSimulationModal";
import ApplicationDetailModal from "./components/ApplicationDetailModal";

// Views
import CollegeDashboard from "./views/CollegeDashboard";
import ReviewerDashboard from "./views/ReviewerDashboard";
import BureauDashboard from "./views/BureauDashboard";
import ApplicationsList from "./views/ApplicationsList";
import NewApplicationForm from "./views/NewApplicationForm";
import DocumentManagement from "./views/DocumentManagement";
import ComplianceView from "./views/ComplianceView";
import EvcManagement from "./views/EvcManagement";
import AlertsEscalationView from "./views/AlertsEscalationView";
import AuditTrailView from "./views/AuditTrailView";
import ReportsView from "./views/ReportsView";
import N8nEngineView from "./views/N8nEngineView";

function MainLayout() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const handleSelectApp = (app) => {
    setSelectedApplication(app);
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        if (currentUser.role === "College Admin") {
          return <CollegeDashboard onSelectApp={handleSelectApp} onNavigate={handleNavigate} />;
        }
        if (currentUser.role === "Reviewer") {
          return <ReviewerDashboard onSelectApp={handleSelectApp} />;
        }
        return (
          <BureauDashboard 
            onSelectApp={handleSelectApp} 
            onNavigate={handleNavigate}
            onOpenSimModal={() => setIsSimModalOpen(true)}
          />
        );

      case "applications":
        return <ApplicationsList onSelectApp={handleSelectApp} onNavigate={handleNavigate} />;

      case "new-application":
        return <NewApplicationForm onNavigate={handleNavigate} onSelectApp={handleSelectApp} />;

      case "documents":
        return <DocumentManagement />;

      case "compliance":
        return <ComplianceView onSelectApp={handleSelectApp} />;

      case "evc":
        return <EvcManagement onSelectApp={handleSelectApp} />;

      case "escalations":
        return (
          <AlertsEscalationView 
            onSelectApp={handleSelectApp} 
            onOpenSimModal={() => setIsSimModalOpen(true)}
          />
        );

      case "audit":
        return <AuditTrailView />;

      case "reports":
        return <ReportsView />;

      case "n8n-engine":
        return <N8nEngineView />;

      default:
        return <CollegeDashboard onSelectApp={handleSelectApp} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top Header */}
      <Header onOpenSimModal={() => setIsSimModalOpen(true)} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
          {renderContent()}
        </main>
      </div>

      {/* Time Progression Simulation Modal */}
      <TimeSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
      />

      {/* Application Dossier Inspection Modal */}
      <ApplicationDetailModal
        application={selectedApplication}
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
