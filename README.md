# ReadBright: Gamified Dyslexia Screening

<p align="center">
  <strong>An immersive, age-adapted magical adventure designed for early dyslexia identification.</strong>
</p>

---

## 🌟 Overview

ReadBright is a high-fidelity, mobile-first web application designed to screen children (ages 5–13) for early signs of dyslexia without the stress of traditional testing. Built upon the robust DIBELS 8th Edition framework, it disguises phonological awareness and decoding assessments as a premium, dark-fantasy adventure game. 

Rather than clinical, intimidating tests, children embark on an exciting journey through magical worlds, collecting rewards and awakening their reading "superpowers," all while generating accurate, actionable reporting for parents and educators.

## ✨ Key Features

- **Age-Adapted Challenge Tracks**: Dynamically calibrates content complexity, layout density, and pacing for three distinct age tracks: 5–8 years, 8–10 years, and 11–13 years.
- **Premium Dark Fantasy Aesthetic**: Replaces childish "cartoon" styles with an elegant, immersive world (resembling high-quality games like *Prodigy* or *Genshin Impact*) using rich glassmorphism UI, SVG iconography, and deep twilight themes.
- **Stress-Free Gamification**: Uses a hidden scoring mechanism. The child sees only positive reinforcement—Reading Stars, Story Gems, and Avatar Keys—while the accuracy metrics are kept strictly in the background.
- **Secure Parent Reporting**: Generates a clear, professional breakdown of metrics (LNF, PSF, NWF) directly to the parent, with clear disclaimers that the tool is for screening, not medical diagnosis.
- **Cross-Platform & Mobile-First**: Crafted from the ground up to support responsive touch inputs on iPads, Android tablets, and modern smartphones.

## 🔮 The Assessments (Mini-Games)

1. **Letter Park (LNF)**: Rapid Letter Naming. Tap specific letters as fast as possible to earn stars.
2. **Sound Tree (PSF)**: Phonemic Segmentation. Listen to a word and visually break it down into its constituent phonetic slots.
3. **Alien Words (NWF)**: Nonsense Word Fluency. Decode pseudo-words to test pure phonetic mapping without reliance on memorized vocabulary.

## 🛠️ Technology Stack

**Frontend**
- **HTML5/CSS3 (Vanilla)**: Utilizes modern CSS variables, CSS grid/flexbox, and advanced backdrop-filters for smooth glassmorphism.
- **JavaScript (ES6+)**: Custom SPA architecture. No heavy frontend frameworks required.

**Backend Architecture (Ready for Integration)**
- **Python (FastAPI)**: High-performance ASGI framework ready to handle secure user sessions and scoring persistence.
- **SQLite / PostgreSQL**: Relational database mapping using Pydantic models.

## 🚀 Quick Start

To run the ReadBright frontend locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/hrishibhalaria/readbright.git
   cd readbright
   ```

2. Start a static HTTP server in the project directory:
   ```bash
   npx serve ./readbright-screening
   ```
   *Alternatively, you can use Python:*
   ```bash
   cd readbright-screening
   python -m http.server 3000
   ```

3. Open your browser and navigate to `http://localhost:3000`.

## 📜 Privacy & Security (GDPR/DPDP Act)

ReadBright prioritizes child safety and data security. The app heavily incorporates mandatory verifiable parental consent flows before any data collection begins, strictly adhering to modern global data protection statutes (including COPPA, GDPR, and India's DPDP Act).

## 🤝 Contributing

Contributions are welcome! Please ensure any pull requests maintain the established premium, emoji-free aesthetic standards and prioritize performance and accessibility.

---
*Disclaimer: ReadBright is an educational screening tool and does not provide a formal medical diagnosis for dyslexia or any other learning disability.*
