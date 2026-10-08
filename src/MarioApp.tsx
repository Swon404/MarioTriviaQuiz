import { trackLabel } from './mario/trackChallenges.ts';
import { readCheckpoint, saveCheckpoint, clearCheckpoint } from './mario/checkpoint.ts';
import { fitsCategory, categoryContext } from './mario/categoryCatalog.ts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { chooseMemoryCard, rememberCard, seededBotRandom, type CardMemory } from './mario/memoryBot.ts';
import { computerRoundTime } from './mario/botTiming.ts';
import { QUESTIONS, type Difficulty } from './mario/questions.ts';
import { recentKnowledge, recordSeenKnowledge } from './mario/questionHistory.ts';
import { getChampionshipResults, getPlayer, getResults, saveChampionshipResult, savePlayer, saveResult, type ChampionshipResult, type QuizResult } from './mario/storage.ts';
import { CHAMPIONSHIP_SIZES, championshipPoints, championshipRoundCount, computerChampionshipAnswers, createChampionshipRounds, type ChampionshipSize } from './mario/championship.ts';
import { BOOSTER_COURSES, BOOSTER_SOURCE } from './mario/courses.ts';
import { availableModes, createRounds, type GameMode, type GameRound, type HuntTargetMode, type PairMatchOptions, type PairVariant, type Section, type TrialTarget } from './mario/rounds.ts';
import { ICON_PAIRS } from './mario/pairCatalog.ts';
import { advance, attemptQuiz, rewind, startSession, submit, type Answer, type GameSession } from './mario/session.ts';
import { advanceVersusQuiz, answerVersusQuiz, attemptVersusQuiz, rewindVersusQuiz, startVersusQuiz, type VersusQuiz } from './mario/versus.ts';
import { QUIZ_RETRIES } from './mario/retries.ts';
import { getNextRank, getRank, MILESTONES } from './mario/scoring.ts';
import { lifetimeProgress, progressStorageProblem } from './mario/lifetimeProgress.ts';
import { availableVoices, getSpeechRate, getVoiceName, setSpeechRate, setVoiceName, speakText, speechAvailable, stopSpeaking } from './mario/tts.ts';
import { useSavedSetting, oneOf, isBoolean, isName } from './mario/settings.ts';
import { ORDER_RULES, orderTileOptions, markOrderPractice, type OrderChallenge, type OrderOptions } from './mario/gameOrder.ts';
import { newTurnScores, scoreTurn, type TurnScores } from './mario/turns.ts';
import OrderBoard, { type OrderCheckpoint } from './OrderBoard.tsx';
import TimerCountdown from './TimerCountdown.tsx';
import GameHelp from './GameHelp.tsx';
import CompactSettings from './CompactSettings.tsx';
import './phone.css';
import LearningCards, { LearningFeedback } from './LearningCards.tsx';
import PairLeaderboards, { PairTimeList } from './PairLeaderboard.tsx';
import OrderLeaderboards from './OrderLeaderboards.tsx';
import type { ReplayFrame } from './mario/replay.ts';
import { pairConfiguration, pairLeaderboard, savePairTime } from './mario/pairTimes.ts';

type Screen = 'home' | 'hub' | 'setup' | 'championship-setup' | 'championship-handover' | 'game' | 'result' | 'championship-result' | 'versus-game' | 'versus-result' | 'scores' | 'tracks' | 'explore';
type QuizFormat = 'solo' | 'two-player' | 'computer';
type ChampionshipRun = { id: string; size: ChampionshipSize; topic: Section; difficulty: Difficulty; modes: GameMode[]; index: number; legs: QuizResult[]; pairOptions: PairMatchOptions; format: QuizFormat; opponent: string; turnIndex: 0 | 1; rounds: GameRound[]; computerAnswers: Answer[] };
type StandaloneRun = { format: 'two-player' | 'computer'; opponent: string; turnIndex: 0 | 1; rounds: GameRound[]; computerAnswers: Answer[]; firstResult?: QuizResult };
const MUSHBOT = 'Shroomer';
const MUSHBOT_IMAGE = `${import.meta.env.BASE_URL}shroomer.svg`;
const MATCH_RETRIES: Record<Difficulty, number> = { explorer: 3, scientist: 1, professor: 0 };

const LABELS: Record<Section, string> = { mario: 'Mario games', kart: 'Mario Kart', mixed: 'A bit of both' };
const MODE_LABELS: Record<GameMode, string> = { quiz: 'Quiz Battle', 'game-order': 'Game Order', 'track-finder': 'Track Finder', 'match-hunt': 'Clue Match Up', 'pair-match': 'Match & Hunt', 'clue-duel': 'Clue Duel', 'category-finder': 'Category Finder' };
const MODE_ICONS: Record<GameMode, string> = { quiz: '⚔️', 'game-order': '🔢', 'track-finder': '🔎', 'match-hunt': '🃏', 'pair-match': '🎴', 'clue-duel': '🕵️', 'category-finder': '🗂️' };
const MODE_DESCRIPTIONS: Record<GameMode, string> = {
  quiz: 'Four-choice questions about characters, baddies, power-ups, games, consoles, tracks and famous fixed bugs.',
  'game-order': 'Put Mario games in release order.',
  'track-finder': 'Find tracks by cup, original console or course features.',
  'match-hunt': 'Match each name with its clue. Three rounds of visible pairs.',
  'pair-match': 'Flip icon and word cards. Switch between Hunt and Time Trial.',
  'clue-duel': 'Guess a character or track from five clues that get clearer. Five rounds.',
  'category-finder': 'Find one character, baddie, power-up, game or system that fits the clue.',
};
const modeLabel = (value: string | undefined) => value === 'pair-hunt' ? 'Match & Hunt · Hunt' : MODE_LABELS[(value ?? 'quiz') as GameMode] ?? 'Unknown game';
const DIFFICULTIES: Difficulty[] = ['explorer', 'scientist', 'professor'];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  explorer: 'Rookie',
  scientist: 'Pro',
  professor: 'Legend',
};
const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  explorer: 'Familiar favourites and smaller boards.',
  scientist: 'More to find and trickier questions.',
  professor: 'Biggest boards and the toughest challenges.',
};

