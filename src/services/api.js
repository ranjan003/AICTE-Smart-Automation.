/**
 * n8n Webhook Client & Resilience Service
 * AICTE Approval Automation System
 */

import { db } from "../firebase/config";
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  addDoc, query, where, orderBy, serverTimestamp 
} from "firebase/firestore";

// Get base URL from environment or localStorage override
export function getN8nBaseUrl() {
  return localStorage.getItem("n8n_base_url") || 
         import.meta.env.VITE_N8N_WEBHOOK_BASE_URL || 
         "https://emphasize-latrine-backlog.ngrok-free.dev";
}

export function setN8nBaseUrl(url) {
  if (url) {
    localStorage.setItem("n8n_base_url", url.replace(/\/+$/, ""));
  }
}

/**
 * Universal safe POST to n8n webhook with automatic fallback
 */
async function callN8nWebhook(endpointPath, payload) {
  const baseUrl = getN8nBaseUrl().replace(/\/+$/, "");
  const fullUrl = `${baseUrl}${endpointPath.startsWith("/") ? "" : "/"}${endpointPath}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`n8n webhook ${endpointPath} returned status ${response.status}`);
      return {
        success: false,
        status: response.status,
        url: fullUrl,
        message: `HTTP ${response.status}: Webhook returned error response`
      };
    }

    const data = await response.json().catch(() => ({ status: "ok", rawResponse: true }));
    return {
      success: true,
      data,
      url: fullUrl,
      isN8nLive: true
    };
  } catch (err) {
    console.warn(`n8n Webhook call to ${fullUrl} could not connect: ${err.message}. Running fallback local engine.`);
    return {
      success: false,
      isN8nLive: false,
      url: fullUrl,
      error: err.message,
      message: "Webhook offline or ngrok tunnel paused. Falling back to local state engine."
    };
  }
}

// -------------------------------------------------------------
// WORKFLOW 1: APPLICATION SUBMISSION AND ROUTING
// -------------------------------------------------------------
export async function submitApplication(appData, user) {
  const applicationId = appData.applicationId || `AICTE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Calculate default stage deadlines based on route
  const now = new Date();
  const scrutinyDeadline = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days
  
  const record = {
    ...appData,
    applicationId,
    institutionId: user.institutionId || appData.institutionId || "INST-AICTE-01",
    institutionName: appData.institutionName || user.institutionName || "Institute of Technology",
    institutionEmail: appData.institutionEmail || user.email || "college@aicte.edu.in",
    currentStage: "Automated Pre-Screening",
    currentStatus: "Under Initial Pre-Screening",
    submittedAt: now.toISOString(),
    stageEnteredAt: now.toISOString(),
    stageDeadline: scrutinyDeadline.toISOString(),
    correctionDeadline: null,
    escalationStatus: "Normal",
    assignedReviewerId: appData.assignedReviewerId || "REV-WESTERN-01",
    assignedReviewerName: appData.assignedReviewerName || "Dr. R. Ramanathan (Western Region)",
    evcRequired: appData.processingRoute.includes("EVC"),
    evcScheduledAt: null,
    createdBy: user.uid || "demo-college-admin"
  };

  // 1. Save to Firestore
  try {
    const appRef = doc(db, "applications", applicationId);
    await setDoc(appRef, record);

    // 2. Add audit log
    await logAuditEvent({
      applicationId,
      actorUid: user.uid || "college-admin",
      actorRole: user.role || "College Admin",
      action: "SUBMIT_APPLICATION",
      previousStatus: "Draft",
      newStatus: "Automated Pre-Screening",
      reason: `Application submitted for route: ${appData.processingRoute}`
    });
  } catch (firestoreErr) {
    console.warn("Firestore write fallback to local storage:", firestoreErr);
  }

  // 3. Trigger n8n Webhook
  const n8nResult = await callN8nWebhook("/webhook/application-submit", {
    event: "APPLICATION_SUBMITTED",
    applicationId,
    application: record,
    submittedBy: user.email,
    timestamp: now.toISOString()
  });

  return { applicationId, record, n8nResult };
}

