import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { 
  DEMO_PERSONAS, 
  INITIAL_APPLICATIONS, 
  INITIAL_DOCUMENTS, 
  INITIAL_AUDIT_LOGS 
} from "../data/mockData";
import { simulateTimeProgression, getN8nBaseUrl } from "../services/api";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Current active persona
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("aicte_active_persona");
    return saved ? JSON.parse(saved) : DEMO_PERSONAS[0];
  });

  // Simulated system time for hackathon testing
  const [simulatedDate, setSimulatedDate] = useState(() => {
    const saved = localStorage.getItem("aicte_simulated_date");
    return saved || new Date().toISOString().split("T")[0];
  });

  // Data states
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem("aicte_local_apps");
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem("aicte_local_docs");
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem("aicte_local_logs");
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState([]);
  const [isN8nConnected, setIsN8nConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  // Listen to Firestore if online
  useEffect(() => {
    let unsubscribeApps = () => {};
    let unsubscribeDocs = () => {};
    let unsubscribeLogs = () => {};

    try {
      const appsRef = collection(db, "applications");
      unsubscribeApps = onSnapshot(appsRef, (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(doc => list.push({ ...doc.data(), applicationId: doc.id }));
          setApplications(prev => {
            // Merge with local state
            const ids = new Set(list.map(a => a.applicationId));
            const merged = [...list, ...prev.filter(p => !ids.has(p.applicationId))];
            localStorage.setItem("aicte_local_apps", JSON.stringify(merged));
            return merged;
          });
        }
      }, (err) => {
        console.info("Firestore live listener standby:", err.message);
      });

      const docsRef = collection(db, "documents");
      unsubscribeDocs = onSnapshot(docsRef, (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(doc => list.push({ ...doc.data(), documentId: doc.id }));
          setDocuments(prev => {
            const ids = new Set(list.map(d => d.documentId));
            const merged = [...list, ...prev.filter(p => !ids.has(p.documentId))];
            localStorage.setItem("aicte_local_docs", JSON.stringify(merged));
            return merged;
          });
        }
      }, () => {});

      const logsRef = collection(db, "auditLogs");
      unsubscribeLogs = onSnapshot(logsRef, (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(doc => list.push(doc.data()));
          setAuditLogs(prev => {
            const ids = new Set(list.map(l => l.logId));
            const merged = [...list, ...prev.filter(p => !ids.has(p.logId))];
            localStorage.setItem("aicte_local_logs", JSON.stringify(merged));
            return merged;
          });
        }
      }, () => {});
    } catch (e) {
      console.warn("Firestore listener init:", e);
    }

    return () => {
      unsubscribeApps();
      unsubscribeDocs();
      unsubscribeLogs();
    };
  }, []);

  // Check n8n endpoint reachability periodically
  useEffect(() => {
    const checkN8n = async () => {
      const baseUrl = getN8nBaseUrl();
      try {
        const res = await fetch(`${baseUrl}/webhook/application-submit`, {
          method: "OPTIONS"
        }).catch(() => null);
        setIsN8nConnected(!!res);
      } catch {
        setIsN8nConnected(false);
      }
      setLastSyncTime(new Date().toLocaleTimeString());
    };

    checkN8n();
    const interval = setInterval(checkN8n, 45000);
    return () => clearInterval(interval);
  }, []);

  // Switch persona
  const switchPersona = (persona) => {
    setCurrentUser(persona);
    localStorage.setItem("aicte_active_persona", JSON.stringify(persona));
  };

  // Advance simulated time
  const advanceTime = async (days) => {
    const current = new Date(simulatedDate);
    current.setDate(current.getDate() + days);
    const newDateStr = current.toISOString().split("T")[0];
    
    setSimulatedDate(newDateStr);
    localStorage.setItem("aicte_simulated_date", newDateStr);

    // Run simulation checks
    const outcome = await simulateTimeProgression(days, newDateStr, applications, documents);

    if (outcome.alerts && outcome.alerts.length > 0) {
      setNotifications(prev => [...outcome.alerts, ...prev]);
    }

    // Refresh audit logs
    const simLog = {
      logId: `AUDIT-SIM-${Date.now()}`,
      applicationId: "SYSTEM-WIDE",
      actorUid: currentUser.email,
      actorRole: currentUser.role,
      action: "ADVANCE_SIMULATED_TIME",
      previousStatus: simulatedDate,
      newStatus: newDateStr,
      reason: `Simulated clock advanced by +${days} days to ${newDateStr}. Evaluated ${outcome.alerts.length} alerts & ${outcome.escalatedCount} escalations.`,
      timestamp: new Date().toISOString()
    };

    setAuditLogs(prev => [simLog, ...prev]);
    return outcome;
  };

  // Reset demo data
  const resetDemoData = () => {
    setApplications(INITIAL_APPLICATIONS);
    setDocuments(INITIAL_DOCUMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications([]);
    const today = new Date().toISOString().split("T")[0];
    setSimulatedDate(today);
    localStorage.removeItem("aicte_local_apps");
    localStorage.removeItem("aicte_local_docs");
    localStorage.removeItem("aicte_local_logs");
    localStorage.removeItem("aicte_simulated_date");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchPersona,
        simulatedDate,
        advanceTime,
        applications,
        setApplications,
        documents,
        setDocuments,
        auditLogs,
        setAuditLogs,
        notifications,
        isN8nConnected,
        lastSyncTime,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
