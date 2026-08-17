import base64
import io
import json
import os
import sys

import numpy as np
import tensorflow as tf
from PIL import Image

MODEL_PATH = os.path.join(os.path.dirname(__file__), "cinnamon_trained_model.keras")
CLASS_NAMES = ["healthy_cinnamon", "leaf_spot_disease", "rough_bark", "stripe_canker"]

MODEL = tf.keras.models.load_model(MODEL_PATH)


def predict_from_image_bytes(image_bytes: bytes) -> tuple[str, float]:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((128, 128))

    input_arr = np.array(image, dtype=np.float32)
    input_arr = np.array([input_arr])

    prediction = MODEL.predict(input_arr, verbose=0)[0]
    result_index = int(np.argmax(prediction))
    disease = CLASS_NAMES[result_index]
    confidence = float(prediction[result_index] * 100.0)
    return disease, confidence


def main() -> int:
    raw_base64 = sys.stdin.read().strip()
    if not raw_base64:
        print("No image data received.", file=sys.stderr)
        return 1

    try:
        image_bytes = base64.b64decode(raw_base64)
        disease, confidence = predict_from_image_bytes(image_bytes)

        print(json.dumps({"disease": disease, "confidence": confidence}))
        return 0
    except Exception as exc:
        print(f"Inference error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())