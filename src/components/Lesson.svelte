<script lang="ts">
  /**
   * Renders one module: block content, inline knowledge checks, section
   * progress tracking, and an end-of-module quiz.
   */
  import { untrack } from 'svelte';
  import type { Module } from '../data/types';
  import { QUESTION_BY_ID } from '../data/questions';
  import { MODULES } from '../data/modules';
  import { topicLabel } from '../data/exam';
  import { inlineMarkdown } from '../lib/markdown';
  import {
    markModuleComplete,
    markModuleStarted,
    markSectionSeen,
    progress,
    recordAnswer,
    setLastVisited,
    get,
  } from '../lib/store';
  import QuestionCard from './QuestionCard.svelte';
  import QuizRunner from './QuizRunner.svelte';

  import TokenizerDemo from './demos/TokenizerDemo.svelte';
  import SamplingDemo from './demos/SamplingDemo.svelte';
  import VisionTasksDemo from './demos/VisionTasksDemo.svelte';
  import RagPipelineDemo from './demos/RagPipelineDemo.svelte';
  import PromptRolesDemo from './demos/PromptRolesDemo.svelte';
  import DeploymentPicker from './demos/DeploymentPicker.svelte';
  import WorkloadRouter from './demos/WorkloadRouter.svelte';
  import AnalyzerBuilder from './demos/AnalyzerBuilder.svelte';

  interface Props {
    module: Module;
    base: string;
  }
  let { module: mod, base }: Props = $props();

  const link = (p: string) => `${base.replace(/\/$/, '')}${p}`;

  const DEMOS = {
    tokenizer: TokenizerDemo,
    sampling: SamplingDemo,
    'vision-tasks': VisionTasksDemo,
    'rag-pipeline': RagPipelineDemo,
    'prompt-roles': PromptRolesDemo,
    'deployment-picker': DeploymentPicker,
    'workload-router': WorkloadRouter,
    'analyzer-builder': AnalyzerBuilder,
  } as const;

  const initP = get();
  let completed = $state(untrack(() => Boolean(initP.modules[mod.id]?.completedAt)));
  let seen = $state<string[]>(untrack(() => initP.modules[mod.id]?.sectionsSeen ?? []));
  let mode = $state<'read' | 'quiz'>('read');

  $effect(() =>
    progress.subscribe((p) => {
      completed = Boolean(p.modules[mod.id]?.completedAt);
      seen = p.modules[mod.id]?.sectionsSeen ?? [];
    }),
  );

  $effect(() => {
    markModuleStarted(mod.id);
    setLastVisited(link(`/learn/${mod.id}/`), mod.title);
  });

  /** Mark a section seen once it has been on screen. */
  let sectionEls = $state<Record<string, HTMLElement | undefined>>({});

  $effect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.sectionId;
            if (id) markSectionSeen(mod.id, id);
          }
        }
      },
      { threshold: 0.35 },
    );
    for (const el of Object.values(sectionEls)) if (el) observer.observe(el);
    return () => observer.disconnect();
  });

  const readPct = $derived(
    mod.sections.length ? Math.round((seen.length / mod.sections.length) * 100) : 0,
  );

  const ordered = $derived([...MODULES].sort((a, b) => a.order - b.order));
  const idx = $derived(ordered.findIndex((m) => m.id === mod.id));
  const prev = $derived(idx > 0 ? ordered[idx - 1] : undefined);
  const next = $derived(idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : undefined);

  function handleCheck(qid: string, correct: boolean) {
    recordAnswer(qid, correct);
  }

  function finishModule() {
    markModuleComplete(mod.id, true);
  }
</script>

