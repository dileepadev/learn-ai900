<script lang="ts">
  /** The three-day sprint plan, with each step ticked off as its work is done. */
  import { SPRINT_PLAN, EXAM_DAY_TIPS } from '../data/roadmap';
  import { MODULE_BY_ID, TOTAL_LESSON_MINUTES } from '../data/modules';
  import { MODULES } from '../data/modules';
  import { ALL_QUESTIONS } from '../data/questions';
  import { progress, emptyProgress, get } from '../lib/store';
  import { computeOverall, daysUntilExam } from '../lib/scoring';
  import { EXAM, TOPICS } from '../data/exam';
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

  /** A learn step is done when all its modules are complete. */
  function stepDone(step: (typeof SPRINT_PLAN)[number]['steps'][number]): boolean {
    if (step.kind === 'learn' && step.moduleIds) {
      return step.moduleIds.every((id) => Boolean(p.modules[id]?.completedAt));
    }
    if (step.kind === 'exam') {
      return p.sessions.some((s) => s.mode === 'exam' || s.mode === 'mini-exam');
    }
    if (step.kind === 'practice') {
      return p.sessions.some((s) => s.mode !== 'exam' && s.mode !== 'mini-exam' && s.total >= 8);
    }
    return false;
  }

  function stepHref(step: (typeof SPRINT_PLAN)[number]['steps'][number]): string {
    switch (step.kind) {
      case 'learn': {
        const nextIncomplete = step.moduleIds?.find((id) => !p.modules[id]?.completedAt);
        return link(`/learn/${nextIncomplete ?? step.moduleIds?.[0] ?? ''}/`);
      }
      case 'exam':
        return link('/exam/');
      case 'review':
        return link('/review/');
      case 'cram':
        return link('/cram/');
      case 'practice':
      default:
        return link('/practice/');
    }
  }

  const kindIcon: Record<string, string> = {
    learn: '📘',
    practice: '✏️',
    exam: '⏱️',
    review: '⚡',
    cram: '🔥',
  };

  const dayProgress = $derived(
    SPRINT_PLAN.map((day) => {
      const done = day.steps.filter(stepDone).length;
      return { day, done, total: day.steps.length, minutes: day.steps.reduce((s, x) => s + x.minutes, 0) };
    }),
  );

  const currentDay = $derived(dayProgress.find((d) => d.done < d.total) ?? dayProgress[dayProgress.length - 1]);
</script>

