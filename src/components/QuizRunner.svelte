<script lang="ts">
  /**
   * Runs a non-exam session: one question at a time, immediate feedback,
   * a results screen, and the option to retry only what was missed.
   */
  import type { Question, SessionMode, TopicId } from '../data/types';
  import { recordAnswer, saveSession, progress } from '../lib/store';
  import { buildQueue } from '../lib/queue';
  import { topicLabel } from '../data/exam';
  import { ALL_QUESTIONS } from '../data/questions';
  import QuestionCard from './QuestionCard.svelte';

  interface Props {
    /** Fixed set of questions. When omitted, the queue is built from `mode`. */
    questions?: Question[];
    mode: SessionMode;
    size?: number;
    topics?: TopicId[];
    moduleId?: string;
    title: string;
    /** Shown when the queue comes back empty. */
    emptyMessage?: string;
    base: string;
    /** Where "done" sends the learner. */
    doneHref?: string;
    doneLabel?: string;
    /** Called after the session is saved. */
    onfinish?: (correct: number, total: number) => void;
  }

  let {
    questions,
    mode,
    size = 10,
    topics,
    moduleId,
    title,
    emptyMessage = 'Nothing to practise here right now.',
    base,
    doneHref,
    doneLabel = 'Back',
    onfinish,
  }: Props = $props();

  const link = (p: string) => `${base.replace(/\/$/, '')}${p}`;

  let queue = $state<Question[]>([]);
  let index = $state(0);
  let correctCount = $state(0);
  let missed = $state<string[]>([]);
  let startedAt = $state(Date.now());
  let finished = $state(false);
  let started = $state(false);

  /** Build the queue once, from a snapshot of progress. */
  function begin(only?: Question[]) {
    const snapshot = getSnapshot();
    queue = only ?? questions ?? buildQueue(ALL_QUESTIONS, snapshot, { mode, size, topics, moduleId });
    index = 0;
    correctCount = 0;
    missed = [];
    startedAt = Date.now();
    finished = false;
    started = true;
  }

  function getSnapshot() {
    let snap!: Parameters<typeof buildQueue>[1];
    const stop = progress.subscribe((p) => (snap = p));
    stop();
    return snap;
  }

  $effect(() => {
    if (!started) begin();
  });

  const current = $derived(queue[index]);
  const total = $derived(queue.length);
  const answeredCount = $derived(index + (finished ? 0 : 0));

  function handleAnswered(isCorrect: boolean) {
    const q = current;
    if (!q) return;
    recordAnswer(q.id, isCorrect);
    if (isCorrect) correctCount += 1;
    else missed = [...missed, q.id];
  }

  function next() {
    if (index + 1 >= queue.length) finish();
    else index += 1;
  }

  function finish() {
    finished = true;
    const byTopic: Partial<Record<TopicId, { total: number; correct: number }>> = {};
    for (const q of queue) {
      const entry = (byTopic[q.topic] ??= { total: 0, correct: 0 });
      entry.total += 1;
      if (!missed.includes(q.id)) entry.correct += 1;
    }
    saveSession({
      mode,
      scope: moduleId ?? topics?.join(','),
      startedAt,
      finishedAt: Date.now(),
      total: queue.length,
      correct: correctCount,
      missed,
      byTopic,
    });
    onfinish?.(correctCount, queue.length);
  }

  const scorePct = $derived(total ? Math.round((correctCount / total) * 100) : 0);

  const missedQuestions = $derived(
    missed.map((id) => queue.find((q) => q.id === id)).filter((q): q is Question => Boolean(q)),
  );

  function retryMissed() {
    begin(missedQuestions);
  }

  const missedByTopic = $derived.by(() => {
    const map = new Map<TopicId, number>();
    for (const q of missedQuestions) map.set(q.topic, (map.get(q.topic) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  });
</script>

<div class="runner">
  {#if !started}
    <p class="muted">Loading…</p>
  {:else if total === 0}
    <div class="card center empty">
      <p class="empty-icon" aria-hidden="true">🎉</p>
      <h2>{emptyMessage}</h2>
      <a class="btn btn-primary" href={doneHref ?? link('/practice/')}>{doneLabel}</a>
    </div>
  {:else if !finished}
    <header class="runner-head">
      <div class="spread">
        <div>
          <h1 class="runner-title">{title}</h1>
          <p class="tiny subtle">Question {index + 1} of {total}</p>
        </div>
        <div class="score-live">
          <span class="chip chip-success">{correctCount} ✓</span>
          {#if missed.length}<span class="chip chip-danger">{missed.length} ✕</span>{/if}
        </div>
      </div>
      <div class="bar">
        <span style:width={`${(index / total) * 100}%`}></span>
      </div>
    </header>

    <div class="card question-card">
      {#key current?.id}
        <QuestionCard
          question={current!}
          onanswered={handleAnswered}
          onnext={next}
          nextLabel={index + 1 >= total ? 'See results' : 'Next question'}
        />
      {/key}
    </div>

    <div class="runner-foot">
      <button type="button" class="btn btn-ghost btn-sm" onclick={finish}>End session early</button>
    </div>
  {:else}
    <!-- ---------------- Results ---------------- -->
    <div class="results">
      <div class="card result-hero" class:good={scorePct >= 70}>
        <p class="result-emoji" aria-hidden="true">
          {scorePct >= 90 ? '🏆' : scorePct >= 70 ? '✅' : scorePct >= 50 ? '📈' : '📚'}
        </p>
        <h1>{correctCount} / {total} &middot; {scorePct}%</h1>
        <p class="muted">
          {#if scorePct >= 90}
            Excellent. This material is solid.
          {:else if scorePct >= 70}
            Above the pass mark. Tidy up the misses below.
          {:else if scorePct >= 50}
            Getting there - the misses below are where the marks are.
          {:else}
            Worth revisiting the lesson before drilling further.
          {/if}
        </p>
        <div class="row result-actions">
          {#if missed.length}
            <button type="button" class="btn btn-primary" onclick={retryMissed}>
              Retry the {missed.length} you missed
            </button>
          {/if}
          <button type="button" class="btn" onclick={() => begin()}>New set</button>
          <a class="btn btn-ghost" href={doneHref ?? link('/practice/')}>{doneLabel}</a>
        </div>
      </div>

      {#if missedByTopic.length}
        <div class="card">
          <h2 class="h-sm">Where the misses were</h2>
          <ul class="topic-misses">
            {#each missedByTopic as [topic, count] (topic)}
              <li>
                <span>{topicLabel(topic)}</span>
                <span class="chip chip-danger">{count} missed</span>
                <a class="tiny" href={link(`/practice/weak/?topic=${topic}`)}>Drill this →</a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if missedQuestions.length}
        <section class="review-list">
          <h2 class="h-sm">Review your misses</h2>
          {#each missedQuestions as q (q.id)}
            <div class="card">
              <QuestionCard question={q} revealed hideNext />
            </div>
          {/each}
        </section>
      {/if}
    </div>
  {/if}
</div>

<style>
  .runner {
    max-width: 760px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .runner-head {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .runner-title {
    margin: 0;
    font-size: 1.25rem;
  }

  .score-live {
    display: flex;
    gap: 0.3rem;
  }

  .question-card {
    padding: 1.3rem;
  }

  .runner-foot {
    display: flex;
    justify-content: center;
  }

  .empty {
    padding: 2.5rem 1.5rem;
  }
  .empty-icon {
    font-size: 2.4rem;
    margin: 0 0 0.4rem;
  }
  .empty h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .result-hero {
    text-align: center;
    padding: 2rem 1.5rem;
  }
  .result-hero.good {
    border-color: var(--success-border);
  }
  .result-emoji {
    font-size: 2.6rem;
    margin: 0 0 0.3rem;
    line-height: 1;
  }
  .result-hero h1 {
    font-size: 1.9rem;
    margin-bottom: 0.3rem;
  }

  .result-actions {
    justify-content: center;
    margin-top: 1rem;
  }

  .h-sm {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-subtle);
    font-weight: 700;
    margin-bottom: 0.7rem;
  }

  .topic-misses {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .topic-misses li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.92rem;
  }
  .topic-misses li a {
    margin-left: auto;
  }

  .review-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
</style>
