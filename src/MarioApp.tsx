import { useEffect, useMemo, useRef, useState } from 'react';
import { type Difficulty } from './mario/questions.ts';
import { getChampionshipResults, getPlayer, getResults, saveChampionshipResult, savePlayer, saveResult, type ChampionshipResult, type QuizResult } from './mario/storage.ts';
import { CHAMPIONSHIP_SIZES, championshipPoints, championshipRoundCount, computerChampionshipAnswers, createChampionshipRounds, type ChampionshipSize } from './mario/championship.ts';
import { BOOSTER_COURSES, BOOSTER_SOURCE } from './mario/courses.ts';
import { availableModes, createRounds, type GameMode, type GameRound, type Section } from './mario/rounds.ts';
import { advance, rewind, startSession, submit, type Answer, type GameSession } from './mario/session.ts';
import { advanceVersusQuiz, answerVersusQuiz, rewindVersusQuiz, startVersusQuiz, type VersusQuiz } from './mario/versus.ts';
import { getNextRank, getRank, MILESTONES, playerProgress } from './mario/scoring.ts';
import { availableVoices, getSpeechRate, getVoiceName, setSpeechRate, setVoiceName, speakText, speechAvailable, stopSpeaking } from './mario/tts.ts';

type Screen = 'home' | 'hub' | 'setup' | 'championship-setup' | 'championship-handover' | 'game' | 'result' | 'championship-result' | 'versus-game' | 'versus-result' | 'scores' | 'tracks' | 'explore';
type QuizFormat = 'solo' | 'two-player' | 'computer';
type ChampionshipRun = { id: string; size: ChampionshipSize; topic: Section; difficulty: Difficulty; modes: GameMode[]; index: number; legs: QuizResult[]; matchTimed: boolean; format: QuizFormat; opponent: string; turnIndex: 0 | 1; rounds: GameRound[]; computerAnswers: Answer[] };

const LABELS: Record<Section, string> = { mario: 'Mario games', kart: 'Mario Kart', mixed: 'A bit of both' };
const MODE_LABELS: Record<GameMode, string> = { quiz: 'Quiz Battle', 'game-order': 'Game Order', 'track-finder': 'Track Finder', 'match-hunt': 'Match & Hunt', 'clue-duel': 'Clue Duel', 'category-finder': 'Category Finder' };
const MODE_ICONS: Record<GameMode, string> = { quiz: '⚔️', 'game-order': '🔢', 'track-finder': '🔎', 'match-hunt': '🃏', 'clue-duel': '🕵️', 'category-finder': '🗂️' };
const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  quiz: 'Four-choice questions about characters, baddies, power-ups, games, consoles, tracks and famous fixed bugs.',
  'game-order': 'Put Mario games in release order.',
  'track-finder': 'Find a track from the named Mario Kart cup.',
  'match-hunt': 'Match names to clues and hunt for one special target. Three rounds.',
  'clue-duel': 'Guess a character or track from five clues that get clearer. Five rounds.',
  'category-finder': 'Find one friendly character, baddie, power-up, game or system in a numbered window.',
};
const DIFFICULTIES: Difficulty[] = ['explorer', 'scientist', 'professor'];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  explorer: 'Rookie',
  scientist: 'Pro',
  professor: 'Legend',
};
const LEARNING_TOPICS = [
  { icon: '👥', title: 'Characters & baddies' },
  { icon: '🍄', title: 'Power-ups & items' },
  { icon: '🎮', title: 'Games & consoles' },
  { icon: '🏁', title: 'Mario Kart tracks' },
] as const;
const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  explorer: 'Familiar favourites and smaller boards.',
  scientist: 'More to find and trickier questions.',
  professor: 'Biggest boards and the toughest challenges.',
};

