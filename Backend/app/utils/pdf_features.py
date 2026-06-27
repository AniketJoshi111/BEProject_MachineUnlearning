from PyPDF2 import PdfReader

KEYWORDS = [
    'obj', 'endobj', 'stream', 'endstream', 'xref', 'trailer',
    'startxref', 'Page', 'Encrypt', 'ObjStm', 'JS', 'Javascript',
    'AA', 'OpenAction', 'AcroForm', 'JBIG2Decode', 'RichMedia',
    'Launch', 'EmbeddedFile', 'XFA', 'Colors'
]

def extract_features(pdf_path):
    with open(pdf_path, "rb") as f:
        raw = f.read().decode("latin-1")
    return {kw: raw.count(kw) for kw in KEYWORDS}