"""
Generate High-Quality Visual Diagrams for Software Engineering 2 Documentation
Generates:
1. Context Diagram (Level 0 DFD)
2. Use Case Diagram
3. 3-Tier MVC System Architecture Diagram
4. Entity Relationship Diagram (ERD)
5. System Navigation Architecture Diagram

Styles: Lucidchart-inspired clean vector aesthetic with soft shadows,
rounded cards, high-contrast typography, and official NDMC project details.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ArrowStyle
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '../docs/diagrams')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------------------------------------------------------------
# Color Palette (Lucidchart / Modern Engineering Style)
# -------------------------------------------------------------
NAVY = "#0F172A"
SLATE_BORDER = "#334155"
CARD_BG = "#FFFFFF"
SHADOW_BG = "#E2E8F0"

PRIMARY_BLUE = "#2563EB"
PRIMARY_LIGHT = "#EFF6FF"
PRIMARY_BORDER = "#3B82F6"

GREEN_SUCCESS = "#059669"
GREEN_LIGHT = "#ECFDF5"
GREEN_BORDER = "#10B981"

AMBER_WARN = "#D97706"
AMBER_LIGHT = "#FFFBEB"
AMBER_BORDER = "#F59E0B"

PURPLE_AI = "#7C3AED"
PURPLE_LIGHT = "#F5F3FF"
PURPLE_BORDER = "#8B5CF6"

CYAN_ACCENT = "#0891B2"
CYAN_LIGHT = "#ECFEFF"

DARK_TEXT = "#0F172A"
MUTED_TEXT = "#475569"
LIGHT_TEXT = "#64748B"


def add_rounded_box(ax, x, y, w, h, title, subtitle="", box_type="primary", fontsize_title=10, fontsize_sub=8, icon=""):
    """Draws a modern Lucidchart card with header and border."""
    colors = {
        "primary": (PRIMARY_LIGHT, PRIMARY_BORDER, PRIMARY_BLUE),
        "success": (GREEN_LIGHT, GREEN_BORDER, GREEN_SUCCESS),
        "amber": (AMBER_LIGHT, AMBER_BORDER, AMBER_WARN),
        "purple": (PURPLE_LIGHT, PURPLE_BORDER, PURPLE_AI),
        "cyan": (CYAN_LIGHT, CYAN_ACCENT, CYAN_ACCENT),
        "white": (CARD_BG, SLATE_BORDER, NAVY),
        "dark": (NAVY, NAVY, "#FFFFFF")
    }
    bg, border, text_col = colors.get(box_type, colors["primary"])
    
    # Shadow
    shadow = FancyBboxPatch((x + 0.005, y - 0.005), w, h,
                            boxstyle="round,pad=0.012,rounding_size=0.03",
                            ec="none", fc="#CBD5E1", alpha=0.5, zorder=2)
    ax.add_patch(shadow)
    
    # Main Box
    box = FancyBboxPatch((x, y), w, h,
                         boxstyle="round,pad=0.012,rounding_size=0.03",
                         ec=border, fc=bg, lw=1.8, zorder=3)
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


def add_curved_arrow(ax, start, end, label="", label_pos=0.5, rad=0.0, color="#475569", lw=1.5, ls="-"):
    """Draws a directed connection line with arrow and clean label pill."""
    arrow = patches.FancyArrowPatch(
        start, end,
        connectionstyle=f"arc3,rad={rad}",
        arrowstyle="-|>",
        mutation_scale=14,
        color=color,
        lw=lw,
        linestyle=ls,
        zorder=5
    )
    ax.add_patch(arrow)
    
    if label:
        # compute midpoint
        mx = start[0] + (end[0] - start[0]) * label_pos
        my = start[1] + (end[1] - start[1]) * label_pos
        if rad != 0:
            my += rad * 0.08
        ax.text(mx, my, label, ha="center", va="center",
                fontsize=7.5, fontweight="bold", color="#1E293B",
                bbox=dict(boxstyle="round,pad=0.25", fc="#FFFFFF", ec="#CBD5E1", lw=0.8, alpha=0.95),
                zorder=6)


# =====================================================================
# 1. CONTEXT DIAGRAM (Figure 4.1)
# =====================================================================
def generate_context_diagram():
    fig, ax = plt.subplots(figsize=(14, 9), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")
    
    # Title Header
    ax.text(0.5, 0.96, "FIGURE 4.1: CONTEXT DIAGRAM (LEVEL 0 DATA FLOW DIAGRAM)",
            ha="center", va="center", fontsize=14, fontweight="heavy", color=NAVY)
    ax.text(0.5, 0.925, "System Boundary, External Entities, and High-Level Bi-Directional Data Flows",
            ha="center", va="center", fontsize=9.5, color=MUTED_TEXT)

    # Center: The Lost & Found System Boundary
    add_rounded_box(ax, 0.35, 0.38, 0.30, 0.22,
                    "CAMPUS LOST & FOUND\nMANAGEMENT SYSTEM",
                    "(Core Processing Platform)\nNotre Dame of Midsayap College",
                    box_type="primary", fontsize_title=11, fontsize_sub=8)

    # External Entity 1: Student / Faculty (Top)
    add_rounded_box(ax, 0.35, 0.74, 0.30, 0.12,
                    "Student / Faculty (End User)",
                    "NDMC Campus Population (Searcher / Reporter / Claimant)",
                    box_type="cyan", fontsize_title=10, fontsize_sub=8)

    # External Entity 2: Campus Administrator (Bottom)
    add_rounded_box(ax, 0.35, 0.10, 0.30, 0.12,
                    "Chief Security & Property Office",
                    "System Administrators & Custodial Staff (Moderation & Adjudication)",
                    box_type="amber", fontsize_title=10, fontsize_sub=8)

    # External Entity 3: Google Gemini AI (Right Top)
    add_rounded_box(ax, 0.76, 0.62, 0.21, 0.13,
                    "Google Gemini AI API",
                    "Multimodal Flash Engine\n(Image Comparison & Chat)",
                    box_type="purple", fontsize_title=9.5, fontsize_sub=7.5)

    # External Entity 4: Cloudinary Media CDN (Right Middle)
    add_rounded_box(ax, 0.76, 0.40, 0.21, 0.13,
                    "Cloudinary Media CDN",
                    "Asset Hosting & Optimization\n(Secure Photographic CDN)",
                    box_type="cyan", fontsize_title=9.5, fontsize_sub=7.5)

    # External Entity 5: Nodemailer / Brevo SMTP (Right Bottom)
    add_rounded_box(ax, 0.76, 0.18, 0.21, 0.13,
                    "Email Gateway (SMTP)",
                    "Nodemailer / Brevo Service\n(Notifications & Verification)",
                    box_type="success", fontsize_title=9.5, fontsize_sub=7.5)

    # External Entity 6: MongoDB Atlas Database (Left)
    add_rounded_box(ax, 0.03, 0.40, 0.22, 0.15,
                    "MongoDB Atlas (Cloud)",
                    "Persistent Storage Cluster\n(Items, Claims, Users, Logs)",
                    box_type="success", fontsize_title=10, fontsize_sub=8)

    # Arrows - User <-> System
    add_curved_arrow(ax, (0.43, 0.74), (0.43, 0.60), "Item Reports, Claims, Proofs, Search Queries", rad=-0.05)
    add_curved_arrow(ax, (0.57, 0.60), (0.57, 0.74), "Catalogs, Claim Status, AI Answers, Alerts", rad=-0.05)

    # Arrows - Admin <-> System
    add_curved_arrow(ax, (0.43, 0.38), (0.43, 0.22), "Moderation Decisions, Audits, Handover Approvals", rad=0.05)
    add_curved_arrow(ax, (0.57, 0.22), (0.57, 0.38), "Pending Queues, KPI Metrics, Audit Logs", rad=0.05)

    # Arrows - System <-> AI
    add_curved_arrow(ax, (0.65, 0.54), (0.76, 0.68), "Image Buffers & Text Prompts", rad=-0.08)
    add_curved_arrow(ax, (0.76, 0.64), (0.65, 0.50), "Match Scores & Reasoning", rad=-0.08)

    # Arrows - System <-> Cloudinary
    add_curved_arrow(ax, (0.65, 0.48), (0.76, 0.48), "Upload Photos", rad=-0.02)
    add_curved_arrow(ax, (0.76, 0.44), (0.65, 0.44), "Optimized URLs", rad=-0.02)

    # Arrows - System -> SMTP
    add_curved_arrow(ax, (0.65, 0.41), (0.76, 0.26), "Email Payloads (Approvals / Claims)", rad=0.06)

    # Arrows - System <-> MongoDB Atlas
    add_curved_arrow(ax, (0.35, 0.50), (0.25, 0.50), "CRUD Queries & Mongoose ODM", rad=-0.03)
    add_curved_arrow(ax, (0.25, 0.46), (0.35, 0.46), "Data Documents & Sessions", rad=-0.03)

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "diagram_fig4_1_context.png")
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print("Saved:", out_path)


# =====================================================================
# 2. USE CASE DIAGRAM (Figure 4.2)
# =====================================================================
def generate_use_case_diagram():
    fig, ax = plt.subplots(figsize=(15, 11), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")
    
    # Title
    ax.text(0.5, 0.97, "FIGURE 4.2: SYSTEM USE CASE DIAGRAM",
            ha="center", va="center", fontsize=14, fontweight="heavy", color=NAVY)
    ax.text(0.5, 0.945, "Actor Interactions, System Boundaries, and Functional Use Cases",
            ha="center", va="center", fontsize=9.5, color=MUTED_TEXT)

    # System Boundary Box
    boundary = FancyBboxPatch((0.21, 0.05), 0.58, 0.86,
                              boxstyle="round,pad=0.015,rounding_size=0.02",
                              ec=SLATE_BORDER, fc="#FFFFFF", lw=1.8, linestyle="--", zorder=1)
    ax.add_patch(boundary)
    ax.text(0.50, 0.89, "Campus Lost & Found Management System Boundary",
            ha="center", va="center", fontsize=11, fontweight="bold", color=PRIMARY_BLUE, zorder=2)

    # Actors (Left: Student / Faculty)
    def draw_actor(ax, x, y, name, role):
        # Head
        circle = patches.Circle((x, y + 0.035), 0.018, ec=PRIMARY_BLUE, fc="#DBEAFE", lw=2, zorder=5)
        ax.add_patch(circle)
        # Body
        ax.plot([x, x], [y + 0.017, y - 0.02], color=PRIMARY_BLUE, lw=2.5, zorder=5)
        # Arms
        ax.plot([x - 0.022, x + 0.022], [y + 0.005, y + 0.005], color=PRIMARY_BLUE, lw=2.2, zorder=5)
        # Legs
        ax.plot([x, x - 0.018], [y - 0.02, y - 0.05], color=PRIMARY_BLUE, lw=2.2, zorder=5)
        ax.plot([x, x + 0.018], [y - 0.02, y - 0.05], color=PRIMARY_BLUE, lw=2.2, zorder=5)
        # Label
        ax.text(x, y - 0.075, name, ha="center", va="top", fontsize=9.5, fontweight="bold", color=NAVY, zorder=5)
        ax.text(x, y - 0.098, role, ha="center", va="top", fontsize=7.5, color=MUTED_TEXT, zorder=5)

    draw_actor(ax, 0.10, 0.72, "Student / Faculty", "Primary User")
    draw_actor(ax, 0.10, 0.35, "Claimant", "Property Owner")
    draw_actor(ax, 0.90, 0.52, "Administrator", "Property Custodian / Security")

    # Use Case Ovals inside boundary
    def draw_usecase(ax, x, y, w, h, text, code, color=PRIMARY_BLUE, bg="#F0F9FF"):
        oval = patches.Ellipse((x, y), w, h, ec=color, fc=bg, lw=1.5, zorder=3)
        ax.add_patch(oval)
        ax.text(x, y + 0.008, text, ha="center", va="center", fontsize=8, fontweight="bold", color=NAVY, zorder=4)
        ax.text(x, y - 0.012, f"({code})", ha="center", va="center", fontsize=7, color=MUTED_TEXT, zorder=4)

    # Column 1: Public & Reporting Use Cases
    ucs = [
        (0.33, 0.82, "UC-01: Register & Verify Account", "UC-01"),
        (0.33, 0.73, "UC-02: Sign In / Authentication", "UC-02"),
        (0.33, 0.64, "UC-03: Report Lost Property", "UC-03"),
        (0.33, 0.55, "UC-04: Report Found Property", "UC-04"),
        (0.33, 0.46, "UC-05: Browse & Filter Catalog", "UC-05"),
        (0.33, 0.37, "UC-06: Interactive Item Details & Zoom", "UC-06"),
        (0.33, 0.28, "UC-07: Print Lost/Found Poster", "UC-07"),
        (0.33, 0.19, "UC-08: AI Multimodal Search Assistant", "UC-08"),
        (0.33, 0.10, "UC-09: Manage Personal Dashboard", "UC-09"),
    ]
    for x, y, name, code in ucs:
        draw_usecase(ax, x, y, 0.18, 0.055, name.split(":")[1].strip(), code, PRIMARY_BLUE, "#EFF6FF")

    # Column 2: Claims & System Processing (Middle)
    mid_ucs = [
        (0.53, 0.75, "UC-10: File Ownership Claim", "UC-10", GREEN_SUCCESS, GREEN_LIGHT),
        (0.53, 0.65, "UC-11: Upload Ownership Proofs", "UC-11", GREEN_SUCCESS, GREEN_LIGHT),
        (0.53, 0.55, "UC-12: Track 4-Step Claim Stepper", "UC-12", GREEN_SUCCESS, GREEN_LIGHT),
        (0.53, 0.45, "UC-13: Withdraw Active Claim", "UC-13", GREEN_SUCCESS, GREEN_LIGHT),
        (0.53, 0.35, "UC-14: Compute Gemini AI Match Score", "UC-14", PURPLE_AI, PURPLE_LIGHT),
        (0.53, 0.25, "UC-15: Send Automated Email Alerts", "UC-15", CYAN_ACCENT, CYAN_LIGHT),
        (0.53, 0.15, "UC-16: Offline Asset Sync (PWA)", "UC-16", CYAN_ACCENT, CYAN_LIGHT),
    ]
    for x, y, name, code, c, bg in mid_ucs:
        draw_usecase(ax, x, y, 0.18, 0.055, name.split(":")[1].strip(), code, c, bg)

    # Column 3: Admin Use Cases (Right)
    admin_ucs = [
        (0.69, 0.80, "UC-17: Dedicated Admin Login", "UC-17"),
        (0.69, 0.71, "UC-18: Review & Moderate Reports", "UC-18"),
        (0.69, 0.62, "UC-19: Adjudicate Ownership Claims", "UC-19"),
        (0.69, 0.53, "UC-20: AI Visual Match Inspection", "UC-20"),
        (0.69, 0.44, "UC-21: Manage Campus Categories", "UC-21"),
        (0.69, 0.35, "UC-22: Manage NDMC Locations (1-42)", "UC-22"),
        (0.69, 0.26, "UC-23: User Account Management", "UC-23"),
        (0.69, 0.17, "UC-24: Export Inventory & Analytics", "UC-24"),
    ]
    for x, y, name, code in admin_ucs:
        draw_usecase(ax, x, y, 0.18, 0.055, name.split(":")[1].strip(), code, AMBER_WARN, AMBER_LIGHT)

    # Connecting Lines (Actors to UCs)
    # Student Lines
    for y_target in [0.82, 0.73, 0.64, 0.55, 0.46, 0.37, 0.28, 0.19, 0.10]:
        ax.plot([0.13, 0.24], [0.72, y_target], color="#94A3B8", lw=1.1, zorder=2)

    # Claimant Lines to Claims
    for y_target in [0.75, 0.65, 0.55, 0.45]:
        ax.plot([0.13, 0.44], [0.35, y_target], color="#94A3B8", lw=1.1, linestyle="--", zorder=2)

    # Admin Lines to Admin UCs
    for y_target in [0.80, 0.71, 0.62, 0.53, 0.44, 0.35, 0.26, 0.17]:
        ax.plot([0.87, 0.78], [0.52, y_target], color="#94A3B8", lw=1.1, zorder=2)

    # Include relationships (Dashed arrows between usecases)
    def add_include_rel(ax, p1, p2, label="<<include>>"):
        arrow = patches.FancyArrowPatch(p1, p2, arrowstyle="->", linestyle=":", color="#64748B", lw=1.2, zorder=3)
        ax.add_patch(arrow)
        mx = (p1[0] + p2[0]) / 2
        my = (p1[1] + p2[1]) / 2
        ax.text(mx, my + 0.012, label, ha="center", va="center", fontsize=6.5, color="#64748B", zorder=4)

    add_include_rel(ax, (0.42, 0.75), (0.45, 0.65))
    add_include_rel(ax, (0.42, 0.64), (0.45, 0.35))
    add_include_rel(ax, (0.60, 0.71), (0.53, 0.28))

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "diagram_fig4_2_usecase.png")
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print("Saved:", out_path)


# =====================================================================
# 3. 3-TIER MVC SYSTEM ARCHITECTURE DIAGRAM (Figure 5.1)
# =====================================================================
def generate_architecture_diagram():
    fig, ax = plt.subplots(figsize=(15, 10), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    fig.patch.set_facecolor("#F8FAFC")
    
    # Title
    ax.text(0.5, 0.97, "FIGURE 5.1: 3-TIER MODEL-VIEW-CONTROLLER (MVC) SYSTEM ARCHITECTURE",
            ha="center", va="center", fontsize=14, fontweight="heavy", color=NAVY)
    ax.text(0.5, 0.942, "Decoupled Presentation, Application Logic, External Services, and Cloud Persistence",
            ha="center", va="center", fontsize=9.5, color=MUTED_TEXT)

    # Tier 1 Container: Client Presentation Tier
    tier1 = FancyBboxPatch((0.04, 0.72), 0.92, 0.19, boxstyle="round,pad=0.01,rounding_size=0.02",
                           ec=PRIMARY_BORDER, fc="#F0F9FF", lw=1.6, zorder=1)
    ax.add_patch(tier1)
    ax.text(0.06, 0.88, "TIER 1: CLIENT PRESENTATION TIER (USER AGENTS & PWA)",
            fontsize=10.5, fontweight="bold", color=PRIMARY_BLUE, zorder=2)

    add_rounded_box(ax, 0.06, 0.74, 0.26, 0.11,
                    "Desktop & Mobile Browsers", "Chrome, Safari, Edge, Firefox\nResponsive Viewport Engine",
                    box_type="white", fontsize_title=9, fontsize_sub=7.5)

    add_rounded_box(ax, 0.35, 0.74, 0.28, 0.11,
                    "Dynamic View Layer (EJS)", "Semantic HTML5, Bootstrap 5.3\nDark Luxury & Light Theme Engine",
                    box_type="white", fontsize_title=9, fontsize_sub=7.5)

    add_rounded_box(ax, 0.66, 0.74, 0.28, 0.11,
                    "Progressive Web App (PWA)", "Service Worker v2 & Manifest\nOffline Shell & Static Asset Cache",
                    box_type="white", fontsize_title=9, fontsize_sub=7.5)

    # Arrow Down to Tier 2
    add_curved_arrow(ax, (0.50, 0.72), (0.50, 0.64), "HTTP/HTTPS Requests (RESTful Routes) & JSON Payloads", lw=2, color=PRIMARY_BLUE)

    # Tier 2 Container: Application Tier (Node.js & Express on Render)
    tier2 = FancyBboxPatch((0.04, 0.28), 0.92, 0.36, boxstyle="round,pad=0.01,rounding_size=0.02",
                           ec="#64748B", fc="#FFFFFF", lw=1.6, zorder=1)
    ax.add_patch(tier2)
    ax.text(0.06, 0.615, "TIER 2: APPLICATION & PROCESSING TIER (Node.js / Express.js Server on Render.com)",
            fontsize=10.5, fontweight="bold", color=NAVY, zorder=2)

    # Sub-modules inside Tier 2
    add_rounded_box(ax, 0.06, 0.47, 0.20, 0.12,
                    "Security Middleware", "Helmet HTTP Headers\nMongo-Sanitize (NoSQL)\nBcrypt & Express-Session",
                    box_type="amber", fontsize_title=8.5, fontsize_sub=7)

    add_rounded_box(ax, 0.28, 0.47, 0.20, 0.12,
                    "Modular Routing", "/auth, /items, /claims\n/admin, /api/chat\nREST Controller Endpoints",
                    box_type="primary", fontsize_title=8.5, fontsize_sub=7)

    add_rounded_box(ax, 0.50, 0.47, 0.22, 0.12,
                    "Controller Handlers", "authController, itemController\nadminController, claimController\nBusiness Logic & Permissions",
                    box_type="primary", fontsize_title=8.5, fontsize_sub=7)

    add_rounded_box(ax, 0.74, 0.47, 0.20, 0.12,
                    "Core Domain Services", "matchingService (Hybrid Algorithm)\ngeminiService (GenAI)\nemailService (Nodemailer)",
                    box_type="purple", fontsize_title=8.5, fontsize_sub=7)

    # External Integrations sub-box
    ext_box = FancyBboxPatch((0.06, 0.31), 0.88, 0.13, boxstyle="round,pad=0.008,rounding_size=0.015",
                             ec=PURPLE_BORDER, fc=PURPLE_LIGHT, lw=1.2, zorder=2)
    ax.add_patch(ext_box)
    ax.text(0.08, 0.41, "EXTERNAL CLOUD GATEWAYS & MICROSERVICES",
            fontsize=8.5, fontweight="bold", color=PURPLE_AI, zorder=3)

    add_rounded_box(ax, 0.08, 0.32, 0.26, 0.075,
                    "Google Gemini AI 2.0 Flash", "Multimodal Vector Scoring",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    add_rounded_box(ax, 0.37, 0.32, 0.26, 0.075,
                    "Cloudinary CDN Storage", "Secure Image Delivery & Resizing",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    add_rounded_box(ax, 0.66, 0.32, 0.26, 0.075,
                    "Transactional SMTP Server", "Gmail / Brevo Email Delivery",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    # Arrow Down to Tier 3
    add_curved_arrow(ax, (0.50, 0.28), (0.50, 0.20), "Mongoose ODM Wire Protocol (TCP Encrypted Connection)", lw=2, color=GREEN_SUCCESS)

    # Tier 3 Container: Data Persistence Tier
    tier3 = FancyBboxPatch((0.04, 0.04), 0.92, 0.16, boxstyle="round,pad=0.01,rounding_size=0.02",
                           ec=GREEN_BORDER, fc=GREEN_LIGHT, lw=1.6, zorder=1)
    ax.add_patch(tier3)
    ax.text(0.06, 0.175, "TIER 3: DATA PERSISTENCE TIER (MONGODB ATLAS CLOUD REPLICA SET)",
            fontsize=10.5, fontweight="bold", color=GREEN_SUCCESS, zorder=2)

    colls = [
        (0.06, 0.06, 0.16, "users Collection", "Credentials, Roles,\nProfile Settings"),
        (0.24, 0.06, 0.16, "items Collection", "Lost/Found Metadata,\nCloudinary URLs"),
        (0.42, 0.06, 0.16, "claimrequests", "Proof Documents,\nStatus Audit Timeline"),
        (0.60, 0.06, 0.16, "categories & locs", "10 Taxonomy Categories,\n42 NDMC Landmarks"),
        (0.78, 0.06, 0.16, "sessions Collection", "connect-mongo Persistent\nAuthentication Tokens")
    ]
    for x, y, w, title, sub in colls:
        add_rounded_box(ax, x, y, w, 0.095, title, sub, box_type="white", fontsize_title=8, fontsize_sub=6.5)

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
        """Draws a database schema card with header, PK section, and fields."""
        # Card outline
        card = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.005,rounding_size=0.015",
                              ec=SLATE_BORDER, fc="#FFFFFF", lw=1.5, zorder=2)
        ax.add_patch(card)
        # Header banner
        header_h = 0.045
        header = FancyBboxPatch((x, y + h - header_h), w, header_h,
                                boxstyle="round,pad=0.005,rounding_size=0.015",
                                ec="none", fc=bg_header, zorder=3)
        ax.add_patch(header)
        ax.text(x + w / 2, y + h - header_h / 2, table_name,
                ha="center", va="center", fontsize=9.5, fontweight="bold", color="#FFFFFF", zorder=4)

        # PK / Fields text
        cy = y + h - header_h - 0.02
        for pk in pk_list:
            ax.text(x + 0.012, cy, pk, fontsize=7.5, fontweight="bold", color="#B91C1C", zorder=4)
            cy -= 0.022

        # Separator line
        ax.plot([x + 0.008, x + w - 0.008], [cy + 0.008, cy + 0.008], color="#CBD5E1", lw=1, zorder=4)
        cy -= 0.012

        for f in fields:
            ax.text(x + 0.012, cy, f, fontsize=7, color="#1E293B", zorder=4)
            cy -= 0.019

    # Entity 1: USER (Top Left)
    draw_erd_entity(ax, 0.04, 0.52, 0.26, 0.37, "USER",
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
                        "createdAt : Date",
                        "updatedAt : Date"
                    ],
                    bg_header=NAVY)

    # Entity 2: ITEM (Top Right)
    draw_erd_entity(ax, 0.44, 0.48, 0.28, 0.42, "ITEM",
                    ["[PK] _id : ObjectId"],
                    [
                        "[FK] reportedBy : ObjectId -> USER._id",
                        "[FK] category : ObjectId -> CATEGORY._id",
                        "itemName : String (Indexed)",
                        "description : String (Text Index)",
                        "location : String (NDMC Landmark)",
                        "imagePath : String (Cloudinary URL)",
                        "type : Enum ['lost', 'found']",
                        "status : Enum ['pending','approved',...]",
                        "dateLostFound : Date",
                        "potentialMatches : Array[MatchSchema]",
                        "dateReported : Date",
                        "contactInfo : String",
                        "createdAt / updatedAt : Date"
                    ],
                    bg_header=PRIMARY_BLUE)

    # Entity 3: CLAIMREQUEST (Bottom Left)
    draw_erd_entity(ax, 0.04, 0.06, 0.32, 0.38, "CLAIMREQUEST",
                    ["[PK] _id : ObjectId"],
                    [
                        "[FK] item : ObjectId -> ITEM._id",
                        "[FK] claimant : ObjectId -> USER._id",
                        "[FK] reviewedBy : ObjectId -> USER._id",
                        "description : String (Ownership details)",
                        "proofOfOwnership : String",
                        "proofImages : Array[String]",
                        "status : Enum ['pending','approved',...]",
                        "priority : Enum ['low','medium','high']",
                        "timeline : Array[StatusChangeSchema]",
                        "submittedAt : Date",
                        "resolvedAt : Date"
                    ],
                    bg_header=GREEN_SUCCESS)

    # Entity 4: CATEGORY (Top Far Right)
    draw_erd_entity(ax, 0.78, 0.65, 0.19, 0.24, "CATEGORY",
                    ["[PK] _id : ObjectId"],
                    [
                        "name : String (Unique)",
                        "description : String",
                        "icon : String (Font Awesome)",
                        "itemCount : Number (Virtual)",
                        "createdAt : Date"
                    ],
                    bg_header=PURPLE_AI)

    # Entity 5: LOCATION (Bottom Far Right)
    draw_erd_entity(ax, 0.78, 0.32, 0.19, 0.27, "LOCATION",
                    ["[PK] _id : ObjectId"],
                    [
                        "[FK] suggestedBy : ObjectId",
                        "name : String (Unique)",
                        "description : String",
                        "status : Enum ['approved','pending']",
                        "buildingNumber : String (1-42)",
                        "createdAt : Date"
                    ],
                    bg_header=AMBER_WARN)

    # Connectors with Cardinality
    # USER -> ITEM (1 : N)
    add_curved_arrow(ax, (0.30, 0.75), (0.44, 0.75), "1 : N (reports)", rad=0.0, color="#2563EB", lw=1.8)

    # USER -> CLAIMREQUEST (1 : N)
    add_curved_arrow(ax, (0.16, 0.52), (0.16, 0.44), "1 : N (submits claim)", rad=0.0, color="#059669", lw=1.8)

    # ITEM -> CLAIMREQUEST (1 : N)
    add_curved_arrow(ax, (0.44, 0.54), (0.36, 0.35), "1 : N (claimed by)", rad=0.1, color="#059669", lw=1.8)

    # CATEGORY -> ITEM (1 : N)
    add_curved_arrow(ax, (0.78, 0.77), (0.72, 0.77), "1 : N (categorizes)", rad=0.0, color="#7C3AED", lw=1.8)

    # USER -> LOCATION (1 : N)
    add_curved_arrow(ax, (0.30, 0.60), (0.78, 0.45), "1 : N (suggests location)", rad=-0.25, color="#D97706", lw=1.4, ls="--")

    # Legend at bottom right
    legend_box = FancyBboxPatch((0.44, 0.06), 0.53, 0.18, boxstyle="round,pad=0.008,rounding_size=0.015",
                                ec="#CBD5E1", fc="#F1F5F9", lw=1, zorder=2)
    ax.add_patch(legend_box)
    ax.text(0.46, 0.21, "RELATIONAL CARDINALITY & INTEGRITY RULES", fontsize=8.5, fontweight="bold", color=NAVY, zorder=3)
    ax.text(0.46, 0.175, "• 1 : N (User to Item): A student/faculty can submit multiple lost and found reports.", fontsize=7.5, color=MUTED_TEXT, zorder=3)
    ax.text(0.46, 0.145, "• 1 : N (Category to Item): Each catalog item is strictly tagged with exactly one category.", fontsize=7.5, color=MUTED_TEXT, zorder=3)
    ax.text(0.46, 0.115, "• 1 : N (Item to ClaimRequest): An item can accumulate multiple competing claimant submissions.", fontsize=7.5, color=MUTED_TEXT, zorder=3)
    ax.text(0.46, 0.085, "• Referential Integrity: Orphaned claims and item references are prevented via Mongoose validation.", fontsize=7.5, color=MUTED_TEXT, zorder=3)

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "diagram_fig5_2_erd.png")
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()
    print("Saved:", out_path)


# =====================================================================
# 5. SYSTEM NAVIGATION FLOW / SITEMAP (Figure 6.1)
# =====================================================================
def generate_navigation_diagram():
    fig, ax = plt.subplots(figsize=(15, 10), dpi=300)
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
    add_rounded_box(ax, 0.38, 0.81, 0.24, 0.09,
                    "HOME PAGE (/)", "Landing Page, Search Hero,\nKPI Counters, How-It-Works",
                    box_type="primary", fontsize_title=10, fontsize_sub=7.5)

    # 3 Main Pillars
    # Left Pillar: Public Discovery
    add_rounded_box(ax, 0.04, 0.64, 0.26, 0.09,
                    "1. PUBLIC CATALOGS", "Browse, Filter, Inspect",
                    box_type="cyan", fontsize_title=9.5, fontsize_sub=7.5)

    add_rounded_box(ax, 0.04, 0.50, 0.26, 0.075,
                    "Lost Items Directory (/items/lost)", "Category Pills, 4-Col Grid, Keyword Search",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    add_rounded_box(ax, 0.04, 0.39, 0.26, 0.075,
                    "Found Items Directory (/items/found)", "Location Filters, Campus Landmarks",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    add_rounded_box(ax, 0.04, 0.28, 0.26, 0.075,
                    "Item Detail Page (/items/:id)", "Lightbox Zoom, Reporter Details, Poster Print",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    add_rounded_box(ax, 0.04, 0.17, 0.26, 0.075,
                    "Claimed Showcase (/items/claimed)", "Successfully Reunited Property Gallery",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    # Middle Pillar: Student / Faculty Workflow
    add_rounded_box(ax, 0.37, 0.64, 0.26, 0.09,
                    "2. AUTHENTICATED PORTAL", "Reporting & Claim Stepper",
                    box_type="success", fontsize_title=9.5, fontsize_sub=7.5)

    add_rounded_box(ax, 0.37, 0.50, 0.26, 0.075,
                    "Report Lost/Found Form (/report/*)", "Drag-Drop Upload, Landmark Dropdown",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    add_rounded_box(ax, 0.37, 0.39, 0.26, 0.075,
                    "Submit Claim Form (/claims/form/:id)", "Proof of Ownership, Secret Marks",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    add_rounded_box(ax, 0.37, 0.28, 0.26, 0.075,
                    "My Claims Stepper (/claims/my-claims)", "4-Step Visual Claim Resolution Tracker",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    add_rounded_box(ax, 0.37, 0.17, 0.26, 0.075,
                    "User Dashboard (/user/dashboard)", "Personal Stats, My Reports, Profile Settings",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    # Right Pillar: Administrator Console
    add_rounded_box(ax, 0.70, 0.64, 0.26, 0.09,
                    "3. ADMIN CONSOLE (/admin/*)", "Moderation, AI Scoring, Auditing",
                    box_type="amber", fontsize_title=9.5, fontsize_sub=7.5)

    add_rounded_box(ax, 0.70, 0.50, 0.26, 0.075,
                    "Admin Dashboard (/admin/dashboard)", "Overview Metrics, Quick Moderation Queue",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    add_rounded_box(ax, 0.70, 0.39, 0.26, 0.075,
                    "Pending Queue & Items (/admin/items)", "Approve, Reject, Edit, Delete, CSV Export",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    add_rounded_box(ax, 0.70, 0.28, 0.26, 0.075,
                    "Claims Adjudication (/admin/claims)", "Proof Review, Decision Modal, Handover",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    add_rounded_box(ax, 0.70, 0.17, 0.26, 0.075,
                    "AI Match Console & Settings", "Gemini Visual Similarity, Categories & Locations",
                    box_type="white", fontsize_title=8, fontsize_sub=6.5)

    # Cross-Cutting Floating Feature: AI Drawer
    ai_drawer = FancyBboxPatch((0.25, 0.04), 0.50, 0.08, boxstyle="round,pad=0.008,rounding_size=0.015",
                               ec=PURPLE_BORDER, fc=PURPLE_LIGHT, lw=1.5, zorder=2)
    ax.add_patch(ai_drawer)
    ax.text(0.50, 0.095, "PERSISTENT FLOATING AI ASSISTANT DRAWER (/api/chat)",
            ha="center", va="center", fontsize=8.5, fontweight="bold", color=PURPLE_AI, zorder=3)
    ax.text(0.50, 0.065, "Available across all client pages: Natural-language query parsing & photo matching",
            ha="center", va="center", fontsize=7.5, color=MUTED_TEXT, zorder=3)

    # Flow Arrows
    add_curved_arrow(ax, (0.42, 0.81), (0.17, 0.73), rad=-0.08, color=CYAN_ACCENT)
    add_curved_arrow(ax, (0.50, 0.81), (0.50, 0.73), rad=0.0, color=GREEN_SUCCESS)
    add_curved_arrow(ax, (0.58, 0.81), (0.83, 0.73), rad=0.08, color=AMBER_WARN)

    # Vertical Column Connections
    for y_start, y_end in [(0.64, 0.58), (0.50, 0.47), (0.39, 0.36), (0.28, 0.25)]:
        add_curved_arrow(ax, (0.17, y_start), (0.17, y_end), rad=0.0, color="#94A3B8")
        add_curved_arrow(ax, (0.50, y_start), (0.50, y_end), rad=0.0, color="#94A3B8")
        add_curved_arrow(ax, (0.83, y_start), (0.83, y_end), rad=0.0, color="#94A3B8")

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
