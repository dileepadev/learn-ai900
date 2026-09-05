<script lang="ts">
  /**
   * Practice hub. Either shows the mode picker, or - when a mode is fixed by
   * the route or a query string - jumps straight into the session.
   */
  import type { SessionMode, TopicId } from '../data/types';
  import { ALL_QUESTIONS } from '../data/questions';
  import { MODULES } from '../data/modules';
  import { TOPICS, topicLabel } from '../data/exam';
  import { progress, emptyProgress, get } from '../lib/store';
  import { computeOverall, computeReadiness } from '../lib/scoring';
  import { dueQuestions, unseenQuestions } from '../lib/queue';
  import type { Progress } from '../data/types';
  import QuizRunner from './QuizRunner.svelte';

  interface Props {
    base: string;
    /** Fixed mode for the dedicated routes. */
    fixedMode?: SessionMode;
  }
  let { base, fixedMode }: Props = $props();

  const link = (p: string) => `${base.replace(/\/$/, '')}${p}`;

  let p = $state<Progress>(get());
  let ready = $state(true);
  $effect(() =>
    progress.subscribe((next) => {
      p = next;
      ready = true;
    }),
  );

  /** A session started from this page. */
  let session = $state<{
    mode: SessionMode;
    size: number;
    topics?: TopicId[];
    title: string;
    empty: string;
  } | null>(null);

  let topicFromUrl = $state<TopicId | null>(null);

  $effect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('topic') as TopicId | null;
    if (t && TOPICS.some((topic) => topic.id === t)) topicFromUrl = t;

    if (fixedMode === 'mistakes') {
      session = {
        mode: 'mistakes',
        size: 40,
        title: 'Questions you got wrong',
        empty: 'Nothing outstanding - you have no questions currently sitting on a wrong answer.',
      };
    } else if (fixedMode === 'weak-areas') {
      const topics = topicFromUrl
        ? [topicFromUrl]
        : computeReadiness(p, ALL_QUESTIONS, MODULES)
            .weakest.slice(0, 2)
            .map((s) => s.topic);
      session = {
        mode: 'weak-areas',
        size: 12,
        topics,
        title: topics.length === 1 ? `Weak area: ${topicLabel(topics[0]!)}` : 'Your weakest areas',
        empty: 'No questions available for that topic.',
      };
    }
  });

  const overall = $derived(computeOverall(p, ALL_QUESTIONS, MODULES));
  const readiness = $derived(computeReadiness(p, ALL_QUESTIONS, MODULES));
  const due = $derived(dueQuestions(ALL_QUESTIONS, p).length);
  const unseen = $derived(unseenQuestions(ALL_QUESTIONS, p).length);
  const weakest = $derived(readiness.weakest.slice(0, 3));

  function startMixed(size: number) {
    session = {
      mode: 'practice',
      size,
      title: `Practice set (${size} questions)`,
      empty: 'No questions available.',
    };
  }

  function startRapid() {
    session = {
      mode: 'rapid-fire',
      size: 20,
      title: 'Rapid fire',
      empty: 'No questions available.',
    };
  }

  function startTopic(topic: TopicId) {
    session = {
      mode: 'weak-areas',
      size: 12,
      topics: [topic],
      title: `Practice: ${topicLabel(topic)}`,
      empty: 'No questions available for that topic.',
    };
  }
</script>

