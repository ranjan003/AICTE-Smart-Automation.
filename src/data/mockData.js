/**
 * Seed & Demonstration Data for AICTE Approval System
 * Contains Scenario A (Success Path) and Scenario B (Deficiency/Escalation Path)
 */

export const DEMO_PERSONAS = [
  {
    role: "College Admin",
    displayName: "Er. Suresh Patil",
    email: "rolexleo345678@gmail.com",
    institutionId: "INST-MH-1029",
    institutionName: "Apex Institute of Engineering & Technology, Mumbai",
    region: "Western",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    role: "Reviewer",
    displayName: "Dr. R. Ramanathan",
    email: "reviewer.ramanathan@aicte.gov.in",
    assignedRegion: "Western",
    designation: "Senior Scrutiny Officer & Committee Head",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200"
  },
  {
    role: "Bureau Officer",
    displayName: "Sh. M. K. Verma",
    email: "bureau.officer@aicte.gov.in",
    assignedRegion: "National / Western Bureau",
    designation: "Regional Director & Compliance Appellate Authority",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
  }
];

export const INITIAL_APPLICATIONS = [
  // Scenario A: Successful Application Progression
  {
    applicationId: "AICTE-2026-8841",
    institutionId: "INST-MH-1029",
    institutionName: "Apex Institute of Engineering & Technology, Mumbai",
    institutionEmail: "college.admin@apexengg.edu.in",
    registrationNumber: "AICTE/WRO/2012/1-4928172",
    contactPerson: "Dr. Aniket Deshmukh (Director)",
    contactPhone: "+91 98201 44512",
    applicationType: "Extension of Approval (EoA) & Course Intake Increase",
    region: "Western",
    processingRoute: "Scrutiny followed by EVC",
    currentStage: "Scrutiny In Progress",
    currentStatus: "Under Verification by Scrutiny Committee",
    submittedAt: "2026-10-15T09:30:00Z",
    stageEnteredAt: "2026-10-18T11:00:00Z",
    stageDeadline: "2026-11-02T18:00:00Z",
    correctionDeadline: null,
    evcRequired: true,
    evcScheduledAt: null,
    escalationStatus: "Normal",
    assignedReviewerId: "REV-WEST-01",
    assignedReviewerName: "Dr. R. Ramanathan",
    undertakingDescription: "Institutional undertaking regarding NBA accreditation compliance submitted.",
    undertakingDueDate: "2026-12-15T00:00:00Z"
  },
  // Scenario B: Deficiency & Escalation Path
  {
    applicationId: "AICTE-2026-9024",
    institutionId: "INST-MH-2041",
    institutionName: "Greenfield Institute of Technology, Pune",
    institutionEmail: "rolexleo345678@gmail.com",
    registrationNumber: "AICTE/WRO/2018/1-8933211",
    contactPerson: "Prof. Sunita Rao (Principal)",
    contactPhone: "+91 98450 77123",
    applicationType: "New Technical Campus Setup (B.Tech Computer Science)",
    region: "Western",
    processingRoute: "Scrutiny followed by EVC and SAC/SHC",
    currentStage: "Deficiency Raised",
    currentStatus: "Awaiting College Correction: Expired Fire NOC & Land Document Rectification",
    submittedAt: "2026-10-01T10:00:00Z",
    stageEnteredAt: "2026-10-20T14:30:00Z",
    stageDeadline: "2026-10-28T18:00:00Z",
    correctionDeadline: "2026-10-27T23:59:59Z", // Near deadline for simulation
    evcRequired: true,
    evcScheduledAt: null,
    escalationStatus: "Escalation Level 1 - Warning Sent",
    assignedReviewerId: "REV-WEST-01",
    assignedReviewerName: "Dr. R. Ramanathan",
    undertakingDescription: "Undertaking for Fire Safety compliance within statutory deadline.",
    undertakingDueDate: "2026-10-27T23:59:59Z"
  },
  // Clean Application 3: Pending EVC
  {
    applicationId: "AICTE-2026-7319",
    institutionId: "INST-NR-5512",
    institutionName: "Kalyan Polytechnic & Technology Campus, Delhi",
    institutionEmail: "polytechnic@kalyancampus.org",
    registrationNumber: "AICTE/NRO/2015/1-3094821",
    contactPerson: "Sh. Rajesh Gupta (Secretary)",
    contactPhone: "+91 98112 33499",
    applicationType: "Introduction of New Integrated Diploma Course",
    region: "Northern",
    processingRoute: "Scrutiny followed by EVC",
    currentStage: "Pending EVC",
    currentStatus: "Scrutiny Cleared - Ready for Expert Visit Committee Scheduling",
    submittedAt: "2026-09-25T11:15:00Z",
    stageEnteredAt: "2026-10-10T16:00:00Z",
    stageDeadline: "2026-11-10T18:00:00Z",
    correctionDeadline: null,
    evcRequired: true,
    evcScheduledAt: "2026-11-04T10:00:00Z",
    escalationStatus: "Normal",
    assignedReviewerId: "REV-NORTH-02",
    assignedReviewerName: "Smt. Ananya Sen",
    undertakingDescription: "Laboratory safety standards certified.",
    undertakingDueDate: "2026-11-30T00:00:00Z"
  }
];

