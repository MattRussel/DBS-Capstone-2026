import re
import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import Layer
from tensorflow.keras import losses

# ── Custom Components untuk Load Model ──────────────────────────────────
class AttentionPooling(Layer):
    def build(self, input_shape):
        self.attention_weights = self.add_weight(
            name='attention_weights', shape=(input_shape[-1],),
            initializer='glorot_uniform', trainable=True)
        super().build(input_shape)
    def call(self, inputs):
        scores = tf.tensordot(inputs, self.attention_weights, axes=[[2],[0]])
        scores = tf.nn.softmax(scores, axis=-1)
        return tf.reduce_sum(inputs * tf.expand_dims(scores, -1), axis=1)
    def get_config(self): return super().get_config()

class FocalLoss(losses.Loss):
    def __init__(self, gamma=2.0, alpha=0.25, **kwargs):
        super().__init__(**kwargs)
        self.gamma = gamma
        self.alpha = alpha
    def call(self, y_true, y_pred):
        y_true = tf.squeeze(tf.cast(y_true, tf.int32))
        n  = tf.shape(y_pred)[-1]
        oh = tf.one_hot(y_true, n)
        ce = -oh * tf.math.log(y_pred + 1e-7)
        w  = self.alpha * tf.pow(1.0 - y_pred, self.gamma)
        return tf.reduce_mean(tf.reduce_sum(w * ce, axis=-1))
    def get_config(self):
        cfg = super().get_config()
        cfg.update({'gamma': self.gamma, 'alpha': self.alpha})
        return cfg

MODEL_PATH = "semantic_faq_model.keras"

model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={'AttentionPooling': AttentionPooling, 'FocalLoss': FocalLoss}
)


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