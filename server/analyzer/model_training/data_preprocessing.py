import json
from datasets import Dataset, DatasetDict

def load_and_prepare_data(file_path):

    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)


    label_mapping = {"Identification": 0, "Credentials": 1, "Location": 2, "Routine Activity": 3, "Financial Information": 4, "Social Media Accounts": 5}  # מיפוי תוויות למספרים
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
