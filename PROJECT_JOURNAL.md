# CardMind — Project Journal

## 1. Project overview

**Project name:** CardMind — Mystery Card Challenge  
**Category:** Browser game / JavaScript logic  
**Target user:** Anyone who wants a short, replayable deduction game  
**Main technologies:** React, JavaScript, CSS, Vite, browser `localStorage`  
**External services:** None required

CardMind is a single-player game in which the browser selects one card from a standard 52-card deck. The player selects a rank and suit for each guess. Feedback after an incorrect guess helps narrow the hidden card down.

## 2. Problem statement

Simple guessing games can be repetitive when they only say “correct” or “incorrect.” CardMind provides structured feedback for both rank and suit so each guess informs the next decision. Difficulty levels and an attempt counter give the player a clear challenge, while scores and statistics make repeat sessions more engaging.

## 3. Objectives

- Build a polished, responsive browser game using React.
- Use JavaScript comparisons to power real deduction mechanics.
- Represent a standard deck without manually writing 52 separate card objects.
- Demonstrate event handling, state transitions, conditional rendering, and derived values.
- Prevent duplicate guesses from wasting attempts.
- Save high-level gameplay statistics between visits.
- Keep the app self-contained, without AI APIs or a backend.

## 4. Requirements

### Functional requirements

1. Select between three difficulty levels.
2. Create a hidden target card randomly from 52 possible cards.
3. Let the player select one rank and one suit.
4. Compare each guess with the target and provide rank and suit clues.
5. Limit guesses according to the current difficulty.
6. End a round on an exact match or when guesses reach zero.
7. Award points for a win, with a bonus for remaining guesses.
8. Store lifetime rounds, wins, losses, total points, and best-round points in browser storage.
9. Start a new round without erasing lifetime statistics.

### Quality requirements

- Responsive layout across desktop and mobile viewports.
- Semantic buttons and visible keyboard focus.
- Clear active, disabled, win, loss, and feedback states.
- Graceful fallback if `localStorage` is unavailable.
- No API keys, accounts, or remote service dependencies.

## 5. Implementation notes

### Deck generation

The app defines 13 ranks with numeric values and four suits with identifiers and symbols. `makeDeck()` combines every rank with every suit, creating 13 × 4 = 52 distinct cards. `drawCard()` selects a random card from that deck. A round avoids drawing the exact same card as the immediately preceding target where possible.

### State model

React state tracks:

- `difficulty`: selected ruleset.
- `target`: hidden card for the current round.
- `selectedRank` and `selectedSuit`: current draft guess.
- `guessesRemaining`: number of attempts left.
- `history`: attempted cards and clues.
- `status`: `playing`, `won`, or `lost`.
- `score` and `streak`: current session values.
- `feedback`: the latest instructional or result message.
- `stats`: persistent summary statistics.

### Hint logic

Each rank has a numeric value from 2 through 14, with Ace high. For an incorrect guess, the game compares the guessed rank value with the target rank value. If the guess is lower, it tells the player to go higher; if higher, it tells the player to go lower; if the rank matches, it says to focus on the suit. The game separately tells the player whether the suit matches.

The feedback never explicitly identifies the hidden card during an active round.

### Duplicate guesses

Each card has a stable ID built from its rank and suit. Before processing a guess, the app checks whether that ID already exists in the round history. A repeated guess displays a warning but does not decrement the attempts counter.

### Scoring

Each difficulty has a base reward. A win adds that base reward plus a bonus for unused attempts. A lost round awards no points. This scoring rule is intentionally simple enough to explain and test.

### Persistence

The statistics object is serialized to `localStorage` under `cardmind-stats-v1`. It contains wins, rounds, losses, best single-round score, and total points. Current target and in-progress round history are not persisted, so refreshing starts a fresh in-memory round while prior statistics remain.

## 6. UI and visual design

- **Palette:** midnight violet, lavender, mint, and rose.
- **Hierarchy:** a concise game introduction, current score, central mystery-card stage, rank/suit controls, clue panel, and round history.
- **Interaction cues:** active rank and suit selections are visibly highlighted; guesses left are represented by segments; round end reveals the target.
- **Responsive behavior:** desktop uses a two-column game layout; narrower screens stack game and support panels.
- **Accessibility considerations:** native buttons, descriptive labels for selection groups, an `aria-live` feedback region, keyboard focus styles, and reduced-motion preferences.

## 7. Testing plan and results to record

Run these tests manually in the browser and record the actual outcome before publishing:

| Test | Expected result | Actual result |
|---|---|---|
| Load app | New round and hidden card appear | Pending local verification |
| Change difficulty | Attempts reset to 8, 6, or 4 | Pending local verification |
| Guess a rank lower than target | Directional “go higher” clue | Pending local verification |
| Guess a rank higher than target | Directional “go lower” clue | Pending local verification |
| Guess matching rank, wrong suit | Rank match and incorrect-suit clue | Pending local verification |
| Repeat a previous guess | Warning; no attempt consumed | Pending local verification |
| Guess exact card | Win, points, and target reveal | Pending local verification |
| Exhaust attempts | Loss and target reveal | Pending local verification |
| Start another round | New target, reset attempts and history | Pending local verification |
| Refresh browser | Statistics remain saved | Pending local verification |
| Mobile layout | Controls fit and remain usable | Pending local verification |

Do not mark the tests complete until you run them locally.

## 8. Challenges and learning outcomes

Potentially tricky parts are making all 52 card combinations unique, converting ranks into comparable values, ensuring the attempt counter reaches zero at exactly the right time, preventing duplicate attempts, and keeping the history and feedback synchronized after each guess. These are useful examples of translating rules into state transitions.

## 9. Limitations

- Single-player only; no leaderboard or multiplayer backend.
- Random selection is suitable for casual gameplay, not security-sensitive use.
- Statistics are saved only in the current browser and device.
- A refresh does not resume an in-progress round.
- Card design uses CSS and text symbols rather than a licensed image deck.

## 10. Future improvements

- Add unit tests for rank/suit comparison and scoring functions.
- Add a settings option for sound and reduced animation.
- Add a review screen that summarizes guesses after a completed round.
- Add offline support or a service worker.
- Add an optional challenge mode with a fixed seed for repeatable attempts.

## 11. Interview-ready explanation

“CardMind is a responsive React deduction game. I generate a deck from reusable rank and suit data, select a target card randomly, and compare each player guess against it. Rank comparisons drive directional hints, suit comparisons produce a separate clue, and the round ends on a match or when attempts reach zero. React state manages gameplay and `localStorage` saves cumulative statistics. The project helped me practice game state, conditional UI, derived values, and edge cases like duplicate guesses.”
