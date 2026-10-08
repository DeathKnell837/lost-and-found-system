# -*- coding: utf-8 -*-
"""
Script: scripts/build_documentation.py
Purpose: Generates the official, comprehensive Software Engineering 2 Project Documentation
         for the Campus Lost & Found Management System adhering strictly to the required
         format in documentation_format_final.docx.
Target Outputs:
  1. C:\\Users\\USER\\Downloads\\documentation_format_final.docx (Official final deliverable)
  2. c:\\Users\\USER\\Desktop\\Losr&Found\\FINAL_SYSTEM_DOCUMENTATION.docx (Workspace copy)
  3. c:\\Users\\USER\\Desktop\\Losr&Found\\FINAL_SYSTEM_DOCUMENTATION.md (Markdown companion)
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag.endswith('shd'):
            tcPr.remove(child)
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag.endswith('tcMar'):
            tcPr.remove(child)
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def style_paragraph(p, space_before=0, space_after=6, line_spacing=1.15):
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing

def add_title_block(doc):
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = p_inst.add_run("NOTRE DAME OF MIDSAYAP COLLEGE\n")
    r1.bold = True
    r1.font.name = "Arial"
    r1.font.size = Pt(15)
    r1.font.color.rgb = RGBColor(15, 23, 42)
    
    r2 = p_inst.add_run("COLLEGE OF INFORMATION TECHNOLOGY AND ENGINEERING\n")
    r2.bold = True
    r2.font.name = "Arial"
    r2.font.size = Pt(12)
    r2.font.color.rgb = RGBColor(71, 85, 105)
    
    r_sub = p_inst.add_run("Midsayap, Cotabato, Philippines\n\n\n\n")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(10)
    r_sub.font.color.rgb = RGBColor(100, 116, 139)
    style_paragraph(p_inst, 0, 0, 1.2)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_t = p_title.add_run("CAMPUS LOST & FOUND MANAGEMENT SYSTEM\n")
    r_t.bold = True
    r_t.font.name = "Arial"
    r_t.font.size = Pt(20)
    r_t.font.color.rgb = RGBColor(30, 41, 59)
    
    r_subt = p_title.add_run("An AI-Powered Web-Based Lost and Found Item Management and Recovery Platform\n\n")
    r_subt.italic = True
    r_subt.font.name = "Arial"
    r_subt.font.size = Pt(11.5)
    r_subt.font.color.rgb = RGBColor(71, 85, 105)
    
    r_doc = p_title.add_run("A Software Engineering 2 Project Documentation\n\n\n\n")
    r_doc.font.name = "Arial"
    r_doc.font.size = Pt(12)
    r_doc.font.color.rgb = RGBColor(30, 41, 59)
    style_paragraph(p_title, 0, 0, 1.2)

    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    r_prep = p_meta.add_run("Prepared by:\n")
    r_prep.bold = True
    r_prep.font.name = "Arial"
    r_prep.font.size = Pt(11)
    r_prep.font.color.rgb = RGBColor(15, 23, 42)
    
    r_stu = p_meta.add_run("[STUDENT NAME 1] (DeathKnell837)\n\n\n")
    r_stu.bold = True
    r_stu.font.name = "Arial"
    r_stu.font.size = Pt(12)
    r_stu.font.color.rgb = RGBColor(37, 99, 235)
    
    r_subm = p_meta.add_run("Submitted to:\n")
    r_subm.bold = True
    r_subm.font.name = "Arial"
    r_subm.font.size = Pt(11)
    
    r_inst = p_meta.add_run("[INSTRUCTOR NAME]\nFaculty, College of Information Technology and Engineering\n\n\n")
    r_inst.font.name = "Arial"
    r_inst.font.size = Pt(11)
    
    r_ay_h = p_meta.add_run("Academic Year:\n")
    r_ay_h.bold = True
    r_ay_h.font.name = "Arial"
    r_ay_h.font.size = Pt(11)
    
    r_ay = p_meta.add_run("[ACADEMIC YEAR] (2025–2026)\n")
    r_ay.font.name = "Arial"
    r_ay.font.size = Pt(11)
    
    r_date = p_meta.add_run("[MONTH, YEAR] (October 2026)\n")
    r_date.font.name = "Arial"
    r_date.font.size = Pt(11)
    style_paragraph(p_meta, 0, 0, 1.2)
    
    doc.add_page_break()

def add_chapter_header(doc, chapter_title):
    p = doc.add_paragraph()
    p.paragraph_format.page_break_before = True
    style_paragraph(p, space_before=12, space_after=12)
    run = p.add_run(chapter_title)
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(16)
    run.font.color.rgb = RGBColor(15, 23, 42)
    return p

def add_section_header(doc, section_title):
    p = doc.add_paragraph()
    style_paragraph(p, space_before=12, space_after=6)
    run = p.add_run(section_title)
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(13)
    run.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_subsection_header(doc, subsection_title):
    p = doc.add_paragraph()
    style_paragraph(p, space_before=8, space_after=4)
    run = p.add_run(subsection_title)
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_body_p(doc, text, bold_prefix=None, italic=False):
    p = doc.add_paragraph()
    style_paragraph(p, space_before=0, space_after=6, line_spacing=1.15)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(11)
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(30, 41, 59)
    run.italic = italic
    return p

def add_bullet_p(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    style_paragraph(p, space_before=0, space_after=4, line_spacing=1.15)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(11)
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_styled_table(doc, headers, data, col_widths=None):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)

    # Style header row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], "1E293B")
        set_cell_margins(hdr_cells[i], top=160, bottom=160, left=180, right=180)
        p = hdr_cells[i].paragraphs[0]
        style_paragraph(p, space_before=0, space_after=0)
        for r in p.runs:
            r.bold = True
            r.font.name = "Arial"
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(255, 255, 255)

    # Data rows
    for r_idx, row_values in enumerate(data):
        row_cells = table.rows[r_idx + 1].cells
        bg_color = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_values):
            row_cells[c_idx].text = str(val)
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=120, bottom=120, left=160, right=160)
            p = row_cells[c_idx].paragraphs[0]
            style_paragraph(p, space_before=0, space_after=0)
            for r in p.runs:
                r.font.name = "Arial"
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(30, 41, 59)

    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Inches(w)

    doc.add_paragraph() # Spacing
    return table

def add_callout(doc, text, title=None):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, "F1F5F9")
    set_cell_margins(cell, top=160, bottom=160, left=200, right=200)
    
    # Left border highlight
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="2563EB"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)

    p = cell.paragraphs[0]
    style_paragraph(p, space_before=0, space_after=0)
    if title:
        r_t = p.add_run(title + "\n")
        r_t.bold = True
        r_t.font.name = "Arial"
        r_t.font.size = Pt(10.5)
        r_t.font.color.rgb = RGBColor(37, 99, 235)
    r = p.add_run(text)
    r.italic = True
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor(51, 65, 85)
    doc.add_paragraph()

def add_image_figure(doc, img_path, caption_text, width_inches=5.8):
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        style_paragraph(p_img, space_before=6, space_after=4)
        run = p_img.add_run()
        run.add_picture(img_path, width=Inches(width_inches))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        style_paragraph(p_cap, space_before=0, space_after=12)
        r_cap = p_cap.add_run(caption_text)
        r_cap.font.name = "Arial"
        r_cap.font.size = Pt(9.5)
        r_cap.italic = True
        r_cap.font.color.rgb = RGBColor(100, 116, 139)
    else:
        add_callout(doc, f"[Image Placeholder: {caption_text}]", "FIGURE PLACEHOLDER")

print("Generator functions prepared.")
