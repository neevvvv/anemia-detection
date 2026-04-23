# Anemia Detection System

An AI-powered health screening demo that analyzes palm and fingernail images to predict anemia status. Built with React + TypeScript + Vite, styled with Tailwind CSS.

> **Disclaimer:** This is a research demo for academic purposes only and is not a substitute for professional medical diagnosis.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

---

## AWS Amplify Deployment

### Option A — Amplify Hosting (Recommended)

1. Push this repository to GitHub / GitLab / Bitbucket.
2. Open [AWS Amplify Console](https://console.aws.amazon.com/amplify/).
3. Click **"New app" → "Host web app"** and connect your Git provider.
4. Select the repository and branch.
5. Amplify auto-detects the `amplify.yml` at the repo root — no manual configuration needed.
6. Click **"Save and deploy"**. Your app will be live at a generated `*.amplifyapp.com` URL.

### Option B — S3 + CloudFront (Manual)

```bash
npm run build          # produces dist/
aws s3 sync dist/ s3://<your-bucket> --delete
# Then invalidate CloudFront distribution if configured
```

---

## ML Models Used

The underlying research ensemble uses five classical machine learning classifiers trained on color and texture features extracted from palm and nail bed images:

| # | Model | Role |
|---|-------|------|
| 1 | **Decision Tree** | Fast, interpretable baseline classifier |
| 2 | **Random Forest** | Bagged ensemble; reduces overfitting |
| 3 | **K-Nearest Neighbors (KNN)** | Instance-based; captures local color patterns |
| 4 | **Logistic Regression** | Probabilistic linear classifier |
| 5 | **Support Vector Machine (SVM)** | Margin-maximizing classifier; handles high-dim features |

Majority voting across all five models produces the final **Anemic / Non-Anemic** prediction.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icon library
- **AWS Amplify Hosting** — deployment
