import joblib
from sklearn.ensemble import RandomForestClassifier
from app.config import MODEL_DIR

def train_baseline(X, y):
    model = RandomForestClassifier(random_state=42)
    model.fit(X, y)
    joblib.dump(model, f"{MODEL_DIR}/baseline_model.pkl")
    return model
