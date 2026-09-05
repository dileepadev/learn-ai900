<script lang="ts">
  /**
   * Renders any question type, collects an answer, and - outside exam mode -
   * shows immediate feedback explaining both the correct answer and why the
   * chosen distractor was wrong.
   */
  import type { Answer, Question } from '../data/types';
  import { grade } from '../lib/store';
  import { inlineMarkdown } from '../lib/markdown';
  import { topicLabel } from '../data/exam';

  interface Props {
    question: Question;
    /** Exam mode hides feedback and lets the answer be changed freely. */
    examMode?: boolean;
    /** Pre-existing answer, for review screens or resuming an exam. */
    initial?: Answer | null;
    /** Show the explanation immediately (review-of-mistakes screens). */
    revealed?: boolean;
    /** Called whenever the answer changes (exam mode autosave). */
    onchange?: (answer: Answer, complete: boolean) => void;
    /** Called once when the learner submits and feedback is shown. */
    onanswered?: (correct: boolean, answer: Answer) => void;
    /** Called when the learner asks for the next question. */
    onnext?: () => void;
    /** Label for the advance button. */
    nextLabel?: string;
    /** Hide the advance button (lesson inline checks manage their own flow). */
    hideNext?: boolean;
  }

  let {
    question,
    examMode = false,
    initial = null,
    revealed = false,
    onchange,
    onanswered,
    onnext,
    nextLabel = 'Next',
    hideNext = false,
  }: Props = $props();

  /* ---------------- answer state ---------------- */

  let selectedSingle = $state<string | null>(null);
  let selectedMulti = $state<string[]>([]);
  let assignments = $state<Record<string, string | null>>({});
  let ordering = $state<string[]>([]);

  let submitted = $state(false);
  let wasCorrect = $state(false);

  /** Reset everything when the question changes. */
  let currentId = $state('');
  $effect(() => {
    if (currentId === question.id) return;
    currentId = question.id;
    submitted = revealed;
    wasCorrect = false;

    selectedSingle = null;
    selectedMulti = [];
    assignments = {};
    ordering = [];

    if (question.type === 'match') {
      assignments = Object.fromEntries(question.pairs.map((p) => [p.id, null]));
    }
    if (question.type === 'order') {
      // Present in a shuffled order that is stable for this question.
      ordering = shuffleStable(question.items.map((i) => i.id), question.id);
    }

    if (initial) restore(initial);
    if (revealed) {
      submitted = true;
      wasCorrect = initial ? grade(question, initial) : false;
    }
  });

  function restore(answer: Answer) {
    if (answer.type === 'single') selectedSingle = answer.optionId;
    else if (answer.type === 'multi') selectedMulti = [...answer.optionIds];
    else if (answer.type === 'match') assignments = { ...answer.assignments };
    else if (answer.type === 'order') ordering = [...answer.itemIds];
  }

  /** Deterministic shuffle so a re-render never reorders mid-question. */
  function shuffleStable(ids: string[], seedText: string): string[] {
    let h = 2166136261;
    for (let i = 0; i < seedText.length; i++) {
      h ^= seedText.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const out = [...ids];
    for (let i = out.length - 1; i > 0; i--) {
      h = (Math.imul(h, 48271) + 11) >>> 0;
      const j = h % (i + 1);
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    // Guard against the shuffle landing on the correct order.
    if (out.every((id, i) => id === ids[i]) && out.length > 1) {
      [out[0], out[out.length - 1]] = [out[out.length - 1]!, out[0]!];
    }
    return out;
  }

  const answer = $derived.by((): Answer => {
    switch (question.type) {
      case 'single':
        return { type: 'single', optionId: selectedSingle };
      case 'multi':
        return { type: 'multi', optionIds: selectedMulti };
      case 'match':
        return { type: 'match', assignments };
      case 'order':
        return { type: 'order', itemIds: ordering };
    }
  });

  const complete = $derived.by(() => {
    switch (question.type) {
      case 'single':
        return selectedSingle !== null;
      case 'multi':
        return selectedMulti.length > 0;
      case 'match':
        return question.pairs.every((p) => assignments[p.id]);
      case 'order':
        return ordering.length === question.items.length;
    }
  });

  const requiredCount = $derived(
    question.type === 'multi' ? question.options.filter((o) => o.correct).length : 0,
  );

  function notifyChange() {
    onchange?.(answer, complete);
  }

  /* ---------------- interactions ---------------- */

  function pickSingle(id: string) {
    if (submitted && !examMode) return;
    selectedSingle = id;
    notifyChange();
    // Single-choice questions submit on selection outside exam mode: one tap,
    // instant feedback, which is what makes rapid practice feel fast.
    if (!examMode) submit();
  }

  function toggleMulti(id: string) {
    if (submitted && !examMode) return;
    selectedMulti = selectedMulti.includes(id)
      ? selectedMulti.filter((x) => x !== id)
      : [...selectedMulti, id];
    notifyChange();
  }

  function assign(pairId: string, value: string) {
    if (submitted && !examMode) return;
    assignments = { ...assignments, [pairId]: value || null };
    notifyChange();
  }

  function move(index: number, delta: number) {
    if (submitted && !examMode) return;
    const target = index + delta;
    if (target < 0 || target >= ordering.length) return;
    const next = [...ordering];
    [next[index], next[target]] = [next[target]!, next[index]!];
    ordering = next;
    notifyChange();
  }

  function submit() {
    if (submitted || !complete) return;
    submitted = true;
    wasCorrect = grade(question, answer);
    onanswered?.(wasCorrect, answer);
  }

  /* ---------------- lookups for feedback ---------------- */

  const rightOptions = $derived(
    question.type === 'match'
      ? [...new Set(question.pairs.map((p) => p.right))].sort()
      : [],
  );

  function optionState(optionId: string, correct: boolean): 'correct' | 'wrong' | 'missed' | '' {
    if (!submitted || examMode) return '';
    const chosen =
      question.type === 'single' ? selectedSingle === optionId : selectedMulti.includes(optionId);
    if (chosen && correct) return 'correct';
    if (chosen && !correct) return 'wrong';
    if (!chosen && correct) return 'missed';
    return '';
  }

  const showFeedback = $derived(submitted && !examMode);

  const itemById = $derived(
    question.type === 'order'
      ? Object.fromEntries(question.items.map((i) => [i.id, i.text]))
      : {},
  );

  const correctPositions = $derived(
    question.type === 'order' ? question.items.map((i) => i.id) : [],
  );
</script>

<article class="q" class:answered={showFeedback}>
  <header class="q-head">
    <span class="chip">{topicLabel(question.topic)}</span>
    <span class="chip" class:chip-warn={question.difficulty === 'hard'}>
      {question.difficulty}
    </span>
    {#if question.kind === 'exam'}
      <span class="chip chip-info">exam style</span>
    {/if}
  </header>

  {#if question.scenario}
    <p class="scenario">{@html inlineMarkdown(question.scenario)}</p>
  {/if}

  <h3 class="q-prompt">{@html inlineMarkdown(question.prompt)}</h3>

  {#if question.type === 'single' || question.type === 'multi'}
    {#if question.type === 'multi'}
      <p class="tiny subtle hint">Select {requiredCount}.</p>
    {/if}
    <ul class="options" role={question.type === 'single' ? 'radiogroup' : 'group'}>
      {#each question.options as option (option.id)}
        {@const state = optionState(option.id, option.correct)}
        <li>
          <button
            type="button"
            class="option {state}"
            class:selected={question.type === 'single'
              ? selectedSingle === option.id
              : selectedMulti.includes(option.id)}
            role={question.type === 'single' ? 'radio' : 'checkbox'}
            aria-checked={question.type === 'single'
              ? selectedSingle === option.id
              : selectedMulti.includes(option.id)}
            disabled={showFeedback}
            onclick={() =>
              question.type === 'single' ? pickSingle(option.id) : toggleMulti(option.id)}
          >
            <span class="marker" class:round={question.type === 'single'} aria-hidden="true">
              {#if state === 'correct'}✓{:else if state === 'wrong'}✕{:else if state === 'missed'}✓{/if}
            </span>
            <span class="option-body">
              <span class="option-text">{@html inlineMarkdown(option.text)}</span>
              {#if showFeedback && option.why && !option.correct}
                <span class="why">{@html inlineMarkdown(option.why)}</span>
              {/if}
            </span>
          </button>
        </li>
      {/each}
    </ul>
  {:else if question.type === 'match'}
    <ul class="matches">
      {#each question.pairs as pair (pair.id)}
        {@const chosen = assignments[pair.id]}
        {@const ok = submitted && !examMode && chosen === pair.right}
        <li class="match" class:correct={ok} class:wrong={submitted && !examMode && !ok}>
          <span class="match-left">{@html inlineMarkdown(pair.left)}</span>
          <span class="match-control">
            <select
              value={chosen ?? ''}
              disabled={showFeedback}
              aria-label={`${question.rightLabel} for: ${pair.left}`}
              onchange={(e) => assign(pair.id, e.currentTarget.value)}
            >
              <option value="">Choose {question.rightLabel.toLowerCase()}…</option>
              {#each rightOptions as right (right)}
                <option value={right}>{right}</option>
              {/each}
            </select>
            {#if submitted && !examMode && !ok}
              <span class="correction">→ {pair.right}</span>
            {/if}
          </span>
        </li>
      {/each}
    </ul>
  {:else if question.type === 'order'}
    <ol class="ordering">
      {#each ordering as id, i (id)}
        {@const ok = submitted && !examMode && correctPositions[i] === id}
        <li class="order-item" class:correct={ok} class:wrong={submitted && !examMode && !ok}>
          <span class="order-index">{i + 1}</span>
          <span class="order-text">{@html inlineMarkdown(itemById[id] ?? id)}</span>
          <span class="order-controls">
            <button
              type="button"
              class="btn btn-sm btn-ghost"
              disabled={showFeedback || i === 0}
              aria-label="Move up"
              onclick={() => move(i, -1)}>↑</button
            >
            <button
              type="button"
              class="btn btn-sm btn-ghost"
              disabled={showFeedback || i === ordering.length - 1}
              aria-label="Move down"
              onclick={() => move(i, 1)}>↓</button
            >
          </span>
        </li>
      {/each}
    </ol>
    {#if submitted && !examMode && !wasCorrect}
      <div class="callout callout-info correct-order">
        <div class="callout-title">Correct order</div>
        <ol>
          {#each question.items as item (item.id)}
            <li>{@html inlineMarkdown(item.text)}</li>
          {/each}
        </ol>
      </div>
    {/if}
  {/if}

  <!--
    In exam mode the runner owns navigation, so the card renders no footer at all.
    Outside exam mode, single-choice questions submit on selection; every other
    type needs an explicit check.
  -->
  {#if !examMode && !submitted && question.type !== 'single'}
    <footer class="q-foot">
      <button type="button" class="btn btn-primary" disabled={!complete} onclick={submit}>
        Check answer
      </button>
      {#if !complete}
        <span class="tiny subtle">
          {question.type === 'multi'
            ? `Select ${requiredCount}.`
            : question.type === 'match'
              ? 'Match every row to continue.'
              : 'Arrange the items, then check.'}
        </span>
      {/if}
    </footer>
  {/if}

  {#if showFeedback}
    <div class="verdict pop-in" class:ok={wasCorrect} class:no={!wasCorrect}>
      <div class="verdict-head">
        <span class="verdict-icon" aria-hidden="true">{wasCorrect ? '✓' : '✕'}</span>
        <strong>{wasCorrect ? 'Correct' : 'Not quite'}</strong>
      </div>
      <p class="explanation">{@html inlineMarkdown(question.explanation)}</p>
      {#if question.reference}
        <p class="tiny">
          <a href={question.reference.url} target="_blank" rel="noopener noreferrer">
            {question.reference.label} ↗
          </a>
        </p>
      {/if}
      {#if !hideNext && onnext}
        <button type="button" class="btn btn-primary" onclick={() => onnext?.()}>{nextLabel}</button>
      {/if}
    </div>
  {/if}
</article>

<style>
  .q {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .q-head {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .scenario {
    margin: 0;
    padding: 0.7rem 0.9rem;
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 0.92rem;
    color: var(--fg-muted);
  }

  .q-prompt {
    margin: 0;
    font-size: 1.08rem;
    font-weight: 600;
    line-height: 1.45;
  }

  .hint {
    margin: -0.4rem 0 0;
  }

  .options,
  .matches,
  .ordering {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .option {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    width: 100%;
    text-align: left;
    font: inherit;
    font-size: 0.95rem;
    padding: 0.7rem 0.85rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-elevated);
    color: var(--fg);
    cursor: pointer;
    transition:
      border-color 0.13s,
      background 0.13s;
  }
  .option:hover:not(:disabled) {
    border-color: var(--accent);
    background: var(--bg-hover);
  }
  .option:disabled {
    cursor: default;
  }
  .option.selected {
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .marker {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin-top: 1px;
    border-radius: 5px;
    border: 1.5px solid var(--border-strong);
    font-size: 0.7rem;
    font-weight: 800;
    line-height: 1;
  }
  .marker.round {
    border-radius: 999px;
  }
  .option.selected .marker {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--accent-fg);
  }

  .option-body {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    min-width: 0;
  }

  .option.correct {
    border-color: var(--success-border);
    background: var(--success-soft);
  }
  .option.correct .marker {
    border-color: var(--success);
    background: var(--success);
    color: var(--bg-elevated);
  }
  .option.wrong {
    border-color: var(--danger-border);
    background: var(--danger-soft);
  }
  .option.wrong .marker {
    border-color: var(--danger);
    background: var(--danger);
    color: var(--bg-elevated);
  }
  .option.missed {
    border-color: var(--success-border);
    border-style: dashed;
  }
  .option.missed .marker {
    border-color: var(--success);
    color: var(--success);
  }

  .why {
    font-size: 0.85rem;
    color: var(--fg-muted);
    padding-left: 0.7rem;
    border-left: 2px solid var(--danger-border);
  }

  .match {
    display: grid;
    grid-template-columns: 1fr minmax(180px, 42%);
    gap: 0.6rem;
    align-items: center;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-elevated);
    font-size: 0.92rem;
  }
  .match.correct {
    border-color: var(--success-border);
    background: var(--success-soft);
  }
  .match.wrong {
    border-color: var(--danger-border);
    background: var(--danger-soft);
  }

  .match-control {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  select {
    font: inherit;
    font-size: 0.88rem;
    padding: 0.4rem 0.5rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-strong);
    background: var(--bg-elevated);
    color: var(--fg);
    width: 100%;
  }

  .correction {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--success);
  }

  .ordering {
    counter-reset: none;
  }

  .order-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.65rem;
    align-items: center;
    padding: 0.55rem 0.7rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-elevated);
    font-size: 0.92rem;
  }
  .order-item.correct {
    border-color: var(--success-border);
    background: var(--success-soft);
  }
  .order-item.wrong {
    border-color: var(--danger-border);
    background: var(--danger-soft);
  }

  .order-index {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .order-controls {
    display: flex;
    gap: 0.15rem;
  }
  .order-controls .btn {
    padding: 0.2rem 0.45rem;
    min-width: 28px;
  }

  .correct-order ol {
    margin: 0.3rem 0 0;
    padding-left: 1.2rem;
    font-size: 0.9rem;
  }

  .q-foot {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    flex-wrap: wrap;
  }
  .q-foot:empty {
    display: none;
  }

  .verdict {
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-items: flex-start;
  }
  .verdict.ok {
    border-color: var(--success-border);
    background: var(--success-soft);
  }
  .verdict.no {
    border-color: var(--danger-border);
    background: var(--danger-soft);
  }

  .verdict-head {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.95rem;
  }

  .verdict-icon {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 900;
    color: var(--bg-elevated);
  }
  .verdict.ok .verdict-icon {
    background: var(--success);
  }
  .verdict.no .verdict-icon {
    background: var(--danger);
  }

  .explanation {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.55;
  }

  .verdict p:last-of-type {
    margin-bottom: 0;
  }

  @media (max-width: 560px) {
    .match {
      grid-template-columns: 1fr;
    }
  }
</style>
