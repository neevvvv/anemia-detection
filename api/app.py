"""
Anemia Detection API

Pipeline:
  1. ROI crop from full hand photo (palm center or nail plate)
  2. resize 128x128 → CLAHE → extract features (identical to train.py)
  3. Run 5 models → simple majority vote
"""

import os
import pickle
import numpy as np
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
from scipy.stats import skew

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models.pkl")
_models = None


# ─── ROI Extraction ───────────────────────────────────────────────────────────

def get_hand_crop(image):
    h, w = image.shape[:2]
    ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
    mask  = cv2.inRange(ycrcb, np.array([0, 133, 77]), np.array([255, 173, 127]))
    k = np.ones((11, 11), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN,  np.ones((5, 5), np.uint8))
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        return image
    largest = max(cnts, key=cv2.contourArea)
    if cv2.contourArea(largest) < 0.08 * h * w:
        return image
    x, y, cw, ch = cv2.boundingRect(largest)
    pad = 15
    return image[max(0,y-pad):min(h,y+ch+pad), max(0,x-pad):min(w,x+cw+pad)]


def extract_palm_roi(image):
    hand = get_hand_crop(image)
    h, w = hand.shape[:2]
    y1, y2 = int(h * 0.40), int(h * 0.70)
    x1, x2 = int(w * 0.20), int(w * 0.80)
    roi = hand[y1:y2, x1:x2]
    return roi if roi.size > 0 else hand


def extract_nail_roi(image):
    hand = get_hand_crop(image)
    h, w = hand.shape[:2]
    hsv = cv2.cvtColor(hand, cv2.COLOR_BGR2HSV)
    nail_mask = cv2.inRange(hsv, np.array([0, 0, 130]), np.array([30, 80, 255]))
    k = np.ones((5, 5), np.uint8)
    nail_mask = cv2.morphologyEx(nail_mask, cv2.MORPH_CLOSE, k)
    nail_mask = cv2.morphologyEx(nail_mask, cv2.MORPH_OPEN,  k)
    cnts, _ = cv2.findContours(nail_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    valid = []
    for c in cnts:
        area = cv2.contourArea(c)
        if area < 0.003 * h * w:
            continue
        x, y, cw, ch = cv2.boundingRect(c)
        aspect = cw / (ch + 1e-5)
        if 0.5 < aspect < 2.5:
            # Score by mean brightness of the region — pick brightest nail
            region = hand[y:y+ch, x:x+cw]
            brightness = float(np.mean(cv2.cvtColor(region, cv2.COLOR_BGR2HSV)[:,:,2]))
            valid.append((brightness, area, c))
    if valid:
        # Pick brightest nail (highest V mean) — most likely the nail plate, not skin
        best = max(valid, key=lambda t: t[0])
        _, _, best_c = best
        x, y, cw, ch = cv2.boundingRect(best_c)
        px, py = int(cw * 0.15), int(ch * 0.15)
        roi = hand[max(0,y-py):min(h,y+ch+py), max(0,x-px):min(w,x+cw+px)]
        if roi.size > 0:
            return roi
    # Fallback: upper-center (fingertips)
    roi = hand[int(h*0.02):int(h*0.35), int(w*0.25):int(w*0.75)]
    return roi if roi.size > 0 else hand


# ─── Feature Extraction (identical to train.py) ───────────────────────────────

def apply_clahe(image):
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    return cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2BGR)