export default function MarioApp() {
  const [player, setPlayer] = useState(getPlayer);
  const [draftName, setDraftName] = useSavedSetting('player-name', player, isName);
  const [draftOpponent, setDraftOpponent] = useSavedSetting('opponent-name', 'Player 2', isName);
  const [opponentName, setOpponentName] = useState('Player 2');
  const [quizFormat, setQuizFormat] = useSavedSetting<QuizFormat>('format', 'solo', oneOf(['solo', 'two-player', 'computer']));
  const section: Section = 'mixed';
  const [mode, setMode] = useState<GameMode>('quiz');
  const [difficulty, setDifficulty] = useSavedSetting<Difficulty>('difficulty', 'explorer', oneOf(DIFFICULTIES));
  const [timerEnabled, setTimerEnabled] = useSavedSetting('timer', false, isBoolean);
  const [orderChallenge, setOrderChallenge] = useSavedSetting<OrderChallenge>('order-challenge', 'easy', oneOf(['easy', 'medium', 'hard']));
  const [orderCounts, setOrderCounts] = useSavedSetting<Record<Difficulty, number>>('order-tiles', { explorer: 3, scientist: 4, professor: 5 }, value => Boolean(value && typeof value === 'object' && DIFFICULTIES.every(level => orderTileOptions(level).includes((value as Record<Difficulty, number>)[level]))));
  const orderOptions: OrderOptions = { challenge: orderChallenge, tiles: orderCounts[difficulty] };
  const [orderReset, setOrderReset] = useState(0);
  const [orderCheckpoint, setOrderCheckpoint] = useState<OrderCheckpoint | null>(null);
  const [runId, setRunId] = useState(() => crypto.randomUUID());
  const [turnScores, setTurnScores] = useState<TurnScores | null>(null);
  const [clueBonus, setClueBonus] = useState(false);
  const [pairVariant, setPairVariant] = useSavedSetting<PairVariant>('pair-variant', 'hunt', oneOf(['hunt', 'time-trial']));
  const [pairCount, setPairCount] = useSavedSetting('pair-count', 12, oneOf([12, 16, 20]));
  const [trialTarget, setTrialTarget] = useSavedSetting<TrialTarget>('trial-target', 5, oneOf([3, 5, 8, 'all']));
  const [huntTimed, setHuntTimed] = useSavedSetting('hunt-timed', false, isBoolean);
  const [huntTargetMode, setHuntTargetMode] = useSavedSetting<HuntTargetMode>('hunt-target-mode', 'none', oneOf(['none', 'random', 'choose']));
  const [huntChosenTarget, setHuntChosenTarget] = useSavedSetting<string | null>('hunt-target', null, value => value === null || ICON_PAIRS.some(pair => pair.id === value));
  const [huntUnlockPairs, setHuntUnlockPairs] = useSavedSetting('hunt-unlock', 0, oneOf([0, 1, 2, 3, 4, 5]));
  const [screen, setScreen] = useState<Screen>('home');
  const [session, setSession] = useState<GameSession | null>(null);
  const [versus, setVersus] = useState<VersusQuiz | null>(null);
  const [versusReady, setVersusReady] = useState(false);
  useEffect(() => {
    if (!(screen === 'game' && session?.submission) && !(screen === 'versus-game' && versus?.submission)) return;
    const heading = document.querySelector<HTMLElement>('.feedback h2, .order-feedback');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [screen, session?.submission, versus?.submission]);
  useEffect(() => {
    stopSpeaking();
    const heading = document.querySelector<HTMLElement>('.mario-app h1, .mario-app h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.classList.add('mobile-round-focus');
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [screen, session?.index, versus?.index, versusReady]);
  const timed = mode === 'game-order' || (mode === 'pair-match' ? pairVariant === 'time-trial' || huntTimed : timerEnabled);
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
  const [championshipSize, setChampionshipSize] = useSavedSetting<ChampionshipSize>('champ-size', 'standard', oneOf(CHAMPIONSHIP_SIZES));
  const [championshipModes, setChampionshipModes] = useSavedSetting<GameMode[]>('champ-games', Object.keys(MODE_LABELS) as GameMode[], value => Array.isArray(value) && value.length <= 7 && new Set(value).size === value.length && value.every(item => item in MODE_LABELS));
  const [championshipFormat, setChampionshipFormat] = useSavedSetting<QuizFormat>('champ-format', 'solo', oneOf(['solo', 'two-player', 'computer']));
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
  const practisedRounds = useRef(new Set<string>());
  const pairFrames = useRef<ReplayFrame[]>([]);
  const botMemory = useRef<CardMemory>([]);
  const botRandom = useRef(seededBotRandom('initial'));

  useEffect(() => () => {
    if (pairFlipTimeout.current !== null) window.clearTimeout(pairFlipTimeout.current);
  }, []);

  useEffect(() => {
    if (screen !== 'game' || mode === 'game-order' || !timed || (mode === 'pair-match' && (!pairTimerReady || session?.submission))) return;
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
  useEffect(() => {
    const format = screen === 'versus-game' ? quizFormat : championship?.format ?? standalone?.format ?? 'solo';
    const viewers = format === 'two-player' ? [player, opponentName] : [player];
    const privateBot = format === 'computer' && turnScores?.active === 1;
    if (screen === 'versus-game' && !versusReady && versusTurn) recordSeenKnowledge(viewers, [versusTurn.question.knowledgeId]);
    if (screen === 'game' && round?.mode === 'quiz') recordSeenKnowledge(viewers, [round.question.knowledgeId]);
    if (screen === 'game' && round?.mode === 'match-hunt' && !privateBot) recordSeenKnowledge(viewers, round.pairs.map(pair => QUESTIONS.find(question => question.id === pair.id)!.knowledgeId));
    if (screen === 'game' && (round?.mode === 'clue-duel' || ((round?.mode === 'track-finder' || round?.mode === 'category-finder') && (!privateBot || session?.submission)))) recordSeenKnowledge(viewers, [round.id]);
  }, [screen, versusReady, versusTurn, round, player, opponentName, quizFormat, championship?.format, standalone?.format, turnScores?.active, session?.submission]);
  const scores = useMemo(() => getResults().sort((a, b) => Math.max(b.points ?? b.correct, b.opponentPoints ?? b.opponentCorrect ?? 0) - Math.max(a.points ?? a.correct, a.opponentPoints ?? a.opponentCorrect ?? 0) || a.elapsedMs - b.elapsedMs), [screen]);
  const progress = lifetimeProgress(scores, player);
  const rank = getRank(progress.totalEP);
  const nextRank = getNextRank(progress.totalEP);
  const rankProgress = nextRank ? (progress.totalEP - rank.minEP) / (nextRank.minEP - rank.minEP) * 100 : 100;
  const homeTip = useMemo(() => 'Hi, I’m Shroomer! Ready for an adventure? Play together, challenge me, or beat your best score!', []);
  const championshipScores = useMemo(() => getChampionshipResults().sort((a, b) => b.points - a.points || a.completedAt.localeCompare(b.completedAt)), [screen]);
  const chosenChampionshipModes = (Object.keys(MODE_LABELS) as GameMode[]).filter(item => championshipModes.includes(item) && availableModes(section).includes(item));
  const championshipEarned = championship ? [championshipPoints(championship.legs.filter(leg => leg.player === player)), championshipPoints(championship.legs.filter(leg => leg.player === championship.opponent))] : [0, 0];
  const matchRetriesLeft = Math.max(0, MATCH_RETRIES[difficulty] - matchMistakes);
  const sharedHunt = Boolean(turnScores && round?.mode === 'pair-match' && !round.timed);
  const pairScores = useMemo(() => round?.mode === 'pair-match' && round.timed ? pairLeaderboard(round, difficulty) : [], [round, difficulty, session?.submission]);
  const [sharedAwards, setSharedAwards] = useState<[number, number]>([0, 0]);
  const [sharedMatches, setSharedMatches] = useState<[number, number]>([0, 0]);
  const activePlayer = turnScores?.active ?? 0;
  const activeName = activePlayer === 0 ? player : opponentName;
  const isBotTurn = activePlayer === 1 && (championship?.format ?? standalone?.format) === 'computer';
  const gamePointsNow = (turnScores ? turnScores.points[activePlayer] : session?.points ?? 0) + (round?.mode === 'pair-match' && !turnScores ? session?.submission?.points ?? pairScore : session?.submission?.points ?? 0);
  const liveTotals = [0, 1].map(index => championshipEarned[index] + (turnScores ? turnScores.points[index] + (index === activePlayer ? round?.mode === 'pair-match' && !turnScores ? session?.submission?.points ?? pairScore : session?.submission?.points ?? 0 : 0) : championship?.format === 'solo' ? index === 0 ? gamePointsNow : 0 : 0));
  const [botTimes, setBotTimes] = useState<number[]>([]);
  const [clueWrongIds, setClueWrongIds] = useState<string[]>([]);
  const recoveryCheckpoint = { kind: 'game-recovery-v1', orderCheckpoint, player, opponentName, mode, difficulty, quizFormat, timerEnabled,
    screen, session, versus, versusReady, runId, turnScores, championship, standalone, latestResult,
    orderChallenge, orderCounts, pairVariant, pairCount, trialTarget, huntTimed, huntTargetMode, huntChosenTarget, huntUnlockPairs,
    matchedIds, selectedMatchName, selectedMatchClue, matchMessage, matchMistakes,
    flippedCards, foundPairs, pairMoves, pairLocked, pairMessage, pairScore, pairTimerReady,
    clueIndex, clueMessage, clueBonus, clueWrongIds, sharedAwards, sharedMatches,
    pairFrames: pairFrames.current, practisedRounds: [...practisedRounds.current], botMemory: botMemory.current,
    botTimes, startedAt: startTime.current, previousRoundMs: previousRoundMs.current, completedMs: pairRoundCompletedMs.current };
  const [pendingResume, setPendingResume] = useState(() => {
    const saved = readCheckpoint<typeof recoveryCheckpoint>();
    return saved?.kind === 'game-recovery-v1' && ['game', 'versus-game', 'championship-handover', 'result'].includes(saved.screen) ? saved : null;
  });
  const [checkpointWarning, setCheckpointWarning] = useState(false);
  const lastCheckpoint = useRef('');
  useEffect(() => {
    const inProgress = ['game', 'versus-game', 'championship-handover'].includes(screen) || (screen === 'result' && championship !== null);
    if (!inProgress) return;
    const payload = JSON.stringify(recoveryCheckpoint);
    if (payload === lastCheckpoint.current) return;
    if (saveCheckpoint(recoveryCheckpoint)) { lastCheckpoint.current = payload; setCheckpointWarning(false); }
    else setCheckpointWarning(true);
  }, [screen, mode, session, versus, versusReady, runId, turnScores, championship, standalone, latestResult,
    botTimes, orderCheckpoint, player, opponentName, difficulty, quizFormat, timerEnabled, orderChallenge, orderCounts,
    pairVariant, pairCount, trialTarget, huntTimed, huntTargetMode, huntChosenTarget, huntUnlockPairs,
    matchedIds, selectedMatchName, selectedMatchClue, matchMessage, matchMistakes, flippedCards, foundPairs,
    pairMoves, pairLocked, pairMessage, pairScore, pairTimerReady, clueIndex, clueMessage, clueBonus, clueWrongIds, sharedAwards, sharedMatches]);
  const resumeGame = () => {
    if (!pendingResume) return;
    const saved = pendingResume;
    setPlayer(saved.player); savePlayer(saved.player); setOpponentName((saved.championship?.format ?? saved.standalone?.format ?? saved.quizFormat) === 'computer' ? MUSHBOT : saved.opponentName);
    setMode(saved.mode); setDifficulty(saved.difficulty); setQuizFormat(saved.quizFormat); setTimerEnabled(saved.timerEnabled);
    setSession(saved.session); setVersus(saved.versus); setVersusReady(saved.versusReady);
    setRunId(saved.runId); setTurnScores(saved.turnScores); setChampionship(saved.championship); setStandalone(saved.standalone);
    setLatestResult(saved.latestResult); setBotTimes(saved.botTimes);
    setOrderChallenge(saved.orderChallenge); setOrderCounts(saved.orderCounts);
    setOrderCheckpoint(saved.orderCheckpoint);
    if (saved.orderCheckpoint?.practice) markOrderPractice(saved.orderCheckpoint.resultId);
    setPairVariant(saved.pairVariant); setPairCount(saved.pairCount); setTrialTarget(saved.trialTarget); setHuntTimed(saved.huntTimed);
    setHuntTargetMode(saved.huntTargetMode); setHuntChosenTarget(saved.huntChosenTarget); setHuntUnlockPairs(saved.huntUnlockPairs);
    setMatchedIds(saved.matchedIds); setSelectedMatchName(saved.selectedMatchName); setSelectedMatchClue(saved.selectedMatchClue);
    setMatchMessage(saved.matchMessage); setMatchMistakes(saved.matchMistakes);
    setFlippedCards(saved.pairLocked ? [] : saved.flippedCards); setFoundPairs(saved.foundPairs); setPairMoves(saved.pairMoves);
    setPairLocked(false); setPairMessage(saved.pairLocked ? 'Game restored. Continue this turn.' : saved.pairMessage);
    setPairScore(saved.pairScore); setPairTimerReady(saved.pairTimerReady);
    setClueIndex(saved.clueIndex); setClueMessage(saved.clueMessage); setClueBonus(saved.clueBonus); setClueWrongIds(saved.clueWrongIds);
    setSharedAwards(saved.sharedAwards); setSharedMatches(saved.sharedMatches);
    pairFrames.current = saved.pairFrames; practisedRounds.current = new Set(saved.practisedRounds); botMemory.current = saved.botMemory;
    botRandom.current = seededBotRandom(`${saved.runId}:resume:${saved.pairMoves}`);
    const restoredRound = saved.session?.rounds[saved.session.index];
    if (saved.pairLocked && saved.pairMessage === 'Not a pair — remember where they are!' && saved.turnScores && restoredRound?.mode === 'pair-match' && !restoredRound.timed) {
      setTurnScores({ ...saved.turnScores, active: (1 - saved.turnScores.active) as 0 | 1 });
    }
    startTime.current = saved.startedAt; previousRoundMs.current = saved.previousRoundMs; pairRoundCompletedMs.current = saved.completedMs;
    setElapsedMs(saved.previousRoundMs + (saved.startedAt ? Date.now() - saved.startedAt : 0));
    setScreen(saved.screen); setPendingResume(null);
  };
  const renderTotals = () => championship && <div className="champ-live-total"><span>{player}: {liveTotals[0]} EP</span>{championship.format !== 'solo' && <strong>{opponentName}: {liveTotals[1]} EP</strong>}</div>;
  const availablePairTargets = ICON_PAIRS;
  const pairOptions: PairMatchOptions = {
    variant: pairVariant, pairCount, trialTarget, huntTimed,
    targetMode: huntTargetMode, chosenTargetId: huntChosenTarget && availablePairTargets.some(pair => pair.id === huntChosenTarget) ? huntChosenTarget : availablePairTargets[0]?.id ?? null,
    unlockPairs: huntUnlockPairs,
  };

  const openGame = (next: GameMode) => {
    setChampionship(null);
    setStandalone(null);
    setTurnScores(null);
    setMode(next);
    setScreen('setup');
  };

  const toggleChampionshipMode = (item: GameMode) => {
    setChampionshipModes(current => current.includes(item) ? current.filter(modeId => modeId !== item) : [...current, item]);
  };

  const prepareRound = (next: GameRound | undefined) => {
    pairFrames.current = [];
    if (pairFlipTimeout.current !== null) window.clearTimeout(pairFlipTimeout.current);
    pairFlipTimeout.current = null;
    botMemory.current = [];
    botRandom.current = seededBotRandom(next?.id ?? 'empty');
    setOrderReset(value => value + 1);
    setOrderCheckpoint(null);
    setClueBonus(false);
    setClueWrongIds([]);
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
    setSharedAwards([0, 0]);
    setSharedMatches([0, 0]);
    setPairTimerReady(next?.mode !== 'pair-match' || !next.timed);
    pairRoundCompletedMs.current = null;
    setClueIndex(0);
    setClueMessage('');
  };

  const start = () => {
    clearCheckpoint(); setPendingResume(null); lastCheckpoint.current = '';
    const name = draftName.trim().slice(0, 24) || 'Player';
    savePlayer(name);
    setPlayer(name);
    setDraftName(name);
    if (mode === 'quiz' && quizFormat !== 'solo') {
      setRunId(crypto.randomUUID());
      const wanted = quizFormat === 'computer' ? MUSHBOT : draftOpponent.trim().slice(0, 24) || 'Player 2';
      const other = wanted.toLowerCase() === name.toLowerCase() ? `${wanted} 2` : wanted;
      setOpponentName(other);
      setStandalone(null);
      setTurnScores(null);
      setVersus(startVersusQuiz(section, difficulty, quizFormat === 'computer' ? 'computer' : 'human', Math.random, recentKnowledge(quizFormat === 'computer' ? [name] : [name, other])));
      setVersusReady(true);
      setLatestResult(null);
      startTime.current = Date.now();
      setScreen('versus-game');
      return;
    }
    const wanted = quizFormat === 'computer' ? MUSHBOT : draftOpponent.trim().slice(0, 24) || 'Player 2';
    const other = wanted.toLowerCase() === name.toLowerCase() ? `${wanted} 2` : wanted;
    const recent = recentKnowledge(quizFormat === 'two-player' ? [name, other] : [name]);
    const onePlayer = createRounds(mode, section, difficulty, Math.random, pairOptions, undefined, orderOptions, recent);
    const rounds = quizFormat === 'solo' || (mode === 'pair-match' && pairVariant === 'hunt' && !huntTimed) ? onePlayer : createRounds(mode, section, difficulty, Math.random, pairOptions, onePlayer.length * 2, orderOptions, recent, true);
    const game = startSession(rounds, difficulty);
    setRunId(crypto.randomUUID());
    setTurnScores(quizFormat === 'solo' ? null : newTurnScores());
    setBotTimes(rounds.map(item => computerRoundTime(item, difficulty)));
    setOpponentName(other);
    setStandalone(quizFormat === 'solo' ? null : {
      format: quizFormat, opponent: other, turnIndex: 0, rounds: [...game.rounds],
      computerAnswers: quizFormat === 'computer' ? computerChampionshipAnswers(game.rounds, difficulty) : [],
    });
    setSession(game);
    prepareRound(game.rounds[0]);
    setElapsedMs(0);
    setLatestResult(null);
    previousRoundMs.current = 0;
    startTime.current = mode === 'pair-match' && (pairVariant === 'time-trial' || huntTimed) ? 0 : Date.now();
    setScreen(quizFormat !== 'solo' ? 'championship-handover' : 'game');
  };

  const prepareChampionshipTurn = (run: ChampionshipRun) => {
    const nextMode = run.modes[run.index];
    const rounds = createChampionshipRounds(nextMode, run.topic, run.difficulty, run.size, Math.random, run.pairOptions, run.format === 'solo' || (nextMode === 'pair-match' && run.pairOptions.variant === 'hunt' && !run.pairOptions.huntTimed) ? 1 : 2, orderOptions, recentKnowledge(run.format === 'two-player' ? [getPlayer(), run.opponent] : [getPlayer()]));
    const ready = { ...run, turnIndex: 0 as const, rounds, computerAnswers: run.format === 'computer' ? computerChampionshipAnswers(rounds, run.difficulty) : [] };
    setChampionship(ready);
    setRunId(crypto.randomUUID());
    setTurnScores(run.format === 'solo' ? null : newTurnScores());
    setBotTimes(rounds.map(item => computerRoundTime(item, run.difficulty)));
    setMode(nextMode);
    const game = startSession(rounds, run.difficulty);
    setSession(game);
    prepareRound(game.rounds[0]);
    setElapsedMs(0);
    setLatestResult(null);
    previousRoundMs.current = 0;
    startTime.current = run.format === 'solo' ? Date.now() : 0;
    setScreen(run.format === 'solo' ? 'game' : 'championship-handover');
  };

  const startChampionship = () => {
    if (chosenChampionshipModes.length < 2) return;
    clearCheckpoint(); setPendingResume(null); lastCheckpoint.current = '';
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

  const finishChampionship = (run: ChampionshipRun, legs: QuizResult[]) => {
    clearCheckpoint();
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
    const legs = championship.format === 'solo' ? [...championship.legs, latestResult] : championship.legs;
    if (championship.index + 1 < championship.modes.length) {
      prepareChampionshipTurn({ ...championship, index: championship.index + 1, turnIndex: 0, legs, rounds: [], computerAnswers: [] });
    } else finishChampionship(championship, legs);
  };

  const next = () => {
    if (!session?.submission || !round) return;
    const roundMs = pairRoundCompletedMs.current ?? Math.max(1, Date.now() - startTime.current);
    const updated = advance(session);
    if (turnScores) {
      const totals = scoreTurn(turnScores, session.index, sharedHunt ? false : session.submission.correct, session.submission.points, roundMs, mode === 'game-order' || (round.mode === 'pair-match' && round.timed), mode === 'clue-duel');
      if (!updated.complete) {
        setTurnScores(totals);
        setSession({ ...updated, streak: totals.streaks[totals.active] });
        if (championship) setChampionship({ ...championship, turnIndex: totals.active });
        if (standalone) setStandalone({ ...standalone, turnIndex: totals.active });
        prepareRound(updated.rounds[updated.index]);
        previousRoundMs.current = 0;
        setElapsedMs(0);
        startTime.current = 0;
        setScreen('championship-handover');
        return;
      }
      const results = [player, opponentName].map((name, index): QuizResult => ({
        id: `${runId}:player-${index}`, mode, variant: round.mode === 'pair-match' ? round.variant : undefined,
        player: name, topic: section, difficulty, correct: totals.correct[index], total: sharedHunt ? updated.rounds.reduce((sum, item) => sum + (item.mode === 'pair-match' ? item.pairs.length : 0), 0) : mode === 'clue-duel' ? updated.rounds.length : updated.rounds.length / 2,
        points: totals.points[index], bestStreak: totals.bestStreaks[index], elapsedMs: totals.elapsed[index], completedAt: new Date().toISOString(),
      }));
      const combined = { ...results[0], opponent: opponentName, opponentCorrect: results[1].correct, opponentPoints: results[1].points, opponentBestStreak: results[1].bestStreak, format: championship?.format ?? standalone?.format };
      setSession(updated);
      setTurnScores(null);
      if (championship) {
        results.forEach(saveResult);
        setChampionship({ ...championship, legs: [...championship.legs, ...results] });
        setLatestResult(combined);
        setScreen('result');
      } else {
        clearCheckpoint();
        saveResult(combined);
        setLatestResult(combined);
        setScreen('versus-result');
      }
      return;
    }
    const totalMs = previousRoundMs.current + roundMs;
    previousRoundMs.current = totalMs;
    setSession(updated);
    prepareRound(updated.rounds[updated.index]);
    startTime.current = Date.now();
    if (!updated.complete) return;
    const result: QuizResult = {
      id: `${runId}:result`, mode, variant: round.mode === 'pair-match' ? round.variant : undefined,
      player, topic: section, difficulty, correct: updated.correct, total: updated.rounds.length,
      points: updated.points, bestStreak: updated.bestStreak, elapsedMs: totalMs, completedAt: new Date().toISOString(),
    };
    saveResult(result);
    setLatestResult(result);
    if (!championship) clearCheckpoint();
    setScreen('result');
  };

  const undo = () => {
    if (!session || !round) return;
    practisedRounds.current.add(runId + ':' + session.index);
    if (sharedHunt && turnScores) setTurnScores({ ...turnScores, active: (session.index % 2) as 0 | 1, points: [turnScores.points[0] - sharedAwards[0], turnScores.points[1] - sharedAwards[1]], correct: [turnScores.correct[0] - sharedMatches[0], turnScores.correct[1] - sharedMatches[1]] });
    setSession(rewind(session));
    prepareRound(round);
    if (round.mode === 'game-order' || round.mode === 'match-hunt' || round.mode === 'pair-match') {
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
      id: `${runId}:result`, mode: 'quiz', player, topic: section, difficulty,
      correct: updated.scores[0], total: 5, opponent: opponentName,
      points: updated.points[0], bestStreak: updated.bestStreaks[0],
      opponentCorrect: updated.scores[1], opponentPoints: updated.points[1], opponentBestStreak: updated.bestStreaks[1], format: quizFormat,
      elapsedMs: Date.now() - startTime.current, completedAt: new Date().toISOString(),
    };
    saveResult(result);
    setLatestResult(result);
    clearCheckpoint();
    setScreen('versus-result');
  };

  const leaveGame = () => {
    const unfinished = ['game', 'versus-game', 'championship-handover'].includes(screen) || (screen === 'result' && championship !== null);
    if (unfinished && !window.confirm('Leave this game? Your unfinished game will be lost. Completed records are kept. Choose Cancel to keep playing.')) return;
    clearCheckpoint(); setPendingResume(null);
    if (pairFlipTimeout.current !== null) window.clearTimeout(pairFlipTimeout.current);
    pairFlipTimeout.current = null;
    setChampionship(null);
    setStandalone(null);
    setTurnScores(null);
    stopSpeaking();
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

  const recordPairFrame = (event: string, visible: string[], matched: string[], atMs?: number) => {
    if (round?.mode !== 'pair-match' || !round.timed || pairFrames.current.length >= 2000) return;
    pairFrames.current.push({ atMs: Math.max(0, atMs ?? Date.now() - startTime.current), event,
      tiles: round.cards.map(card => ({ id: card.id,
        label: (card.iconKind === 'svg' || card.iconKind === 'image') ? card.iconAlt ?? card.pairId : card.label,
        image: card.kind === 'icon' && (card.iconKind === 'svg' || card.iconKind === 'image') ? card.label : undefined,
        state: matched.includes(card.pairId) ? 'matched' : visible.includes(card.id) ? 'selected' : 'hidden' })) });
  };
  const observeCard = (position: number) => {
    if (round?.mode !== 'pair-match') return;
    const card = round.cards[position];
    const format = championship?.format ?? standalone?.format ?? quizFormat;
    recordSeenKnowledge(format === 'two-player' ? [player, opponentName] : [player], [`memory-pair-${card.pairId}`]);
    botMemory.current = rememberCard(botMemory.current, { position, pairId: card.pairId, kind: card.kind }, difficulty);
  };
  const flipPairCard = (cardId: string) => {
    if (!session || round?.mode !== 'pair-match' || session.submission || pairLocked || !pairTimerReady || flippedCards.includes(cardId)) return;
    const card = round.cards.find(item => item.id === cardId);
    if (!card || foundPairs.includes(card.pairId)) return;
    if (round.variant === 'hunt' && round.targetPairId === card.pairId && foundPairs.length < round.unlockPairs) {
      observeCard(round.cards.indexOf(card));
      const remaining = round.unlockPairs - foundPairs.length;
      setPairMessage(`Target locked — find ${remaining} more ${remaining === 1 ? 'pair' : 'pairs'} first.`);
      recordPairFrame(`Target locked: ${remaining} more pairs needed`, flippedCards, foundPairs);
      return;
    }
    if (flippedCards.length === 0) {
      recordPairFrame('First card revealed', [cardId], foundPairs);
      observeCard(round.cards.indexOf(card));
      setFlippedCards([cardId]);
      setPairMessage('');
      return;
    }
    resolvePair(flippedCards[0], cardId);
  };
  const resolvePair = (firstId: string, cardId: string) => {
    if (!session || round?.mode !== 'pair-match' || session.submission || pairLocked) return;
    const first = round.cards.find(item => item.id === firstId)!;
    const card = round.cards.find(item => item.id === cardId)!;
    observeCard(round.cards.indexOf(first));
    observeCard(round.cards.indexOf(card));
    setPairMoves(count => count + 1);
    setFlippedCards([first.id, cardId]);
    recordPairFrame(first.pairId === card.pairId ? 'Second card revealed — a pair' : 'Second card revealed — not a pair', [first.id, cardId], foundPairs);
    if (first.pairId === card.pairId) {
      const nextFound = [...foundPairs, card.pairId];
      const targetFound = round.variant === 'hunt' && card.pairId === round.targetPairId;
      const gained = targetFound ? 4 : 1;
      const nextScore = pairScore + gained;
      setFoundPairs(nextFound);
      recordPairFrame(targetFound ? 'Hunt target found' : 'Pair matched', [], nextFound);
      setPairScore(nextScore);
      if (sharedHunt && turnScores) {
        const points: [number, number] = [...turnScores.points];
        const correct: [number, number] = [...turnScores.correct];
        points[activePlayer] += gained;
        correct[activePlayer] += 1;
        setTurnScores({ ...turnScores, points, correct });
        setSharedAwards(values => { const next: [number, number] = [...values]; next[activePlayer] += gained; return next; });
        setSharedMatches(values => { const next: [number, number] = [...values]; next[activePlayer] += 1; return next; });
      }
      setFlippedCards([]);
      setPairMessage(targetFound ? 'Target found! +2 for the pair and +2 Hunt bonus.' : 'Pair found! +1 point.');
      if (targetFound || nextFound.length >= round.goal) {
        pairRoundCompletedMs.current = Math.max(1, Date.now() - startTime.current);
        if (round.timed && !isBotTurn) {
          const id = runId + ':' + session.index;
          const eligible = !practisedRounds.current.has(id);
          const saved = savePairTime({ id, player: activeName, ...pairConfiguration(round, difficulty), elapsedMs: pairRoundCompletedMs.current, moves: pairMoves + 1, completedAt: new Date().toISOString(), replay: pairFrames.current.length < 2000 ? { version: 1, kind: 'pairs', title: `${activeName} · ${round.variant === 'hunt' ? 'Hunt' : 'Time Trial'}`, target: round.pairs.find(pair => pair.id === round.targetPairId)?.name, frames: pairFrames.current } : undefined }, eligible);
          setPairMessage(!eligible ? 'Practice complete — restarted boards do not enter the leaderboard.' : saved ? 'Time saved to the leaderboard!' : 'Time could not be saved on this device.');
        }
        setSession(submit(session, round.completionId, turnScores ? 0 : nextScore));
      }
      return;
    }
    setPairLocked(true);
    setPairMessage('Not a pair — remember where they are!');
    pairFlipTimeout.current = window.setTimeout(() => {
      recordPairFrame('Unmatched cards hidden', [], foundPairs);
      setFlippedCards([]);
      setPairLocked(false);
      pairFlipTimeout.current = null;
      if (sharedHunt && turnScores) setTurnScores({ ...turnScores, active: (1 - activePlayer) as 0 | 1 });
    }, 1100);
  };

  const timedResultMessage = turnScores && session?.submission && pairRoundCompletedMs.current !== null
    ? session.index % 2 === 0 ? 'Time recorded. The other player has a different puzzle next.'
      : turnScores.previousOrderMs === pairRoundCompletedMs.current ? 'Equal times — one point each!'
        : (turnScores.previousOrderMs! < pairRoundCompletedMs.current ? player : opponentName) + ' wins this round — +1 point!'
    : undefined;

  const passClue = () => {
    if (!session || round?.mode !== 'clue-duel' || session.submission) return;
    if (clueBonus || clueIndex === 4) { setSession(submit(session, '__reveal__', 0)); return; }
    setClueIndex(value => value + 1);
    if (turnScores) {
      const active = (1 - turnScores.active) as 0 | 1;
      setTurnScores({ ...turnScores, active });
      setSession({ ...session, streak: turnScores.streaks[active] });
    }
    setClueMessage('');
  };
  const guessClue = (id: string) => {
    if (!session || round?.mode !== 'clue-duel' || session.submission || clueWrongIds.includes(id)) return;
    if (!turnScores) {
      if (id === round.answerId || clueIndex === 4) setSession(submit(session, id));
      else { setClueWrongIds(ids => [...ids, id]); setClueIndex(value => value + 1); setClueMessage('That answer is ruled out — here is another clue.'); }
      return;
    }
    if (id === round.answerId || clueBonus) { setSession(submit(session, id, 1)); return; }
    setClueWrongIds(ids => [...ids, id]);
    setClueBonus(true);
    setClueIndex(value => Math.min(4, value + 2));
    const active = (1 - turnScores.active) as 0 | 1;
    setTurnScores({ ...turnScores, active });
    setSession({ ...session, streak: turnScores.streaks[active] });
    setClueMessage('Wrong guess — the other player has one bonus chance!');
  };
  const revealComputerTurn = () => {
    if (!session || !round || !isBotTurn || session.submission) return;
    const answers = championship?.computerAnswers ?? standalone?.computerAnswers ?? [];
    if (round.mode === 'pair-match') {
      if (pairLocked || !pairTimerReady) return;
      const knownLocked = botMemory.current.filter(item => item.pairId === round.targetPairId && foundPairs.length < round.unlockPairs).map(item => item.position);
      const available = round.cards.map((card, position) => foundPairs.includes(card.pairId) || knownLocked.includes(position) ? -1 : position).filter(position => position >= 0);
      if (available.length < 2) return;
      const firstPosition = chooseMemoryCard(available, botMemory.current, botRandom.current);
      const first = round.cards[firstPosition];
      observeCard(firstPosition);
      if (first.pairId === round.targetPairId && foundPairs.length < round.unlockPairs) {
        setFlippedCards([]);
        setPairMessage('Shroomer found the locked target. It must find other pairs first.');
        return;
      }
      setPairLocked(true);
      setFlippedCards([first.id]);
      setPairMessage('Shroomer is remembering the cards it has seen.');
      pairFlipTimeout.current = window.setTimeout(() => {
        const secondPosition = chooseMemoryCard(available.filter(position => position !== firstPosition), botMemory.current, botRandom.current, { position: firstPosition, pairId: first.pairId, kind: first.kind });
        const second = round.cards[secondPosition];
        observeCard(secondPosition);
        if (second.pairId === round.targetPairId && foundPairs.length < round.unlockPairs) {
          setFlippedCards([]);
          setPairLocked(false);
          pairFlipTimeout.current = null;
          setPairMessage('Shroomer found the locked target. It must find other pairs first.');
          return;
        }
        setFlippedCards([first.id, second.id]);
        pairFlipTimeout.current = window.setTimeout(() => {
          pairFlipTimeout.current = null;
          setPairLocked(false);
          resolvePair(first.id, second.id);
        }, 650);
      }, 650);
      return;
    }
    pairRoundCompletedMs.current = botTimes[session.index] ?? 10000;
    if (round.mode === 'clue-duel') {
      if (clueIndex < 2 && !clueBonus) passClue();
      else guessClue(answers[session.index] as string);
      return;
    }
    if (round.mode === 'game-order') {
      pairRoundCompletedMs.current = botTimes[session.index];
      setSession(submit(session, round.correctIds, 0));
    } else {
      setSession(submit(session, answers[session.index]));
    }
  };

  // Private matching turns play out on the actual board. Schedule one move at
  // a time so restart/exit/reload can cancel it, and never inspect hidden pairs.
  useEffect(() => {
    if (screen !== 'game' || !isBotTurn || round?.mode !== 'pair-match' || !round.timed || !pairTimerReady || pairLocked || session?.submission) return;
    const delay = { explorer: 850, scientist: 650, professor: 450 }[difficulty];
    const timer = window.setTimeout(revealComputerTurn, delay);
    return () => window.clearTimeout(timer);
  }, [screen, isBotTurn, round, session?.submission, pairTimerReady, pairLocked, pairMoves, pairMessage, flippedCards, foundPairs, difficulty]);

  const setupPlayers = (format: QuizFormat) => `${draftName || 'Player'}${format === 'solo' ? ' · Solo' : ` vs ${format === 'computer' ? MUSHBOT : draftOpponent || 'Player 2'}`} · ${DIFFICULTY_LABELS[difficulty]}`;
  const setupDetail = mode === 'game-order'
    ? `${orderOptions.tiles} tiles · ${ORDER_RULES[orderChallenge].label} · timed`
    : mode === 'pair-match'
      ? pairVariant === 'time-trial'
        ? `Time Trial · ${pairCount} pairs · find ${trialTarget === 'all' ? 'all' : trialTarget} · 3 rounds`
        : `Hunt · ${pairCount} pairs · ${huntTimed ? 'timed · 3 rounds' : 'untimed'} · ${huntTargetMode === 'none' ? 'find every pair' : huntTargetMode === 'random' ? 'random target' : availablePairTargets.find(pair => pair.id === pairOptions.chosenTargetId)?.name ?? 'chosen target'}${huntTargetMode === 'none' ? '' : ` · unlock after ${huntUnlockPairs} pairs`}`
      : `${DIFFICULTY_DESCRIPTIONS[difficulty]}${mode === 'quiz' && quizFormat !== 'solo' ? '' : ` Timer ${timerEnabled ? 'on' : 'off'}.`}`;

  const renderOrderSettings = () => <section className="champ-options-group" aria-label="Game Order options">
    <h3>Game Order · race the clock</h3>
    <div className="round-select" role="group" aria-label="Game Order tile count"><span>Tiles:</span>{orderTileOptions(difficulty).map(count => <button key={count} className={orderCounts[difficulty] === count ? 'round-btn selected' : 'round-btn'} aria-pressed={orderCounts[difficulty] === count} onClick={() => setOrderCounts(previous => ({ ...previous, [difficulty]: count }))}>{count}</button>)}</div>
    <div className="difficulty-select" role="group" aria-label="Game Order challenge">{(Object.keys(ORDER_RULES) as OrderChallenge[]).map(level => <button key={level} className={orderChallenge === level ? 'diff-btn selected' : 'diff-btn'} aria-pressed={orderChallenge === level} onClick={() => setOrderChallenge(level)}><strong>{ORDER_RULES[level].label}</strong><span>{ORDER_RULES[level].description}</span></button>)}</div>
    <p className="selected-setting-help">{ORDER_RULES[orderChallenge].description}</p>
  </section>;

  const renderPairSettings = (inChampionship: boolean) => {
    const atomicCount = championshipRoundCount('game-order', championshipSize);
    return <section className="champ-options-group pair-options" aria-label="Match & Hunt options">
      <div className="champ-options-heading"><div><strong>🎴 Match & Hunt options</strong><span>{pairVariant === 'hunt' ? (huntTimed ? 'Three timed Hunt rounds' : inChampionship ? 'Three relaxed Hunt rounds' : 'One relaxed Hunt board') : 'Three timed Time Trial rounds'}</span></div></div>
      <div className="champ-setting-row" role="group" aria-label="Matching mode"><span>Mode:</span><div className="champ-setting-controls">{(['hunt', 'time-trial'] as PairVariant[]).map(item => <button key={item} className={`round-btn ${pairVariant === item ? 'selected' : ''}`} aria-pressed={pairVariant === item} onClick={() => setPairVariant(item)}>{item === 'hunt' ? '🏹 Hunt' : '⏱️ Time Trial'}</button>)}</div></div>
      {(inChampionship ? championshipFormat : quizFormat) !== 'solo' && <div className="champ-setting-row" role="group" aria-label="Matching turns"><span>Turns:</span><div className="champ-setting-controls"><button className={`round-btn ${pairVariant === 'hunt' && !huntTimed ? 'selected' : ''}`} aria-pressed={pairVariant === 'hunt' && !huntTimed} onClick={() => { setPairVariant('hunt'); setHuntTimed(false); }}>Shared board</button><button className={`round-btn ${pairVariant === 'time-trial' || huntTimed ? 'selected' : ''}`} aria-pressed={pairVariant === 'time-trial' || huntTimed} onClick={() => setHuntTimed(true)}>Separate timed turns</button></div></div>}
      <details className="game-help"><summary>How to play</summary><p>{pairVariant === 'time-trial' || huntTimed ? 'Three timed rounds. Fastest time wins. Choose All to match the whole Time Trial board.' : (inChampionship ? championshipFormat : quizFormat) === 'solo' ? 'Match pictures with names. Find the target, or every pair.' : 'Share one board. A match keeps your turn; a miss passes it.'}</p></details>
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
    {checkpointWarning && <p className="review-note" role="alert">This game could not be saved for recovery. Keep this tab open; refreshing may lose your current turn.</p>}
    {progressStorageProblem() && <p className="review-note" role="alert">Some progress could not be saved on this device. Keep this tab open; unsaved progress may be lost if you close or reload it.</p>}
    {screen === 'home' && <section className="home-screen">
      {pendingResume && <section className="resume-game" aria-label="Unfinished game"><h2>Continue your game?</h2><p>{pendingResume.player} · {MODE_LABELS[pendingResume.mode]}{pendingResume.championship ? ' · Championship' : ''}. Your answers and turn are saved. Any running timer includes time away. Starting a new game replaces this saved game.</p><button className="start-btn" onClick={resumeGame}>Resume game</button><button className="back-btn" onClick={() => { if (window.confirm('Discard this unfinished game? Completed records are kept.')) { if (clearCheckpoint()) setPendingResume(null); else setCheckpointWarning(true); } }}>Discard saved game</button></section>}
      <div className="home-header">
        <h1 className="game-title" aria-label="Mushroom Power Quiz">{['Mushroom', 'Power', 'Quiz'].map(word => <span className="title-word" aria-hidden="true" key={word}>{Array.from(word).map((letter, index) => <span className="title-letter" key={index}>{letter}</span>)}</span>)}</h1>
        <p className="mario-tagline">Unofficial Mario trivia and matching games.</p>
        <div className="shroomer-home" aria-label="Welcome from Shroomer">
          <img className="shroomer-home-portrait" src={MUSHBOT_IMAGE} alt="Shroomer, your friendly mushroom companion" width="144" height="144" />
          <p className="shroomer-home-speech">{homeTip}</p>
          {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read welcome aloud" aria-label="Read welcome aloud" onClick={() => speakText(homeTip)}>🔊</button>}
        </div>
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
        <button className="menu-btn" aria-label="Explore Learning Zone" onClick={() => setScreen('explore')}><span className="menu-icon">🔍</span><span><span className="menu-label">Explore</span><span className="menu-desc">Search learning cards and explore the track guide.</span></span></button>
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
          <span className="play-format-icon">{item === 'computer' ? <img className="mushbot-hub-avatar" src={MUSHBOT_IMAGE} alt="Shroomer" /> : item === 'two-player' ? '👥' : '🎮'}</span>
          <span className="play-format-title">{item === 'solo' ? 'Solo' : item === 'two-player' ? '2 Players' : 'Play Shroomer'}</span>
          <span className="play-format-description">{item === 'solo' ? 'Play alone and chase your best score.' : item === 'two-player' ? 'Pass the device between players.' : 'Challenge our friendly mushroom.'}</span>
        </button>)}
      </div>
      <div className="play-selection-heading"><h3>Choose a game</h3><button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button></div>
      <button className="game-mode-btn championship mario-champ-entry" onClick={() => setScreen('championship-setup')}><span className="gm-icon">🏆</span><span className="gm-name">Championship</span><span className="gm-desc">Play several games in a row. Every point adds to your total.</span></button>
      <div className="game-mode-grid">{(Object.keys(MODE_LABELS) as GameMode[]).map(item => <button key={item} className="game-mode-btn" onClick={() => openGame(item)}><span className="gm-icon">{MODE_ICONS[item]}</span><span className="gm-name">{MODE_LABELS[item]}</span><span className="gm-desc">{MODE_DESCRIPTIONS[item]}</span></button>)}</div>
    </section>}

    {screen === 'championship-setup' && <section className="two-player-setup mario-setup">
      <button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button>
      <h2 className="setup-title">🏆 {championshipFormat === 'solo' ? 'Solo' : championshipFormat === 'two-player' ? 'Two-Player' : 'Shroomer'} Championship</h2>
      <p className="setup-intro">Choose at least two games. Earn points in each game to build your championship total.</p>
      <CompactSettings summary={setupPlayers(championshipFormat)} detail={`${championshipSize[0].toUpperCase() + championshipSize.slice(1)} · ${chosenChampionshipModes.length} ${chosenChampionshipModes.length === 1 ? 'game' : 'games'}`}>
       <fieldset><legend>Players</legend><div className="round-select">{(['solo', 'two-player', 'computer'] as QuizFormat[]).map(item => <button key={item} className={`round-btn ${championshipFormat === item ? 'selected' : ''}`} aria-pressed={championshipFormat === item} onClick={() => setChampionshipFormat(item)}>{item === 'solo' ? 'Solo' : item === 'two-player' ? 'Two Players' : 'Play Shroomer'}</button>)}</div></fieldset>
       {championshipFormat === 'computer' && <div className="mushbot-intro"><img src={MUSHBOT_IMAGE} alt="Shroomer, a friendly red mushroom with white spots and a face" /><span>Meet Shroomer, your computer challenger.</span></div>}
      <label className="field-label" htmlFor="championship-player-name">Player name</label>
      <input id="championship-player-name" className="player-name-input" maxLength={24} value={draftName} onChange={event => setDraftName(event.target.value)} placeholder="Player" />
      {championshipFormat === 'two-player' && <><label className="field-label" htmlFor="championship-opponent-name">Player 2 name</label><input id="championship-opponent-name" className="player-name-input" maxLength={24} value={draftOpponent} onChange={event => setDraftOpponent(event.target.value)} placeholder="Player 2" /></>}
      <div className="difficulty-select" role="group" aria-label="Championship difficulty">{DIFFICULTIES.map(item => <button key={item} className={`diff-btn ${difficulty === item ? 'selected' : ''}`} aria-pressed={difficulty === item} onClick={() => setDifficulty(item)}><span className="diff-label">{DIFFICULTY_LABELS[item]}</span><span className="diff-desc">{DIFFICULTY_DESCRIPTIONS[item]}</span></button>)}</div>
      <div className="round-select"><span>Length:</span>{CHAMPIONSHIP_SIZES.map(item => <button key={item} className={`round-btn ${championshipSize === item ? 'selected' : ''}`} aria-pressed={championshipSize === item} onClick={() => setChampionshipSize(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
      <div className="champ-game-picker"><label>Games (choose at least 2):</label><div className="champ-games-list">{availableModes(section).map(item => <button key={item} className={`champ-game-chip champ-game-toggle ${championshipModes.includes(item) ? 'selected' : ''}`} aria-pressed={championshipModes.includes(item)} onClick={() => toggleChampionshipMode(item)}>{championshipModes.includes(item) ? '✓ ' : ''}{MODE_ICONS[item]} {MODE_LABELS[item]} · {championshipRoundCount(item, championshipSize)} rounds</button>)}</div></div>
      {chosenChampionshipModes.includes('game-order') && renderOrderSettings()}
      {chosenChampionshipModes.includes('pair-match') && renderPairSettings(true)}
      </CompactSettings>
      <p className="champ-info-footer">{chosenChampionshipModes.length} games selected · Each player’s total is the EP earned in their own games.</p>
      <button className="start-btn" disabled={chosenChampionshipModes.length < 2} onClick={startChampionship}>{championshipFormat === 'solo' ? 'Start Solo Championship' : 'Start Championship'}</button>
    </section>}

    {screen === 'championship-handover' && (championship || standalone) && <section className="quiz-playing mario-game quiz-panel versus-handover">
      <button className="back-btn" onClick={leaveGame}>← Games</button>
      {championship && <p className="eyebrow">🏆 {championship.size} Championship · Game {championship.index + 1}/{championship.modes.length}</p>}{renderTotals()}
      <h1>{MODE_LABELS[mode]}</h1>
      <h2>{activeName}'s turn</h2>
      <p>{isBotTurn ? "Ready to watch Shroomer?" : `Pass to ${activeName}.`}</p>
      <button className="start-btn" onClick={() => { startTime.current = mode === 'pair-match' && round?.mode === 'pair-match' && round.timed ? 0 : Date.now(); setScreen('game'); }}>Start {activeName}'s turn</button>
    </section>}

    {screen === 'setup' && <section className="quiz-setup mario-setup">
      <button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button>
      <h2 className="setup-title">{MODE_ICONS[mode]} {MODE_LABELS[mode]}</h2>
      <p className="setup-intro">{MODE_DESCRIPTIONS[mode]}</p>
      <CompactSettings summary={setupPlayers(quizFormat)} detail={setupDetail}>
      <label className="field-label" htmlFor="player-name">Player name</label>
      <input id="player-name" className="player-name-input" maxLength={24} value={draftName} onChange={event => setDraftName(event.target.value)} placeholder="Player" />
      <fieldset><legend>Players</legend><div className="round-select">{(['solo', 'two-player', 'computer'] as QuizFormat[]).map(item => <button key={item} className={`round-btn ${quizFormat === item ? 'selected' : ''}`} aria-pressed={quizFormat === item} onClick={() => setQuizFormat(item)}>{item === 'solo' ? 'Solo' : item === 'two-player' ? 'Two Players' : 'Play Shroomer'}</button>)}</div></fieldset>
      {quizFormat === 'computer' && <div className="mushbot-intro"><img src={MUSHBOT_IMAGE} alt="Shroomer, a friendly red mushroom with white spots and a face" /><span>Meet Shroomer, your computer challenger.</span></div>}
      {quizFormat === 'two-player' && <><label className="field-label" htmlFor="opponent-name">Player 2 name</label><input id="opponent-name" className="player-name-input" maxLength={24} value={draftOpponent} onChange={event => setDraftOpponent(event.target.value)} placeholder="Player 2" /></>}
      <div className="difficulty-select" role="group" aria-label="Difficulty">{DIFFICULTIES.map(item => <button key={item} className={`diff-btn ${difficulty === item ? 'selected' : ''}`} onClick={() => setDifficulty(item)} aria-pressed={difficulty === item}><span className="diff-label">{DIFFICULTY_LABELS[item]}</span><span className="diff-desc">{DIFFICULTY_DESCRIPTIONS[item]}</span></button>)}</div>
      {mode === 'game-order' && renderOrderSettings()}
      {mode === 'pair-match' && renderPairSettings(false)}
      {mode !== 'pair-match' && mode !== 'game-order' && (mode !== 'quiz' || quizFormat === 'solo') && <fieldset><legend>Timer</legend><div className="round-select"><button className={`round-btn ${!timed ? 'selected' : ''}`} onClick={() => setTimerEnabled(false)} aria-pressed={!timed}>Off</button><button className={`round-btn ${timed ? 'selected' : ''}`} onClick={() => setTimerEnabled(true)} aria-pressed={timed}>On</button></div></fieldset>}
      </CompactSettings>
      <button className="start-btn" onClick={start}>Start!</button>
    </section>}

    {screen === 'versus-game' && versus && versusTurn && <section className="quiz-playing mario-game quiz-panel versus-game">
      <div className="game-topbar"><button className="back-btn" onClick={leaveGame}>← Games</button><span className="score-display">{player} {versus.scores[0]} · {opponentName} {versus.scores[1]}</span></div>
      <div className="mario-points-line">{player}: {versus.points[0] + (versusTurn.playerIndex === 0 ? versus.submission?.points ?? 0 : 0)} EP · {opponentName}: {versus.points[1] + (versusTurn.playerIndex === 1 ? versus.submission?.points ?? 0 : 0)} EP</div>
      <div className="quiz-topline"><span>⚔️ Quiz Battle · {DIFFICULTY_LABELS[difficulty]}</span><span>Round {Math.floor(versus.index / 2) + 1} of 5</span></div>
      <div className="progress-track"><div style={{ width: `${(versus.index / versus.turns.length) * 100}%` }} /></div>
      {versusReady ? <div className="versus-handover">
        {versusTurn.playerIndex === 1 && quizFormat === 'computer' && <img className="mushbot-result" src={MUSHBOT_IMAGE} alt="Shroomer" />}
        <h1>{versusTurn.playerIndex === 0 ? player : opponentName}'s turn</h1>
         <p>{versusTurn.playerIndex === 1 && quizFormat === 'computer' ? 'Shroomer has its own question. Tap to watch its answer.' : 'Pass the device to this player before showing the question.'}</p>
        <button className="start-btn" onClick={() => setVersusReady(false)}>Start {versusTurn.playerIndex === 0 ? player : opponentName}'s turn</button>
      </div> : <>
        <p className="versus-now-playing">Now playing: {versusTurn.playerIndex === 0 ? player : opponentName}</p>
        <div className="game-question"><h1>{versusTurn.question.prompt}</h1>
{speechAvailable() && <button className="tts-btn tts-btn-small" title="Read question aloud" aria-label="Read question aloud" onClick={() => speakText(`${versusTurn.question.prompt} ${versusTurn.question.choices.join('. ')}`)}>🔊</button>}
        </div>
        {versusTurn.question.review && <p className="review-note" role="status">Review question — you’ve seen this fact before.</p>}
        {versusTurn.computerAnswer !== undefined && !versus.submission
          ? <button className="start-btn" onClick={() => setVersus(answerVersusQuiz(versus, versusTurn.computerAnswer!))}>Reveal Shroomer's answer</button>
          : <div className="answer-grid">{versusTurn.question.choices.map((choice, option) => <button key={choice} disabled={versus.submission !== null || versusTurn.computerAnswer !== undefined || versus.wrongAnswers.includes(choice)} className={`choice-btn ${versus.submission && choice === versusTurn.question.answer ? 'correct' : versus.wrongAnswers.includes(choice) || versus.submission?.answer === choice ? 'wrong' : ''}`} onClick={() => setVersus(attemptVersusQuiz(versus, choice))}><span className="choice-letter">{String.fromCharCode(65 + option)}</span><span className="choice-text">{choice}</span></button>)}</div>}
        {versusTurn.computerAnswer === undefined && !versus.submission && <p className="quiz-retries" aria-live="polite">{versus.wrongAnswers.length > 0 ? 'Not quite. Try again! ' : ''}Attempts left: {1 + QUIZ_RETRIES[versus.difficulty] - versus.wrongAnswers.length}</p>}
        {versus.submission && <div className="quiz-explanation feedback" aria-live="polite">
          <h2>{versus.submission.correct ? 'Correct!' : `Answer: ${versusTurn.question.answer}`}</h2>
          <p>{versusTurn.question.explanation}</p>
          <p><strong>Fun fact:</strong> {versusTurn.question.funFact}</p>
          <p className="mario-earned">+{versus.submission.points} EP</p>
          {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read explanation aloud" aria-label="Read explanation aloud" onClick={() => speakText(`${versusTurn.question.explanation} Fun fact: ${versusTurn.question.funFact}`)}>🔊</button>}
          <a href={versusTurn.question.sourceUrl} target="_blank" rel="noreferrer">Check the source ↗</a>
          <LearningFeedback id={versusTurn.question.id} />
          <div className="feedback-actions"><button className="back-btn" onClick={() => setVersus(rewindVersusQuiz(versus))}>↶ Rewind</button><button className="start-btn" onClick={nextVersus}>{versus.index + 1 === versus.turns.length ? 'See result' : 'Next turn →'}</button></div>
        </div>}
      </>}
    </section>}

    {screen === 'versus-result' && latestResult && <section className="quiz-result result-panel">
      <p className="eyebrow">MATCH COMPLETE</p>
      {latestResult.format === 'computer' && <img className="mushbot-result" src={MUSHBOT_IMAGE} alt="Shroomer" />}
      <h1>{(latestResult.points ?? 0) === (latestResult.opponentPoints ?? 0) ? "It's a draw!" : `${(latestResult.points ?? 0) > (latestResult.opponentPoints ?? 0) ? player : opponentName} wins!`}</h1>
      <div className="result-card"><div className="result-stats"><div className="result-stat"><span className="stat-value">{latestResult.points} EP</span><span className="stat-label">{player} · {latestResult.correct}/{latestResult.total} correct</span></div><div className="result-stat"><span className="stat-value">{latestResult.opponentPoints} EP</span><span className="stat-label">{opponentName} · {latestResult.opponentCorrect}/{latestResult.total} correct</span></div></div><p>{MODE_LABELS[latestResult.mode ?? 'quiz']} · {LABELS[section]} · {DIFFICULTY_LABELS[difficulty]}</p></div>
      <button className="start-btn" onClick={start}>Play again</button>
      <button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button>
      <button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button>
    </section>}

    {screen === 'game' && round && session && <section className="quiz-playing mario-game quiz-panel">
      <div className="game-topbar"><button className="back-btn" onClick={leaveGame}>← Games</button><span className="score-display">{activeName} · {round.mode === 'pair-match' ? `${foundPairs.length} pairs` : `${(turnScores ? turnScores.correct[activePlayer] : session.correct) + (session.submission?.correct ? 1 : 0)} correct`} · {gamePointsNow} EP</span></div>
      {championship && <div className="champ-game-banner">🏆 {championship.size} Championship · Game {championship.index + 1}/{championship.modes.length} · {MODE_LABELS[mode]}</div>}{renderTotals()}
      {turnScores && <div className="versus-now-playing" role="status">{activeName}'s turn · {player}: {turnScores.points[0]} EP · {opponentName}: {turnScores.points[1]} EP</div>}
      <div className="quiz-topline"><span>{MODE_ICONS[mode]} {MODE_LABELS[mode]}{round.mode === 'pair-match' ? ` · ${round.variant === 'hunt' ? 'Hunt' : 'Time Trial'}` : ` · ${DIFFICULTY_LABELS[difficulty]}`}</span><span>{turnScores && !sharedHunt ? 'Round' : mode === 'pair-match' ? 'Board' : 'Question'} {turnScores && !sharedHunt ? Math.floor(session.index / 2) + 1 : session.index + 1} of {turnScores && !sharedHunt ? session.rounds.length / 2 : session.rounds.length}{turnScores && !sharedHunt ? ' each' : ''}</span>{timed && mode !== 'game-order' && <span aria-label="Elapsed time">{((elapsedMs - (mode === 'pair-match' ? previousRoundMs.current : 0)) / 1000).toFixed(1)}s</span>}</div>
      <div className="progress-track"><div style={{ width: `${(session.index / session.rounds.length) * 100}%` }} /></div>
      <div className="game-question"><h1>{round.prompt}</h1>
      {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read question aloud" aria-label="Read question aloud" onClick={() => speakText(round.mode === 'quiz' ? `${round.prompt} ${round.question.choices.join('. ')}` : round.mode === 'clue-duel' ? `${round.prompt} ${round.clues.slice(0, clueIndex + 1).join('. ')} Choices: ${round.choices.map(choice => choice.label).join('. ')}` : round.prompt)}>🔊</button>}
      </div>
      {round.mode === 'quiz' && round.question.review && <p className="review-note" role="status">Review question — you’ve seen this fact before.</p>}
      {round.review && <p className="review-note" role="status">Review challenge — you’ve seen this one before.</p>}
      {!!round.reviewCount && <p className="review-note" role="status">This board includes {round.reviewCount} familiar {round.reviewCount === 1 ? 'match' : 'matches'}.</p>}
      {isBotTurn && !session.submission && !(round.mode === 'pair-match' && round.timed) && (round.mode === 'game-order'
        ? <TimerCountdown key={round.id} ready onGo={revealComputerTurn} label="Show Shroomer’s turn" />
        : <button className="start-btn" disabled={pairLocked} onClick={revealComputerTurn}>Show Shroomer’s turn</button>)}
      {(!isBotTurn || round.mode === 'pair-match' || round.mode === 'clue-duel') && <>
      {round.mode === 'quiz' && <>
        <p className="quiz-retries" aria-live="polite">{!session.submission && <>{session.wrongAnswers.length > 0 ? 'Not quite. Try again! ' : ''}Attempts left: {1 + QUIZ_RETRIES[session.difficulty] - session.wrongAnswers.length}</>}</p>
        <div className="answer-grid">{round.question.choices.map((choice, option) => <button key={choice} disabled={session.submission !== null || session.wrongAnswers.includes(choice)} className={`choice-btn ${session.submission && choice === round.question.answer ? 'correct' : session.wrongAnswers.includes(choice) || session.submission?.answer === choice ? 'wrong' : ''}`} onClick={() => setSession(attemptQuiz(session, choice))}><span className="choice-letter">{String.fromCharCode(65 + option)}</span><span className="choice-text">{choice}</span></button>)}</div>
      </>}

      {round.mode === 'game-order' && <OrderBoard firstRound={session.index === 0} initialCheckpoint={orderCheckpoint} onCheckpoint={setOrderCheckpoint} key={round.id + orderReset} round={round} difficulty={difficulty} options={orderOptions} player={turnScores?.active === 1 ? opponentName : player} resultId={runId + ':' + session.index} onNext={next} onRestart={undo} nextLabel={session.index + 1 === session.rounds.length ? 'See result' : turnScores ? 'Next turn' : 'Next round'} resultMessage={timedResultMessage} onSolved={time => { pairRoundCompletedMs.current = time; setSession(submit(session, round.correctIds, turnScores ? 0 : 1)); }} />}

      {round.mode === 'track-finder' && <>
        <GameHelp key={round.id} first={session.index === 0} hint="Choose one track that fits." />
        {session.submission && <div className={session.submission.correct ? 'finder-verdict win' : 'finder-verdict miss'} role="status">{session.submission.correct ? '✓ Correct — you found it!' : '✕ Not this time. The correct tracks are marked below.'}</div>}
        <div className={`finder-grid finder-${round.width}`}>{round.tiles.map(course => <button key={course.id} disabled={session.submission !== null} className={session.submission ? round.correctIds.includes(course.id) ? 'right-answer' : course.id === session.submission.answer ? 'wrong-answer' : '' : ''} onClick={() => setSession(submit(session, course.id))}>{round.challengeKind === 'system' ? trackLabel(course.title) : course.title}{session.submission && (round.correctIds.includes(course.id) ? <strong className="tile-verdict">✓ Fits the clue</strong> : course.id === session.submission.answer ? <strong className="tile-verdict">✕ Does not fit</strong> : null)}</button>)}</div>
      </>}

      {round.mode === 'category-finder' && <>
        <GameHelp key={round.id} first={session.index === 0} hint="Tap one tile that fits.">Any tile in the requested category counts.</GameHelp>
        {session.submission && <div className={session.submission.correct ? 'finder-verdict win' : 'finder-verdict miss'} role="status">{session.submission.correct ? '✓ Correct — that fits!' : '✕ Not this time. The matching tiles are marked below.'}</div>}
        {categoryContext(round.targetCategory) && <p className="category-context">{categoryContext(round.targetCategory)}</p>}
        <div className={`finder-grid finder-${round.width} category-grid`}>{round.tiles.map(tile => <button key={tile.id} data-catalog-number={tile.number} disabled={session.submission !== null} className={session.submission ? fitsCategory(tile, round.targetCategory) ? 'right-answer' : tile.id === session.submission.answer ? 'wrong-answer' : '' : ''} onClick={() => setSession(submit(session, tile.id))}><span>{tile.name}</span>{session.submission && (fitsCategory(tile, round.targetCategory) ? <strong className="tile-verdict">✓ Fits</strong> : tile.id === session.submission.answer ? <strong className="tile-verdict">✕ Different type</strong> : null)}</button>)}</div>
      </>}

      {round.mode === 'match-hunt' && <>
        <GameHelp key={round.id} first={session.index === 0} hint="Tap a name, then its matching clue." />
        <p className="match-retries" aria-live="polite">{matchRetriesLeft === 0 ? 'No retries left — the next wrong pair ends this round.' : `${matchRetriesLeft} ${matchRetriesLeft === 1 ? 'retry' : 'retries'} left.`}</p>
        <p className="match-progress" aria-live="polite">{matchedIds.length}/{round.pairs.length} pairs found</p>
        {speechAvailable() && selectedMatchClue && <button className="back-btn match-read" onClick={() => speakText(round.pairs.find(pair => pair.id === selectedMatchClue)!.clue)}>🔊 Read selected clue</button>}
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
        <GameHelp key={'help-' + round.id} first={session.index === 0} hint="Match each picture with its name.">
          {sharedHunt ? 'A match keeps your turn; a miss passes it. ' : ''}
          {round.variant === 'time-trial' ? `Find ${round.goal} pairs as fast as you can.` : round.targetPairId ? 'Find the target pair after unlocking it.' : 'Find every pair.'}
        </GameHelp>
        {round.variant === 'hunt' && round.targetPairId && <p className="hunt-target-banner">🎯 <strong>{round.pairs.find(pair => pair.id === round.targetPairId)?.name}</strong>{round.unlockPairs > 0 && <> · {foundPairs.length >= round.unlockPairs ? 'Unlocked!' : `Unlocks after ${round.unlockPairs} other pairs (${foundPairs.length}/${round.unlockPairs})`}</>}</p>}
        <p className="match-progress" aria-live="polite">{foundPairs.length}/{round.goal} pairs found · {pairMoves} {pairMoves === 1 ? 'move' : 'moves'} · {pairScore} points</p>
        {!session.submission && pairTimerReady && <button className="back-btn match-restart" onClick={undo}>↶ Restart go</button>}
        {!pairTimerReady && <p className="help-copy">Ready? The cards appear on Go!</p>}
        {round.timed && <TimerCountdown key={round.id} ready={!pairTimerReady} onGo={() => { startTime.current = Date.now(); pairFrames.current = []; recordPairFrame('Timer started', [], [], 0); setElapsedMs(previousRoundMs.current); setPairTimerReady(true); }} />}
        {pairTimerReady && <div className="pair-card-grid" aria-label="Face-down pair cards">{round.cards.map((card, index) => {
          const visible = flippedCards.includes(card.id) || foundPairs.includes(card.pairId);
          const matched = foundPairs.includes(card.pairId);
          return <button key={card.id} type="button" data-pair-id={card.pairId} data-kind={card.kind} disabled={matched || pairLocked || isBotTurn || session.submission !== null} className={`pair-card ${visible ? 'pair-card-face' : 'pair-card-back'} ${matched ? 'pair-card-found' : ''}`} aria-label={visible ? card.kind === 'word' ? `Word: ${card.label}` : `Icon: ${card.iconAlt ?? card.label}` : `Hidden card ${index + 1}`} aria-pressed={visible} onClick={() => flipPairCard(card.id)}>{visible ? card.kind === 'word' ? <span className="pair-card-word">{card.label}</span> : (card.iconKind === 'svg' || card.iconKind === 'image') ? <img className="pair-card-svg" src={`${import.meta.env.BASE_URL}${card.label}`} alt="" aria-hidden="true" /> : <span className={card.iconKind === 'text' ? 'pair-card-text-icon' : 'pair-card-icon'}>{card.label}</span> : <span className="pair-card-mark" aria-hidden="true">?</span>}</button>;
        })}</div>}
        {pairMessage && <p className="match-message" aria-live="polite">{pairMessage}</p>}
        {round.timed && <section className="order-leaderboard"><details open={!!session.submission}><summary>Match &amp; Hunt Top 10</summary><p>Same settings · human first attempts only. Restarting this board makes it practice.</p><PairTimeList records={pairScores} /></details></section>}
      </>}

      {round.mode === 'clue-duel' && <>
        <GameHelp key={round.id} first={session.index === 0} hint={turnScores ? 'Guess, or pass for another clue.' : 'Guess now, or ask for another clue.'}>
          {turnScores ? 'Asking for a clue passes the turn. A wrong guess gives your opponent one bonus chance.' : 'Each new clue makes the answer clearer. Earlier guesses earn more points.'}
        </GameHelp>
        <p className="clue-count">Clue {clueIndex + 1} of 5</p>
        <ol className="clue-list">{round.clues.slice(0, clueIndex + 1).map((clue, index) => <li key={index}>{clue}</li>)}</ol>
        {clueMessage && !session.submission && <p className="match-message" aria-live="polite">{clueMessage}</p>}
        {!session.submission && (turnScores || clueIndex < 4) && <button className="back-btn clue-reveal" disabled={isBotTurn} onClick={passClue}>{turnScores ? clueBonus ? 'Skip bonus — reveal answer' : clueIndex < 4 ? 'Next clue — pass to ' + (activePlayer === 0 ? opponentName : player) : 'Reveal answer' : 'Show next clue'}</button>}
        <div className="answer-grid">{round.choices.map((choice, option) => <button key={choice.id} disabled={session.submission !== null || isBotTurn || clueWrongIds.includes(choice.id)} className={`choice-btn ${session.submission ? choice.id === round.answerId ? 'correct' : choice.id === session.submission.answer ? 'wrong' : '' : clueWrongIds.includes(choice.id) ? 'wrong' : ''}`} onClick={() => guessClue(choice.id)}><span className="choice-letter">{String.fromCharCode(65 + option)}</span><span className="choice-text">{choice.label}</span></button>)}</div>
      </>}

      </>}
      {session.submission && (round.mode !== 'game-order' || isBotTurn) && <div className="quiz-explanation feedback" aria-live="polite">
        <h2>{session.submission.correct ? 'Correct!' : round.mode === 'match-hunt' ? 'Round over' : `Answer: ${session.submission.correctLabel}`}</h2>
        {(round.mode === 'game-order' || (round.mode === 'pair-match' && round.timed)) && <p className="order-feedback">{timedResultMessage}</p>}
        {isBotTurn && (round.mode === 'game-order' || (round.mode === 'pair-match' && round.timed)) && <p>{round.mode === 'pair-match' ? 'Shroomer’s time' : 'Shroomer’s simulated time'}: {((pairRoundCompletedMs.current ?? 0) / 1000).toFixed(1)} seconds.</p>}
        <p>{round.explanation}</p>
        <p><strong>Fun fact:</strong> {round.funFact}</p>
        <p className="mario-earned">+{session.submission.points} EP</p>
        {speechAvailable() && <button className="tts-btn tts-btn-small" title="Read explanation aloud" aria-label="Read explanation aloud" onClick={() => speakText(`${round.explanation} Fun fact: ${round.funFact}`)}>🔊</button>}
        <a href={round.sourceUrl} target="_blank" rel="noreferrer">Check the source ↗</a>
        <LearningFeedback id={round.id} />
        <div className="feedback-actions"><button className="back-btn" onClick={undo}>↶ Rewind</button><button className="start-btn" onClick={next}>{session.index + 1 === session.rounds.length ? 'See result' : turnScores ? 'Next turn →' : mode === 'pair-match' ? 'Next board →' : 'Next question →'}</button></div>
      </div>}
    </section>}

    {screen === 'result' && latestResult && <section className="quiz-result result-panel">
      <p className="eyebrow">{championship ? `CHAMPIONSHIP · GAME ${championship.index + 1} OF ${championship.modes.length}` : 'GAME COMPLETE'}</p>
      <h1>Nice work, {latestResult.player}!</h1>
      <div className="result-card"><div className="result-stats"><div className="result-stat"><span className="stat-value">{latestResult.correct}/{latestResult.total}</span><span className="stat-label">Correct</span></div><div className="result-stat"><span className="stat-value">{latestResult.points ?? latestResult.correct}</span><span className="stat-label">EP earned</span></div></div><p>{modeLabel(latestResult.mode)}{latestResult.variant ? ` · ${latestResult.variant === 'hunt' ? 'Hunt' : 'Time Trial'}` : ''} · {LABELS[latestResult.topic]} · {DIFFICULTY_LABELS[latestResult.difficulty]}{timed ? ` · ${(latestResult.elapsedMs / 1000).toFixed(1)}s` : ''}</p></div>
      {latestResult.opponent && <p>{opponentName}: {latestResult.opponentPoints} EP · {latestResult.opponentCorrect} correct</p>}
      {championship ? <>{renderTotals()}<button className="start-btn" onClick={continueChampionship}>{championship.index + 1 === championship.modes.length ? 'See championship result' : 'Next: ' + MODE_LABELS[championship.modes[championship.index + 1]]}</button></> : <button className="start-btn" onClick={start}>Play again</button>}
      <button className="back-btn" onClick={leaveGame}>← Back to games</button>
      {!championship && <button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button>}
    </section>}

    {screen === 'championship-result' && finishedChampionship && <section className="quiz-result result-panel">
      <p className="eyebrow">CHAMPIONSHIP COMPLETE</p><h1>🏆 {finishedChampionship.opponent ? finishedChampionship.points === finishedChampionship.opponentPoints ? "It's a draw!" : `${finishedChampionship.points > (finishedChampionship.opponentPoints ?? 0) ? finishedChampionship.player : finishedChampionship.opponent} wins!` : `Nice work, ${finishedChampionship.player}!`}</h1>
      {finishedChampionship.format === 'computer' && <img className="mushbot-result" src={MUSHBOT_IMAGE} alt="Shroomer" />}
      <div className="result-card"><div className="result-stats"><div className="result-stat"><span className="stat-value">{finishedChampionship.points}</span><span className="stat-label">{finishedChampionship.player} · total EP</span></div><div className="result-stat"><span className="stat-value">{finishedChampionship.opponent ? finishedChampionship.opponentPoints : finishedChampionship.games.length}</span><span className="stat-label">{finishedChampionship.opponent ? `${finishedChampionship.opponent} · total EP` : 'Games'}</span></div></div><p>{finishedChampionship.size} · {LABELS[finishedChampionship.topic]} · {DIFFICULTY_LABELS[finishedChampionship.difficulty]}</p></div>
      <div className="champ-running-total"><h3>Game breakdown</h3>{finishedChampionship.games.map((game, index) => <div className="champ-total-row" key={game.mode}><span>{MODE_ICONS[game.mode]} {modeLabel(game.mode)}{game.variant ? ` · ${game.variant === 'hunt' ? 'Hunt' : 'Time Trial'}` : ''}</span><strong>{finishedChampionship.player}: {game.points ?? game.correct} EP{finishedChampionship.opponent ? ` · ${finishedChampionship.opponent}: ${finishedChampionship.opponentGames?.[index]?.points ?? 0} EP` : ''}</strong></div>)}</div>
      <button className="start-btn" onClick={() => setScreen('championship-setup')}>Play again</button><button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button><button className="high-scores-link" onClick={() => setScreen('scores')}>🏆 High Scores</button>
    </section>}

    {screen === 'scores' && <section className="high-scores-screen">
      <div className="high-scores-header"><button className="back-btn" onClick={() => setScreen('hub')}>← Back to games</button><div><h2>🏆 High Scores</h2><p>Your finished games</p></div></div>
      {scores.length === 0 ? <p>No completed games yet.</p> : <ol className="score-list">{scores.slice(0, 20).map(result => <li key={result.id}><span><strong>{result.opponent ? `${result.player} vs ${result.opponent}` : result.player}</strong><small>{modeLabel(result.mode)}{result.variant ? ` · ${result.variant === 'hunt' ? 'Hunt' : 'Time Trial'}` : ''} · {LABELS[result.topic]} · {DIFFICULTY_LABELS[result.difficulty]} · {result.opponent ? `${result.correct}–${result.opponentCorrect}` : `${result.correct}/${result.total}`} correct</small></span><strong>{result.opponent ? `${result.points ?? result.correct}–${result.opponentPoints ?? result.opponentCorrect} EP` : `${result.points ?? result.correct} EP`}</strong></li>)}</ol>}
      <PairLeaderboards />
      <OrderLeaderboards />
      <h3>Championships</h3>{championshipScores.length === 0 ? <p>No completed championships yet.</p> : <ol className="score-list">{championshipScores.slice(0, 20).map(result => <li key={result.id}><span><strong>{result.opponent ? `${result.player} vs ${result.opponent}` : result.player}</strong><small>{result.size} · {LABELS[result.topic]} · {DIFFICULTY_LABELS[result.difficulty]} · {result.games.length} games</small></span><strong>{result.opponent ? `${result.points}–${result.opponentPoints} EP` : `${result.points} EP`}</strong></li>)}</ol>}
    </section>}

    {screen === 'explore' && <section className="mario-learning-zone">
      <button className="back-btn" onClick={() => setScreen('home')}>← Home</button>
      <p className="eyebrow">EXPLORE</p>
      <h1>Learning Zone</h1>
      <p className="intro-copy">Read at your own pace, then try what you have learned in a game.</p>
      <button className="round-btn learning-topic-action" onClick={() => setScreen('tracks')}>Open track guide →</button>
      <LearningCards />
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
