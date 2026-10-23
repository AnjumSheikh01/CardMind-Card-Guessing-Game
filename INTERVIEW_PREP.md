# CardMind — Interview Preparation

Use these answers as study notes, not as a script to memorize. Explain the implementation in your own words and be ready to open the code to demonstrate the behavior.

## A. Technical questions

### 1. How is the 52-card deck generated?
**Sample answer:** I store 13 ranks and four suits as small data arrays. `makeDeck()` uses `flatMap()` and `map()` to combine every rank with every suit, so the deck has 13 × 4 = 52 unique combinations without manually writing every card.

### 2. Why does each rank need a numeric value?
**Sample answer:** Card labels such as `J`, `Q`, `K`, and `A` are strings, so directly comparing them would not express rank order. I assign each rank a number from 2 to 14 and compare those values to determine the higher/lower hint.

### 3. How does the game decide what clue to show?
**Sample answer:** It compares the guess's numeric rank with the target rank. A lower guessed rank means the hidden rank is higher; a higher guessed rank means it is lower; equal rank tells the user the rank is correct. It separately compares suit IDs to say whether the suit matches.

### 4. What React state is needed for this game?
**Sample answer:** The main state includes the target card, selected rank and suit, guesses remaining, round history, game status, score, streak, current feedback, difficulty, and persistent statistics. Each one controls a different aspect of the UI or rules.

### 5. Why use state rather than ordinary variables?
**Sample answer:** When state changes, React can render the UI again so the attempt meter, history, score, and feedback stay in sync. Updating a normal local variable alone would not trigger a React render.

### 6. What is conditional rendering? Give an example from CardMind.
**Sample answer:** Conditional rendering displays different UI based on a value. While the round is active, the mystery card shows its back. After a win or loss, the target card is revealed and the round controls are disabled until a new round starts.

### 7. How are duplicate guesses handled?
**Sample answer:** A card has a stable ID made from the rank and suit. Before processing a guess, I check the current history for that ID. If it is already present, I show a warning and return early, so an attempt is not deducted.

### 8. How is the score calculated?
**Sample answer:** Each difficulty defines a base reward. On a correct guess, the game adds the base reward and a bonus based on how many guesses remain after that attempt. This makes quicker solutions worth more points and is easy to reason about and test.

### 9. What is `localStorage`, and why is it used here?
**Sample answer:** `localStorage` is browser storage that keeps small string values between page reloads. I serialize the statistics object with `JSON.stringify()` and restore it with `JSON.parse()` when the app starts. It is suitable for a personal, local game record, but it is not shared across devices.

### 10. Why wrap `localStorage` access in `try/catch`?
**Sample answer:** Browser storage can be unavailable or throw an error in some privacy or security configurations. Catching the error prevents persistence from breaking the core game. The game still works for the current session.

### 11. Why use `useMemo` for attempted card IDs?
**Sample answer:** It derives a Set of card IDs from the history and recalculates it when history changes. A Set makes membership checking straightforward. For a small history array, either approach would be fast; using a Set also expresses the goal clearly.

### 12. What are the limitations of this project?
**Sample answer:** It's single-player, and all data stays in the current browser. There is no online leaderboard, authentication, multiplayer or server validation. Those could be future additions, but aren't necessary to demonstrate the current game logic.

### 13. How would you test the game logic?
**Sample answer:** I would test deck size and uniqueness, directional rank clues, suit matching, exact matches, duplicate guesses, attempt exhaustion, score bonuses, difficulty resets, and persistence. The deck and clue rules are good candidates for isolated unit tests.

### 14. How would you improve random card selection?
**Sample answer:** `Math.random()` is enough for a casual game. I could inject a random-number function to make tests deterministic. If this were a security-sensitive application, I would use a cryptographically secure source, but a card guessing game doesn't need that level of randomness.

### 15. Why is the game a React application rather than only vanilla JavaScript?
**Sample answer:** React components separate controls and information panels, and state updates the UI whenever a guess changes the game. The project shows component-based UI structure and event-driven updates rather than manually changing many DOM nodes.

## B. JavaScript and React concepts to review

- `map()`, `flatMap()`, `filter()`, `find()`, and `Set`.
- Objects, arrays, destructuring, arrow functions, and template strings.
- Numeric comparisons and boolean conditions.
- React `useState`, `useEffect`, `useMemo`, event handlers, and list keys.
- Immutable array updates such as `[newItem, ...oldItems]`.
- `JSON.stringify()`, `JSON.parse()`, and browser `localStorage`.
- Conditional rendering and disabled controls.
- Responsive CSS Grid/Flexbox and accessible button states.

## C. Project-defense questions

### 1. What was the main challenge?
**Sample answer:** Coordinating the round status, remaining attempts, guess history, and hints so they update consistently. I had to consider the final incorrect guess and make sure a duplicate guess doesn't cost an attempt.

### 2. Why did you choose this project?
**Sample answer:** I wanted a project that demonstrates logic and interaction beyond a typical CRUD dashboard. It let me turn simple rules into a game loop and practice state transitions, comparison logic, and feedback design.

### 3. How do you know the game behaves correctly?
**Sample answer:** I use a manual test checklist that covers rank hints, suit hints, duplicate guesses, the win/loss boundaries, difficulty changes, and stored statistics. Before presenting it, I run each scenario locally and note any bugs found.

### 4. What would you add with another day?
**Sample answer:** I would extract deck and clue rules into a dedicated utility module, add unit tests for edge cases, and add a post-round review that explains the clues. Those changes would improve testability and the learning experience without expanding the scope too much.

## D. Behavioral questions

### 1. Tell me about a project you built independently.
Frame your answer around the problem, what you implemented, one technical decision, and what you learned. Be honest about the tools and guidance you used.

### 2. Describe a bug you had to debug.
Use a real bug you encountered. Explain the original behavior, how you reproduced it, what evidence helped you isolate the cause, and how you retested the fix. Don't invent a bug story.

### 3. How do you prioritize when you have limited time?
**Sample answer:** I define the smallest end-to-end version first: a complete game round, readable feedback, win/loss states, and basic persistence. I test the main flow before spending time on decorative improvements, then document what remains.

### 4. What did you learn from this project?
Mention specific concepts you can actually explain—such as state-driven rendering, numeric rank comparison, duplicate detection, or persistence—and give an example of where you used each one.

### 5. What would you do if a requirement changed late?
Clarify the required behavior, identify which state or rule would change, implement the smallest safe modification, and rerun the relevant tests. Avoid adding unrelated features during the final check.

## E. Honest resume bullet (use after local testing)

**CardMind — Mystery Card Challenge | React, JavaScript, CSS**  
Built a responsive single-player card-guessing game featuring three difficulty levels, rank/suit clue logic, duplicate-guess prevention, scoring, round history, and browser-persisted statistics.

Only include features you have run, tested, and can explain.
