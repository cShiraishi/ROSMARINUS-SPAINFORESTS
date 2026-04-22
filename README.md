# ROSMARINUS-SPAINFORESTS
**A Phytochemical Essential Oil Repository & Web Analytics Platform**

## Overview
ROSMARINUS-SPAINFORESTS is a high-performance web application designed to catalog the phytochemical profiles and geographical distribution of essential oils extracted from *Salvia rosmarinus* (Rosemary) populations across Spain.

This project has been migrated from Streamlit to a **Next.js 14+ / React / Tailwind CSS** architecture to provide a faster, more professional experience with 24/7 availability via GitHub Pages.

## ✨ Key Features

### 📍 Geographical Mapping
Interactive distribution map of 8 distinct sampling forests across Spain. Correlates phytochemical data with environmental factors like altitude and temperature.

### 🧪 Molecular Library
A searchable catalog of isolated volatiles with:
*   Dynamic structural visualization (SVGs).
*   Retention Time (Rt) metadata.
*   SMILES notation for chemoinformatics.

### 📊 Comparative Analytics
Visualize chemical richness per site and presence heatmaps of dominant compounds.

## 🚀 Development & Deployment

### Local Setup
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```

### GitHub Pages Deployment
This project is configured for static export. To deploy:
1.  Push changes to GitHub.
2.  The GitHub Action (if configured) will build and deploy to the `gh-pages` branch.
3.  Alternatively, run `npm run build` and upload the `out` directory.

## 🗃️ Data Sources
Raw Excel files are kept in the `data_source/` directory for reference. The application consumes pre-processed data for optimal performance.

---
*Created as part of an advanced biodiversity analysis and multivariate dashboard workflow.*
