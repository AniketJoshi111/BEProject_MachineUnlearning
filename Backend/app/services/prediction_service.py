import joblib
import pandas as pd
import os
from app.config import MODEL_DIR

MODEL_PATH = os.path.join(MODEL_DIR, "baseline_model.pkl")
_model = None

# Exact 21 features your model was trained on
FEATURES = [
    "obj", "endobj", "stream", "endstream", "xref", "trailer",
    "startxref", "Page", "Encrypt", "ObjStm", "JS", "Javascript",
    "AA", "OpenAction", "AcroForm", "JBIG2Decode", "RichMedia",
    "Launch", "EmbeddedFile", "XFA", "Colors"
]

def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError("Baseline model not trained yet")
        _model = joblib.load(MODEL_PATH)
    return _model

def predict_pdf(features: dict):
    """
    Predict using a feature dictionary.
    Only use the exact 21 features in correct order.
    """
    # Keep only the 21 features in correct order
    ordered_features = {k: features.get(k, 0) for k in FEATURES}
    df = pd.DataFrame([ordered_features], columns=FEATURES)
    
    model = get_model()
    pred = model.predict(df)[0]
    return "Malicious" if pred == 1 else "Benign"
