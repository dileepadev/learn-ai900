<script lang="ts">
  /** Full progress breakdown, achievements, session history and data controls. */
  import { ALL_QUESTIONS } from '../data/questions';
  import { MODULES } from '../data/modules';
  import { EXAM, TOPICS, topicLabel } from '../data/exam';
  import { computeOverall, computeReadiness, daysUntilExam } from '../lib/scoring';
  import { MASTERED_BOX } from '../lib/srs';
  import {
    progress,
    emptyProgress,
    get,
    resetAll,
    exportJSON,
    importJSON,
  } from '../lib/store';
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
  $effect(() =>
    progress.subscribe((next) => {
      p = next;
      ready = true;
    }),
  );

  const readiness = $derived(computeReadiness(p, ALL_QUESTIONS, MODULES));
  const overall = $derived(computeOverall(p, ALL_QUESTIONS, MODULES));
  const daysLeft = $derived(daysUntilExam(p));

  const recentSessions = $derived([...p.sessions].reverse().slice(0, 12));

  /** Milestones, computed from progress rather than stored, so they cannot drift. */
  const ACHIEVEMENTS = $derived([
    { id: 'first-lesson', icon: '📘', label: 'First lesson complete', got: overall.modulesComplete >= 1 },
    { id: 'half-lessons', icon: '📗', label: 'Half the lessons done', got: overall.modulesComplete >= Math.ceil(MODULES.length / 2) },
    { id: 'all-lessons', icon: '🎓', label: 'Every lesson complete', got: overall.modulesComplete >= MODULES.length },
    { id: 'first-50', icon: '✏️', label: '50 questions answered', got: overall.questionsAnswered >= 50 },
    { id: 'first-150', icon: '📝', label: '150 questions answered', got: overall.questionsAnswered >= 150 },
    { id: 'whole-bank', icon: '📚', label: 'Every question tried once', got: overall.distinctAnswered >= overall.bankSize },
    { id: 'accuracy-70', icon: '🎯', label: '70% overall accuracy', got: (overall.accuracy ?? 0) >= 0.7 },
    { id: 'accuracy-85', icon: '🏹', label: '85% overall accuracy', got: (overall.accuracy ?? 0) >= 0.85 },
    { id: 'first-exam', icon: '⏱️', label: 'First practice exam', got: overall.examsTaken >= 1 },
    { id: 'passed-exam', icon: '🏆', label: 'Passed a practice exam', got: (overall.bestExamScore ?? 0) >= 70 },
    { id: 'no-mistakes', icon: '🧹', label: 'No outstanding mistakes', got: overall.distinctAnswered > 20 && overall.mistakeIds.length === 0 },
    { id: 'streak-3', icon: '🔥', label: '3-day streak', got: overall.bestStreak >= 3 },
  ]);

  const unlocked = $derived(ACHIEVEMENTS.filter((a) => a.got).length);

  /* ---- SRS distribution ---- */
  const boxes = $derived.by(() => {
    const counts = [0, 0, 0, 0, 0, 0];
    for (const q of ALL_QUESTIONS) {
      const s = p.questions[q.id];
      if (s?.seen) counts[Math.min(5, s.box)] = (counts[Math.min(5, s.box)] ?? 0) + 1;
    }
    return counts;
  });
  const maxBox = $derived(Math.max(...boxes, 1));

  /* ---- data controls ---- */
  let confirmingReset = $state(false);
  let importMessage = $state('');

  function download() {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai901-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleImport(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importJSON(String(reader.result));
      importMessage = ok ? 'Progress restored.' : 'That file could not be read as progress data.';
    };
    reader.readAsText(file);
    input.value = '';
  }

  function doReset() {
    resetAll();
    confirmingReset = false;
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const modeLabel: Record<string, string> = {
    'module-quiz': 'Lesson quiz',
    practice: 'Practice',
    'weak-areas': 'Weak areas',
    mistakes: 'Mistakes',
    'rapid-fire': 'Rapid fire',
    exam: 'Practice exam',
    'mini-exam': 'Mini exam',
  };
</script>

{#if ready}
  <div class="report">
    <header class="head">
      <ReadinessRing value={readiness.overall} label={readiness.label} size={140} />
      <div class="head-body">
        <h1>Your progress</h1>
        <p class="muted">
          Readiness blends what you have <strong>covered</strong> ({readiness.fromCoverage}% of
          lessons, weighted by exam topic) with what you have <strong>proven</strong> ({readiness.fromAccuracy}%
          weighted accuracy). Accuracy on a small sample is discounted, so a handful of lucky guesses
          will not read as mastery.
        </p>
        {#if daysLeft !== null}
          <p class="tiny subtle">
            {daysLeft <= 0 ? 'Exam is today.' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} until your exam.`}
          </p>
        {/if}
      </div>
    </header>

    <section class="grid stat-grid">
      <div class="card card-tight stat">
        <strong>{overall.questionsAnswered}</strong><span class="tiny muted">answers given</span>
      </div>
      <div class="card card-tight stat">
        <strong>{overall.distinctAnswered}/{overall.bankSize}</strong
        ><span class="tiny muted">bank covered</span>
      </div>
      <div class="card card-tight stat">
        <strong>{overall.accuracy === null ? '—' : `${Math.round(overall.accuracy * 100)}%`}</strong
        ><span class="tiny muted">accuracy</span>
      </div>
      <div class="card card-tight stat">
        <strong>{overall.mastered}</strong><span class="tiny muted">mastered</span>
      </div>
      <div class="card card-tight stat">
        <strong>{overall.studyDays}</strong><span class="tiny muted">study days</span>
      </div>
      <div class="card card-tight stat">
        <strong>{overall.bestStreak}</strong><span class="tiny muted">best streak</span>
      </div>
    </section>

    <section class="card">
      <h2 class="h-sm">By exam topic</h2>
      <TopicBars stats={readiness.byTopic} {base} />
    </section>

    <section class="card">
      <h2 class="h-sm">Retention — where questions sit in the review schedule</h2>
      <div class="boxes">
        {#each boxes as count, i (i)}
          <div class="box">
            <div class="box-bar">
              <span style:height={`${(count / maxBox) * 100}%`} class:mastered={i >= MASTERED_BOX}></span>
            </div>
            <span class="tiny">{count}</span>
            <span class="tiny subtle">
              {i === 0 ? 'just missed' : i === 5 ? 'mastered' : `box ${i}`}
            </span>
          </div>
        {/each}
      </div>
      <p class="tiny subtle">
        A correct answer moves a question up a box and pushes its next review further out; a miss
        drops it back so it returns within minutes. Intervals top out at four days, tuned for a short
        sprint rather than months of study.
      </p>
    </section>

    <section class="card">
      <h2 class="h-sm">Milestones — {unlocked}/{ACHIEVEMENTS.length}</h2>
      <ul class="achievements">
        {#each ACHIEVEMENTS as a (a.id)}
          <li class="ach" class:got={a.got}>
            <span class="ach-icon" aria-hidden="true">{a.icon}</span>
            <span class="tiny">{a.label}</span>
          </li>
        {/each}
      </ul>
    </section>

    {#if recentSessions.length}
      <section class="card">
        <h2 class="h-sm">Recent sessions</h2>
        <div class="table-scroll">
          <table class="data">
            <thead>
              <tr><th>When</th><th>Mode</th><th>Score</th><th>Result</th></tr>
            </thead>
            <tbody>
              {#each recentSessions as s (s.id)}
                {@const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0}
                <tr>
                  <td class="nowrap">{formatDate(s.finishedAt)}</td>
                  <td>{modeLabel[s.mode] ?? s.mode}</td>
                  <td class="nowrap">{s.correct}/{s.total}</td>
                  <td>
                    <span
                      class="chip"
                      class:chip-success={pct >= 70}
                      class:chip-danger={pct < 50}
                      class:chip-warn={pct >= 50 && pct < 70}>{pct}%</span
                    >
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {/if}

    <section class="card data">
      <h2 class="h-sm">Your data</h2>
      <p>
        Everything is stored in this browser's local storage. Nothing is sent anywhere, there is no
        account, and clearing your browser data will clear your progress — so export a backup if you
        are switching devices.
      </p>
      <div class="row">
        <button type="button" class="btn btn-sm" onclick={download}>Export backup</button>
        <label class="btn btn-sm import">
          Import backup
          <input type="file" accept="application/json" onchange={handleImport} />
        </label>
        {#if !confirmingReset}
          <button type="button" class="btn btn-sm btn-ghost danger" onclick={() => (confirmingReset = true)}>
            Reset everything
          </button>
        {:else}
          <span class="row confirm">
            <span class="tiny">Delete all progress?</span>
            <button type="button" class="btn btn-sm danger-solid" onclick={doReset}>Yes, reset</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick={() => (confirmingReset = false)}>
              Cancel
            </button>
          </span>
        {/if}
      </div>
      {#if importMessage}<p class="tiny import-msg">{importMessage}</p>{/if}
    </section>

    <section class="card sources">
      <h2 class="h-sm">Where this content comes from</h2>
      <p>
        Lessons and questions are written against the skills measured as of
        <strong>{EXAM.skillsMeasuredDate}</strong>, verified against Microsoft Learn documentation.
        The
        {TOPICS.length} topic weights are the midpoints of the published domain ranges, distributed by
        how many skills-measured bullets each sub-area lists.
      </p>
      <ul class="links">
        <li><a href={EXAM.studyGuideUrl} target="_blank" rel="noopener noreferrer">Official AI-901 study guide ↗</a></li>
        <li><a href={EXAM.examPageUrl} target="_blank" rel="noopener noreferrer">Exam AI-901 page ↗</a></li>
        <li><a href={EXAM.practiceAssessmentUrl} target="_blank" rel="noopener noreferrer">Microsoft's own practice assessment ↗</a></li>
        <li><a href={EXAM.portalUrl} target="_blank" rel="noopener noreferrer">Microsoft Foundry portal ↗</a></li>
      </ul>
      <p class="tiny subtle">
        This is an independent study aid, not a Microsoft product, and its questions are not real
        exam questions.
        <a href={link('/')}>Back to the dashboard</a>
      </p>
    </section>
  </div>
{/if}

<style>
  .report {
    max-width: 860px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 1.4rem;
    flex-wrap: wrap;
  }
  .head-body {
    flex: 1;
    min-width: 260px;
  }
  .head-body h1 {
    margin-bottom: 0.3rem;
  }
  .head-body p {
    max-width: 62ch;
    font-size: 0.93rem;
    margin-bottom: 0.4rem;
  }

  .stat-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.6rem;
  }
  .stat {
    text-align: center;
    display: flex;
    flex-direction: column;
    padding: 0.7rem 0.4rem;
  }
  .stat strong {
    font-size: 1.3rem;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
  }

  .h-sm {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-subtle);
    font-weight: 700;
    margin-bottom: 0.7rem;
  }

  .boxes {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.4rem;
    align-items: end;
    height: 130px;
    margin-bottom: 0.6rem;
  }
  .box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    height: 100%;
    justify-content: flex-end;
  }
  .box-bar {
    width: 100%;
    flex: 1;
    display: flex;
    align-items: flex-end;
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    min-height: 20px;
  }
  .box-bar > span {
    width: 100%;
    background: var(--warn);
    border-radius: inherit;
    transition: height 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    min-height: 2px;
  }
  .box-bar > span.mastered {
    background: var(--success);
  }

  .achievements {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.45rem;
  }
  .ach {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 0.6rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg-sunken);
    opacity: 0.45;
    filter: grayscale(1);
    transition:
      opacity 0.2s,
      filter 0.2s;
  }
  .ach.got {
    opacity: 1;
    filter: none;
    background: var(--accent-soft);
    border-color: var(--accent);
  }
  .ach-icon {
    font-size: 1.15rem;
    line-height: 1;
  }

  .data p,
  .sources p {
    font-size: 0.9rem;
    max-width: 66ch;
    line-height: 1.6;
  }

  .import {
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }
  .import input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .danger {
    color: var(--danger);
  }
  .danger-solid {
    background: var(--danger);
    border-color: var(--danger);
    color: #fff;
  }
  .confirm {
    gap: 0.4rem;
  }
  .import-msg {
    margin: 0.5rem 0 0;
    color: var(--fg-muted);
  }

  .links {
    margin: 0 0 0.6rem;
    padding-left: 1.1rem;
    font-size: 0.9rem;
  }
  .links li + li {
    margin-top: 0.2rem;
  }

  @media (max-width: 560px) {
    .boxes {
      height: 100px;
    }
  }
</style>
