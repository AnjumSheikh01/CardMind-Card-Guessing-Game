import { useEffect, useMemo, useState } from 'react';

const RANKS = [
  { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 },
  { label: '5', value: 5 }, { label: '6', value: 6 }, { label: '7', value: 7 },
  { label: '8', value: 8 }, { label: '9', value: 9 }, { label: '10', value: 10 },
  { label: 'J', value: 11 }, { label: 'Q', value: 12 }, { label: 'K', value: 13 },
  { label: 'A', value: 14 },
];

const SUITS = [
  { id: 'spades', label: 'Spades', symbol: '♠', color: 'ink' },
  { id: 'hearts', label: 'Hearts', symbol: '♥', color: 'rose' },
  { id: 'clubs', label: 'Clubs', symbol: '♣', color: 'ink' },
  { id: 'diamonds', label: 'Diamonds', symbol: '♦', color: 'rose' },
];

const DIFFICULTIES = {
  casual: { label: 'Casual', attempts: 8, reward: 80, detail: '8 guesses · warm-up mode' },
  sharp: { label: 'Sharp', attempts: 6, reward: 140, detail: '6 guesses · balanced play' },
  mastermind: { label: 'Mastermind', attempts: 4, reward: 220, detail: '4 guesses · no room to drift' },
};

const DEFAULT_STATS = { wins: 0, rounds: 0, losses: 0, bestRound: 0, totalPoints: 0 };
const STATS_KEY = 'cardmind-stats-v1';

function makeDeck() {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({
    id: `${rank.label}-${suit.id}`,
    rank: rank.label,
    rankValue: rank.value,
    suit: suit.id,
    suitLabel: suit.label,
    symbol: suit.symbol,
    color: suit.color,
  })));
}

function drawCard(exceptId = null) {
  const deck = makeDeck().filter((card) => card.id !== exceptId);
  return deck[Math.floor(Math.random() * deck.length)];
}

