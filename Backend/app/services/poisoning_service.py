import json
import pandas as pd
from app.config import DATA_DIR

def inject_poison(clean_df, poison_df):
    working_df = pd.concat([clean_df, poison_df], ignore_index=True)

    poisoned_indices = list(
        range(len(clean_df), len(working_df))
    )

    save_metadata(poisoned_indices)
    working_df.to_csv(f"{DATA_DIR}/working_data.csv", index=False)

    return poisoned_indices

def save_metadata(poisoned_indices):
    with open(f"{DATA_DIR}/metadata.json", "w") as f:
        json.dump({"poisoned_indices": poisoned_indices}, f)
