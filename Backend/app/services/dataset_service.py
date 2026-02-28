import pandas as pd
from app.config import DATA_DIR

def load_clean_data():
    return pd.read_csv(f"{DATA_DIR}/clean_data.csv")

def load_poison_data():
    return pd.read_csv(f"{DATA_DIR}/poison_data.csv")

def save_working_data(df):
    df.to_csv(f"{DATA_DIR}/working_data.csv", index=False)

def load_working_data():
    return pd.read_csv(f"{DATA_DIR}/working_data.csv")
