/* ══════════════════════════════════════════════════════════════
   KTERN ENTERPRISE AI DOCUMENT WORKSPACE - CORE LOGIC & FLOWS
   Interactive Conversational Workspace + Dynamic Agent Pipelines
   ══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatMessages = document.getElementById('chatMessages');
  const welcomeState = document.getElementById('welcomeState');
  const followupBar = document.getElementById('followupBar');
  const followupChips = document.getElementById('followupChips');
  const sidebar = document.getElementById('sidebar');
  const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
  const sidebarExpandBtn = document.getElementById('sidebarExpandBtn');
  const newChatBtn = document.getElementById('newChatBtn');
  const activeModel = document.getElementById('activeModel');
  const toggleDocPanel = document.getElementById('toggleDocPanel');
  const docPanel = document.getElementById('docPanel');
  const searchChats = document.getElementById('searchChats');
  const conversationList = document.getElementById('conversationList');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');

  // Doc Panel Workspace elements
  const docEmptyState = document.getElementById('docEmptyState');
  const docContent = document.getElementById('docContent');
  const docSections = document.getElementById('docSections');
  const docCoverClient = document.getElementById('docCoverClient');
  const docCoverTitle = document.getElementById('docCoverTitle');
  const docCoverDate = document.getElementById('docCoverDate');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const fullscreenDocBtn = document.getElementById('fullscreenDocBtn');
  const jsonOutput = document.getElementById('jsonOutput');
  const copyJsonBtn = document.getElementById('copyJsonBtn');

  // Tabs
  const docTabs = document.querySelectorAll('.doc-tab');
  const tabContentPreview = document.getElementById('tabContentPreview');
  const tabContentAgents = document.getElementById('tabContentAgents');
  const tabContentVersions = document.getElementById('tabContentVersions');
  const tabContentJson = document.getElementById('tabContentJson');

  // Overlays & Progress
  const pdfOverlay = document.getElementById('pdfOverlay');
  const cancelPdfBtn = document.getElementById('cancelPdfBtn');
  const pdfS1 = document.getElementById('pdfS1');
  const pdfS2 = document.getElementById('pdfS2');
  const pdfS3 = document.getElementById('pdfS3');

  // --- Workspace State Store ---
  let isGenerating = false;
  let docState = {
    title: "",
    client: "KaarTech Enterprise",
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    sections: []
  };

  let versions = [];
  let conversationHistory = [];
  let currentPromptIndex = 0;
  let currentChatId = null;
  let activeMessages = [];

  // --- Document Knowledge Base (SAP S/4HANA Migration Proposal Template) ---
  const initialProposalData = {
    title: "SAP ECC to S/4HANA Migration Proposal",
    client: "KaarTech Enterprise Solutions",
    sections: [
      {
        id: "exec_summary",
        title: "Executive Summary",
        icon: "fa-file-signature",
        content: "KaarTech is pleased to present this comprehensive migration proposal to transform your current SAP ECC landscape into a high-performance SAP S/4HANA Digital Core. By leveraging our proprietary multi-agent framework and automation tools, we guarantee a secure, clean-core migration path with minimized business downtime. This initiative aims to accelerate operational efficiency, deliver real-time data analytics, and provide an agile IT platform to fuel long-term corporate growth."
      },
      {
        id: "objectives",
        title: "Project Objectives",
        icon: "fa-bullseye",
        content: "<ul><li><strong>Digital Core Realization:</strong> Upgrade standard database layers into highly responsive SAP HANA in-memory architectures.</li><li><strong>Clean Core Strategy:</strong> Rationalize legacy custom builds and custom codes (Z-tables) by up to 45% through strict system clean-up.</li><li><strong>Real-time Insights:</strong> Enable immediate access to inventory analytics, financial dashboards, and manufacturing pipeline status.</li><li><strong>Enterprise Agility:</strong> Build a scalable cloud infrastructure compatible with next-gen cloud capabilities and AI integrations.</li></ul>"
      },
      {
        id: "scope",
        title: "Scope of Work",
        icon: "fa-arrows-to-eye",
        content: "<p>The scope encompasses the end-to-end modernization of the legacy SAP suite:</p><table class='doc-table'><thead><tr><th>In-Scope Areas</th><th>Out-of-Scope Areas</th></tr></thead><tbody><tr><td>Database migration from AnyDB to SAP HANA</td><td>Non-SAP third-party CRM system replacements</td><td>Custom code profiling & refactoring</td><td>Desktop hardware provisioning</td><td>Fiori UX activation & customization</td><td>End-user client operating system upgrades</td></tr></tbody></table>"
      },
      {
        id: "timeline",
        title: "Migration Timeline & Phases",
        icon: "fa-calendar-days",
        content: "<div class='timeline-list'><div class='timeline-node'><div class='timeline-phase'>Phase 1: Assessment & Planning</div><div class='timeline-duration'>Weeks 1 - 4</div><div class='timeline-desc'>Execute KTern code profiling, assess system custom code complexity, and establish migration blueprint.</div></div><div class='timeline-node'><div class='timeline-phase'>Phase 2: Database & Architecture Setup</div><div class='timeline-duration'>Weeks 5 - 8</div><div class='timeline-desc'>Provision targeted cloud landing zones and construct sandbox environments for dry-run migrations.</div></div><div class='timeline-node'><div class='timeline-phase'>Phase 3: Code Refactoring & Data Migration</div><div class='timeline-duration'>Weeks 9 - 14</div><div class='timeline-desc'>Optimize standard structures, migrate master/transactional data, and execute clean-core rules.</div></div><div class='timeline-node'><div class='timeline-phase'>Phase 4: Validation & UAT</div><div class='timeline-duration'>Weeks 15 - 18</div><div class='timeline-desc'>Run automated checks, perform full User Acceptance Testing cycles, and complete final user training.</div></div></div>"
      }
    ]
  };

  const initialUatData = {
    title: "User Acceptance Testing (UAT) Plan",
    client: "KaarTech Enterprise Solutions",
    sections: [
      {
        id: "uat_summary",
        title: "Executive Summary",
        icon: "fa-clipboard-check",
        content: "This document defines the comprehensive User Acceptance Testing (UAT) plan for the SAP S/4HANA Go-Live phase. The main objective is to systematically validate core business process workflows, custom Fiori UI layouts, and high-performance in-memory transactional processing against actual business operating expectations. Successful completion of this plan is a critical gatekeeper for production deployment, ensuring full operational readiness, compliance, and zero post-go-live operational disruption.<p>To ensure high quality, the validation squad has mapped end-to-end integration threads across global production lines. Testing will cover functional accuracy under extreme workloads, checking database write performance, ledger postings, and automated material syncs. Key stakeholders from manufacturing, supply chain, and FICO will actively drive execution, logging discrepancies in real time to secure sign-off.</p>"
      },
      {
        id: "uat_strategy",
        title: "UAT Strategy & Scope",
        icon: "fa-gauge-high",
        content: "<ul><li><strong>Business Scenario Validation:</strong> Focused on end-to-end processing across Finance (FICO), Sales (SD), and Materials Management (MM). This ensures that real-world operations, such as order fulfilment and physical scanner reconciliations, flow dynamically through the target cloud architecture.</li><li><strong>Fiori UX Accessibility:</strong> Verifying role-based dashboards, personalized transaction tiles, mobile response times, and localized catalog translations for all business units.</li><li><strong>Performance Thresholds:</strong> Testing high-volume database query peaks during peak operational hours to guarantee that average transaction response times remain below 1.5 seconds.</li><li><strong>Regression Testing Safeguards:</strong> Running automated regression suites on standard and custom code blocks (Z-tables) after bug remediations to prevent structural blocks or custom code regressions.</li><li><strong>User Sign-off:</strong> Departmental heads must actively verify and sign off on all designated critical scenarios prior to the official cutover window.</li></ul><p>Our strategy also embeds specific entry gates: the environment must have a 99% master data sync from ECC, all previous integration testing phases must be completed with zero critical defects outstanding, and all testers must complete their Fiori navigation certification. Any defect discovered during UAT will follow a strict triage matrix to assess operational impact and code complexity before hotfixes are approved.</p>"
      },
      {
        id: "uat_cases",
        title: "Key UAT Test Scenarios",
        icon: "fa-list-check",
        content: "<p>The core business scenarios scheduled for customer sign-off. These represent end-to-end business threads containing standard transactions, custom reports, and third-party APIs:</p><table class='doc-table'><thead><tr><th>Test ID</th><th>Business Process Scenario</th><th>Role Owner</th><th>Expected Result</th><th>Severity</th></tr></thead><tbody><tr><td>UAT-OTC-01</td><td>Order-to-Cash (O2C) processing via Fiori</td><td>Sales Specialist</td><td>Order created, delivery note logged, invoice generated in &lt; 2s</td><td><span class='badge badge-high'>High</span></td></tr><tr><td>UAT-P2P-02</td><td>Procure-to-Pay (P2P) automated invoice matching</td><td>Procurement Mgr</td><td>Automated three-way match and payment release without errors</td><td><span class='badge badge-high'>High</span></td></tr><tr><td>UAT-FIN-03</td><td>General Ledger closing &amp; trial balance reports</td><td>Finance Director</td><td>Instantaneous in-memory database queries across multiple business entities</td><td><span class='badge badge-critical'>Critical</span></td></tr><tr><td>UAT-OT-04</td><td>Shop-floor OT integration &amp; material sync</td><td>Operations Supervisor</td><td>Physical stock scanner registers immediately inside SAP Core</td><td><span class='badge badge-medium'>Medium</span></td></tr></tbody></table><p>All test cases must be executed exactly as specified in the standard operating procedures. Testers are required to attach visual screenshots of the completed Fiori tiles and transaction success messages as verification proof before marking cases as passed inside the central workspace tracker.</p>"
      },
      {
        id: "uat_timeline",
        title: "UAT Execution Timeline & Gates",
        icon: "fa-calendar-days",
        content: "<div class='timeline-list'><div class='timeline-node'><div class='timeline-phase'>Phase 1: Environment Readiness &amp; Data Prep</div><div class='timeline-duration'>Weeks 1 - 2</div><div class='timeline-desc'>Construct sandbox test beds, refresh transactional data, and provision Fiori testing login keys.</div></div><div class='timeline-node'><div class='timeline-phase'>Phase 2: Core UAT Execution Cycle 1</div><div class='timeline-duration'>Weeks 3 - 4</div><div class='timeline-desc'>Execute key transactional workflows and document standard/custom code system bugs.</div></div><div class='timeline-node'><div class='timeline-phase'>Phase 3: Bug Remediation &amp; Cycle 2</div><div class='timeline-duration'>Weeks 5 - 6</div><div class='timeline-desc'>Remediate Z-table code locks and execute regression test scripts to verify fixes.</div></div><div class='timeline-node'><div class='timeline-phase'>Phase 4: Stakeholder Sign-Off &amp; Go-Live Prep</div><div class='timeline-duration'>Week 7</div><div class='timeline-desc'>Obtain departmental head sign-offs and execute final cutover plan checklists.</div></div></div><p>We enforce strict stage-gates between phases. Progression from Cycle 1 to Cycle 2 requires that all Critical severity defects have been successfully refactored and re-tested. Final approval requires a 100% pass rate on High and Critical scenarios and a signed executive authorization from the steering committee.</p>"
      }
    ]
  };

  const initialFrsData = {
    title: "Functional Requirements Specification (FRS)",
    client: "KaarTech Enterprise Solutions",
    sections: [
      {
        id: "frs_summary",
        title: "Executive Summary",
        icon: "fa-gears",
        content: "This Functional Requirements Specification (FRS) provides a highly detailed roadmap for standard and custom module integrations in the target SAP S/4HANA system. By defining explicit functional rules for key modules (FICO, MM, SD), this document guides application development, testing configurations, and security authorization setups, ensuring full alignment with enterprise workflows.<p>The modern FRS acts as the primary blueprint for developers, functional consultants, and business analysts. By translating strategic business needs into low-level configuration steps, we prevent scope creep, minimize development rework by 40%, and align with SAP's standard Clean Core recommendations.</p>"
      },
      {
        id: "frs_architecture",
        title: "Functional Scope & Architecture",
        icon: "fa-network-wired",
        content: "<ul><li><strong>Process Scope:</strong> End-to-end standard transaction routing, modular master data structures, and cross-application document flow (Sales Order -> Delivery -> Billing).</li><li><strong>Fiori UX Guidelines:</strong> Role-based personalized tiles, standard catalog configurations, custom semantic objects, and responsive dashboard flows.</li><li><strong>Security Mapping:</strong> Enterprise-wide user authorization groups based on standard SOD (Segregation of Duties) models and role-specific GRC configurations.</li><li><strong>Standard Core Isolation:</strong> Eliminating direct core modifications (Z-tables) by implementing side-by-side extensions using the SAP Business Technology Platform (BTP).</li></ul><p>We enforce a strict extension model: standard Fiori apps must be utilized first. Custom UI creation is only authorized when specific, certified user-journey gaps are identified. All custom interfaces must inherit the standard SAP Fiori Horizon theme classes to ensure design uniformity.</p>"
      },
      {
        id: "frs_matrix",
        title: "Functional Requirements Matrix",
        icon: "fa-table-list",
        content: "<p>Standard functional requirements prioritized for the modern implementation wave. These have been approved by the steering committee:</p><table class='doc-table'><thead><tr><th>Req ID</th><th>Module Focus</th><th>Functional Requirement Description</th><th>Priority</th><th>Complexity</th></tr></thead><tbody><tr><td>FRS-FICO-01</td><td>Finance</td><td>Real-time cost center ledger posting with automatic regional tax calculations</td><td><span class='badge badge-high'>High</span></td><td>Medium</td></tr><tr><td>FRS-MM-02</td><td>Materials Mgmt</td><td>Automated reorder point threshold triggers connected with global supplier APIs</td><td><span class='badge badge-critical'>Critical</span></td><td>High</td></tr><tr><td>FRS-SD-03</td><td>Sales &amp; Dist</td><td>Instantaneous stock availability checks (aATP) during mobile quote drafting</td><td><span class='badge badge-high'>High</span></td><td>High</td></tr><tr><td>FRS-UX-04</td><td>Fiori UX</td><td>Deploy custom responsive catalog tiles for purchase requisition sign-offs</td><td><span class='badge badge-medium'>Medium</span></td><td>Low</td></tr></tbody></table><p>Each requirement must be verified inside the designated quality assurance sandbox through custom mock transactional uploads. The functional architect must sign off on unit test results before promoting configurations to the central regression pipeline.</p>"
      }
    ]
  };

  const initialBrdData = {
    title: "Business Requirements Document (BRD)",
    client: "KaarTech Enterprise Solutions",
    sections: [
      {
        id: "brd_vision",
        title: "Project Vision & Context",
        icon: "fa-lightbulb",
        content: "This Business Requirements Document (BRD) establishes the high-level business vision and core goals for our digital core modernization. The target is to replace fragmented legacy transactional systems with a unified, cloud-ready digital backbone, reducing overall operational costs, speeding up reporting, and empowering management with instant business performance intelligence.<p>By transitioning to an in-memory database architecture, KaarTech Enterprise will eliminate batch processing, establish a single source of truth (Universal Journal), and enable predictive forecasting models. This strategic upgrade directly positions the organization to scale and integrate AI-driven operational tools.</p>"
      },
      {
        id: "brd_stakeholders",
        title: "Business Stakeholder Analysis",
        icon: "fa-users-gear",
        content: "<ul><li><strong>C-Suite Executives:</strong> Require instant financial closing, real-time KPI indicators, global asset visibility, and automated compliance auditing.</li><li><strong>Operational Managers:</strong> Require automated inventory alerts, optimized shipping timetables, automated supplier lead matching, and reduced manual spreadsheet overheads.</li><li><strong>IT Department:</strong> Target standard support simplification, retired custom codes, standard patch upgrades, and lower overall system maintenance costs.</li></ul><p>The primary success metric is the reduction of total cost of ownership (TCO) by 25% and accelerating month-end close cycles from 5 days down to a single operational day. Stakeholders from all regions have contributed to these design constraints.</p>"
      },
      {
        id: "brd_requirements",
        title: "Core Business Requirements Matrix",
        icon: "fa-list-check",
        content: "<p>Critical high-level business requirements gathered from cross-departmental workshops and signed off by regional sponsors:</p><table class='doc-table'><thead><tr><th>Req ID</th><th>Business Requirement / Need</th><th>Stakeholder Value</th><th>Priority</th></tr></thead><tbody><tr><td>BRD-REQ-01</td><td>Instantaneous consolidated financial reporting across multi-national units</td><td>Accelerates audit and quarterly planning cycles by 35%</td><td><span class='badge badge-critical'>Critical</span></td></tr><tr><td>BRD-REQ-02</td><td>Fully unified customer procurement history dashboard</td><td>Increases customer satisfaction and cross-selling potentials</td><td><span class='badge badge-high'>High</span></td></tr><tr><td>BRD-REQ-03</td><td>Standardized warehouse dispatch automation across operations</td><td>Drastically decreases manual scheduling overheads and errors</td><td><span class='badge badge-high'>High</span></td></tr><tr><td>BRD-REQ-04</td><td>Zero-downtime cutover timeline with safe rollback contingencies</td><td>Protects running retail/manufacturing operations from halts</td><td><span class='badge badge-critical'>Critical</span></td></tr></tbody></table><p>All requirements will be actively tracked inside our central tracing database. Functional specifications (FRS) must map directly to these business needs to guarantee 100% architectural alignment and prevent scope creep.</p>"
      }
    ]
  };

  const initialCharterData = {
    title: "Project Charter",
    client: "KaarTech Enterprise Solutions",
    sections: [
      {
        id: "charter_summary",
        title: "Executive Summary & Background",
        icon: "fa-award",
        content: "This Project Charter officially authorizes the SAP Modernization Initiative, defining high-level objectives, key stakeholders, and project governance framework. By establishing clear roles, scopes, and success criteria, this charter serves as the primary authorization guide and agreement between business owners and the integration partners.<p>Our historical systems have served the enterprise well, but now present significant support constraints. This initiative modernizes our foundational structures, replacing legacy platforms with a highly responsive, clean-core hybrid cloud setup to fuel our global expansion plans.</p>"
      },
      {
        id: "charter_objectives",
        title: "Project Objectives & KPI Metrics",
        icon: "fa-chart-line",
        content: "<ul><li><strong>Operational Excellence:</strong> Reduce manual reporting cycles by 40% using automated SAP Fiori standard applications.</li><li><strong>System Optimization:</strong> Achieve a 50% database volume footprint reduction using SAP HANA data compression.</li><li><strong>Project Timetable:</strong> Complete entire sandbox, development, QA, and production migrations inside designated milestones.</li><li><strong>Clean Core Adherence:</strong> Retain standard setups, eliminating custom Z-table clutter by 45%.</li></ul><p>The steering committee will evaluate project performance at the end of each stage-gate, requiring certified business approvals before releasing funds for subsequent execution phases.</p>"
      },
      {
        id: "charter_directory",
        title: "Project Stakeholder Directory",
        icon: "fa-id-card",
        content: "<p>Primary project leadership directory and key governance roles approved by the executive board:</p><table class='doc-table'><thead><tr><th>Project Role</th><th>Assigned Leader</th><th>Core Responsibility / Governance Area</th></tr></thead><tbody><tr><td>Executive Sponsor</td><td>Marcus Sterling</td><td>Financial approvals, executive updates, and high-level steering</td></tr><tr><td>Project Manager</td><td>Sarah Jenkins</td><td>Timeline tracking, resource management, and risk mitigations</td></tr><tr><td>SAP Solution Architect</td><td>Anand Kumar</td><td>Technical blueprints, system design, and migration pipelines</td></tr><tr><td>Quality Assurance Lead</td><td>Elena Rostova</td><td>UAT execution, validation audits, and regression sign-offs</td></tr></tbody></table><p>All escalations regarding technical boundaries, budget re-allocations, or timeline adjustments will be routed to the Project Manager and signed off by the Executive Sponsor in writing.</p>"
      }
    ]
  };

  // Follow-up prompts content modifications
  const timelineReductionData = {
    id: "timeline",
    title: "Accelerated S/4HANA Migration Timeline",
    icon: "fa-calendar-days",
    content: "<div class='timeline-list'><div class='timeline-node'><div class='timeline-phase'>Phase 1: Automated Assessment & Prep</div><div class='timeline-duration'>Weeks 1 - 2 (Accelerated)</div><div class='timeline-desc'>Utilize KTern Multi-Agent profilers to analyze custom code models in under 48 hours, trimming standard cycles by 50%.</div></div><div class='timeline-node'><div class='timeline-phase'>Phase 2: Cloud Landing Zone Construction</div><div class='timeline-duration'>Weeks 3 - 4</div><div class='timeline-desc'>Build isolated, automated cloud migration pipelines to deploy staging and sandbox servers.</div></div><div class='timeline-node'><div class='timeline-phase'>Phase 3: Automated Remediation & Migration</div><div class='timeline-duration'>Weeks 5 - 8 (Aggressive)</div><div class='timeline-desc'>Deploy our formatting and refactoring agents to automatically clean up 80% of custom code anomalies.</div></div><div class='timeline-node'><div class='timeline-phase'>Phase 4: Parallel Validation & Go-Live</div><div class='timeline-duration'>Weeks 9 - 10</div><div class='timeline-desc'>Perform rapid unit testing and user sign-offs. Cut migration timeline down from 18 to 10 weeks.</div></div></div>"
  };

  const risksData = {
    id: "risks",
    title: "Risk Analysis & Mitigations",
    icon: "fa-triangle-exclamation",
    content: "<p>Key project risks identified by the Validation Agent with mitigation pipelines:</p><div class='risk-item'><div class='risk-title'>1. Custom Code Incompatibility</div><div class='risk-desc'>Standard ECC modifications may crash in the new S/4HANA structures.</div><div class='risk-impact'>Impact: Critical</div><p class='risk-desc'><strong>Mitigation:</strong> Deploy automated Formatting Agents to pre-check and auto-rewrite deprecated legacy code snippets.</p></div><div class='risk-item'><div class='risk-title'>2. Business Operations Downtime</div><div class='risk-desc'>System transition freeze could disrupt logistics and inventory workflows.</div><div class='risk-impact'>Impact: High</div><p class='risk-desc'><strong>Mitigation:</strong> Adopt Near-Zero Downtime (NZDT) data migration models during off-peak weekend hours.</p></div>"
  };

  const manufacturingDomainData = {
    id: "exec_summary",
    title: "Executive Summary (Manufacturing Domain)",
    icon: "fa-industry",
    content: "KaarTech is pleased to present this comprehensive SAP S/4HANA migration proposal tailored specifically for the manufacturing sector. By upgrading your existing SAP ECC systems, we will integrate shop-floor operational technology (OT) with enterprise planning dashboards. This digital core transformation guarantees real-time materials tracking, automated supply-chain risk alerts, and optimized capacity planning, drastically improving Overall Equipment Effectiveness (OEE) and supply network resilience."
  };

  const kternAutomationData = {
    id: "ktern_benefits",
    title: "KTern Enterprise Automation Benefits",
    icon: "fa-robot",
    content: "<ul><li><strong>Automated Assessment:</strong> Analyze full system landscape compatibility and identify potential migration blockades in hours instead of days.</li><li><strong>Custom Code Remediation:</strong> Auto-refactor and optimize deprecated structures, cutting manual developer code correction hours by 60%.</li><li><strong>Auto-Generated Test Cycles:</strong> Instantly map test plans, execute functional test suites, and log runtime errors automatically inside our workspace.</li><li><strong>Orchestrated cutover:</strong> Real-time coordinator agent tracks dependencies, milestones, and status metrics to achieve seamless go-live.</li></ul>"
  };

  const architectureData = {
    id: "architecture",
    title: "System Landscape Architecture",
    icon: "fa-diagram-project",
    content: "<p>The modernized S/4HANA target hybrid-cloud structure verified by our Orchestrator Agent:</p><div class='diagram-container'><div class='diagram-placeholder'><i class='fa-solid fa-network-wired'></i><span>SAP S/4HANA Core Architecture Diagram Ready</span><span style='font-size:0.7rem; color:var(--brand-blue)'>[ Hybrid Cloud Setup &middot; Azure/AWS Landing Zone &middot; SAP Fiori UX Gateway ]</span></div></div>"
  };

  // --- Initial Setup ---
  initTheme();
  setupEventListeners();
  loadAllConversations();

  // --- Theme Controller ---
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info');
  }

  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      themeIcon.className = 'fa-solid fa-sun';
      themeToggleBtn.querySelector('span').textContent = 'Light Mode';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
      themeToggleBtn.querySelector('span').textContent = 'Dark Mode';
    }
  }

  // --- Sidebar Collapse ---
  sidebarCollapseBtn.addEventListener('click', () => {
    sidebar.classList.add('collapsed');
    sidebarExpandBtn.classList.remove('hidden');
  });

  sidebarExpandBtn.addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
    sidebarExpandBtn.classList.add('hidden');
  });

  // --- Doc Panel Toggle ---
  toggleDocPanel.addEventListener('click', () => {
    docPanel.classList.toggle('collapsed');
  });

  // --- Tabs Navigation ---
  docTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      docTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetTab = tab.getAttribute('data-tab');
      tabContentPreview.classList.remove('active');
      tabContentAgents.classList.remove('active');
      tabContentVersions.classList.remove('active');
      tabContentJson.classList.remove('active');

      if (targetTab === 'preview') tabContentPreview.classList.add('active');
      else if (targetTab === 'agents') tabContentAgents.classList.add('active');
      else if (targetTab === 'versions') tabContentVersions.classList.add('active');
      else if (targetTab === 'json') tabContentJson.classList.add('active');
    });
  });

  // --- Textarea Autogrow & Key Bindings ---
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
    sendBtn.disabled = !chatInput.value.trim();
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleInputSubmission();
    }
  });

  sendBtn.addEventListener('click', handleInputSubmission);

  // --- Templates & Suggestions Click ---
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-prompt]');
    if (target) {
      const prompt = target.getAttribute('data-prompt');
      chatInput.value = prompt;
      chatInput.style.height = 'auto';
      sendBtn.disabled = false;
      handleInputSubmission();
    }
  });

  function setupEventListeners() {
    newChatBtn.addEventListener('click', () => resetChatWorkspace(true));
    themeToggleBtn.addEventListener('click', toggleTheme);
    copyJsonBtn.addEventListener('click', copyJsonToClipboard);
    if (fullscreenDocBtn) {
      fullscreenDocBtn.addEventListener('click', toggleFullscreen);
    }
    downloadPdfBtn.addEventListener('click', generatePdfFromState);
    cancelPdfBtn.addEventListener('click', () => pdfOverlay.classList.add('hidden'));

    // Search filter
    searchChats.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.conversation-item').forEach(item => {
        const titleSpan = item.querySelector('.conversation-main-info span');
        const text = titleSpan ? titleSpan.textContent.toLowerCase() : item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
      });
    });
  }

  // --- Reset Workspace ---
  function resetChatWorkspace(showToastMessage = true) {
    chatMessages.innerHTML = '';
    chatMessages.appendChild(welcomeState);
    welcomeState.classList.remove('hidden');
    followupBar.classList.add('hidden');
    docEmptyState.classList.remove('hidden');
    docContent.classList.add('hidden');
    docSections.innerHTML = '';
    downloadPdfBtn.disabled = true;
    docPanelStatus.textContent = "Awaiting input...";
    activeModel.textContent = "AI Ready";
    docState = { title: "", client: "KaarTech Enterprise", date: new Date().toLocaleDateString('en-US'), sections: [] };
    versions = [];
    currentPromptIndex = 0;

    currentChatId = null;
    activeMessages = [];
    localStorage.removeItem('ktern_active_chat_id');
    updateSidebarListOnly();

    updateJsonViewer();
    updateVersionsTab();
    if (showToastMessage) {
      showToast("New conversational workspace created", "info");
    }
  }

  // --- Chat Input Submission Manager ---
  function handleInputSubmission() {
    const text = chatInput.value.trim();
    if (!text || isGenerating) return;

    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Remove welcome state if visible
    if (!welcomeState.classList.contains('hidden')) {
      welcomeState.classList.add('hidden');
    }

    // Append User Message
    appendMessage(text, 'user');
    isGenerating = true;
    activeModel.textContent = "Multi-Agent Orchestrating...";

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate Agent Workspace Pipeline Execution
    executeMultiAgentPipeline(text);
  }

  // --- Message Appender ---
  function appendMessage(text, sender, saveToState = true) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = sender === 'user' ? 'U' : '<i class="fa-solid fa-robot"></i>';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = text;

    contentDiv.appendChild(bubble);

    // Actions
    if (sender === 'assistant') {
      const actions = document.createElement('div');
      actions.className = 'message-actions';
      actions.innerHTML = `
        <button class="msg-action-btn" title="Copy response"><i class="fa-solid fa-copy"></i> Copy</button>
        <button class="msg-action-btn" title="Regenerate"><i class="fa-solid fa-arrows-rotate"></i> Retry</button>
      `;
      actions.querySelector('.msg-action-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(bubble.textContent);
        showToast("Message copied to clipboard", "success");
      });
      contentDiv.appendChild(actions);
    }

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (saveToState) {
      if (!currentChatId) {
        currentChatId = 'chat_' + Date.now();
      }
      activeMessages.push({ sender, text });
      saveActiveChat();
    }

    return bubble;
  }

  // --- Multi-Agent Pipeline Simulator ---
  function executeMultiAgentPipeline(userPrompt) {
    // 1. Show dynamic loading assistant bubble
    const assistantBubble = appendMessage('<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>', 'assistant', false);

    // 2. Initialize Agent Tab UI
    tabContentAgents.innerHTML = `
      <div class="agent-monitor-panel">
        <div class="agent-monitor-title">Live Agent Engine Logs</div>
        <div class="agent-monitor-logs" id="agentLogs"></div>
      </div>
      <div class="agent-pipeline" id="pipelineNodes"></div>
    `;

    const pipelineNodes = document.getElementById('pipelineNodes');
    const agentLogs = document.getElementById('agentLogs');

    const agents = [
      { name: "Coordinator Agent", icon: "fa-user-tie", task: "Planning and scheduling workspace workflow...", model: "Gemini 3.5 Pro", latency: "0.8s" },
      { name: "Content Agent", icon: "fa-pen-nib", task: "Drafting high-quality enterprise copy...", model: "Claude 3.5 Sonnet", latency: "1.8s" },
      { name: "Validation Agent", icon: "fa-shield-halved", task: "Verifying standards and clean-core design...", model: "Gemini 3.5 Flash", latency: "1.1s" },
      { name: "Formatting Agent", icon: "fa-paint-roller", task: "Structuring layouts, lists, and tables...", model: "DeepSeek V3", latency: "0.9s" },
      { name: "MCP Gateway", icon: "fa-circle-nodes", task: "Calling system APIs and fetching visuals...", model: "Tool Executor", latency: "1.4s" },
      { name: "PDF Compiler", icon: "fa-file-pdf", task: "Building PDF print specifications...", model: "ReportLab Engine", latency: "0.5s" }
    ];

    // Build pipeline nodes visually
    agents.forEach((agent, index) => {
      const node = document.createElement('div');
      node.className = 'agent-node';
      node.id = `agent-node-${index}`;
      node.innerHTML = `
        <div class="agent-icon"><i class="fa-solid ${agent.icon}"></i></div>
        <div class="agent-details">
          <div class="agent-name-row">
            <span class="agent-name">${agent.name}</span>
            <span class="agent-status-badge">Idle</span>
          </div>
          <div class="agent-task">${agent.task}</div>
          <div class="agent-meta">
            <div class="agent-meta-item"><i class="fa-solid fa-brain"></i> ${agent.model}</div>
            <div class="agent-meta-item"><i class="fa-solid fa-clock"></i> ${agent.latency}</div>
          </div>
        </div>
      `;
      pipelineNodes.appendChild(node);

      if (index < agents.length - 1) {
        const connector = document.createElement('div');
        connector.className = 'agent-connector';
        connector.id = `agent-connector-${index}`;
        pipelineNodes.appendChild(connector);
      }
    });

    // Run progressive pipeline animation
    let step = 0;
    function runNextStep() {
      if (step > 0) {
        const prevNode = document.getElementById(`agent-node-${step - 1}`);
        prevNode.className = 'agent-node completed';
        prevNode.querySelector('.agent-status-badge').textContent = 'Completed';
        prevNode.querySelector('.agent-icon').innerHTML = '<i class="fa-solid fa-check"></i>';

        const prevConnector = document.getElementById(`agent-connector-${step - 1}`);
        if (prevConnector) prevConnector.style.backgroundColor = '#10b981';
      }

      if (step < agents.length) {
        const currentNode = document.getElementById(`agent-node-${step}`);
        currentNode.className = 'agent-node active';
        currentNode.querySelector('.agent-status-badge').textContent = 'Running';

        // Add log
        const logLine = document.createElement('div');
        logLine.className = 'agent-log-line';
        logLine.innerHTML = `[${new Date().toLocaleTimeString()}] <span style="color:var(--brand-red)">${agents[step].name}</span>: ${agents[step].task}`;
        agentLogs.appendChild(logLine);
        agentLogs.parentElement.scrollTop = agentLogs.parentElement.scrollHeight;

        step++;
        setTimeout(runNextStep, 900);
      } else {
        // Pipeline completed. Stream response content.
        isGenerating = false;
        activeModel.textContent = "AI Ready";
        streamAIResponse(userPrompt, assistantBubble);
      }
    }

    // Launch pipeline sequence
    runNextStep();
  }

  // --- Response Generator / Document Modifiers ---
  async function streamAIResponse(prompt, chatBubbleElement) {
    let replyText = "";
    let updateDescription = "";

    // Normalize prompt strings to match user actions
    const cleanPrompt = prompt.toLowerCase();

    if (cleanPrompt.includes('reduce') || cleanPrompt.includes('timeline')) {
      // 1. Reduce Timeline
      updateDocumentSection(timelineReductionData);
      replyText = "Our <strong>Formatting & Planning Agents</strong> have successfully redesigned your migration architecture. The plan is now accelerated, utilizing automated tools to reduce the schedule from <strong>18 down to 10 weeks</strong>. I have updated the <strong>Timeline & Phases</strong> card in the document workspace live.";
      updateDescription = "Reduced timeline via automation";
    }
    else if (cleanPrompt.includes('risk') || cleanPrompt.includes('mitigation')) {
      // 2. Add Risks
      insertDocumentSection(risksData);
      replyText = "The <strong>Validation Agent</strong> has run a full risk profiling suite against your ECC custom setups. I have appended a dedicated <strong>Risk Analysis & Mitigations</strong> section to your live document detailing critical custom code and system freeze mitigations.";
      updateDescription = "Added custom code risk profiling";
    }
    else if (cleanPrompt.includes('manufacturing')) {
      // 3. Manufacturing Domain
      updateDocumentSection(manufacturingDomainData);
      replyText = "I have customized the executive summary specifically for a <strong>manufacturing domain</strong>. The focus has been aligned with industrial automation integration, materials tracking protocols, and Overall Equipment Effectiveness (OEE) metrics.";
      updateDescription = "Refocused on manufacturing industry domain";
    }
    else if (cleanPrompt.includes('automation') || cleanPrompt.includes('ktern')) {
      // 4. KTern Automation
      insertDocumentSection(kternAutomationData);
      replyText = "I have appended the <strong>KTern Automation Benefits</strong> module to your document. This outlines automated profiling, auto-generated testing matrices, and orchestrated core configurations in your digital upgrade pipeline.";
      updateDescription = "Integrated KTern automation benefits";
    }
    else if (cleanPrompt.includes('architecture') || cleanPrompt.includes('diagram')) {
      // 5. Architecture
      insertDocumentSection(architectureData);
      replyText = "Our <strong>MCP Landscape Agent</strong> has fetched and generated a verified hybrid cloud migration architecture blueprint. I have inserted the high-res layout panel at the end of the proposal document workspace.";
      updateDescription = "Embedded cloud landscape architecture blueprint";
    }
    else {
      // 6. Check if document is already initialized. If yes, this is a follow-up Q&A query!
      if (docState.sections && docState.sections.length > 0) {
        chatBubbleElement.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
        try {
          const history = [];
          const bubbles = document.querySelectorAll('.message-bubble');
          const messages = document.querySelectorAll('.message');
          for (let idx = Math.max(0, messages.length - 4); idx < messages.length - 1; idx++) {
            const sender = messages[idx].classList.contains('user') ? 'user' : 'assistant';
            const text = bubbles[idx] ? bubbles[idx].textContent : '';
            history.push({ sender, text });
          }

          const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: prompt,
              history: history,
              doc_context: docState
            })
          });
          const data = await response.json();
          replyText = data.reply;
        } catch (err) {
          replyText = `As your KTern consulting assistant, I've analyzed your query: '${prompt}'. To adjust the timeline to 10 weeks, type 'reduce timeline'. To see risk items, type 'show risks'.`;
        }
        updateDescription = ""; // General Q&A does not modify the document
      } else {
        // Decide which template to compile based on keywords in the initial prompt!
        if (cleanPrompt.includes('uat') || cleanPrompt.includes('user acceptance')) {
          initializeDocument(initialUatData);
          replyText = "Here is the first draft of your <strong>User Acceptance Testing (UAT) Plan</strong>. Our multi-agent squad has prepared the UAT Strategy, testing scopes, detailed key business scenarios, and the execution timelines. The document is active in the workspace panel.";
          updateDescription = "Initial UAT Test Plan compiled";
        }
        else if (cleanPrompt.includes('frs') || cleanPrompt.includes('functional requirements')) {
          initializeDocument(initialFrsData);
          replyText = "Here is the first draft of your <strong>Functional Requirements Specification (FRS)</strong>. Our content and formatting agents have drafted the Functional Architecture, Module Scope, and Fiori UI enhancements list. The document is loaded in the workspace.";
          updateDescription = "Initial Functional Specification compiled";
        }
        else if (cleanPrompt.includes('brd') || cleanPrompt.includes('business requirements')) {
          initializeDocument(initialBrdData);
          replyText = "Here is the first draft of your <strong>Business Requirements Document (BRD)</strong>. Our coordination squad has mapped the business objectives, core requirements matrix, stakeholder impact metrics, and out-of-scope parameters. The document is loaded in the workspace.";
          updateDescription = "Initial BRD Document compiled";
        }
        else if (cleanPrompt.includes('charter') || cleanPrompt.includes('project charter')) {
          initializeDocument(initialCharterData);
          replyText = "Here is the first draft of your <strong>Project Charter</strong>. Our planning squad has established the project purpose, key targets, organizational directory, and project governance stages. The document is loaded in the workspace.";
          updateDescription = "Initial Project Charter compiled";
        }
        else {
          // Default: SAP ECC to S/4HANA Migration Proposal
          initializeDocument(initialProposalData);
          replyText = "Here is the first draft of your <strong>SAP ECC to S/4HANA Migration Proposal</strong>. Our multi-agent squad has drafted the Executive Summary, Objectives, Project Scope, and a detailed 18-week Transition Timeline. The live document is now active in the workspace panel.";
          updateDescription = "Initial Migration Proposal draft compiled";
        }
      }
    }

    // Stream the assistant reply token-by-token
    chatBubbleElement.innerHTML = "";
    let i = 0;
    const words = replyText.split(" ");
    function streamToken() {
      if (i < words.length) {
        chatBubbleElement.innerHTML += words[i] + " ";
        i++;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setTimeout(streamToken, 30);
      } else {
        // Complete streaming
        followupBar.classList.remove('hidden');
        activeMessages.push({ sender: 'assistant', text: replyText });
        saveDocumentVersion(updateDescription);
        showToast("Workspace updated live!", "success");
      }
    }
    streamToken();
  }

  // --- Document Manager Controls ---
  function initializeDocument(data) {
    docEmptyState.classList.add('hidden');
    docContent.classList.remove('hidden');
    downloadPdfBtn.disabled = false;

    docCoverTitle.textContent = data.title;
    docCoverClient.textContent = data.client;
    docCoverDate.textContent = docState.date;

    docState.title = data.title;
    docState.client = data.client;
    docState.sections = JSON.parse(JSON.stringify(data.sections));

    renderDocumentState();
  }

  function insertDocumentSection(section) {
    // Avoid double inserts
    const exists = docState.sections.some(s => s.id === section.id);
    if (!exists) {
      docState.sections.push(JSON.parse(JSON.stringify(section)));
      renderDocumentState();
    }
  }

  function updateDocumentSection(section) {
    const index = docState.sections.findIndex(s => s.id === section.id);
    if (index !== -1) {
      docState.sections[index] = JSON.parse(JSON.stringify(section));
    } else {
      docState.sections.push(JSON.parse(JSON.stringify(section)));
    }
    renderDocumentState();
  }

  function renderDocumentState() {
    docSections.innerHTML = '';
    docState.sections.forEach(sec => {
      const card = document.createElement('div');
      card.className = 'doc-section-card';
      card.id = `section-card-${sec.id}`;
      card.innerHTML = `
        <div class="doc-section-header">
          <span class="doc-section-title"><i class="fa-solid ${sec.icon}"></i> ${sec.title}</span>
          <div class="section-ai-actions">
            <button class="ai-actions-trigger" id="trigger-${sec.id}">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Assist
            </button>
            <div class="ai-dropdown-menu" id="menu-${sec.id}">
              <button class="ai-dropdown-btn expand-opt"><i class="fa-solid fa-maximize"></i> Expand</button>
              <button class="ai-dropdown-btn shorten-opt"><i class="fa-solid fa-minimize"></i> Shorten</button>
              <button class="ai-dropdown-btn formal-opt"><i class="fa-solid fa-graduation-cap"></i> Formalize</button>
              <button class="ai-dropdown-btn edit-opt"><i class="fa-solid fa-pen-to-square"></i> Inline Edit</button>
            </div>
          </div>
        </div>
        <div class="doc-section-body" id="body-${sec.id}">${sec.content}</div>
      `;
      docSections.appendChild(card);

      // Bind local dropdown clicks
      const trigger = card.querySelector(`#trigger-${sec.id}`);
      const menu = card.querySelector(`#menu-${sec.id}`);
      const body = card.querySelector(`#body-${sec.id}`);

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.ai-dropdown-menu').forEach(m => {
          if (m !== menu) m.classList.remove('show');
        });
        menu.classList.toggle('show');
      });

      // Actions inside assist options
      card.querySelector('.expand-opt').addEventListener('click', () => {
        menu.classList.remove('show');
        aiAssistExpand(sec.id, body);
      });
      card.querySelector('.shorten-opt').addEventListener('click', () => {
        menu.classList.remove('show');
        aiAssistShorten(sec.id, body);
      });
      card.querySelector('.formal-opt').addEventListener('click', () => {
        menu.classList.remove('show');
        aiAssistFormalize(sec.id, body);
      });
      card.querySelector('.edit-opt').addEventListener('click', () => {
        menu.classList.remove('show');
        enableInlineEditing(sec.id, body);
      });
    });

    // Close menus on outer clicks
    document.addEventListener('click', () => {
      document.querySelectorAll('.ai-dropdown-menu').forEach(m => m.classList.remove('show'));
    });

    // Sync JSON viewer & panel title state
    docPanelStatus.textContent = "Document saved";
    updateJsonViewer();
  }

  // --- Inline Section AI Assistants ---
  async function aiAssistExpand(sectionId, bodyElement) {
    showToast("Expanding section via Gemini...", "info");
    bodyElement.style.opacity = '0.5';
    
    // Find the section object to know its title and content
    const sec = docState.sections.find(s => s.id === sectionId);
    const title = sec ? sec.title : sectionId;
    
    try {
      const response = await fetch('/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_title: title,
          section_content: bodyElement.innerHTML,
          action: 'expand',
          doc_title: docState.title
        })
      });
      const data = await response.json();
      if (data.success && data.content) {
        bodyElement.innerHTML = data.content;
        if (sec) sec.content = data.content; // Sync local state!
        showToast("Section expanded successfully!", "success");
        saveDocumentVersion(`Expanded ${title} section`);
        updateJsonViewer();
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to expand section. Using template default.", "warning");
      const orig = bodyElement.innerHTML;
      const fallback = orig + "<p>Additionally, our enterprise orchestration tools monitor the migration pathways in the target environments to automatically trigger safety fallbacks. We perform rigorous custom code checks, Z-table analysis, and data mapping validations. This strategy completely guarantees 100% data consistency, eliminates standard transaction locks, and facilitates absolute zero-friction cutover windows. Furthermore, business process alignment dashboards are deployed to give key stakeholders real-time visibility into active operational throughput during migration cycles.</p>";
      bodyElement.innerHTML = fallback;
      if (sec) sec.content = fallback;
      saveDocumentVersion(`Expanded ${title} section (Fallback)`);
      updateJsonViewer();
    } finally {
      bodyElement.style.opacity = '1';
    }
  }

  async function aiAssistShorten(sectionId, bodyElement) {
    showToast("Condensing section via Gemini...", "info");
    bodyElement.style.opacity = '0.5';
    
    const sec = docState.sections.find(s => s.id === sectionId);
    const title = sec ? sec.title : sectionId;
    
    try {
      const response = await fetch('/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_title: title,
          section_content: bodyElement.innerHTML,
          action: 'shorten',
          doc_title: docState.title
        })
      });
      const data = await response.json();
      if (data.success && data.content) {
        bodyElement.innerHTML = data.content;
        if (sec) sec.content = data.content;
        showToast("Section condensed!", "success");
        saveDocumentVersion(`Shortened ${title} section`);
        updateJsonViewer();
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to condense. Using fallback.", "warning");
      const fallback = "<p>Modernized enterprise platform with zero operational downtime. All processes are fully optimized and verified using real-time validation tools.</p>";
      bodyElement.innerHTML = fallback;
      if (sec) sec.content = fallback;
      saveDocumentVersion(`Shortened ${title} section (Fallback)`);
      updateJsonViewer();
    } finally {
      bodyElement.style.opacity = '1';
    }
  }

  async function aiAssistFormalize(sectionId, bodyElement) {
    showToast("Formalizing section via Gemini...", "info");
    bodyElement.style.opacity = '0.5';
    
    const sec = docState.sections.find(s => s.id === sectionId);
    const title = sec ? sec.title : sectionId;
    
    try {
      const response = await fetch('/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_title: title,
          section_content: bodyElement.innerHTML,
          action: 'formalize',
          doc_title: docState.title
        })
      });
      const data = await response.json();
      if (data.success && data.content) {
        bodyElement.innerHTML = data.content;
        if (sec) sec.content = data.content;
        showToast("Section formalized successfully!", "success");
        saveDocumentVersion(`Formalized ${title} section`);
        updateJsonViewer();
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to formalize. Using fallback.", "warning");
      const fallback = "<p>Pursuant to organizational mandates, all system components will enforce strict standard configurations. Clean-core execution rules govern all standard custom extensions to secure structural integrity.</p>";
      bodyElement.style.opacity = '1';
      if (sec) sec.content = fallback;
      saveDocumentVersion(`Formalized ${title} section (Fallback)`);
      updateJsonViewer();
    } finally {
      bodyElement.style.opacity = '1';
    }
  }

  function enableInlineEditing(sectionId, bodyElement) {
    bodyElement.contentEditable = "true";
    bodyElement.focus();
    showToast("Inline editing activated. Press click-outside to save.", "info");

    bodyElement.addEventListener('blur', function saveEdit() {
      bodyElement.contentEditable = "false";
      bodyElement.removeEventListener('blur', saveEdit);

      // Save inside local state
      const sec = docState.sections.find(s => s.id === sectionId);
      if (sec) {
        sec.content = bodyElement.innerHTML;
      }
      showToast("Changes saved locally", "success");
      updateJsonViewer();
      saveActiveChat();
    });
  }

  // --- Version Manager Timeline ---
  function saveDocumentVersion(description) {
    const versionNum = versions.length + 1;
    const newVer = {
      version: `v${versionNum}.0`,
      description: description,
      timestamp: new Date().toLocaleTimeString(),
      state: JSON.parse(JSON.stringify(docState))
    };
    versions.unshift(newVer); // add to top of lists
    updateVersionsTab();
    saveActiveChat();
  }

  function updateVersionsTab() {
    const versionsEmpty = document.getElementById('versionsEmpty');
    const versionsList = document.getElementById('versionsList');

    if (versions.length === 0) {
      versionsEmpty.classList.remove('hidden');
      versionsList.classList.add('hidden');
      return;
    }

    versionsEmpty.classList.add('hidden');
    versionsList.classList.remove('hidden');
    versionsList.innerHTML = '';

    versions.forEach(ver => {
      const card = document.createElement('div');
      card.className = 'version-card';
      card.innerHTML = `
        <div class="version-info">
          <span class="version-tag">${ver.version}</span>
          <div class="version-desc">${ver.description}</div>
          <div class="version-time">Saved at ${ver.timestamp}</div>
        </div>
        <button class="restore-btn" data-ver="${ver.version}"><i class="fa-solid fa-rotate-left"></i> Restore</button>
      `;
      versionsList.appendChild(card);

      card.querySelector('.restore-btn').addEventListener('click', () => {
        restoreVersionState(ver.state, ver.version);
      });
    });
  }

  function restoreVersionState(state, verTag) {
    docState = JSON.parse(JSON.stringify(state));
    renderDocumentState();
    showToast(`Restored document state to ${verTag}`, "success");
  }

  // --- JSON Viewer Sync ---
  function updateJsonViewer() {
    if (docState.title === "") {
      jsonOutput.textContent = "// No document generated yet";
      return;
    }
    jsonOutput.textContent = JSON.stringify(docState, null, 2);
  }

  function copyJsonToClipboard() {
    navigator.clipboard.writeText(jsonOutput.textContent);
    showToast("JSON payload copied!", "success");
  }

  // --- Fullscreen and UI helpers ---
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      docPanel.requestFullscreen().catch(err => {
        showToast("Fullscreen request failed", "error");
      });
    } else {
      document.exitFullscreen();
    }
  }

  // --- Toast Notifications System ---
  function showToast(msg, type = "success") {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = "fa-circle-check";
    if (type === 'error') icon = "fa-circle-exclamation";
    if (type === 'info') icon = "fa-circle-info";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // --- PDF Generator Redesign with ReportLab Integration ---
  function generatePdfFromState() {
    if (docState.title === "") return;

    pdfOverlay.classList.remove('hidden');
    pdfS1.className = "pdf-stage active";
    pdfS2.className = "pdf-stage";
    pdfS3.className = "pdf-stage";

    // Progressive PDF building stage animations
    setTimeout(() => {
      pdfS1.className = "pdf-stage completed";
      pdfS1.querySelector('i').className = "fa-solid fa-circle-check";
      pdfS2.className = "pdf-stage active";
      pdfS2.querySelector('i').className = "fa-solid fa-circle-notch fa-spin";
    }, 1200);

    setTimeout(() => {
      pdfS2.className = "pdf-stage completed";
      pdfS2.querySelector('i').className = "fa-solid fa-circle-check";
      pdfS3.className = "pdf-stage active";
      pdfS3.querySelector('i').className = "fa-solid fa-circle-notch fa-spin";
    }, 2400);

    setTimeout(() => {
      pdfS3.className = "pdf-stage completed";
      pdfS3.querySelector('i').className = "fa-solid fa-circle-check";

      // Call the actual Flask backend PDF compilation route
      triggerBackendPdfGenerate();
    }, 3600);
  }

  async function triggerBackendPdfGenerate() {
    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: docState.title,
          requirements: JSON.stringify(docState)
        })
      });

      if (!response.ok) {
        throw new Error("Backend PDF compilation failed");
      }

      const data = await response.json();
      pdfOverlay.classList.add('hidden');
      showToast("Enterprise PDF compiled successfully!", "success");

      // Auto trigger download
      const link = document.createElement('a');
      link.href = data.pdf_url;
      link.download = `${docState.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      pdfOverlay.classList.add('hidden');
      showToast(err.message, "error");
    }
  }

  // --- Dynamic Chat History Management ---
  function loadAllConversations() {
    conversationList.innerHTML = '';
    const stored = localStorage.getItem('ktern_conversations');
    const conversations = stored ? JSON.parse(stored) : [];
    
    currentChatId = localStorage.getItem('ktern_active_chat_id');
    
    if (conversations.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'sidebar-empty-state';
      empty.innerHTML = `
        <i class="fa-solid fa-message"></i>
        <span>No dynamic chats yet.<br>Start a conversation to save!</span>
      `;
      conversationList.appendChild(empty);
      
      if (!currentChatId) {
        resetChatWorkspace(false);
      }
      return;
    }
    
    conversations.sort((a, b) => b.timestamp - a.timestamp);
    
    conversations.forEach(chat => {
      const isActive = chat.id === currentChatId;
      const item = document.createElement('div');
      item.className = `conversation-item ${isActive ? 'active' : ''}`;
      item.setAttribute('data-id', chat.id);
      
      item.innerHTML = `
        <div class="conversation-main-info">
          <i class="fa-solid fa-message"></i>
          <span>${chat.title}</span>
        </div>
        <button class="delete-chat-btn" title="Delete conversation">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      
      item.addEventListener('click', () => {
        selectConversation(chat.id);
      });
      
      item.querySelector('.delete-chat-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteConversation(chat.id);
      });
      
      conversationList.appendChild(item);
    });
    
    if (currentChatId) {
      const activeChat = conversations.find(c => c.id === currentChatId);
      if (activeChat) {
        rehydrateWorkspace(activeChat);
      } else {
        currentChatId = null;
        localStorage.removeItem('ktern_active_chat_id');
        resetChatWorkspace(false);
      }
    } else {
      resetChatWorkspace(false);
    }
  }

  function saveActiveChat() {
    if (!currentChatId) return;
    
    const stored = localStorage.getItem('ktern_conversations');
    let conversations = stored ? JSON.parse(stored) : [];
    
    let activeChat = conversations.find(c => c.id === currentChatId);
    
    if (!activeChat) {
      const firstUserMsg = activeMessages.find(m => m.sender === 'user');
      const title = firstUserMsg ? generateChatTitle(firstUserMsg.text) : 'New Conversation';
      
      activeChat = {
        id: currentChatId,
        title: title,
        timestamp: Date.now(),
        messages: activeMessages,
        docState: docState,
        versions: versions
      };
      conversations.push(activeChat);
    } else {
      activeChat.timestamp = Date.now();
      activeChat.messages = activeMessages;
      activeChat.docState = docState;
      activeChat.versions = versions;
      
      if (activeChat.title === 'New Conversation' || activeChat.title.startsWith('New Chat')) {
        const firstUserMsg = activeMessages.find(m => m.sender === 'user');
        if (firstUserMsg) {
          activeChat.title = generateChatTitle(firstUserMsg.text);
        }
      }
    }
    
    localStorage.setItem('ktern_conversations', JSON.stringify(conversations));
    localStorage.setItem('ktern_active_chat_id', currentChatId);
    
    updateSidebarListOnly();
  }

  function updateSidebarListOnly() {
    const stored = localStorage.getItem('ktern_conversations');
    const conversations = stored ? JSON.parse(stored) : [];
    
    if (conversations.length === 0) {
      conversationList.innerHTML = `
        <div class="sidebar-empty-state">
          <i class="fa-solid fa-message"></i>
          <span>No dynamic chats yet.<br>Start a conversation to save!</span>
        </div>
      `;
      return;
    }
    
    conversations.sort((a, b) => b.timestamp - a.timestamp);
    
    conversationList.innerHTML = '';
    conversations.forEach(chat => {
      const isActive = chat.id === currentChatId;
      const item = document.createElement('div');
      item.className = `conversation-item ${isActive ? 'active' : ''}`;
      item.setAttribute('data-id', chat.id);
      
      item.innerHTML = `
        <div class="conversation-main-info">
          <i class="fa-solid fa-message"></i>
          <span>${chat.title}</span>
        </div>
        <button class="delete-chat-btn" title="Delete conversation">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      
      item.addEventListener('click', () => {
        selectConversation(chat.id);
      });
      
      item.querySelector('.delete-chat-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteConversation(chat.id);
      });
      
      conversationList.appendChild(item);
    });
  }

  function generateChatTitle(prompt) {
    if (prompt.includes("SAP ECC to S/4HANA migration proposal") || prompt.includes("Generate a comprehensive SAP")) {
      return "SAP Migration Proposal";
    }
    if (prompt.includes("Functional Requirements Specification") || prompt.includes("FRS")) {
      return "FRS Generator";
    }
    if (prompt.includes("Business Requirements Document") || prompt.includes("BRD")) {
      return "BRD Creation";
    }
    if (prompt.includes("Project Charter")) {
      return "Project Charter";
    }
    if (prompt.includes("User Acceptance Testing") || prompt.includes("UAT")) {
      return "UAT Plan";
    }

    let clean = prompt.trim();
    clean = clean.replace(/[#_*`\[\]]/g, '');
    if (clean.length > 28) {
      return clean.substring(0, 25) + '...';
    }
    return clean;
  }

  function selectConversation(chatId) {
    if (chatId === currentChatId) return;
    
    currentChatId = chatId;
    localStorage.setItem('ktern_active_chat_id', chatId);
    
    const stored = localStorage.getItem('ktern_conversations');
    const conversations = stored ? JSON.parse(stored) : [];
    const chat = conversations.find(c => c.id === chatId);
    
    if (chat) {
      rehydrateWorkspace(chat);
      showToast(`Loaded: ${chat.title}`, "info");
    }
    
    updateSidebarListOnly();
  }

  function rehydrateWorkspace(chat) {
    activeMessages = chat.messages || [];
    chatMessages.innerHTML = '';
    
    if (activeMessages.length > 0) {
      welcomeState.classList.add('hidden');
      activeMessages.forEach(msg => {
        appendMessageUI(msg.text, msg.sender);
      });
      followupBar.classList.remove('hidden');
    } else {
      chatMessages.appendChild(welcomeState);
      welcomeState.classList.remove('hidden');
      followupBar.classList.add('hidden');
    }
    
    docState = chat.docState || { title: "", client: "KaarTech Enterprise", date: new Date().toLocaleDateString('en-US'), sections: [] };
    
    if (docState.title !== "") {
      docEmptyState.classList.add('hidden');
      docContent.classList.remove('hidden');
      downloadPdfBtn.disabled = false;
      
      docCoverTitle.textContent = docState.title;
      docCoverClient.textContent = docState.client;
      docCoverDate.textContent = docState.date;
      
      renderDocumentState();
    } else {
      docEmptyState.classList.remove('hidden');
      docContent.classList.add('hidden');
      downloadPdfBtn.disabled = true;
      docPanelStatus.textContent = "Awaiting input...";
      docSections.innerHTML = '';
    }
    
    versions = chat.versions || [];
    updateVersionsTab();
    updateJsonViewer();
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendMessageUI(text, sender) {
    appendMessage(text, sender, false);
  }

  function deleteConversation(chatId) {
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    
    const stored = localStorage.getItem('ktern_conversations');
    let conversations = stored ? JSON.parse(stored) : [];
    
    conversations = conversations.filter(c => c.id !== chatId);
    localStorage.setItem('ktern_conversations', JSON.stringify(conversations));
    
    if (currentChatId === chatId) {
      currentChatId = null;
      localStorage.removeItem('ktern_active_chat_id');
      resetChatWorkspace(false);
    }
    
    loadAllConversations();
    showToast("Conversation deleted", "info");
  }
});
