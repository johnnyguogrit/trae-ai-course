# -*- coding: utf-8 -*-
"""Parse the .pptd project in this directory and build an equivalent .pptx
with python-pptx. Supports the subset of pptd used by this deck:
text / shape / table / icon elements, solid fills, theme $refs, rich text
(<p>, <span style>, <strong>, <em>).
"""
import os
import re
from html.parser import HTMLParser

import yaml
from pptx import Presentation
from pptx.util import Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

BASE = os.path.dirname(os.path.abspath(__file__))
MAIN = os.path.join(BASE, "Trae_AI编程课_课程介绍.pptd")
OUT = os.path.join(BASE, "Trae_AI编程课_课程介绍.pptx")

ICON_MAP = {
    "fas:shoe-prints": "步",
    "fas:keyboard": "练",
    "fas:robot": "AI",
    "fas:laptop": "机",
    "fas:calendar-check": "✓",
    "fas:star-half-stroke": "★",
    "fas:circle-question": "?",
    "fas:graduation-cap": "学",
}

ALIGN_H = {"left": PP_ALIGN.LEFT, "center": PP_ALIGN.CENTER, "right": PP_ALIGN.RIGHT,
           "justify": PP_ALIGN.JUSTIFY, "distributed": PP_ALIGN.DISTRIBUTE}
ANCHOR = {"top": MSO_ANCHOR.TOP, "middle": MSO_ANCHOR.MIDDLE, "bottom": MSO_ANCHOR.BOTTOM}
SHAPES = {"rect": MSO_SHAPE.RECTANGLE, "roundRect": MSO_SHAPE.ROUNDED_RECTANGLE,
          "ellipse": MSO_SHAPE.OVAL, "rightArrow": MSO_SHAPE.RIGHT_ARROW}


def load_theme():
    with open(MAIN, encoding="utf-8") as f:
        doc = yaml.safe_load(f)
    return doc, doc.get("theme", {})


def resolve_color(val, colors):
    if val is None:
        return None
    if isinstance(val, str) and val.startswith("$"):
        val = colors[val[1:]]
    val = val[:7]  # drop alpha if HEX8
    return RGBColor.from_string(val.lstrip("#"))


def fill_of(spec, colors):
    """Return RGBColor for a fill spec (solid only), or None."""
    if spec is None:
        return None
    if isinstance(spec, str):
        return resolve_color(spec, colors)
    if isinstance(spec, dict):
        if spec.get("type") == "solid":
            return resolve_color(spec.get("color"), colors)
        if spec.get("type") == "gradient":
            return resolve_color(spec["stops"][0]["color"], colors)
    return None


class RichText(HTMLParser):
    """Parse pptd rich text into paragraphs -> runs."""
    def __init__(self, colors):
        super().__init__(convert_charrefs=True)
        self.colors = colors
        self.paragraphs = []   # list of dict(runs=[...], align=, line=, margin_top=)
        self.cur = None
        self.stack = []        # inline style stack
        self.li_pending = None

    def _ensure(self):
        if self.cur is None:
            self.cur = {"runs": [], "align": None, "line": None, "margin_top": None}

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "p":
            self._ensure()
            st = a.get("style", "")
            m = re.search(r"text-align:\s*(\w+)", st)
            if m:
                self.cur["align"] = m.group(1)
            m = re.search(r"line-height:\s*([\d.]+)", st)
            if m:
                self.cur["line"] = float(m.group(1))
            m = re.search(r"margin-top:\s*([\d.]+)px", st)
            if m:
                self.cur["margin_top"] = float(m.group(1))
        elif tag == "span":
            st = a.get("style", "")
            run_style = {}
            m = re.search(r"color:\s*([^;]+)", st)
            if m:
                run_style["color"] = m.group(1).strip()
            m = re.search(r"font-size:\s*([\d.]+)px", st)
            if m:
                run_style["size"] = float(m.group(1))
            m = re.search(r"font-family:\s*([^;]+)", st)
            if m:
                run_style["font"] = m.group(1).strip().strip('"').split(",")[0].strip()
            self.stack.append(run_style)
        elif tag in ("strong", "b"):
            self.stack.append({"bold": True})
        elif tag in ("em", "i"):
            self.stack.append({"italic": True})

    def handle_endtag(self, tag):
        if tag == "p":
            if self.cur is not None:
                self.paragraphs.append(self.cur)
                self.cur = None
        elif tag in ("span", "strong", "b", "em", "i"):
            if self.stack:
                self.stack.pop()

    def handle_data(self, data):
        self._ensure()
        merged = {}
        for s in self.stack:
            merged.update(s)
        self.cur["runs"].append((data, merged))

    def close(self):
        super().close()
        if self.cur is not None and self.cur["runs"]:
            self.paragraphs.append(self.cur)
            self.cur = None