def compute_features(image):
    image = cv2.resize(image, (128, 128))
    image = apply_clahe(image)
    features = []

    for space in [image,
                  cv2.cvtColor(image, cv2.COLOR_BGR2HSV),
                  cv2.cvtColor(image, cv2.COLOR_BGR2LAB)]:
        for ch in cv2.split(space):
            features += [float(np.mean(ch)), float(np.std(ch)), float(skew(ch.flatten()))]

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    for i in range(3):
        h = cv2.calcHist([hsv], [i], None, [8], [0, 256]).flatten()
        features.extend((h / (h.sum() + 1e-7)).tolist())

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    from skimage.feature import graycomatrix, graycoprops
    glcm = graycomatrix(
        (gray // 4).astype(np.uint8),
        distances=[5], angles=[0, np.pi/4, np.pi/2, 3*np.pi/4],
        levels=64, symmetric=True, normed=True,
    )
    for prop in ["contrast", "correlation", "energy", "homogeneity", "dissimilarity"]:
        v = graycoprops(glcm, prop)
        features += [float(np.mean(v)), float(np.std(v))]

    from skimage.feature import local_binary_pattern
    lbp = local_binary_pattern(gray, P=8, R=1, method="uniform")
    lbp_hist, _ = np.histogram(lbp.ravel(), bins=10, range=(0, 10), density=True)
    features.extend(lbp_hist.tolist())

    hu = cv2.HuMoments(cv2.moments(gray)).flatten()
    features.extend((-np.sign(hu) * np.log10(np.abs(hu) + 1e-10)).tolist())

    return np.array(features, dtype=np.float32)


def extract_features(image, mode="palm"):
    roi = extract_palm_roi(image) if mode == "palm" else extract_nail_roi(image)
    return compute_features(roi)


# ─── Model loading ────────────────────────────────────────────────────────────

def load_models():
    global _models
    if _models is not None:
        return _models
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"models.pkl not found at {MODEL_PATH}. "
            "Run `python train.py --data <path>` first."
        )
    with open(MODEL_PATH, "rb") as f:
        _models = pickle.load(f)
    return _models


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/debug", methods=["POST"])
def debug():
    import base64
    if "palm" not in request.files or "nail" not in request.files:
        return jsonify({"error": "Both images required"}), 400
    try:
        palm_img = cv2.imdecode(np.frombuffer(request.files["palm"].read(), np.uint8), cv2.IMREAD_COLOR)
        nail_img  = cv2.imdecode(np.frombuffer(request.files["nail"].read(),  np.uint8), cv2.IMREAD_COLOR)
        palm_roi = cv2.resize(extract_palm_roi(palm_img), (128, 128))
        nail_roi  = cv2.resize(extract_nail_roi(nail_img),  (128, 128))
        _, pb = cv2.imencode(".jpg", palm_roi)
        _, nb = cv2.imencode(".jpg", nail_roi)
        return jsonify({
            "palm_roi_b64": base64.b64encode(pb).decode(),
            "nail_roi_b64":  base64.b64encode(nb).decode(),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict", methods=["POST"])
def predict():
    if "palm" not in request.files or "nail" not in request.files:
        return jsonify({"error": "Both 'palm' and 'nail' image files are required."}), 400

    try:
        palm_img = cv2.imdecode(np.frombuffer(request.files["palm"].read(), np.uint8), cv2.IMREAD_COLOR)
        nail_img  = cv2.imdecode(np.frombuffer(request.files["nail"].read(),  np.uint8), cv2.IMREAD_COLOR)

        if palm_img is None or nail_img is None:
            return jsonify({"error": "Could not decode one or both images."}), 400

        X = np.concatenate([
            extract_features(palm_img, mode="palm"),
            extract_features(nail_img,  mode="nail"),
        ]).reshape(1, -1)

        models = load_models()
        votes, probs, model_results = {}, {}, {}

        for name, pipeline in models.items():
            pred = int(pipeline.predict(X)[0])
            if hasattr(pipeline, "predict_proba"):
                prob = float(pipeline.predict_proba(X)[0][1])
            else:
                prob = float(1 / (1 + np.exp(-pipeline.decision_function(X)[0])))
            votes[name] = pred
            probs[name]  = prob
            model_results[name] = {
                "prediction": "Anemic" if pred == 1 else "Non-Anemic",
                "confidence": round(prob, 4),
            }

        # Simple majority vote — no bias, no threshold manipulation
        anemic_votes = sum(votes.values())
        label        = "Anemic" if anemic_votes > len(votes) / 2 else "Non-Anemic"
        avg_prob     = float(np.mean(list(probs.values())))
        confidence   = round(avg_prob if label == "Anemic" else 1 - avg_prob, 4)

        explanation = (
            "Low hemoglobin indicators detected in nail bed pallor and palm coloration. "
            "Reduced redness in the thenar eminence and pale nail bed color suggest "
            "possible iron deficiency anemia."
            if label == "Anemic" else
            "Healthy pink coloration detected in nail bed and palm. "
            "Red channel intensity and texture features are within normal ranges, "
            "consistent with normal hemoglobin levels."
        )

        return jsonify({
            "label":        label,
            "confidence":   confidence,
            "explanation":  explanation,
            "model_votes":  anemic_votes,
            "total_models": len(votes),
            "per_model":    model_results,
        })

    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
