<script lang="ts">
  /**
   * Rapid Review: the high-density revision area. Three interactive surfaces -
   * flashcards with spaced repetition, comparison drills where the cells are
   * hidden until you commit, and one-line "know this" facts.
   */
  import { FLASHCARDS, COMPARISONS, QUICK_FACTS } from '../data/review';
  import { TOPICS, topicLabel } from '../data/exam';
  import type { Flashcard, Progress, TopicId } from '../data/types';
  import { progress, recordFlashcard, emptyProgress, get } from '../lib/store';
  import { isDue } from '../lib/srs';
  import { inlineMarkdown } from '../lib/markdown';

  interface Props {
    base: string;
  }
  let { base }: Props = $props();

  const link = (p: string) => `${base.replace(/\/$/, '')}${p}`;

  type Tab = 'cards' | 'compare' | 'facts';
  let tab = $state<Tab>('cards');
  let topicFilter = $state<TopicId | 'all'>('all');

  let p = $state<Progress>(get());
  $effect(() => progress.subscribe((next) => (p = next)));

  /* ---------------- flashcards ---------------- */

  const deck = $derived.by(() => {
    const pool = FLASHCARDS.filter(
      (c) => topicFilter === 'all' || c.topic === topicFilter,
    );
    // Due and unseen first, high priority ahead of the rest.
    return [...pool].sort((a, b) => {
      const sa = p.flashcards[a.id];
      const sb = p.flashcards[b.id];
      const dueA = isDue(sa) ? 1 : 0;
      const dueB = isDue(sb) ? 1 : 0;
      if (dueA !== dueB) return dueB - dueA;
      const prio = { high: 0, medium: 1, low: 2 } as const;
      return prio[a.priority] - prio[b.priority];
    });
  });

  let cardIndex = $state(0);
  let flipped = $state(false);

  const card = $derived<Flashcard | undefined>(deck[cardIndex]);

  $effect(() => {
    // Reset the position when the filter changes the deck out from under us.
    if (cardIndex >= deck.length) {
      cardIndex = 0;
      flipped = false;
    }
  });

  function answer(knewIt: boolean) {
    if (!card) return;
    recordFlashcard(card.id, knewIt);
    flipped = false;
    cardIndex = (cardIndex + 1) % Math.max(1, deck.length);
  }

  const dueCount = $derived(deck.filter((c) => isDue(p.flashcards[c.id])).length);
  const knownCount = $derived(deck.filter((c) => (p.flashcards[c.id]?.box ?? 0) >= 4).length);

  function onKey(e: KeyboardEvent) {
    if (tab !== 'cards' || !card) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flipped = !flipped;
    } else if (flipped && (e.key === '1' || e.key === 'ArrowLeft')) {
      answer(false);
    } else if (flipped && (e.key === '2' || e.key === 'ArrowRight')) {
      answer(true);
    }
  }

  /* ---------------- comparisons ---------------- */

  let openComparison = $state<string | null>(null);
  let revealedRows = $state<Record<string, Set<number>>>({});

  function toggleRow(cmpId: string, row: number) {
    const set = new Set(revealedRows[cmpId] ?? []);
    if (set.has(row)) set.delete(row);
    else set.add(row);
    revealedRows = { ...revealedRows, [cmpId]: set };
  }

  function revealAll(cmpId: string, count: number) {
    revealedRows = {
      ...revealedRows,
      [cmpId]: new Set(Array.from({ length: count }, (_, i) => i)),
    };
  }

  function hideAll(cmpId: string) {
    revealedRows = { ...revealedRows, [cmpId]: new Set() };
  }

  const comparisons = $derived(
    COMPARISONS.filter((c) => topicFilter === 'all' || c.topic === topicFilter),
  );

  /* ---------------- facts ---------------- */

  const facts = $derived(
    QUICK_FACTS.filter((f) => topicFilter === 'all' || f.topic === topicFilter),
  );
</script>

<svelte:window onkeydown={onKey} />