export default function MarioApp() {
  const [player, setPlayer] = useState(getPlayer);
  const [draftName, setDraftName] = useState(player);
  const [draftOpponent, setDraftOpponent] = useState('Player 2');
  const [opponentName, setOpponentName] = useState('Player 2');
  const [quizFormat, setQuizFormat] = useState<QuizFormat>('solo');
  const [section, setSection] = useState<Section>('mixed');
  const [mode, setMode] = useState<GameMode>('quiz');
  const [difficulty, setDifficulty] = useState<Difficulty>('explorer');
  const [timed, setTimed] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');
  const [session, setSession] = useState<GameSession | null>(null);
  const [versus, setVersus] = useState<VersusQuiz | null>(null);
  const [versusReady, setVersusReady] = useState(false);
  const [orderDraft, setOrderDraft] = useState<string[]>([]);
  const [selectedOrderTile, setSelectedOrderTile] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [selectedMatchName, setSelectedMatchName] = useState<string | null>(null);
  const [selectedMatchClue, setSelectedMatchClue] = useState<string | null>(null);
  const [matchMessage, setMatchMessage] = useState('');
  const [clueIndex, setClueIndex] = useState(0);
  const [clueMessage, setClueMessage] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [latestResult, setLatestResult] = useState<QuizResult | null>(null);
  const [championshipSize, setChampionshipSize] = useState<ChampionshipSize>('standard');
  const [championshipModes, setChampionshipModes] = useState<GameMode[]>(Object.keys(MODE_LABELS) as GameMode[]);
  const [championshipMatchTimed, setChampionshipMatchTimed] = useState(false);
  const [championshipFormat, setChampionshipFormat] = useState<QuizFormat>('solo');
  const [championship, setChampionship] = useState<ChampionshipRun | null>(null);
  const [finishedChampionship, setFinishedChampionship] = useState<ChampionshipResult | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(getVoiceName);
  const [speechRate, setRate] = useState(getSpeechRate);
  const startTime = useRef(0);
  const previousRoundMs = useRef(0);

  useEffect(() => {
    if (screen !== 'game' || !timed) return;
    const id = window.setInterval(() => setElapsedMs(previousRoundMs.current + Date.now() - startTime.current), 100);
    return () => window.clearInterval(id);
  }, [screen, timed]);

  useEffect(() => {
    const load = () => setVoices(availableVoices());
    load();
    if (!speechAvailable()) return;
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  useEffect(() => {
    stopSpeaking();
  }, [screen, session?.index, session?.submission, versus?.index, versus?.submission]);

  const round = session && !session.complete ? session.rounds[session.index] : null;
  const versusTurn = versus && !versus.complete ? versus.turns[versus.index] : null;
  const scores = useMemo(() => getResults().sort((a, b) => Math.max(b.points ?? b.correct, b.opponentPoints ?? b.opponentCorrect ?? 0) - Math.max(a.points ?? a.correct, a.opponentPoints ?? a.opponentCorrect ?? 0) || a.elapsedMs - b.elapsedMs), [screen]);
  const progress = playerProgress(scores, player);
  const rank = getRank(progress.totalEP);
  const nextRank = getNextRank(progress.totalEP);
  const rankProgress = nextRank ? (progress.totalEP - rank.minEP) / (nextRank.minEP - rank.minEP) * 100 : 100;
  const homeTip = useMemo(() => 'Ready for a Mario challenge? Earn points, build a streak, and reach the next rank!', []);
  const championshipScores = useMemo(() => getChampionshipResults().sort((a, b) => b.points - a.points || a.completedAt.localeCompare(b.completedAt)), [screen]);
  const chosenChampionshipModes = (Object.keys(MODE_LABELS) as GameMode[]).filter(item => championshipModes.includes(item) && availableModes(section).includes(item));
  const championshipNames = championship ? [player, championship.opponent] : [player, opponentName];
  const championshipEarned = championship ? [championshipPoints(championship.legs.filter(leg => leg.player === player)), championshipPoints(championship.legs.filter(leg => leg.player === championship.opponent))] : [0, 0];
  const computerChampTurn = championship?.format === 'computer' && championship.turnIndex === 1;

  const openGame = (next: GameMode) => {
    setMode(next);
    if (!availableModes(section).includes(next)) setSection(next === 'game-order' || next === 'category-finder' ? 'mario' : 'kart');
    setScreen('setup');
  };

  const changeSection = (next: Section) => {
    setSection(next);
    if (!availableModes(next).includes(mode)) setMode('quiz');
  };

  const toggleChampionshipMode = (item: GameMode) => {
    setChampionshipModes(current => current.includes(item) ? current.filter(modeId => modeId !== item) : [...current, item]);
  };

  const prepareRound = (next: GameRound | undefined) => {
    setOrderDraft(next?.mode === 'game-order' ? next.tiles.map(tile => tile.id) : []);
    setSelectedOrderTile(null);
    setMatchedIds([]);
    setSelectedMatchName(null);
    setSelectedMatchClue(null);
    setMatchMessage('');
    setClueIndex(0);
    setClueMessage('');
  };

  const start = () => {
    const name = draftName.trim().slice(0, 24) || 'Player';
    savePlayer(name);
    setPlayer(name);
    setDraftName(name);
    if (mode === 'quiz' && quizFormat !== 'solo') {
      const other = quizFormat === 'computer' ? 'Computer' : draftOpponent.trim().slice(0, 24) || 'Player 2';
      setOpponentName(other);
      setVersus(startVersusQuiz(section, difficulty, quizFormat === 'computer' ? 'computer' : 'human'));
      setVersusReady(true);
      setLatestResult(null);
      startTime.current = Date.now();
      setScreen('versus-game');
      return;
    }
    const game = startSession(createRounds(mode, section, difficulty), difficulty);
    setSession(game);
    prepareRound(game.rounds[0]);
    setElapsedMs(0);
    setLatestResult(null);
    previousRoundMs.current = 0;
    startTime.current = Date.now();
    setScreen('game');
  };

  const prepareChampionshipTurn = (run: ChampionshipRun) => {
    const nextMode = run.modes[run.index];
    const rounds = run.turnIndex === 0 ? createChampionshipRounds(nextMode, run.topic, run.difficulty, run.size) : run.rounds;
    const ready = run.turnIndex === 0 ? { ...run, rounds, computerAnswers: run.format === 'computer' ? computerChampionshipAnswers(rounds, run.difficulty) : [] } : run;
    const game = startSession(rounds, run.difficulty);
    setChampionship(ready);
    setMode(nextMode);
    setTimed(nextMode === 'match-hunt' && run.matchTimed);
    setSession(game);
    prepareRound(game.rounds[0]);
    setElapsedMs(0);
    setLatestResult(null);
    previousRoundMs.current = 0;
    startTime.current = 0;
    setScreen(run.format === 'solo' ? 'game' : 'championship-handover');
    if (run.format === 'solo') startTime.current = Date.now();
  };

  const startChampionship = () => {
    if (chosenChampionshipModes.length < 2) return;
    const name = draftName.trim().slice(0, 24) || 'Player';
    savePlayer(name);
    setPlayer(name);
    setDraftName(name);
    const wantedOpponent = championshipFormat === 'computer' ? 'Computer' : draftOpponent.trim().slice(0, 24) || 'Player 2';
    const other = wantedOpponent.toLowerCase() === name.toLowerCase() ? `${wantedOpponent} 2` : wantedOpponent;
    setOpponentName(other);
    const run: ChampionshipRun = {
      id: crypto.randomUUID(), size: championshipSize, topic: section, difficulty,
      modes: chosenChampionshipModes, index: 0, legs: [], matchTimed: championshipMatchTimed,
      format: championshipFormat, opponent: other, turnIndex: 0, rounds: [], computerAnswers: [],
    };
    setFinishedChampionship(null);
    prepareChampionshipTurn(run);
  };

  const continueChampionship = () => {
    if (!championship || !latestResult) return;
    const legs = [...championship.legs, latestResult];
    if (championship.format !== 'solo' && championship.turnIndex === 0) {
      prepareChampionshipTurn({ ...championship, turnIndex: 1, legs });
      return;
    }
    if (championship.index + 1 < championship.modes.length) {
      prepareChampionshipTurn({ ...championship, index: championship.index + 1, turnIndex: 0, legs, rounds: [], computerAnswers: [] });
      return;
    }
    const playerLegs = legs.filter(leg => leg.player === player);
    const opponentLegs = legs.filter(leg => leg.player === championship.opponent);
    const completed: ChampionshipResult = {
      id: championship.id, player, topic: championship.topic, difficulty: championship.difficulty,
      size: championship.size,
      format: championship.format,
      games: playerLegs.map(leg => ({ mode: leg.mode!, correct: leg.correct, total: leg.total, points: leg.points ?? leg.correct })),
      points: championshipPoints(playerLegs),
      opponent: championship.format === 'solo' ? undefined : championship.opponent,
      opponentGames: championship.format === 'solo' ? undefined : opponentLegs.map(leg => ({ mode: leg.mode!, correct: leg.correct, total: leg.total, points: leg.points ?? leg.correct })),
      opponentPoints: championship.format === 'solo' ? undefined : championshipPoints(opponentLegs),
      completedAt: new Date().toISOString(),
    };
    saveChampionshipResult(completed);
    setFinishedChampionship(completed);
    setChampionship(null);
    setScreen('championship-result');
  };

  const next = () => {
    if (!session?.submission) return;
    const totalMs = previousRoundMs.current + Date.now() - startTime.current;
    const updated = advance(session);
    setSession(updated);
    prepareRound(updated.rounds[updated.index]);
    if (mode === 'match-hunt' && !updated.complete) {
      previousRoundMs.current = totalMs;
      startTime.current = Date.now();
    }
    if (!updated.complete) return;
    const result: QuizResult = {
      id: crypto.randomUUID(), mode, player: championship?.turnIndex === 1 ? championship.opponent : player, topic: championship?.topic ?? section, difficulty: championship?.difficulty ?? difficulty,
      correct: updated.correct, total: updated.rounds.length, points: updated.points, bestStreak: updated.bestStreak,
      elapsedMs: totalMs, completedAt: new Date().toISOString(),
    };
    saveResult(result);
    setLatestResult(result);
    setScreen('result');
  };

  const undo = () => {
    if (!session || !round) return;
    setSession(rewind(session));
    prepareRound(round);
    if (round.mode === 'match-hunt') {
      startTime.current = Date.now();
      setElapsedMs(previousRoundMs.current);
    }
  };

  const nextVersus = () => {
    if (!versus?.submission) return;
    const updated = advanceVersusQuiz(versus);
    setVersus(updated);
    if (!updated.complete) {
      setVersusReady(true);
      return;
    }
    const result: QuizResult = {
      id: crypto.randomUUID(), mode: 'quiz', player, topic: section, difficulty,
      correct: updated.scores[0], total: 5, opponent: opponentName,
      points: updated.points[0], bestStreak: updated.bestStreaks[0],
      opponentCorrect: updated.scores[1], opponentPoints: updated.points[1], opponentBestStreak: updated.bestStreaks[1], format: quizFormat,
      elapsedMs: Date.now() - startTime.current, completedAt: new Date().toISOString(),
    };
    saveResult(result);
    setLatestResult(result);
    setScreen('versus-result');
  };

  const leaveGame = () => {
    setChampionship(null);
    setScreen('hub');
  };

  const chooseMatch = (side: 'name' | 'clue', id: string) => {
    if (!session || round?.mode !== 'match-hunt' || session.submission || matchedIds.includes(id)) return;
    const name = side === 'name' ? id : selectedMatchName;
    const clue = side === 'clue' ? id : selectedMatchClue;
    if (!name || !clue) {
      if (side === 'name') setSelectedMatchName(id);
      else setSelectedMatchClue(id);
      setMatchMessage('');
      return;
    }
    setSelectedMatchName(null);
    setSelectedMatchClue(null);
    if (name !== clue) {
      setMatchMessage('Not a pair — try again.');
      return;
    }
    const nextMatched = [...matchedIds, id];
    setMatchedIds(nextMatched);
    setMatchMessage(id === round.targetId ? 'Target found!' : 'Pair matched!');
    if (nextMatched.length === round.pairs.length) setSession(submit(session, round.targetId));
  };

  const guessClue = (id: string) => {
    if (!session || round?.mode !== 'clue-duel' || session.submission) return;
    if (id === round.answerId || clueIndex === 4) {
      setSession(submit(session, id));
      return;
    }
    setClueIndex(current => current + 1);
    setClueMessage('Not yet — here is another clue.');
  };

  const swapOrderTile = (position: number) => {
    if (session?.submission) return;
    if (selectedOrderTile === null) {
      setSelectedOrderTile(position);
      return;
    }
    if (selectedOrderTile !== position) {
      setOrderDraft(current => {
        const next = [...current];
        [next[selectedOrderTile], next[position]] = [next[position], next[selectedOrderTile]];
        return next;
      });
    }
    setSelectedOrderTile(null);
  };

  return <main className="app mario-app">
    {screen === 'home' && <section className="home-screen">
      <div className="home-header">
        <h1 className="game-title" aria-label="Mushroom Power Quiz">{['Mushroom', 'Power', 'Quiz'].map(word => <span className="title-word" aria-hidden="true" key={word}>{Array.from(word).map((letter, index) => <span className="title-letter" key={index}>{letter}</span>)}</span>)}</h1>
        <p className="mario-tagline">Unofficial, text-only trivia about Mario games and Mario Kart tracks.</p>
        <p className="mario-home-tip">{homeTip}</p>
        {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read welcome aloud" aria-label="Read welcome aloud" onClick={() => speakText(homeTip)}>🔊</button>}
      </div>
      <div className="home-stats">
        <div className="player-header"><span className="player-greeting">Hi, {player || 'Player'}!</span><button className="switch-profile-btn" onClick={() => { const next = window.prompt('Player name', player || 'Player')?.trim().slice(0, 24); if (next) { savePlayer(next); setPlayer(next); setDraftName(next); } }}>👤 Switch</button></div>
        <div className="rank-display"><span className="rank-icon">{rank.icon}</span><span className="rank-name">{rank.name}</span></div>
        <div className="ep-display"><span className="ep-amount">{progress.totalEP} EP</span>{nextRank && <div className="ep-progress"><div className="ep-bar" style={{ width: `${rankProgress}%` }} /><span className="ep-next">{nextRank.minEP - progress.totalEP} EP to {nextRank.icon} {nextRank.name}</span></div>}</div>
        <div className="home-ministat"><span>🏆 {progress.gamesPlayed} games</span><span>🔥 Best streak: {progress.bestStreak}</span><button className="ministat-btn" aria-expanded={showMilestones} onClick={() => setShowMilestones(value => !value)}>🏅 {progress.milestones}/{progress.milestoneCount} milestones</button></div>
        {showMilestones && <div className="milestones-panel">{MILESTONES.map((milestone, index) => <div key={milestone.title} className={`milestone ${progress.milestoneUnlocks[index] ? 'milestone-done' : 'milestone-locked'}`}><span className="milestone-icon">{progress.milestoneUnlocks[index] ? milestone.icon : '🔒'}</span><div className="milestone-info"><span className="milestone-title">{milestone.title}</span><span className="milestone-desc">{milestone.description}</span></div></div>)}</div>}
      </div>
      <nav className="home-menu">
        <button className="menu-btn primary" onClick={() => setScreen('hub')}><span className="menu-icon">🎮</span><span><span className="menu-label">Play Games</span><span className="menu-desc">Choose a game, then pick your challenge.</span></span></button>
        <button className="menu-btn" aria-label="Explore Learning Zone" onClick={() => setScreen('explore')}><span className="menu-icon">🔍</span><span><span className="menu-label">Explore</span><span className="menu-desc">Visit the Learning Zone. Guides are being prepared.</span></span></button>
        <button className="menu-btn" onClick={() => setScreen('scores')}><span className="menu-icon">🏆</span><span><span className="menu-label">High Scores</span><span className="menu-desc">See your finished games.</span></span></button>
      </nav>
      <button className="voice-settings-toggle" onClick={() => setShowVoiceSettings(value => !value)} aria-expanded={showVoiceSettings}>⚙️ Voice Settings</button>
      {showVoiceSettings && <div className="voice-settings-panel"><h3>🔊 Voice Settings</h3>{speechAvailable() ? <><label className="voice-setting-label">Voice<select className="voice-select" value={selectedVoice} onChange={event => { setSelectedVoice(event.target.value); setVoiceName(event.target.value); }}><option value="">Browser default</option>{voices.map(voice => <option key={`${voice.name}-${voice.lang}`} value={voice.name}>{voice.name} ({voice.lang})</option>)}</select></label><label className="voice-setting-label">Speed: {speechRate.toFixed(1)}x<input className="voice-range" type="range" min="0.5" max="2" step="0.1" value={speechRate} onChange={event => { const rate = Number(event.target.value); setRate(rate); setSpeechRate(rate); }} /></label><button className="start-btn" onClick={() => speakText('Hello! Ready for a Mario challenge?')}>🔊 Test Voice</button></> : <p>Voice reading is not available in this browser.</p>}</div>}
    </section>}

    {screen === 'hub' && <section className="two-player-setup play-mode-hub">
      <button className="back-btn" onClick={() => setScreen('home')}>← Home</button>
      <h2 className="setup-title">🎮 Play Games</h2>
      <p className="hub-intro">Choose a game, then set your topic and level.</p>
      <div className="play-selection-heading"><h3>Choose a game</h3><button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button></div>
      <div className="game-mode-grid">{(Object.keys(MODE_LABELS) as GameMode[]).map(item => <button key={item} className="game-mode-btn" onClick={() => openGame(item)}><span className="gm-icon">{MODE_ICONS[item]}</span><span className="gm-name">{MODE_LABELS[item]}</span><span className="gm-desc">{MODE_DESCRIPTIONS[item]}</span></button>)}</div>
      <button className="game-mode-btn championship mario-champ-entry" onClick={() => setScreen('championship-setup')}><span className="gm-icon">🏆</span><span className="gm-name">Championship</span><span className="gm-desc">Play several games in a row. Every point adds to your total.</span></button>
    </section>}

    {screen === 'championship-setup' && <section className="two-player-setup mario-setup">
      <button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button>
      <h2 className="setup-title">🏆 {championshipFormat === 'solo' ? 'Solo' : championshipFormat === 'two-player' ? 'Two-Player' : 'Computer'} Championship</h2>
      <p className="setup-intro">Choose at least two games. Earn points in each game to build your championship total.</p>
      <fieldset><legend>Players</legend><div className="round-select">{(['solo', 'two-player', 'computer'] as QuizFormat[]).map(item => <button key={item} className={`round-btn ${championshipFormat === item ? 'selected' : ''}`} aria-pressed={championshipFormat === item} onClick={() => setChampionshipFormat(item)}>{item === 'solo' ? 'Solo' : item === 'two-player' ? 'Two Players' : 'Play Computer'}</button>)}</div></fieldset>
      <label className="field-label" htmlFor="championship-player-name">Player name</label>
      <input id="championship-player-name" className="player-name-input" maxLength={24} value={draftName} onChange={event => setDraftName(event.target.value)} placeholder="Player" />
      {championshipFormat === 'two-player' && <><label className="field-label" htmlFor="championship-opponent-name">Player 2 name</label><input id="championship-opponent-name" className="player-name-input" maxLength={24} value={draftOpponent} onChange={event => setDraftOpponent(event.target.value)} placeholder="Player 2" /></>}
      <fieldset><legend>Topic</legend><div className="round-select">{(Object.keys(LABELS) as Section[]).map(item => <button key={item} className={`round-btn ${section === item ? 'selected' : ''}`} aria-pressed={section === item} onClick={() => changeSection(item)}>{LABELS[item]}</button>)}</div></fieldset>
      <div className="difficulty-select" role="group" aria-label="Championship difficulty">{DIFFICULTIES.map(item => <button key={item} className={`diff-btn ${difficulty === item ? 'selected' : ''}`} aria-pressed={difficulty === item} onClick={() => setDifficulty(item)}><span className="diff-label">{DIFFICULTY_LABELS[item]}</span><span className="diff-desc">{DIFFICULTY_DESCRIPTIONS[item]}</span></button>)}</div>
      <div className="round-select"><span>Length:</span>{CHAMPIONSHIP_SIZES.map(item => <button key={item} className={`round-btn ${championshipSize === item ? 'selected' : ''}`} aria-pressed={championshipSize === item} onClick={() => setChampionshipSize(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
      <div className="champ-game-picker"><label>Games (choose at least 2):</label><div className="champ-games-list">{availableModes(section).map(item => <button key={item} className={`champ-game-chip champ-game-toggle ${championshipModes.includes(item) ? 'selected' : ''}`} aria-pressed={championshipModes.includes(item)} onClick={() => toggleChampionshipMode(item)}>{championshipModes.includes(item) ? '✓ ' : ''}{MODE_ICONS[item]} {MODE_LABELS[item]} · {championshipRoundCount(item, championshipSize)} rounds</button>)}</div></div>
      {chosenChampionshipModes.includes('match-hunt') && <section className="champ-options-group"><div className="champ-options-heading"><div><strong>🃏 Match & Hunt options</strong><span>Three separate boards; match every pair on each board.</span></div><span className="champ-option-status">Included</span></div><div className="champ-setting-row"><span>Timer:</span><div className="champ-setting-controls"><button className={`round-btn ${!championshipMatchTimed ? 'selected' : ''}`} aria-pressed={!championshipMatchTimed} onClick={() => setChampionshipMatchTimed(false)}>Off</button><button className={`round-btn ${championshipMatchTimed ? 'selected' : ''}`} aria-pressed={championshipMatchTimed} onClick={() => setChampionshipMatchTimed(true)}>On</button></div></div></section>}
      <p className="champ-info-footer">{chosenChampionshipModes.length} games selected · Each player’s total is the EP earned in their own games.</p>
      <button className="start-btn" disabled={chosenChampionshipModes.length < 2} onClick={startChampionship}>{championshipFormat === 'solo' ? 'Start Solo Championship' : 'Start Championship'}</button>
    </section>}

    {screen === 'championship-handover' && championship && <section className="quiz-playing mario-game quiz-panel versus-handover">
      <button className="back-btn" onClick={leaveGame}>← Games</button>
      <p className="eyebrow">🏆 {championship.size} Championship · Game {championship.index + 1}/{championship.modes.length}</p>
      <h1>{MODE_LABELS[championship.modes[championship.index]]}</h1>
      <div className="champ-live-total"><span>{championshipNames[0]}: {championshipEarned[0]} EP</span><strong>{championshipNames[1]}: {championshipEarned[1]} EP</strong></div>
      <h2>{championshipNames[championship.turnIndex]}'s turn</h2>
      <p>{championship.format === 'computer' && championship.turnIndex === 1 ? 'The Computer will play the same rounds. Tap to watch its answers.' : 'Pass the device to this player before showing the game.'}</p>
      <button className="start-btn" onClick={() => { startTime.current = Date.now(); setScreen('game'); }}>Start {championshipNames[championship.turnIndex]}'s turn</button>
    </section>}

    {screen === 'setup' && <section className="quiz-setup mario-setup">
      <button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button>
      <h2 className="setup-title">{MODE_ICONS[mode]} {MODE_LABELS[mode]}</h2>
      <p className="setup-intro">{MODE_DESCRIPTIONS[mode]}</p>
      <label className="field-label" htmlFor="player-name">Player name</label>
      <input id="player-name" className="player-name-input" maxLength={24} value={draftName} onChange={event => setDraftName(event.target.value)} placeholder="Player" />
      {mode === 'quiz' && <fieldset><legend>Players</legend><div className="round-select">{(['solo', 'two-player', 'computer'] as QuizFormat[]).map(item => <button key={item} className={`round-btn ${quizFormat === item ? 'selected' : ''}`} aria-pressed={quizFormat === item} onClick={() => setQuizFormat(item)}>{item === 'solo' ? 'Solo' : item === 'two-player' ? 'Two Players' : 'Play Computer'}</button>)}</div></fieldset>}
      {mode === 'quiz' && quizFormat === 'two-player' && <><label className="field-label" htmlFor="opponent-name">Player 2 name</label><input id="opponent-name" className="player-name-input" maxLength={24} value={draftOpponent} onChange={event => setDraftOpponent(event.target.value)} placeholder="Player 2" /></>}
      <fieldset><legend>Topic</legend><div className="round-select">{(Object.keys(LABELS) as Section[]).filter(item => availableModes(item).includes(mode)).map(item => <button key={item} className={`round-btn ${section === item ? 'selected' : ''}`} onClick={() => changeSection(item)} aria-pressed={section === item}>{LABELS[item]}</button>)}</div></fieldset>
      <div className="difficulty-select" role="group" aria-label="Difficulty">{DIFFICULTIES.map(item => <button key={item} className={`diff-btn ${difficulty === item ? 'selected' : ''}`} onClick={() => setDifficulty(item)} aria-pressed={difficulty === item}><span className="diff-label">{DIFFICULTY_LABELS[item]}</span><span className="diff-desc">{DIFFICULTY_DESCRIPTIONS[item]}</span></button>)}</div>
      {(mode !== 'quiz' || quizFormat === 'solo') && <fieldset><legend>Timer</legend><div className="round-select"><button className={`round-btn ${!timed ? 'selected' : ''}`} onClick={() => setTimed(false)} aria-pressed={!timed}>Off</button><button className={`round-btn ${timed ? 'selected' : ''}`} onClick={() => setTimed(true)} aria-pressed={timed}>On</button></div></fieldset>}
      <button className="start-btn" onClick={start}>Start!</button>
    </section>}

    {screen === 'versus-game' && versus && versusTurn && <section className="quiz-playing mario-game quiz-panel versus-game">
      <div className="game-topbar"><button className="back-btn" onClick={() => setScreen('hub')}>← Games</button><span className="score-display">{player} {versus.scores[0]} · {opponentName} {versus.scores[1]}</span></div>
      <div className="mario-points-line">{player}: {versus.points[0] + (versusTurn.playerIndex === 0 ? versus.submission?.points ?? 0 : 0)} EP · {opponentName}: {versus.points[1] + (versusTurn.playerIndex === 1 ? versus.submission?.points ?? 0 : 0)} EP</div>
      <div className="quiz-topline"><span>⚔️ Quiz Battle · {DIFFICULTY_LABELS[difficulty]}</span><span>Round {Math.floor(versus.index / 2) + 1} of 5</span></div>
      <div className="progress-track"><div style={{ width: `${(versus.index / versus.turns.length) * 100}%` }} /></div>
      {versusReady ? <div className="versus-handover">
        <h1>{versusTurn.playerIndex === 0 ? player : opponentName}'s turn</h1>
        <p>{versusTurn.playerIndex === 1 && quizFormat === 'computer' ? 'The Computer has its own question. Tap to watch its answer.' : 'Pass the device to this player before showing the question.'}</p>
        <button className="start-btn" onClick={() => setVersusReady(false)}>Start {versusTurn.playerIndex === 0 ? player : opponentName}'s turn</button>
      </div> : <>
        <p className="versus-now-playing">Now playing: {versusTurn.playerIndex === 0 ? player : opponentName}</p>
        <h1>{versusTurn.question.prompt}</h1>
        {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read question aloud" aria-label="Read question aloud" onClick={() => speakText(`${versusTurn.question.prompt} ${versusTurn.question.choices.join('. ')}`)}>🔊</button>}
        {versusTurn.computerAnswer !== undefined && !versus.submission
          ? <button className="start-btn" onClick={() => setVersus(answerVersusQuiz(versus, versusTurn.computerAnswer!))}>Reveal Computer's answer</button>
          : <div className="answer-grid">{versusTurn.question.choices.map((choice, option) => <button key={choice} disabled={versus.submission !== null || versusTurn.computerAnswer !== undefined} className={`choice-btn ${versus.submission ? choice === versusTurn.question.answer ? 'correct' : choice === versus.submission.answer ? 'wrong' : '' : ''}`} onClick={() => setVersus(answerVersusQuiz(versus, choice))}><span className="choice-letter">{String.fromCharCode(65 + option)}</span><span className="choice-text">{choice}</span></button>)}</div>}
        {versus.submission && <div className="quiz-explanation feedback" aria-live="polite">
          <h2>{versus.submission.correct ? 'Correct!' : `Answer: ${versusTurn.question.answer}`}</h2>
          <p>{versusTurn.question.explanation}</p>
          <p><strong>Fun fact:</strong> {versusTurn.question.funFact}</p>
          <p className="mario-earned">+{versus.submission.points} EP</p>
          {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read explanation aloud" aria-label="Read explanation aloud" onClick={() => speakText(`${versusTurn.question.explanation} Fun fact: ${versusTurn.question.funFact}`)}>🔊</button>}
          <a href={versusTurn.question.sourceUrl} target="_blank" rel="noreferrer">Check the source ↗</a>
          <div className="feedback-actions"><button className="back-btn" onClick={() => setVersus(rewindVersusQuiz(versus))}>↶ Rewind</button><button className="start-btn" onClick={nextVersus}>{versus.index + 1 === versus.turns.length ? 'See result' : 'Next turn →'}</button></div>
        </div>}
      </>}
    </section>}

    {screen === 'versus-result' && latestResult && versus && <section className="quiz-result result-panel">
      <p className="eyebrow">MATCH COMPLETE</p>
      <h1>{versus.points[0] === versus.points[1] ? "It's a draw!" : `${versus.points[0] > versus.points[1] ? player : opponentName} wins!`}</h1>
      <div className="result-card"><div className="result-stats"><div className="result-stat"><span className="stat-value">{versus.points[0]} EP</span><span className="stat-label">{player} · {versus.scores[0]}/5 correct</span></div><div className="result-stat"><span className="stat-value">{versus.points[1]} EP</span><span className="stat-label">{opponentName} · {versus.scores[1]}/5 correct</span></div></div><p>Quiz Battle · {LABELS[section]} · {DIFFICULTY_LABELS[difficulty]}</p></div>
      <button className="start-btn" onClick={start}>Play again</button>
      <button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button>
      <button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button>
    </section>}

    {screen === 'game' && round && session && <section className="quiz-playing mario-game quiz-panel">
      <div className="game-topbar"><button className="back-btn" onClick={leaveGame}>← Games</button><span className="score-display">{championship ? championshipNames[championship.turnIndex] : player} · {session.correct + Number(session.submission?.correct)} correct · {session.points + (session.submission?.points ?? 0)} EP</span></div>
      {championship && <><div className="champ-game-banner">🏆 {championship.size[0].toUpperCase() + championship.size.slice(1)} Championship · Game {championship.index + 1}/{championship.modes.length} · {MODE_LABELS[mode]}</div><div className="champ-live-total">{championship.format === 'solo' ? <><span>Total championship score so far</span><strong>{championshipEarned[0] + session.points + (session.submission?.points ?? 0)} EP</strong></> : <><span>{championshipNames[0]}: {championshipEarned[0] + (championship.turnIndex === 0 ? session.points + (session.submission?.points ?? 0) : 0)} EP</span><strong>{championshipNames[1]}: {championshipEarned[1] + (championship.turnIndex === 1 ? session.points + (session.submission?.points ?? 0) : 0)} EP</strong></>}</div></>}
      <div className="quiz-topline"><span>{MODE_ICONS[mode]} {MODE_LABELS[mode]} · {DIFFICULTY_LABELS[difficulty]}</span><span>Question {session.index + 1} of {session.rounds.length}</span>{timed && <span aria-label="Elapsed time">{(elapsedMs / 1000).toFixed(1)}s</span>}</div>
      <div className="progress-track"><div style={{ width: `${(session.index / session.rounds.length) * 100}%` }} /></div>
      <h1>{round.prompt}</h1>
      {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read question aloud" aria-label="Read question aloud" onClick={() => speakText(round.mode === 'quiz' ? `${round.prompt} ${round.question.choices.join('. ')}` : round.mode === 'match-hunt' ? `${round.prompt} Hunt target: ${round.pairs.find(pair => pair.id === round.targetId)?.name}.` : round.prompt)}>🔊</button>}
      {computerChampTurn && !session.submission && <button className="start-btn" onClick={() => setSession(submit(session, championship!.computerAnswers[session.index]))}>Reveal Computer's answer</button>}

      {!computerChampTurn && round.mode === 'quiz' && <div className="answer-grid">{round.question.choices.map((choice, option) => <button key={choice} disabled={session.submission !== null} className={`choice-btn ${session.submission ? choice === round.question.answer ? 'correct' : choice === session.submission.answer ? 'wrong' : '' : ''}`} onClick={() => setSession(submit(session, choice))}><span className="choice-letter">{String.fromCharCode(65 + option)}</span><span className="choice-text">{choice}</span></button>)}</div>}

      {!computerChampTurn && round.mode === 'game-order' && <>
        <p className="help-copy">Tap two games to swap them. The oldest should be on the left.</p>
        <div className="order-tiles">{orderDraft.map((id, position) => {
          const tile = round.tiles.find(game => game.id === id)!;
          return <button key={id} disabled={session.submission !== null} className={selectedOrderTile === position ? 'selected-tile' : ''} aria-pressed={selectedOrderTile === position} onClick={() => swapOrderTile(position)}><small>{position + 1}</small>{tile.title}</button>;
        })}</div>
        {!session.submission && <button className="start-btn check-button" onClick={() => setSession(submit(session, orderDraft))}>Check order</button>}
      </>}

      {!computerChampTurn && round.mode === 'track-finder' && <>
        <p className="help-copy">Choose one track. Every correct track in the cup counts.</p>
        <div className={`finder-grid finder-${round.width}`}>{round.tiles.map(course => <button key={course.id} disabled={session.submission !== null} className={session.submission && course.id === session.submission.answer ? session.submission.correct ? 'right-answer' : 'wrong-answer' : ''} onClick={() => setSession(submit(session, course.id))}>{course.title}</button>)}</div>
      </>}

      {!computerChampTurn && round.mode === 'category-finder' && <>
        <p className="help-copy">Tap one tile that fits. Every tile of the requested type counts.</p>
        <div className={`finder-grid finder-${round.width} category-grid`}>{round.tiles.map(tile => <button key={tile.id} disabled={session.submission !== null} className={session.submission ? tile.category === round.targetCategory ? 'right-answer' : tile.id === session.submission.answer ? 'wrong-answer' : '' : ''} onClick={() => setSession(submit(session, tile.id))}><small>{tile.number}</small><span>{tile.name}</span></button>)}</div>
      </>}

      {!computerChampTurn && round.mode === 'match-hunt' && <>
        <p className="help-copy">Tap a name and its matching clue. Find every pair. Your hunt target is <strong>{round.pairs.find(pair => pair.id === round.targetId)?.name}</strong>.</p>
        <p className="match-progress" aria-live="polite">{matchedIds.length}/{round.pairs.length} pairs found{matchedIds.includes(round.targetId) ? ' · target found!' : ''}</p>
        {!session.submission && <button className="back-btn match-restart" onClick={undo}>↶ Restart go</button>}
        <div className="match-board">
          <div className="match-column" aria-label="Names"><h2>Names</h2>{round.nameIds.map(id => {
            const pair = round.pairs.find(item => item.id === id)!;
            return <button key={id} disabled={matchedIds.includes(id) || session.submission !== null} className={`${selectedMatchName === id ? 'selected-tile' : ''} ${matchedIds.includes(id) ? 'matched-tile' : ''}`} aria-pressed={selectedMatchName === id} onClick={() => chooseMatch('name', id)}>{pair.name}</button>;
          })}</div>
          <div className="match-column" aria-label="Clues"><h2>Clues</h2>{round.clueIds.map(id => {
            const pair = round.pairs.find(item => item.id === id)!;
            return <button key={id} disabled={matchedIds.includes(id) || session.submission !== null} className={`${selectedMatchClue === id ? 'selected-tile' : ''} ${matchedIds.includes(id) ? 'matched-tile' : ''}`} aria-pressed={selectedMatchClue === id} onClick={() => chooseMatch('clue', id)}>{pair.clue}</button>;
          })}</div>
        </div>
        {matchMessage && <p className="match-message" aria-live="polite">{matchMessage}</p>}
      </>}

      {!computerChampTurn && round.mode === 'clue-duel' && <>
        <p className="help-copy">Guess when you are ready. A wrong guess reveals the next clue. You can also ask to see it.</p>
        <p className="clue-count">Clue {clueIndex + 1} of 5</p>
        <ol className="clue-list">{round.clues.slice(0, clueIndex + 1).map((clue, index) => <li key={index}>{clue}</li>)}</ol>
        {clueMessage && !session.submission && <p className="match-message" aria-live="polite">{clueMessage}</p>}
        {!session.submission && clueIndex < 4 && <button className="back-btn clue-reveal" onClick={() => { setClueIndex(current => current + 1); setClueMessage(''); }}>Show next clue</button>}
        <div className="answer-grid">{round.choices.map((choice, option) => <button key={choice.id} disabled={session.submission !== null} className={`choice-btn ${session.submission ? choice.id === round.answerId ? 'correct' : choice.id === session.submission.answer ? 'wrong' : '' : ''}`} onClick={() => guessClue(choice.id)}><span className="choice-letter">{String.fromCharCode(65 + option)}</span><span className="choice-text">{choice.label}</span></button>)}</div>
      </>}

      {session.submission && <div className="quiz-explanation feedback" aria-live="polite">
        <h2>{session.submission.correct ? 'Correct!' : `Answer: ${session.submission.correctLabel}`}</h2>
        {computerChampTurn && <p>Computer chose: {Array.isArray(session.submission.answer) ? session.submission.answer.join(' → ') : session.submission.answer}</p>}
        <p>{round.explanation}</p>
        <p><strong>Fun fact:</strong> {round.funFact}</p>
        <p className="mario-earned">+{session.submission.points} EP</p>
        {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read explanation aloud" aria-label="Read explanation aloud" onClick={() => speakText(`${round.explanation} Fun fact: ${round.funFact}`)}>🔊</button>}
        <a href={round.sourceUrl} target="_blank" rel="noreferrer">Check the source ↗</a>
        <div className="feedback-actions"><button className="back-btn" onClick={undo}>↶ Rewind</button><button className="start-btn" onClick={next}>{session.index + 1 === session.rounds.length ? 'See result' : 'Next question →'}</button></div>
      </div>}
    </section>}

    {screen === 'result' && latestResult && <section className="quiz-result result-panel">
      <p className="eyebrow">{championship ? `CHAMPIONSHIP · GAME ${championship.index + 1} OF ${championship.modes.length}` : 'GAME COMPLETE'}</p>
      <h1>Nice work, {latestResult.player}!</h1>
      <div className="result-card"><div className="result-stats"><div className="result-stat"><span className="stat-value">{latestResult.correct}/{latestResult.total}</span><span className="stat-label">Correct</span></div><div className="result-stat"><span className="stat-value">{latestResult.points ?? latestResult.correct}</span><span className="stat-label">EP earned</span></div></div><p>{MODE_LABELS[latestResult.mode ?? 'quiz']} · {LABELS[latestResult.topic]} · {DIFFICULTY_LABELS[latestResult.difficulty]}{timed ? ` · ${(latestResult.elapsedMs / 1000).toFixed(1)}s` : ''}</p></div>
      {championship ? <><div className="champ-live-total">{championship.format === 'solo' ? <><span>Total championship score so far</span><strong>{championshipEarned[0] + (latestResult.points ?? latestResult.correct)} EP</strong></> : <><span>{championshipNames[0]}: {championshipEarned[0] + (championship.turnIndex === 0 ? latestResult.points ?? latestResult.correct : 0)} EP</span><strong>{championshipNames[1]}: {championshipEarned[1] + (championship.turnIndex === 1 ? latestResult.points ?? latestResult.correct : 0)} EP</strong></>}</div><button className="start-btn" onClick={continueChampionship}>{championship.format !== 'solo' && championship.turnIndex === 0 ? `Pass to ${championship.opponent} →` : championship.index + 1 === championship.modes.length ? 'See championship result' : `Next: ${MODE_LABELS[championship.modes[championship.index + 1]]} →`}</button></> : <button className="start-btn" onClick={start}>Play again</button>}
      <button className="back-btn" onClick={leaveGame}>← Back to games</button>
      {!championship && <button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button>}
    </section>}

    {screen === 'championship-result' && finishedChampionship && <section className="quiz-result result-panel">
      <p className="eyebrow">CHAMPIONSHIP COMPLETE</p><h1>🏆 {finishedChampionship.opponent ? finishedChampionship.points === finishedChampionship.opponentPoints ? "It's a draw!" : `${finishedChampionship.points > (finishedChampionship.opponentPoints ?? 0) ? finishedChampionship.player : finishedChampionship.opponent} wins!` : `Nice work, ${finishedChampionship.player}!`}</h1>
      <div className="result-card"><div className="result-stats"><div className="result-stat"><span className="stat-value">{finishedChampionship.points}</span><span className="stat-label">{finishedChampionship.player} · total EP</span></div><div className="result-stat"><span className="stat-value">{finishedChampionship.opponent ? finishedChampionship.opponentPoints : finishedChampionship.games.length}</span><span className="stat-label">{finishedChampionship.opponent ? `${finishedChampionship.opponent} · total EP` : 'Games'}</span></div></div><p>{finishedChampionship.size} · {LABELS[finishedChampionship.topic]} · {DIFFICULTY_LABELS[finishedChampionship.difficulty]}</p></div>
      <div className="champ-running-total"><h3>Game breakdown</h3>{finishedChampionship.games.map((game, index) => <div className="champ-total-row" key={game.mode}><span>{MODE_ICONS[game.mode]} {MODE_LABELS[game.mode]}</span><strong>{finishedChampionship.player}: {game.points ?? game.correct} EP{finishedChampionship.opponent ? ` · ${finishedChampionship.opponent}: ${finishedChampionship.opponentGames?.[index]?.points ?? 0} EP` : ''}</strong></div>)}</div>
      <button className="start-btn" onClick={() => setScreen('championship-setup')}>Play again</button><button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button><button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button>
    </section>}

    {screen === 'scores' && <section className="high-scores-screen">
      <div className="high-scores-header"><button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button><div><h2>🏆 High Scores</h2><p>Your finished games</p></div></div>
      {scores.length === 0 ? <p>No completed games yet.</p> : <ol className="score-list">{scores.slice(0, 20).map(result => <li key={result.id}><span><strong>{result.opponent ? `${result.player} vs ${result.opponent}` : result.player}</strong><small>{MODE_LABELS[result.mode ?? 'quiz']} · {LABELS[result.topic]} · {DIFFICULTY_LABELS[result.difficulty]} · {result.opponent ? `${result.correct}–${result.opponentCorrect}` : `${result.correct}/${result.total}`} correct</small></span><strong>{result.opponent ? `${result.points ?? result.correct}–${result.opponentPoints ?? result.opponentCorrect} EP` : `${result.points ?? result.correct} EP`}</strong></li>)}</ol>}
      <h3>Championships</h3>{championshipScores.length === 0 ? <p>No completed championships yet.</p> : <ol className="score-list">{championshipScores.slice(0, 20).map(result => <li key={result.id}><span><strong>{result.opponent ? `${result.player} vs ${result.opponent}` : result.player}</strong><small>{result.size} · {LABELS[result.topic]} · {DIFFICULTY_LABELS[result.difficulty]} · {result.games.length} games</small></span><strong>{result.opponent ? `${result.points}–${result.opponentPoints} EP` : `${result.points} EP`}</strong></li>)}</ol>}
    </section>}

    {screen === 'explore' && <section className="mario-learning-zone">
      <button className="back-btn" onClick={() => setScreen('home')}>← Home</button>
      <p className="eyebrow">EXPLORE</p>
      <h1>Learning Zone</h1>
      <p className="intro-copy">A place to learn before you play. We’re preparing short, clear guides and will add them after checking the information.</p>
      <div className="learning-topic-grid">{LEARNING_TOPICS.map(topic => <article className="learning-topic-card" key={topic.title}><span className="learning-topic-icon" aria-hidden="true">{topic.icon}</span><h2>{topic.title}</h2>{topic.title === 'Mario Kart tracks' ? <><p>Browse the reviewed Booster Course Pass cup list.</p><button className="round-btn learning-topic-action" onClick={() => setScreen('tracks')}>Open track guide →</button></> : <p>Information to be confirmed.</p>}</article>)}</div>
      <p className="learning-zone-note">The track list is available now. The other learning guides are planned; no unconfirmed facts are shown in them yet.</p>
    </section>}

    {screen === 'tracks' && <section className="mario-tracks">
      <button className="back-btn" onClick={() => setScreen('explore')}>← Learning Zone</button>
      <p className="eyebrow">MARIO KART TRACK GUIDE</p>
      <h1>Booster Course Pass</h1>
      <p className="intro-copy">All 48 extra courses in Mario Kart 8 Deluxe, grouped by wave and cup. More games and tracks will be added as the catalogue is reviewed.</p>
      {Array.from({ length: 6 }, (_, wave) => <div key={wave} className="wave-section">
        <h2>Wave {wave + 1}</h2>
        {Array.from(new Set(BOOSTER_COURSES.filter(course => course.wave === wave + 1).map(course => course.cup))).map(cup => <div key={cup}>
          <h3>{cup}</h3>
          <ol>{BOOSTER_COURSES.filter(course => course.cup === cup).map(course => <li key={course.id}>{course.title}</li>)}</ol>
        </div>)}
      </div>)}
      <a className="source-link" href={BOOSTER_SOURCE} target="_blank" rel="noreferrer">Check Nintendo’s course list ↗</a>
    </section>}

    <footer className="mario-footer">This is an unofficial fan quiz. It is not affiliated with or endorsed by Nintendo.</footer>
  </main>;
}