<article class="lesson">
  <header class="lesson-head">
    <a class="tiny back" href={link('/learn/')}>← All lessons</a>
    <div class="title-row">
      <span class="icon" aria-hidden="true">{mod.icon}</span>
      <div>
        <h1>{mod.title}</h1>
        <p class="muted summary">{mod.summary}</p>
      </div>
    </div>
    <div class="meta">
      <span class="chip chip-accent">{topicLabel(mod.topic)}</span>
      <span class="chip">{mod.minutes} min</span>
      {#if mod.priority === 'high'}<span class="chip chip-warn">high priority</span>{/if}
      {#if completed}<span class="chip chip-success">✓ complete</span>{/if}
    </div>

    <div class="outcomes card">
      <strong class="tiny label">After this lesson you can</strong>
      <ul>
        {#each mod.outcomes as outcome (outcome)}
          <li>{outcome}</li>
        {/each}
      </ul>
    </div>

    <div class="mode-switch" role="tablist" aria-label="Lesson mode">
      <button
        type="button"
        role="tab"
        class="mode"
        class:active={mode === 'read'}
        aria-selected={mode === 'read'}
        onclick={() => (mode = 'read')}>Lesson</button
      >
      <button
        type="button"
        role="tab"
        class="mode"
        class:active={mode === 'quiz'}
        aria-selected={mode === 'quiz'}
        onclick={() => (mode = 'quiz')}>Quiz ({mod.quiz.length})</button
      >
    </div>
  </header>

  {#if mode === 'read'}
    <div class="sections">
      {#each mod.sections as section (section.id)}
        <section
          class="lesson-section"
          data-section-id={section.id}
          bind:this={sectionEls[section.id]}
          id={section.id}
        >
          <h2>{section.title}</h2>

          {#each section.blocks as block, i (i)}
            {#if block.t === 'p'}
              <p class="body">{@html inlineMarkdown(block.md)}</p>
            {:else if block.t === 'h'}
              <h3>{block.text}</h3>
            {:else if block.t === 'list'}
              {#if block.ordered}
                <ol class="body-list">
                  {#each block.items as item (item)}
                    <li>{@html inlineMarkdown(item)}</li>
                  {/each}
                </ol>
              {:else}
                <ul class="body-list">
                  {#each block.items as item (item)}
                    <li>{@html inlineMarkdown(item)}</li>
                  {/each}
                </ul>
              {/if}
            {:else if block.t === 'key'}
              <aside class="callout callout-key">
                <div class="callout-title"><span aria-hidden="true">🔑</span>{block.title}</div>
                <p>{@html inlineMarkdown(block.body)}</p>
              </aside>
            {:else if block.t === 'trap'}
              <aside class="callout callout-trap">
                <div class="callout-title"><span aria-hidden="true">⚠️</span>{block.title}</div>
                <p>{@html inlineMarkdown(block.body)}</p>
              </aside>
            {:else if block.t === 'changed'}
              <aside class="callout callout-changed">
                <div class="callout-title"><span aria-hidden="true">🔄</span>{block.title}</div>
                <p>{@html inlineMarkdown(block.body)}</p>
              </aside>
            {:else if block.t === 'table'}
              <figure class="table-figure">
                <div class="table-scroll">
                  <table class="data">
                    <thead>
                      <tr>
                        {#each block.headers as header (header)}
                          <th>{@html inlineMarkdown(header)}</th>
                        {/each}
                      </tr>
                    </thead>
                    <tbody>
                      {#each block.rows as row, r (r)}
                        <tr>
                          {#each row as cell, c (c)}
                            <td>{@html inlineMarkdown(cell)}</td>
                          {/each}
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
                {#if block.caption}
                  <figcaption class="tiny subtle">{@html inlineMarkdown(block.caption)}</figcaption>
                {/if}
              </figure>
            {:else if block.t === 'code'}
              <figure class="codeblock">
                {#if block.caption}<figcaption>{block.caption}</figcaption>{/if}
                <pre><code>{block.code}</code></pre>
              </figure>
            {:else if block.t === 'steps'}
              <div class="steps">
                {#if block.title}<strong class="tiny label">{block.title}</strong>{/if}
                <ol>
                  {#each block.steps as s, si (si)}
                    <li>
                      <strong>{s.label}</strong>
                      <span>{@html inlineMarkdown(s.detail)}</span>
                    </li>
                  {/each}
                </ol>
              </div>
            {:else if block.t === 'demo'}
              {@const DemoComponent = DEMOS[block.name]}
              <div class="demo-wrap">
                <div class="demo-head">
                  <span class="chip chip-accent">Try it</span>
                  {#if block.caption}<span class="tiny muted">{block.caption}</span>{/if}
                </div>
                {#if DemoComponent}
                  <DemoComponent />
                {/if}
              </div>
            {:else if block.t === 'check'}
              {@const q = QUESTION_BY_ID[block.qid]}
              {#if q}
                <div class="check">
                  <div class="check-head"><span aria-hidden="true">✎</span> Knowledge check</div>
                  <QuestionCard
                    question={q}
                    hideNext
                    onanswered={(correct) => handleCheck(q.id, correct)}
                  />
                </div>
              {/if}
            {/if}
          {/each}
        </section>
      {/each}
    </div>

    <footer class="lesson-foot card">
      <div class="progress-line">
        <div class="bar bar-success"><span style:width={`${readPct}%`}></span></div>
        <span class="tiny subtle">{seen.length} of {mod.sections.length} sections read</span>
      </div>
      <div class="row foot-actions">
        <button type="button" class="btn btn-primary" onclick={() => (mode = 'quiz')}>
          Take the {mod.quiz.length}-question quiz
        </button>
        {#if !completed}
          <button type="button" class="btn" onclick={finishModule}>Mark complete</button>
        {:else}
          <button type="button" class="btn btn-ghost" onclick={() => markModuleComplete(mod.id, false)}>
            Mark incomplete
          </button>
        {/if}
      </div>
      <nav class="lesson-nav">
        {#if prev}
          <a class="nav-card" href={link(`/learn/${prev.id}/`)}>
            <span class="tiny subtle">← Previous</span>
            <span>{prev.title}</span>
          </a>
        {:else}
          <span></span>
        {/if}
        {#if next}
          <a class="nav-card right" href={link(`/learn/${next.id}/`)}>
            <span class="tiny subtle">Next →</span>
            <span>{next.title}</span>
          </a>
        {/if}
      </nav>
    </footer>
  {:else}
    <div class="quiz-pane">
      <QuizRunner
        questions={mod.quiz.map((id) => QUESTION_BY_ID[id]).filter(Boolean) as never}
        mode="module-quiz"
        moduleId={mod.id}
        title={`${mod.title} — quiz`}
        {base}
        doneHref={next ? link(`/learn/${next.id}/`) : link('/learn/')}
        doneLabel={next ? `Next: ${next.title}` : 'All lessons'}
        onfinish={(correct, total) => {
          // Passing the module quiz marks the lesson complete.
          if (total > 0 && correct / total >= 0.7) markModuleComplete(mod.id, true);
        }}
      />
    </div>
  {/if}
</article>

<style>
  .lesson {
    max-width: 780px;
    margin: 0 auto;
  }

  .lesson-head {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    margin-bottom: 1.6rem;
  }

  .back {
    align-self: flex-start;
    text-decoration: none;
  }

  .title-row {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
  }
  .icon {
    font-size: 2rem;
    line-height: 1.1;
  }
  .title-row h1 {
    margin-bottom: 0.2rem;
  }
  .summary {
    margin: 0;
    font-size: 0.95rem;
    max-width: 60ch;
  }

  .meta {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  .outcomes {
    padding: 0.85rem 1rem;
  }
  .outcomes ul {
    margin: 0.35rem 0 0;
    padding-left: 1.15rem;
    font-size: 0.9rem;
  }
  .outcomes li + li {
    margin-top: 0.2rem;
  }

  .label {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-subtle);
    font-weight: 700;
  }

  .mode-switch {
    display: inline-flex;
    gap: 0.15rem;
    padding: 0.15rem;
    border-radius: 999px;
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    align-self: flex-start;
  }
  .mode {
    font: inherit;
    font-size: 0.84rem;
    font-weight: 620;
    padding: 0.3rem 0.85rem;
    border-radius: 999px;
    border: 0;
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
  }
  .mode.active {
    background: var(--bg-elevated);
    color: var(--fg);
    box-shadow: var(--shadow-sm);
  }

  .sections {
    display: flex;
    flex-direction: column;
    gap: 2.2rem;
  }

  .lesson-section {
    scroll-margin-top: 72px;
  }
  .lesson-section h2 {
    font-size: 1.28rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid var(--border);
    margin-bottom: 0.9rem;
  }
  .lesson-section h3 {
    margin-top: 1.3rem;
  }

  .lesson-section > * + * {
    margin-top: 0.95rem;
  }

  .body {
    font-size: 0.97rem;
    line-height: 1.68;
    margin: 0;
  }

  .body-list {
    margin: 0;
    padding-left: 1.2rem;
    font-size: 0.95rem;
    line-height: 1.62;
  }
  .body-list li + li {
    margin-top: 0.35rem;
  }

  .table-figure {
    margin: 0;
  }
  .table-figure figcaption {
    margin-top: 0.35rem;
  }

  .steps {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-elevated);
    padding: 0.9rem 1rem;
  }
  .steps ol {
    margin: 0.4rem 0 0;
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .steps li {
    font-size: 0.92rem;
    line-height: 1.55;
  }
  .steps li strong {
    display: block;
    margin-bottom: 0.1rem;
  }
  .steps li span {
    color: var(--fg-muted);
  }

  .demo-wrap {
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
    background: var(--bg-elevated);
    padding: 1rem;
  }
  .demo-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.7rem;
    flex-wrap: wrap;
  }

  .check {
    border: 1px solid var(--accent);
    border-radius: var(--radius-lg);
    background: var(--bg-elevated);
    padding: 1rem;
  }
  .check-head {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--accent);
    margin-bottom: 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .lesson-foot {
    margin-top: 2.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .progress-line {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .foot-actions {
    gap: 0.5rem;
  }

  .lesson-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    border-top: 1px solid var(--border);
    padding-top: 0.9rem;
  }
  .nav-card {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.55rem 0.7rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    text-decoration: none;
    color: var(--fg);
    font-size: 0.88rem;
    font-weight: 600;
    transition: border-color 0.13s;
  }
  .nav-card:hover {
    border-color: var(--accent);
    color: var(--fg);
  }
  .nav-card.right {
    text-align: right;
  }

  .quiz-pane {
    margin-top: 0.5rem;
  }

  @media (max-width: 560px) {
    .lesson-nav {
      grid-template-columns: 1fr;
    }
  }
</style>