export const INITIAL_DOCUMENTS = [
  // Docs for Scenario A (AICTE-2026-8841)
  {
    documentId: "DOC-8841-01",
    applicationId: "AICTE-2026-8841",
    institutionId: "INST-MH-1029",
    documentType: "Fire Safety Certificate",
    storageReference: "uploads/INST-MH-1029/fire_safety_2026.pdf",
    submittedAt: "2026-10-15T09:35:00Z",
    expiryDate: "2027-08-30",
    verificationStatus: "Verified & Compliant",
    ocrStatus: "Keywords Matched (100%)",
    verifiedBy: "Dr. R. Ramanathan",
    verifiedAt: "2026-10-18T11:20:00Z"
  },
  {
    documentId: "DOC-8841-02",
    applicationId: "AICTE-2026-8841",
    institutionId: "INST-MH-1029",
    documentType: "Occupancy or Building Completion Certificate",
    storageReference: "uploads/INST-MH-1029/building_occupancy.pdf",
    submittedAt: "2026-10-15T09:40:00Z",
    expiryDate: "2030-12-31",
    verificationStatus: "Verified & Compliant",
    ocrStatus: "Keywords Matched (95%)",
    verifiedBy: "Dr. R. Ramanathan",
    verifiedAt: "2026-10-18T11:25:00Z"
  },
  {
    documentId: "DOC-8841-03",
    applicationId: "AICTE-2026-8841",
    institutionId: "INST-MH-1029",
    documentType: "Structural Stability Certificate",
    storageReference: "uploads/INST-MH-1029/structural_stability.pdf",
    submittedAt: "2026-10-15T09:42:00Z",
    expiryDate: "2029-05-15",
    verificationStatus: "Verified & Compliant",
    ocrStatus: "Keywords Matched (90%)",
    verifiedBy: "Dr. R. Ramanathan",
    verifiedAt: "2026-10-18T11:30:00Z"
  },

  // Docs for Scenario B (AICTE-2026-9024) - Intentionally Deficient/Expiring
  {
    documentId: "DOC-9024-01",
    applicationId: "AICTE-2026-9024",
    institutionId: "INST-MH-2041",
    documentType: "Fire Safety Certificate",
    storageReference: "uploads/INST-MH-2041/fire_noc_old.pdf",
    submittedAt: "2026-10-01T10:05:00Z",
    expiryDate: "2026-10-24", // Already expired or right at current date!
    verificationStatus: "Deficiency Raised - Expired Certificate",
    ocrStatus: "Validity Expired on 24-Oct-2026",
    verifiedBy: "Dr. R. Ramanathan",
    verifiedAt: "2026-10-20T14:35:00Z",
    deficiencyReason: "Fire Safety NOC expired on 24-Oct-2026. Updated NOC from Pune Metropolitan Fire Brigade mandatory."
  },
  {
    documentId: "DOC-9024-02",
    applicationId: "AICTE-2026-9024",
    institutionId: "INST-MH-2041",
    documentType: "Land or Lease Documents",
    storageReference: "uploads/INST-MH-2041/lease_deed.pdf",
    submittedAt: "2026-10-01T10:10:00Z",
    expiryDate: "2026-11-05", // Expiring in 10 days!
    verificationStatus: "Flagged - Expiring Soon",
    ocrStatus: "Partial Registration Stamp",
    verifiedBy: "Dr. R. Ramanathan",
    verifiedAt: "2026-10-20T14:40:00Z",
    deficiencyReason: "Lease registered period requires renewal affirmation certificate."
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    logId: "AUDIT-001",
    applicationId: "AICTE-2026-8841",
    actorUid: "college.admin@apexengg.edu.in",
    actorRole: "College Admin",
    action: "SUBMIT_APPLICATION",
    previousStatus: "Draft",
    newStatus: "Automated Pre-Screening",
    reason: "New application submitted for route: Scrutiny followed by EVC",
    timestamp: "2026-10-15T09:30:00Z"
  },
  {
    logId: "AUDIT-002",
    applicationId: "AICTE-2026-8841",
    actorUid: "system-engine",
    actorRole: "Automated Pre-Screening",
    action: "AUTO_PRE_SCREENING",
    previousStatus: "Automated Pre-Screening",
    newStatus: "Scrutiny In Progress",
    reason: "OCR keywords passed (100%). Routed to Scrutiny Committee Western Region.",
    timestamp: "2026-10-15T09:45:00Z"
  },
  {
    logId: "AUDIT-003",
    applicationId: "AICTE-2026-9024",
    actorUid: "reviewer.ramanathan@aicte.gov.in",
    actorRole: "Reviewer",
    action: "RAISE_DEFICIENCY",
    previousStatus: "Scrutiny In Progress",
    newStatus: "Deficiency Raised",
    reason: "Fire Safety Certificate has expired. Awaiting college correction within 7 days.",
    timestamp: "2026-10-20T14:30:00Z"
  }
];
