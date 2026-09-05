<script lang="ts">
  /**
   * Final-day cram mode. Everything marked "know this" across the whole app,
   * pulled into one linear pass: key callouts, traps, changed-since-AI-900
   * notes, quick facts and comparison bottom lines.
   *
   * Deliberately dense and printable. No new material.
   */
  import { MODULES } from '../data/modules';
  import { COMPARISONS, QUICK_FACTS, FLASHCARDS } from '../data/review';
  import { EXAM_DAY_TIPS } from '../data/roadmap';
  import { TOPICS, topicLabel, EXAM } from '../data/exam';
  import { inlineMarkdown } from '../lib/markdown';
  import { progress, emptyProgress, get } from '../lib/store';
  import { computeOverall, daysUntilExam } from '../lib/scoring';
  import { ALL_QUESTIONS } from '../data/questions';
  import type { Progress } from '../data/types';

  interface Props {
    base: string;
  }
  let { base }: Props = $props();

  const link = (p: string) => `${base.replace(/\/$/, '')}${p}`;

  let p = $state<Progress>(get());
  $effect(() => progress.subscribe((next) => (p = next)));

  const overall = $derived(computeOverall(p, ALL_QUESTIONS, MODULES));
  const daysLeft = $derived(daysUntilExam(p));

  /** Everything flagged as key / trap / changed, grouped by module. */
  const highlights = $derived(
    MODULES.map((m) => {
      const keys: { title: string; body: string }[] = [];
      const traps: { title: string; body: string }[] = [];
      const changed: { title: string; body: string }[] = [];
      for (const section of m.sections) {
        for (const block of section.blocks) {
          if (block.t === 'key') keys.push({ title: block.title, body: block.body });
          else if (block.t === 'trap') traps.push({ title: block.title, body: block.body });
          else if (block.t === 'changed') changed.push({ title: block.title, body: block.body });
        }
      }
      return { module: m, keys, traps, changed };
    }).filter((h) => h.keys.length || h.traps.length || h.changed.length),
  );

  const highFacts = $derived(QUICK_FACTS.filter((f) => f.priority === 'high'));
  const otherFacts = $derived(QUICK_FACTS.filter((f) => f.priority !== 'high'));
  const highCards = $derived(FLASHCARDS.filter((c) => c.priority === 'high'));

  let section = $state<'checklist' | 'traps' | 'changed' | 'facts' | 'tips'>('checklist');

  const allTraps = $derived(highlights.flatMap((h) => h.traps.map((t) => ({ ...t, module: h.module }))));
  const allChanged = $derived(
    highlights.flatMap((h) => h.changed.map((c) => ({ ...c, module: h.module }))),
  );
</script>

