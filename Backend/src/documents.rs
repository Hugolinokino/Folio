//! Shared document-export building blocks — Markdown/LaTeX/Word/PDF assembly
//! from a plain `title + Vec<DocSection>` shape. Used by both `praxis.rs`
//! (a single Entwurf) and `academia_export.rs` (a project's Kapitel), so the
//! four export formats are implemented exactly once.

use docx_rs::*;
use printpdf::{BuiltinFont, Mm, PdfDocument};
use serde::Deserialize;
use std::io::BufWriter;

pub struct DocSection {
    pub heading: String,
    pub body: String,
}

/// One labelled group of already-formatted citation strings (a Verzeichnis
/// section) — deserialized straight from the frontend's `buildBibliography`.
#[derive(Deserialize)]
pub struct BibliographySection {
    pub label: String,
    pub entries: Vec<String>,
}

/// Splits on blank lines into trimmed, non-empty paragraphs.
fn paragraphs(body: &str) -> Vec<String> {
    body.split("\n\n").map(str::trim).filter(|p| !p.is_empty()).map(str::to_string).collect()
}

/// Replaces `[[Title]]` / `[[Title|Alias]]` with plain inline text (alias wins
/// if present) — a finished export shouldn't carry raw Obsidian syntax. Harmless
/// no-op on Praxis draft content, which never contains this syntax. UTF-8-safe
/// bracket scan mirroring `academia::extract_wikilink_titles`.
pub fn strip_wikilinks(content: &str) -> String {
    let bytes = content.as_bytes();
    let mut out = String::with_capacity(content.len());
    let mut i = 0;
    let mut last_copied = 0;
    while i + 1 < bytes.len() {
        if bytes[i] == b'[' && bytes[i + 1] == b'[' {
            if let Some(end) = content[i + 2..].find("]]") {
                let inner = &content[i + 2..i + 2 + end];
                let mut parts = inner.splitn(2, '|');
                let title = parts.next().unwrap_or("").trim();
                let label = parts.next().map(|a| a.trim()).filter(|a| !a.is_empty()).unwrap_or(title);
                out.push_str(&content[last_copied..i]);
                out.push_str(label);
                i += 2 + end + 2;
                last_copied = i;
                continue;
            }
        }
        i += 1;
    }
    out.push_str(&content[last_copied..]);
    out
}

pub fn build_markdown(title: &str, sections: &[DocSection]) -> String {
    let mut out = format!("# {title}\n\n");
    for s in sections {
        out.push_str(&format!("## {}\n\n{}\n\n", s.heading, s.body));
    }
    out
}

/// Single-pass char escaping — chaining `.replace()` calls would re-escape the
/// braces just inserted by the backslash/tilde/caret substitutions.
fn latex_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\\' => out.push_str("\\textbackslash{}"),
            '&' => out.push_str("\\&"),
            '%' => out.push_str("\\%"),
            '$' => out.push_str("\\$"),
            '#' => out.push_str("\\#"),
            '_' => out.push_str("\\_"),
            '{' => out.push_str("\\{"),
            '}' => out.push_str("\\}"),
            '~' => out.push_str("\\textasciitilde{}"),
            '^' => out.push_str("\\textasciicircum{}"),
            _ => out.push(c),
        }
    }
    out
}

pub fn build_latex(title: &str, sections: &[DocSection], bibliography: &[BibliographySection]) -> String {
    let mut out = String::new();
    out.push_str("\\documentclass[12pt,a4paper]{article}\n");
    out.push_str("\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage[ngerman]{babel}\n");
    out.push_str(&format!("\\title{{{}}}\n\\date{{}}\n\\begin{{document}}\n\\maketitle\n\n", latex_escape(title)));
    for s in sections {
        out.push_str(&format!("\\section{{{}}}\n\n", latex_escape(&s.heading)));
        for p in paragraphs(&strip_wikilinks(&s.body)) {
            out.push_str(&format!("{}\n\n", latex_escape(&p)));
        }
    }
    if !bibliography.is_empty() {
        out.push_str("\\section*{Quellenverzeichnis}\n\n");
        for section in bibliography {
            out.push_str(&format!("\\subsection*{{{}}}\n\\begin{{itemize}}\n", latex_escape(&section.label)));
            for entry in &section.entries {
                out.push_str(&format!("\\item {}\n", latex_escape(entry)));
            }
            out.push_str("\\end{itemize}\n\n");
        }
    }
    out.push_str("\\end{document}\n");
    out
}

