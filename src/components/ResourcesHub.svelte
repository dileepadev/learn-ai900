<script lang="ts">
  /**
   * Official Microsoft Resources & Study Links.
   * Interactive, searchable, category-filtered directory of all official Microsoft
   * links, documentation, practice assessments, labs, and tools for Exam AI-901.
   */
  import {
    OFFICIAL_RESOURCES,
    RESOURCE_CATEGORIES,
    type OfficialResource,
    type ResourceCategory,
  } from '../data/resources';
  import { topicLabel } from '../data/exam';
  import type { TopicId } from '../data/types';

  interface Props {
    base: string;
  }
  let { base }: Props = $props();

  const link = (p: string) => `${base.replace(/\/$/, '')}${p}`;

  let activeCategory = $state<string>('all');
  let search = $state<string>('');

  const filtered = $derived.by(() => {
    const q = search.trim().toLowerCase();
    return OFFICIAL_RESOURCES.filter((item) => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      const haystack = [
        item.title,
        item.description,
        item.badge,
        ...(item.tags || []),
        item.relatedTopicId ? topicLabel(item.relatedTopicId as TopicId) : '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  });

  const featured = $derived(OFFICIAL_RESOURCES.filter((r) => r.featured));

  function countForCategory(catId: string): number {
    if (catId === 'all') return OFFICIAL_RESOURCES.length;
    return OFFICIAL_RESOURCES.filter((r) => r.category === catId).length;
  }
</script>

<div class="resources-page">
  <!-- Hero Section -->
  <header class="hero card">
    <div class="hero-text">
      <span class="chip chip-accent">Microsoft Learn Verified</span>
      <h1>Official Resources &amp; Links</h1>
      <p class="lead muted">
        Every official Microsoft study guide, practice test, Azure AI Foundry portal, SDK reference,
        and Responsible AI framework for <strong>Exam AI-901: Microsoft Azure AI Fundamentals</strong>.
      </p>
    </div>

    <!-- Search Box -->
    <div class="search-box">
      <label for="resource-search" class="visually-hidden">Search official resources</label>
      <div class="search-input-wrap">
        <svg
          class="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          id="resource-search"
          type="search"
          placeholder="Search by topic, service, or keyword (e.g., Speech, Sandbox, Foundry, Prompt)..."
          bind:value={search}
          class="search-input"
        />
        {#if search}
          <button
            type="button"
            class="clear-btn"
            onclick={() => (search = '')}
            aria-label="Clear search"
          >
            ✕
          </button>
        {/if}
      </div>
    </div>
  </header>

  <!-- Pinned Quick Jumps (when not searching) -->
  {#if !search && activeCategory === 'all'}
    <section class="pinned-section">
      <h2 class="section-title">Must-Visit Essentials</h2>
      <div class="pinned-grid">
        {#each featured.slice(0, 4) as item (item.id)}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            class="pinned-card card"
          >
            <div class="pinned-head">
              <span class="chip chip-info">{item.badge}</span>
              <span class="ext-icon" aria-hidden="true">↗</span>
            </div>
            <strong class="pinned-title">{item.title}</strong>
            <p class="tiny muted">{item.description}</p>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Category Filter Bar -->
  <nav class="cat-bar" aria-label="Resource categories">
    <button
      type="button"
      class="cat-btn"
      class:active={activeCategory === 'all'}
      onclick={() => (activeCategory = 'all')}
    >
      <span>All</span>
      <span class="count">{countForCategory('all')}</span>
    </button>
    {#each RESOURCE_CATEGORIES as cat (cat.id)}
      <button
        type="button"
        class="cat-btn"
        class:active={activeCategory === cat.id}
        onclick={() => (activeCategory = cat.id)}
      >
        <span class="cat-icon" aria-hidden="true">{cat.icon}</span>
        <span>{cat.title}</span>
        <span class="count">{countForCategory(cat.id)}</span>
      </button>
    {/each}
  </nav>

  <!-- Results Count -->
  <div class="results-meta">
    <span class="small muted">
      Showing <strong>{filtered.length}</strong> official {filtered.length === 1 ? 'resource' : 'resources'}
      {#if search}for &ldquo;{search}&rdquo;{/if}
    </span>
    {#if search || activeCategory !== 'all'}
      <button
        type="button"
        class="btn btn-sm btn-ghost"
        onclick={() => {
          search = '';
          activeCategory = 'all';
        }}
      >
        Reset filters
      </button>
    {/if}
  </div>

  <!-- Resource Cards Grid -->
  {#if filtered.length === 0}
    <div class="empty-state card center">
      <p class="empty-icon" aria-hidden="true">🔍</p>
      <h3>No resources matched &ldquo;{search}&rdquo;</h3>
      <p class="muted small">
        Try searching for a service name like <em>Vision</em>, <em>Foundry</em>, <em>Content Understanding</em>,
        or reset the category filter.
      </p>
      <button
        type="button"
        class="btn btn-sm btn-primary"
        onclick={() => {
          search = '';
          activeCategory = 'all';
        }}
      >
        Show all official resources
      </button>
    </div>
  {:else}
    <div class="resources-grid">
      {#each filtered as item (item.id)}
        <article class="resource-card card" class:featured={item.featured}>
          <div class="card-head">
            <span class="chip" class:chip-accent={item.featured}>{item.badge}</span>
            {#if item.relatedTopicId}
              <span class="chip chip-info">{topicLabel(item.relatedTopicId as TopicId)}</span>
            {/if}
          </div>

          <h3 class="resource-title">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.title}
              <span class="ext-icon" aria-hidden="true">↗</span>
            </a>
          </h3>

          <p class="resource-desc muted">{item.description}</p>

          <div class="card-foot">
            <div class="tags">
              {#each item.tags.slice(0, 3) as tag}
                <span class="tag">#{tag}</span>
              {/each}
            </div>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              class="visit-link"
            >
              Open on Microsoft ↗
            </a>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</div>

<style>
  .resources-page {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .hero {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    padding: 1.5rem;
  }

  .hero-text h1 {
    margin: 0.4rem 0 0.4rem;
  }

  .hero-text .lead {
    margin: 0;
    max-width: 68ch;
    font-size: 0.98rem;
    line-height: 1.55;
  }

  /* Search bar */
  .search-box {
    margin-top: 0.3rem;
  }

  .search-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .search-icon {
    position: absolute;
    left: 0.9rem;
    color: var(--fg-subtle);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    font: inherit;
    font-size: 0.92rem;
    padding: 0.72rem 2.4rem 0.72rem 2.5rem;
    border-radius: var(--radius);
    border: 1px solid var(--border-strong);
    background: var(--bg-sunken);
    color: var(--fg);
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      background 0.15s ease;
  }

  .search-input:focus {
    background: var(--bg-elevated);
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
    outline: none;
  }

  .clear-btn {
    position: absolute;
    right: 0.8rem;
    background: none;
    border: none;
    color: var(--fg-subtle);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
  }
  .clear-btn:hover {
    color: var(--fg);
  }

  /* Pinned Section */
  .pinned-section {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .section-title {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-subtle);
    font-weight: 700;
    margin: 0;
  }

  .pinned-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 0.75rem;
  }

  .pinned-card {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.95rem;
    text-decoration: none;
    color: inherit;
    border-color: var(--border-strong);
    transition:
      transform 0.14s ease,
      box-shadow 0.14s ease,
      border-color 0.14s ease;
  }
  .pinned-card:hover {
    transform: translateY(-2px);
    border-color: var(--accent);
    box-shadow: var(--shadow);
  }

  .pinned-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pinned-title {
    font-size: 0.95rem;
    font-weight: 660;
    line-height: 1.3;
    color: var(--fg);
  }

  .ext-icon {
    font-size: 0.85rem;
    color: var(--accent);
    font-weight: 700;
  }

  /* Category pills */
  .cat-bar {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding: 0.1rem 0;
  }
  .cat-bar::-webkit-scrollbar {
    display: none;
  }

  .cat-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.38rem 0.75rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    color: var(--fg-muted);
    font: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background 0.14s ease,
      color 0.14s ease,
      border-color 0.14s ease,
      box-shadow 0.14s ease;
    box-shadow: var(--shadow-sm);
  }
  .cat-btn:hover {
    background: var(--bg-hover);
    color: var(--fg);
    border-color: var(--border-strong);
  }
  .cat-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-fg);
  }
  .cat-btn.active .count {
    background: color-mix(in srgb, var(--accent-fg) 20%, transparent);
    color: var(--accent-fg);
  }

  .cat-icon {
    font-size: 0.9rem;
    line-height: 1;
  }

  .count {
    font-size: 0.72rem;
    padding: 0.08rem 0.4rem;
    border-radius: 999px;
    background: var(--bg-sunken);
    color: var(--fg-subtle);
    font-variant-numeric: tabular-nums;
  }

  /* Meta bar */
  .results-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  /* Grid */
  .resources-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 0.85rem;
  }

  .resource-card {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding: 1.15rem;
    transition:
      transform 0.14s ease,
      box-shadow 0.14s ease,
      border-color 0.14s ease;
  }
  .resource-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
    border-color: var(--border-strong);
  }
  .resource-card.featured {
    border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .resource-title {
    margin: 0;
    font-size: 1.02rem;
    line-height: 1.35;
    font-weight: 660;
  }
  .resource-title a {
    color: inherit;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
  .resource-title a:hover {
    color: var(--accent);
  }

  .resource-desc {
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.55;
    flex: 1;
  }

  .card-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding-top: 0.6rem;
    border-top: 1px solid var(--border);
    margin-top: 0.3rem;
    flex-wrap: wrap;
  }

  .tags {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
  }
  .tag {
    font-size: 0.72rem;
    color: var(--fg-subtle);
    font-family: var(--mono);
  }

  .visit-link {
    font-size: 0.82rem;
    font-weight: 650;
    color: var(--accent);
    text-decoration: none;
    white-space: nowrap;
    margin-left: auto;
  }
  .visit-link:hover {
    text-decoration: underline;
  }

  /* Empty state */
  .empty-state {
    padding: 2.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
  }
  .empty-icon {
    font-size: 2rem;
    margin: 0;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .hero {
      padding: 1.1rem;
      gap: 0.85rem;
    }
    .hero-text .lead {
      font-size: 0.92rem;
    }
    .search-input {
      font-size: 0.88rem;
      padding-left: 2.3rem;
    }
    .pinned-grid {
      grid-template-columns: 1fr;
    }
    .resources-grid {
      grid-template-columns: 1fr;
    }
    .resource-card {
      padding: 1rem;
    }
  }
</style>
