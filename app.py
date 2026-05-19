import os
import json
import uuid
import base64
import requests
import re
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory, url_for
from dotenv import load_dotenv

# ReportLab imports
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.platypus.tableofcontents import TableOfContents

# Load environment variables
load_dotenv(override=True)

app = Flask(__name__, template_folder='templates', static_folder='static')

# Constants and Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_DIR = os.path.join(BASE_DIR, 'generated_pdfs')
ASSETS_DIR = os.path.join(BASE_DIR, 'assets')
os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

AI_MODEL = os.getenv('AI_MODEL', 'google/gemini-2.5-pro')

def fetch_pexels_image(query):
    pexels_key = os.getenv('PEXELS_API_KEY', '')
    if not pexels_key:
        print("Warning: Pexels API key not set. Skipping image fetch.")
        return None
        
    url = "https://api.pexels.com/v1/search"
    headers = {"Authorization": pexels_key}
    params = {"query": query + " electronic hardware white background", "per_page": 1, "orientation": "landscape"}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data.get('photos') and len(data['photos']) > 0:
            img_url = data['photos'][0]['src']['medium']
            img_response = requests.get(img_url)
            
            filename = f"pexels_{uuid.uuid4().hex}.jpg"
            filepath = os.path.join(ASSETS_DIR, filename)
            
            with open(filepath, 'wb') as f:
                f.write(img_response.content)
            return filepath
    except Exception as e:
        print(f"Error fetching image from Pexels for query '{query}': {e}")
    return None

def fetch_mermaid_flowchart(mermaid_code):
    try:
        # Mermaid.ink requires base64 encoded graph definition
        encoded = base64.urlsafe_b64encode(mermaid_code.encode('utf-8')).decode('utf-8')
        url = f"https://mermaid.ink/img/{encoded}"
        
        response = requests.get(url)
        response.raise_for_status()
        
        filename = f"flowchart_{uuid.uuid4().hex}.png"
        filepath = os.path.join(ASSETS_DIR, filename)
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        return filepath
    except Exception as e:
        print(f"Error generating flowchart: {e}")
    return None

