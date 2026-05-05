# Pocket Uplift

Pocket Uplift is a lightweight, privacy-first wellbeing Progressive Web App (PWA) created as a Final Year Project artefact for a BSc Software Engineering project at the University of Roehampton.

The app helps students complete a short check-in and receive three simple, explainable micro-action recommendations that can be done in a few minutes. It is intentionally non-clinical, client-side only, and designed to be realistic for a final-year software engineering project.

Live site: https://andersonrgb.github.io/pocket-uplift/

Repository: https://github.com/AndersonRGB/pocket-uplift

---

## Project Purpose

Many students experience moments of low mood, low energy, stress, study pressure, tiredness, or lack of focus during the academic day. Pocket Uplift provides a small, low-friction way to pause, reflect, and choose a short supportive action.

The project is designed as a non-clinical wellbeing support tool. It does not diagnose, treat, monitor risk, or replace professional support. Instead, it provides gentle, evidence-informed micro-actions and clear signposting to wellbeing services.

---

## Core Features

- 30-second daily check-in using mood, energy, and stress sliders.
- Context selector for No preference, Study, Sleep, Social, and Outdoors.
- Rule-based Top 3 recommendation engine.
- Explainable recommendation cards with reason text and badges.
- Practical action instructions stored in a CSV dataset.
- Mark as done and Skip for now actions.
- Recent pattern/progress display.
- Local-only data storage using LocalStorage.
- Reset local data option.
- High contrast display option.
- Dyslexia-friendly font option.
- Support page with non-clinical signposting.
- Installable PWA with manifest and service worker.
- Basic offline support after first load.
- GitHub Pages deployment.

---

## Technology Stack

Pocket Uplift deliberately uses a simple static web stack:

- HTML
- CSS
- JavaScript
- CSV data file
- LocalStorage
- Web App Manifest
- Service Worker
- GitHub Pages

The project does not use:

- Backend server
- User accounts
- Authentication
- Cloud database
- Firebase
- Docker
- Machine learning
- Analytics or tracking
- Frontend frameworks such as React or Vue

This keeps the artefact simple, maintainable, privacy-focused, and easy to explain in an academic report.

---

## How The App Works

1. The user opens the app.
2. The user completes a short check-in using three sliders:
   - Mood
   - Energy
   - Stress
3. The user selects the situation that best matches their current context:
   - No preference
   - Study
   - Sleep
   - Social
   - Outdoors
4. The app loads micro-actions from `app/data/micro_actions.csv`.
5. The rule-based recommender scores the actions using the check-in values, context, tags, duration, and recent recommendation history.
6. The app displays the Top 3 recommended micro-actions.
7. The user can mark an action as done or skip it.
8. The app stores progress locally on the device using LocalStorage.

---

## Recommendation Logic

The recommendation system is rule-based and explainable. It does not use artificial intelligence or machine learning.

The scoring considers:

- Mood level
- Energy level
- Stress level
- Selected context
- Action duration
- Action tags
- Suitability for mood, energy, and stress
- Recent recommendations to reduce repetition

Example logic:

- If stress is high, short and calming actions are favoured.
- If energy is low, gentle reset actions are favoured.
- If mood is low, mood-lifting actions are favoured.
- If Study is selected, study-compatible actions score higher.
- If Outdoors is selected, outdoor actions score higher.
- Recently repeated actions are slightly reduced to improve variety.

Each recommendation card explains why the action was suggested using readable text and badges such as:

- Good for stress
- Energy boost
- Quiet
- Fits study
- Fits winding down
- Gentle mood lift

---

## Privacy By Design

Pocket Uplift is designed to be local-only and privacy-first.

- No login is required.
- No personal account is created.
- No backend server is used.
- No cloud database is used.
- No analytics or tracking is included.
- Check-in history is stored only in the browser's LocalStorage.
- Users can clear local app data from the interface.

This means data stays on the user's device unless they manually clear browser data or reset it inside the app.

---

## Non-Clinical Scope

Pocket Uplift is not a medical, clinical, diagnostic, or crisis-support product.

It does not:

- Diagnose mental health conditions.
- Provide treatment.
- Score mental health risk.
- Replace university, NHS, emergency, or professional support.

The Support page signposts users to appropriate services, including university wellbeing services, NHS 111, Samaritans, and emergency help.

---

## Accessibility

Accessibility was considered throughout the MVP implementation.

Current accessibility features include:

- Semantic HTML structure.
- Keyboard-accessible controls.
- Radio-style context selection behaviour.
- Visible focus states.
- High contrast display option.
- Dyslexia-friendly font option using system fonts.
- Readable typography and spacing.
- Clear button labels.
- Mobile-friendly tap targets.
- Strong colour contrast across primary UI elements.

---

## PWA Support

Pocket Uplift is installable as a Progressive Web App.

PWA files are located in:

```text
app/manifest.json
app/service-worker.js
app/assets/icons/icon-192.png
app/assets/icons/icon-512.png
```

The manifest defines:

- App name: Pocket Uplift
- Short name: Pocket Uplift
- Display mode: standalone
- Theme colour
- Background colour
- PWA icons
- Start URL
- Scope

The service worker caches the app shell and key assets so the app can load offline after it has been opened once.

---

## Project Structure

```text
pocket-uplift/
  app/
    index.html
    support.html
    styles.css
    app.js
    recommend.js
    storage.js
    ui.js
    manifest.json
    service-worker.js
    data/
      micro_actions.csv
    assets/
      brand/
        pocket-uplift-logo.png
      icons/
        icon-192.png
        icon-512.png

  docs/
    evidence/
      README.md
    workflow.md

  pwa/
    manifest.json
    service-worker.js

  tests/
    dev-server.js
    dev-server.ps1

  index.html
  README.md
  LICENSE
  CONTRIBUTING.md
```

