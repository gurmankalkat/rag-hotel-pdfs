import os
import sys
import json
from langchain_community.document_loaders import PyPDFLoader

def calculate_totals(size, pdf_url):
    # Use the URL directly to load the file
    try:
        loader = PyPDFLoader(pdf_url)  # Pass the URL to PyPDFLoader
        pages = loader.load_and_split()

        # Example logic: Generate dummy totals for demonstration
        total_quote = size * 0.1  # Just a placeholder calculation
        meeting_room_total = size * 0.05
        sleeping_room_total = size * 0.02

        explanations = [
            "Explanation for total quote.",
            "Explanation for meeting room total.",
            "Explanation for sleeping room total.",
        ]

        return {
            "final_totals": [total_quote, meeting_room_total, sleeping_room_total],
            "explanations": explanations,
        }
    except Exception as e:
        raise ValueError(f"Error processing the PDF file: {e}")

if __name__ == "__main__":
    # Get arguments from the command line
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments"}))
        sys.exit(1)

    pdf_url = sys.argv[1]
    size = int(sys.argv[2])  # Example: File size or other input metric

    try:
        result = calculate_totals(size, pdf_url)
        print(json.dumps(result))  # Output JSON result
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
