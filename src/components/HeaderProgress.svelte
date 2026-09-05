<script lang="ts">
  /** Compact readiness pill in the site header. */
  import { progress, get } from '../lib/store';
  import { computeReadiness } from '../lib/scoring';
  import { ALL_QUESTIONS } from '../data/questions';
  import { MODULES } from '../data/modules';

  interface Props {
    base: string;
    active?: boolean;
  }
  let { base, active = false }: Props = $props();

  let readiness = $state(computeReadiness(get(), ALL_QUESTIONS, MODULES).overall);
  let isCurrent = $state(false);

  function checkCurrent() {
    if (typeof window !== 'undefined') {
      isCurrent = active || window.location.pathname.replace(/\/$/, '').endsWith('/progress');
    }
  }

  $effect(() => {
    checkCurrent();
    document.addEventListener('astro:page-load', checkCurrent);
    return () => document.removeEventListener('astro:page-load', checkCurrent);
  });

  $effect(() =>
    progress.subscribe((p) => {
      readiness = computeReadiness(p, ALL_QUESTIONS, MODULES).overall;
    }),
  );

  const href = $derived(`${base.replace(/\/$/, '')}/progress/`);
  const tone = $derived(readiness >= 75 ? 'good' : readiness >= 45 ? 'mid' : 'low');
</script>

<a
  class="pill {tone}"
  class:current={isCurrent}
  {href}
  title="Your exam readiness — click for details"
  aria-current={isCurrent ? 'page' : undefined}
>
  <span class="track" aria-hidden="true"><span class="fill" style:width={`${readiness}%`}></span></span>
  <span class="value">{readiness}%</span>
  <span class="visually-hidden">exam readiness</span>
</a>

<style>
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.42rem;
    padding: 0.26rem 0.6rem 0.26rem 0.52rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    text-decoration: none;
    color: var(--fg);
    font-size: 0.78rem;
    font-weight: 650;
    transition:
      background 0.14s ease,
      border-color 0.14s ease,
      box-shadow 0.14s ease,
      transform 0.1s ease;
    box-shadow: var(--shadow-sm);
    white-space: nowrap;
  }
  .pill:hover {
    background: var(--bg-hover);
    border-color: var(--border-strong);
    color: var(--fg);
  }
  .pill:active {
    transform: scale(0.97);
  }
  .pill.current {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
  }

  .track {
    display: block;
    width: 36px;
    height: 5px;
    border-radius: 999px;
    background: var(--bg-sunken);
    border: 1px solid var(--border);
    overflow: hidden;
    flex-shrink: 0;
  }
  .fill {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: var(--accent);
    transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .low .fill {
    background: var(--danger);
  }
  .mid .fill {
    background: var(--warn);
  }
  .good .fill {
    background: var(--success);
  }

  .value {
    font-variant-numeric: tabular-nums;
    min-width: 2.3em;
    text-align: right;
  }

  @media (max-width: 560px) {
    .track {
      display: none;
    }
  }
</style>
