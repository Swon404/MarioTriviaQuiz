import { useEffect, useMemo, useRef, useState } from 'react';
import { type Difficulty } from './mario/questions.ts';
import { getChampionshipResults, getPlayer, getResults, saveChampionshipResult, savePlayer, saveResult, type ChampionshipResult, type QuizResult } from './mario/storage.ts';
import { CHAMPIONSHIP_SIZES, championshipPoints, championshipRoundCount, computerChampionshipAnswers, createChampionshipRounds, type ChampionshipSize } from './mario/championship.ts';
import { BOOSTER_COURSES, BOOSTER_SOURCE } from './mario/courses.ts';
import { availableModes, createRounds, type GameMode, type GameRound, type HuntTargetMode, type PairMatchOptions, type PairVariant, type Section, type TrialTarget } from './mario/rounds.ts';
import { ICON_PAIRS } from './mario/pairCatalog.ts';
import { advance, rewind, startSession, submit, type Answer, type GameSession } from './mario/session.ts';
import { advanceVersusQuiz, answerVersusQuiz, rewindVersusQuiz, startVersusQuiz, type VersusQuiz } from './mario/versus.ts';
import { getNextRank, getRank, MILESTONES, playerProgress } from './mario/scoring.ts';
import { availableVoices, getSpeechRate, getVoiceName, setSpeechRate, setVoiceName, speakText, speechAvailable, stopSpeaking } from './mario/tts.ts';
import { playComputerRounds } from './mario/computer.ts';

type Screen = 'home' | 'hub' | 'setup' | 'championship-setup' | 'championship-handover' | 'game' | 'result' | 'championship-result' | 'versus-game' | 'versus-result' | 'scores' | 'tracks' | 'explore';
type QuizFormat = 'solo' | 'two-player' | 'computer';
type ChampionshipRun = { id: string; size: ChampionshipSize; topic: Section; difficulty: Difficulty; modes: GameMode[]; index: number; legs: QuizResult[]; pairOptions: PairMatchOptions; format: QuizFormat; opponent: string; turnIndex: 0 | 1; rounds: GameRound[]; computerAnswers: Answer[] };
type StandaloneRun = { format: 'two-player' | 'computer'; opponent: string; turnIndex: 0 | 1; rounds: GameRound[]; computerAnswers: Answer[]; firstResult?: QuizResult };
const MUSHBOT = 'Mushbot';
const MUSHBOT_IMAGE = `${import.meta.env.BASE_URL}mushbot.png`;
const MATCH_RETRIES: Record<Difficulty, number> = { explorer: 3, scientist: 1, professor: 0 };

