import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, total_pages):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(36, 762, "Campus Lost & Found Management System — Presentation & Demonstration Script")
            self.drawRightString(576, 762, "Software Engineering 2 (SE2)")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.75)
            self.line(36, 756, 576, 756)
            
        # Footer (all pages)
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748b"))
        page_text = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(576, 20, page_text)
        self.drawString(36, 20, "Notre Dame of Midsayap College (NDMC) | Proponent: Rogie P. Bacanto (BSCS-4) | Adviser: Mr. Allan Aragon")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 28, 576, 28)
            
        self.restoreState()

def build_pdf(output_path, screenshots_dir):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=19,
        textColor=colors.HexColor('#0f172a'),
        alignment=1,
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#0284c7'),
        alignment=1,
        spaceAfter=6
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=4,
        spaceAfter=4,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0369a1'),
        spaceBefore=2,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1e293b')
    )

    say_style = ParagraphStyle(
        'SpokenText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=11.5,
        textColor=colors.HexColor('#0f172a')
    )

    do_style = ParagraphStyle(
        'ActionText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=colors.HexColor('#1e293b')
    )

    tip_style = ParagraphStyle(
        'TipText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.HexColor('#475569')
    )

    caption_style = ParagraphStyle(
        'ImgCaption',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.8,
        leading=8.5,
        textColor=colors.HexColor('#64748b'),
        alignment=1,
        spaceBefore=2,
        spaceAfter=0
    )

    story = []

    # Helper function to create step card
    def create_step_card(step_num, title, img_filename, what_to_do, what_to_say, tips=None, img_w=180, img_h=101):
        elements = []
        elements.append(Paragraph(f"<b>{step_num}: {title}</b>", h2_style))
        
        img_path = os.path.join(screenshots_dir, img_filename)
        if os.path.exists(img_path):
            img_flowable = RLImage(img_path, width=img_w, height=img_h)
            caption = Paragraph(f"Visual Reference: {img_filename}", caption_style)
            img_cell = [img_flowable, caption]
        else:
            img_cell = [Paragraph(f"[Image: {img_filename}]", caption_style)]

        content_cell = [
            Paragraph("<b>WHAT TO DO (ACTION):</b>", ParagraphStyle('HDo', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.2, textColor=colors.HexColor('#0369a1'))),
            Paragraph(what_to_do, do_style),
            Spacer(1, 2),
            Paragraph("<b>WHAT TO SAY (SPEAKING SCRIPT):</b>", ParagraphStyle('HSay', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.2, textColor=colors.HexColor('#059669'))),
            Paragraph(f'"{what_to_say}"', say_style)
        ]
        if tips:
            content_cell.append(Spacer(1, 2))
            content_cell.append(Paragraph(f"<b>Defense Tip:</b> {tips}", tip_style))

        row_table = Table([[img_cell, content_cell]], colWidths=[img_w + 6, 534 - img_w])
        row_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ffffff')),
            ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
            ('BACKGROUND', (1,0), (1,0), colors.HexColor('#f8fafc')),
        ]))
        elements.append(row_table)
        elements.append(Spacer(1, 5))
        return elements

    # ==========================================
    # PAGE 1: HEADER + SLIDE 1 & SLIDE 2
    # ==========================================
    story.append(Paragraph("CAMPUS LOST &amp; FOUND MANAGEMENT SYSTEM", title_style))
    story.append(Paragraph("Defense Presentation &amp; Live System Demonstration Script", subtitle_style))
    
    meta_box_data = [
        [
            Paragraph("<b>Proponent:</b> Rogie P. Bacanto (BSCS-4) | <b>School:</b> Notre Dame of Midsayap College", body_style),
            Paragraph("<b>Subject:</b> Software Engineering 2 (SE2) | <b>Adviser:</b> Mr. Allan Aragon", body_style)
        ],
        [
            Paragraph("<b>System URL:</b> <font color='#0284c7'><u>https://lost-and-found-system-7ro8.onrender.com</u></font>", body_style),
            Paragraph("<b>Admin Credentials:</b> Username: <b>admin</b> | Password: <b>Siladan2026</b>", body_style)
        ]
    ]
    meta_table = Table(meta_box_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 4))

    story.append(Paragraph("PART 1 — POWERPOINT SLIDES SCRIPT (Slides 1–4, ~4 to 5 Minutes)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=4))

    # Slide 1
    story.extend(create_step_card(
        "SLIDE 1", "Project Overview & Introduction (~1 min)", "slide_1.png",
        "Stand upright. Greet the instructor and panel. Have Slide 1 displayed on the projector.",
        "Good morning/afternoon, Mr. Aragon and members of the panel. I am <b>Rogie P. Bacanto</b>, a 4th-year BS Computer Science student.<br/>"
        "Today, I present our Software Engineering 2 final project: the <b>Campus Lost &amp; Found Management System</b>.<br/>"
        "This is a web-based, AI-enhanced platform that centralizes lost and found reporting, automated multimodal matching, and verified claiming across the Notre Dame of Midsayap College campus.",
        "Speak clearly, project your voice, and make eye contact with each panelist.",
        img_w=180, img_h=101
    ))

    # Slide 2
    story.extend(create_step_card(
        "SLIDE 2", "Problem and Solution (~1.5 mins)", "slide_2.png",
        "Advance to Slide 2. Point to the three problems and their direct solutions.",
        "To understand why this system was developed, we addressed three critical campus problems:<br/>"
        "<b>1. Scattered Tracking:</b> Across 42 buildings at NDMC, lost items sit in security posts and offices with no central list. Our solution is <b>One Searchable Catalog</b> accessible to all students and staff 24/7.<br/>"
        "<b>2. No Ownership Check:</b> Items were released upon casual verbal inquiry, causing high risks of mistaken or false claims. Our solution is <b>Claims Backed by Verifiable Proof</b>, requiring private identifying details and ID photos reviewed by security.<br/>"
        "<b>3. Owners and Finders Never Connect:</b> Finders and owners describe items differently. Our solution is <b>AI-Assisted Matching</b> using multimodal vision and dual-tier scoring.<br/>"
        "The primary users are <b>Students and Faculty/Staff</b> who report and claim items, and <b>Campus Administrators</b> who oversee verification.",
        "Highlight that all 42 official NDMC campus buildings are pre-loaded in the database.",
        img_w=180, img_h=101
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 2: SLIDE 3 & SLIDE 4
    # ==========================================
    story.append(Paragraph("PART 1 (CONTINUED) — SYSTEM DESIGN &amp; RESULTS (Slides 3 &amp; 4)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=4))

    # Slide 3
    story.extend(create_step_card(
        "SLIDE 3", "System Design & Architecture (~1.5 mins)", "slide_3.png",
        "Advance to Slide 3. Walk through the Architecture diagram (left) and the ERD (right).",
        "Moving to System Design:<br/>"
        "Our system follows an industry-standard <b>Model-View-Controller (MVC)</b> architecture.<br/>"
        "On the <b>Client side</b>, we built a responsive web interface and installable PWA using Bootstrap 5 and dynamic EJS views.<br/>"
        "On the <b>Server side</b>, it runs on <b>Node.js with Express.js</b> on Render.com, secured by bcrypt authentication and session middleware.<br/>"
        "Data is stored in <b>MongoDB Atlas</b>, while image assets are securely handled by <b>Cloudinary</b>.<br/>"
        "For artificial intelligence, we integrated <b>Google Gemini 2.5 Flash Vision</b> for visual similarity, backed by an internal NLP engine for fast query analysis.<br/>"
        "Our database schema centers on five core entities: <b>Users</b>, <b>Categories</b>, <b>Locations</b>, <b>Items</b>, and <b>ClaimRequests</b> linked with relational integrity.",
        "Explain that 1 User can submit N ClaimRequests, and 1 Item belongs to 1 Category and 1 Location.",
        img_w=180, img_h=101
    ))

    # Slide 4
    story.extend(create_step_card(
        "SLIDE 4", "Results, Testing & Demonstration Handoff (~1 min)", "slide_4.png",
        "Advance to Slide 4. Present testing metrics, acknowledge scope, and deliver the mandatory handoff phrase.",
        "In summary of our development results:<br/>"
        "We successfully completed 100% of the planned core features: authentication, lost/found reporting with photos, real-time search, proof-based claiming, AI matching, AI chat, and admin analytics.<br/>"
        "In testing, all <b>15 out of 15 test cases passed (100%)</b>, validating authentication, search, AI matching, and claiming workflows. Six critical bugs were identified and permanently resolved during testing.<br/>"
        "Our scope currently covers NDMC campus premises, with physical handovers finalized at the Chief Security Office.<br/>"
        "<b>And with that, we will now demonstrate our completed system.</b>",
        "Deliver the final transition sentence firmly. Immediately switch screens to your live browser tab.",
        img_w=180, img_h=101
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 3: DEMO STEPS 1 & 2
    # ==========================================
    story.append(Paragraph("PART 2 — LIVE SYSTEM DEMONSTRATION SCRIPT (~12 to 14 Minutes)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#059669'), spaceAfter=4))
    story.append(Paragraph("<i>Open your live system in Chrome/Edge: <b>https://lost-and-found-system-7ro8.onrender.com</b>. Demonstrate live features smoothly.</i>", tip_style))
    story.append(Spacer(1, 3))

    # Demo Step 1
    story.extend(create_step_card(
        "DEMO STEP 1", "Public Portal & Real-Time Catalog Search (~2 mins)", "01_public_catalog_ai.png",
        "1. Open homepage: <b>https://lost-and-found-system-7ro8.onrender.com</b>.<br/>"
        "2. Scroll through the Recent Items catalog.<br/>"
        "3. Type 'library' in the search bar or click 'Electronics' category.<br/>"
        "4. Click the theme switcher icon in the navbar to show Dark and Light mode.",
        "Here is our live production system on Render. Any student or visitor can browse the public catalog immediately without needing an account to search for their belongings.<br/>"
        "Notice the category filters and real-time search bar. If a student searches for <i>'library'</i> or clicks <i>'Electronics'</i>, the catalog filters instantly without reloading the page.<br/>"
        "We also built a full dual-theme engine. Users can seamlessly switch between Dark Mode and Light Mode based on their preference.",
        "Emphasize that public discovery requires zero sign-up, removing barriers for frantic students.",
        img_w=180, img_h=101
    ))

    # Demo Step 2
    story.extend(create_step_card(
        "DEMO STEP 2", "The Conversational Campus AI Assistant (~3 mins)", "01_public_catalog_ai.png",
        "1. Click the floating robot button: <b>'Ask Campus AI'</b> in the bottom right corner.<br/>"
        "2. Ask: <i>'How do I claim a lost item?'</i><br/>"
        "3. Search query: <i>'Did anyone find my umbrella in the library?'</i> (or Tagalog: <i>'Nawala ang payong ko sa library'</i>).<br/>"
        "4. Show the matching item card returned inside the chat. Point out camera icon for AI photo search.",
        "One of our flagship innovations is the <b>Campus AI Assistant</b>, powered by Google Gemini AI.<br/>"
        "Students don't need to navigate complex menus. They can ask natural questions in English or Tagalog.<br/>"
        "When I ask: <i>'How do I claim a lost item?'</i>, the AI explains the exact NDMC verification procedure.<br/>"
        "When I search: <i>'Did anyone find my umbrella in the library?'</i>, our AI parses the item noun, location, and intent, queries the database, and returns only the matching item card directly inside the chat window. It never hallucinates unrelated items.<br/>"
        "Students can also click the camera icon to upload a photo of an item, and the multimodal vision AI identifies it automatically.",
        "This is the star feature of your project. Show the panel that the AI returns the exact item card.",
        img_w=180, img_h=101
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 4: DEMO STEPS 3 & 4
    # ==========================================
    story.append(Paragraph("PART 2 (CONTINUED) — REPORTING &amp; BULLETIN POSTER UTILITY", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#059669'), spaceAfter=4))

    # Demo Step 3
    story.extend(create_step_card(
        "DEMO STEP 3", "Reporting Lost & Found Items with Photos (~2 mins)", "05_report_form.png",
        "1. Click the red <b>'Report Lost Item'</b> button on the navbar.<br/>"
        "2. Show the form fields: Item Name, Category (10 categories), Campus Location (42 NDMC buildings), Date Lost, Description, and Photo Upload.<br/>"
        "3. Explain that submitting immediately triggers the background AI matching engine.",
        "Next is the reporting flow. When a student misplaces an item, they click 'Report Lost Item'.<br/>"
        "The form includes our 10 official campus categories and all 42 registered NDMC buildings—from the College Library to Primera Hall and the Gymnasium.<br/>"
        "When the student submits this report with a photo, our backend <b>Matching Service</b> immediately activates. It evaluates category overlap, campus location proximity, date proximity, and item name keywords, while Google Gemini Vision compares image visual features in the background.",
        "Explain that reported items enter an approved review status so campus security can oversee posts.",
        img_w=180, img_h=101
    ))

    # Demo Step 4
    story.extend(create_step_card(
        "DEMO STEP 4", "Item Details & Printable Lost Poster (~1.5 mins)", "04_item_details_poster.png",
        "1. Click on an item card from the catalog to open its Item Details page.<br/>"
        "2. Scroll down to show the <b>Potential Matches</b> section with match percentages.<br/>"
        "3. Click the <b>'Print Poster'</b> button. Show the clean, high-contrast black-and-white lost poster print preview on white paper. Cancel print dialog.",
        "On the Item Details page, students see complete metadata, the location map reference, and automated match recommendations with percentage breakdown.<br/>"
        "We also created a very practical campus utility: the <b>Print Poster</b> feature.<br/>"
        "With one click, the system formats a clean, standardized Lost Poster with the photo, description, security contact details, and QR code, specially formatted for campus bulletin boards.",
        "Show the print preview dialog briefly to prove the poster prints cleanly with white background and dark text.",
        img_w=180, img_h=101
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 5: DEMO STEPS 5 & 6
    # ==========================================
    story.append(Paragraph("PART 2 (CONTINUED) — CLAIMING WORKFLOW &amp; ADMIN PORTAL", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#059669'), spaceAfter=4))

    # Demo Step 5
    story.extend(create_step_card(
        "DEMO STEP 5", "Submitting a Claim with Verifiable Proof (~2 mins)", "07_claim_verification.png",
        "1. On a Found Item details page, click the green <b>'Claim This Item'</b> button.<br/>"
        "2. Show the Claim Modal:<br/>"
        "   - Claimant Name & Student ID Number.<br/>"
        "   - Proof of Ownership Description (e.g. private scratch, engraving, serial number, lock screen).<br/>"
        "   - Proof Photo / Student ID attachment.<br/>"
        "3. Submit the claim and point out the confirmation notice.",
        "Now let's demonstrate the claiming workflow, which solves Problem #2 from our presentation: preventing false claims.<br/>"
        "To claim an item, a student must provide verifiable proof of ownership. They enter their Student ID number and describe private identifying details that only the true owner would know—such as an engraved serial number, a distinct scratch, custom keychain, or lock screen wallpaper.<br/>"
        "They can also attach an image of their Student ID. Once submitted, the claim enters 'Pending Verification' status.",
        "Explain that public users cannot see other people's claim details—only authorized administrators can view proof.",
        img_w=180, img_h=101
    ))

    # Demo Step 6
    story.extend(create_step_card(
        "DEMO STEP 6", "Admin Security Portal & Verification Queue (~2 mins)", "03_admin_dashboard.png",
        "1. Click <b>'Admin'</b> / <b>'Login'</b>.<br/>"
        "2. Log in using: <b>admin</b> / <b>Siladan2026</b>.<br/>"
        "3. Show the Admin Dashboard with item counts and quick management tools.<br/>"
        "4. Click <b>'Pending Review'</b>: Show how an admin approves/rejects new reports.<br/>"
        "5. Click <b>'Claim Requests'</b>: Show the claim review queue where security verifies proof before handover.",
        "Now we switch to the <b>Administrator Role</b>, designed for the NDMC Chief Security Officer.<br/>"
        "Inside the Admin Portal, campus security has complete operational control.<br/>"
        "In the <b>Pending Review</b> queue, security officers screen newly reported items before they appear on the public catalog, preventing spam.<br/>"
        "Under <b>Claim Requests</b>, officers inspect the private proof submitted by the claimant. If the private detail matches the physical item stored in the security vault, the officer approves the claim, generating an official handover authorization.",
        "Emphasize that the physical item is securely kept in the Chief Security Office until proof is verified.",
        img_w=180, img_h=101
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 6: DEMO STEPS 7 & 8
    # ==========================================
    story.append(Paragraph("PART 2 (CONTINUED) — ANALYTICS, EXPORT &amp; CONCLUSION", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#059669'), spaceAfter=4))

    # Demo Step 7
    story.extend(create_step_card(
        "DEMO STEP 7", "Executive Analytics, Trends & CSV Export (~2 mins)", "02_admin_analytics.png",
        "1. Click <b>'Statistics & Trends'</b> on the admin sidebar.<br/>"
        "2. Point to the 4 Top KPI metric cards (Total Reported, Active Lost, Pending, Recovery Rate).<br/>"
        "3. Point to the Donut Chart (Item Status Breakdown) and Category Gauges.<br/>"
        "4. Point to the Monthly Trends chart (Reported Items vs Reunited).<br/>"
        "5. Point out the <b>'Export Data'</b> (CSV export) and <b>'Print Report'</b> buttons.",
        "Finally, we provide the college administration with real-time institutional intelligence on the <b>Statistics &amp; Trends</b> dashboard.<br/>"
        "Here, administrators can monitor our overall recovery rate—currently tracking active items and reunifications.<br/>"
        "The category gauges reveal high-frequency loss areas—such as Personal Items and Electronics—helping security target patrol areas.<br/>"
        "The monthly trends chart tracks loss patterns across the semester. All records can be exported to CSV format with a single click or printed as an official institutional report.",
        "Note the high-contrast purple and cyan chart legend badges that clearly distinguish Reported Items from Claimed & Reunited.",
        img_w=180, img_h=101
    ))

    # Demo Step 8
    story.extend(create_step_card(
        "DEMO STEP 8", "Demonstration Conclusion & Q&A Transition (~30 secs)", "01_public_catalog_ai.png",
        "Return browser to the main catalog or admin overview. Face the panel, smile, and deliver the closing remarks.",
        "That concludes our live system demonstration.<br/>"
        "As demonstrated, the system successfully bridges the gap between students, finders, and campus security through centralized cataloging, AI-assisted matching, and verified claiming.<br/>"
        "Thank you very much, Mr. Aragon and respected panel members. I am now ready for your questions.",
        "Stand ready with your presentation slides and system tabs open in case a panelist asks you to revisit a specific screen.",
        img_w=180, img_h=101
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 7: ANTICIPATED DEFENSE Q&A + PRE-FLIGHT CHECKLIST
    # ==========================================
    story.append(Paragraph("PART 3 — ANTICIPATED DEFENSE QUESTIONS &amp; BULLETPROOF ANSWERS", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#d97706'), spaceAfter=4))
    story.append(Paragraph("<i>Study these top 8 questions. Panelists commonly ask these exact technical and procedural questions:</i>", tip_style))
    story.append(Spacer(1, 3))

    qa_list = [
        (
            "Q1: How does your AI matching algorithm actually work?",
            "<b>Answer:</b> Our system uses a hybrid dual-tier matching architecture. First, a deterministic rule-based engine evaluates category match (25%), location proximity across NDMC's 42 buildings (20%), date proximity (20%), and item name keywords (20%), plus brand/color bonuses. Second, if photos are present, we feed both images into Google Gemini 2.5 Flash Vision to compute visual semantic similarity. A weighted composite score is calculated, and items exceeding our confidence threshold are recommended as potential matches."
        ),
        (
            "Q2: How do you prevent fraudulent or fake claims?",
            "<b>Answer:</b> We enforce a strict proof-of-ownership protocol. First, claiming requires a verified Student ID number. Second, the claimant must describe private identifying features that are not visible in the public catalog photo—such as an engraved serial number, internal stickers, a specific scratch, or lock screen wallpaper. Third, all claims must be reviewed and approved by campus security before any physical item is handed over."
        ),
        (
            "Q3: What happens if Google Gemini AI is offline, rate-limited, or has no internet?",
            "<b>Answer:</b> The system is built with high fault tolerance. We implemented an internal rule-based NLP fallback engine that handles conversational intent, item extraction, and campus FAQs completely offline without API calls. Furthermore, core item matching continues uninterrupted through our multi-factor metadata scoring engine."
        ),
        (
            "Q4: How do you handle student privacy and data security?",
            "<b>Answer:</b> We apply security best practices: user passwords are encrypted using bcrypt hashing (salt rounds: 10). Session cookies are secured with httpOnly flags. Submitted proof of ownership and Student ID images are restricted exclusively to authorized administrators and can never be viewed by public users."
        ),
        (
            "Q5: Why did you hardcode 42 specific NDMC campus buildings?",
            "<b>Answer:</b> Standardizing the location dropdown to NDMC's 42 official campus buildings eliminates typos (e.g. 'lib', 'library', 'college library') and allows our matching algorithm to perform exact and proximity-based location scoring. It also helps security identify high-loss zones on campus."
        ),
        (
            "Q6: How are uploaded photos stored and served in production?",
            "<b>Answer:</b> Images are uploaded through Multer and stored on Cloudinary's secure content delivery network (CDN). This guarantees fast image loading, automatic format optimization, and persistent cloud storage without burdening the Render server's ephemeral filesystem."
        ),
        (
            "Q7: Why did you choose Node.js and MongoDB over PHP and MySQL?",
            "<b>Answer:</b> Node.js provides non-blocking asynchronous I/O, which is ideal for real-time AI API calls, image processing, and chat widgets. MongoDB's flexible JSON-like document model easily accommodates complex item metadata, embedding vectors, and flexible claim histories without rigid relational constraints."
        ),
        (
            "Q8: What are the future enhancements planned for this project?",
            "<b>Answer:</b> In future iterations, we plan to implement automated Web Push notifications and SMS alerts when a matching item is surrendered, as well as RFID and QR asset tagging for high-value student belongings like laptops and graphing calculators."
        )
    ]

    for q, a in qa_list:
        qa_table = Table([
            [Paragraph(f"<b>{q}</b>", ParagraphStyle('QAQ', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.6, textColor=colors.HexColor('#0f172a')))],
            [Paragraph(a, ParagraphStyle('QAA', parent=styles['Normal'], fontName='Helvetica', fontSize=7.2, leading=9.8, textColor=colors.HexColor('#334155')))]
        ], colWidths=[540])
        qa_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
            ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#ffffff')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(qa_table)
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 4))

    # Pre-Flight Checklist
    story.append(Paragraph("DEFENSE DAY PRE-FLIGHT CHECKLIST", h2_style))
    checklist_text = (
        "&bull; <b>Browser Tabs Prepared:</b> Tab 1 = PowerPoint PDF slides; Tab 2 = Live System (<i>https://lost-and-found-system-7ro8.onrender.com</i>).<br/>"
        "&bull; <b>Admin Login Ready:</b> Username: <code>admin</code> | Password: <code>Siladan2026</code> (pre-tested).<br/>"
        "&bull; <b>Sample Query Ready:</b> Ask AI: <i>'Did anyone find my umbrella in the library?'</i> or <i>'How do I claim an item?'</i>.<br/>"
        "&bull; <b>Time Management:</b> Keep Slides 1–4 under 5 minutes. Spend 12–14 minutes demonstrating the live features.<br/>"
        "&bull; <b>Confidence:</b> Speak audibly, address the panel respectfully, and enjoy demonstrating your hard work!"
    )
    chk_table = Table([[Paragraph(checklist_text, body_style)]], colWidths=[540])
    chk_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ecfdf5')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#6ee7b7')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(chk_table)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated presentation script PDF at: {output_path}")

if __name__ == '__main__':
    out_pdf = r'C:\Users\USER\Downloads\Campus_Lost_and_Found_Presentation_and_Demo_Script.pdf'
    screens_dir = r'C:\Users\USER\Desktop\Losr&Found\docs\screenshots'
    build_pdf(out_pdf, screens_dir)
