"""
Generate High-Quality, Professional Visual Diagrams for Software Engineering 2 Documentation
Generates:
1. Figure 4.1: Context Diagram (Level 0 DFD)
2. Figure 4.2: System Use Case Diagram
3. Figure 5.1: 3-Tier MVC System Architecture Diagram
4. Figure 5.2: Entity-Relationship Diagram (ERD)
5. Figure 6.1: System Navigation Architecture & User Flow Diagram

Styles: Lucidchart-inspired clean vector aesthetic with soft shadows,
rounded cards, high-contrast typography, strict collision avoidance,
zero crossing lines through boxes, and official NDMC project details.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '../docs/diagrams')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------------------------------------------------------------
# Color Palette (Lucidchart / Clean Modern Engineering Style)
# -------------------------------------------------------------
NAVY = "#0F172A"
SLATE_BORDER = "#475569"
CARD_BG = "#FFFFFF"

PRIMARY_BLUE = "#1D4ED8"
PRIMARY_LIGHT = "#EFF6FF"
PRIMARY_BORDER = "#3B82F6"

GREEN_SUCCESS = "#047857"
GREEN_LIGHT = "#ECFDF5"
GREEN_BORDER = "#10B981"

AMBER_WARN = "#B45309"
AMBER_LIGHT = "#FFFBEB"
AMBER_BORDER = "#F59E0B"

PURPLE_AI = "#6D28D9"
PURPLE_LIGHT = "#F5F3FF"
PURPLE_BORDER = "#8B5CF6"

CYAN_ACCENT = "#0E7490"
CYAN_LIGHT = "#ECFEFF"
CYAN_BORDER = "#06B6D4"

DARK_TEXT = "#0F172A"
MUTED_TEXT = "#475569"
LIGHT_TEXT = "#64748B"


def add_card(ax, x, y, w, h, title, subtitle="", box_type="primary", fontsize_title=10, fontsize_sub=8, lw=1.6):
    """Draws a clean Lucidchart card with soft drop shadow and clear text."""
    colors = {
        "primary": (PRIMARY_LIGHT, PRIMARY_BORDER, PRIMARY_BLUE),
        "success": (GREEN_LIGHT, GREEN_BORDER, GREEN_SUCCESS),
        "amber": (AMBER_LIGHT, AMBER_BORDER, AMBER_WARN),
        "purple": (PURPLE_LIGHT, PURPLE_BORDER, PURPLE_AI),
        "cyan": (CYAN_LIGHT, CYAN_BORDER, CYAN_ACCENT),
        "white": (CARD_BG, "#94A3B8", NAVY),
        "dark": (NAVY, NAVY, "#FFFFFF")
    }
    bg, border, text_col = colors.get(box_type, colors["primary"])
    
    # Drop shadow
    shadow = FancyBboxPatch((x + 0.004, y - 0.004), w, h,
                            boxstyle="round,pad=0.008,rounding_size=0.02",
                            ec="none", fc="#CBD5E1", alpha=0.45, zorder=2)
    ax.add_patch(shadow)
    
    # Main Box
    box = FancyBboxPatch((x, y), w, h,
                         boxstyle="round,pad=0.008,rounding_size=0.02",
                         ec=border, fc=bg, lw=lw, zorder=3)
    ax.add_patch(box)
    
    cx = x + w / 2
    cy = y + h / 2
    
    if subtitle:
        ax.text(cx, cy + h * 0.18, title, ha="center", va="center",
                fontsize=fontsize_title, fontweight="bold", color=text_col, zorder=4)
        ax.text(cx, cy - h * 0.18, subtitle, ha="center", va="center",
                fontsize=fontsize_sub, color=MUTED_TEXT, zorder=4)
    else:
        ax.text(cx, cy, title, ha="center", va="center",
                fontsize=fontsize_title, fontweight="bold", color=text_col, zorder=4)


def add_arrow(ax, start, end, label="", label_pos=0.5, label_offset=(0, 0), color="#334155", lw=1.5, ls="-", rad=0.0):
    """Draws a clean directed connection line with an arrow head that stops precisely at endpoints."""
    arrow = patches.FancyArrowPatch(
        start, end,
        connectionstyle=f"arc3,rad={rad}",
        arrowstyle="-|>",
        mutation_scale=13,
        color=color,
        lw=lw,
        linestyle=ls,
        shrinkA=3,
        shrinkB=3,
        zorder=5
    )
    ax.add_patch(arrow)
    
    if label:
        mx = start[0] + (end[0] - start[0]) * label_pos + label_offset[0]
        my = start[1] + (end[1] - start[1]) * label_pos + label_offset[1]
        ax.text(mx, my, label, ha="center", va="center",
                fontsize=7.5, fontweight="bold", color="#1E293B",
                bbox=dict(boxstyle="round,pad=0.25", fc="#FFFFFF", ec="#CBD5E1", lw=0.8, alpha=0.98),
                zorder=6)


# =====================================================================
# 1. CONTEXT DIAGRAM (Figure 4.1)
# =====================================================================
def generate_context_diagram():
    fig, ax = plt.subplots(figsize=(16, 10), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")
    
    # Title Header
    ax.text(0.5, 0.965, "FIGURE 4.1: CONTEXT DIAGRAM (LEVEL 0 DATA FLOW DIAGRAM)",
            ha="center", va="center", fontsize=14, fontweight="heavy", color=NAVY)
    ax.text(0.5, 0.935, "System Boundary, External Entities, and High-Level Bi-Directional Data Flows",
            ha="center", va="center", fontsize=9.5, color=MUTED_TEXT)

    # Center: The Lost & Found System Boundary
    add_card(ax, 0.32, 0.34, 0.36, 0.24,
             "CAMPUS LOST & FOUND\nMANAGEMENT SYSTEM",
             "(Core Processing Platform)\nNotre Dame of Midsayap College",
             box_type="primary", fontsize_title=11.5, fontsize_sub=8.5, lw=2.0)

    # External Entity 1: Student / Faculty (Top)
    add_card(ax, 0.32, 0.77, 0.36, 0.12,
             "Student / Faculty (End Users)",
             "NDMC Campus Population (Searcher / Reporter / Claimant)",
             box_type="cyan", fontsize_title=10.5, fontsize_sub=8)

    # External Entity 2: Chief Security & Property Office (Bottom)
    add_card(ax, 0.32, 0.08, 0.36, 0.12,
             "Chief Security & Property Office",
             "System Administrators & Custodial Staff (Moderation & Adjudication)",
             box_type="amber", fontsize_title=10.5, fontsize_sub=8)

    # External Entity 3: Google Gemini AI (Right Top) - raised to y=0.70 for ample clearance
    add_card(ax, 0.76, 0.70, 0.21, 0.13,
             "Google Gemini AI API",
             "Multimodal Flash Engine\n(Image Comparison & Chat)",
             box_type="purple", fontsize_title=9.5, fontsize_sub=7.5)

    # External Entity 4: Cloudinary Media CDN (Right Middle) - centered at y=0.42
    add_card(ax, 0.76, 0.42, 0.21, 0.13,
             "Cloudinary Media CDN",
             "Asset Hosting & Optimization\n(Secure Photographic CDN)",
             box_type="cyan", fontsize_title=9.5, fontsize_sub=7.5)

    # External Entity 5: Email Gateway (Right Bottom) - lowered to y=0.14
    add_card(ax, 0.76, 0.14, 0.21, 0.13,
             "Email Gateway (SMTP)",
             "Nodemailer / Brevo Service\n(Notifications & Verification)",
             box_type="success", fontsize_title=9.5, fontsize_sub=7.5)

    # External Entity 6: MongoDB Atlas Database (Left)
    add_card(ax, 0.03, 0.37, 0.22, 0.18,
             "MongoDB Atlas (Cloud)",
             "Persistent Storage Cluster\n(Items, Claims, Users, Sessions)",
             box_type="success", fontsize_title=10, fontsize_sub=8)

    # --- ARROWS WITH STRICT COLLISION AVOIDANCE ---

    # 1. Top: Student / Faculty <--> Central System
    # Left arrow (Submissions going down)
    add_arrow(ax, (0.42, 0.77), (0.42, 0.58),
              label="Reports, Claims & Search", label_pos=0.5, label_offset=(-0.08, 0),
              color="#0E7490", lw=1.8)
    # Right arrow (Responses going up)
    add_arrow(ax, (0.54, 0.58), (0.54, 0.77),
              label="Catalog & Match Alerts", label_pos=0.5, label_offset=(-0.065, 0),
              color="#1D4ED8", lw=1.8)

    # 2. Bottom: Chief Security <--> Central System
    # Left arrow (Decisions going down)
    add_arrow(ax, (0.41, 0.34), (0.41, 0.20),
              label="Review Decisions & Handover", label_pos=0.5, label_offset=(-0.08, 0),
              color="#B45309", lw=1.8)
    # Right arrow (Queues going up)
    add_arrow(ax, (0.59, 0.20), (0.59, 0.34),
              label="Pending Items & Audits", label_pos=0.5, label_offset=(0.08, 0),
              color="#1D4ED8", lw=1.8)

    # 3. Left: Central System <--> MongoDB Atlas
    # Top arrow (Queries going left)
    add_arrow(ax, (0.32, 0.49), (0.25, 0.49),
              label="CRUD & Mongoose ODM", label_pos=0.5, label_offset=(0, 0.035),
              color="#047857", lw=1.8)
    # Bottom arrow (Data going right)
    add_arrow(ax, (0.25, 0.43), (0.32, 0.43),
              label="Documents & Sessions", label_pos=0.5, label_offset=(0, -0.035),
              color="#047857", lw=1.8)

    # 4. Right Top: Central System <--> Google Gemini AI (Clean upward trajectory clearing Cloudinary completely)
    # Top arrow (Payload to AI)
    add_arrow(ax, (0.68, 0.55), (0.76, 0.77),
              label="Image Buffers & Prompts", label_pos=0.48, label_offset=(-0.03, 0.032),
              color="#6D28D9", lw=1.8, rad=0.0)
    # Return arrow (AI Score back to System)
    add_arrow(ax, (0.76, 0.71), (0.68, 0.49),
              label="Match Scores & Reasoning", label_pos=0.42, label_offset=(0.02, -0.032),
              color="#6D28D9", lw=1.8, rad=0.0)

    # 5. Right Middle: Central System <--> Cloudinary CDN (Pure horizontal lines)
    # Outgoing upload
    add_arrow(ax, (0.68, 0.47), (0.76, 0.47),
              label="Upload Media", label_pos=0.5, label_offset=(0, 0.025),
              color="#0E7490", lw=1.8)
    # Return CDN URL
    add_arrow(ax, (0.76, 0.44), (0.68, 0.44),
              label="Secure URLs", label_pos=0.5, label_offset=(0, -0.025),
              color="#0E7490", lw=1.8)

    # 6. Right Bottom: Central System --> Email Gateway (Clean downward line with ample clearance)
    add_arrow(ax, (0.68, 0.36), (0.76, 0.21),
              label="Email Alerts (Nodemailer)", label_pos=0.52, label_offset=(0.02, 0.035),
              color="#047857", lw=1.8, rad=0.02)

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "diagram_fig4_1_context.png")
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print("Saved:", out_path)


# =====================================================================
# 2. USE CASE DIAGRAM (Figure 4.2)
# =====================================================================
def generate_use_case_diagram():
    fig, ax = plt.subplots(figsize=(16, 11), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")
    
    # Title
    ax.text(0.5, 0.97, "FIGURE 4.2: SYSTEM USE CASE DIAGRAM",
            ha="center", va="center", fontsize=14, fontweight="heavy", color=NAVY)
    ax.text(0.5, 0.945, "Actor Interactions, System Boundaries, and Modular Functional Use Cases",
            ha="center", va="center", fontsize=9.5, color=MUTED_TEXT)

    # System Boundary Box
    boundary = FancyBboxPatch((0.18, 0.03), 0.64, 0.88,
                              boxstyle="round,pad=0.015,rounding_size=0.02",
                              ec=SLATE_BORDER, fc="#FFFFFF", lw=1.8, linestyle="--", zorder=1)
    ax.add_patch(boundary)
    ax.text(0.50, 0.895, "Campus Lost & Found Management System Boundary",
            ha="center", va="center", fontsize=11, fontweight="bold", color=PRIMARY_BLUE, zorder=2)

    # Stick Figures for Actors
    def draw_actor(ax, x, y, name, role, color=PRIMARY_BLUE):
        circle = patches.Circle((x, y + 0.035), 0.018, ec=color, fc="#DBEAFE", lw=2, zorder=5)
        ax.add_patch(circle)
        ax.plot([x, x], [y + 0.017, y - 0.02], color=color, lw=2.5, zorder=5)
        ax.plot([x - 0.022, x + 0.022], [y + 0.005, y + 0.005], color=color, lw=2.2, zorder=5)
        ax.plot([x, x - 0.018], [y - 0.02, y - 0.05], color=color, lw=2.2, zorder=5)
        ax.plot([x, x + 0.018], [y - 0.02, y - 0.05], color=color, lw=2.2, zorder=5)
        ax.text(x, y - 0.075, name, ha="center", va="top", fontsize=9.5, fontweight="bold", color=NAVY, zorder=5)
        ax.text(x, y - 0.098, role, ha="center", va="top", fontsize=7.5, color=MUTED_TEXT, zorder=5)

    draw_actor(ax, 0.08, 0.68, "Student / Faculty", "Primary User", color=PRIMARY_BLUE)
    draw_actor(ax, 0.08, 0.20, "Claimant", "Property Owner", color=GREEN_SUCCESS)
    draw_actor(ax, 0.92, 0.50, "Administrator", "Security & Custodian", color=AMBER_WARN)

    # Use Case Ovals inside boundary
    def draw_usecase(ax, x, y, w, h, text, code, color=PRIMARY_BLUE, bg="#F0F9FF"):
        oval = patches.Ellipse((x, y), w, h, ec=color, fc=bg, lw=1.5, zorder=3)
        ax.add_patch(oval)
        ax.text(x, y + 0.007, text, ha="center", va="center", fontsize=7.6, fontweight="bold", color=NAVY, zorder=4)
        ax.text(x, y - 0.011, f"({code})", ha="center", va="center", fontsize=6.8, color=MUTED_TEXT, zorder=4)

    # COLUMN 1 (Left Column, x=0.28, w=0.15): Student & Claimant Core Use Cases
    # Student/Faculty Use Cases (Top)
    student_ucs = [
        (0.28, 0.84, "Register & Verify Account", "UC-01"),
        (0.28, 0.76, "Sign In / Authentication", "UC-02"),
        (0.28, 0.68, "Report Lost Property", "UC-03"),
        (0.28, 0.60, "Report Found Property", "UC-04"),
        (0.28, 0.52, "Browse & Search Catalog", "UC-05"),
        (0.28, 0.44, "View Details & Lightbox", "UC-06"),
    ]
    for x, y, name, code in student_ucs:
        draw_usecase(ax, x, y, 0.15, 0.048, name, code, PRIMARY_BLUE, "#EFF6FF")
        ax.plot([0.11, x - 0.075], [0.68, y], color="#94A3B8", lw=1.2, zorder=2)

    # Claimant Core Use Cases (Bottom)
    claimant_ucs = [
        (0.28, 0.32, "File Ownership Claim", "UC-10"),
        (0.28, 0.24, "Upload Ownership Proofs", "UC-11"),
        (0.28, 0.16, "Track 4-Step Claim Stepper", "UC-12"),
        (0.28, 0.08, "Withdraw Active Claim", "UC-13"),
    ]
    for x, y, name, code in claimant_ucs:
        draw_usecase(ax, x, y, 0.15, 0.048, name, code, GREEN_SUCCESS, GREEN_LIGHT)
        ax.plot([0.11, x - 0.075], [0.20, y], color="#10B981", lw=1.2, zorder=2)

    # COLUMN 2 (Middle Column, x=0.50, w=0.15): Automated Services aligned with callers!
    mid_ucs = [
        (0.50, 0.84, "Print Lost/Found QR Poster", "UC-07", PRIMARY_BLUE, "#EFF6FF"),
        (0.50, 0.76, "Manage Personal Dashboard", "UC-09", PRIMARY_BLUE, "#EFF6FF"),
        (0.50, 0.68, "Send Automated Email Alerts", "UC-15", CYAN_ACCENT, CYAN_LIGHT),
        (0.50, 0.60, "Compute Gemini AI Match", "UC-14", PURPLE_AI, PURPLE_LIGHT),
        (0.50, 0.52, "AI Multimodal Search Chat", "UC-08", PURPLE_AI, PURPLE_LIGHT),
        (0.50, 0.34, "Offline Asset Sync (PWA)", "UC-16", CYAN_ACCENT, CYAN_LIGHT),
    ]
    for x, y, name, code, c, bg in mid_ucs:
        draw_usecase(ax, x, y, 0.15, 0.048, name, code, c, bg)

    # COLUMN 3 (Right Column, x=0.72, w=0.15): Administrator Portal Use Cases
    admin_ucs = [
        (0.72, 0.84, "Dedicated Admin Login", "UC-17"),
        (0.72, 0.76, "Review & Moderate Reports", "UC-18"),
        (0.72, 0.68, "Adjudicate Ownership Claims", "UC-19"),
        (0.72, 0.60, "AI Visual Match Inspection", "UC-20"),
        (0.72, 0.52, "Manage Campus Categories", "UC-21"),
        (0.72, 0.44, "Manage NDMC Locations (1-42)", "UC-22"),
        (0.72, 0.34, "User Account Management", "UC-23"),
        (0.72, 0.24, "Export Inventory & Analytics", "UC-24"),
    ]
    for x, y, name, code in admin_ucs:
        draw_usecase(ax, x, y, 0.15, 0.048, name, code, AMBER_WARN, AMBER_LIGHT)
        ax.plot([0.89, x + 0.075], [0.50, y], color="#F59E0B", lw=1.2, zorder=2)

    # --- ZERO-CROSSING UML RELATIONSHIPS (Purely Horizontal or Vertical) ---
    def draw_uml_rel(ax, p1, p2, label="<<include>>", rad=0.0):
        arrow = patches.FancyArrowPatch(p1, p2, connectionstyle=f"arc3,rad={rad}",
                                        arrowstyle="->", linestyle=":", color="#334155", lw=1.4,
                                        shrinkA=2, shrinkB=2, zorder=4)
        ax.add_patch(arrow)
        mx = (p1[0] + p2[0]) / 2
        my = (p1[1] + p2[1]) / 2 + 0.015
        ax.text(mx, my, label, ha="center", va="center", fontsize=6.8, fontweight="bold",
                color="#1E293B", bbox=dict(boxstyle="round,pad=0.15", fc="#FFFFFF", ec="#CBD5E1", lw=0.6), zorder=5)

    # 1. Report Lost (UC-03) -> Email Alert (UC-15) [Pure Horizontal Left -> Middle]
    draw_uml_rel(ax, (0.355, 0.68), (0.425, 0.68), label="<<include>>")

    # 2. Adjudicate Claims (UC-19) -> Email Alert (UC-15) [Pure Horizontal Right -> Middle]
    draw_uml_rel(ax, (0.645, 0.68), (0.575, 0.68), label="<<include>>")

    # 3. Report Found (UC-04) -> AI Match (UC-14) [Pure Horizontal Left -> Middle]
    draw_uml_rel(ax, (0.355, 0.60), (0.425, 0.60), label="<<include>>")

    # 4. AI Visual Match (UC-20) -> AI Match (UC-14) [Pure Horizontal Right -> Middle]
    draw_uml_rel(ax, (0.645, 0.60), (0.575, 0.60), label="<<include>>")

    # 5. Browse Catalog (UC-05) -> AI Search Chat (UC-08) [Pure Horizontal Left -> Middle Extend]
    draw_uml_rel(ax, (0.355, 0.52), (0.425, 0.52), label="<<extend>>")

    # 6. View Details (UC-06) -> File Claim (UC-10) [Pure Vertical Column 1 Extend]
    draw_uml_rel(ax, (0.28, 0.416), (0.28, 0.344), label="<<extend>>")

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "diagram_fig4_2_usecase.png")
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print("Saved:", out_path)


# =====================================================================
# 3. 3-TIER MVC SYSTEM ARCHITECTURE DIAGRAM (Figure 5.1)
# =====================================================================
def generate_architecture_diagram():
    fig, ax = plt.subplots(figsize=(16, 11), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")
    
    # Title
    ax.text(0.5, 0.97, "FIGURE 5.1: 3-TIER MODEL-VIEW-CONTROLLER (MVC) SYSTEM ARCHITECTURE",
            ha="center", va="center", fontsize=14, fontweight="heavy", color=NAVY)
    ax.text(0.5, 0.942, "Decoupled Presentation, Application Logic, External Services, and Cloud Persistence",
            ha="center", va="center", fontsize=9.5, color=MUTED_TEXT)

    # --- TIER 1: CLIENT PRESENTATION TIER ---
    tier1 = FancyBboxPatch((0.04, 0.73), 0.92, 0.18, boxstyle="round,pad=0.008,rounding_size=0.02",
                           ec=PRIMARY_BORDER, fc="#F0F9FF", lw=1.6, zorder=1)
    ax.add_patch(tier1)
    ax.text(0.06, 0.88, "TIER 1: CLIENT PRESENTATION TIER (USER AGENTS & PWA)",
            fontsize=10.5, fontweight="bold", color=PRIMARY_BLUE, zorder=2)

    # 3 Client Cards with generous 0.03 gaps
    add_card(ax, 0.07, 0.75, 0.26, 0.11,
             "Desktop & Mobile Browsers", "Chrome, Safari, Edge, Firefox\nResponsive Viewport Engine",
             box_type="white", fontsize_title=9, fontsize_sub=7.5)

    add_card(ax, 0.37, 0.75, 0.26, 0.11,
             "Dynamic View Layer (EJS)", "Semantic HTML5, Bootstrap 5.3\nDark Luxury & Light Theme Engine",
             box_type="white", fontsize_title=9, fontsize_sub=7.5)

    add_card(ax, 0.67, 0.75, 0.26, 0.11,
             "Progressive Web App (PWA)", "Service Worker v2 & Manifest\nOffline Shell & Static Asset Cache",
             box_type="white", fontsize_title=9, fontsize_sub=7.5)

    # Inter-Tier Arrow 1 -> 2
    add_arrow(ax, (0.50, 0.73), (0.50, 0.65),
              label="HTTP / HTTPS Requests & JSON Payloads", label_pos=0.5,
              color=PRIMARY_BLUE, lw=2.0)

    # --- TIER 2: APPLICATION & PROCESSING TIER ---
    tier2 = FancyBboxPatch((0.04, 0.25), 0.92, 0.40, boxstyle="round,pad=0.008,rounding_size=0.02",
                           ec="#64748B", fc="#FFFFFF", lw=1.6, zorder=1)
    ax.add_patch(tier2)
    ax.text(0.06, 0.62, "TIER 2: APPLICATION & PROCESSING TIER (Node.js / Express.js Server on Render.com)",
            fontsize=10.5, fontweight="bold", color=NAVY, zorder=2)

    # Row 1: 4 Modular Server Components with explicit 0.02 gaps (no border collisions!)
    add_card(ax, 0.07, 0.46, 0.20, 0.13,
             "Security Middleware", "Helmet HTTP Headers\nMongo-Sanitize (NoSQL)\nBcrypt & Express-Session",
             box_type="amber", fontsize_title=8.5, fontsize_sub=7)

    add_card(ax, 0.29, 0.46, 0.20, 0.13,
             "Modular Routing", "/auth, /items, /claims\n/admin, /api/chat\nREST Controller Endpoints",
             box_type="primary", fontsize_title=8.5, fontsize_sub=7)

    add_card(ax, 0.51, 0.46, 0.20, 0.13,
             "Controller Handlers", "authController, itemController\nadminController, claimController\nBusiness Logic & Permissions",
             box_type="primary", fontsize_title=8.5, fontsize_sub=7)

    add_card(ax, 0.73, 0.46, 0.20, 0.13,
             "Core Domain Services", "matchingService (Hybrid Algorithm)\ngeminiService (GenAI)\nemailService (Nodemailer)",
             box_type="purple", fontsize_title=8.5, fontsize_sub=7)

    # Row 2: External Gateways Sub-Container
    ext_box = FancyBboxPatch((0.07, 0.28), 0.86, 0.14, boxstyle="round,pad=0.008,rounding_size=0.015",
                             ec=PURPLE_BORDER, fc=PURPLE_LIGHT, lw=1.2, zorder=2)
    ax.add_patch(ext_box)
    ax.text(0.09, 0.395, "EXTERNAL CLOUD GATEWAYS & MICROSERVICES",
            fontsize=8.5, fontweight="bold", color=PURPLE_AI, zorder=3)

    add_card(ax, 0.09, 0.30, 0.24, 0.08,
             "Google Gemini AI 2.0 Flash", "Multimodal Vector Scoring",
             box_type="white", fontsize_title=8, fontsize_sub=6.8)

    add_card(ax, 0.38, 0.30, 0.24, 0.08,
             "Cloudinary CDN Storage", "Secure Image Delivery & Resizing",
             box_type="white", fontsize_title=8, fontsize_sub=6.8)

    add_card(ax, 0.67, 0.30, 0.24, 0.08,
             "Transactional SMTP Server", "Gmail / Brevo Email Delivery",
             box_type="white", fontsize_title=8, fontsize_sub=6.8)

    # Inter-Tier Arrow 2 -> 3
    add_arrow(ax, (0.50, 0.25), (0.50, 0.18),
              label="Mongoose ODM Wire Protocol (TCP Encrypted Connection)", label_pos=0.5,
              color=GREEN_SUCCESS, lw=2.0)

    # --- TIER 3: DATA PERSISTENCE TIER ---
    tier3 = FancyBboxPatch((0.04, 0.03), 0.92, 0.15, boxstyle="round,pad=0.008,rounding_size=0.02",
                           ec=GREEN_BORDER, fc=GREEN_LIGHT, lw=1.6, zorder=1)
    ax.add_patch(tier3)
    ax.text(0.06, 0.155, "TIER 3: DATA PERSISTENCE TIER (MONGODB ATLAS CLOUD REPLICA SET)",
            fontsize=10.5, fontweight="bold", color=GREEN_SUCCESS, zorder=2)

    colls = [
        (0.065, "users Collection", "Credentials, Roles,\nProfile Settings"),
        (0.240, "items Collection", "Lost/Found Metadata,\nCloudinary URLs"),
        (0.415, "claimrequests", "Proof Documents,\nStatus Audit Timeline"),
        (0.590, "categories & locs", "10 Taxonomy Categories,\n42 NDMC Landmarks"),
        (0.765, "sessions Collection", "connect-mongo Persistent\nAuthentication Tokens")
    ]
    for x_pos, title, sub in colls:
        add_card(ax, x_pos, 0.05, 0.16, 0.085, title, sub, box_type="white", fontsize_title=8, fontsize_sub=6.5)

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "diagram_fig5_1_architecture.png")
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print("Saved:", out_path)


# =====================================================================
# 4. ENTITY RELATIONSHIP DIAGRAM (ERD) (Figure 5.2)
# =====================================================================
def generate_erd_diagram():
    fig, ax = plt.subplots(figsize=(16, 11), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")
    
    # Title
    ax.text(0.5, 0.97, "FIGURE 5.2: ENTITY-RELATIONSHIP DIAGRAM (ERD)",
            ha="center", va="center", fontsize=14, fontweight="heavy", color=NAVY)
    ax.text(0.5, 0.942, "MongoDB Document Schemas, Foreign Key Mappings, and Relational Cardinalities",
            ha="center", va="center", fontsize=9.5, color=MUTED_TEXT)

    def draw_erd_entity(ax, x, y, w, h, table_name, pk_list, fields, bg_header=PRIMARY_BLUE):
        """Draws a clean database schema card with header, PK section, and fields."""
        card = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.005,rounding_size=0.015",
                              ec=SLATE_BORDER, fc="#FFFFFF", lw=1.5, zorder=2)
        ax.add_patch(card)
        header_h = 0.042
        header = FancyBboxPatch((x, y + h - header_h), w, header_h,
                                boxstyle="round,pad=0.005,rounding_size=0.015",
                                ec="none", fc=bg_header, zorder=3)
        ax.add_patch(header)
        ax.text(x + w / 2, y + h - header_h / 2, table_name,
                ha="center", va="center", fontsize=9.5, fontweight="bold", color="#FFFFFF", zorder=4)

        cy = y + h - header_h - 0.018
        for pk in pk_list:
            ax.text(x + 0.012, cy, pk, fontsize=7.2, fontweight="bold", color="#B91C1C", zorder=4)
            cy -= 0.021

        ax.plot([x + 0.008, x + w - 0.008], [cy + 0.007, cy + 0.007], color="#CBD5E1", lw=1, zorder=4)
        cy -= 0.012

        for f in fields:
            ax.text(x + 0.012, cy, f, fontsize=6.8, color="#1E293B", zorder=4)
            cy -= 0.018

    # TOP ROW: USER (Left) <---> ITEM (Center) <---> CATEGORY (Right)
    # 1. USER Entity (Top Left, x=0.04 to 0.28)
    draw_erd_entity(ax, 0.04, 0.52, 0.24, 0.38, "USER",
                    ["[PK] _id : ObjectId"],
                    [
                        "username : String (Unique)",
                        "email : String (Unique)",
                        "password : String (Bcrypt Hash)",
                        "role : Enum ['user', 'admin']",
                        "isActive : Boolean",
                        "isEmailVerified : Boolean",
                        "phoneNumber : String",
                        "notificationPreferences : Object",
                        "emailVerificationToken : String",
                        "createdAt / updatedAt : Date"
                    ],
                    bg_header=NAVY)

    # 2. ITEM Entity (Center Hub, x=0.38 to 0.64)
    draw_erd_entity(ax, 0.38, 0.46, 0.26, 0.44, "ITEM",
                    ["[PK] _id : ObjectId"],
                    [
                        "[FK] reportedBy : ObjectId -> USER",
                        "[FK] category : ObjectId -> CATEGORY",
                        "[FK] locationId : ObjectId -> LOCATION",
                        "itemName : String (Indexed)",
                        "description : String (Text Index)",
                        "location : String (NDMC Landmark)",
                        "imagePath : String (Cloudinary URL)",
                        "type : Enum ['lost', 'found']",
                        "status : Enum ['pending','approved',...]",
                        "potentialMatches : Array[MatchSchema]",
                        "dateLostFound / dateReported : Date",
                        "createdAt / updatedAt : Date"
                    ],
                    bg_header=PRIMARY_BLUE)

    # 3. CATEGORY Entity (Top Right, x=0.74 to 0.96)
    draw_erd_entity(ax, 0.74, 0.66, 0.22, 0.24, "CATEGORY",
                    ["[PK] _id : ObjectId"],
                    [
                        "name : String (Unique)",
                        "description : String",
                        "icon : String (Font Awesome)",
                        "itemCount : Number (Virtual)",
                        "isActive : Boolean",
                        "createdAt / updatedAt : Date"
                    ],
                    bg_header=PURPLE_AI)

    # BOTTOM ROW: CLAIMREQUEST (Left) <---> LOCATION (Center) <---> INTEGRITY RULES (Right)
    # 4. CLAIMREQUEST Entity (Bottom Left, x=0.04 to 0.28)
    draw_erd_entity(ax, 0.04, 0.05, 0.24, 0.38, "CLAIMREQUEST",
                    ["[PK] _id : ObjectId"],
                    [
                        "[FK] item : ObjectId -> ITEM",
                        "[FK] claimant : ObjectId -> USER",
                        "[FK] reviewedBy : ObjectId -> USER",
                        "description : String (Ownership details)",
                        "proofOfOwnership : String",
                        "proofImages : Array[String] (Max 3)",
                        "status : Enum ['pending','approved',...]",
                        "priority : Enum ['low','medium','high']",
                        "timeline : Array[StatusChangeSchema]",
                        "submittedAt / resolvedAt : Date"
                    ],
                    bg_header=GREEN_SUCCESS)

    # 5. LOCATION Entity (Bottom Center, x=0.38 to 0.64)
    draw_erd_entity(ax, 0.38, 0.05, 0.26, 0.33, "LOCATION",
                    ["[PK] _id : ObjectId"],
                    [
                        "[FK] suggestedBy : ObjectId -> USER",
                        "name : String (Unique NDMC Landmark)",
                        "description : String",
                        "status : Enum ['approved','pending']",
                        "buildingNumber : String (1-42)",
                        "isActive : Boolean",
                        "createdAt / updatedAt : Date"
                    ],
                    bg_header=AMBER_WARN)

    # 6. Integrity Rules & Legend (Bottom Right, x=0.74 to 0.96)
    legend_box = FancyBboxPatch((0.74, 0.05), 0.22, 0.50, boxstyle="round,pad=0.008,rounding_size=0.015",
                                ec="#CBD5E1", fc="#F1F5F9", lw=1.2, zorder=2)
    ax.add_patch(legend_box)
    ax.text(0.755, 0.515, "RELATIONAL INTEGRITY RULES", fontsize=8.5, fontweight="bold", color=NAVY, zorder=3)
    ax.text(0.755, 0.475, "• 1 : N (User -> Item)", fontsize=7.2, fontweight="bold", color=PRIMARY_BLUE, zorder=3)
    ax.text(0.755, 0.445, "  A user files multiple reports.", fontsize=6.8, color=MUTED_TEXT, zorder=3)
    ax.text(0.755, 0.405, "• 1 : N (Category -> Item)", fontsize=7.2, fontweight="bold", color=PURPLE_AI, zorder=3)
    ax.text(0.755, 0.375, "  Each item has 1 category.", fontsize=6.8, color=MUTED_TEXT, zorder=3)
    ax.text(0.755, 0.335, "• 1 : N (Item -> ClaimRequest)", fontsize=7.2, fontweight="bold", color=GREEN_SUCCESS, zorder=3)
    ax.text(0.755, 0.305, "  Multiple claims per item.", fontsize=6.8, color=MUTED_TEXT, zorder=3)
    ax.text(0.755, 0.265, "• 1 : N (User -> ClaimRequest)", fontsize=7.2, fontweight="bold", color=GREEN_SUCCESS, zorder=3)
    ax.text(0.755, 0.235, "  A user files multiple claims.", fontsize=6.8, color=MUTED_TEXT, zorder=3)
    ax.text(0.755, 0.195, "• 1 : N (Location -> Item)", fontsize=7.2, fontweight="bold", color=AMBER_WARN, zorder=3)
    ax.text(0.755, 0.165, "  Items tagged with campus site.", fontsize=6.8, color=MUTED_TEXT, zorder=3)
    ax.text(0.755, 0.125, "• 1 : N (User -> Location)", fontsize=7.2, fontweight="bold", color=AMBER_WARN, zorder=3)
    ax.text(0.755, 0.095, "  Users suggest custom spots.", fontsize=6.8, color=MUTED_TEXT, zorder=3)

    # --- ZERO-INTERSECTION RELATIONSHIP CONNECTORS ---

    # 1. USER -> ITEM (1 : N reports) - Clean horizontal line between Top-Left and Top-Center (0.10 gap)
    add_arrow(ax, (0.28, 0.72), (0.38, 0.72), label="1 : N (reports)", label_pos=0.5, label_offset=(0, 0.025), color=PRIMARY_BLUE, lw=1.8)

    # 2. CATEGORY -> ITEM (1 : N categorizes) - Clean horizontal line between Top-Right and Top-Center (0.10 gap)
    add_arrow(ax, (0.74, 0.76), (0.64, 0.76), label="1 : N (categorizes)", label_pos=0.5, label_offset=(0, 0.025), color=PURPLE_AI, lw=1.8)

    # 3. USER -> CLAIMREQUEST (1 : N submits) - Clean vertical line down from USER to CLAIMREQUEST (0.09 gap)
    add_arrow(ax, (0.16, 0.52), (0.16, 0.43), label="1 : N (submits claim)", label_pos=0.5, label_offset=(-0.075, 0), color=GREEN_SUCCESS, lw=1.8)

    # 4. ITEM -> CLAIMREQUEST (1 : N claimed by) - Clean diagonal line across open center gap
    add_arrow(ax, (0.38, 0.48), (0.28, 0.32), label="1 : N (claimed by)", label_pos=0.45, label_offset=(0.02, 0.035), color=GREEN_SUCCESS, lw=1.8)

    # 5. LOCATION -> ITEM (1 : N location tag) - Clean vertical line up from LOCATION to ITEM (0.08 gap)
    add_arrow(ax, (0.51, 0.38), (0.51, 0.46), label="1 : N (located at)", label_pos=0.5, label_offset=(0.065, 0), color=AMBER_WARN, lw=1.8)

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "diagram_fig5_2_erd.png")
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print("Saved:", out_path)


# =====================================================================
# 5. SYSTEM NAVIGATION FLOW / SITEMAP (Figure 6.1)
# =====================================================================
def generate_navigation_diagram():
    fig, ax = plt.subplots(figsize=(16, 11), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")
    
    # Title
    ax.text(0.5, 0.97, "FIGURE 6.1: SYSTEM NAVIGATION ARCHITECTURE & USER JOURNEY MAP",
            ha="center", va="center", fontsize=14, fontweight="heavy", color=NAVY)
    ax.text(0.5, 0.942, "Public Catalog Routes, Authenticated Student Flow, and Administrative Moderation Paths",
            ha="center", va="center", fontsize=9.5, color=MUTED_TEXT)

    # Root: Home Page (Top)
    add_card(ax, 0.36, 0.83, 0.28, 0.09,
             "HOME PAGE (/)", "Landing Page, Search Hero,\nKPI Counters, How-It-Works",
             box_type="primary", fontsize_title=10.5, fontsize_sub=7.5)

    # Clean Tree Bus Line connecting Home to the 3 Pillars
    # 1. Stem down from Home bottom
    ax.plot([0.50, 0.50], [0.83, 0.78], color="#64748B", lw=2, zorder=2)
    # 2. Horizontal bus bar spanning across all 3 pillars
    ax.plot([0.17, 0.83], [0.78, 0.78], color="#64748B", lw=2, zorder=2)
    # 3. Drops down to each pillar header
    add_arrow(ax, (0.17, 0.78), (0.17, 0.73), color=CYAN_ACCENT, lw=2)
    add_arrow(ax, (0.50, 0.78), (0.50, 0.73), color=GREEN_SUCCESS, lw=2)
    add_arrow(ax, (0.83, 0.78), (0.83, 0.73), color=AMBER_WARN, lw=2)

    # --- PILLAR 1: PUBLIC DISCOVERY (Left) ---
    add_card(ax, 0.04, 0.65, 0.26, 0.08,
             "1. PUBLIC CATALOGS", "Browse, Filter, Inspect",
             box_type="cyan", fontsize_title=9.5, fontsize_sub=7.5)

    p1_cards = [
        (0.53, "Lost Items Directory (/items/lost)", "Category Pills, 4-Col Grid, Search"),
        (0.41, "Found Items Directory (/items/found)", "Location Filters, Campus Landmarks"),
        (0.29, "Item Detail Page (/items/:id)", "Lightbox Zoom, Reporter Info, Share"),
        (0.17, "Claimed Showcase (/items/claimed)", "Successfully Reunited Property Gallery")
    ]
    for y_pos, title, sub in p1_cards:
        add_card(ax, 0.04, y_pos, 0.26, 0.075, title, sub, box_type="white", fontsize_title=8, fontsize_sub=6.5)

    # Vertical connectors for Pillar 1
    add_arrow(ax, (0.17, 0.65), (0.17, 0.605), color="#94A3B8")
    add_arrow(ax, (0.17, 0.53), (0.17, 0.485), color="#94A3B8")
    add_arrow(ax, (0.17, 0.41), (0.17, 0.365), color="#94A3B8")
    add_arrow(ax, (0.17, 0.29), (0.17, 0.245), color="#94A3B8")

    # --- PILLAR 2: AUTHENTICATED PORTAL (Middle) ---
    add_card(ax, 0.37, 0.65, 0.26, 0.08,
             "2. AUTHENTICATED PORTAL", "Reporting & Claim Stepper",
             box_type="success", fontsize_title=9.5, fontsize_sub=7.5)

    p2_cards = [
        (0.53, "Report Lost/Found (/report/*)", "Drag-Drop Upload, Landmark Selector"),
        (0.41, "Submit Claim Form (/claims/form/:id)", "Proof of Ownership, Secret Marks"),
        (0.29, "My Claims Stepper (/claims/my-claims)", "4-Step Visual Resolution Tracker"),
        (0.17, "User Dashboard (/user/dashboard)", "Personal Stats, My Reports, Profile")
    ]
    for y_pos, title, sub in p2_cards:
        add_card(ax, 0.37, y_pos, 0.26, 0.075, title, sub, box_type="white", fontsize_title=8, fontsize_sub=6.5)

    # Vertical connectors for Pillar 2
    add_arrow(ax, (0.50, 0.65), (0.50, 0.605), color="#94A3B8")
    add_arrow(ax, (0.50, 0.53), (0.50, 0.485), color="#94A3B8")
    add_arrow(ax, (0.50, 0.41), (0.50, 0.365), color="#94A3B8")
    add_arrow(ax, (0.50, 0.29), (0.50, 0.245), color="#94A3B8")

    # --- PILLAR 3: ADMINISTRATOR CONSOLE (Right) ---
    add_card(ax, 0.70, 0.65, 0.26, 0.08,
             "3. ADMIN CONSOLE (/admin/*)", "Moderation, AI Scoring, Auditing",
             box_type="amber", fontsize_title=9.5, fontsize_sub=7.5)

    p3_cards = [
        (0.53, "Admin Dashboard (/admin/dashboard)", "Overview Metrics, Quick Moderation"),
        (0.41, "Pending Items (/admin/items)", "Approve, Reject, Edit, CSV Export"),
        (0.29, "Claims Adjudication (/admin/claims)", "Proof Review, Decision Modal, Handover"),
        (0.17, "AI Matching & Settings", "Gemini Scoring, Categories, Locations")
    ]
    for y_pos, title, sub in p3_cards:
        add_card(ax, 0.70, y_pos, 0.26, 0.075, title, sub, box_type="white", fontsize_title=8, fontsize_sub=6.5)

    # Vertical connectors for Pillar 3
    add_arrow(ax, (0.83, 0.65), (0.83, 0.605), color="#94A3B8")
    add_arrow(ax, (0.83, 0.53), (0.83, 0.485), color="#94A3B8")
    add_arrow(ax, (0.83, 0.41), (0.83, 0.365), color="#94A3B8")
    add_arrow(ax, (0.83, 0.29), (0.83, 0.245), color="#94A3B8")

    # --- CROSS-CUTTING AI DRAWER (Bottom) ---
    ai_drawer = FancyBboxPatch((0.20, 0.035), 0.60, 0.075, boxstyle="round,pad=0.008,rounding_size=0.015",
                               ec=PURPLE_BORDER, fc=PURPLE_LIGHT, lw=1.6, zorder=2)
    ax.add_patch(ai_drawer)
    ax.text(0.50, 0.085, "PERSISTENT FLOATING AI ASSISTANT DRAWER (/api/chat)",
            ha="center", va="center", fontsize=9, fontweight="bold", color=PURPLE_AI, zorder=3)
    ax.text(0.50, 0.055, "Globally accessible across all routes: Natural-language query parsing & multimodal photo matching",
            ha="center", va="center", fontsize=7.5, color=MUTED_TEXT, zorder=3)

    # Clean dotted arrow links from bottom catalogs to AI drawer (stopping cleanly at outer borders)
    add_arrow(ax, (0.17, 0.17), (0.24, 0.11), color="#A855F7", lw=1.3, ls=":")
    add_arrow(ax, (0.83, 0.17), (0.76, 0.11), color="#A855F7", lw=1.3, ls=":")

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "diagram_fig6_1_navigation.png")
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print("Saved:", out_path)


if __name__ == "__main__":
    print("Generating diagrams...")
    generate_context_diagram()
    generate_use_case_diagram()
    generate_architecture_diagram()
    generate_erd_diagram()
    generate_navigation_diagram()
    print("All 5 diagrams successfully generated!")
