import re
import numpy as np
import tensorflow as tf


MODEL_PATH = "semantic_faq_model.keras"

model = tf.keras.models.load_model(MODEL_PATH)


label_mapping = {
    0: 'adaptasi makhluk hidup',
    1: 'air',
    2: 'alat pencernaan dan makanan',
    3: 'alat pernapasan manusia dan hewan',
    4: 'alat tubuh manusia dan hewan',
    5: 'benda dan sifatnya',
    6: 'bumi dan peristiwa alam',
    7: 'cahaya dan sifat-sifatnya',
    8: 'gaya, gerak, dan energi',
    9: 'organ tubuh manusia dan hewan',
    10: 'peredaran darah',
    11: 'peristiwa alam',
    12: 'sistem pernapasan',
    13: 'sumber daya alam dan kegunaannya',
    14: 'tumbuhan hijau'
}



def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def predict_topic(question: str):

    cleaned_question = clean_text(question)

    prediction = model.predict(
        tf.constant([cleaned_question], dtype=tf.string),
        verbose=0,
    )

    predicted_index = np.argmax(prediction)

    predicted_topic = label_mapping[
        predicted_index
    ]

    confidence = float(
        np.max(prediction)
    )

    return {
        "topic": predicted_topic,
        "confidence": confidence,
    }

if __name__ == "__main__":

    question = "jelaskan trakea dan bronkus"

    result = predict_topic(question)

    print(result)