<div class="cram">
  <header class="head">
    <div>
      <h1>🔥 Cram sheet</h1>
      <p class="muted">
        Everything marked <em>know this</em> across the whole app, in one pass. No new material -
        this is for the day before and the morning of.
      </p>
    </div>
    {#if daysLeft !== null}
      <div class="countdown card card-tight" class:urgent={daysLeft <= 1}>
        <strong>{daysLeft <= 0 ? 'Today' : daysLeft}</strong>
        <span class="tiny muted">{daysLeft <= 0 ? 'exam day' : daysLeft === 1 ? 'day to go' : 'days to go'}</span>
      </div>
    {/if}
  </header>

  {#if overall.mistakeIds.length}
    <a class="alert card" href={link('/practice/mistakes/')}>
      <strong>You have {overall.mistakeIds.length} questions sitting on a wrong answer.</strong>
      <span class="tiny muted">
        Clearing these is the highest-value thing you can do right now. →
      </span>
    </a>
  {/if}

  <nav class="jump" aria-label="Cram sections">
    <button type="button" class="jbtn" class:active={section === 'checklist'} onclick={() => (section = 'checklist')}>
      Know this
    </button>
    <button type="button" class="jbtn" class:active={section === 'traps'} onclick={() => (section = 'traps')}>
      Traps ({allTraps.length})
    </button>
    <button type="button" class="jbtn" class:active={section === 'changed'} onclick={() => (section = 'changed')}>
      Changed since AI-900 ({allChanged.length})
    </button>
    <button type="button" class="jbtn" class:active={section === 'facts'} onclick={() => (section = 'facts')}>
      One-liners
    </button>
    <button type="button" class="jbtn" class:active={section === 'tips'} onclick={() => (section = 'tips')}>
      Sitting the exam
    </button>
  </nav>

  {#if section === 'checklist'}
    <section class="pane">
      <div class="weights card">
        <h2 class="h-sm">Where the marks are</h2>
        <ul class="weight-list">
          {#each [...TOPICS].sort((a, b) => b.weight - a.weight) as t (t.id)}
            <li>
              <span class="w-bar"><span style:width={`${(t.weight / 20) * 100}%`}></span></span>
              <span class="w-label">{t.label}</span>
              <strong>{t.weight}%</strong>
            </li>
          {/each}
        </ul>
        <p class="tiny subtle">
          Pass mark {EXAM.passingScore}/{EXAM.scoreScale}. {EXAM.questionCountLabel} questions.
        </p>
      </div>

      {#each highlights as h (h.module.id)}
        {#if h.keys.length}
          <div class="card mod-block">
            <h2 class="mod-title">
              <span aria-hidden="true">{h.module.icon}</span>
              {h.module.title}
              <a class="tiny" href={link(`/learn/${h.module.id}/`)}>lesson →</a>
            </h2>
            <ul class="key-list">
              {#each h.keys as k (k.title)}
                <li>
                  <strong>{k.title}</strong>
                  <span>{@html inlineMarkdown(k.body)}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      {/each}

      <div class="card mod-block">
        <h2 class="mod-title"><span aria-hidden="true">📌</span> Bottom lines</h2>
        <ul class="key-list">
          {#each COMPARISONS as c (c.id)}
            <li>
              <strong>{c.title}</strong>
              <span>{@html inlineMarkdown(c.bottomLine)}</span>
            </li>
          {/each}
        </ul>
      </div>
    </section>
  {:else if section === 'traps'}
    <section class="pane">
      <p class="lead muted">
        Distinctions the exam deliberately blurs. If you can articulate each of these in one
        sentence, you will not lose marks to them.
      </p>
      {#each allTraps as trap (trap.title)}
        <div class="callout callout-trap">
          <div class="callout-title"><span aria-hidden="true">⚠️</span>{trap.title}</div>
          <p>{@html inlineMarkdown(trap.body)}</p>
          <p class="tiny subtle src">
            <a href={link(`/learn/${trap.module.id}/`)}>{trap.module.title}</a>
          </p>
        </div>
      {/each}
    </section>
  {:else if section === 'changed'}
    <section class="pane">
      <p class="lead muted">
        The things Microsoft renamed or replaced. Old study material - including most AI-900 notes
        and many practice question sets - still uses the left-hand column.
      </p>
      {#each allChanged as change (change.title)}
        <div class="callout callout-changed">
          <div class="callout-title"><span aria-hidden="true">🔄</span>{change.title}</div>
          <p>{@html inlineMarkdown(change.body)}</p>
          <p class="tiny subtle src">
            <a href={link(`/learn/${change.module.id}/`)}>{change.module.title}</a>
          </p>
        </div>
      {/each}
    </section>
  {:else if section === 'facts'}
    <section class="pane">
      <div class="card">
        <h2 class="h-sm">Highest priority</h2>
        <ul class="one-liners">
          {#each highFacts as f (f.id)}
            <li>
              <span class="chip">{topicLabel(f.topic)}</span>
              <span>{@html inlineMarkdown(f.fact)}</span>
            </li>
          {/each}
        </ul>
      </div>
      <div class="card">
        <h2 class="h-sm">Also worth a glance</h2>
        <ul class="one-liners">
          {#each otherFacts as f (f.id)}
            <li>
              <span class="chip">{topicLabel(f.topic)}</span>
              <span>{@html inlineMarkdown(f.fact)}</span>
            </li>
          {/each}
        </ul>
      </div>
      <div class="card">
        <h2 class="h-sm">Rapid recall ({highCards.length} high-priority cards)</h2>
        <dl class="qa">
          {#each highCards as c (c.id)}
            <div>
              <dt>{@html inlineMarkdown(c.front)}</dt>
              <dd>{@html inlineMarkdown(c.back)}</dd>
            </div>
          {/each}
        </dl>
        <a class="btn btn-sm" href={link('/review/')}>Drill these as flashcards →</a>
      </div>
    </section>
  {:else}
    <section class="pane">
      <p class="lead muted">Technique, not content. Worth reading on the morning of the exam.</p>
      {#each EXAM_DAY_TIPS as tip (tip.title)}
        <div class="card tip">
          <strong>{tip.title}</strong>
          <p class="muted">{tip.body}</p>
        </div>
      {/each}
      <div class="card final">
        <h2 class="h-sm">Last 30 minutes</h2>
        <ol>
          <li>Read the <button type="button" class="linkish" onclick={() => (section = 'traps')}>traps</button> list once.</li>
          <li>
            Read the <button type="button" class="linkish" onclick={() => (section = 'changed')}>changed since AI-900</button>
            list once - this is where stale practice material misleads people.
          </li>
          <li>Run a <a href={link('/practice/mistakes/')}>mistakes</a> set if you have any outstanding.</li>
          <li>Stop. More cramming past this point costs more than it gains.</li>
        </ol>
      </div>
    </section>
  {/if}
</div>

<style>
  .cram {
    max-width: 800px;
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
    max-width: 58ch;
    margin: 0;
    font-size: 0.95rem;
  }

  .countdown {
    text-align: center;
    min-width: 96px;
    display: flex;
    flex-direction: column;
  }
  .countdown strong {
    font-size: 1.7rem;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }
  .countdown.urgent {
    border-color: var(--danger-border);
    background: var(--danger-soft);
  }

  .alert {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    text-decoration: none;
    color: inherit;
    border-color: var(--warn-border);
    background: var(--warn-soft);
    transition: transform 0.13s;
  }
  .alert:hover {
    transform: translateY(-1px);
    color: inherit;
  }

  .jump {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    position: sticky;
    top: calc(var(--header-h, 58px) + 6px);
    z-index: 20;
    padding: 0.4rem 0;
    background: var(--bg);
  }
  .jbtn {
    font: inherit;
    font-size: 0.8rem;
    font-weight: 620;
    padding: 0.3rem 0.65rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    color: var(--fg-muted);
    cursor: pointer;
  }
  .jbtn:hover {
    background: var(--bg-hover);
    color: var(--fg);
  }
  .jbtn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-fg);
  }

  .pane {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .lead {
    max-width: 62ch;
    font-size: 0.93rem;
    margin: 0;
  }

  .h-sm {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-subtle);
    font-weight: 700;
    margin-bottom: 0.6rem;
  }

  .weight-list {
    list-style: none;
    margin: 0 0 0.6rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .weight-list li {
    display: grid;
    grid-template-columns: 70px 1fr auto;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.88rem;
  }
  .w-bar {
    display: block;
    height: 7px;
    border-radius: 999px;
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .w-bar > span {
    display: block;
    height: 100%;
    background: var(--accent);
  }

  .mod-block {
    padding: 1rem;
  }
  .mod-title {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }
  .mod-title a {
    margin-left: auto;
    font-weight: 500;
  }

  .key-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .key-list li {
    font-size: 0.9rem;
    line-height: 1.55;
    padding-left: 0.7rem;
    border-left: 2px solid var(--accent);
  }
  .key-list strong {
    display: block;
  }
  .key-list span {
    color: var(--fg-muted);
  }

  .src {
    margin: 0.4rem 0 0;
  }
  .callout p {
    font-size: 0.9rem;
    line-height: 1.55;
  }

  .one-liners {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .one-liners li {
    display: flex;
    align-items: baseline;
    gap: 0.55rem;
    font-size: 0.9rem;
    line-height: 1.55;
  }
  .one-liners .chip {
    flex-shrink: 0;
    font-size: 0.64rem;
  }

  .qa {
    margin: 0 0 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }
  .qa dt {
    font-size: 0.88rem;
    font-weight: 620;
  }
  .qa dd {
    margin: 0.1rem 0 0;
    font-size: 0.88rem;
    color: var(--fg-muted);
    line-height: 1.5;
  }

  .tip strong {
    display: block;
    margin-bottom: 0.15rem;
    font-size: 0.95rem;
  }
  .tip p {
    margin: 0;
    font-size: 0.89rem;
    line-height: 1.55;
  }

  .final ol {
    margin: 0;
    padding-left: 1.2rem;
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .final li + li {
    margin-top: 0.3rem;
  }

  .linkish {
    font: inherit;
    background: none;
    border: 0;
    padding: 0;
    color: var(--accent);
    text-decoration: underline;
    cursor: pointer;
  }

  @media (max-width: 560px) {
    .jump {
      top: calc(var(--header-h, 92px) + 4px);
    }
  }
</style>
