Alright 💯 — let’s go all in with option 1 and create the complete multi-file modular toolbox.
Here’s the full codebase for your tools/ folder.


---

tools/__init__.py

# Empty __init__.py so "tools" can be imported as a package


---

tools/main.py

import sys

def main():
    try:
        import PySimpleGUI as sg
        from . import gui
        gui.run_gui()
    except ImportError:
        from . import cli
        cli.run_cli()

if __name__ == "__main__":
    main()


---

tools/gui.py

import PySimpleGUI as sg
from . import wiki_template, mht_to_md, image_to_specs

def run_gui():
    layout = [
        [sg.Text("Toolbox", font=("Helvetica", 16))],
        [sg.Button("Wiki Template Generator")],
        [sg.Button("MHT → Markdown")],
        [sg.Button("Image → Test Specs")],
        [sg.Button("Exit")]
    ]

    window = sg.Window("Developer Toolbox", layout)

    while True:
        event, values = window.read()
        if event in (sg.WINDOW_CLOSED, "Exit"):
            break
        elif event == "Wiki Template Generator":
            title = sg.popup_get_text("Enter Wiki Title")
            sections = sg.popup_get_text("Enter sections (comma separated)")
            footer = sg.popup_get_text("Enter footer (optional)")
            md = wiki_template.generate(title, sections.split(","), footer)
            sg.popup_scrolled(md, title="Generated Markdown")
        elif event == "MHT → Markdown":
            file = sg.popup_get_file("Select MHT file")
            if file:
                output = mht_to_md.convert(file)
                sg.popup_scrolled(output, title="Extracted Markdown Table")
        elif event == "Image → Test Specs":
            files = sg.popup_get_file("Select image(s)", multiple_files=True)
            if files:
                save = sg.popup_get_file("Save output as (CSV/XLSX)", save_as=True)
                if save:
                    image_to_specs.convert(files.split(";"), save)
                    sg.popup("Saved to", save)

    window.close()


---

tools/cli.py

from . import wiki_template, mht_to_md, image_to_specs

def run_cli():
    while True:
        print("\nDeveloper Toolbox")
        print("1. Wiki Template Generator")
        print("2. MHT → Markdown")
        print("3. Image → Test Specs")
        print("4. Exit")

        choice = input("Select an option: ")

        if choice == "1":
            title = input("Enter Wiki Title: ")
            sections = input("Enter sections (comma separated): ").split(",")
            footer = input("Enter footer (optional): ")
            md = wiki_template.generate(title, sections, footer)
            print("\nGenerated Markdown:\n")
            print(md)
        elif choice == "2":
            file = input("Enter path to MHT file: ")
            output = mht_to_md.convert(file)
            print("\nExtracted Markdown Table:\n")
            print(output)
        elif choice == "3":
            files = input("Enter image paths (comma separated): ").split(",")
            save = input("Enter output file path (CSV/XLSX): ")
            image_to_specs.convert(files, save)
            print("Saved to", save)
        elif choice == "4":
            break
        else:
            print("Invalid choice")


---

tools/wiki_template.py

def generate(title: str, sections: list, footer: str = "") -> str:
    md = f"# {title}\n\n"
    for section in sections:
        section = section.strip()
        if section:
            md += f"## {section}\n\n(Write content here)\n\n"
    if footer:
        md += f"---\n{footer}\n"
    return md


---

tools/mht_to_md.py

import email
from html.parser import HTMLParser

class SimpleHTMLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
    def handle_data(self, d):
        self.text.append(d)
    def get_text(self):
        return ''.join(self.text)

def convert(file_path: str) -> str:
    with open(file_path, "rb") as f:
        msg = email.message_from_binary_file(f)
    html_content = ""
    for part in msg.walk():
        if part.get_content_type() == "text/html":
            html_content = part.get_payload(decode=True).decode(errors="ignore")
            break
    stripper = SimpleHTMLStripper()
    stripper.feed(html_content)
    text = stripper.get_text()
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    md_table = "| Step | Description |\n|------|-------------|\n"
    for i, line in enumerate(lines, 1):
        md_table += f"| {i} | {line} |\n"
    return md_table


---

tools/image_to_specs.py

import csv
import os

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    import pandas as pd
except ImportError:
    pd = None

def convert(files: list, output: str):
    rows = []
    for file in files:
        row = {"File": os.path.basename(file)}
        if Image:
            try:
                with Image.open(file) as img:
                    row["Width"] = img.width
                    row["Height"] = img.height
                    row["Mode"] = img.mode
            except Exception as e:
                row["Error"] = str(e)
        rows.append(row)

    if output.lower().endswith(".csv"):
        with open(output, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
    elif output.lower().endswith(".xlsx") and pd:
        df = pd.DataFrame(rows)
        df.to_excel(output, index=False)
    else:
        raise ValueError("Unsupported output format (use .csv or .xlsx)")


---

✅ With this structure:

Run GUI:

python -m tools.main

(will auto-launch GUI if PySimpleGUI is installed)

Run CLI:

python -m tools.main --cli

(or just uninstall PySimpleGUI)



---

Do you want me to also add a setup.py / pyproject.toml so you can install this as a package (pip install -e .) and call it globally as a command like toolbox?

