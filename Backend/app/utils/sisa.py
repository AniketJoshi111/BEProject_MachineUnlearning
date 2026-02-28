import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from app.config import NUM_SHARDS, NUM_SLICES, SISA_DIR

def shard_dataset(X, y):
    shards = []
    shard_size = len(X) // NUM_SHARDS

    for i in range(NUM_SHARDS):
        start = i * shard_size
        end = len(X) if i == NUM_SHARDS - 1 else (i + 1) * shard_size
        shards.append((X.iloc[start:end], y[start:end]))

    return shards

def train_sisa(X, y):
    shards = shard_dataset(X, y)
    models = []

    for shard_id, (X_s, y_s) in enumerate(shards):
        model = RandomForestClassifier(random_state=42)
        slice_size = len(X_s) // NUM_SLICES

        for s in range(NUM_SLICES):
            start = s * slice_size
            end = len(X_s) if s == NUM_SLICES - 1 else (s + 1) * slice_size
            model.fit(X_s.iloc[start:end], y_s[start:end])
            joblib.dump(model, f"{SISA_DIR}/shard{shard_id}_slice{s}.pkl")

        models.append(model)

    return models

def sisa_predict(X, models):
    probs = [m.predict_proba(X) for m in models]
    return np.argmax(np.mean(probs, axis=0), axis=1)