pub fn build_docx(title: &str, sections: &[DocSection], bibliography: &[BibliographySection]) -> Docx {
    let mut docx = Docx::new().add_paragraph(Paragraph::new().add_run(Run::new().add_text(title).bold().size(36)));

    for s in sections {
        docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text(&s.heading).bold().size(28)));
        for p in paragraphs(&s.body) {
            docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text(strip_wikilinks(&p))));
        }
    }

    if !bibliography.is_empty() {
        docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text("Quellenverzeichnis").bold().size(28)));
        for section in bibliography {
            docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text(&section.label).bold().size(22)));
            for entry in &section.entries {
                docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text(entry)));
            }
        }
    }
    docx
}

pub fn write_docx(title: &str, sections: &[DocSection], bibliography: &[BibliographySection], path: &std::path::Path) -> Result<(), String> {
    let file = std::fs::File::create(path).map_err(|e| e.to_string())?;
    build_docx(title, sections, bibliography).build().pack(file).map_err(|e| format!("{e:?}"))
}

// ============================================================
// PDF — plain printpdf primitives (built-in Helvetica, no font
// embedding) with a hand-rolled greedy word-wrap. printpdf's standard-14
// fonts have no exposed glyph-width API in this version, so line breaks
// are estimated from an average Helvetica character width rather than
// measured exactly — good enough for a readable, real document, not
// pixel-perfect typesetting.
// ============================================================

const PAGE_W_MM: f32 = 210.0;
const PAGE_H_MM: f32 = 297.0;
const MARGIN_MM: f32 = 20.0;
const TITLE_SIZE: f32 = 20.0;
const HEADING_SIZE: f32 = 14.0;
const BODY_SIZE: f32 = 11.0;
const LINE_HEIGHT_MM: f32 = 5.6;

/// Average glyph width for Helvetica at 1pt, in mm — empirical, not exact.
fn max_chars_per_line(font_size_pt: f32) -> usize {
    let usable_mm = PAGE_W_MM - 2.0 * MARGIN_MM;
    let avg_char_width_mm = font_size_pt * 0.19;
    ((usable_mm / avg_char_width_mm).floor() as usize).max(10)
}

fn wrap_text(text: &str, max_chars: usize) -> Vec<String> {
    let mut lines = Vec::new();
    let mut current = String::new();
    for word in text.split_whitespace() {
        if current.is_empty() {
            current.push_str(word);
        } else if current.len() + 1 + word.len() <= max_chars {
            current.push(' ');
            current.push_str(word);
        } else {
            lines.push(std::mem::take(&mut current));
            current.push_str(word);
        }
    }
    if !current.is_empty() {
        lines.push(current);
    }
    lines
}

