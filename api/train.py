"""
train.py — Train all 5 models and save to models.pkl.

Usage:
    python train.py --data "C:/path/to/Dataset"

Dataset folder structure:
    Dataset/
    ├── Anemic Palm Images/    <- extreme close-up palm skin (no background)
    ├── Anemic nail/           <- close-up fingertip nail (no background)
    ├── Non Anemic Palm/
    └── Non Anemic nail/

Feature extraction here is IDENTICAL to compute_features() in app.py.
Training images are already close-ups so no ROI crop is needed.
At inference, app.py crops the ROI first to produce the same close-up style,
then runs the same compute_features pipeline.
"""

import os
import argparse
import pickle
import numpy as np
import cv2
from tqdm import tqdm
from scipy.stats import skew

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split, cross_validate, StratifiedKFold
from sklearn.metrics import accuracy_score, f1_score


# ─── Feature extraction — MUST stay identical to compute_features() in app.py ─

def apply_clahe(image):
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    return cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2BGR)


def compute_features(image):
    """
    78-dim feature vector from a 128x128 close-up image.
    Identical to compute_features() in app.py.
    """
    image = cv2.resize(image, (128, 128))
    image = apply_clahe(image)
    features = []

    # Color stats: mean, std, skew — BGR(9) + HSV(9) + LAB(9) = 27
    for space in [image,
                  cv2.cvtColor(image, cv2.COLOR_BGR2HSV),
                  cv2.cvtColor(image, cv2.COLOR_BGR2LAB)]:
        for ch in cv2.split(space):
            features += [float(np.mean(ch)), float(np.std(ch)), float(skew(ch.flatten()))]

    # HSV histogram 8 bins x 3 channels = 24
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    for i in range(3):
        h = cv2.calcHist([hsv], [i], None, [8], [0, 256]).flatten()
        features.extend((h / (h.sum() + 1e-7)).tolist())

    # GLCM texture: 5 props x 2 stats = 10
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

    # LBP histogram 10 bins
    from skimage.feature import local_binary_pattern
    lbp = local_binary_pattern(gray, P=8, R=1, method="uniform")
    lbp_hist, _ = np.histogram(lbp.ravel(), bins=10, range=(0, 10), density=True)
    features.extend(lbp_hist.tolist())

    # Hu moments 7
    hu = cv2.HuMoments(cv2.moments(gray)).flatten()
    features.extend((-np.sign(hu) * np.log10(np.abs(hu) + 1e-10)).tolist())

    return np.array(features, dtype=np.float32)  # 78-dim


# ─── Dataset loading ──────────────────────────────────────────────────────────

def load_data(base_path):
    config = {
        "anemic":     ("Anemic Palm Images", "Anemic nail"),
        "non_anemic": ("Non Anemic Palm",    "Non Anemic nail"),
    }
    X, y = [], []
    for label_name, (palm_dir, nail_dir) in config.items():
        label     = 1 if label_name == "anemic" else 0
        palm_path = os.path.join(base_path, palm_dir)
        nail_path = os.path.join(base_path, nail_dir)
        pf = sorted(os.listdir(palm_path))
        nf = sorted(os.listdir(nail_path))
        n  = min(len(pf), len(nf))
        print(f"Loading {label_name}: {n} pairs")
        for i in tqdm(range(n)):
            p  = cv2.imread(os.path.join(palm_path, pf[i]))
            n1 = cv2.imread(os.path.join(nail_path, nf[i]))
            if p is None or n1 is None:
                continue
            # Dataset images are already close-ups — compute features directly
            X.append(np.concatenate([compute_features(p), compute_features(n1)]))
            y.append(label)
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int32)


def balance_dataset(X, y):
    """Equal 50/50 split — no bias toward either class."""
    idx_anemic     = np.where(y == 1)[0]
    idx_non_anemic = np.where(y == 0)[0]
    rng = np.random.default_rng(42)
    n   = min(len(idx_anemic), len(idx_non_anemic))
    idx = np.concatenate([
        rng.choice(idx_anemic,     n, replace=False),
        rng.choice(idx_non_anemic, n, replace=False),
    ])
    rng.shuffle(idx)
    print(f"After balancing — Non-anemic: {n}, Anemic: {n}")
    return X[idx], y[idx]


# ─── Train ────────────────────────────────────────────────────────────────────

def train(data_path: str):
    print("Extracting features...")
    X, y = load_data(data_path)
    X, y = balance_dataset(X, y)
    print(f"Dataset shape: {X.shape} | Non-anemic: {np.sum(y==0)}, Anemic: {np.sum(y==1)}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model_defs = {
        "Logistic Regression": Pipeline([
            ("sc",  StandardScaler()),
            ("clf", LogisticRegression(max_iter=1000, C=0.1)),
        ]),
        "SVM (linear, C=0.1)": Pipeline([
            ("sc",  StandardScaler()),
            ("clf", SVC(kernel="linear", C=0.1, probability=True)),
        ]),
        "Random Forest": Pipeline([
            ("sc",  StandardScaler()),
            ("clf", RandomForestClassifier(n_estimators=200, max_depth=8,
                                           min_samples_leaf=4, random_state=42)),
        ]),
        "Decision Tree": Pipeline([
            ("sc",  StandardScaler()),
            ("clf", DecisionTreeClassifier(max_depth=6, min_samples_leaf=10,
                                           random_state=42)),
        ]),
        "KNN (k=11)": Pipeline([
            ("sc",  StandardScaler()),
            ("clf", KNeighborsClassifier(n_neighbors=11)),
        ]),
    }

    cv      = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scoring = {"accuracy": "accuracy", "f1_macro": "f1_macro"}

    print(f"\n{'Model':<28} {'CV Acc':>8} {'CV F1':>8}")
    print("=" * 48)

    trained_models = {}
    for name, pipe in model_defs.items():
        r   = cross_validate(pipe, X_train, y_train, cv=cv, scoring=scoring, n_jobs=-1)
        acc = r["test_accuracy"].mean()
        f1  = r["test_f1_macro"].mean()
        print(f"{name:<28} {acc:.3f}    {f1:.3f}")
        pipe.fit(X_train, y_train)
        trained_models[name] = pipe

    print("\n── Held-out test ──")
    for name, pipe in trained_models.items():
        preds = pipe.predict(X_test)
        print(f"  {name:<28} acc={accuracy_score(y_test, preds):.3f}  "
              f"f1={f1_score(y_test, preds, average='macro'):.3f}")

    out = os.path.join(os.path.dirname(__file__), "models.pkl")
    with open(out, "wb") as f:
        pickle.dump(trained_models, f)
    print(f"\n✓ Saved {len(trained_models)} models → {out}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="Path to Dataset folder")
    args = parser.parse_args()
    train(args.data)
