from PyPDF2 import PdfReader

def extract_features(pdf_path):
    reader = PdfReader(pdf_path)
    return {
        "num_pages": len(reader.pages),
        "js_count": 0,
        "entropy": 7.5
    }
