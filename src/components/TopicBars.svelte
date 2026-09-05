<script lang="ts">
  /** Per-topic readiness, ordered by exam weight so the important rows lead. */
  import type { TopicStats } from '../lib/scoring';

  interface Props {
    stats: TopicStats[];
    base: string;
    /** Show the "drill this" link on each row. */
    actionable?: boolean;
  }
  let { stats, base, actionable = true }: Props = $props();

  const link = (p: string) => `${base.replace(/\/$/, '')}${p}`;
  const sorted = $derived([...stats].sort((a, b) => b.weight - a.weight));

  function tone(score: number): string {
    if (score >= 0.75) return 'good';
    if (score >= 0.45) return 'mid';
    if (score > 0) return 'low';
    return 'none';
  }
</script>

<ul class="bars">
  {#each sorted as t (t.topic)}
    {@const pct = Math.round(t.score * 100)}
    <li class="row-item {tone(t.score)}">
      <div class="row-head">
        <span class="name">{t.label}</span>
        <span class="chip weight" title="Approximate share of the exam">{t.weight}%</span>
        <span class="score">{pct}%</span>
      </div>
      <div class="bar" role="img" aria-label={`${t.label}: ${pct} percent ready`}>
        <span style:width={`${pct}%`}></span>
      </div>
      <div class="row-meta tiny subtle">
        <span>
          {t.modulesComplete}/{t.moduleCount} lessons
          &middot;
          {t.attempted}/{t.bankSize} questions
          {#if t.accuracy !== null}
            &middot; {Math.round(t.accuracy * 100)}% correct
          {/if}
        </span>
        {#if actionable}
          <a href={link(`/practice/weak/?topic=${t.topic}`)}>Drill →</a>
        {/if}
      </div>
    </li>
  {/each}
</ul>

<style>
  .bars {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .row-head {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.3rem;
  }

  .name {
    font-size: 0.92rem;
    font-weight: 600;
  }

  .weight {
    font-size: 0.68rem;
    padding: 0.1rem 0.38rem;
  }

  .score {
    margin-left: auto;
    font-size: 0.85rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--fg-muted);
  }

  .bar {
    height: 7px;
    border-radius: 999px;
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .bar > span {
    display: block;
    height: 100%;
    background: var(--fg-subtle);
    transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .good .bar > span {
    background: var(--success);
  }
  .mid .bar > span {
    background: var(--warn);
  }
  .low .bar > span {
    background: var(--danger);
  }
  .none .bar > span {
    background: var(--border-strong);
  }

  .row-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    margin-top: 0.25rem;
    flex-wrap: wrap;
  }
</style>