def generate_report_data(topic, requirements):
    openrouter_key = os.getenv('OPENROUTER_API_KEY', '')
    print(f"DEBUG KEY: {openrouter_key[:10]}...{openrouter_key[-5:]}", flush=True)
    if not openrouter_key:
        raise ValueError("OpenRouter API key is missing in .env")
    prompt = f"""
    You are an expert engineering professor. Generate a comprehensive, professional engineering project report based on the following:
    Topic: {topic}
    Requirements: {requirements}

    You MUST output the result in STRICT JSON format with NO markdown wrapping (no ```json ... ```, just the raw object).
    
    The JSON MUST have exactly this structure:
    {{
      "project_title": "Full project title here",
      "sections": [
        {{ "title": "1. Cover Page", "type": "cover", "author": "Student Name", "guide": "Professor Name", "institution": "University Name" }},
        {{ "title": "2. Certificate Page", "type": "certificate" }},
        {{ "title": "3. Abstract", "type": "standard", "content": "Abstract text here...", "subheadings": [] }},
        {{ "title": "4. Introduction", "type": "standard", "subheadings": [ {{"title": "4.1 Background", "text": "...", "image_query": "iot microcontroller"}} ] }},
        {{ "title": "5. Components Required", "type": "components_table", "components": [ {{"sno": "1", "name": "ESP32", "qty": "1", "desc": "Main controller", "image_query": "ESP32 board"}} ] }},
        {{ "title": "6. Hardware Description", "type": "standard", "subheadings": [...] }},
        {{ "title": "7. Software Description", "type": "standard", "subheadings": [...] }},
        {{ "title": "8. Working Principle", "type": "standard", "subheadings": [...] }},
        {{ "title": "9. Circuit Diagram", "type": "standard", "subheadings": [ {{"title": "9.1 Wiring details", "text": "...", "image_query": "breadboard circuit wiring"}} ] }},
        {{ "title": "10. Flowchart", "type": "flowchart", "mermaid_code": "graph TD;\\nA[Start]-->B[Read Sensors];\\nB-->C{{Threshold met?}};\\nC-->|Yes|D[Turn on Relay];\\nC-->|No|B;\\nD-->E[End];" }},
        {{ "title": "11. Results", "type": "standard", "subheadings": [...] }},
        {{ "title": "12. Advantages", "type": "standard", "subheadings": [...] }},
        {{ "title": "13. Applications", "type": "standard", "subheadings": [...] }},
        {{ "title": "14. Future Scope", "type": "standard", "subheadings": [...] }},
        {{ "title": "15. Conclusion", "type": "standard", "subheadings": [...] }},
        {{ "title": "16. References", "type": "standard", "subheadings": [ {{"title": "Links", "text": "1. link... 2. link...", "image_query": ""}} ] }},
        {{ "title": "17. Final Connection Guide", "type": "standard", "subheadings": [ {{"title": "Pin Mapping", "text": "...", "image_query": ""}} ] }}
      ]
    }}
    
    IMPORTANT RULES:
    1. Be highly technical, use engineering terminology, real formulas, and accurate descriptions.
    2. Every standard section MUST have at least 1 subheading with detailed 'text' and an optional 'image_query' (short 2-3 words for Pexels).
    3. Ensure the JSON is valid and escaped correctly.
    4. Keep text concise but professional to ensure it fits in the response window.
    """

    headers = {
        "Authorization": f"Bearer {openrouter_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "AI Engineering Report Generator"
    }
    
    payload = {
        "model": AI_MODEL,
        "max_tokens": 6000,
        "messages": [
            {"role": "system", "content": "You are a JSON-generating bot for engineering reports. Output ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }
    
    models_to_try = [
        AI_MODEL,
        "poolside/laguna-m.1:free",
        "google/gemma-4-26b-a4b-it:free",
        "nvidia/nemotron-3-nano-30b-a3b:free",
        "openai/gpt-oss-120b:free"
    ]
    
    response = None
    last_error = None
    
    for model_name in models_to_try:
        payload["model"] = model_name
        print(f"Attempting generation with model: {model_name}...", flush=True)
        try:
            r = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=60)
            r.raise_for_status()
            response = r
            print(f"Successfully generated with {model_name}!", flush=True)
            break
        except Exception as e:
            print(f"Model {model_name} failed: {e}. Trying next fallback...", flush=True)
            last_error = e
            
    if not response:
        raise RuntimeError(f"All AI models failed to generate content. Last error: {last_error}")
    
    response_text = response.json()['choices'][0]['message']['content']
    
    # Strip markdown if the AI mistakenly included it
    response_text = re.sub(r'^```json\s*', '', response_text)
    response_text = re.sub(r'^```\s*', '', response_text)
    response_text = re.sub(r'\s*```$', '', response_text)
    
    try:
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        print("Failed to decode JSON:", response_text[:200], "...")
        raise ValueError("AI response was not valid JSON.")


class ReportFooterTemplate(PageTemplate):
    def __init__(self, id, project_title):
        self.project_title = project_title
        frames = [Frame(inch, inch, A4[0] - 2*inch, A4[1] - 2*inch, id='normal')]
        super().__init__(id, frames=frames)

    def beforeDrawPage(self, canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setStrokeColor(colors.grey)
        
        # Header border
        canvas.line(inch, A4[1] - 0.7*inch, A4[0] - inch, A4[1] - 0.7*inch)
        
        # Footer border
        canvas.line(inch, 0.7*inch, A4[0] - inch, 0.7*inch)
        
        # Footer text
        date_str = datetime.now().strftime("%Y-%m-%d")
        canvas.drawString(inch, 0.5*inch, f"Project: {self.project_title[:50]}...")
        canvas.drawRightString(A4[0] - inch, 0.5*inch, f"Date: {date_str} | Page {doc.page}")
        
        canvas.restoreState()


def build_pdf(report_data, filepath):
    doc = BaseDocTemplate(filepath, pagesize=A4, rightMargin=inch, leftMargin=inch, topMargin=inch, bottomMargin=inch)
    doc.addPageTemplates([ReportFooterTemplate('Normal', report_data.get('project_title', 'Engineering Report'))])
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    styles.add(ParagraphStyle(name='CoverTitle', parent=styles['Heading1'], fontSize=28, spaceAfter=30, alignment=1, textColor=colors.HexColor('#1e293b')))
    styles.add(ParagraphStyle(name='CoverSub', parent=styles['Normal'], fontSize=16, spaceAfter=20, alignment=1))
    styles.add(ParagraphStyle(name='MainHeading', parent=styles['Heading1'], fontSize=18, spaceBefore=20, spaceAfter=10, textColor=colors.HexColor('#0f172a')))
    styles.add(ParagraphStyle(name='SubHeading', parent=styles['Heading2'], fontSize=14, spaceBefore=15, spaceAfter=10, textColor=colors.HexColor('#334155')))
    styles.add(ParagraphStyle(name='BodyTextCustom', parent=styles['BodyText'], fontSize=11, leading=16, spaceAfter=12, alignment=4)) # Justified
    styles.add(ParagraphStyle(name='TableText', parent=styles['Normal'], fontSize=10, leading=14, alignment=0)) # Left aligned for tables
    
    story = []
    
    for section in report_data.get('sections', []):
        stype = section.get('type', 'standard')
        
        if stype == 'cover':
            story.append(Spacer(1, 2*inch))
            story.append(Paragraph("ENGINEERING PROJECT REPORT", styles['CoverTitle']))
            story.append(Spacer(1, 1*inch))
            story.append(Paragraph(report_data.get('project_title', 'Project Title').upper(), styles['CoverTitle']))
            story.append(Spacer(1, 2*inch))
            story.append(Paragraph(f"Submitted By: {section.get('author', 'Student')}", styles['CoverSub']))
            story.append(Paragraph(f"Guided By: {section.get('guide', 'Professor')}", styles['CoverSub']))
            story.append(Paragraph(f"{section.get('institution', 'University')}", styles['CoverSub']))
            story.append(PageBreak())
            
        elif stype == 'certificate':
            story.append(Paragraph(section.get('title', 'Certificate'), styles['MainHeading']))
            story.append(Spacer(1, 1*inch))
            cert_text = f"This is to certify that the project entitled '{report_data.get('project_title', '')}' is a bonafide record of work carried out successfully for the engineering curriculum."
            story.append(Paragraph(cert_text, styles['BodyTextCustom']))
            story.append(Spacer(1, 3*inch))
            story.append(Paragraph("Signature of Guide                                      Signature of HOD", styles['BodyTextCustom']))
            story.append(PageBreak())
            
        elif stype == 'components_table':
            story.append(Paragraph(section.get('title', 'Components Required'), styles['MainHeading']))
            
            table_data = [['S.No', 'Component', 'Qty', 'Description', 'Image']]
            for comp in section.get('components', []):
                img_path = fetch_pexels_image(comp.get('image_query', 'electronic component')) if comp.get('image_query') else None
                img_flowable = Image(img_path, width=1.5*inch, height=1*inch) if img_path else ""
                
                table_data.append([
                    comp.get('sno', ''),
                    comp.get('name', ''),
                    comp.get('qty', ''),
                    Paragraph(comp.get('desc', ''), styles['TableText']),
                    img_flowable
                ])
                
            t = Table(table_data, colWidths=[0.5*inch, 1.5*inch, 0.5*inch, 2*inch, 1.7*inch])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#3b82f6')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('ALIGN', (3,1), (3,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('GRID', (0,0), (-1,-1), 1, colors.black),
                ('WORDWRAP', (0,0), (-1,-1), True)
            ]))
            story.append(t)
            story.append(PageBreak())
            
        elif stype == 'flowchart':
            story.append(Paragraph(section.get('title', 'Flowchart'), styles['MainHeading']))
            mermaid = section.get('mermaid_code', '')
            if mermaid:
                img_path = fetch_mermaid_flowchart(mermaid)
                if img_path:
                    # scale down if too large
                    img = Image(img_path)
                    img.drawHeight = 4*inch
                    img.drawWidth = 5*inch
                    img.hAlign = 'CENTER'
                    story.append(img)
                else:
                    story.append(Paragraph("Flowchart generation failed.", styles['BodyTextCustom']))
            story.append(PageBreak())
            
        else: # standard
            story.append(Paragraph(section.get('title', 'Section'), styles['MainHeading']))
            
            if section.get('content'):
                story.append(Paragraph(section.get('content', ''), styles['BodyTextCustom']))
                
            for i, sub in enumerate(section.get('subheadings', [])):
                story.append(Paragraph(sub.get('title', ''), styles['SubHeading']))
                story.append(Paragraph(sub.get('text', ''), styles['BodyTextCustom']))
                
                # Fetch and add image if queried (limit images to avoid massive PDFs, maybe 1 per section)
                if sub.get('image_query') and i == 0: 
                    img_path = fetch_pexels_image(sub.get('image_query'))
                    if img_path:
                        img = Image(img_path, width=4*inch, height=2.5*inch)
                        img.hAlign = 'CENTER'
                        story.append(Spacer(1, 10))
                        story.append(img)
                        story.append(Paragraph(f"Figure: {sub.get('title', 'Component')}", ParagraphStyle(name='caption', parent=styles['Normal'], alignment=1, fontSize=9, textColor=colors.grey)))
                        story.append(Spacer(1, 10))
                        
            story.append(PageBreak())
            
    doc.build(story)


