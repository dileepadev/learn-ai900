<script lang="ts">
  /** Big animated readiness dial. Pure SVG - no chart library. */
  interface Props {
    value: number;
    label: string;
    size?: number;
    caption?: string;
  }
  let { value, label, size = 168, caption }: Props = $props();

  const stroke = $derived(Math.round(size * 0.075));
  const radius = $derived((size - stroke) / 2);
  const circumference = $derived(2 * Math.PI * radius);
  const clamped = $derived(Math.max(0, Math.min(100, value)));
  const offset = $derived(circumference * (1 - clamped / 100));

  const tone = $derived(clamped >= 75 ? 'good' : clamped >= 45 ? 'mid' : 'low');
</script>

<figure class="ring {tone}" style:--size={`${size}px`}>
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Exam readiness ${clamped} percent - ${label}`}>
    <circle
      class="track"
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke-width={stroke}
    />
    <circle
      class="value"
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke-width={stroke}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={offset}
      transform={`rotate(-90 ${size / 2} ${size / 2})`}
    />
    <!-- The 70% pass mark, so the dial reads against a real target. -->
    <circle
      class="mark"
      cx={size / 2 + radius * Math.cos((70 / 100) * 2 * Math.PI - Math.PI / 2)}
      cy={size / 2 + radius * Math.sin((70 / 100) * 2 * Math.PI - Math.PI / 2)}
      r={Math.max(2.5, stroke * 0.22)}
    />
  </svg>
  <figcaption>
    <span class="pct">{clamped}<span class="unit">%</span></span>
    <span class="label">{label}</span>
    {#if caption}<span class="tiny subtle cap">{caption}</span>{/if}
  </figcaption>
</figure>

<style>
  .ring {
    position: relative;
    margin: 0;
    width: var(--size);
    height: var(--size);
    flex-shrink: 0;
  }

  .track {
    stroke: var(--bg-sunken);
  }

  .value {
    stroke: var(--accent);
    transition: stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .low .value {
    stroke: var(--danger);
  }
  .mid .value {
    stroke: var(--warn);
  }
  .good .value {
    stroke: var(--success);
  }

  .mark {
    fill: var(--fg-subtle);
  }

  figcaption {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.05rem;
    text-align: center;
    padding: 0 12%;
  }

  .pct {
    font-size: calc(var(--size) * 0.235);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .unit {
    font-size: 0.5em;
    font-weight: 600;
    color: var(--fg-muted);
    margin-left: 0.05em;
  }

  .label {
    font-size: calc(var(--size) * 0.082);
    font-weight: 620;
    color: var(--fg-muted);
    line-height: 1.2;
  }

  .cap {
    margin-top: 0.15rem;
    line-height: 1.25;
  }
</style>