const LABELS: Record<Section, string> = { mario: 'Mario games', kart: 'Mario Kart', mixed: 'A bit of both' };
const MODE_LABELS: Record<GameMode, string> = { quiz: 'Quiz Battle', 'game-order': 'Game Order', 'track-finder': 'Track Finder', 'match-hunt': 'Clue Match Up', 'pair-match': 'Match & Hunt', 'clue-duel': 'Clue Duel', 'category-finder': 'Category Finder' };
const MODE_ICONS: Record<GameMode, string> = { quiz: '⚔️', 'game-order': '🔢', 'track-finder': '🔎', 'match-hunt': '🃏', 'pair-match': '🎴', 'clue-duel': '🕵️', 'category-finder': '🗂️' };
const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  quiz: 'Four-choice questions about characters, baddies, power-ups, games, consoles, tracks and famous fixed bugs.',
  'game-order': 'Put Mario games in release order.',
  'track-finder': 'Find a track from the named Mario Kart cup.',
  'match-hunt': 'Match each name with its clue. Three rounds of visible pairs.',
  'pair-match': 'Flip icon and word cards. Switch between Hunt and Time Trial.',
  'clue-duel': 'Guess a character or track from five clues that get clearer. Five rounds.',
  'category-finder': 'Find one friendly character, baddie, power-up, game or system in a numbered window.',
};
const modeLabel = (value: string | undefined) => value === 'pair-hunt' ? 'Match & Hunt · Hunt' : MODE_LABELS[(value ?? 'quiz') as GameMode] ?? 'Unknown game';
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
  const section: Section = 'mixed';
  const [mode, setMode] = useState<GameMode>('quiz');
  const [difficulty, setDifficulty] = useState<Difficulty>('explorer');
  const [timed, setTimed] = useState(false);
  const [pairVariant, setPairVariant] = useState<PairVariant>('hunt');
  const [pairCount, setPairCount] = useState(12);
  const [trialTarget, setTrialTarget] = useState<TrialTarget>(5);
  const [huntTimed, setHuntTimed] = useState(false);
  const [huntTargetMode, setHuntTargetMode] = useState<HuntTargetMode>('none');
  const [huntChosenTarget, setHuntChosenTarget] = useState<string | null>(null);
  const [huntUnlockPairs, setHuntUnlockPairs] = useState(0);
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
  const [matchMistakes, setMatchMistakes] = useState(0);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [foundPairs, setFoundPairs] = useState<string[]>([]);
  const [pairMoves, setPairMoves] = useState(0);
  const [pairLocked, setPairLocked] = useState(false);
  const [pairMessage, setPairMessage] = useState('');
  const [pairScore, setPairScore] = useState(0);
  const [pairTimerReady, setPairTimerReady] = useState(true);
  const [clueIndex, setClueIndex] = useState(0);
  const [clueMessage, setClueMessage] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [latestResult, setLatestResult] = useState<QuizResult | null>(null);
  const [championshipSize, setChampionshipSize] = useState<ChampionshipSize>('standard');
  const [championshipModes, setChampionshipModes] = useState<GameMode[]>(Object.keys(MODE_LABELS) as GameMode[]);
  const [championshipFormat, setChampionshipFormat] = useState<QuizFormat>('solo');
  const [championship, setChampionship] = useState<ChampionshipRun | null>(null);
  const [standalone, setStandalone] = useState<StandaloneRun | null>(null);
  const [finishedChampionship, setFinishedChampionship] = useState<ChampionshipResult | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(getVoiceName);
  const [speechRate, setRate] = useState(getSpeechRate);
  const startTime = useRef(0);
  const previousRoundMs = useRef(0);
  const pairFlipTimeout = useRef<number | null>(null);
  const pairRoundCompletedMs = useRef<number | null>(null);

  useEffect(() => () => {
    if (pairFlipTimeout.current !== null) window.clearTimeout(pairFlipTimeout.current);
  }, []);

  useEffect(() => {
    if (screen !== 'game' || !timed || (mode === 'pair-match' && (!pairTimerReady || session?.submission))) return;
    const id = window.setInterval(() => setElapsedMs(previousRoundMs.current + Date.now() - startTime.current), 100);
    return () => window.clearInterval(id);
  }, [screen, timed, mode, pairTimerReady, session?.submission]);

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
  const championshipBotPreview = championship?.format === 'computer' && latestResult && screen === 'result' ? playComputerRounds(championship.rounds, championship.difficulty, championship.computerAnswers).points : 0;
  const matchRetriesLeft = Math.max(0, MATCH_RETRIES[difficulty] - matchMistakes);
  const gamePointsNow = session ? session.points + (round?.mode === 'pair-match' ? pairScore : session.submission?.points ?? 0) : 0;
  const availablePairTargets = ICON_PAIRS;
  const pairOptions: PairMatchOptions = {
    variant: pairVariant, pairCount, trialTarget, huntTimed,
    targetMode: huntTargetMode, chosenTargetId: huntChosenTarget && availablePairTargets.some(pair => pair.id === huntChosenTarget) ? huntChosenTarget : availablePairTargets[0]?.id ?? null,
    unlockPairs: huntUnlockPairs,
  };

  const openGame = (next: GameMode) => {
    setMode(next);
    setScreen('setup');
  };

  const toggleChampionshipMode = (item: GameMode) => {
    setChampionshipModes(current => current.includes(item) ? current.filter(modeId => modeId !== item) : [...current, item]);
  };

  const prepareRound = (next: GameRound | undefined) => {
    if (pairFlipTimeout.current !== null) window.clearTimeout(pairFlipTimeout.current);
    pairFlipTimeout.current = null;
    setOrderDraft(next?.mode === 'game-order' ? next.tiles.map(tile => tile.id) : []);
    setSelectedOrderTile(null);
    setMatchedIds([]);
    setSelectedMatchName(null);
    setSelectedMatchClue(null);
    setMatchMessage('');
    setMatchMistakes(0);
    setFlippedCards([]);
    setFoundPairs([]);
    setPairMoves(0);
    setPairLocked(false);
    setPairMessage('');
    setPairScore(0);
    setPairTimerReady(next?.mode !== 'pair-match' || !next.timed);
    pairRoundCompletedMs.current = null;
    setClueIndex(0);
    setClueMessage('');
  };

  const start = () => {
    const name = draftName.trim().slice(0, 24) || 'Player';
    savePlayer(name);
    setPlayer(name);
    setDraftName(name);
    if (mode === 'quiz' && quizFormat !== 'solo') {
      const wanted = quizFormat === 'computer' ? MUSHBOT : draftOpponent.trim().slice(0, 24) || 'Player 2';
      const other = wanted.toLowerCase() === name.toLowerCase() ? `${wanted} 2` : wanted;
      setOpponentName(other);
      setStandalone(null);
      setVersus(startVersusQuiz(section, difficulty, quizFormat === 'computer' ? 'computer' : 'human'));
      setVersusReady(true);
      setLatestResult(null);
      startTime.current = Date.now();
      setScreen('versus-game');
      return;
    }
    const game = startSession(createRounds(mode, section, difficulty, Math.random, pairOptions), difficulty);
    const wanted = quizFormat === 'computer' ? MUSHBOT : draftOpponent.trim().slice(0, 24) || 'Player 2';
    const other = wanted.toLowerCase() === name.toLowerCase() ? `${wanted} 2` : wanted;
    setOpponentName(other);
    setStandalone(quizFormat === 'solo' ? null : {
      format: quizFormat, opponent: other, turnIndex: 0, rounds: [...game.rounds],
      computerAnswers: quizFormat === 'computer' ? computerChampionshipAnswers(game.rounds, difficulty) : [],
    });
    setSession(game);
    if (mode === 'pair-match') setTimed(pairVariant === 'time-trial' || huntTimed);
    prepareRound(game.rounds[0]);
    setElapsedMs(0);
    setLatestResult(null);
    previousRoundMs.current = 0;
    startTime.current = mode === 'pair-match' && (pairVariant === 'time-trial' || huntTimed) ? 0 : Date.now();
    setScreen(quizFormat === 'two-player' ? 'championship-handover' : 'game');
  };

  const prepareChampionshipTurn = (run: ChampionshipRun) => {
    const nextMode = run.modes[run.index];
    const rounds = run.turnIndex === 0 ? createChampionshipRounds(nextMode, run.topic, run.difficulty, run.size, Math.random, run.pairOptions) : run.rounds;
    const ready = run.turnIndex === 0 ? { ...run, rounds, computerAnswers: run.format === 'computer' ? computerChampionshipAnswers(rounds, run.difficulty) : [] } : run;
    const game = startSession(rounds, run.difficulty);
    setChampionship(ready);
    setMode(nextMode);
    setTimed(nextMode === 'pair-match' ? run.pairOptions.variant === 'time-trial' || run.pairOptions.huntTimed : false);
    setSession(game);
    prepareRound(game.rounds[0]);
    setElapsedMs(0);
    setLatestResult(null);
    previousRoundMs.current = 0;
    startTime.current = 0;
    setScreen(run.format === 'solo' ? 'game' : 'championship-handover');
    if (run.format === 'solo' && !(nextMode === 'pair-match' && rounds[0]?.mode === 'pair-match' && rounds[0].timed)) startTime.current = Date.now();
  };

  const startChampionship = () => {
    if (chosenChampionshipModes.length < 2) return;
    const name = draftName.trim().slice(0, 24) || 'Player';
    savePlayer(name);
    setPlayer(name);
    setDraftName(name);
    const wantedOpponent = championshipFormat === 'computer' ? MUSHBOT : draftOpponent.trim().slice(0, 24) || 'Player 2';
    const other = wantedOpponent.toLowerCase() === name.toLowerCase() ? `${wantedOpponent} 2` : wantedOpponent;
    setOpponentName(other);
    const run: ChampionshipRun = {
      id: crypto.randomUUID(), size: championshipSize, topic: section, difficulty,
      modes: chosenChampionshipModes, index: 0, legs: [], pairOptions: { ...pairOptions },
      format: championshipFormat, opponent: other, turnIndex: 0, rounds: [], computerAnswers: [],
    };
    setFinishedChampionship(null);
    setStandalone(null);
    prepareChampionshipTurn(run);
  };

  const makeComputerResult = (rounds: readonly GameRound[], answers: readonly Answer[], gameMode: GameMode, topic: Section, level: Difficulty, computerName: string): QuizResult => {
    const played = playComputerRounds(rounds, level, answers);
    return {
      id: crypto.randomUUID(), mode: gameMode, variant: rounds[0]?.mode === 'pair-match' ? rounds[0].variant : undefined, player: computerName, topic, difficulty: level,
      correct: played.correct, total: rounds.length, points: played.points, bestStreak: played.bestStreak,
      elapsedMs: 0, completedAt: new Date().toISOString(),
    };
  };

  const finishChampionship = (run: ChampionshipRun, legs: QuizResult[]) => {
    const playerLegs = legs.filter(leg => leg.player === player);
    const opponentLegs = legs.filter(leg => leg.player === run.opponent);
    const completed: ChampionshipResult = {
      id: run.id, player, topic: run.topic, difficulty: run.difficulty,
      size: run.size, format: run.format,
      games: playerLegs.map(leg => ({ mode: leg.mode!, variant: leg.variant, correct: leg.correct, total: leg.total, points: leg.points ?? leg.correct })),
      points: championshipPoints(playerLegs),
      opponent: run.format === 'solo' ? undefined : run.opponent,
      opponentGames: run.format === 'solo' ? undefined : opponentLegs.map(leg => ({ mode: leg.mode!, variant: leg.variant, correct: leg.correct, total: leg.total, points: leg.points ?? leg.correct })),
      opponentPoints: run.format === 'solo' ? undefined : championshipPoints(opponentLegs),
      completedAt: new Date().toISOString(),
    };
    saveChampionshipResult(completed);
    setFinishedChampionship(completed);
    setChampionship(null);
    setScreen('championship-result');
  };

  const continueChampionship = () => {
    if (!championship || !latestResult) return;
    const legs = [...championship.legs, latestResult];
    if (championship.format === 'computer' && championship.turnIndex === 0) {
      const bot = makeComputerResult(championship.rounds, championship.computerAnswers, championship.modes[championship.index], championship.topic, championship.difficulty, championship.opponent);
      saveResult(bot);
      legs.push(bot);
    }
    if (championship.format === 'two-player' && championship.turnIndex === 0) {
      prepareChampionshipTurn({ ...championship, turnIndex: 1, legs });
      return;
    }
    if (championship.index + 1 < championship.modes.length) {
      prepareChampionshipTurn({ ...championship, index: championship.index + 1, turnIndex: 0, legs, rounds: [], computerAnswers: [] });
      return;
    }
    finishChampionship(championship, legs);
  };

  const next = () => {
    if (!session?.submission) return;
    const totalMs = previousRoundMs.current + (round?.mode === 'pair-match' ? pairRoundCompletedMs.current ?? Math.max(0, Date.now() - startTime.current) : Date.now() - startTime.current);
    const updated = advance(session);
    setSession(updated);
    prepareRound(updated.rounds[updated.index]);
    if ((mode === 'match-hunt' || mode === 'pair-match') && !updated.complete) {
      previousRoundMs.current = totalMs;
      const upcoming = updated.rounds[updated.index];
      startTime.current = upcoming.mode === 'pair-match' && upcoming.timed ? 0 : Date.now();
    }
    if (!updated.complete) return;
    const result: QuizResult = {
      id: crypto.randomUUID(), mode, variant: session.rounds[0]?.mode === 'pair-match' ? session.rounds[0].variant : undefined, player: championship?.turnIndex === 1 ? championship.opponent : standalone?.turnIndex === 1 ? standalone.opponent : player, topic: championship?.topic ?? section, difficulty: championship?.difficulty ?? difficulty,
      correct: updated.correct, total: updated.rounds.length, points: updated.points, bestStreak: updated.bestStreak,
      elapsedMs: totalMs, completedAt: new Date().toISOString(),
    };
    if (standalone && !championship) {
      if (standalone.format === 'two-player' && standalone.turnIndex === 0) {
        setStandalone({ ...standalone, firstResult: result });
        setLatestResult(result);
        setScreen('result');
        return;
      }
      const first = standalone.firstResult ?? result;
      const bot = standalone.format === 'computer' ? makeComputerResult(standalone.rounds, standalone.computerAnswers, mode, section, difficulty, standalone.opponent) : result;
      const combined: QuizResult = {
        ...first, id: crypto.randomUUID(), opponent: standalone.opponent, format: standalone.format,
        opponentCorrect: bot.correct, opponentPoints: bot.points, opponentBestStreak: bot.bestStreak,
      };
      saveResult(combined);
      setLatestResult(combined);
      setScreen('versus-result');
      return;
    }
    saveResult(result);
    setLatestResult(result);
    setScreen('result');
  };

  const undo = () => {
    if (!session || !round) return;
    setSession(rewind(session));
    prepareRound(round);
    if (round.mode === 'match-hunt' || round.mode === 'pair-match') {
      startTime.current = round.mode === 'pair-match' && round.timed ? 0 : Date.now();
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
    if (pairFlipTimeout.current !== null) window.clearTimeout(pairFlipTimeout.current);
    pairFlipTimeout.current = null;
    setChampionship(null);
    setStandalone(null);
    setScreen('hub');
  };

  const continueStandalone = () => {
    if (!standalone?.firstResult) return;
    const game = startSession(standalone.rounds, difficulty);
    setStandalone({ ...standalone, turnIndex: 1 });
    setSession(game);
    prepareRound(game.rounds[0]);
    setElapsedMs(0);
    previousRoundMs.current = 0;
    startTime.current = 0;
    setScreen('championship-handover');
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
      if (matchMistakes >= MATCH_RETRIES[difficulty]) {
        setMatchMessage('Not a pair — round over.');
        setSession(submit(session, 'wrong-pair'));
      } else {
        const nextMistakes = matchMistakes + 1;
        setMatchMistakes(nextMistakes);
        const left = MATCH_RETRIES[difficulty] - nextMistakes;
        setMatchMessage(`Not a pair — ${left} ${left === 1 ? 'retry' : 'retries'} left.`);
      }
      return;
    }
    const nextMatched = [...matchedIds, id];
    setMatchedIds(nextMatched);
    setMatchMessage('Pair matched!');
    if (nextMatched.length === round.pairs.length) setSession(submit(session, round.targetId));
  };

  const flipPairCard = (cardId: string) => {
    if (!session || round?.mode !== 'pair-match' || session.submission || pairLocked || !pairTimerReady || flippedCards.includes(cardId)) return;
    const card = round.cards.find(item => item.id === cardId);
    if (!card || foundPairs.includes(card.pairId)) return;
    if (round.variant === 'hunt' && round.targetPairId === card.pairId && foundPairs.length < round.unlockPairs) {
      const remaining = round.unlockPairs - foundPairs.length;
      setPairMessage(`Target locked — find ${remaining} more ${remaining === 1 ? 'pair' : 'pairs'} first.`);
      return;
    }
    if (flippedCards.length === 0) {
      setFlippedCards([cardId]);
      setPairMessage('');
      return;
    }
    const first = round.cards.find(item => item.id === flippedCards[0])!;
    setPairMoves(count => count + 1);
    setFlippedCards([first.id, cardId]);
    if (first.pairId === card.pairId) {
      const nextFound = [...foundPairs, card.pairId];
      const targetFound = round.variant === 'hunt' && card.pairId === round.targetPairId;
      const gained = targetFound ? 4 : 1;
      const nextScore = pairScore + gained;
      setFoundPairs(nextFound);
      setPairScore(nextScore);
      setFlippedCards([]);
      setPairMessage(targetFound ? 'Target found! +2 for the pair and +2 Hunt bonus.' : 'Pair found! +1 point.');
      if (targetFound || nextFound.length >= round.goal) {
        pairRoundCompletedMs.current = Math.max(1, Date.now() - startTime.current);
        setSession(submit(session, round.completionId, nextScore));
      }
      return;
    }
    setPairLocked(true);
    setPairMessage('Not a pair — remember where they are!');
    pairFlipTimeout.current = window.setTimeout(() => {
      setFlippedCards([]);
      setPairLocked(false);
      pairFlipTimeout.current = null;
    }, 1100);
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

  const renderPairSettings = (inChampionship: boolean) => {
    const atomicCount = championshipRoundCount('game-order', championshipSize);
    return <section className="champ-options-group pair-options" aria-label="Match & Hunt options">
      <div className="champ-options-heading"><div><strong>🎴 Match & Hunt options</strong><span>{pairVariant === 'hunt' ? (huntTimed ? 'Three timed Hunt rounds' : inChampionship ? 'Three relaxed Hunt rounds' : 'One relaxed Hunt board') : 'Three timed Time Trial rounds'}</span></div></div>
      <div className="champ-setting-row" role="group" aria-label="Matching mode"><span>Mode:</span><div className="champ-setting-controls">{(['hunt', 'time-trial'] as PairVariant[]).map(item => <button key={item} className={`round-btn ${pairVariant === item ? 'selected' : ''}`} aria-pressed={pairVariant === item} onClick={() => setPairVariant(item)}>{item === 'hunt' ? '🏹 Hunt' : '⏱️ Time Trial'}</button>)}</div></div>
      {pairVariant === 'hunt' && <div className="champ-setting-row" role="group" aria-label="Hunt timer"><span>Timer:</span><div className="champ-setting-controls"><button className={`round-btn ${!huntTimed ? 'selected' : ''}`} aria-pressed={!huntTimed} onClick={() => setHuntTimed(false)}>Off</button><button className={`round-btn ${huntTimed ? 'selected' : ''}`} aria-pressed={huntTimed} onClick={() => setHuntTimed(true)}>On</button></div></div>}
      {pairVariant === 'time-trial' && inChampionship ? <p className="champ-setting-help">Find {atomicCount} pairs on a {atomicCount * 3}-pair board in each round.</p> : <div className="champ-setting-row" role="group" aria-label="Board pairs"><span>Pairs:</span><div className="champ-setting-controls">{[12, 16, 20].map(count => <button key={count} className={`round-btn ${pairCount === count ? 'selected' : ''}`} aria-pressed={pairCount === count} onClick={() => setPairCount(count)}>{count}</button>)}</div></div>}
      {pairVariant === 'time-trial' ? !inChampionship && <div className="champ-setting-row" role="group" aria-label="Matches to find"><span>Find:</span><div className="champ-setting-controls">{([3, 5, 8, 'all'] as TrialTarget[]).map(count => <button key={count} className={`round-btn ${trialTarget === count ? 'selected' : ''}`} aria-pressed={trialTarget === count} onClick={() => setTrialTarget(count)}>{count === 'all' ? 'All' : count}</button>)}</div></div> : <>
        <div className="champ-setting-row" role="group" aria-label="Hunt target mode"><span>Target:</span><div className="champ-setting-controls">{(['none', 'random', 'choose'] as HuntTargetMode[]).map(item => <button key={item} className={`round-btn ${huntTargetMode === item ? 'selected' : ''}`} aria-pressed={huntTargetMode === item} onClick={() => setHuntTargetMode(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div></div>
        {huntTargetMode === 'choose' && <label className="voice-setting-label">Target name<select className="voice-select" value={pairOptions.chosenTargetId ?? ''} onChange={event => setHuntChosenTarget(event.target.value)}>{availablePairTargets.map(pair => <option key={pair.id} value={pair.id}>{pair.name}</option>)}</select></label>}
        {huntTargetMode !== 'none' && <div className="champ-setting-row" role="group" aria-label="Target unlock"><span>Unlock after:</span><div className="champ-setting-controls">{[0, 1, 2, 3, 4, 5].map(count => <button key={count} className={`round-btn ${huntUnlockPairs === count ? 'selected' : ''}`} aria-pressed={huntUnlockPairs === count} onClick={() => setHuntUnlockPairs(count)}>{count}</button>)}<small className="champ-setting-help">pairs</small></div></div>}
      </>}
    </section>;
  };

  return <main className="app mario-app">
    {screen === 'home' && <section className="home-screen">
      <div className="home-header">
        <h1 className="game-title" aria-label="Mushroom Power Quiz">{['Mushroom', 'Power', 'Quiz'].map(word => <span className="title-word" aria-hidden="true" key={word}>{Array.from(word).map((letter, index) => <span className="title-letter" key={index}>{letter}</span>)}</span>)}</h1>
        <p className="mario-tagline">Unofficial Mario trivia and matching games with original icons, emoji and words.</p>
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
      <p className="hub-intro">Pick who is playing, then choose a game.</p>
      <div className="play-format-picker" role="group" aria-label="Who is playing?">
        {(['solo', 'two-player', 'computer'] as QuizFormat[]).map(item => <button key={item} className={`play-format-card ${quizFormat === item ? 'selected' : ''}`} aria-pressed={quizFormat === item} onClick={() => { setQuizFormat(item); setChampionshipFormat(item); }}>
          <span className="play-format-icon">{item === 'computer' ? <img className="mushbot-hub-avatar" src={MUSHBOT_IMAGE} alt="Mushbot" /> : item === 'two-player' ? '👥' : '🎮'}</span>
          <span className="play-format-title">{item === 'solo' ? 'Solo' : item === 'two-player' ? '2 Players' : 'Play Mushbot'}</span>
          <span className="play-format-description">{item === 'solo' ? 'Play alone and chase your best score.' : item === 'two-player' ? 'Pass the device between players.' : 'Challenge the mushroom robot.'}</span>
        </button>)}
      </div>
      <div className="play-selection-heading"><h3>Choose a game</h3><button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button></div>
      <div className="game-mode-grid">{(Object.keys(MODE_LABELS) as GameMode[]).map(item => <button key={item} className="game-mode-btn" onClick={() => openGame(item)}><span className="gm-icon">{MODE_ICONS[item]}</span><span className="gm-name">{MODE_LABELS[item]}</span><span className="gm-desc">{MODE_DESCRIPTIONS[item]}</span></button>)}</div>
      <button className="game-mode-btn championship mario-champ-entry" onClick={() => setScreen('championship-setup')}><span className="gm-icon">🏆</span><span className="gm-name">Championship</span><span className="gm-desc">Play several games in a row. Every point adds to your total.</span></button>
    </section>}

    {screen === 'championship-setup' && <section className="two-player-setup mario-setup">
      <button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button>
      <h2 className="setup-title">🏆 {championshipFormat === 'solo' ? 'Solo' : championshipFormat === 'two-player' ? 'Two-Player' : 'Mushbot'} Championship</h2>
      <p className="setup-intro">Choose at least two games. Earn points in each game to build your championship total.</p>
       <fieldset><legend>Players</legend><div className="round-select">{(['solo', 'two-player', 'computer'] as QuizFormat[]).map(item => <button key={item} className={`round-btn ${championshipFormat === item ? 'selected' : ''}`} aria-pressed={championshipFormat === item} onClick={() => setChampionshipFormat(item)}>{item === 'solo' ? 'Solo' : item === 'two-player' ? 'Two Players' : 'Play Mushbot'}</button>)}</div></fieldset>
       {championshipFormat === 'computer' && <div className="mushbot-intro"><img src={MUSHBOT_IMAGE} alt="Mushbot, a friendly mushroom-shaped robot" /><span>Meet Mushbot, your computer challenger.</span></div>}
      <label className="field-label" htmlFor="championship-player-name">Player name</label>
      <input id="championship-player-name" className="player-name-input" maxLength={24} value={draftName} onChange={event => setDraftName(event.target.value)} placeholder="Player" />
      {championshipFormat === 'two-player' && <><label className="field-label" htmlFor="championship-opponent-name">Player 2 name</label><input id="championship-opponent-name" className="player-name-input" maxLength={24} value={draftOpponent} onChange={event => setDraftOpponent(event.target.value)} placeholder="Player 2" /></>}
      <div className="difficulty-select" role="group" aria-label="Championship difficulty">{DIFFICULTIES.map(item => <button key={item} className={`diff-btn ${difficulty === item ? 'selected' : ''}`} aria-pressed={difficulty === item} onClick={() => setDifficulty(item)}><span className="diff-label">{DIFFICULTY_LABELS[item]}</span><span className="diff-desc">{DIFFICULTY_DESCRIPTIONS[item]}</span></button>)}</div>
      <div className="round-select"><span>Length:</span>{CHAMPIONSHIP_SIZES.map(item => <button key={item} className={`round-btn ${championshipSize === item ? 'selected' : ''}`} aria-pressed={championshipSize === item} onClick={() => setChampionshipSize(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
      <div className="champ-game-picker"><label>Games (choose at least 2):</label><div className="champ-games-list">{availableModes(section).map(item => <button key={item} className={`champ-game-chip champ-game-toggle ${championshipModes.includes(item) ? 'selected' : ''}`} aria-pressed={championshipModes.includes(item)} onClick={() => toggleChampionshipMode(item)}>{championshipModes.includes(item) ? '✓ ' : ''}{MODE_ICONS[item]} {MODE_LABELS[item]} · {championshipRoundCount(item, championshipSize)} rounds</button>)}</div></div>
      {chosenChampionshipModes.includes('pair-match') && renderPairSettings(true)}
      <p className="champ-info-footer">{chosenChampionshipModes.length} games selected · Each player’s total is the EP earned in their own games.</p>
      <button className="start-btn" disabled={chosenChampionshipModes.length < 2} onClick={startChampionship}>{championshipFormat === 'solo' ? 'Start Solo Championship' : 'Start Championship'}</button>
    </section>}

    {screen === 'championship-handover' && (championship || standalone) && <section className="quiz-playing mario-game quiz-panel versus-handover">
      <button className="back-btn" onClick={leaveGame}>← Games</button>
      {championship && <><p className="eyebrow">🏆 {championship.size} Championship · Game {championship.index + 1}/{championship.modes.length}</p><div className="champ-live-total"><span>{championshipNames[0]}: {championshipEarned[0]} EP</span><strong>{championshipNames[1]}: {championshipEarned[1]} EP</strong></div></>}
      <h1>{MODE_LABELS[mode]}</h1>
      <h2>{championship ? championshipNames[championship.turnIndex] : standalone?.turnIndex === 0 ? player : standalone?.opponent}'s turn</h2>
      <p>Pass the device to this player before showing the game.</p>
      <button className="start-btn" onClick={() => { startTime.current = mode === 'pair-match' && round?.mode === 'pair-match' && round.timed ? 0 : Date.now(); setScreen('game'); }}>Start {championship ? championshipNames[championship.turnIndex] : standalone?.turnIndex === 0 ? player : standalone?.opponent}'s turn</button>
    </section>}

    {screen === 'setup' && <section className="quiz-setup mario-setup">
      <button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button>
      <h2 className="setup-title">{MODE_ICONS[mode]} {MODE_LABELS[mode]}</h2>
      <p className="setup-intro">{MODE_DESCRIPTIONS[mode]}</p>
      <label className="field-label" htmlFor="player-name">Player name</label>
      <input id="player-name" className="player-name-input" maxLength={24} value={draftName} onChange={event => setDraftName(event.target.value)} placeholder="Player" />
      <fieldset><legend>Players</legend><div className="round-select">{(['solo', 'two-player', 'computer'] as QuizFormat[]).map(item => <button key={item} className={`round-btn ${quizFormat === item ? 'selected' : ''}`} aria-pressed={quizFormat === item} onClick={() => setQuizFormat(item)}>{item === 'solo' ? 'Solo' : item === 'two-player' ? 'Two Players' : 'Play Mushbot'}</button>)}</div></fieldset>
      {quizFormat === 'computer' && <div className="mushbot-intro"><img src={MUSHBOT_IMAGE} alt="Mushbot, a friendly mushroom-shaped robot" /><span>Meet Mushbot, your computer challenger.</span></div>}
      {quizFormat === 'two-player' && <><label className="field-label" htmlFor="opponent-name">Player 2 name</label><input id="opponent-name" className="player-name-input" maxLength={24} value={draftOpponent} onChange={event => setDraftOpponent(event.target.value)} placeholder="Player 2" /></>}
      <div className="difficulty-select" role="group" aria-label="Difficulty">{DIFFICULTIES.map(item => <button key={item} className={`diff-btn ${difficulty === item ? 'selected' : ''}`} onClick={() => setDifficulty(item)} aria-pressed={difficulty === item}><span className="diff-label">{DIFFICULTY_LABELS[item]}</span><span className="diff-desc">{DIFFICULTY_DESCRIPTIONS[item]}</span></button>)}</div>
      {mode === 'pair-match' && renderPairSettings(false)}
      {mode !== 'pair-match' && (mode !== 'quiz' || quizFormat === 'solo') && <fieldset><legend>Timer</legend><div className="round-select"><button className={`round-btn ${!timed ? 'selected' : ''}`} onClick={() => setTimed(false)} aria-pressed={!timed}>Off</button><button className={`round-btn ${timed ? 'selected' : ''}`} onClick={() => setTimed(true)} aria-pressed={timed}>On</button></div></fieldset>}
      <button className="start-btn" onClick={start}>Start!</button>
    </section>}

    {screen === 'versus-game' && versus && versusTurn && <section className="quiz-playing mario-game quiz-panel versus-game">
      <div className="game-topbar"><button className="back-btn" onClick={() => setScreen('hub')}>← Games</button><span className="score-display">{player} {versus.scores[0]} · {opponentName} {versus.scores[1]}</span></div>
      <div className="mario-points-line">{player}: {versus.points[0] + (versusTurn.playerIndex === 0 ? versus.submission?.points ?? 0 : 0)} EP · {opponentName}: {versus.points[1] + (versusTurn.playerIndex === 1 ? versus.submission?.points ?? 0 : 0)} EP</div>
      <div className="quiz-topline"><span>⚔️ Quiz Battle · {DIFFICULTY_LABELS[difficulty]}</span><span>Round {Math.floor(versus.index / 2) + 1} of 5</span></div>
      <div className="progress-track"><div style={{ width: `${(versus.index / versus.turns.length) * 100}%` }} /></div>
      {versusReady ? <div className="versus-handover">
        {versusTurn.playerIndex === 1 && quizFormat === 'computer' && <img className="mushbot-result" src={MUSHBOT_IMAGE} alt="Mushbot" />}
        <h1>{versusTurn.playerIndex === 0 ? player : opponentName}'s turn</h1>
         <p>{versusTurn.playerIndex === 1 && quizFormat === 'computer' ? 'Mushbot has its own question. Tap to watch its answer.' : 'Pass the device to this player before showing the question.'}</p>
        <button className="start-btn" onClick={() => setVersusReady(false)}>Start {versusTurn.playerIndex === 0 ? player : opponentName}'s turn</button>
      </div> : <>
        <p className="versus-now-playing">Now playing: {versusTurn.playerIndex === 0 ? player : opponentName}</p>
        <h1>{versusTurn.question.prompt}</h1>
        {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read question aloud" aria-label="Read question aloud" onClick={() => speakText(`${versusTurn.question.prompt} ${versusTurn.question.choices.join('. ')}`)}>🔊</button>}
        {versusTurn.computerAnswer !== undefined && !versus.submission
          ? <button className="start-btn" onClick={() => setVersus(answerVersusQuiz(versus, versusTurn.computerAnswer!))}>Reveal Mushbot's answer</button>
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

    {screen === 'versus-result' && latestResult && <section className="quiz-result result-panel">
      <p className="eyebrow">MATCH COMPLETE</p>
      {latestResult.format === 'computer' && <img className="mushbot-result" src={MUSHBOT_IMAGE} alt="Mushbot" />}
      <h1>{(latestResult.points ?? 0) === (latestResult.opponentPoints ?? 0) ? "It's a draw!" : `${(latestResult.points ?? 0) > (latestResult.opponentPoints ?? 0) ? player : opponentName} wins!`}</h1>
      <div className="result-card"><div className="result-stats"><div className="result-stat"><span className="stat-value">{latestResult.points} EP</span><span className="stat-label">{player} · {latestResult.correct}/{latestResult.total} correct</span></div><div className="result-stat"><span className="stat-value">{latestResult.opponentPoints} EP</span><span className="stat-label">{opponentName} · {latestResult.opponentCorrect}/{latestResult.total} correct</span></div></div><p>{MODE_LABELS[latestResult.mode ?? 'quiz']} · {LABELS[section]} · {DIFFICULTY_LABELS[difficulty]}</p></div>
      <button className="start-btn" onClick={start}>Play again</button>
      <button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button>
      <button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button>
    </section>}

    {screen === 'game' && round && session && <section className="quiz-playing mario-game quiz-panel">
      <div className="game-topbar"><button className="back-btn" onClick={leaveGame}>← Games</button><span className="score-display">{championship ? championshipNames[championship.turnIndex] : standalone?.turnIndex === 1 ? standalone.opponent : player} · {round.mode === 'pair-match' ? `${foundPairs.length} pairs` : `${session.correct + (session.submission?.correct ? 1 : 0)} correct`} · {gamePointsNow} EP</span></div>
      {championship && <><div className="champ-game-banner">🏆 {championship.size[0].toUpperCase() + championship.size.slice(1)} Championship · Game {championship.index + 1}/{championship.modes.length} · {MODE_LABELS[mode]}</div><div className="champ-live-total">{championship.format === 'solo' ? <><span>Total championship score so far</span><strong>{championshipEarned[0] + gamePointsNow} EP</strong></> : <><span>{championshipNames[0]}: {championshipEarned[0] + (championship.turnIndex === 0 ? gamePointsNow : 0)} EP</span><strong>{championshipNames[1]}: {championshipEarned[1] + (championship.turnIndex === 1 ? gamePointsNow : 0)} EP</strong></>}</div></>}
      <div className="quiz-topline"><span>{MODE_ICONS[mode]} {MODE_LABELS[mode]}{round.mode === 'pair-match' ? ` · ${round.variant === 'hunt' ? 'Hunt' : 'Time Trial'}` : ` · ${DIFFICULTY_LABELS[difficulty]}`}</span><span>{mode === 'pair-match' ? 'Board' : 'Question'} {session.index + 1} of {session.rounds.length}</span>{timed && <span aria-label="Elapsed time">{((elapsedMs - (mode === 'pair-match' ? previousRoundMs.current : 0)) / 1000).toFixed(1)}s</span>}</div>
      <div className="progress-track"><div style={{ width: `${(session.index / session.rounds.length) * 100}%` }} /></div>
      <h1>{round.prompt}</h1>
      {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read question aloud" aria-label="Read question aloud" onClick={() => speakText(round.mode === 'quiz' ? `${round.prompt} ${round.question.choices.join('. ')}` : round.prompt)}>🔊</button>}
      {round.mode === 'quiz' && <div className="answer-grid">{round.question.choices.map((choice, option) => <button key={choice} disabled={session.submission !== null} className={`choice-btn ${session.submission ? choice === round.question.answer ? 'correct' : choice === session.submission.answer ? 'wrong' : '' : ''}`} onClick={() => setSession(submit(session, choice))}><span className="choice-letter">{String.fromCharCode(65 + option)}</span><span className="choice-text">{choice}</span></button>)}</div>}

      {round.mode === 'game-order' && <>
        <p className="help-copy">Tap two games to swap them. The oldest should be on the left.</p>
        <div className="order-tiles">{orderDraft.map((id, position) => {
          const tile = round.tiles.find(game => game.id === id)!;
          const color = round.tiles.findIndex(game => game.id === id) % 5;
          return <button key={id} disabled={session.submission !== null} className={`order-color-${color} ${selectedOrderTile === position ? 'selected-tile' : ''}`} aria-pressed={selectedOrderTile === position} onClick={() => swapOrderTile(position)}>{tile.title}</button>;
        })}</div>
        {!session.submission && <button className="start-btn check-button" onClick={() => setSession(submit(session, orderDraft))}>Check order</button>}
      </>}

      {round.mode === 'track-finder' && <>
        <p className="help-copy">Choose one track. Every correct track in the cup counts.</p>
        <div className={`finder-grid finder-${round.width}`}>{round.tiles.map(course => <button key={course.id} disabled={session.submission !== null} className={session.submission && course.id === session.submission.answer ? session.submission.correct ? 'right-answer' : 'wrong-answer' : ''} onClick={() => setSession(submit(session, course.id))}>{course.title}</button>)}</div>
      </>}

      {round.mode === 'category-finder' && <>
        <p className="help-copy">Tap one tile that fits. Every tile of the requested type counts.</p>
        <div className={`finder-grid finder-${round.width} category-grid`}>{round.tiles.map(tile => <button key={tile.id} disabled={session.submission !== null} className={session.submission ? tile.category === round.targetCategory ? 'right-answer' : tile.id === session.submission.answer ? 'wrong-answer' : '' : ''} onClick={() => setSession(submit(session, tile.id))}><small>{tile.number}</small><span>{tile.name}</span></button>)}</div>
      </>}

      {round.mode === 'match-hunt' && <>
        <p className="help-copy">Tap a name and its matching clue. Find every pair.</p>
        <p className="match-retries" aria-live="polite">{matchRetriesLeft === 0 ? 'No retries left — the next wrong pair ends this round.' : `${matchRetriesLeft} ${matchRetriesLeft === 1 ? 'retry' : 'retries'} left.`}</p>
        <p className="match-progress" aria-live="polite">{matchedIds.length}/{round.pairs.length} pairs found</p>
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

      {round.mode === 'pair-match' && <>
        <p className="help-copy">Flip two cards. An icon and its matching word make a pair. {round.variant === 'time-trial' ? `Find ${round.goal} pairs as fast as you can.` : round.targetPairId ? `Hunt target: ${round.pairs.find(pair => pair.id === round.targetPairId)?.name}.` : 'Find every pair.'}</p>
        {round.variant === 'hunt' && round.targetPairId && <p className="hunt-target-banner">🎯 <strong>{round.pairs.find(pair => pair.id === round.targetPairId)?.name}</strong>{round.unlockPairs > 0 && <> · {foundPairs.length >= round.unlockPairs ? 'Unlocked!' : `Unlocks after ${round.unlockPairs} other pairs (${foundPairs.length}/${round.unlockPairs})`}</>}</p>}
        <p className="match-progress" aria-live="polite">{foundPairs.length}/{round.goal} pairs found · {pairMoves} {pairMoves === 1 ? 'move' : 'moves'} · {pairScore} points</p>
        {!session.submission && pairTimerReady && <button className="back-btn match-restart" onClick={undo}>↶ Restart go</button>}
        {!pairTimerReady ? <div className="pair-timer-ready"><p>The cards appear when the timer starts.</p><button className="start-btn" onClick={() => { startTime.current = Date.now(); setElapsedMs(previousRoundMs.current); setPairTimerReady(true); }}>Start Timer</button></div> : <div className="pair-card-grid" aria-label="Face-down pair cards">{round.cards.map((card, index) => {
          const visible = flippedCards.includes(card.id) || foundPairs.includes(card.pairId);
          const matched = foundPairs.includes(card.pairId);
          return <button key={card.id} type="button" data-pair-id={card.pairId} data-kind={card.kind} disabled={matched || pairLocked || session.submission !== null} className={`pair-card ${visible ? 'pair-card-face' : 'pair-card-back'} ${matched ? 'pair-card-found' : ''}`} aria-label={visible ? card.kind === 'word' ? `Word: ${card.label}` : `Icon: ${card.iconAlt ?? card.label}` : `Hidden card ${index + 1}`} aria-pressed={visible} onClick={() => flipPairCard(card.id)}>{visible ? card.kind === 'word' ? <span className="pair-card-word">{card.label}</span> : card.iconKind === 'svg' ? <img className="pair-card-svg" src={`${import.meta.env.BASE_URL}${card.label}`} alt="" aria-hidden="true" /> : <span className={card.iconKind === 'text' ? 'pair-card-text-icon' : 'pair-card-icon'}>{card.label}</span> : <span className="pair-card-mark" aria-hidden="true">?</span>}</button>;
        })}</div>}
        {pairMessage && <p className="match-message" aria-live="polite">{pairMessage}</p>}
      </>}

      {round.mode === 'clue-duel' && <>
        <p className="help-copy">Guess when you are ready. A wrong guess reveals the next clue. You can also ask to see it.</p>
        <p className="clue-count">Clue {clueIndex + 1} of 5</p>
        <ol className="clue-list">{round.clues.slice(0, clueIndex + 1).map((clue, index) => <li key={index}>{clue}</li>)}</ol>
        {clueMessage && !session.submission && <p className="match-message" aria-live="polite">{clueMessage}</p>}
        {!session.submission && clueIndex < 4 && <button className="back-btn clue-reveal" onClick={() => { setClueIndex(current => current + 1); setClueMessage(''); }}>Show next clue</button>}
        <div className="answer-grid">{round.choices.map((choice, option) => <button key={choice.id} disabled={session.submission !== null} className={`choice-btn ${session.submission ? choice.id === round.answerId ? 'correct' : choice.id === session.submission.answer ? 'wrong' : '' : ''}`} onClick={() => guessClue(choice.id)}><span className="choice-letter">{String.fromCharCode(65 + option)}</span><span className="choice-text">{choice.label}</span></button>)}</div>
      </>}

      {session.submission && <div className="quiz-explanation feedback" aria-live="polite">
        <h2>{session.submission.correct ? 'Correct!' : round.mode === 'match-hunt' ? 'Round over' : `Answer: ${session.submission.correctLabel}`}</h2>
        <p>{round.explanation}</p>
        <p><strong>Fun fact:</strong> {round.funFact}</p>
        <p className="mario-earned">+{session.submission.points} EP</p>
        {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read explanation aloud" aria-label="Read explanation aloud" onClick={() => speakText(`${round.explanation} Fun fact: ${round.funFact}`)}>🔊</button>}
        <a href={round.sourceUrl} target="_blank" rel="noreferrer">Check the source ↗</a>
        <div className="feedback-actions"><button className="back-btn" onClick={undo}>↶ Rewind</button><button className="start-btn" onClick={next}>{session.index + 1 === session.rounds.length ? 'See result' : mode === 'pair-match' ? 'Next board →' : 'Next question →'}</button></div>
      </div>}
    </section>}

    {screen === 'result' && latestResult && <section className="quiz-result result-panel">
      <p className="eyebrow">{championship ? `CHAMPIONSHIP · GAME ${championship.index + 1} OF ${championship.modes.length}` : 'GAME COMPLETE'}</p>
      <h1>Nice work, {latestResult.player}!</h1>
      <div className="result-card"><div className="result-stats"><div className="result-stat"><span className="stat-value">{latestResult.correct}/{latestResult.total}</span><span className="stat-label">Correct</span></div><div className="result-stat"><span className="stat-value">{latestResult.points ?? latestResult.correct}</span><span className="stat-label">EP earned</span></div></div><p>{modeLabel(latestResult.mode)}{latestResult.variant ? ` · ${latestResult.variant === 'hunt' ? 'Hunt' : 'Time Trial'}` : ''} · {LABELS[latestResult.topic]} · {DIFFICULTY_LABELS[latestResult.difficulty]}{timed ? ` · ${(latestResult.elapsedMs / 1000).toFixed(1)}s` : ''}</p></div>
      {championship ? <><div className="champ-live-total">{championship.format === 'solo' ? <><span>Total championship score so far</span><strong>{championshipEarned[0] + (latestResult.points ?? latestResult.correct)} EP</strong></> : <><span>{championshipNames[0]}: {championshipEarned[0] + (championship.turnIndex === 0 ? latestResult.points ?? latestResult.correct : 0)} EP</span><strong>{championshipNames[1]}: {championshipEarned[1] + (championship.format === 'computer' ? championshipBotPreview : championship.turnIndex === 1 ? latestResult.points ?? latestResult.correct : 0)} EP</strong></>}</div>{championship.format === 'computer' && <p>Mushbot played the same rounds. Its score is included above.</p>}<button className="start-btn" onClick={continueChampionship}>{championship.format === 'two-player' && championship.turnIndex === 0 ? `Pass to ${championship.opponent} →` : championship.index + 1 === championship.modes.length ? 'See championship result' : `Next: ${MODE_LABELS[championship.modes[championship.index + 1]]} →`}</button></> : standalone?.format === 'two-player' && standalone.turnIndex === 0 ? <button className="start-btn" onClick={continueStandalone}>Pass to {standalone.opponent} →</button> : <button className="start-btn" onClick={start}>Play again</button>}
      <button className="back-btn" onClick={leaveGame}>← Back to games</button>
      {!championship && <button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button>}
    </section>}

    {screen === 'championship-result' && finishedChampionship && <section className="quiz-result result-panel">
      <p className="eyebrow">CHAMPIONSHIP COMPLETE</p><h1>🏆 {finishedChampionship.opponent ? finishedChampionship.points === finishedChampionship.opponentPoints ? "It's a draw!" : `${finishedChampionship.points > (finishedChampionship.opponentPoints ?? 0) ? finishedChampionship.player : finishedChampionship.opponent} wins!` : `Nice work, ${finishedChampionship.player}!`}</h1>
      {finishedChampionship.format === 'computer' && <img className="mushbot-result" src={MUSHBOT_IMAGE} alt="Mushbot" />}
      <div className="result-card"><div className="result-stats"><div className="result-stat"><span className="stat-value">{finishedChampionship.points}</span><span className="stat-label">{finishedChampionship.player} · total EP</span></div><div className="result-stat"><span className="stat-value">{finishedChampionship.opponent ? finishedChampionship.opponentPoints : finishedChampionship.games.length}</span><span className="stat-label">{finishedChampionship.opponent ? `${finishedChampionship.opponent} · total EP` : 'Games'}</span></div></div><p>{finishedChampionship.size} · {LABELS[finishedChampionship.topic]} · {DIFFICULTY_LABELS[finishedChampionship.difficulty]}</p></div>
      <div className="champ-running-total"><h3>Game breakdown</h3>{finishedChampionship.games.map((game, index) => <div className="champ-total-row" key={game.mode}><span>{MODE_ICONS[game.mode]} {modeLabel(game.mode)}{game.variant ? ` · ${game.variant === 'hunt' ? 'Hunt' : 'Time Trial'}` : ''}</span><strong>{finishedChampionship.player}: {game.points ?? game.correct} EP{finishedChampionship.opponent ? ` · ${finishedChampionship.opponent}: ${finishedChampionship.opponentGames?.[index]?.points ?? 0} EP` : ''}</strong></div>)}</div>
      <button className="start-btn" onClick={() => setScreen('championship-setup')}>Play again</button><button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button><button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button>
    </section>}

    {screen === 'scores' && <section className="high-scores-screen">
      <div className="high-scores-header"><button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button><div><h2>🏆 High Scores</h2><p>Your finished games</p></div></div>
      {scores.length === 0 ? <p>No completed games yet.</p> : <ol className="score-list">{scores.slice(0, 20).map(result => <li key={result.id}><span><strong>{result.opponent ? `${result.player} vs ${result.opponent}` : result.player}</strong><small>{modeLabel(result.mode)}{result.variant ? ` · ${result.variant === 'hunt' ? 'Hunt' : 'Time Trial'}` : ''} · {LABELS[result.topic]} · {DIFFICULTY_LABELS[result.difficulty]} · {result.opponent ? `${result.correct}–${result.opponentCorrect}` : `${result.correct}/${result.total}`} correct</small></span><strong>{result.opponent ? `${result.points ?? result.correct}–${result.opponentPoints ?? result.opponentCorrect} EP` : `${result.points ?? result.correct} EP`}</strong></li>)}</ol>}
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