def build_enterprise_pdf(workspace_data, filepath):
    # Brand colors matching KaarTech (Red and Navy)
    brand_red = colors.HexColor('#c8102e')
    brand_navy = colors.HexColor('#0f1b29')
    text_dark = colors.HexColor('#1f2937')
    border_grey = colors.HexColor('#e5e7eb')

    doc = BaseDocTemplate(filepath, pagesize=A4, rightMargin=inch, leftMargin=inch, topMargin=inch, bottomMargin=inch)
    
    # Custom Page Template with clean red & navy headers and footers
    class CorporateTemplate(PageTemplate):
        def __init__(self, id, title):
            self.title = title
            frames = [Frame(inch, inch, A4[0] - 2*inch, A4[1] - 2*inch, id='normal')]
            super().__init__(id, frames=frames)

        def beforeDrawPage(self, canvas, doc):
            if doc.page == 1:
                return
            canvas.saveState()
            canvas.setFont('Helvetica-Bold', 8)
            canvas.setFillColor(brand_navy)
            canvas.drawString(inch, A4[1] - 0.55*inch, "KTERN ENTERPRISE AI WORKSPACE")
            canvas.setFont('Helvetica', 8)
            canvas.setFillColor(colors.HexColor('#6b7280'))
            canvas.drawRightString(A4[0] - inch, A4[1] - 0.55*inch, f"Document: {self.title[:40]}...")
            
            # Header Line (Red)
            canvas.setStrokeColor(brand_red)
            canvas.setLineWidth(1)
            canvas.line(inch, A4[1] - 0.6*inch, A4[0] - inch, A4[1] - 0.6*inch)
            
            # Footer Line (Grey)
            canvas.setStrokeColor(border_grey)
            canvas.line(inch, 0.7*inch, A4[0] - inch, 0.7*inch)
            
            # Footer text
            canvas.setFont('Helvetica', 8)
            canvas.drawString(inch, 0.5*inch, "Confidential - Powered by KaarTech Solutions")
            canvas.drawRightString(A4[0] - inch, 0.5*inch, f"Page {doc.page}")
            canvas.restoreState()

    doc.addPageTemplates([CorporateTemplate('Corporate', workspace_data.get('title', 'Enterprise Proposal'))])

    styles = getSampleStyleSheet()
    
    # Custom Corporate styles
    styles.add(ParagraphStyle(name='CorpCoverTitle', parent=styles['Heading1'], fontSize=24, leading=30, spaceAfter=15, alignment=1, textColor=brand_navy))
    styles.add(ParagraphStyle(name='CorpCoverClient', parent=styles['Normal'], fontSize=11, leading=15, spaceAfter=20, alignment=1, textColor=brand_red))
    styles.add(ParagraphStyle(name='CorpHeading', parent=styles['Heading1'], fontSize=14, leading=18, spaceBefore=15, spaceAfter=8, textColor=brand_navy, keepWithNext=True))
    styles.add(ParagraphStyle(name='CorpBody', parent=styles['BodyText'], fontSize=9.5, leading=13.5, spaceAfter=8, textColor=text_dark))
    styles.add(ParagraphStyle(name='CorpBullet', parent=styles['Normal'], fontSize=9.5, leading=13.5, leftIndent=15, spaceAfter=4, textColor=text_dark))
    styles.add(ParagraphStyle(name='CorpTableText', parent=styles['Normal'], fontSize=8.5, leading=11, textColor=text_dark))
    styles.add(ParagraphStyle(name='CorpTableHeader', parent=styles['Normal'], fontSize=8.5, leading=11, fontName='Helvetica-Bold', textColor=colors.whitesmoke))

    story = []

    # 1. Cover Page Flow
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("<font size='22' color='#c8102e'><i><b>K</b></i></font><font size='18' color='#0f1b29'><b>Tern</b></font>", styles['CorpCoverTitle']))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(workspace_data.get('title', 'Enterprise Proposal').upper(), styles['CorpCoverTitle']))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph("Multi-Agent Enterprise Document Intelligence Platform", styles['CorpCoverClient']))
    story.append(Spacer(1, 1*inch))
    
    story.append(Paragraph(f"<b>PREPARED FOR:</b> {workspace_data.get('client', 'KaarTech Solutions')}", styles['CorpCoverClient']))
    story.append(Paragraph(f"<b>DATE:</b> {workspace_data.get('date', datetime.now().strftime('%B %d, %Y'))}", styles['CorpCoverClient']))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("<font color='#6b7280'>CONFIDENTIAL &middot; FOR ENTERPRISE REVIEW ONLY</font>", styles['CorpCoverClient']))
    story.append(PageBreak())

    # 2. Add sections from workspace data
    for sec in workspace_data.get('sections', []):
        story.append(Paragraph(sec.get('title', 'Section'), styles['CorpHeading']))
        content = sec.get('content', '')
        
        # Check if content contains custom HTML elements and parse them
        if "doc-table" in content:
            try:
                headers = re.findall(r'<th>(.*?)</th>', content)
                rows_html = re.findall(r'<tr>(.*?)</tr>', content, re.DOTALL)
                
                table_data = []
                if headers:
                    table_data.append([Paragraph(h, styles['CorpTableHeader']) for h in headers])
                
                for r_html in rows_html:
                    cols = re.findall(r'<td>(.*?)</td>', r_html)
                    if cols:
                        table_data.append([Paragraph(c, styles['CorpTableText']) for c in cols])
                
                if table_data:
                    col_width = (A4[0] - 2*inch) / len(table_data[0])
                    t = Table(table_data, colWidths=[col_width]*len(table_data[0]))
                    t_style = [
                        ('BACKGROUND', (0,0), (-1,0), brand_navy),
                        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                        ('VALIGN', (0,0), (-1,-1), 'TOP'),
                        ('BOTTOMPADDING', (0,0), (-1,0), 6),
                        ('TOPPADDING', (0,0), (-1,0), 6),
                        ('GRID', (0,0), (-1,-1), 0.5, border_grey),
                    ]
                    for r_idx in range(1, len(table_data)):
                        if r_idx % 2 == 0:
                            t_style.append(('BACKGROUND', (0, r_idx), (-1, r_idx), colors.HexColor('#f9fafb')))
                    t.setStyle(TableStyle(t_style))
                    story.append(t)
                    story.append(Spacer(1, 8))
            except Exception as e:
                story.append(Paragraph(content, styles['CorpBody']))
                
        elif "timeline-list" in content:
            try:
                phases = re.findall(r"<div class='timeline-phase'>(.*?)</div>", content)
                durations = re.findall(r"<div class='timeline-duration'>(.*?)</div>", content)
                descs = re.findall(r"<div class='timeline-desc'>(.*?)</div>", content)
                
                timeline_table_data = [[
                    Paragraph("<b>Migration Phase</b>", styles['CorpTableHeader']),
                    Paragraph("<b>Duration</b>", styles['CorpTableHeader']),
                    Paragraph("<b>Details & Objectives</b>", styles['CorpTableHeader'])
                ]]
                
                for idx in range(min(len(phases), len(durations), len(descs))):
                    timeline_table_data.append([
                        Paragraph(phases[idx], styles['CorpTableText']),
                        Paragraph(f"<font color='#c8102e'><b>{durations[idx]}</b></font>", styles['CorpTableText']),
                        Paragraph(descs[idx], styles['CorpTableText'])
                    ])
                
                t = Table(timeline_table_data, colWidths=[1.8*inch, 1.2*inch, 3.5*inch])
                t_style = [
                    ('BACKGROUND', (0,0), (-1,0), brand_navy),
                    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                    ('BOTTOMPADDING', (0,0), (-1,0), 6),
                    ('TOPPADDING', (0,0), (-1,0), 6),
                    ('GRID', (0,0), (-1,-1), 0.5, border_grey),
                ]
                for r_idx in range(1, len(timeline_table_data)):
                    if r_idx % 2 == 0:
                        t_style.append(('BACKGROUND', (0, r_idx), (-1, r_idx), colors.HexColor('#f9fafb')))
                t.setStyle(TableStyle(t_style))
                story.append(t)
                story.append(Spacer(1, 8))
            except Exception as e:
                story.append(Paragraph(content, styles['CorpBody']))
                
        elif "risk-item" in content:
            try:
                titles = re.findall(r"<div class='risk-title'>(.*?)</div>", content)
                descs = re.findall(r"<div class='risk-desc'>(.*?)</div>", content)
                impacts = re.findall(r"<div class='risk-impact'>(.*?)</div>", content)
                mitigations = re.findall(r"<strong>Mitigation:</strong> (.*?)</p>", content)
                
                for idx in range(min(len(titles), len(descs), len(impacts))):
                    mit_text = mitigations[idx] if idx < len(mitigations) else "Standard testing procedures."
                    
                    risk_box_data = [
                        [Paragraph(f"<b>RISK: {titles[idx]}</b>", styles['CorpBody']), 
                         Paragraph(f"<font color='#c8102e'><b>IMPACT: {impacts[idx].upper()}</b></font>", styles['CorpTableText'])],
                        [Paragraph(f"<i>Description:</i> {descs[idx]}", styles['CorpTableText']), ""],
                        [Paragraph(f"<b>Mitigation:</b> {mit_text}", styles['CorpTableText']), ""]
                    ]
                    
                    t = Table(risk_box_data, colWidths=[5*inch, 1.5*inch])
                    t.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fcf8f8')),
                        ('LINELEFT', (0,0), (0,-1), 3, brand_red),
                        ('BOX', (0,0), (-1,-1), 0.5, border_grey),
                        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                        ('VALIGN', (0,0), (-1,-1), 'TOP'),
                        ('SPAN', (0,1), (1,1)),
                        ('SPAN', (0,2), (1,2)),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                        ('TOPPADDING', (0,0), (-1,-1), 4),
                    ]))
                    story.append(t)
                    story.append(Spacer(1, 8))
            except Exception as e:
                story.append(Paragraph(content, styles['CorpBody']))
                
        elif "diagram-container" in content:
            diagram_table_data = [
                [Paragraph("<b>[ MODERNIZED S/4HANA TARGET CLOUD ARCHITECTURE ]</b>", styles['CorpTableHeader'])],
                [Paragraph("<b>Orchestrated Layer:</b> SAP Fiori Gateway Gateway Server", styles['CorpTableText'])],
                [Paragraph("<b>Core Layer:</b> SAP S/4HANA Enterprise Core (Clean Core Mode)", styles['CorpTableText'])],
                [Paragraph("<b>Database Layer:</b> SAP HANA Memory-Optimized In-Memory Layer", styles['CorpTableText'])],
                [Paragraph("<b>Hosting Layer:</b> Enterprise Secure Cloud Landing Zone (AWS/Azure)", styles['CorpTableText'])]
            ]
            t = Table(diagram_table_data, colWidths=[6.5*inch])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), brand_navy),
                ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f4f6f9')),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('GRID', (0,0), (-1,-1), 1, border_grey),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('TOPPADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(t)
            story.append(Spacer(1, 10))
            
        else:
            if "<ul>" in content or "<li>" in content:
                bullets = re.findall(r'<li>(.*?)</li>', content)
                for b in bullets:
                    story.append(Paragraph(f"&bull; {b}", styles['CorpBullet']))
            else:
                clean_txt = content.replace("<p>", "").replace("</p>", "<br/><br/>")
                story.append(Paragraph(clean_txt, styles['CorpBody']))
                
        story.append(Spacer(1, 10))
        
    doc.build(story)


