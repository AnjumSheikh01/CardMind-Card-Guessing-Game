# CardMind — Mystery Card Challenge

CardMind is a browser-based card-guessing game built with React, JavaScript, CSS, and Vite. The player tries to identify one hidden card from a standard 52-card deck using rank and suit clues.

## Features

- 52-card deck generated in JavaScript from 13 ranks and four suits.
- Three difficulties: Casual (8 guesses), Sharp (6), and Mastermind (4).
- Pick a rank and suit to make each guess.
- Rank clues tell the player to go higher, go lower, or that the rank matches; a separate clue reports whether the suit is correct.
- Repeated guesses are rejected without using an attempt.
- Score rewards successful rounds and remaining guesses.
- Session score and current streak.
- Persistent wins, rounds, losses, total points, and best-round score using `localStorage`.
- Responsive custom UI with animated card styling and reduced-motion support.
- No account, backend, AI model, paid API, or external game service required.

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

Create a production build with:

```bash
npm run build
npm run preview
```

On Windows PowerShell, use `npm.cmd install`, `npm.cmd run dev`, and `npm.cmd run build` if PowerShell blocks `npm.ps1`.

## How to play

1. Choose a difficulty.
2. Select one rank and one suit.
3. Press **Lock in guess**.
4. Read the clues: rank direction and suit match.
5. Change the next guess using the clues. A duplicate guess is rejected without consuming an attempt.
6. Find the exact card before attempts run out to earn points. Start another round at any time after the current round ends.

Scoring is intentionally straightforward: each difficulty has a base reward, and extra points are awarded for unused guesses. The hidden card itself is selected randomly from the deck.

## Project structure

```text
cardmind/
├── index.html
├── package.json
├── README.md
├── PROJECT_JOURNAL.md
├── INTERVIEW_PREP.md
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Technical notes

- Game state (current target, selected guess, attempts, feedback, round history) is managed with React state.
- The deck is generated from rank and suit constants instead of maintaining 52 manually typed objects.
- The hint system compares numeric rank values and suit IDs.
- Persistent statistics are read from and written to `localStorage`; gameplay still works if storage is unavailable.
- The app is entirely client-side. It is intended as a portfolio learning project, not a secure competitive or multiplayer game.

## Manual test checklist

- [ ] A new round displays a hidden card until a win or loss.
- [ ] Each difficulty sets the correct number of attempts.
- [ ] A lower/higher rank guess returns the appropriate directional clue.
- [ ] A correct rank with a wrong suit gives the rank-match clue and says the suit differs.
- [ ] An exact card wins and reveals the card.
- [ ] A duplicate card guess does not consume an attempt.
- [ ] Using the final incorrect guess ends the round and reveals the card.
- [ ] New Round resets guesses and history and preserves lifetime stats.
- [ ] Refreshing the browser retains statistics.
- [ ] The app remains usable at mobile widths and with keyboard focus.

## Portfolio note

Personalize the styling, inspect each function, run the test checklist, and record any changes you make. Be ready to explain how the clues, attempt counter, scoring, and local persistence work. Do not claim multiplayer, online accounts, or server-backed storage; those are not implemented.
