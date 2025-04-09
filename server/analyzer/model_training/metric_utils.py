import evaluate

# טוענים את המטריקה של דיוק
metric = evaluate.load("accuracy")

# פונקציה לחישוב המטריקה במהלך האימון
def compute_metrics(p):
    return metric.compute(predictions=p.predictions.argmax(axis=-1), references=p.label_ids)
