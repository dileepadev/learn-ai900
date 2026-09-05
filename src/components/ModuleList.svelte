<script lang="ts">
  /** The lesson index, in recommended study order, with per-module progress. */
  import { MODULES, TOTAL_LESSON_MINUTES, checkIdsFor } from '../data/modules';
  import { topicLabel } from '../data/exam';
  import { progress, emptyProgress, get } from '../lib/store';
  import type { Progress } from '../data/types';

  interface Props {
    base: string;
  }
  let { base }: Props = $props();

  const link = (p: string) => `${base.replace(/\/$/, '')}${p}`;

  let p = $state<Progress>(get());
  $effect(() => progress.subscribe((next) => (p = next)));

  const rows = $derived(
    MODULES.map((m) => {
      const state = p.modules[m.id];
      const seen = state?.sectionsSeen.length ?? 0;
      const readPct = m.sections.length ? Math.round((seen / m.sections.length) * 100) : 0;
      const checks = checkIdsFor(m);
      const checksDone = checks.filter((id) => p.questions[id]?.seen).length;
      const quizDone = m.quiz.filter((id) => p.questions[id]?.seen).length;
      return {
        module: m,
        started: Boolean(state?.startedAt),
        completed: Boolean(state?.completedAt),
        readPct,
        checks: checks.length,
        checksDone,
        quiz: m.quiz.length,
        quizDone,
      };
    }),
  );

  const completedCount = $derived(rows.filter((r) => r.completed).length);
  const remainingMinutes = $derived(
    rows.filter((r) => !r.completed).reduce((sum, r) => sum + r.module.minutes, 0),
  );
  const nextUp = $derived(
    rows.find((r) => r.started && !r.completed) ?? rows.find((r) => !r.started),
  );
</script>

<header class="head">
  <div>
    <h1>Lessons</h1>
    <p class="muted">
      {MODULES.length} lessons in recommended study order, {Math.round((TOTAL_LESSON_MINUTES / 60) * 10) / 10}
      hours in total. Each one ends with a quiz; passing it marks the lesson complete.
    </p>
  </div>
  <div class="summary card card-tight">
    <span class="big">{completedCount}<span class="of">/{MODULES.length}</span></span>
    <span class="tiny muted">complete</span>
    {#if remainingMinutes > 0}
      <span class="tiny subtle">{remainingMinutes} min of reading left</span>
    {/if}
  </div>
</header>

{#if nextUp}
  <a class="resume card" href={link(`/learn/${nextUp.module.id}/`)}>
    <span class="resume-icon" aria-hidden="true">{nextUp.module.icon}</span>
    <span class="resume-body">
      <span class="tiny subtle">{nextUp.started ? 'Continue where you left off' : 'Start here'}</span>
      <strong>{nextUp.module.title}</strong>
    </span>
    <span class="chip chip-accent">{nextUp.module.minutes} min →</span>
  </a>
{/if}

<ol class="modules">
  {#each rows as row (row.module.id)}
    <li>
      <a class="mod card" href={link(`/learn/${row.module.id}/`)} class:done={row.completed}>
        <span class="mod-order" aria-hidden="true">{row.module.order}</span>
        <span class="mod-icon" aria-hidden="true">{row.module.icon}</span>

        <span class="mod-body">
          <span class="mod-title-row">
            <strong class="mod-title">{row.module.title}</strong>
            {#if row.completed}<span class="chip chip-success">✓</span>{/if}
            {#if row.module.priority === 'high' && !row.completed}
              <span class="chip chip-warn">high priority</span>
            {/if}
          </span>
          <span class="tiny muted mod-summary">{row.module.summary}</span>
          <span class="mod-meta tiny subtle">
            <span class="chip">{topicLabel(row.module.topic)}</span>
            <span>{row.module.minutes} min</span>
            <span>·</span>
            <span>{row.checksDone}/{row.checks} checks</span>
            <span>·</span>
            <span>{row.quizDone}/{row.quiz} quiz</span>
          </span>
          {#if row.started && !row.completed}
            <span class="bar mod-bar"><span style:width={`${row.readPct}%`}></span></span>
          {/if}
        </span>

        <span class="mod-go" aria-hidden="true">→</span>
      </a>
    </li>
  {/each}
</ol>

<style>
  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.2rem;
  }
  .head p {
    max-width: 58ch;
    font-size: 0.95rem;
    margin: 0;
  }

  .summary {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    min-width: 130px;
  }
  .big {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .of {
    font-size: 0.6em;
    color: var(--fg-subtle);
  }

  .resume {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    text-decoration: none;
    color: inherit;
    border-color: var(--accent);
    background: var(--accent-soft);
    margin-bottom: 1.2rem;
    transition:
      transform 0.14s,
      box-shadow 0.14s;
  }
  .resume:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
    color: inherit;
  }
  .resume-icon {
    font-size: 1.6rem;
  }
  .resume-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  .resume-body strong {
    font-size: 1.02rem;
  }

  .modules {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .mod {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    text-decoration: none;
    color: inherit;
    padding: 0.9rem 1rem;
    transition:
      transform 0.14s,
      box-shadow 0.14s,
      border-color 0.14s;
  }
  .mod:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
    border-color: var(--border-strong);
    color: inherit;
  }
  .mod.done {
    border-color: var(--success-border);
  }

  .mod-order {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    margin-top: 0.15rem;
    border-radius: 999px;
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--fg-muted);
  }
  .mod.done .mod-order {
    background: var(--success);
    border-color: var(--success);
    color: var(--bg-elevated);
  }

  .mod-icon {
    font-size: 1.35rem;
    line-height: 1.2;
    flex-shrink: 0;
  }

  .mod-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
  }

  .mod-title-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .mod-title {
    font-size: 1rem;
    line-height: 1.3;
  }

  .mod-summary {
    line-height: 1.5;
  }

  .mod-meta {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  }
  .mod-meta .chip {
    font-size: 0.66rem;
    padding: 0.06rem 0.35rem;
  }

  .mod-bar {
    margin-top: 0.15rem;
    max-width: 220px;
    height: 5px;
  }

  .mod-go {
    color: var(--fg-subtle);
    font-size: 1.1rem;
    align-self: center;
    flex-shrink: 0;
  }

  @media (max-width: 560px) {
    .mod-go {
      display: none;
    }
  }
</style>
