<script lang="ts">
  /**
   * Light / dark / system.
   *
   * The cycle is ordered so the *first* click always changes what you see: from
   * "system" it jumps to whichever explicit theme differs from the system
   * preference. A toggle that appears to do nothing reads as broken.
   */
  type Theme = 'light' | 'dark' | 'system';

  function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'system';
    try {
      const stored = localStorage.getItem('ai901:theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    const rootTheme = document.documentElement.dataset.theme;
    if (rootTheme === 'light' || rootTheme === 'dark') return rootTheme;
    return 'system';
  }

  let theme = $state<Theme>(getInitialTheme());
  let systemPrefersDark = $state(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  );

  $effect(() => {
    try {
      const stored = localStorage.getItem('ai901:theme');
      if (stored === 'light' || stored === 'dark') theme = stored;
    } catch {
      /* private mode: stay on system */
    }

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    systemPrefersDark = query.matches;
    const onChange = (e: MediaQueryListEvent) => (systemPrefersDark = e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  });

  function apply(next: Theme) {
    theme = next;
    const root = document.documentElement;
    if (next === 'system') {
      delete root.dataset.theme;
      try {
        localStorage.removeItem('ai901:theme');
      } catch {
        /* ignore */
      }
    } else {
      root.dataset.theme = next;
      try {
        localStorage.setItem('ai901:theme', next);
      } catch {
        /* ignore */
      }
    }
  }

  /** system → the theme that differs from the system preference → the other → system */
  const order = $derived<Theme[]>(
    systemPrefersDark ? ['system', 'light', 'dark'] : ['system', 'dark', 'light'],
  );

  const labels: Record<Theme, string> = {
    light: 'Light theme',
    dark: 'Dark theme',
    system: 'Following system theme',
  };

  function cycle() {
    const i = order.indexOf(theme);
    apply(order[(i + 1) % order.length]!);
  }
</script>

<button
  class="theme-toggle"
  type="button"
  onclick={cycle}
  title={labels[theme]}
  aria-label={`${labels[theme]}. Click to change.`}
>
  {#if theme === 'light'}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2"/>
      <path d="M12 20v2"/>
      <path d="m4.93 4.93 1.41 1.41"/>
      <path d="m17.66 17.66 1.41 1.41"/>
      <path d="M2 12h2"/>
      <path d="M20 12h2"/>
      <path d="m6.34 17.66-1.41 1.41"/>
      <path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  {:else if theme === 'dark'}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect width="20" height="14" x="2" y="3" rx="2"/>
      <line x1="8" x2="16" y1="21" y2="21"/>
      <line x1="12" x2="12" y1="17" y2="21"/>
    </svg>
  {/if}
</button>

<style>
  .theme-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    font-size: 0.95rem;
    line-height: 1;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    color: var(--fg-muted);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition:
      background 0.14s ease,
      color 0.14s ease,
      border-color 0.14s ease,
      transform 0.1s ease;
  }
  .theme-toggle:hover {
    background: var(--bg-hover);
    border-color: var(--border-strong);
    color: var(--fg);
  }
  .theme-toggle:active {
    transform: scale(0.94);
  }
</style>
