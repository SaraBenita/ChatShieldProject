from transformers import Trainer
from metric_utils import compute_metrics

def train_model(dataset_dict, model, training_args,tokenizer):
    trainer = Trainer(
        model=model,                         
        args=training_args,                  
        train_dataset=dataset_dict['train'],  
        eval_dataset=dataset_dict['validation'],  
        compute_metrics=compute_metrics      
    )

    trainer.train()

    trainer.evaluate(dataset_dict['test'])

    # שמירת המודל
    model.save_pretrained('./my_trained_model')
    # שמירת טוקניזר
    tokenizer.save_pretrained('./my_trained_model')

    return model
