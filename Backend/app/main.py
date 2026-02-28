from fastapi import FastAPI, UploadFile
import pandas as pd
import shutil

from app.services.dataset_service import load_clean_data, load_poison_data
from app.services.poisoning_service import inject_poison
from app.services.training_service import train_baseline
from app.services.unlearning_service import unlearn
from app.services.prediction_service import predict_pdf
from app.utils.pdf_features import extract_features
#from app.services.sisa_prediction_service import sisa_predict
from fastapi.middleware.cors import CORSMiddleware


# IMPORTANT: create app FIRST
app = FastAPI(title="Malicious PDF Detection API")

# THEN add CORS (order matters)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # DO NOT USE "*" for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/train")
def train():
    df = load_clean_data()
    X = df.drop("Malicious", axis=1)
    y = df["Malicious"]
    train_baseline(X, y)
    return {"status": "Baseline model trained"}

@app.post("/attack")
def attack():
    clean = load_clean_data()
    poison = load_poison_data()
    indices = inject_poison(clean, poison)
    return {"poisoned_samples": len(indices)}

@app.post("/unlearn")
def unlearn_attack():
    df = pd.read_csv("app/data/working_data.csv")
    X = df.drop("Malicious", axis=1)
    y = df["Malicious"]
    unlearn(X, y)
    return {"status": "Unlearning completed"}

@app.post("/predict")
def predict(file: UploadFile):
    path = f"temp_{file.filename}"
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    features = extract_features(path)
    result = predict_pdf(features)
    return {"prediction": result}

@app.get("/")
def root():
    return {"status": "backend running"}