<div class="plan">
  <header class="head">
    <div>
      <h1>Your study plan</h1>
      <p class="muted">
        A three-day sprint, front-loaded with the heaviest-weighted topics. Every day ends with
        retrieval practice rather than more reading, because that is what actually moves a score.
      </p>
    </div>
    <div class="head-stats">
      {#if daysLeft !== null}
        <div class="card card-tight stat" class:urgent={daysLeft <= 1}>
          <strong>{daysLeft <= 0 ? 'Today' : daysLeft}</strong>
          <span class="tiny muted">{daysLeft <= 0 ? 'exam day' : daysLeft === 1 ? 'day left' : 'days left'}</span>
        </div>
      {/if}
      <div class="card card-tight stat">
        <strong>{overall.modulesComplete}/{overall.moduleCount}</strong>
        <span class="tiny muted">lessons done</span>
      </div>
    </div>
  </header>

  {#if daysLeft !== null && daysLeft <= 1}
    <a class="urgent-banner card" href={link('/cram/')}>
      <strong>🔥 {daysLeft <= 0 ? 'Exam day.' : 'Exam tomorrow.'} Switch to cram mode.</strong>
      <span class="tiny muted">
        No new material this close in — consolidate what you have and clear your outstanding
        mistakes. →
      </span>
    </a>
  {/if}

  <div class="days">
    {#each dayProgress as { day, done, total, minutes } (day.id)}
      <section class="card day" class:current={day.id === currentDay?.day.id} class:complete={done === total}>
        <header class="day-head">
          <div>
            <h2>{day.title}</h2>
            <p class="tiny muted">{day.goal}</p>
          </div>
          <div class="day-meta">
            <span class="chip" class:chip-success={done === total}>{done}/{total}</span>
            <span class="tiny subtle">≈{Math.round((minutes / 60) * 10) / 10}h</span>
          </div>
        </header>

        <ol class="steps">
          {#each day.steps as step (step.label)}
            {@const done = stepDone(step)}
            <li class="step" class:done>
              <a class="step-link" href={stepHref(step)}>
                <span class="step-check" aria-hidden="true">{done ? '✓' : kindIcon[step.kind]}</span>
                <span class="step-body">
                  <span class="step-label">{step.label}</span>
                  <span class="tiny muted">{step.why}</span>
                  {#if step.moduleIds}
                    <span class="step-mods">
                      {#each step.moduleIds as id (id)}
                        {#if MODULE_BY_ID[id]}
                          <span class="chip" class:chip-success={p.modules[id]?.completedAt}>
                            {MODULE_BY_ID[id]!.icon}
                            {MODULE_BY_ID[id]!.title}
                          </span>
                        {/if}
                      {/each}
                    </span>
                  {/if}
                </span>
                <span class="chip step-time">{step.minutes}m</span>
              </a>
            </li>
          {/each}
        </ol>
      </section>
    {/each}
  </div>

  <section class="card weights">
    <h2 class="h-sm">Why this order</h2>
    <p>
      Time goes where the marks are. These are the published weights, and the plan covers the heavy
      topics first so that if you run out of time, what you skipped is what mattered least.
    </p>
    <ul class="weight-list">
      {#each [...TOPICS].sort((a, b) => b.weight - a.weight) as t (t.id)}
        <li>
          <span class="w-label">{t.label}</span>
          <span class="w-bar"><span style:width={`${(t.weight / 20) * 100}%`}></span></span>
          <strong>{t.weight}%</strong>
        </li>
      {/each}
    </ul>
    <p class="tiny subtle">
      Domain weights come from the official study guide ({EXAM.skillsMeasuredDate}); the split within
      each domain is proportional to how many skills-measured bullets it lists. Total lesson time is
      about {Math.round((TOTAL_LESSON_MINUTES / 60) * 10) / 10} hours.
    </p>
  </section>

  <section class="card">
    <h2 class="h-sm">Sitting the exam</h2>
    <div class="tips">
      {#each EXAM_DAY_TIPS as tip (tip.title)}
        <div class="tip">
          <strong>{tip.title}</strong>
          <p class="tiny muted">{tip.body}</p>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .plan {
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
    margin: 0;
    font-size: 0.95rem;
  }

  .head-stats {
    display: flex;
    gap: 0.5rem;
  }
  .stat {
    text-align: center;
    min-width: 92px;
    display: flex;
    flex-direction: column;
  }
  .stat strong {
    font-size: 1.4rem;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }
  .stat.urgent {
    border-color: var(--danger-border);
    background: var(--danger-soft);
  }

  .urgent-banner {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    text-decoration: none;
    color: inherit;
    border-color: var(--warn-border);
    background: var(--warn-soft);
  }
  .urgent-banner:hover {
    color: inherit;
    transform: translateY(-1px);
  }

  .days {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .day {
    padding: 1rem 1.1rem;
  }
  .day.current {
    border-color: var(--accent);
  }
  .day.complete {
    border-color: var(--success-border);
  }

  .day-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.8rem;
    margin-bottom: 0.75rem;
  }
  .day-head h2 {
    font-size: 1.05rem;
    margin-bottom: 0.1rem;
  }
  .day-head p {
    margin: 0;
    max-width: 54ch;
  }
  .day-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.15rem;
    flex-shrink: 0;
  }

  .steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .step-link {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    padding: 0.55rem 0.7rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    text-decoration: none;
    color: inherit;
    transition:
      border-color 0.13s,
      background 0.13s;
  }
  .step-link:hover {
    border-color: var(--accent);
    background: var(--bg-hover);
    color: inherit;
  }
  .step.done .step-link {
    border-color: var(--success-border);
    background: var(--success-soft);
  }

  .step-check {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    margin-top: 0.1rem;
    border-radius: 999px;
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    font-size: 0.72rem;
  }
  .step.done .step-check {
    background: var(--success);
    border-color: var(--success);
    color: var(--bg-elevated);
    font-weight: 800;
  }

  .step-body {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    flex: 1;
    min-width: 0;
  }
  .step-label {
    font-size: 0.93rem;
    font-weight: 620;
    line-height: 1.35;
  }

  .step-mods {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    margin-top: 0.15rem;
  }
  .step-mods .chip {
    font-size: 0.66rem;
  }

  .step-time {
    flex-shrink: 0;
    font-size: 0.68rem;
  }

  .h-sm {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-subtle);
    font-weight: 700;
    margin-bottom: 0.6rem;
  }

  .weights p {
    font-size: 0.92rem;
    max-width: 64ch;
  }

  .weight-list {
    list-style: none;
    margin: 0.8rem 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .weight-list li {
    display: grid;
    grid-template-columns: minmax(120px, 1fr) 2fr auto;
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

  .tips {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.7rem;
  }
  .tip strong {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.1rem;
  }
  .tip p {
    margin: 0;
    line-height: 1.5;
  }
</style>
