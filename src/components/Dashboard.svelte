<script lang="ts">
  /**
   * The dashboard answers one question above all: "I have N minutes right now,
   * what should I do?" Everything else on the page supports that answer.
   */
  import { progress, setExamDate, emptyProgress, get } from '../lib/store';
  import { computeOverall, computeReadiness, daysUntilExam } from '../lib/scoring';
  import { recommend, TIME_BUDGETS, type Recommendation } from '../lib/recommend';
  import { ALL_QUESTIONS } from '../data/questions';
  import { MODULES, TOTAL_LESSON_MINUTES } from '../data/modules';
  import { EXAM } from '../data/exam';
  import type { Progress } from '../data/types';
  import ReadinessRing from './ReadinessRing.svelte';
  import TopicBars from './TopicBars.svelte';

  interface Props {
    base: string;
  }
  let { base }: Props = $props();

  const link = (p: string) => `${base.replace(/\/$/, '')}${p}`;

  let p = $state<Progress>(get());
  let ready = $state(true);
  let budget = $state(
    typeof localStorage !== 'undefined'
      ? Number(localStorage.getItem('ai901:budget')) || 30
      : 30,
  );

  $effect(() =>
    progress.subscribe((next) => {
      p = next;
      ready = true;
    }),
  );

  function setBudget(minutes: number) {
    budget = minutes;
    try {
      localStorage.setItem('ai901:budget', String(minutes));
    } catch {
      /* ignore */
    }
  }

  const readiness = $derived(computeReadiness(p, ALL_QUESTIONS, MODULES));
  const overall = $derived(computeOverall(p, ALL_QUESTIONS, MODULES));
  const daysLeft = $derived(daysUntilExam(p));

  const recs = $derived<Recommendation[]>(
    recommend({ progress: p, modules: MODULES, questions: ALL_QUESTIONS, budget, base }),
  );
  const primary = $derived(recs[0]);
  const rest = $derived(recs.slice(1));

  const isNew = $derived(overall.distinctAnswered === 0 && overall.modulesComplete === 0);

  const kindIcon: Record<string, string> = {
    learn: '📘',
    practice: '✏️',
    weak: '🎯',
    mistakes: '🔁',
    exam: '⏱️',
    review: '⚡',
    cram: '🔥',
    flashcards: '⚡',
  };

  let examDateInput = $state('');
  $effect(() => {
    examDateInput = p.examDate ?? '';
  });

  function saveExamDate(value: string) {
    setExamDate(value || undefined);
  }

  const accuracyPct = $derived(
    overall.accuracy === null ? null : Math.round(overall.accuracy * 100),
  );
</script>