{#if !ready}
  <p class="muted">Loading…</p>
{:else if session}
  <QuizRunner
    mode={session.mode}
    size={session.size}
    topics={session.topics}
    title={session.title}
    emptyMessage={session.empty}
    {base}
    doneHref={link('/practice/')}
    doneLabel="Practice hub"
  />
  {#if fixedMode}
    <p class="center back-link"><a class="tiny" href={link('/practice/')}>← All practice modes</a></p>
  {/if}
{:else}
  <div class="hub">
    <header>
      <h1>Practice</h1>
      <p class="muted">
        Questions are scheduled with spaced repetition: anything you get wrong comes back soon,
        anything you keep getting right comes back later. Unseen questions are prioritised, because
        breadth matters more than depth when time is short.
      </p>
    </header>

    <div class="stats-row">
      <div class="stat card card-tight">
        <strong>{unseen}</strong><span class="tiny muted">never tried</span>
      </div>
      <div class="stat card card-tight">
        <strong>{due}</strong><span class="tiny muted">due for review</span>
      </div>
      <div class="stat card card-tight">
        <strong>{overall.mistakeIds.length}</strong><span class="tiny muted">on a wrong answer</span>
      </div>
      <div class="stat card card-tight">
        <strong>{overall.mastered}</strong><span class="tiny muted">mastered</span>
      </div>
    </div>

    <section>
      <h2 class="h-sm">Choose a mode</h2>
      <div class="modes">
        <button type="button" class="card mode" onclick={() => startMixed(10)}>
          <span class="mode-icon" aria-hidden="true">✏️</span>
          <span class="mode-body">
            <strong>Quick set - 10 questions</strong>
            <span class="tiny muted">
              Mixed topics, weighted towards what you have not seen and what is due. About 6 minutes.
            </span>
          </span>
        </button>

        <button type="button" class="card mode" onclick={() => startMixed(25)}>
          <span class="mode-icon" aria-hidden="true">📗</span>
          <span class="mode-body">
            <strong>Long set - 25 questions</strong>
            <span class="tiny muted">A proper session with immediate feedback. About 15 minutes.</span>
          </span>
        </button>

        <button type="button" class="card mode" onclick={startRapid}>
          <span class="mode-icon" aria-hidden="true">⚡</span>
          <span class="mode-body">
            <strong>Rapid fire - 20 questions</strong>
            <span class="tiny muted">
              Short, mostly easier recall questions. Good for a spare ten minutes.
            </span>
          </span>
        </button>

        <a class="card mode" href={link('/practice/mistakes/')} class:disabled={!overall.mistakeIds.length}>
          <span class="mode-icon" aria-hidden="true">🔁</span>
          <span class="mode-body">
            <strong>Questions I got wrong</strong>
            <span class="tiny muted">
              {overall.mistakeIds.length
                ? `${overall.mistakeIds.length} waiting. The cheapest marks available.`
                : 'Nothing outstanding right now.'}
            </span>
          </span>
        </a>

        <a class="card mode" href={link('/practice/weak/')}>
          <span class="mode-icon" aria-hidden="true">🎯</span>
          <span class="mode-body">
            <strong>Practice my weak areas</strong>
            <span class="tiny muted">
              {weakest.length && weakest[0]!.attempted
                ? `Currently: ${weakest.slice(0, 2).map((w) => w.label).join(', ')}`
                : 'Answer a few questions first so weak areas can be identified.'}
            </span>
          </span>
        </a>

        <a class="card mode" href={link('/exam/')}>
          <span class="mode-icon" aria-hidden="true">⏱️</span>
          <span class="mode-body">
            <strong>Timed practice exam</strong>
            <span class="tiny muted">
              No feedback until the end, with a topic-by-topic report. The honest test.
            </span>
          </span>
        </a>
      </div>
    </section>

    <section>
      <h2 class="h-sm">Or pick a topic</h2>
      <div class="topics">
        {#each readiness.byTopic.slice().sort((a, b) => b.weight - a.weight) as t (t.topic)}
          <button type="button" class="topic-btn" onclick={() => startTopic(t.topic)}>
            <span class="topic-name">{t.label}</span>
            <span class="tiny subtle">
              {t.weight}% of exam · {t.attempted}/{t.bankSize} tried
              {#if t.accuracy !== null}· {Math.round(t.accuracy * 100)}%{/if}
            </span>
            <span class="bar topic-bar" class:bar-success={t.score >= 0.75} class:bar-danger={t.score < 0.45 && t.attempted > 0}>
              <span style:width={`${Math.round(t.score * 100)}%`}></span>
            </span>
          </button>
        {/each}
      </div>
    </section>
  </div>
{/if}

<style>
  .hub {
    max-width: 860px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  header p {
    max-width: 64ch;
    font-size: 0.95rem;
    margin: 0;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.6rem;
  }
  .stat {
    text-align: center;
    display: flex;
    flex-direction: column;
    padding: 0.7rem 0.5rem;
  }
  .stat strong {
    font-size: 1.4rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }

  .h-sm {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-subtle);
    font-weight: 700;
    margin-bottom: 0.7rem;
  }

  .modes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.6rem;
  }

  .mode {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    text-align: left;
    text-decoration: none;
    color: inherit;
    padding: 0.95rem 1rem;
  }
  .mode.disabled {
    opacity: 0.55;
    pointer-events: none;
  }
  .mode-icon {
    font-size: 1.3rem;
    line-height: 1.2;
    flex-shrink: 0;
  }
  .mode-body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }
  .mode-body strong {
    font-size: 0.96rem;
  }
  .mode-body .tiny {
    line-height: 1.5;
  }

  .topics {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.5rem;
  }

  .topic-btn {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: left;
    font: inherit;
    padding: 0.7rem 0.85rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    color: var(--fg);
    cursor: pointer;
    transition:
      border-color 0.13s,
      transform 0.13s;
  }
  .topic-btn:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
  }
  .topic-name {
    font-size: 0.92rem;
    font-weight: 620;
  }
  .topic-bar {
    height: 5px;
    margin-top: 0.15rem;
  }

  .back-link {
    margin-top: 1.5rem;
  }
</style>