def merged_text_style(content, theme):
    """Effective base style for a text element."""
    ts = {}
    ref = content.get("style")
    if ref and isinstance(ref, str) and ref.startswith("$"):
        ts.update(theme.get("textStyles", {}).get(ref[1:], {}))
    for k in ("color", "fontSize", "fontFamily", "bold", "italic", "lineHeight"):
        if k in content:
            ts[k] = content[k]
    return ts


def add_text_element(slide, el, theme):
    colors = theme.get("colors", {})
    content = el["content"]
    x, y, w, h = [Pt(v) for v in el["bounds"]]
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = content.get("wrap", True)
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    align = content.get("align", ["left", "top"])
    tf.vertical_anchor = ANCHOR.get(align[1], MSO_ANCHOR.TOP)

    base = merged_text_style(content, theme)
    base_size = base.get("fontSize", 18)
    base_color = resolve_color(base.get("color", "#000000"), colors)
    base_font = base.get("fontFamily", "微软雅黑")
    if isinstance(base_font, dict):
        base_font = base_font.get("ea") or base_font.get("latin")
    base_bold = base.get("bold", False)
    base_line = base.get("lineHeight", 1)

    parser = RichText(colors)
    parser.feed(content.get("text", ""))
    parser.close()
    paras = parser.paragraphs or [{"runs": [("", {})], "align": None, "line": None, "margin_top": None}]

    for i, p in enumerate(paras):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = ALIGN_H.get(p.get("align") or align[0], PP_ALIGN.LEFT)
        lh = p.get("line") or base_line
        if lh:
            para.line_spacing = lh
        if p.get("margin_top"):
            para.space_before = Pt(p["margin_top"])
        for text, st in p["runs"]:
            run = para.add_run()
            run.text = text
            f = run.font
            f.size = Pt(st.get("size", base_size))
            f.name = st.get("font", base_font)
            f.bold = st.get("bold", base_bold)
            f.italic = st.get("italic", base.get("italic", False))
            # East Asian font
            rPr = run._r.get_or_add_rPr()
            ea = rPr.find(qn("a:ea"))
            if ea is None:
                ea = rPr.makeelement(qn("a:ea"), {})
                rPr.append(ea)
            ea.set("typeface", f.name)
            c = st.get("color")
            f.color.rgb = resolve_color(c, colors) if c else base_color
    return tb


def add_shape_element(slide, el, theme):
    colors = theme.get("colors", {})
    x, y, w, h = [Pt(v) for v in el["bounds"]]
    shp_type = SHAPES.get(el.get("shapeName", "rect"), MSO_SHAPE.RECTANGLE)
    sp = slide.shapes.add_shape(shp_type, x, y, w, h)
    if el.get("shapeName") == "roundRect" and el.get("adjustments"):
        try:
            sp.adjustments[0] = el["adjustments"][0] / 100000.0
        except Exception:
            pass
    fill_color = fill_of(el.get("fill"), colors)
    if fill_color is not None:
        sp.fill.solid()
        sp.fill.fore_color.rgb = fill_color
    else:
        sp.fill.background()
    border = el.get("border")
    if border:
        sp.line.color.rgb = resolve_color(border.get("color", "#000000"), colors)
        sp.line.width = Pt(border.get("width", 1))
    else:
        sp.line.fill.background()
    sp.shadow.inherit = False
    sp.text_frame.paragraphs[0].text = ""
    return sp


def add_icon_element(slide, el, theme):
    """Icons are rendered as short glyph labels in the icon color."""
    colors = theme.get("colors", {})
    x, y, w, h = [Pt(v) for v in el["bounds"]]
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = False
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    para = tf.paragraphs[0]
    para.alignment = PP_ALIGN.CENTER
    run = para.add_run()
    run.text = ICON_MAP.get(el.get("iconName", ""), "●")
    f = run.font
    f.size = Pt(min(w, h).pt * 0.62 if hasattr(min(w, h), "pt") else min(el["bounds"][2], el["bounds"][3]) * 0.62)
    f.size = Pt(min(el["bounds"][2], el["bounds"][3]) * 0.6)
    f.bold = True
    f.name = "微软雅黑"
    color = fill_of(el.get("fill"), colors) or RGBColor.from_string("FFFFFF")
    f.color.rgb = color
    return tb


def cell_style_chain(theme, style_name, r, n_rows):
    """Compute effective cell style dict from table style config."""
    ts = theme.get("tableStyles", {}).get(style_name, {}) if style_name else {}
    cell = dict(ts.get("cellStyle", {}) or {})
    if r == 0:
        cell.update(ts.get("firstRowStyle", {}) or {})
    else:
        body = ts.get("bodyStyles") or []
        if body:
            cell.update(body[(r - 1) % len(body)])
    return cell


