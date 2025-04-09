from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments
from data_preprocessing import load_and_prepare_data
from train_model import train_model

# שלב 1: הכנת הדאטה
dataset_dict = load_and_prepare_data('../../data/training_messages.json')
print(dataset_dict)

# שלב 2: טעינת טוקניזר ומודל מוכן מראש (למשל דגם BERT בסיסי)
checkpoint = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)

# המרה של ההודעות למספרים שהמודל מבין
def tokenize_function(example):
    return tokenizer(example["message"], padding="max_length", truncation=True)

# משתמשים בפונקציה map של אובייקט ה־Dataset כדי להחיל את הפונקציה tokenize_function על כל הדאטה.
tokenized_datasets = dataset_dict.map(tokenize_function, batched=True)
print(tokenized_datasets)

# שלב 3: יצירת מודל (למשל עם 5 תוויות)
model = AutoModelForSequenceClassification.from_pretrained(checkpoint, num_labels=6)

# שלב 4: הגדרת פרמטרי אימון
training_args = TrainingArguments(
    output_dir="./results",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_dir="./logs"
)


# שלב 5: אימון המודל
train_model(tokenized_datasets, model, training_args,tokenizer)

""" 
סיכום התהליך
טעינת נתונים:

הקריאה לנתונים מהקובץ training_messages.json, המרה ל-Dataset, וחלוקה לסטים (אימון, ולידציה, בדיקה).

טוקניזציה:

המרת ההודעות למבנה מספרי שהמודל יכול לעבד.

טעינת המודל:

טוענים מודל מוכן מראש (למשל, distilbert-base-uncased) ומגדירים אותו לסיווג טקסט עם מספר תוויות מתאים.

הגדרת הגדרות אימון:

קביעת הפרמטרים של תהליך האימון (כמו מספר אפוקים, שיעור למידה וכו').

אימון ושמירה:

קריאה לפונקציה train_model שמבצעת את האימון, מפעילה הערכות לאורך התהליך, ושומרת את המודל המאומן בתיקייה מסוימת.

"""

