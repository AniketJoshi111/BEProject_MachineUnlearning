import pandas as pd
import numpy as np

# CONFIG
CLEAN_DATA_PATH = "../data/clean_data.csv"
POISON_DATA_PATH = "../data/poison_data.csv"
POISON_FRACTION = 0.10   # 25% label flipping
RANDOM_SEED = 42

# Load clean dataset
df = pd.read_csv(CLEAN_DATA_PATH)

if "Malicious" not in df.columns:
    raise ValueError("❌ 'Malicious' column not found in dataset")

np.random.seed(RANDOM_SEED)

# Number of samples to poison
num_poison = int(len(df) * POISON_FRACTION)

# Randomly select indices
poison_indices = np.random.choice(df.index, size=num_poison, replace=False)

# Flip labels: 0 → 1, 1 → 0
df.loc[poison_indices, "Malicious"] = (
    df.loc[poison_indices, "Malicious"]
      .map({"Yes": "No", "No": "Yes"})
)

# Save poisoned dataset
df.to_csv(POISON_DATA_PATH, index=False)

print("✅ Poisoned dataset created successfully")
print(f"📄 Saved at: {POISON_DATA_PATH}")
print(f"☠️ Poisoned samples: {num_poison} / {len(df)}")