{#if !ready}
  <div class="card skeleton" aria-hidden="true"></div>
{:else}
  <!-- ---------------- Hero: readiness + next action ---------------- -->
  <section class="hero card">
    <div class="hero-ring">
      <ReadinessRing
        value={readiness.overall}
        label={readiness.label}
        caption={readiness.overall > 0 ? `pass mark ≈ 70%` : undefined}
      />
    </div>

    <div class="hero-main">
      {#if isNew}
        <h1>Let's get you through AI-901.</h1>
        <p class="lead muted">
          {MODULES.length} focused lessons ({Math.round(TOTAL_LESSON_MINUTES / 60 * 10) / 10} hours),
          {ALL_QUESTIONS.length} questions with explanations, weak-area drilling and a timed exam simulator.
          Everything is built against the current skills measured ({EXAM.skillsMeasuredDate}).
        </p>
      {:else}
        <h1>What to do next</h1>
        <p class="lead muted">
          {#if daysLeft !== null && daysLeft >= 0}
            <strong
              >{daysLeft === 0 ? 'Exam is today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} to go`}</strong
            > &middot;
          {/if}
          {overall.modulesComplete}/{overall.moduleCount} lessons &middot;
          {overall.distinctAnswered}/{overall.bankSize} questions tried
          {#if accuracyPct !== null}&middot; {accuracyPct}% accuracy{/if}
        </p>
      {/if}

      <div class="budget" role="group" aria-label="How much time do you have?">
        <span class="tiny subtle budget-label">I have</span>
        {#each TIME_BUDGETS as t (t.minutes)}
          <button
            type="button"
            class="budget-btn"
            class:active={budget === t.minutes}
            aria-pressed={budget === t.minutes}
            onclick={() => setBudget(t.minutes)}
          >
            {t.label}
          </button>
        {/each}
      </div>

      {#if primary}
        <a class="next-primary" href={primary.href}>
          <span class="next-icon" aria-hidden="true">{kindIcon[primary.kind] ?? '▶'}</span>
          <span class="next-body">
            <span class="next-title">{primary.title}</span>
            <span class="next-why">{primary.why}</span>
          </span>
          <span class="next-meta">
            <span class="chip chip-accent">{primary.minutes} min</span>
            <span class="next-cta">{primary.cta} →</span>
          </span>
        </a>
      {/if}
    </div>
  </section>

  <!-- ---------------- Other options ---------------- -->
  {#if rest.length}
    <section class="section">
      <h2 class="section-title">Or…</h2>
      <div class="grid rec-grid">
        {#each rest as r (r.href + r.title)}
          <a class="card card-tight rec" href={r.href}>
            <span class="rec-icon" aria-hidden="true">{kindIcon[r.kind] ?? '▶'}</span>
            <span class="rec-body">
              <strong class="rec-title">{r.title}</strong>
              <span class="tiny muted">{r.why}</span>
            </span>
            <span class="chip">{r.minutes}m</span>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- ---------------- Stats ---------------- -->
  <section class="section">
    <div class="grid stat-grid">
      <div class="card card-tight stat">
        <span class="stat-value">{overall.modulesComplete}<span class="stat-of">/{overall.moduleCount}</span></span>
        <span class="tiny muted">Lessons complete</span>
      </div>
      <div class="card card-tight stat">
        <span class="stat-value">{overall.distinctAnswered}<span class="stat-of">/{overall.bankSize}</span></span>
        <span class="tiny muted">Questions tried</span>
      </div>
      <div class="card card-tight stat">
        <span class="stat-value">{accuracyPct === null ? '-' : `${accuracyPct}%`}</span>
        <span class="tiny muted">Accuracy</span>
      </div>
      <div class="card card-tight stat">
        <span class="stat-value">{overall.mistakeIds.length}</span>
        <span class="tiny muted">To fix</span>
      </div>
      <div class="card card-tight stat">
        <span class="stat-value">{overall.streak}<span class="stat-of">d</span></span>
        <span class="tiny muted">Streak</span>
      </div>
      <div class="card card-tight stat">
        <span class="stat-value">{overall.bestExamScore === null ? '-' : `${overall.bestExamScore}%`}</span>
        <span class="tiny muted">Best exam</span>
      </div>
    </div>
  </section>

  <!-- ---------------- Topic readiness ---------------- -->
  <section class="section">
    <div class="spread">
      <h2 class="section-title">Readiness by exam topic</h2>
      <a class="tiny" href={link('/progress/')}>Full breakdown →</a>
    </div>
    <div class="card">
      <TopicBars stats={readiness.byTopic} {base} />
    </div>
  </section>

  <!-- ---------------- Official Resources & Links ---------------- -->
  <section class="section">
    <div class="card resources-spotlight">
      <div class="res-spotlight-content">
        <div class="res-spotlight-header">
          <span class="chip chip-accent">Official Microsoft Links</span>
          <span class="tiny subtle">24 verified resources</span>
        </div>
        <h3 class="res-spotlight-title">Study Guides, Portals &amp; Official Practice Tests</h3>
        <p class="tiny muted res-spotlight-desc">
          Access verified Microsoft Learn guides, Azure AI Foundry portals, official free practice tests, and GitHub code labs.
        </p>
      </div>
      <a class="btn btn-secondary res-spotlight-btn" href={link('/resources/')}>
        View all resources →
      </a>
    </div>
  </section>

  <!-- ---------------- Exam date ---------------- -->
  <section class="section">
    <div class="card exam-date">
      <div>
        <strong>When is your exam?</strong>
        <p class="tiny muted">
          Setting a date switches on the countdown and unlocks cram mode on the final day.
        </p>
      </div>
      <label class="row">
        <span class="visually-hidden">Exam date</span>
        <input
          type="date"
          value={examDateInput}
          onchange={(e) => saveExamDate(e.currentTarget.value)}
        />
      </label>
    </div>
  </section>
{/if}

<style>
  .skeleton {
    height: 260px;
    background: linear-gradient(90deg, var(--bg-elevated), var(--bg-hover), var(--bg-elevated));
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer {
    to {
      background-position: -200% 0;
    }
  }

  .hero {
    display: flex;
    align-items: center;
    gap: 1.8rem;
    padding: 1.5rem;
  }

  .hero-ring {
    flex-shrink: 0;
  }

  .hero-main {
    flex: 1;
    min-width: 0;
  }

  .hero h1 {
    margin-bottom: 0.25rem;
  }

  .lead {
    font-size: 0.95rem;
    margin-bottom: 1rem;
    max-width: 62ch;
  }

  .budget {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-wrap: wrap;
    margin-bottom: 0.9rem;
  }
  .budget-label {
    margin-right: 0.15rem;
  }

  .budget-btn {
    font: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.28rem 0.62rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    color: var(--fg-muted);
    cursor: pointer;
    transition:
      background 0.13s,
      color 0.13s,
      border-color 0.13s;
  }
  .budget-btn:hover {
    background: var(--bg-hover);
    color: var(--fg);
  }
  .budget-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-fg);
  }

  .next-primary {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    padding: 0.95rem 1.05rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--accent);
    background: var(--accent-soft);
    text-decoration: none;
    color: var(--fg);
    transition:
      transform 0.14s,
      box-shadow 0.14s;
  }
  .next-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
    color: var(--fg);
  }

  .next-icon {
    font-size: 1.5rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .next-body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
    flex: 1;
  }
  .next-title {
    font-weight: 660;
    font-size: 1.02rem;
    line-height: 1.3;
  }
  .next-why {
    font-size: 0.84rem;
    color: var(--fg-muted);
    line-height: 1.4;
  }

  .next-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
    flex-shrink: 0;
  }
  .next-cta {
    font-size: 0.85rem;
    font-weight: 650;
    color: var(--accent);
    white-space: nowrap;
  }

  .section {
    margin-top: 1.6rem;
  }
  .section-title {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-subtle);
    font-weight: 700;
    margin-bottom: 0.6rem;
  }

  .rec-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .rec {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }
  .rec-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
  }
  .rec-body {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
    flex: 1;
  }
  .rec-title {
    font-size: 0.91rem;
    font-weight: 620;
    line-height: 1.3;
  }

  .stat-grid {
    grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
    gap: 0.6rem;
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
    text-align: center;
    padding: 0.7rem 0.5rem;
  }
  .stat-value {
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    line-height: 1.15;
  }
  .stat-of {
    font-size: 0.7em;
    color: var(--fg-subtle);
    font-weight: 600;
  }

  .exam-date {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .exam-date p {
    margin: 0.15rem 0 0;
    max-width: 46ch;
  }

  input[type='date'] {
    font: inherit;
    font-size: 0.9rem;
    padding: 0.45rem 0.6rem;
    border-radius: var(--radius);
    border: 1px solid var(--border-strong);
    background: var(--bg-elevated);
    color: var(--fg);
  }

  @media (max-width: 720px) {
    .hero {
      flex-direction: column;
      align-items: stretch;
      gap: 1.1rem;
    }
    .hero-ring {
      align-self: center;
    }
    .next-primary {
      flex-wrap: wrap;
    }
    .next-meta {
      flex-direction: row;
      align-items: center;
      width: 100%;
      justify-content: space-between;
    }
  }

  .resources-spotlight {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    padding: 1.15rem 1.4rem;
    background: linear-gradient(135deg, color-mix(in srgb, var(--accent-soft) 40%, var(--bg-elevated)) 0%, var(--bg-elevated) 100%);
    border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border));
  }
  .res-spotlight-content {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }
  .res-spotlight-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .res-spotlight-title {
    margin: 0;
    font-size: 1.05rem;
  }
  .res-spotlight-desc {
    margin: 0;
    max-width: 65ch;
  }
  .res-spotlight-btn {
    flex-shrink: 0;
    white-space: nowrap;
  }
  @media (max-width: 640px) {
    .resources-spotlight {
      flex-direction: column;
      align-items: stretch;
      gap: 0.9rem;
      padding: 1.1rem;
    }
    .res-spotlight-btn {
      text-align: center;
      justify-content: center;
    }
  }
</style>
