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
  addRecentConversation("SAP Migration Assessment", true);
  addRecentConversation("BRD Creation - Supply Chain", false);

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
    newChatBtn.addEventListener('click', resetChatWorkspace);
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
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
      });
    });
  }

  // --- Reset Workspace ---
  function resetChatWorkspace() {
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
    updateJsonViewer();
    updateVersionsTab();
    showToast("New conversational workspace created", "info");
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
  function appendMessage(text, sender) {
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
    return bubble;
  }

  // --- Multi-Agent Pipeline Simulator ---
  function executeMultiAgentPipeline(userPrompt) {
    // 1. Show dynamic loading assistant bubble
    const assistantBubble = appendMessage('<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>', 'assistant');

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
  function streamAIResponse(prompt, chatBubbleElement) {
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
      // 6. Default: SAP S/4HANA Migration Proposal Initialization
      initializeDocument(initialProposalData);
      replyText = "Here is the first draft of your <strong>SAP ECC to S/4HANA Migration Proposal</strong>. Our multi-agent squad has drafted the Executive Summary, Objectives, Project Scope, and a detailed 18-week Transition Timeline. The live document is now active in the workspace panel.";
      updateDescription = "Initial Migration Proposal draft compiled";
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
  function aiAssistExpand(sectionId, bodyElement) {
    showToast("Expanding section content...", "info");
    bodyElement.style.opacity = '0.5';
    setTimeout(() => {
      const orig = bodyElement.innerHTML;
      bodyElement.innerHTML = orig + "<p>Additionally, our orchestration tool monitors migration pathways to run safety fallbacks. This optimizes data consistency across all custom legacy code setups and validates business workflows with absolute zero friction.</p>";
      bodyElement.style.opacity = '1';
      showToast("Section expanded successfully!", "success");
      saveDocumentVersion(`Expanded ${sectionId} section`);
    }, 1200);
  }

  function aiAssistShorten(sectionId, bodyElement) {
    showToast("Simplifying copy...", "info");
    bodyElement.style.opacity = '0.5';
    setTimeout(() => {
      bodyElement.innerHTML = "<p>Accelerated digital modernization upgrading ECC to SAP S/4HANA core. We guarantee zero data loss and optimized timeline delivery using automated validation suites.</p>";
      bodyElement.style.opacity = '1';
      showToast("Section condensed!", "success");
      saveDocumentVersion(`Shortened ${sectionId} section`);
    }, 1200);
  }

  function aiAssistFormalize(sectionId, bodyElement) {
    showToast("Applying corporate phrasing...", "info");
    bodyElement.style.opacity = '0.5';
    setTimeout(() => {
      bodyElement.innerHTML = "<p>Pursuant to enterprise mandates, this roadmap enforces strict alignment with the standard clean-core model. All transactional architectures will deploy standard REST interfaces to guarantee robust operational continuity and security.</p>";
      bodyElement.style.opacity = '1';
      showToast("Section formalized!", "success");
      saveDocumentVersion(`Formalized ${sectionId} section`);
    }, 1200);
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

  // --- Mock Recent Conversation items ---
  function addRecentConversation(title, isActive) {
    const btn = document.createElement('button');
    btn.className = `conversation-item ${isActive ? 'active' : ''}`;
    btn.innerHTML = `<i class="fa-solid fa-message"></i> <span>${title}</span>`;
    conversationList.appendChild(btn);
  }
});