def build_pdf(report_data, filepath):
    doc = BaseDocTemplate(filepath, pagesize=A4, rightMargin=inch, leftMargin=inch, topMargin=inch, bottomMargin=inch)
    doc.addPageTemplates([ReportFooterTemplate('Normal', report_data.get('project_title', 'Engineering Report'))])
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    styles.add(ParagraphStyle(name='CoverTitle', parent=styles['Heading1'], fontSize=28, spaceAfter=30, alignment=1, textColor=colors.HexColor('#1e293b')))
    styles.add(ParagraphStyle(name='CoverSub', parent=styles['Normal'], fontSize=16, spaceAfter=20, alignment=1))
    styles.add(ParagraphStyle(name='MainHeading', parent=styles['Heading1'], fontSize=18, spaceBefore=20, spaceAfter=10, textColor=colors.HexColor('#0f172a')))
    styles.add(ParagraphStyle(name='SubHeading', parent=styles['Heading2'], fontSize=14, spaceBefore=15, spaceAfter=10, textColor=colors.HexColor('#334155')))
    styles.add(ParagraphStyle(name='BodyTextCustom', parent=styles['BodyText'], fontSize=11, leading=16, spaceAfter=12, alignment=4)) # Justified
    styles.add(ParagraphStyle(name='TableText', parent=styles['Normal'], fontSize=10, leading=14, alignment=0)) # Left aligned for tables
    
    story = []
    
    for section in report_data.get('sections', []):
        stype = section.get('type', 'standard')
        
        if stype == 'cover':
            story.append(Spacer(1, 2*inch))
            story.append(Paragraph("ENGINEERING PROJECT REPORT", styles['CoverTitle']))
            story.append(Spacer(1, 1*inch))
            story.append(Paragraph(report_data.get('project_title', 'Project Title').upper(), styles['CoverTitle']))
            story.append(Spacer(1, 2*inch))
            story.append(Paragraph(f"Submitted By: {section.get('author', 'Student')}", styles['CoverSub']))
            story.append(Paragraph(f"Guided By: {section.get('guide', 'Professor')}", styles['CoverSub']))
            story.append(Paragraph(f"{section.get('institution', 'University')}", styles['CoverSub']))
            story.append(PageBreak())
            
        elif stype == 'certificate':
            story.append(Paragraph(section.get('title', 'Certificate'), styles['MainHeading']))
            story.append(Spacer(1, 1*inch))
            cert_text = f"This is to certify that the project entitled '{report_data.get('project_title', '')}' is a bonafide record of work carried out successfully for the engineering curriculum."
            story.append(Paragraph(cert_text, styles['BodyTextCustom']))
            story.append(Spacer(1, 3*inch))
            story.append(Paragraph("Signature of Guide                                      Signature of HOD", styles['BodyTextCustom']))
            story.append(PageBreak())
            
        elif stype == 'components_table':
            story.append(Paragraph(section.get('title', 'Components Required'), styles['MainHeading']))
            
            table_data = [['S.No', 'Component', 'Qty', 'Description', 'Image']]
            for comp in section.get('components', []):
                img_path = fetch_pexels_image(comp.get('image_query', 'electronic component')) if comp.get('image_query') else None
                img_flowable = Image(img_path, width=1.5*inch, height=1*inch) if img_path else ""
                
                table_data.append([
                    comp.get('sno', ''),
                    comp.get('name', ''),
                    comp.get('qty', ''),
                    Paragraph(comp.get('desc', ''), styles['TableText']),
                    img_flowable
                ])
                
            t = Table(table_data, colWidths=[0.5*inch, 1.5*inch, 0.5*inch, 2*inch, 1.7*inch])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#3b82f6')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('ALIGN', (3,1), (3,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('GRID', (0,0), (-1,-1), 1, colors.black),
                ('WORDWRAP', (0,0), (-1,-1), True)
            ]))
            story.append(t)
            story.append(PageBreak())
            
        elif stype == 'flowchart':
            story.append(Paragraph(section.get('title', 'Flowchart'), styles['MainHeading']))
            mermaid = section.get('mermaid_code', '')
            if mermaid:
                img_path = fetch_mermaid_flowchart(mermaid)
                if img_path:
                    # scale down if too large
                    img = Image(img_path)
                    img.drawHeight = 4*inch
                    img.drawWidth = 5*inch
                    img.hAlign = 'CENTER'
                    story.append(img)
                else:
                    story.append(Paragraph("Flowchart generation failed.", styles['BodyTextCustom']))
            story.append(PageBreak())
            
        else: # standard
            story.append(Paragraph(section.get('title', 'Section'), styles['MainHeading']))
            
            if section.get('content'):
                story.append(Paragraph(section.get('content', ''), styles['BodyTextCustom']))
                
            for i, sub in enumerate(section.get('subheadings', [])):
                story.append(Paragraph(sub.get('title', ''), styles['SubHeading']))
                story.append(Paragraph(sub.get('text', ''), styles['BodyTextCustom']))
                
                # Fetch and add image if queried (limit images to avoid massive PDFs, maybe 1 per section)
                if sub.get('image_query') and i == 0: 
                    img_path = fetch_pexels_image(sub.get('image_query'))
                    if img_path:
                        img = Image(img_path, width=4*inch, height=2.5*inch)
                        img.hAlign = 'CENTER'
                        story.append(Spacer(1, 10))
                        story.append(img)
                        story.append(Paragraph(f"Figure: {sub.get('title', 'Component')}", ParagraphStyle(name='caption', parent=styles['Normal'], alignment=1, fontSize=9, textColor=colors.grey)))
                        story.append(Spacer(1, 10))
                        
            story.append(PageBreak())
            
    doc.build(story)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/generate', methods=['POST'])
