/**
 * Progress store: a tiny observable backed by localStorage.
 *
 * It implements Svelte's store contract, so components can use `$progress`
 * directly. All reads are SSR-safe: on the server the store simply reports an
 * empty progress object and never touches `localStorage`.
 */
import type {
  Answer,
  Progress,
  Question,
  QuestionState,
  SessionResult,
  TopicId,
} from '../data/types';
import { schedule } from './srs';

const STORAGE_KEY = 'ai901:progress';
const SCHEMA_VERSION = 1;

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export function emptyProgress(): Progress {
  const now = Date.now();
  return {
    v: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    modules: {},
    questions: {},
    flashcards: {},
    sessions: [],
    activeDays: [],
    achievements: [],
  };
}

let state: Progress = emptyProgress();
let hydrated = false;
const subscribers = new Set<(p: Progress) => void>();

function todayISO(d = new Date()): string {
  // Local calendar date, so a study streak follows the learner's own day.
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function migrate(raw: unknown): Progress {
  const base = emptyProgress();
  if (!raw || typeof raw !== 'object') return base;
  const parsed = raw as Partial<Progress>;
  // Merge field-by-field so a partially-written or older payload still loads.
  return {
    ...base,
    ...parsed,
    v: SCHEMA_VERSION,
    modules: parsed.modules ?? {},
    questions: parsed.questions ?? {},
    flashcards: parsed.flashcards ?? {},
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    activeDays: Array.isArray(parsed.activeDays) ? parsed.activeDays : [],
    achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
  };
}

function hydrate(): void {
  if (hydrated || !isBrowser) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = migrate(JSON.parse(raw));
  } catch {
    // Corrupt or unreadable storage: start clean rather than crashing the app.
    state = emptyProgress();
  }
}

let flushHandle: number | undefined;

function persist(): void {
  if (!isBrowser) return;
  // Batch rapid updates (e.g. answering through a quiz) into one write.
  if (flushHandle !== undefined) clearTimeout(flushHandle);
  flushHandle = window.setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota exceeded or private mode: keep the in-memory state working.
    }
  }, 120);
}

function notify(): void {
  for (const fn of subscribers) fn(state);
}

/** Apply a mutation, stamp the streak, persist, and notify subscribers. */
function update(fn: (draft: Progress) => void): void {
  hydrate();
  fn(state);
  state.updatedAt = Date.now();
  const today = todayISO();
  if (!state.activeDays.includes(today)) state.activeDays.push(today);
  persist();
  notify();
}

/** Svelte-store-compatible read interface. */
export const progress = {
  subscribe(fn: (p: Progress) => void): () => void {
    hydrate();
    fn(state);
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
};

/** Snapshot the current progress. Returns empty progress during SSR. */
export function get(): Progress {
  hydrate();
  return state;
}

if (isBrowser) {
  // Keep multiple open tabs in sync.
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    try {
      state = migrate(e.newValue ? JSON.parse(e.newValue) : null);
      notify();
    } catch {
      /* ignore malformed cross-tab payloads */
    }
  });
}

/* ------------------------------------------------------------------ *
 * Answer grading
 * ------------------------------------------------------------------ */

/** Grade a response without recording it. Pure, so it is safe to call in render. */
export function grade(question: Question, answer: Answer): boolean {
  switch (question.type) {
    case 'single': {
      if (answer.type !== 'single' || !answer.optionId) return false;
      return question.options.some((o) => o.id === answer.optionId && o.correct);
    }
    case 'multi': {
      if (answer.type !== 'multi') return false;
      const expected = question.options.filter((o) => o.correct).map((o) => o.id).sort();
      const got = [...new Set(answer.optionIds)].sort();
      return expected.length === got.length && expected.every((id, i) => id === got[i]);
    }
    case 'match': {
      if (answer.type !== 'match') return false;
      return question.pairs.every((p) => answer.assignments[p.id] === p.right);
    }
    case 'order': {
      if (answer.type !== 'order') return false;
      const expected = question.items.map((i) => i.id);
      return (
        answer.itemIds.length === expected.length &&
        expected.every((id, i) => id === answer.itemIds[i])
      );
    }
  }
}

/** Record an attempt and reschedule the question. */
export function recordAnswer(questionId: string, correct: boolean): void {
  update((p) => {
    const now = Date.now();
    const prev = p.questions[questionId];
    const next = schedule(prev, correct, now);
    const s: QuestionState = {
      seen: (prev?.seen ?? 0) + 1,
      correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
      wrong: (prev?.wrong ?? 0) + (correct ? 0 : 1),
      last: correct ? 'correct' : 'wrong',
      at: now,
      box: next.box,
      due: next.due,
    };
    p.questions[questionId] = s;
  });
}

/* ------------------------------------------------------------------ *
 * Modules
 * ------------------------------------------------------------------ */

export function markModuleStarted(moduleId: string): void {
  update((p) => {
    const m = (p.modules[moduleId] ??= { sectionsSeen: [] });
    m.startedAt ??= Date.now();
  });
}

export function markSectionSeen(moduleId: string, sectionId: string): void {
  update((p) => {
    const m = (p.modules[moduleId] ??= { sectionsSeen: [] });
    m.startedAt ??= Date.now();
    if (!m.sectionsSeen.includes(sectionId)) m.sectionsSeen.push(sectionId);
  });
}

export function markModuleComplete(moduleId: string, complete = true): void {
  update((p) => {
    const m = (p.modules[moduleId] ??= { sectionsSeen: [] });
    m.startedAt ??= Date.now();
    if (complete) m.completedAt = Date.now();
    else delete m.completedAt;
  });
}

/* ------------------------------------------------------------------ *
 * Flashcards
 * ------------------------------------------------------------------ */

export function recordFlashcard(cardId: string, knewIt: boolean): void {
  update((p) => {
    const prev = p.flashcards[cardId];
    const next = schedule(prev, knewIt);
    p.flashcards[cardId] = {
      box: next.box,
      due: next.due,
      seen: (prev?.seen ?? 0) + 1,
    };
  });
}

/* ------------------------------------------------------------------ *
 * Sessions
 * ------------------------------------------------------------------ */

export function saveSession(result: Omit<SessionResult, 'id'>): SessionResult {
  const withId: SessionResult = { ...result, id: `s_${result.finishedAt.toString(36)}` };
  update((p) => {
    p.sessions.push(withId);
    // Keep history bounded; the dashboard only ever charts the recent run.
    if (p.sessions.length > 120) p.sessions = p.sessions.slice(-120);
  });
  return withId;
}

export function setLastVisited(path: string, label: string): void {
  update((p) => {
    p.lastVisited = { path, label, at: Date.now() };
  });
}

export function setExamDate(date: string | undefined): void {
  update((p) => {
    if (date) p.examDate = date;
    else delete p.examDate;
  });
}

export function unlockAchievement(id: string): boolean {
  let unlocked = false;
  update((p) => {
    if (!p.achievements.includes(id)) {
      p.achievements.push(id);
      unlocked = true;
    }
  });
  return unlocked;
}

/** Wipe all stored progress. */
export function resetAll(): void {
  hydrate();
  state = emptyProgress();
  if (isBrowser) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing else to do */
    }
  }
  notify();
}

/** Export progress as a JSON string for backup. */
export function exportJSON(): string {
  return JSON.stringify(get(), null, 2);
}

/** Import a previously exported payload. Returns false if it isn't usable. */
export function importJSON(raw: string): boolean {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return false;
    hydrate();
    state = migrate(parsed);
    persist();
    notify();
    return true;
  } catch {
    return false;
  }
}

export { todayISO };
export type { TopicId };
