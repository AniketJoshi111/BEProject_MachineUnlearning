import os
import joblib
import numpy as np
import pandas as pd
from app.config import MODEL_DIR

SISA_DIR = os.path.join(MODEL_DIR, "sisa_models")

_models = None


def load_sisa_models():
    global _models

    if _models is not None:
        return _models

    models = []

    if not os.path.exists(SISA_DIR):
        raise FileNotFoundError("SISA models not trained yet")

    for file in os.listdir(SISA_DIR):
        if file.endswith(".pkl"):
            model_path = os.path.join(SISA_DIR, file)
            models.append(joblib.load(model_path))

    if len(models) == 0:
        raise Exception("No SISA models found")

    _models = models
    return models


def sisa_predict(features: dict):
    models = load_sisa_models()

    df = pd.DataFrame([features])

    # collect probabilities
    probs = []
    for m in models:
        probs.append(m.predict_proba(df))

    avg_probs = np.mean(probs, axis=0)

    prediction = np.argmax(avg_probs, axis=1)[0]

    return "Malicious" if prediction == 1 else "Benign"