def generate():
    if request.is_json:
        data = request.json
        topic = data.get('topic')
        requirements = data.get('requirements', '')
    else:
        topic = request.form.get('topic')
        requirements = request.form.get('requirements', '')
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
        
    try:
        # Check if the requirements parameter contains a JSON payload from the workspace
        if requirements.strip().startswith('{') and requirements.strip().endswith('}'):
            try:
                workspace_data = json.loads(requirements)
                if isinstance(workspace_data, dict) and "sections" in workspace_data:
                    print(f"Generating Premium Enterprise PDF from workspace state: {topic}")
                    filename = f"KaarTech_Proposal_{uuid.uuid4().hex[:8]}.pdf"
                    filepath = os.path.join(PDF_DIR, filename)
                    
                    build_enterprise_pdf(workspace_data, filepath)
                    
                    pdf_url = url_for('download_pdf', filename=filename)
                    return jsonify({"success": True, "pdf_url": pdf_url})
            except Exception as json_err:
                print(f"Failed to compile workspace JSON directly: {json_err}. Falling back to AI call.")
                
        print(f"Generating report for: {topic}")
        # 1. Fetch JSON structured content from OpenRouter
        report_data = generate_report_data(topic, requirements)
        
        # 2. Build PDF Document
        filename = f"Report_{uuid.uuid4().hex[:8]}.pdf"
        filepath = os.path.join(PDF_DIR, filename)
        
        build_pdf(report_data, filepath)
        
        pdf_url = url_for('download_pdf', filename=filename)
        return jsonify({"success": True, "pdf_url": pdf_url})
        
    except Exception as e:
        print(f"Error during generation: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    history = data.get('history', [])
    doc_context = data.get('doc_context', {})
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
        
    try:
        openrouter_key = os.getenv('OPENROUTER_API_KEY', '')
        if not openrouter_key:
            return jsonify({"reply": "KTern En offline assistant: I am ready to help refine your proposal. Try typing 'reduce timeline' to compress the schedule, or 'show risks' to append system hazards. Let me know what you'd like to discuss!"})
            
        doc_sections = [s.get('title', 'Section') for s in doc_context.get('sections', [])] if isinstance(doc_context, dict) else []
        prompt = f"""
        You are KTern En, the expert enterprise AI migration and systems consulting assistant by KaarTech.
        The user is discussing a proposal or document in the workspace.
        
        Current Document Title in Workspace: {doc_context.get('title', 'SAP ECC to S/4HANA Migration Proposal')}
        Current Document Sections: {json.dumps(doc_sections)}
        
        User's Message: {message}
        
        Reply with a highly professional, expert consulting tone. Do not use marketing clichés or buzzwords. Provide clean, actionable advice. If they are asking for changes to the document, advise them to use specific keywords in the chat (like 'reduce timeline', 'show project risks', 'manufacturing', or 'automation') so the workspace can compile them, or explain the solution clearly. Keep your response concise (within 150-200 words).
        """
        
        headers = {
            "Authorization": f"Bearer {openrouter_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "KTern En Chatbot"
        }
        
        messages = [{"role": "system", "content": "You are KTern En, a professional SAP consulting AI."}]
        for h in history:
            role = "user" if h.get("sender") == "user" else "assistant"
            messages.append({"role": role, "content": h.get("text", "")})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": AI_MODEL,
            "max_tokens": 1000,
            "messages": messages,
            "temperature": 0.5
        }
        
        r = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=20)
        r.raise_for_status()
        reply = r.json()['choices'][0]['message']['content']
        return jsonify({"success": True, "reply": reply})
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({"reply": f"As your KTern consulting assistant, I've analyzed your query: '{message}'. To adjust the timeline to 10 weeks, type 'reduce timeline'. To see risk items, type 'show risks'."})


