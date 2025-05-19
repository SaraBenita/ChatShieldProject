from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os

# טוענים את המודל המאומן
current_dir = os.path.dirname(os.path.abspath(__file__))  # הנתיב של הקובץ הנוכחי
model_path = os.path.join(current_dir, "model_training", "my_trained_model")  # נתיב מוחלט למודל
tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
model = AutoModelForSequenceClassification.from_pretrained(model_path, local_files_only=True)

# מיפוי הפוך
label_mapping = {
    "Identification": 0,
    "Credentials": 1,
    "Location": 2,
    "Routine Activity": 3,
    "Financial Information": 4,
    "Social Media Accounts": 5,
    "Safe": 6  # תווית חדשה
}
reverse_label_mapping = {v: k for k, v in label_mapping.items()}

# קבלת הודעה כקלט
def analyze_message(message):
    # טוקניזציה
    inputs = tokenizer(message, return_tensors="pt", padding="max_length", truncation=True, max_length=128)

    # חיזוי
    outputs = model(**inputs)
    logits = outputs.logits
    predicted_label = torch.argmax(logits, dim=1).item()

    # המרת התווית לשם
    predicted_label_name = reverse_label_mapping[predicted_label]
    #print(f"Predicted label: {predicted_label_name}")

    return {"label": predicted_label_name}

if __name__ == "__main__":
    import sys
    import json
    message = sys.argv[1]  # קבלת ההודעה כארגומנט
    result = analyze_message(message)
    # הדפסת התוצאה בפורמט JSON
    # הפלט של הסקריפט 
    # לבדוקקק
    print(json.dumps(result))


# I live on 123 Main Street - financial information instead of location
# The PIN for my bank card is 4321