<div class="review">
  <header class="head">
    <div>
      <h1>Rapid review</h1>
      <p class="muted">
        The things that are easy to forget: terminology, service comparisons, and the distinctions
        the exam deliberately blurs. Nothing here teaches from scratch - it is for consolidation.
      </p>
    </div>
    <a class="btn btn-sm" href={link('/cram/')}>🔥 Cram sheet</a>
  </header>

  <div class="controls">
    <div class="tabs" role="tablist" aria-label="Review mode">
      <button
        type="button"
        role="tab"
        class="tab"
        class:active={tab === 'cards'}
        aria-selected={tab === 'cards'}
        onclick={() => (tab = 'cards')}>Flashcards ({FLASHCARDS.length})</button
      >
      <button
        type="button"
        role="tab"
        class="tab"
        class:active={tab === 'compare'}
        aria-selected={tab === 'compare'}
        onclick={() => (tab = 'compare')}>Comparisons ({COMPARISONS.length})</button
      >
      <button
        type="button"
        role="tab"
        class="tab"
        class:active={tab === 'facts'}
        aria-selected={tab === 'facts'}
        onclick={() => (tab = 'facts')}>Know this ({QUICK_FACTS.length})</button
      >
    </div>

    <label class="filter">
      <span class="visually-hidden">Filter by topic</span>
      <select bind:value={topicFilter}>
        <option value="all">All topics</option>
        {#each TOPICS as t (t.id)}
          <option value={t.id}>{t.label}</option>
        {/each}
      </select>
    </label>
  </div>

  {#if tab === 'cards'}
    {#if !card}
      <div class="card center empty"><p>No flashcards for that topic.</p></div>
    {:else}
      <div class="card-stats tiny subtle">
        <span>{cardIndex + 1} of {deck.length}</span>
        <span>·</span>
        <span>{dueCount} due</span>
        <span>·</span>
        <span>{knownCount} known</span>
      </div>

      <button
        type="button"
        class="flashcard"
        class:flipped
        onclick={() => (flipped = !flipped)}
        aria-label={flipped ? 'Show the front' : 'Reveal the answer'}
      >
        <span class="fc-topic chip">{topicLabel(card.topic)}</span>
        {#if !flipped}
          <span class="fc-face front">{@html inlineMarkdown(card.front)}</span>
          <span class="tiny subtle fc-hint">Click, or press Space, to reveal</span>
        {:else}
          <span class="fc-face back">{@html inlineMarkdown(card.back)}</span>
        {/if}
      </button>

      {#if flipped}
        <div class="fc-actions pop-in">
          <button type="button" class="btn fc-again" onclick={() => answer(false)}>
            Still shaky <span class="kbd">1</span>
          </button>
          <button type="button" class="btn btn-primary fc-got" onclick={() => answer(true)}>
            Got it <span class="kbd">2</span>
          </button>
        </div>
      {:else}
        <div class="fc-actions">
          <button type="button" class="btn btn-primary" onclick={() => (flipped = true)}>
            Reveal <span class="kbd">Space</span>
          </button>
        </div>
      {/if}
    {/if}
  {:else if tab === 'compare'}
    <div class="comparisons">
      {#each comparisons as cmp (cmp.id)}
        {@const revealed = revealedRows[cmp.id] ?? new Set()}
        <section class="card cmp">
          <button
            type="button"
            class="cmp-head"
            aria-expanded={openComparison === cmp.id}
            onclick={() => (openComparison = openComparison === cmp.id ? null : cmp.id)}
          >
            <span>
              <strong>{cmp.title}</strong>
              <span class="tiny muted block">{@html inlineMarkdown(cmp.hook)}</span>
            </span>
            <span class="cmp-toggle" aria-hidden="true">{openComparison === cmp.id ? '−' : '+'}</span>
          </button>

          {#if openComparison === cmp.id}
            <div class="cmp-body">
              <div class="cmp-actions">
                <button
                  type="button"
                  class="btn btn-sm btn-ghost"
                  onclick={() => revealAll(cmp.id, cmp.rows.length)}>Reveal all</button
                >
                <button type="button" class="btn btn-sm btn-ghost" onclick={() => hideAll(cmp.id)}>
                  Hide all
                </button>
                <span class="tiny subtle">Click a row to reveal it - try to answer first.</span>
              </div>

              <div class="table-scroll">
                <table class="data">
                  <thead>
                    <tr>
                      {#each cmp.headers as h (h)}<th>{h}</th>{/each}
                    </tr>
                  </thead>
                  <tbody>
                    {#each cmp.rows as row, ri (ri)}
                      <tr
                        class="cmp-row"
                        class:hidden-row={!revealed.has(ri)}
                        onclick={() => toggleRow(cmp.id, ri)}
                      >
                        {#each row as cell, ci (ci)}
                          <td class:blurred={!revealed.has(ri) && ci > 0}>
                            {@html inlineMarkdown(cell)}
                          </td>
                        {/each}
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>

              <p class="bottom-line">
                <strong>Bottom line:</strong>
                {@html inlineMarkdown(cmp.bottomLine)}
              </p>
            </div>
          {/if}
        </section>
      {/each}
    </div>
  {:else}
    <ul class="facts">
      {#each facts as fact (fact.id)}
        <li class="card card-tight fact" class:high={fact.priority === 'high'}>
          <span class="chip">{topicLabel(fact.topic)}</span>
          <span class="fact-text">{@html inlineMarkdown(fact.fact)}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .review {
    max-width: 820px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .head p {
    max-width: 60ch;
    font-size: 0.95rem;
    margin: 0;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .tabs {
    display: flex;
    gap: 0.2rem;
    flex-wrap: wrap;
  }
  .tab {
    font: inherit;
    font-size: 0.82rem;
    font-weight: 620;
    padding: 0.32rem 0.7rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    color: var(--fg-muted);
    cursor: pointer;
  }
  .tab:hover {
    background: var(--bg-hover);
    color: var(--fg);
  }
  .tab.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-fg);
  }

  select {
    font: inherit;
    font-size: 0.85rem;
    padding: 0.32rem 0.5rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-strong);
    background: var(--bg-elevated);
    color: var(--fg);
  }

  .card-stats {
    display: flex;
    gap: 0.35rem;
    justify-content: center;
  }

  .flashcard {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    min-height: 220px;
    padding: 2.2rem 1.5rem 1.5rem;
    font: inherit;
    text-align: center;
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-strong);
    background: var(--bg-elevated);
    color: var(--fg);
    cursor: pointer;
    box-shadow: var(--shadow);
    transition:
      border-color 0.2s,
      background 0.2s;
  }
  .flashcard:hover {
    border-color: var(--accent);
  }
  .flashcard.flipped {
    background: var(--accent-soft);
    border-color: var(--accent);
  }

  .fc-topic {
    position: absolute;
    top: 0.8rem;
    left: 0.8rem;
    font-size: 0.66rem;
  }

  .fc-face {
    max-width: 46ch;
    line-height: 1.5;
  }
  .fc-face.front {
    font-size: 1.25rem;
    font-weight: 620;
    letter-spacing: -0.01em;
  }
  .fc-face.back {
    font-size: 1.02rem;
  }

  .fc-hint {
    position: absolute;
    bottom: 0.9rem;
  }

  .fc-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }
  .fc-again {
    border-color: var(--danger-border);
    color: var(--danger);
  }
  .fc-got {
    background: var(--success);
    border-color: var(--success);
  }
  .fc-got:hover {
    background: var(--success);
    filter: brightness(1.08);
  }

  .kbd {
    font-family: var(--mono);
    font-size: 0.68rem;
    padding: 0.06rem 0.3rem;
    border-radius: 4px;
    background: rgb(0 0 0 / 0.12);
    opacity: 0.8;
  }

  .comparisons {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .cmp {
    padding: 0;
    overflow: hidden;
  }

  .cmp-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.8rem;
    width: 100%;
    text-align: left;
    font: inherit;
    padding: 0.9rem 1rem;
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
  }
  .cmp-head:hover {
    background: var(--bg-hover);
  }
  .block {
    display: block;
    margin-top: 0.1rem;
    line-height: 1.45;
  }
  .cmp-toggle {
    font-size: 1.2rem;
    color: var(--fg-subtle);
    line-height: 1;
  }

  .cmp-body {
    padding: 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .cmp-actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .cmp-actions .btn {
    border: 1px solid var(--border);
  }

  .cmp-row {
    cursor: pointer;
  }
  td.blurred {
    filter: blur(5px);
    user-select: none;
    transition: filter 0.18s;
  }
  .cmp-row:hover td.blurred {
    filter: blur(3px);
  }

  .bottom-line {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.55;
    padding: 0.6rem 0.75rem;
    border-radius: var(--radius);
    background: var(--accent-soft);
    border: 1px solid var(--accent);
  }

  .facts {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .fact {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    font-size: 0.93rem;
    line-height: 1.55;
  }
  .fact.high {
    border-left: 3px solid var(--accent);
  }
  .fact .chip {
    flex-shrink: 0;
    font-size: 0.65rem;
  }
  .fact-text {
    min-width: 0;
  }

  .empty {
    padding: 2rem;
  }
</style>
