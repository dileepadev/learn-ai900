<script lang="ts">
  /**
   * The practice exam. Deliberately different from practice mode: timed, no
   * feedback until the end, free navigation with flagging, and a topic-by-topic
   * report afterwards.
   */
  import { untrack } from 'svelte';
  import type { Answer, Question, TopicId } from '../data/types';
  import { EXAM, TOPICS, topicLabel } from '../data/exam';
  import { ALL_QUESTIONS, EXAM_QUESTIONS } from '../data/questions';
  import { grade, recordAnswer, saveSession, progress, emptyProgress, get } from '../lib/store';
  import { buildQueue } from '../lib/queue';
  import type { Progress } from '../data/types';
  import QuestionCard from './QuestionCard.svelte';

  interface Props {
    base: string;
    /** 'exam' is the full paper; 'mini-exam' is the short version. */
    variant?: 'exam' | 'mini-exam';
  }
  let { base, variant = 'exam' }: Props = $props();

  const link = (p: string) => `${base.replace(/\/$/, '')}${p}`;

  const PRESETS = {
    exam: { size: 45, minutes: 45, label: 'Full practice exam' },
    'mini-exam': { size: 15, minutes: 15, label: 'Mini exam' },
  } as const;

  // `variant` is fixed by the route, so capturing the preset once is deliberate:
  // these become user-editable settings from here on.
  let size = $state(untrack(() => PRESETS[variant].size));
  let minutes = $state(untrack(() => PRESETS[variant].minutes));
  let timed = $state(true);

  let phase = $state<'setup' | 'running' | 'results'>('setup');
  let queue = $state<Question[]>([]);
  let index = $state(0);
  let answers = $state<Record<string, Answer>>({});
  let flagged = $state<Set<string>>(new Set());
  let startedAt = $state(0);
  let remaining = $state(0);
  let timer: ReturnType<typeof setInterval> | undefined;

  let p = $state<Progress>(get());
  $effect(() => progress.subscribe((next) => (p = next)));

  const available = $derived(EXAM_QUESTIONS.length);

  function start() {
    queue = buildQueue(ALL_QUESTIONS, p, { mode: variant, size });
    index = 0;
    answers = {};
    flagged = new Set();
    startedAt = Date.now();
    remaining = minutes * 60;
    phase = 'running';

    if (timed) {
      timer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          remaining = 0;
          submit();
        }
      }, 1000);
    }
    // Keep the browser tab from being closed mid-exam by accident.
    window.addEventListener('beforeunload', warn);
  }

  function warn(e: BeforeUnloadEvent) {
    e.preventDefault();
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = undefined;
    window.removeEventListener('beforeunload', warn);
  }

  $effect(() => () => stopTimer());

  const current = $derived(queue[index]);

  function setAnswer(answer: Answer) {
    const q = current;
    if (!q) return;
    answers = { ...answers, [q.id]: answer };
  }

  function toggleFlag() {
    const q = current;
    if (!q) return;
    const next = new Set(flagged);
    if (next.has(q.id)) next.delete(q.id);
    else next.add(q.id);
    flagged = next;
  }

  function go(i: number) {
    index = Math.max(0, Math.min(queue.length - 1, i));
  }

  const answeredCount = $derived(queue.filter((q) => answers[q.id]).length);

  let results = $state<{
    correct: number;
    total: number;
    pct: number;
    scaled: number;
    passed: boolean;
    byTopic: { topic: TopicId; label: string; weight: number; total: number; correct: number }[];
    missed: Question[];
    elapsed: number;
  } | null>(null);

  function submit() {
    stopTimer();

    let correct = 0;
    const missed: Question[] = [];
    const tally: Partial<Record<TopicId, { total: number; correct: number }>> = {};

    for (const q of queue) {
      const answer = answers[q.id];
      const isCorrect = answer ? grade(q, answer) : false;
      const entry = (tally[q.topic] ??= { total: 0, correct: 0 });
      entry.total += 1;
      if (isCorrect) {
        correct += 1;
        entry.correct += 1;
      } else {
        missed.push(q);
      }
      // Feed exam results back into spaced repetition.
      recordAnswer(q.id, isCorrect);
    }

    const total = queue.length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    // Microsoft reports a scaled score out of 1000 with 700 to pass.
    const scaled = Math.round((correct / Math.max(1, total)) * 1000);

    saveSession({
      mode: variant,
      startedAt,
      finishedAt: Date.now(),
      total,
      correct,
      missed: missed.map((q) => q.id),
      limitSeconds: timed ? minutes * 60 : undefined,
      byTopic: tally,
    });

    results = {
      correct,
      total,
      pct,
      scaled,
      passed: scaled >= EXAM.passingScore,
      byTopic: TOPICS.filter((t) => tally[t.id]).map((t) => ({
        topic: t.id,
        label: t.label,
        weight: t.weight,
        total: tally[t.id]!.total,
        correct: tally[t.id]!.correct,
      })),
      missed,
      elapsed: Math.round((Date.now() - startedAt) / 1000),
    };
    phase = 'results';
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  const lowTime = $derived(timed && remaining <= 300);
  let confirming = $state(false);
</script>

{#if phase === 'setup'}
  <section class="setup">
    <header class="setup-head">
      <h1>{PRESETS[variant].label}</h1>
      <p class="muted">
        Exam-style questions only, sampled across topics in proportion to the published exam weights.
        No feedback until you finish — just like the real thing.
      </p>
    </header>

    <div class="card facts">
      <dl>
        <div><dt>Real exam</dt><dd>{EXAM.questionCountLabel} questions</dd></div>
        <div><dt>Pass mark</dt><dd>{EXAM.passingScore} / {EXAM.scoreScale}</dd></div>
        <div><dt>Bank available</dt><dd>{available} exam-style</dd></div>
      </dl>
    </div>

    <div class="card options">
      <label class="opt">
        <span>Questions</span>
        <input type="range" min="10" max={Math.min(60, available)} step="5" bind:value={size} />
        <strong>{size}</strong>
      </label>
      <label class="opt">
        <span>Time limit</span>
        <input type="range" min="5" max="90" step="5" bind:value={minutes} disabled={!timed} />
        <strong>{timed ? `${minutes} min` : 'off'}</strong>
      </label>
      <label class="toggle">
        <input type="checkbox" bind:checked={timed} />
        <span>Timed — recommended, so you practise under pressure</span>
      </label>
    </div>

    <div class="row">
      <button type="button" class="btn btn-primary btn-lg" onclick={start}>Begin exam</button>
      <a class="btn btn-ghost" href={link('/practice/')}>Practice mode instead</a>
    </div>

    <p class="tiny subtle disclaimer">
      These questions are written for this study app against the current skills measured. They are
      not real exam questions, and no practice set can guarantee a result. Microsoft's own
      <a href={EXAM.practiceAssessmentUrl} target="_blank" rel="noopener noreferrer">
        practice assessment
      </a> is worth taking as well.
    </p>
  </section>
{:else if phase === 'running'}
  <section class="running">
    <header class="exam-bar">
      <div class="exam-bar-left">
        <span class="tiny subtle">Question</span>
        <strong>{index + 1} / {queue.length}</strong>
      </div>
      <div class="exam-bar-mid">
        <span class="tiny subtle">{answeredCount} answered</span>
        {#if flagged.size}<span class="chip chip-warn">{flagged.size} flagged</span>{/if}
      </div>
      {#if timed}
        <div class="timer" class:low={lowTime} aria-live="polite">
          <span class="visually-hidden">Time remaining</span>
          {formatTime(remaining)}
        </div>
      {/if}
    </header>

    <nav class="palette" aria-label="Jump to question">
      {#each queue as q, i (q.id)}
        <button
          type="button"
          class="pal"
          class:current={i === index}
          class:answered={Boolean(answers[q.id])}
          class:flagged={flagged.has(q.id)}
          aria-label={`Question ${i + 1}${answers[q.id] ? ', answered' : ''}${flagged.has(q.id) ? ', flagged' : ''}`}
          onclick={() => go(i)}>{i + 1}</button
        >
      {/each}
    </nav>

    <div class="card exam-question">
      {#key current?.id}
        <QuestionCard
          question={current!}
          examMode
          initial={answers[current!.id] ?? null}
          onchange={(answer) => setAnswer(answer)}
        />
      {/key}
    </div>

    <footer class="exam-foot">
      <button type="button" class="btn" disabled={index === 0} onclick={() => go(index - 1)}>
        ← Previous
      </button>
      <button type="button" class="btn btn-ghost" onclick={toggleFlag}>
        {flagged.has(current!.id) ? '★ Unflag' : '☆ Flag for review'}
      </button>
      {#if index < queue.length - 1}
        <button type="button" class="btn btn-primary" onclick={() => go(index + 1)}>Next →</button>
      {:else}
        <button type="button" class="btn btn-primary" onclick={() => (confirming = true)}>
          Finish exam
        </button>
      {/if}
      <button type="button" class="btn btn-ghost btn-sm end" onclick={() => (confirming = true)}>
        Submit now
      </button>
    </footer>

    {#if confirming}
      <div class="confirm-backdrop">
        <div class="confirm card" role="dialog" aria-modal="true" aria-label="Submit exam">
          <h2>Submit your exam?</h2>
          <p class="muted">
            You have answered <strong>{answeredCount} of {queue.length}</strong>.
            {#if answeredCount < queue.length}
              Unanswered questions are marked incorrect.
            {/if}
          </p>
          <div class="row">
            <button type="button" class="btn btn-primary" onclick={submit}>Submit and see results</button>
            <button type="button" class="btn" onclick={() => (confirming = false)}>Keep going</button>
          </div>
        </div>
      </div>
    {/if}
  </section>
{:else if results}
  <section class="results">
    <div class="card score-hero" class:passed={results.passed}>
      <p class="score-emoji" aria-hidden="true">{results.passed ? '🎉' : '📊'}</p>
      <p class="scaled">{results.scaled}<span class="of">/{EXAM.scoreScale}</span></p>
      <p class="verdict-line">
        {results.passed ? 'Above the pass mark' : 'Below the pass mark'} — {EXAM.passingScore} needed
      </p>
      <p class="muted raw">
        {results.correct} of {results.total} correct ({results.pct}%) in {formatTime(results.elapsed)}
      </p>
      <p class="tiny subtle scaled-note">
        Scaled to Microsoft's {EXAM.scoreScale}-point scale as a rough guide. The real exam weights
        questions individually, so treat this as a signal, not a prediction.
      </p>
    </div>

    <div class="card">
      <h2 class="h-sm">Topic by topic</h2>
      <ul class="topic-report">
        {#each [...results.byTopic].sort((a, b) => a.correct / a.total - b.correct / b.total) as t (t.topic)}
          {@const pct = Math.round((t.correct / t.total) * 100)}
          <li>
            <div class="tr-head">
              <span class="tr-name">{t.label}</span>
              <span class="chip">{t.weight}% of exam</span>
              <span class="tr-score" class:weak={pct < 70}>{t.correct}/{t.total} · {pct}%</span>
            </div>
            <div class="bar" class:bar-success={pct >= 70} class:bar-danger={pct < 50}>
              <span style:width={`${pct}%`}></span>
            </div>
            {#if pct < 70}
              <a class="tiny" href={link(`/practice/weak/?topic=${t.topic}`)}>
                Drill {t.label} →
              </a>
            {/if}
          </li>
        {/each}
      </ul>
    </div>

    <div class="card next-steps">
      <h2 class="h-sm">What to do next</h2>
      {#if results.passed}
        <p>
          You are above the pass mark on this set. Keep the weakest topics above warm with short
          drills, and run the cram sheet the day before.
        </p>
      {:else}
        <p>
          The topics at the top of the list above are where the marks are. Drill the weakest one,
          revisit its lesson if accuracy is below 50%, then re-test.
        </p>
      {/if}
      <div class="row">
        <a class="btn btn-primary" href={link('/practice/mistakes/')}>
          Review {results.missed.length} missed
        </a>
        <a class="btn" href={link('/review/')}>Rapid review</a>
        <a class="btn btn-ghost" href={link('/')}>Dashboard</a>
      </div>
    </div>

    {#if results.missed.length}
      <section class="review">
        <h2 class="h-sm">Every question you missed</h2>
        {#each results.missed as q (q.id)}
          <div class="card">
            <QuestionCard question={q} revealed hideNext initial={answers[q.id] ?? null} />
          </div>
        {/each}
      </section>
    {/if}
  </section>
{/if}

<style>
  .setup,
  .running,
  .results {
    max-width: 820px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .setup-head p {
    max-width: 60ch;
    margin: 0;
  }

  .facts dl {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.6rem;
    margin: 0;
  }
  .facts dt {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-subtle);
  }
  .facts dd {
    margin: 0;
    font-size: 1rem;
    font-weight: 650;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .opt {
    display: grid;
    grid-template-columns: 6.5rem 1fr 4.5rem;
    align-items: center;
    gap: 0.7rem;
    font-size: 0.9rem;
  }
  .opt strong {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--accent);
  }
  input[type='range'] {
    accent-color: var(--accent);
    width: 100%;
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.88rem;
    color: var(--fg-muted);
  }
  input[type='checkbox'] {
    accent-color: var(--accent);
  }

  .disclaimer {
    max-width: 62ch;
    line-height: 1.55;
    margin: 0;
  }

  /* ---- running ---- */

  .exam-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.6rem 0.9rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    position: sticky;
    top: calc(var(--header-h, 58px) + 8px);
    z-index: 20;
  }
  .exam-bar-left {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }
  .exam-bar-mid {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-left: auto;
  }

  .timer {
    font-family: var(--mono);
    font-size: 1.05rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-sm);
    background: var(--bg-sunken);
    border: 1px solid var(--border);
  }
  .timer.low {
    background: var(--danger-soft);
    border-color: var(--danger-border);
    color: var(--danger);
  }

  .palette {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }
  .pal {
    width: 26px;
    height: 26px;
    font: inherit;
    font-size: 0.7rem;
    font-weight: 700;
    border-radius: 5px;
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    color: var(--fg-subtle);
    cursor: pointer;
    position: relative;
    transition:
      background 0.12s,
      border-color 0.12s;
  }
  .pal:hover {
    border-color: var(--accent);
  }
  .pal.answered {
    background: var(--accent-soft);
    color: var(--accent);
    border-color: var(--accent-soft);
  }
  .pal.current {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-soft);
    color: var(--fg);
  }
  .pal.flagged::after {
    content: '';
    position: absolute;
    top: -2px;
    right: -2px;
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--warn);
  }

  .exam-question {
    padding: 1.3rem;
  }

  .exam-foot {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .exam-foot .end {
    margin-left: auto;
  }

  .confirm-backdrop {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.45);
    display: grid;
    place-items: center;
    padding: 1rem;
    z-index: 60;
  }
  .confirm {
    max-width: 400px;
    box-shadow: var(--shadow-lg);
  }
  .confirm h2 {
    font-size: 1.1rem;
  }
  .confirm p {
    font-size: 0.9rem;
  }

  /* ---- results ---- */

  .score-hero {
    text-align: center;
    padding: 2rem 1.5rem;
    border-color: var(--danger-border);
  }
  .score-hero.passed {
    border-color: var(--success-border);
  }
  .score-emoji {
    font-size: 2.4rem;
    margin: 0 0 0.3rem;
    line-height: 1;
  }
  .scaled {
    margin: 0;
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--danger);
  }
  .score-hero.passed .scaled {
    color: var(--success);
  }
  .of {
    font-size: 0.4em;
    color: var(--fg-subtle);
    font-weight: 600;
  }
  .verdict-line {
    margin: 0.35rem 0 0;
    font-weight: 650;
    font-size: 0.95rem;
  }
  .raw {
    margin: 0.2rem 0 0;
    font-size: 0.9rem;
  }
  .scaled-note {
    margin: 0.7rem auto 0;
    max-width: 46ch;
    line-height: 1.5;
  }

  .h-sm {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-subtle);
    font-weight: 700;
    margin-bottom: 0.8rem;
  }

  .topic-report {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  .tr-head {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.3rem;
    flex-wrap: wrap;
  }
  .tr-name {
    font-size: 0.92rem;
    font-weight: 620;
  }
  .tr-score {
    margin-left: auto;
    font-size: 0.85rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--fg-muted);
  }
  .tr-score.weak {
    color: var(--danger);
  }
  .topic-report a {
    display: inline-block;
    margin-top: 0.25rem;
  }

  .next-steps p {
    font-size: 0.92rem;
    max-width: 62ch;
  }

  .review {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  @media (max-width: 560px) {
    .opt {
      grid-template-columns: 5rem 1fr 3.5rem;
    }
    .exam-bar {
      top: calc(var(--header-h, 92px) + 6px);
      padding: 0.5rem 0.7rem;
    }
  }
</style>
