import json
from datasets import Dataset, DatasetDict
import os
import pandas as pd

def load_and_prepare_data(file_path):

    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)


    label_mapping = {"Identification": 0, "Credentials": 1, "Location": 2, "Routine Activity": 3, "Financial Information": 4, "Social Media Accounts": 5,"Safe" : 6}  # מיפוי תוויות למספרים
    dataset = Dataset.from_dict({
        'message': [entry['message'] for entry in data],
        'label': [label_mapping[entry['label']] for entry in data]  # המרת תוויות
    })
    

    # חילוק לסטים
    train_test_split = dataset.train_test_split(test_size=0.2)  # 80% אימון, 20% בדיקה
    train_dataset = train_test_split['train']
    test_dataset = train_test_split['test']

    # אם רוצים גם סט אימון קטן לצורך ולידציה:
    train_valid_split = train_dataset.train_test_split(test_size=0.1)  # 10% מהסט יילך לוולידציה
    train_dataset = train_valid_split['train']
    valid_dataset = train_valid_split['test']

    # יצירת DatasetDict:
    dataset_dict = DatasetDict({
        'train': train_dataset,
        'validation': valid_dataset,
        'test': test_dataset
    })

    return dataset_dict


def process_new_datasets(extracted_path, existing_file):
    """
    פונקציה לעיבוד קבצי ה-CSV החדשים ושילובם עם הנתונים הקיימים.
    """
    # קריאת הנתונים הקיימים
    with open(existing_file, 'r', encoding='utf-8') as f:
        existing_data = json.load(f)

    # רשימת קבצי ה-CSV החדשים
    csv_files = [f for f in os.listdir(extracted_path) if f.endswith('.csv')]

    # עיבוד כל קובץ CSV
    new_data = []
    for csv_file in csv_files:
        print(f"Processing {csv_file}...")
        file_path = os.path.join(extracted_path, csv_file)
        data = pd.read_csv(file_path)

        # התאמת הנתונים למבנה של training_messages.json
        # הנחה: העמודות הן 'text' ו-'label', עדכני לפי מבנה ה-CSV שלך
        label_mapping = {
            "PII": "Identification",
            "Non-PII": "Safe",
            "Financial": "Financial Information",
            # הוסיפי מיפויים נוספים לפי הצורך
        }

        processed_data = [
            {"message": row["full_text"], "label": label_mapping.get(row["labels"], "Safe")}
            for _, row in data.iterrows()
        ]
        new_data.extend(processed_data)

    # שילוב הנתונים החדשים עם הקיימים
    combined_data = existing_data + new_data

    # שמירת הנתונים המשולבים בקובץ JSON
    with open(existing_file, 'w', encoding='utf-8') as f:
        json.dump(combined_data, f, ensure_ascii=False, indent=4)

    print(f"Combined data saved to {existing_file}")