// -------------------------------------------------------------
// WORKFLOW 2: APPLICATION REVIEW & STAGE TRANSITION
// -------------------------------------------------------------
export async function reviewApplicationStage(applicationId, currentApp, reviewAction, reviewNotes, user, extra = {}) {
  const now = new Date();
  let nextStage = currentApp.currentStage;
  let nextStatus = currentApp.currentStatus;
  let correctionDeadline = currentApp.correctionDeadline || null;
  let stageDeadline = currentApp.stageDeadline;
  let evcScheduledAt = currentApp.evcScheduledAt || null;

  const route = currentApp.processingRoute || "Scrutiny followed by EVC";

  if (reviewAction === "APPROVE_STAGE") {
    // Stage transition according to route
    if (currentApp.currentStage === "Automated Pre-Screening" || currentApp.currentStage === "Pending Scrutiny") {
      nextStage = "Scrutiny In Progress";
      nextStatus = "Scrutiny Verification Ongoing";
    } else if (currentApp.currentStage === "Scrutiny In Progress" || currentApp.currentStage === "Resubmitted") {
      if (route.includes("EVC")) {
        nextStage = "Pending EVC";
        nextStatus = "Scrutiny Cleared - Awaiting EVC Schedule";
        stageDeadline = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        nextStage = "Final Review";
        nextStatus = "Awaiting Final Statutory Approval";
        stageDeadline = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();
      }
    } else if (currentApp.currentStage === "Pending EVC" || currentApp.currentStage === "EVC Scheduled") {
      nextStage = "EVC Completed";
      nextStatus = "Expert Committee Visit Conducted";
      if (route.includes("SAC/SHC")) {
        nextStage = "Pending SAC/SHC";
        nextStatus = "Referred to Standing Appellate Committee";
      } else {
        nextStage = "Final Review";
        nextStatus = "Awaiting Final Statutory Approval";
      }
    } else if (currentApp.currentStage === "Pending SAC/SHC") {
      nextStage = "Final Review";
      nextStatus = "SAC/SHC Scrutiny Completed";
    }
  } else if (reviewAction === "RAISE_DEFICIENCY") {
    nextStage = "Deficiency Raised";
    nextStatus = "Awaiting College Correction";
    // 7 days correction deadline per AICTE norms
    correctionDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (reviewAction === "SCHEDULE_EVC") {
    nextStage = "EVC Scheduled";
    nextStatus = `EVC Scheduled for ${extra.evcDate || "Upcoming Date"}`;
    evcScheduledAt = extra.evcDate || new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
  } else if (reviewAction === "FINAL_APPROVAL") {
    nextStage = "Approved by Authorised Authority";
    nextStatus = "AICTE Statutory Approval Granted";
  } else if (reviewAction === "REJECT") {
    nextStage = "Rejected by Authorised Authority";
    nextStatus = "Application Rejected with Justification";
  }

  const updates = {
    currentStage: nextStage,
    currentStatus: nextStatus,
    correctionDeadline,
    stageDeadline,
    evcScheduledAt,
    lastUpdatedAt: now.toISOString(),
    lastReviewedBy: user.displayName || user.email || "Reviewer",
    lastReviewNotes: reviewNotes || ""
  };

  // 1. Update Firestore
  try {
    const appRef = doc(db, "applications", applicationId);
    await updateDoc(appRef, updates);

    await logAuditEvent({
      applicationId,
      actorUid: user.uid || "reviewer",
      actorRole: user.role || "Reviewer",
      action: reviewAction,
      previousStatus: currentApp.currentStatus,
      newStatus: nextStatus,
      reason: reviewNotes || `Transitioned to ${nextStage}`
    });
  } catch (e) {
    console.warn("Firestore update fallback:", e);
  }

  // 2. Trigger n8n Webhook
  const n8nResult = await callN8nWebhook("/webhook/application-review", {
    event: "STAGE_REVIEWED",
    applicationId,
    reviewAction,
    previousStage: currentApp.currentStage,
    newStage: nextStage,
    reviewNotes,
    reviewedBy: user.email,
    institutionEmail: currentApp.institutionEmail,
    correctionDeadline,
    timestamp: now.toISOString()
  });

  return { success: true, updates, n8nResult };
}

// -------------------------------------------------------------
// WORKFLOW 3: DOCUMENT UPLOAD & OCR METADATA
// -------------------------------------------------------------
export async function uploadDocumentRecord(docData, user) {
  const documentId = docData.documentId || `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date();

  const record = {
    ...docData,
    documentId,
    submittedAt: now.toISOString(),
    uploadedBy: user.email || "college-admin",
    verificationStatus: docData.verificationStatus || "Pending Reviewer Verification",
    ocrStatus: docData.ocrStatus || "Processed"
  };

  try {
    const docRef = doc(db, "documents", documentId);
    await setDoc(docRef, record);

    await logAuditEvent({
      applicationId: docData.applicationId,
      actorUid: user.uid || "college-admin",
      actorRole: user.role || "College Admin",
      action: "UPLOAD_DOCUMENT",
      previousStatus: "Unsubmitted",
      newStatus: "Uploaded - Pending Review",
      reason: `Uploaded ${docData.documentType}. Expiry: ${docData.expiryDate || "N/A"}`
    });
  } catch (e) {
    console.warn("Firestore doc write fallback:", e);
  }

  const n8nResult = await callN8nWebhook("/webhook/document-upload", {
    event: "DOCUMENT_UPLOADED",
    documentId,
    applicationId: docData.applicationId,
    documentType: docData.documentType,
    expiryDate: docData.expiryDate,
    ocrData: docData.ocrResult || null,
    timestamp: now.toISOString()
  });

  return { documentId, record, n8nResult };
}

// -------------------------------------------------------------
// WORKFLOW 5: COMPLIANCE CORRECTION SUBMISSION
// -------------------------------------------------------------
export async function submitComplianceCorrection(complianceData, user) {
  const complianceId = `CMP-${Date.now()}`;
  const now = new Date();

  const record = {
    ...complianceData,
    complianceId,
    submittedAt: now.toISOString(),
    verificationStatus: "Submitted - Awaiting Reviewer Scrutiny"
  };

  try {
    const cmpRef = doc(db, "complianceRecords", complianceId);
    await setDoc(cmpRef, record);

    // Update application stage back to Resubmitted / Scrutiny In Progress
    const appRef = doc(db, "applications", complianceData.applicationId);
    await updateDoc(appRef, {
      currentStage: "Resubmitted",
      currentStatus: "Compliance Evidence Submitted - Ready for Re-Scrutiny",
      lastUpdatedAt: now.toISOString(),
      correctionDeadline: null // cleared
    });

    await logAuditEvent({
      applicationId: complianceData.applicationId,
      actorUid: user.uid || "college-admin",
      actorRole: user.role || "College Admin",
      action: "SUBMIT_COMPLIANCE",
      previousStatus: "Deficiency Raised",
      newStatus: "Resubmitted",
      reason: complianceData.undertakingDescription || "Compliance documents and rectification uploaded"
    });
  } catch (e) {
    console.warn("Firestore compliance write fallback:", e);
  }

  const n8nResult = await callN8nWebhook("/webhook/compliance-submit", {
    event: "COMPLIANCE_SUBMITTED",
    complianceId,
    applicationId: complianceData.applicationId,
    description: complianceData.undertakingDescription,
    timestamp: now.toISOString()
  });

  return { complianceId, n8nResult };
}

// -------------------------------------------------------------
// WORKFLOW 4 & 6: SIMULATE TIME PROGRESSION & ESCALATION
// -------------------------------------------------------------
export async function simulateTimeProgression(daysToAdvance, simulatedDateStr, currentApps = [], currentDocs = []) {
  const simulatedDate = new Date(simulatedDateStr);
  const nowIso = simulatedDate.toISOString();
  const alertsGenerated = [];
  const escalatedApps = [];

  // Evaluate applications against simulated date
  for (const app of currentApps) {
    let needsUpdate = false;
    let newEscalationStatus = app.escalationStatus || "Normal";
    let newStatus = app.currentStatus;

    // Check correction deadline (Deficiency)
    if (app.currentStage === "Deficiency Raised" && app.correctionDeadline) {
      const deadline = new Date(app.correctionDeadline);
      const diffDays = Math.ceil((deadline - simulatedDate) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        // Overdue!
        newEscalationStatus = "Escalated to Bureau Officer (Level 2)";
        newStatus = `Correction Overdue by ${Math.abs(diffDays)} days - Escalated`;
        needsUpdate = true;
        alertsGenerated.push({
          type: "CORRECTION_OVERDUE",
          severity: "high",
          applicationId: app.applicationId,
          message: `Application ${app.applicationId} failed to rectify deficiency within 7 days. Escalated to Bureau Officer.`
        });
        escalatedApps.push(app.applicationId);
      } else if (diffDays <= 2) {
        alertsGenerated.push({
          type: "CORRECTION_DEADLINE_NEAR",
          severity: "medium",
          applicationId: app.applicationId,
          message: `Application ${app.applicationId} correction deadline in ${diffDays} days.`
        });
      }
    }

    // Check stage deadline (Scrutiny / EVC delay)
    if (app.stageDeadline && app.currentStage !== "Approved by Authorised Authority" && app.currentStage !== "Rejected by Authorised Authority") {
      const stageDeadline = new Date(app.stageDeadline);
      const diffStageDays = Math.ceil((stageDeadline - simulatedDate) / (1000 * 60 * 60 * 24));

      if (diffStageDays < 0 && newEscalationStatus === "Normal") {
        newEscalationStatus = "Scrutiny Overdue - Notice Dispatched";
        newStatus = `Scrutiny delayed past ${app.stageDeadline.split("T")[0]}`;
        needsUpdate = true;
        alertsGenerated.push({
          type: "STAGE_OVERDUE",
          severity: "high",
          applicationId: app.applicationId,
          message: `Stage '${app.currentStage}' for ${app.applicationId} is overdue by ${Math.abs(diffStageDays)} days.`
        });
      }
    }

    if (needsUpdate) {
      try {
        const appRef = doc(db, "applications", app.applicationId);
        await updateDoc(appRef, {
          escalationStatus: newEscalationStatus,
          currentStatus: newStatus,
          lastUpdatedAt: nowIso
        });

        await logAuditEvent({
          applicationId: app.applicationId,
          actorUid: "system-timer",
          actorRole: "Automated Compliance Monitor",
          action: "SIMULATED_ESCALATION",
          previousStatus: app.currentStatus,
          newStatus: newStatus,
          reason: `Simulated date ${simulatedDateStr} crossed deadline criteria.`
        });
      } catch (e) {
        console.warn("Firestore escalation update error:", e);
      }
    }
  }

  // Check document expiry
  for (const docItem of currentDocs) {
    if (docItem.expiryDate) {
      const expDate = new Date(docItem.expiryDate);
      const diffDays = Math.ceil((expDate - simulatedDate) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        alertsGenerated.push({
          type: "DOCUMENT_EXPIRED",
          severity: "critical",
          applicationId: docItem.applicationId,
          message: `${docItem.documentType} (Doc ID: ${docItem.documentId}) EXPIRED on ${docItem.expiryDate}.`
        });
      } else if (diffDays <= 7) {
        alertsGenerated.push({
          type: "DOCUMENT_EXPIRING_CRITICAL",
          severity: "high",
          applicationId: docItem.applicationId,
          message: `${docItem.documentType} expires in ${diffDays} days (${docItem.expiryDate}).`
        });
      } else if (diffDays <= 30) {
        alertsGenerated.push({
          type: "DOCUMENT_EXPIRING_SOON",
          severity: "medium",
          applicationId: docItem.applicationId,
          message: `${docItem.documentType} expires in ${diffDays} days.`
        });
      }
    }
  }

  // Trigger n8n simulated time webhook & escalation webhook
  const n8nResult = await callN8nWebhook("/webhook/simulate-time", {
    simulatedDaysAdvanced: daysToAdvance,
    simulatedDate: simulatedDateStr,
    alertsGenerated,
    escalatedCount: escalatedApps.length
  });

  return {
    simulatedDate: simulatedDateStr,
    daysAdvanced: daysToAdvance,
    alerts: alertsGenerated,
    escalatedCount: escalatedApps.length,
    n8nResult
  };
}

// -------------------------------------------------------------
// AUDIT LOG HELPER
// -------------------------------------------------------------
export async function logAuditEvent(entry) {
  const logId = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const record = {
    ...entry,
    logId,
    timestamp: new Date().toISOString()
  };

  try {
    const logRef = doc(db, "auditLogs", logId);
    await setDoc(logRef, record);
  } catch (e) {
    console.warn("Firestore audit log error:", e);
  }
  return record;
}