@app.route('/assist', methods=['POST'])
def assist():
    data = request.json
    section_title = data.get('section_title', '')
    section_content = data.get('section_content', '')
    action = data.get('action', 'expand')
    doc_title = data.get('doc_title', 'SAP ECC to S/4HANA Migration Proposal')
    
    if not section_title:
        return jsonify({"error": "Section title is required"}), 400
        
    try:
        openrouter_key = os.getenv('OPENROUTER_API_KEY', '')
        if not openrouter_key:
            # Fallback offline templates
            if action == 'expand':
                expanded = section_content + f"<p>Additionally, our enterprise orchestration tools monitor the migration pathways in the target environments to automatically trigger safety fallbacks. We perform rigorous custom code checks, Z-table analysis, and data mapping validations. This strategy completely guarantees 100% data consistency, eliminates standard transaction locks, and facilitates absolute zero-friction cutover windows. Furthermore, business process alignment dashboards are deployed to give key stakeholders real-time visibility into active operational throughput during migration cycles.</p>"
                return jsonify({"success": True, "content": expanded})
            elif action == 'shorten':
                return jsonify({"success": True, "content": f"<p>Modernized enterprise platform with zero operational downtime. All processes are fully optimized and verified using real-time validation tools.</p>"})
            else:
                return jsonify({"success": True, "content": f"<p>Pursuant to organizational mandates, all system components will enforce strict standard configurations. Clean-core execution rules govern all standard custom extensions to secure structural integrity.</p>"})

        if action == 'expand':
            instruction = "Rewrite and greatly expand the following HTML content to be 3 to 4 times longer. Make it extremely detailed, comprehensive, high-density, and professional. Cover specific SAP processes, transaction codes, architectures, validation checklists, and expert recommendations where applicable. You MUST output well-styled HTML matching the input's format (e.g. keeping <ul>, <li>, <table>, or <p> tags but making the copy extremely rich and dense). Do not wrap inside a ```html block, return only the raw HTML code."
        elif action == 'shorten':
            instruction = "Condense and simplify the following HTML content to be highly concise, punchy, and clear while retaining the essential details. Return only raw HTML."
        else:
            instruction = "Rewrite the following HTML content using an extremely polished, high-end corporate executive vocabulary perfect for a C-suite presentation. Retain the same length and keep the HTML markup. Return only raw HTML."

        prompt = f"""
        You are an elite enterprise architect and lead systems consultant by KaarTech.
        
        Document Context: {doc_title}
        Section Title: {section_title}
        Current Section Content (HTML): {section_content}
        
        Action requested: {action.upper()}
        Instruction: {instruction}
        """

        headers = {
            "Authorization": f"Bearer {openrouter_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "KTern Section Assistant"
        }
        
        payload = {
            "model": AI_MODEL,
            "max_tokens": 2000,
            "messages": [
                {"role": "system", "content": "You are a professional HTML-generating consulting assistant. Output ONLY valid, raw HTML without any markdown code block wrap."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.5
        }
        
        r = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=30)
        r.raise_for_status()
        content = r.json()['choices'][0]['message']['content']
        
        # Clean up any potential markdown code blocks if returned
        content = re.sub(r'^```html\s*', '', content)
        content = re.sub(r'^```\s*', '', content)
        content = re.sub(r'\s*```$', '', content)
        
        return jsonify({"success": True, "content": content.strip()})
        
    except Exception as e:
        print(f"Error in assist endpoint: {e}")
        return jsonify({"error": str(e)}), 500



@app.route('/download/<filename>')
def download_pdf(filename):
    return send_from_directory(PDF_DIR, filename)


if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