pub fn write_pdf(title: &str, sections: &[DocSection], bibliography: &[BibliographySection], path: &std::path::Path) -> Result<(), String> {
    let (doc, page1, layer1) = PdfDocument::new(title, Mm(PAGE_W_MM), Mm(PAGE_H_MM), "Ebene 1");
    let font = doc.add_builtin_font(BuiltinFont::Helvetica).map_err(|e| e.to_string())?;
    let font_bold = doc.add_builtin_font(BuiltinFont::HelveticaBold).map_err(|e| e.to_string())?;

    let mut page_index = page1;
    let mut layer_index = layer1;
    let mut y = PAGE_H_MM - MARGIN_MM;

    let new_page = |doc: &printpdf::PdfDocumentReference| {
        doc.add_page(Mm(PAGE_W_MM), Mm(PAGE_H_MM), "Ebene 1")
    };

    doc.get_page(page_index).get_layer(layer_index).use_text(title, TITLE_SIZE, Mm(MARGIN_MM), Mm(y), &font_bold);
    y -= LINE_HEIGHT_MM * 2.2;

    let write_paragraphs = |doc: &printpdf::PdfDocumentReference, page_index: &mut _, layer_index: &mut _, y: &mut f32, body: &str, size: f32, font: &printpdf::IndirectFontRef| {
        let max_chars = max_chars_per_line(size);
        for para in paragraphs(body) {
            let text = strip_wikilinks(&para);
            for line in wrap_text(&text, max_chars) {
                if *y - LINE_HEIGHT_MM < MARGIN_MM {
                    let (p, l) = new_page(doc);
                    *page_index = p;
                    *layer_index = l;
                    *y = PAGE_H_MM - MARGIN_MM;
                }
                doc.get_page(*page_index).get_layer(*layer_index).use_text(&line, size, Mm(MARGIN_MM), Mm(*y), font);
                *y -= LINE_HEIGHT_MM;
            }
            *y -= LINE_HEIGHT_MM * 0.5;
        }
    };

    for section in sections {
        if y - LINE_HEIGHT_MM * 2.0 < MARGIN_MM {
            let (p, l) = new_page(&doc);
            page_index = p;
            layer_index = l;
            y = PAGE_H_MM - MARGIN_MM;
        }
        doc.get_page(page_index).get_layer(layer_index).use_text(&section.heading, HEADING_SIZE, Mm(MARGIN_MM), Mm(y), &font_bold);
        y -= LINE_HEIGHT_MM * 1.8;
        write_paragraphs(&doc, &mut page_index, &mut layer_index, &mut y, &section.body, BODY_SIZE, &font);
    }

    if !bibliography.is_empty() {
        if y - LINE_HEIGHT_MM * 2.0 < MARGIN_MM {
            let (p, l) = new_page(&doc);
            page_index = p;
            layer_index = l;
            y = PAGE_H_MM - MARGIN_MM;
        }
        doc.get_page(page_index).get_layer(layer_index).use_text("Quellenverzeichnis", HEADING_SIZE, Mm(MARGIN_MM), Mm(y), &font_bold);
        y -= LINE_HEIGHT_MM * 1.8;
        for section in bibliography {
            if y - LINE_HEIGHT_MM * 2.0 < MARGIN_MM {
                let (p, l) = new_page(&doc);
                page_index = p;
                layer_index = l;
                y = PAGE_H_MM - MARGIN_MM;
            }
            doc.get_page(page_index).get_layer(layer_index).use_text(&section.label, BODY_SIZE, Mm(MARGIN_MM), Mm(y), &font_bold);
            y -= LINE_HEIGHT_MM * 1.4;
            let entries_text = section.entries.join("\n\n");
            write_paragraphs(&doc, &mut page_index, &mut layer_index, &mut y, &entries_text, BODY_SIZE, &font);
        }
    }

    let file = std::fs::File::create(path).map_err(|e| e.to_string())?;
    doc.save(&mut BufWriter::new(file)).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strip_wikilinks_prefers_alias() {
        assert_eq!(strip_wikilinks("See [[BGE 137 I 16]] here."), "See BGE 137 I 16 here.");
        assert_eq!(strip_wikilinks("See [[BGE 137 I 16|the leading case]] here."), "See the leading case here.");
        assert_eq!(strip_wikilinks("Unclosed [[nope"), "Unclosed [[nope");
    }

    #[test]
    fn wrap_text_never_exceeds_budget_and_keeps_all_words() {
        let text = "Dies ist ein etwas längerer Testsatz, der über mehrere Zeilen umbrochen werden sollte, um die Wortumbruch-Logik zu prüfen.";
        let lines = wrap_text(text, 20);
        assert!(lines.iter().all(|l| l.len() <= 20 || !l.contains(' ')), "no line should exceed the budget unless it's a single long word");
        let rejoined: Vec<&str> = lines.iter().flat_map(|l| l.split_whitespace()).collect();
        let original: Vec<&str> = text.split_whitespace().collect();
        assert_eq!(rejoined, original, "wrapping must not drop or reorder words");
    }

    #[test]
    fn build_latex_escapes_special_characters() {
        let out = build_latex("Titel & Sache", &[DocSection { heading: "§ 1".into(), body: "100% sicher, mit \\backslash.".into() }], &[]);
        assert!(out.contains("Titel \\& Sache"));
        assert!(out.contains("100\\% sicher"));
        assert!(out.contains("\\textbackslash{}"));
    }

    #[test]
    fn write_pdf_produces_a_valid_looking_file() {
        let path = std::env::temp_dir().join(format!("folio-pdf-test-{}.pdf", uuid::Uuid::new_v4()));
        let sections = vec![DocSection { heading: "Kapitel 1".into(), body: "Ein Absatz.\n\nEin zweiter Absatz mit [[Notiz|Verweis]].".into() }];
        let bib = vec![BibliographySection { label: "Literaturverzeichnis".into(), entries: vec!["Koller, OR AT.".into()] }];
        write_pdf("Testdokument", &sections, &bib, &path).unwrap();
        let bytes = std::fs::read(&path).unwrap();
        assert!(bytes.starts_with(b"%PDF-"), "output must start with a PDF header");
        assert!(bytes.len() > 500, "output should be a real, non-trivial PDF");
        let _ = std::fs::remove_file(&path);
    }
}