def add_table_element(slide, el, theme):
    colors = theme.get("colors", {})
    x, y, w, h = el["bounds"]
    rows = el["rows"]
    n_rows = len(rows)
    n_cols = len(el["columnWidths"])
    gfx = slide.shapes.add_table(n_rows, n_cols, Pt(x), Pt(y), Pt(w), Pt(h))
    tbl = gfx.table
    # disable default banding style
    tbl.first_row = False
    tbl.horz_banding = False
    for i, ratio in enumerate(el["columnWidths"]):
        tbl.columns[i].width = Emu(int(Pt(w) * ratio))
    for i, ratio in enumerate(el["rowHeights"]):
        tbl.rows[i].height = Emu(int(Pt(h) * ratio))

    style_ref = el.get("style")
    style_name = style_ref[1:] if isinstance(style_ref, str) and style_ref.startswith("$") else None

    for r, row in enumerate(rows):
        cst = cell_style_chain(theme, style_name, r, n_rows)
        for c, cdata in enumerate(row):
            cell = tbl.cell(r, c)
            cst_cell = dict(cst)
            cst_cell.update({k: v for k, v in cdata.items()
                             if k in ("color", "fontSize", "bold", "fill", "align")})
            # fill
            fcol = fill_of(cst_cell.get("fill"), colors)
            if fcol is not None:
                cell.fill.solid()
                cell.fill.fore_color.rgb = fcol
            else:
                cell.fill.solid()
                cell.fill.fore_color.rgb = RGBColor.from_string("121924")
            # margins + anchor
            cell.margin_left = cell.margin_right = Pt(4)
            cell.margin_top = cell.margin_bottom = Pt(2)
            align = cst_cell.get("align", ["center", "middle"])
            cell.vertical_anchor = ANCHOR.get(align[1], MSO_ANCHOR.MIDDLE)
            tf = cell.text_frame
            tf.word_wrap = True
            parser = RichText(colors)
            parser.feed(cdata.get("text", ""))
            parser.close()
            paras = parser.paragraphs or [{"runs": [("", {})], "align": None, "line": None, "margin_top": None}]
            for i, p in enumerate(paras):
                para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
                para.alignment = ALIGN_H.get(align[0], PP_ALIGN.CENTER)
                for text, st in p["runs"]:
                    run = para.add_run()
                    run.text = text
                    f = run.font
                    f.size = Pt(st.get("size", cst_cell.get("fontSize", 13)))
                    f.name = cst_cell.get("fontFamily", "微软雅黑")
                    if isinstance(f.name, dict):
                        f.name = f.name.get("ea", "微软雅黑")
                    f.bold = st.get("bold", cst_cell.get("bold", False))
                    cc = st.get("color") or cst_cell.get("color", "#E9EDF2")
                    f.color.rgb = resolve_color(cc, colors)
            # thin borders
            border_color = resolve_color(
                (cst.get("border") or {}).get("color", "$line"), colors)
            _set_cell_border(cell, border_color)
    return gfx


def _set_cell_border(cell, rgb):
    from pptx.oxml.ns import nsmap
    tcPr = cell._tc.get_or_add_tcPr()
    for tag in ("a:lnL", "a:lnR", "a:lnT", "a:lnB"):
        for old in tcPr.findall(qn(tag)):
            tcPr.remove(old)
        ln = tcPr.makeelement(qn(tag), {"w": "9525", "cap": "flat"})
        fill = ln.makeelement(qn("a:solidFill"), {})
        clr = fill.makeelement(qn("a:srgbClr"), {"val": str(rgb)})
        fill.append(clr)
        ln.append(fill)
        tcPr.append(ln)


def main():
    doc, theme = load_theme()
    prs = Presentation()
    prs.slide_width = Pt(960)
    prs.slide_height = Pt(540)
    blank = prs.slide_layouts[6]
    colors = theme.get("colors", {})

    for page_path in doc["pages"]:
        with open(os.path.join(BASE, page_path), encoding="utf-8") as f:
            page = yaml.safe_load(f)
        slide = prs.slides.add_slide(blank)
        bg = fill_of(page.get("background"), colors) or RGBColor.from_string("0F141C")
        slide.background.fill.solid()
        slide.background.fill.fore_color.rgb = bg
        for el in page.get("elements", []):
            t = el["elementType"]
            if t == "text":
                add_text_element(slide, el, theme)
            elif t == "shape":
                add_shape_element(slide, el, theme)
            elif t == "table":
                add_table_element(slide, el, theme)
            elif t == "icon":
                add_icon_element(slide, el, theme)
    prs.save(OUT)
    print("saved:", OUT, "slides:", len(prs.slides.__iter__.__self__._sldIdLst))


if __name__ == "__main__":
    main()