---

## Important Files

| File | Purpose |
| --- | --- |
| `index.html` | Root GitHub Pages entry point that redirects to the app. |
| `app/index.html` | Main Pocket Uplift check-in interface. |
| `app/support.html` | Support and signposting page. |
| `app/styles.css` | Full responsive visual design and accessibility styling. |
| `app/app.js` | Main application behaviour and event handling. |
| `app/recommend.js` | Rule-based recommendation scoring logic. |
| `app/storage.js` | LocalStorage save, load, and reset functions. |
| `app/ui.js` | UI helper functions. |
| `app/data/micro_actions.csv` | Micro-action dataset used by the recommender. |
| `app/manifest.json` | Active PWA manifest used by GitHub Pages. |
| `app/service-worker.js` | Active service worker for offline support. |
| `docs/workflow.md` | Branching and contribution workflow notes. |
| `tests/dev-server.js` | Lightweight local development server. |

---

## Running Locally

From the project root:

```powershell
cd C:\Users\ander\Pocketuplift
```

Run the included local development server:

```powershell
node tests\dev-server.js 4173
```

Then open:

```text
http://127.0.0.1:4173/app/index.html
```

To test from a phone on the same Wi-Fi network, use the network URL printed by the dev server, for example:

```text
http://192.168.1.124:4173/app/index.html
```

Alternative PowerShell helper:

```powershell
.\tests\dev-server.ps1 -Port 4173
```

---

## GitHub Pages Deployment

The app is deployed using GitHub Pages.

Current public URL:

```text
https://andersonrgb.github.io/pocket-uplift/
```

GitHub Pages settings:

```text
Source: Deploy from a branch
Branch: feature/mvp-checkin
Folder: / root
```

For the final stable version, GitHub Pages should eventually be moved to:

```text
Branch: main
Folder: / root
```

The root `index.html` redirects users to:

```text
app/index.html
```

This keeps the app working correctly under the GitHub Pages project URL:

```text
https://andersonrgb.github.io/pocket-uplift/
```

---

## Branching Workflow

The repository follows this workflow:

```text
main = stable release branch
develop = integration branch
feature/* = development branches
```

Expected flow:

```text
feature/* -> pull request to develop
develop -> pull request to main for stable milestones only
```

Current MVP development branch:

```text
feature/mvp-checkin
```

Conventional commit examples:

```text
feat: add recommendation reason text
fix: prevent display options overlap
docs: update project README
chore: prepare app for github pages
```

---

## Manual Testing Checklist

Before considering the MVP complete, test the following:

| Area | Test | Expected Result |
| --- | --- | --- |
| Home page | Open the public GitHub Pages URL | App loads correctly. |
| Logo | View Home and Support pages | Same logo appears consistently. |
| Check-in | Move mood, energy, and stress sliders | Slider values update correctly. |
| Context | Select each context card | Selected state updates clearly. |
| Recommendations | Click Get top 3 suggestions | Three recommendations appear. |
| Explanations | Read recommendation cards | Each card explains why it was suggested. |
| Actions | Click Mark as done | Progress updates and action is saved. |
| Actions | Click Skip for now | Progress updates and action is saved. |
| Storage | Refresh the page | Local state persists. |
| Reset | Clear local data | Local history is removed after confirmation. |
| Display options | Toggle high contrast | High contrast style is applied and persists. |
| Display options | Toggle dyslexia-friendly font | Font and spacing visibly change and persist. |
| Support page | Click Wellbeing Support | Support page opens. |
| External links | Open support links | External websites open in a new tab. |
| Phone links | Tap phone numbers on mobile | Phone dialler opens. |
| PWA | Install app | Installed app uses Pocket Uplift name and icon. |
| Offline | Open app once, then test offline | Cached app shell loads. |
| Responsive | Test mobile, tablet, and desktop widths | Layout remains usable and readable. |

---

## Academic Relevance

Pocket Uplift demonstrates several software engineering and final-year project themes:

- User-centred design for a specific target group.
- Privacy-by-design architecture.
- Static PWA development.
- Client-side state management.
- Explainable rule-based recommendation logic.
- Accessibility-aware interface design.
- Ethical and non-clinical wellbeing positioning.
- Lightweight deployment using GitHub Pages.
- Maintainable modular JavaScript without unnecessary frameworks.

---

## Limitations

Current limitations include:

- Recommendations are rule-based and not personalised beyond the current check-in and local history.
- The micro-action dataset is small and curated manually.
- LocalStorage is device/browser-specific.
- There is no cross-device sync.
- There is no backend or account system by design.
- Offline support is basic and focused on the app shell.
- The app is not suitable for clinical, diagnostic, crisis, or emergency use.

---

## Future Improvements

Potential future improvements could include:

- More structured user evaluation with Roehampton students.
- Improved accessibility testing.
- More micro-actions based on research evidence.
- Better visual trend summaries.
- Exportable anonymous evaluation results for academic testing.
- More detailed offline fallback handling.
- Improved documentation of the recommendation scoring rules.

These should only be added if they remain aligned with the simple, privacy-first project scope.

---

## Author

Created by Anderson Ricardo Gomes Ballesteroz.

Contact: pocketuplift@gmail.com

---

## Licence

This project is provided for academic Final Year Project purposes. See `LICENSE` for licence details.
