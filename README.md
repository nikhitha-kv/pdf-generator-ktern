# KTern Enterprise AI Document Workspace

An enterprise-grade, multi-agent AI document generation platform designed for SAP consultants. Users can describe the SAP document they need (e.g., migration proposals, FRS, BRD, Project Charters, UAT test plans) in plain text, watch a multi-agent pipeline orchestrate research, view and live-edit sections inside an interactive document workspace, and export high-fidelity, corporate-styled PDF files.

---

## Key Features

### 1. Dynamic Document Generation
- **Any SAP Document**: Generates custom structures from arbitrary user prompts, supporting everything from KaarTech-specific overviews to custom SAP Security matrices.
- **Custom Section Generation**: Backend prompt engineering asks the AI for 4–12 custom logical sections mapped to the user's specific topic, breaking away from fixed templates.
- **Auto-Mapping Icons**: Automatically tags and assigns professional FontAwesome icons (`fa-timeline`, `fa-triangle-exclamation`, etc.) to newly generated sections based on content keywords.

### 2. Live Document Workspace & Edit Tracking
- **Interactive Preview Panel**: Split-pane interface showcasing live-rendering document markdown, interactive lists, architecture diagrams, risk cards, and timeline tables.
- **Direct Workspace Compilation**: When clicking "Download PDF", the application compiles the PDF directly from the current state of the document workspace (reflecting any inline user edits, expansions, shortening, or formatting).
- **Persistent Chat History**: Stores active conversation lists and contents, loading a clean "New Chat" window on page load while retaining historical sidebars.

### 3. ReportLab Enterprise PDF Engine
- **ReportLab HTML Sanitization**: Features a robust backend helper function `clean_html_for_reportlab()` that converts unsupported block styles (e.g., `<div>`, `<span>`, `<p>`) and headings to safe inline font sizes, preventing XML parser crashes.
- **Generic Table Rendering**: Detects standard `<table>` elements and parses them dynamically into high-fidelity ReportLab tables with brand-aligned styling.
- **Pulsing Flowcharts & Architecture Charts**: Renders custom SVG/Mermaid flowcharts in the PDF by fetching flowchart logic from diagram services.

### 4. Responsive UI & Flexbox Layouts
- **Clash-Free Zooming**: Features layout optimizations preventing horizontal page overflow and panel clipping at 100% zoom on common laptop viewports (e.g., 1280px or 1366px screens).
- **Responsive Breakers**: Reduces panel widths at intermediate screens and switches sidebars to collapsible overlays on small mobile viewports.

---

## Tech Stack

- **Backend**: Python 3.14+, Flask (Routing, session persistence, and file processing)
- **Frontend**: Vanilla HTML5, CSS3 Custom Properties (Navy/Red corporate brand theme), Javascript (State management & pipeline animations)
- **PDF Compilation**: ReportLab (Flowables, custom BaseDocTemplates, and Frame layouts)
- **AI Models**: OpenRouter API Integration (Multi-Agent System Prompting)
- **Data Extractor**: pdfplumber, python-docx, pandas (For file attachment context extraction)

---

## Installation & Setup

### Prerequisites
- Python 3.10 or higher installed.

### 1. Clone & Initialize Environment
Set up your virtual environment in the project directory:
```bash
# Create virtual environment
python -m venv venv

# Activate on Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Activate on Unix/macOS
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Credentials
Create a `.env` file in the root directory and specify your OpenRouter API Key (and optionally your Pexels Key for stock images):
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
PEXELS_API_KEY=your_pexels_api_key_here
FLASK_DEBUG=True
```

### 4. Run the Development Server
```bash
python app.py
```
Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

---

## Architecture & Code Structure

- `app.py`: Core server script, routes `/generate_doc`, `/generate`, `/chat`, and `/upload`, and compiles PDFs using custom ReportLab flowables.
- `templates/index.html`: Responsive app layout template containing the sidebar panel, central chat area, and preview workspace.
- `static/style.css`: Stylesheet implementing the KaarTech dark navy and red executive design system, animations, model badges, and responsive media queries.
- `static/script.js`: State manager tracking `docState` (active document sections), initiating dynamic pipeline animations, and triggering clean workspace PDF generations.
