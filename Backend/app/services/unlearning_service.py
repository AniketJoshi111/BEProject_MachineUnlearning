import json
from app.config import DATA_DIR
from app.utils.sisa import train_sisa

def unlearn(X, y):
    with open(f"{DATA_DIR}/metadata.json") as f:
        poisoned = set(json.load(f)["poisoned_indices"])

    clean_mask = [i not in poisoned for i in range(len(X))]
    X_clean = X.iloc[clean_mask]
    y_clean = y[clean_mask]

    return train_sisa(X_clean, y_clean)