function readStats() {
  try {
    const stored = window.localStorage.getItem(STATS_KEY);
    return stored ? { ...DEFAULT_STATS, ...JSON.parse(stored) } : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

function CardFace({ card, hidden = false, small = false }) {
  if (hidden) {
    return (
      <div className={`playing-card card-back ${small ? 'card-small' : ''}`} aria-label="Hidden mystery card">
        <div className="card-back-frame">
          <span className="back-star">✳</span>
          <span className="back-mark">CM</span>
          <span className="back-star">✳</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`playing-card card-face ${card.color === 'rose' ? 'red-suit' : ''} ${small ? 'card-small' : ''}`} aria-label={`${card.rank} of ${card.suitLabel}`}>
      <div className="card-corner card-corner-top"><strong>{card.rank}</strong><span>{card.symbol}</span></div>
      <div className="card-center-suit">{card.symbol}</div>
      <div className="card-corner card-corner-bottom"><strong>{card.rank}</strong><span>{card.symbol}</span></div>
    </div>
  );
}

function MiniIcon({ children, className = '' }) {
  return <span className={`mini-icon ${className}`} aria-hidden="true">{children}</span>;
}

export default function App() {
  const [difficulty, setDifficulty] = useState('sharp');
  const [target, setTarget] = useState(() => drawCard());
  const [selectedRank, setSelectedRank] = useState('7');
  const [selectedSuit, setSelectedSuit] = useState('hearts');
  const [guessesRemaining, setGuessesRemaining] = useState(DIFFICULTIES.sharp.attempts);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('playing');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState({ type: 'ready', title: 'Your read is on the table', body: 'Choose a rank and suit, then lock in your guess.' });
  const [stats, setStats] = useState(readStats);

  const attemptedIds = useMemo(() => new Set(history.map((item) => item.card.id)), [history]);
  const attemptsUsed = DIFFICULTIES[difficulty].attempts - guessesRemaining;
  const progress = (attemptsUsed / DIFFICULTIES[difficulty].attempts) * 100;

  useEffect(() => {
    try {
      window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // The game still works when browser storage is unavailable.
    }
  }, [stats]);

  function startRound(nextDifficulty = difficulty) {
    setDifficulty(nextDifficulty);
    setTarget((current) => drawCard(current?.id));
    setSelectedRank('7');
    setSelectedSuit('hearts');
    setGuessesRemaining(DIFFICULTIES[nextDifficulty].attempts);
    setHistory([]);
    setStatus('playing');
    setFeedback({ type: 'ready', title: 'New round. Trust your logic.', body: 'Read the clues carefully and narrow the deck down.' });
  }

  function submitGuess(event) {
    event?.preventDefault();
    if (status !== 'playing') return;

    const rank = RANKS.find((item) => item.label === selectedRank);
    const suit = SUITS.find((item) => item.id === selectedSuit);
    const guess = {
      id: `${rank.label}-${suit.id}`,
      rank: rank.label,
      rankValue: rank.value,
      suit: suit.id,
      suitLabel: suit.label,
      symbol: suit.symbol,
      color: suit.color,
    };

    if (attemptedIds.has(guess.id)) {
      setFeedback({ type: 'warning', title: 'That card is already on your trail', body: 'Pick a different card — repeating a guess will not use an attempt.' });
      return;
    }

    const attemptNumber = DIFFICULTIES[difficulty].attempts - guessesRemaining + 1;
    const newRemaining = guessesRemaining - 1;
    const isRankMatch = guess.rankValue === target.rankValue;
    const isSuitMatch = guess.suit === target.suit;
    const isWin = isRankMatch && isSuitMatch;
    let clue;
    let clueType = 'miss';

    if (isWin) {
      const pointsEarned = DIFFICULTIES[difficulty].reward + newRemaining * 25;
      clue = `Exact match. +${pointsEarned} points`;
      clueType = 'win';
      setGuessesRemaining(newRemaining);
      setHistory((old) => [{ card: guess, clue, clueType, attempt: attemptNumber }, ...old]);
      setStatus('won');
      setScore((old) => old + pointsEarned);
      setStreak((old) => old + 1);
      setFeedback({ type: 'win', title: 'Read perfectly.', body: `You found the ${target.rank} of ${target.suitLabel.toLowerCase()} in ${attemptNumber} ${attemptNumber === 1 ? 'guess' : 'guesses'}.` });
      setStats((old) => ({
        ...old,
        wins: old.wins + 1,
        rounds: old.rounds + 1,
        bestRound: Math.max(old.bestRound, pointsEarned),
        totalPoints: old.totalPoints + pointsEarned,
      }));
      return;
    }

    const rankHint = guess.rankValue < target.rankValue
      ? `Go higher than ${guess.rank}.`
      : guess.rankValue > target.rankValue
        ? `Go lower than ${guess.rank}.`
        : 'Rank match — now find the suit.';
    const suitHint = isSuitMatch ? 'The suit is correct.' : 'Different suit.';
    clue = `${rankHint} ${suitHint}`;

    setGuessesRemaining(newRemaining);
    if (newRemaining <= 0) {
      clue = `${rankHint} ${suitHint} Round over.`;
      setHistory((old) => [{ card: guess, clue, clueType: 'miss', attempt: attemptNumber }, ...old]);
      setStatus('lost');
      setStreak(0);
      setFeedback({ type: 'loss', title: 'The card slipped away.', body: `The hidden card was ${target.rank} of ${target.suitLabel.toLowerCase()}. Reset and take another run.` });
      setStats((old) => ({ ...old, rounds: old.rounds + 1, losses: old.losses + 1 }));
    } else {
      setHistory((old) => [{ card: guess, clue, clueType: 'miss', attempt: attemptNumber }, ...old]);
      setFeedback({ type: 'clue', title: rankHint, body: `${suitHint} ${newRemaining} ${newRemaining === 1 ? 'guess' : 'guesses'} left.` });
    }
  }

  const isRoundOver = status !== 'playing';

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CardMind home" id="top">
          <span className="brand-mark"><span>♠</span><span>♦</span></span>
          <span className="brand-copy"><strong>CARDMIND</strong><small>THE MYSTERY CARD CHALLENGE</small></span>
        </a>
        <div className="topbar-right">
          <span className="status-dot" />
          <span className="live-label">LOGIC ARCADE</span>
          <span className="edition-tag">GAME 03 <b>↗</b></span>
        </div>
      </header>

      <main className="page-wrap">
        <section className="hero-row">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> THINK SHARP. GUESS SMART.</div>
            <h1>A card is hiding.<br /><span>Can you read the clues?</span></h1>
            <p className="hero-description">One mystery card. A handful of guesses. Use rank and suit clues to find the exact match before the deck beats you.</p>
            <div className="hero-meta">
              <span><MiniIcon>✳</MiniIcon> 52-card deck</span>
              <i />
              <span><MiniIcon>⌁</MiniIcon> Logic-first gameplay</span>
            </div>
          </div>
          <div className="hero-stats-card">
            <div className="mini-stat-top"><span className="tiny-label">YOUR SESSION</span><span className="session-chip"><span /> IN PLAY</span></div>
            <div className="session-score"><span>{score.toLocaleString('en-IN')}</span><small>PTS</small></div>
            <div className="hero-stats-bottom">
              <div><span className="tiny-label">CURRENT STREAK</span><strong><span className="flame">✦</span> {streak}</strong></div>
              <div className="stat-divider" />
              <div><span className="tiny-label">BEST ROUND</span><strong>{stats.bestRound.toLocaleString('en-IN')} <small>pts</small></strong></div>
            </div>
            <div className="score-glow" />
          </div>
        </section>

        <section className="game-layout">
          <div className="game-main-column">
            <section className="panel mystery-panel">
              <div className="panel-heading">
                <div><span className="section-kicker">01 / THE DRAW</span><h2>The mystery card</h2></div>
                <span className={`round-badge ${isRoundOver ? 'round-complete' : ''}`}><span /> {isRoundOver ? 'ROUND COMPLETE' : 'CARD FACE DOWN'}</span>
              </div>
              <div className="mystery-stage">
                <div className="orbit orbit-a" /><div className="orbit orbit-b" />
                <div className={`card-stage-card ${isRoundOver ? 'revealed' : ''}`} key={`${target.id}-${status}`}>
                  <CardFace card={target} hidden={!isRoundOver} />
                </div>
                <div className="stage-caption">
                  <span className="tiny-label">{status === 'won' ? 'YOU FOUND IT' : status === 'lost' ? 'THE ANSWER WAS' : 'TARGET LOCKED'}</span>
                  <strong>{status === 'won' ? 'A perfect read.' : status === 'lost' ? `${target.rank} of ${target.suitLabel}` : 'Unknown. For now.'}</strong>
                  <small>{status === 'playing' ? 'The deck is not giving anything away.' : status === 'won' ? 'The deck has been decoded.' : 'Every miss is a lesson for next round.'}</small>
                </div>
                <div className="stage-index"><span>ROUND</span><strong>{String(stats.rounds + (status === 'playing' ? 1 : 0)).padStart(2, '0')}</strong></div>
              </div>
              <div className="attempt-track-row">
                <div className="attempt-label"><span className="tiny-label">GUESSES REMAINING</span><strong>{guessesRemaining}<small> / {DIFFICULTIES[difficulty].attempts}</small></strong></div>
                <div className="attempt-track" aria-label={`${guessesRemaining} guesses remaining`}>{Array.from({ length: DIFFICULTIES[difficulty].attempts }, (_, i) => <span key={i} className={i < guessesRemaining ? 'attempt-active' : 'attempt-used'} />)}</div>
                <span className="attempt-note">{guessesRemaining === 1 ? 'Last chance' : status === 'playing' ? 'Stay focused' : 'Round ended'}</span>
              </div>
            </section>

            <section className={`panel guess-panel ${isRoundOver ? 'guess-panel-disabled' : ''}`}>
              <div className="panel-heading guess-heading">
                <div><span className="section-kicker">02 / MAKE YOUR MOVE</span><h2>Build your guess</h2></div>
                <span className="guess-step">RANK <b>+</b> SUIT</span>
              </div>
              <form onSubmit={submitGuess}>
                <div className="control-group">
                  <div className="control-title"><span className="control-number">A</span><div><strong>Choose a rank</strong><small>Low to high · Ace is high</small></div></div>
                  <div className="rank-grid" role="group" aria-label="Choose card rank">
                    {RANKS.map((rank) => <button key={rank.label} type="button" className={`rank-button ${selectedRank === rank.label ? 'selected' : ''}`} onClick={() => setSelectedRank(rank.label)} disabled={isRoundOver} aria-pressed={selectedRank === rank.label}>{rank.label}</button>)}
                  </div>
                </div>
                <div className="control-group suit-control-group">
                  <div className="control-title"><span className="control-number">B</span><div><strong>Choose a suit</strong><small>One of four suits in the deck</small></div></div>
                  <div className="suit-grid" role="group" aria-label="Choose card suit">
                    {SUITS.map((suit) => <button key={suit.id} type="button" className={`suit-button ${suit.color === 'rose' ? 'suit-red' : ''} ${selectedSuit === suit.id ? 'selected' : ''}`} onClick={() => setSelectedSuit(suit.id)} disabled={isRoundOver} aria-pressed={selectedSuit === suit.id}><span className="suit-glyph">{suit.symbol}</span><span>{suit.label}</span>{selectedSuit === suit.id && <span className="suit-check">✓</span>}</button>)}
                  </div>
                </div>
                <div className="guess-footer">
                  <div className="guess-summary"><span className="tiny-label">YOUR PICK</span><div className="guess-pick"><CardFace card={{ ...RANKS.find((r) => r.label === selectedRank), ...SUITS.find((s) => s.id === selectedSuit), rank: selectedRank, suitLabel: SUITS.find((s) => s.id === selectedSuit).label }} small /><span><strong>{selectedRank} of {SUITS.find((s) => s.id === selectedSuit).label}</strong><small>Lock your card in?</small></span></div></div>
                  <button type="submit" className="submit-button" disabled={isRoundOver || guessesRemaining <= 0}><span>Lock in guess</span><b>↗</b></button>
                </div>
              </form>
              {isRoundOver && <div className="round-action-row"><p>{status === 'won' ? 'Nice read. Ready for another?' : 'Reset and put your clues to work.'}</p><button className="secondary-button" type="button" onClick={() => startRound()}>Play another round <span>↻</span></button></div>}
            </section>
          </div>

          <aside className="side-column">
            <section className="panel difficulty-panel">
              <div className="panel-heading compact-heading"><div><span className="section-kicker">GAME SETTINGS</span><h2>Set your pace</h2></div><MiniIcon>☷</MiniIcon></div>
              <div className="difficulty-options">
                {Object.entries(DIFFICULTIES).map(([key, config], index) => <button key={key} className={`difficulty-option ${difficulty === key ? 'active' : ''}`} type="button" onClick={() => startRound(key)}><span className="difficulty-number">0{index + 1}</span><span className="difficulty-copy"><strong>{config.label}</strong><small>{config.detail}</small></span><span className="difficulty-radio">{difficulty === key ? '●' : '○'}</span></button>)}
              </div>
              <div className="difficulty-tip"><MiniIcon>✦</MiniIcon><p><strong>Quick tip</strong><br />Rank clues work like hot and cold. Use each guess to narrow your next move.</p></div>
            </section>

            <section className={`panel feedback-panel feedback-${feedback.type}`} aria-live="polite">
              <div className="panel-heading compact-heading"><div><span className="section-kicker">LIVE READOUT</span><h2>Clue desk</h2></div><span className="pulse-symbol">⌁</span></div>
              <div className="feedback-content"><span className="feedback-icon">{feedback.type === 'win' ? '✦' : feedback.type === 'loss' ? '↯' : feedback.type === 'warning' ? '!' : feedback.type === 'clue' ? '↗' : '◎'}</span><div><strong>{feedback.title}</strong><p>{feedback.body}</p></div></div>
              <div className="feedback-rule"><span /> CLUES UPDATE AFTER EVERY GUESS</div>
            </section>

            <section className="panel trail-panel">
              <div className="panel-heading compact-heading"><div><span className="section-kicker">YOUR PAPER TRAIL</span><h2>Recent guesses <span className="count-pill">{history.length}</span></h2></div><span className="trail-icon">⌁</span></div>
              {history.length === 0 ? <div className="empty-trail"><div className="empty-card-stack"><span>♠</span><span>?</span></div><strong>No guesses yet</strong><p>Your first move will show up here, along with the clue it revealed.</p></div> : <div className="guess-history">{history.map((item) => <div className="history-item" key={`${item.card.id}-${item.attempt}`}><CardFace card={item.card} small /><div className="history-info"><div><strong className={item.card.color === 'rose' ? 'text-rose' : ''}>{item.card.rank} of {item.card.suitLabel}</strong><span>GUESS {String(item.attempt).padStart(2, '0')}</span></div><p className={item.clueType === 'win' ? 'history-win' : ''}>{item.clue}</p></div>{item.clueType === 'win' ? <span className="history-status win-mark">✓</span> : <span className="history-status">↗</span>}</div>)}</div>}
            </section>
          </aside>
        </section>

        <section className="bottom-stats-grid">
          <div className="bottom-stat-card"><span className="bottom-stat-icon purple-icon">♛</span><div><small>ROUNDS PLAYED</small><strong>{stats.rounds}</strong><p>Every round makes you sharper.</p></div><span className="stat-card-mark">01</span></div>
          <div className="bottom-stat-card"><span className="bottom-stat-icon mint-icon">✓</span><div><small>CARDS FOUND</small><strong>{stats.wins}</strong><p>{stats.rounds ? `${Math.round((stats.wins / stats.rounds) * 100)}% win rate so far.` : 'Your first win is waiting.'}</p></div><span className="stat-card-mark">02</span></div>
          <div className="bottom-stat-card"><span className="bottom-stat-icon rose-icon">↗</span><div><small>TOTAL POINTS</small><strong>{stats.totalPoints.toLocaleString('en-IN')}</strong><p>Points earned across winning rounds.</p></div><span className="stat-card-mark">03</span></div>
        </section>
      </main>

      <footer className="site-footer"><div className="footer-brand"><span className="footer-mark">♠</span> CARDMIND <span className="footer-divider">/</span> A LITTLE GAME OF LOGIC</div><div className="footer-right"><span>MADE TO THINK DIFFERENTLY</span><span className="footer-dot">✦</span><span>NO LUCK REQUIRED. WELL, ALMOST.</span></div></footer>
    </div>
  );
}
