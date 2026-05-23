#!/usr/bin/env python3
"""
Script to convert AI_Model_Thesis_Documentation.md to PDF format.
Requires: pip install markdown2 pdfkit wkhtmltopdf
"""

import markdown2
import pdfkit
import os
from pathlib import Path

def markdown_to_pdf(md_file, pdf_file, css_file=None):
    """
    Convert markdown file to PDF.
    
    Args:
        md_file: Path to markdown file
        pdf_file: Path to output PDF file
        css_file: Optional CSS file for styling
    """
    
    # Read markdown file
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown2.markdown(md_content, extras=['tables', 'fenced-code-blocks', 'latex'])
    
    # Create styled HTML wrapper
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>AI Model Implementation Documentation</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 900px;
                margin: 0 auto;
                padding: 20px;
                background: white;
            }}
            h1 {{
                color: #1e3a8a;
                border-bottom: 3px solid #1e3a8a;
                padding-bottom: 10px;
                margin-top: 30px;
                page-break-after: avoid;
            }}
            h2 {{
                color: #2563eb;
                margin-top: 25px;
                page-break-after: avoid;
            }}
            h3 {{
                color: #3b82f6;
                page-break-after: avoid;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 15px 0;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }}
            th {{
                background-color: #1e3a8a;
                color: white;
            }}
            tr:nth-child(even) {{
                background-color: #f3f4f6;
            }}
            code {{
                background-color: #f3f4f6;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
            }}
            pre {{
                background-color: #1e293b;
                color: #e2e8f0;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
                page-break-inside: avoid;
            }}
            pre code {{
                background: none;
                padding: 0;
                color: inherit;
            }}
            hr {{
                margin: 30px 0;
                border: none;
                border-top: 2px solid #e5e7eb;
            }}
            strong {{
                color: #1e3a8a;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Write HTML to temporary file
    temp_html = 'temp_output.html'
    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(html_template)
    
    # Convert HTML to PDF
    try:
        pdfkit.from_file(temp_html, pdf_file, options={
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
            'encoding': "UTF-8",
            'enable-local-file-access': None,
        })
        print(f"✓ PDF successfully created: {pdf_file}")
    except Exception as e:
        print(f"✗ Error creating PDF: {e}")
        print("Make sure wkhtmltopdf is installed: https://wkhtmltopdf.org/")
    finally:
        # Clean up temporary HTML file
        if os.path.exists(temp_html):
            os.remove(temp_html)

if __name__ == "__main__":
    md_file = "AI_Model_Thesis_Documentation.md"
    pdf_file = "AI_Model_Thesis_Documentation.pdf"
    
    if not os.path.exists(md_file):
        print(f"Error: {md_file} not found")
        exit(1)
    
    print(f"Converting {md_file} to PDF...")
    markdown_to_pdf(md_file, pdf_file)
