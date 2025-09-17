# Writing a modular Python tool GUI script to /mnt/data/tools_gui.py
# This execution will create the script file but will NOT attempt to open a GUI here.
# The script tries to import optional libraries (PySimpleGUI, Pillow, pandas) and
# falls back to CLI-friendly behavior when they are not installed.
script = r'''
#!/usr/bin/env python3
"""
tools_gui.py
Modular Python tool implementing:
 - Wiki Template Generator (Markdown)
 - Steps Recorder Extraction (MHT -> Markdown)
 - Image -> Test Specs (CSV/Excel)

Usage:
    python tools_gui.py        # launches GUI if PySimpleGUI is installed, else CLI menu
Dependencies (optional for GUI/advanced features):
    pip install PySimpleGUI pillow pandas openpyxl

This script is modular: core logic for each tool is in functions, GUI is a thin wrapper.
"""

import sys
import os
import argparse
import csv
from io import StringIO
from email import policy
from email.parser import BytesParser
from html.parser import HTMLParser
import re

# --- Utilities -------------------------------------------------------------
def safe_mkdir(path):
    os.makedirs(path, exist_ok=True)

class MLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.fed = []
    def handle_data(self, d):
        self.fed.append(d)
    def get_data(self):
        return ''.join(self.fed)

def html_to_text(html: str) -> str:
    s = MLStripper()
    s.feed(html)
    return s.get_data()

# --- Tool 1: Wiki Template Generator --------------------------------------
def generate_wiki_template(title: str, sections: dict, footer: str = '') -> str:
    """
    sections: dict of section_title -> body_text (plain text)
    returns markdown string
    """
    md = []
    md.append(f"# {title}\\n")
    for section_title, body in sections.items():
        md.append(f"## {section_title}\\n")
        md.append(body.strip() + "\\n")
    if footer:
        md.append("---\\n")
        md.append(footer.strip() + "\\n")
    return "\\n".join(md)

# --- Tool 2: MHT -> Markdown ----------------------------------------------
def extract_html_parts_from_mht(mht_bytes: bytes) -> list:
    """
    Basic extraction of HTML parts from an MHT (multipart/related) file.
    Returns a list of HTML strings (decoded as utf-8 where possible).
    """
    msg = BytesParser(policy=policy.default).parsebytes(mht_bytes)
    parts = []
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            if ctype == 'text/html' or ctype == 'text/plain':
                payload = part.get_payload(decode=True)
                if payload is None:
                    continue
                try:
                    text = payload.decode(part.get_content_charset() or 'utf-8', errors='replace')
                except Exception:
                    text = payload.decode('utf-8', errors='replace')
                parts.append((ctype, text))
    else:
        # fallback: entire content
        payload = msg.get_payload(decode=True)
        if payload:
            try:
                text = payload.decode('utf-8', errors='replace')
            except Exception:
                text = str(payload)
            parts.append((msg.get_content_type(), text))
    return parts

def mht_to_markdown(mht_path: str) -> str:
    """
    Converts an MHT file (Steps Recorder output) into a simple markdown.
    Strategy:
     - parse MIME sections and grab HTML parts
     - strip HTML tags to plain text and structure into headings and code blocks
    """
    with open(mht_path, 'rb') as f:
        data = f.read()
    parts = extract_html_parts_from_mht(data)
    md_chunks = []
    for idx, (ctype, text) in enumerate(parts):
        if ctype == 'text/plain':
            md_chunks.append("```text\\n" + text.strip() + "\\n```")
        elif ctype == 'text/html':
            # naive conversion: extract text and attempt to split by common boundaries
            plain = html_to_text(text)
            # try to find step headings (Step 1:, Step 2: etc.) else just append plain
            steps = re.split(r'(?:Step\\s*\\d+[:\\)]\\s*)', plain)
            if len(steps) > 1:
                # preserve the 'Step N' markers using findall to interleave
                markers = re.findall(r'(Step\\s*\\d+[:\\)]\\s*)', plain)
                for i, chunk in enumerate(steps):
                    if not chunk.strip():
                        continue
                    heading = markers[i-1] if i>0 and i-1 < len(markers) else None
                    if heading:
                        md_chunks.append("### " + heading.strip())
                    md_chunks.append(chunk.strip())
            else:
                md_chunks.append(plain.strip())
        else:
            md_chunks.append(f"<!-- skipped part type: {ctype} -->")
    return "\\n\\n".join(md_chunks)

# --- Tool 3: Image -> Test Specs (CSV/Excel) -------------------------------
def image_to_spec_rows(image_paths: list, use_pil: bool = True) -> list:
    """
    For each image, produce a row of spec data. Attempts to use Pillow to read size and mode.
    If Pillow is not available or fails, falls back to filename-only rows.
    Returns list of dicts: {filename, width, height, mode, notes}
    """
    rows = []
    try:
        if use_pil:
            from PIL import Image
        else:
            Image = None
    except Exception:
        Image = None

    for p in image_paths:
        fname = os.path.basename(p)
        row = {'filename': fname, 'width': '', 'height': '', 'mode': '', 'notes': ''}
        if Image and os.path.exists(p):
            try:
                with Image.open(p) as im:
                    row['width'], row['height'] = im.size
                    row['mode'] = im.mode
            except Exception as e:
                row['notes'] = f"PIL error: {e}"
        else:
            row['notes'] = 'PIL missing or file not accessible; only filename recorded'
        rows.append(row)
    return rows

def write_rows_to_csv(rows: list, out_csv_path: str):
    keys = ['filename', 'width', 'height', 'mode', 'notes']
    with open(out_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

# Try optional Excel output using pandas if available
def save_rows_as_excel_if_possible(rows: list, out_xlsx_path: str) -> bool:
    try:
        import pandas as pd
    except Exception:
        return False
    df = pd.DataFrame(rows)
    try:
        df.to_excel(out_xlsx_path, index=False)
        return True
    except Exception:
        return False

# --- CLI wrapper ----------------------------------------------------------
def cli_menu():
    print("Tools CLI - choose an option:")
    print("1) Wiki Template Generator (Markdown)")
    print("2) Steps Recorder Extraction (MHT -> Markdown)")
    print("3) Image -> Test Specs (CSV/Excel)")
    print("q) Quit")
    choice = input("Choice: ").strip()
    if choice == '1':
        title = input("Title: ").strip()
        n = int(input("How many sections? "))
        sections = {}
        for i in range(n):
            st = input(f"Section {i+1} title: ").strip()
            bd = input(f"Section {i+1} body (single line or \\n for paragraphs): ").strip()
            sections[st] = bd
        footer = input("Footer (optional): ").strip()
        md = generate_wiki_template(title, sections, footer)
        out = input("Output filename (eg out.md): ").strip() or "out.md"
        with open(out, 'w', encoding='utf-8') as f:
            f.write(md)
        print(f"Wrote {out}")
    elif choice == '2':
        path = input("MHT path: ").strip()
        if not os.path.exists(path):
            print("File not found")
            return
        md = mht_to_markdown(path)
        out = input("Output filename (eg out.md): ").strip() or "out.md"
        with open(out, 'w', encoding='utf-8') as f:
            f.write(md)
        print(f"Wrote {out}")
    elif choice == '3':
        imgs = input("Image paths (comma separated): ").strip().split(',')
        imgs = [i.strip() for i in imgs if i.strip()]
        rows = image_to_spec_rows(imgs)
        out = input("Output CSV filename (eg specs.csv): ").strip() or "specs.csv"
        write_rows_to_csv(rows, out)
        print(f"Wrote {out}")
        try_xlsx = input("Also try to save as .xlsx using pandas? (y/n): ").strip().lower()
        if try_xlsx == 'y':
            ok = save_rows_as_excel_if_possible(rows, os.path.splitext(out)[0] + '.xlsx')
            print("Saved xlsx:" , ok)
    else:
        print("Goodbye.")

# --- GUI wrapper (optional) -----------------------------------------------
def launch_gui():
    try:
        import PySimpleGUI as sg
    except Exception:
        print("PySimpleGUI not installed. Install with: pip install PySimpleGUI")
        return

    sg.theme('DefaultNoMoreNagging')
    tab1_layout = [
        [sg.Text("Title:"), sg.Input(key='-W_TITLE-')],
        [sg.Text("Sections (title::body one per line):")],
        [sg.Multiline(key='-W_SECTIONS-', size=(60,10))],
        [sg.Text("Footer (optional):")],
        [sg.Input(key='-W_FOOTER-')],
        [sg.Button("Generate MD", key='-W_GEN-'), sg.Button("Save As", key='-W_SAVE-')],
        [sg.StatusBar('', size=(60,1), key='-W_STATUS-')]
    ]

    tab2_layout = [
        [sg.Text("Select .mht file:"), sg.Input(key='-MHT_PATH-'), sg.FileBrowse(file_types=(("MHT Files", "*.mht"), ("All files","*.*")))],
        [sg.Button("Convert to Markdown", key='-MHT_CONV-'), sg.Button("Save As", key='-MHT_SAVE-')],
        [sg.Multiline(key='-MHT_OUT-', size=(80,20))]
    ]

    tab3_layout = [
        [sg.Text("Select images (multiple):"), sg.Input(key='-IMG_PATHS-'), sg.FilesBrowse()],
        [sg.Text("Output CSV filename:"), sg.Input(default_text='specs.csv', key='-IMG_OUT-'), sg.FileSaveAs(file_types=(("CSV","*.csv"),("All files","*.*")))],
        [sg.Button("Generate Specs", key='-IMG_GEN-'), sg.Button("Save Excel (pandas)", key='-IMG_XLS-')],
        [sg.Multiline(key='-IMG_LOG-', size=(80,8))]
    ]

    layout = [
        [sg.TabGroup([[sg.Tab('Wiki Generator', tab1_layout), sg.Tab('MHT -> MD', tab2_layout), sg.Tab('Image -> Specs', tab3_layout)]])],
        [sg.Button("Exit")]
    ]

    window = sg.Window("Tools Toolbox", layout, finalize=True)

    generated_wiki_md = None
    generated_mht_md = None

    while True:
        event, values = window.read()
        if event in (sg.WINDOW_CLOSED, "Exit"):
            break
        if event == '-W_GEN-':
            title = values['-W_TITLE-'].strip() or 'Untitled'
            raw = values['-W_SECTIONS-'].strip()
            sections = {}
            if raw:
                for line in raw.splitlines():
                    if '::' in line:
                        k,v = line.split('::',1)
                        sections[k.strip()] = v.strip()
            footer = values['-W_FOOTER-'].strip()
            generated_wiki_md = generate_wiki_template(title, sections, footer)
            window['-W_STATUS-'].update("Generated. Use Save As to write to file.")
        if event == '-W_SAVE-' and generated_wiki_md:
            save_path = sg.popup_get_file('Save wiki as', save_as=True, default_extension='.md', file_types=(("Markdown","*.md"),))
            if save_path:
                with open(save_path, 'w', encoding='utf-8') as f:
                    f.write(generated_wiki_md)
                window['-W_STATUS-'].update(f"Saved {save_path}")

        if event == '-MHT_CONV-':
            mht = values['-MHT_PATH-'].strip()
            if not mht or not os.path.exists(mht):
                sg.popup("Choose an existing .mht file first")
            else:
                try:
                    md = mht_to_markdown(mht)
                    generated_mht_md = md
                    window['-MHT_OUT-'].update(md)
                except Exception as e:
                    window['-MHT_OUT-'].update(f"Error: {e}")

        if event == '-MHT_SAVE-' and generated_mht_md:
            save_path = sg.popup_get_file('Save markdown as', save_as=True, default_extension='.md', file_types=(("Markdown","*.md"),))
            if save_path:
                with open(save_path, 'w', encoding='utf-8') as f:
                    f.write(generated_mht_md)
                sg.popup(f"Saved {save_path}")

        if event == '-IMG_GEN-':
            files = values['-IMG_PATHS-'].split(';')
            files = [f for f in files if f.strip()]
            rows = image_to_spec_rows(files)
            window['-IMG_LOG-'].update("Generated rows for {} images\\n".format(len(rows)) + "\\n".join([r['filename'] + ' -> ' + r.get('notes','') for r in rows]))

        if event == '-IMG_OUT-':
            pass

        if event == '-IMG_XLS-':
            out = values['-IMG_OUT-'] or 'specs.csv'
            files = values['-IMG_PATHS-'].split(';')
            files = [f for f in files if f.strip()]
            rows = image_to_spec_rows(files)
            # write csv first
            try:
                write_rows_to_csv(rows, out)
                saved = save_rows_as_excel_if_possible(rows, os.path.splitext(out)[0] + '.xlsx')
                sg.popup(f"Wrote CSV and xlsx saved: {saved}")
            except Exception as e:
                sg.popup(f"Error writing: {e}")

    window.close()

# --- Entry point ----------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Tools Toolbox (CLI + optional GUI)")
    parser.add_argument('--gui', action='store_true', help='Launch GUI (requires PySimpleGUI)')
    args = parser.parse_args()
    if args.gui:
        launch_gui()
    else:
        # try to launch GUI automatically if PySimpleGUI is present, otherwise CLI
        try:
            import PySimpleGUI as sg
            launch_gui()
        except Exception:
            cli_menu()

if __name__ == '__main__':
    main()
'''
# write the script file
path = '/mnt/data/tools_gui.py'
with open(path, 'w', encoding='utf-8') as f:
    f.write(script)
path


# pip install PySimpleGUI pillow pandas openpyxl
# Run: python /mnt/data/tools_gui.py
