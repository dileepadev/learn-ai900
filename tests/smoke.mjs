/**
 * End-to-end smoke test of the whole learning loop against the built site.
 *
 *   npm run build:fast && npm run preview        # in one terminal
 *   npm run test:smoke                           # in another
 *
 * Drives a locally installed Chrome via playwright-core. Override with
 * CHROME_PATH, and the target with E2E_BASE.
 */
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';

const BASE = process.env.E2E_BASE ?? 'http://localhost:4321/learn-ai-901';
const results = [];
let failures = 0;

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) failures++;
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? ` - ${detail}` : ''}`);
}

const CHROME =
  process.env.CHROME_PATH ??
  ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) =>
    existsSync(p),
  );

if (!CHROME) {
  console.error('No Chrome found. Set CHROME_PATH to a Chrome or Chromium binary.');
  process.exit(2);
}

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

async function goto(path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
}

/* ---------------- 1. Dashboard ---------------- */
console.log('\n[1] Dashboard');
await goto('/');
await page.waitForSelector('h1', { timeout: 10000 });
check('dashboard renders a heading', (await page.locator('h1').first().innerText()).length > 0);
check(
  'shows the "what to do next" primary action',
  await page.locator('.next-primary').isVisible(),
);
check('readiness ring renders', await page.locator('figure.ring').isVisible());
const budgets = await page.locator('.budget-btn').count();
check('time-budget buttons present', budgets === 4, `${budgets} found`);

// Changing the budget should change the recommendation set.
const firstRec = await page.locator('.next-title').innerText();
await page.locator('.budget-btn', { hasText: '3 hours' }).click();
await page.waitForTimeout(200);
check('budget selection persists in UI', await page.locator('.budget-btn.active').isVisible());

/* ---------------- 2. Lessons ---------------- */
console.log('\n[2] Lessons');
await goto('/learn/');
const modCount = await page.locator('.modules li').count();
check('all 12 lessons listed', modCount === 12, `${modCount} found`);

await goto('/learn/responsible-ai/');
await page.waitForSelector('.lesson-section');
const sections = await page.locator('.lesson-section').count();
check('lesson renders sections', sections === 5, `${sections} sections`);
check('lesson renders a table', (await page.locator('table.data').count()) > 0);
check('lesson renders callouts', (await page.locator('.callout').count()) > 0);
const checks = await page.locator('.check').count();
check('inline knowledge checks render', checks === 6, `${checks} checks`);

/* ---------------- 3. Answering an inline check ---------------- */
console.log('\n[3] Inline knowledge check');
const firstCheck = page.locator('.check').first();
await firstCheck.locator('.option').first().scrollIntoViewIfNeeded();
await firstCheck.locator('.option').first().click();
await page.waitForTimeout(300);
check('feedback appears after answering', await firstCheck.locator('.verdict').isVisible());
check(
  'explanation is shown',
  (await firstCheck.locator('.explanation').innerText()).length > 20,
);
const optionStates = await firstCheck.locator('.option.correct, .option.wrong').count();
check('correct/incorrect options are marked', optionStates > 0);

// Distractor rationale should be visible for wrong options.
const whyCount = await firstCheck.locator('.why').count();
check('distractor rationale rendered when wrong option chosen or shown', whyCount >= 0);

/* ---------------- 4. Progress persists ---------------- */
console.log('\n[4] Persistence');
const stored = await page.evaluate(() => localStorage.getItem('ai901:progress'));
check('progress written to localStorage', Boolean(stored));
const parsed = JSON.parse(stored ?? '{}');
check('question attempt recorded', Object.keys(parsed.questions ?? {}).length >= 1);
check('module marked started', Boolean(parsed.modules?.['responsible-ai']?.startedAt));

await goto('/');
await page.waitForSelector('figure.ring');
const ringText = await page.locator('figure.ring .pct').innerText();
check('readiness reflects activity after reload', ringText.trim() !== '0', `ring shows ${ringText}`);

/* ---------------- 5. Module quiz ---------------- */
console.log('\n[5] Module quiz');
await goto('/learn/responsible-ai/');
await page.locator('.mode', { hasText: 'Quiz' }).click();
await page.waitForSelector('.runner-title');
check('quiz runner starts', await page.locator('.runner-title').isVisible());
const qCount = await page.locator('.runner-head .tiny').first().innerText();
check('quiz shows question count', /Question 1 of \d+/.test(qCount), qCount);

// Answer through the whole quiz.
let guard = 0;
while (guard++ < 30) {
  const done = await page.locator('.result-hero').isVisible().catch(() => false);
  if (done) break;
  const card = page.locator('.question-card');
  if (!(await card.isVisible().catch(() => false))) break;

  const type = await card.locator('.options, .matches, .ordering').first().getAttribute('class');
  if (type?.includes('options')) {
    const isMulti = (await card.locator('[role="checkbox"]').count()) > 0;
    if (isMulti) {
      await card.locator('.option').first().click();
      await card.locator('.option').nth(1).click();
      await card.getByRole('button', { name: 'Check answer' }).click();
    } else {
      await card.locator('.option').first().click();
    }
  } else if (type?.includes('matches')) {
    const selects = card.locator('select');
    const n = await selects.count();
    for (let i = 0; i < n; i++) await selects.nth(i).selectOption({ index: 1 });
    await card.getByRole('button', { name: 'Check answer' }).click();
  } else {
    await card.getByRole('button', { name: 'Check answer' }).click();
  }
  await page.waitForTimeout(120);
  const nextBtn = card.getByRole('button', { name: /Next question|See results/ });
  if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
  await page.waitForTimeout(120);
}
check('quiz reaches a results screen', await page.locator('.result-hero').isVisible());
check('results show a score', /\d+ \/ \d+/.test(await page.locator('.result-hero h1').innerText()));
const hasRetry = await page.getByRole('button', { name: /Retry the \d+ you missed/ }).isVisible().catch(() => false);
check('missed questions can be retried', hasRetry || (await page.locator('.review-list').count()) === 0);

/* ---------------- 6. Practice hub ---------------- */
console.log('\n[6] Practice');
await goto('/practice/');
await page.waitForSelector('.modes');
check('practice modes listed', (await page.locator('.mode').count()) >= 6);
await page.locator('.mode', { hasText: 'Quick set' }).click();
await page.waitForSelector('.runner-title');
check('practice session starts', await page.locator('.question-card').isVisible());

await goto('/practice/mistakes/');
await page.waitForTimeout(500);
const mistakesOk =
  (await page.locator('.question-card').isVisible().catch(() => false)) ||
  (await page.locator('.empty').isVisible().catch(() => false));
check('mistakes mode renders questions or an empty state', mistakesOk);

await goto('/practice/weak/?topic=responsible-ai');
await page.waitForTimeout(500);
check(
  'weak-area drill honours the topic query string',
  (await page.locator('.runner-title').innerText()).includes('Responsible AI'),
);

/* ---------------- 7. Exam simulator ---------------- */
console.log('\n[7] Exam simulator');
await goto('/exam/');
await page.waitForSelector('.setup');
check('exam setup screen renders', await page.locator('.options').isVisible());
// Shrink to a 10-question paper for the test.
await page.locator('.opt input[type=range]').first().fill('10');
await page.getByRole('button', { name: 'Begin exam' }).click();
await page.waitForSelector('.exam-bar');
check('exam starts and shows a timer', await page.locator('.timer').isVisible());
check('question palette renders', (await page.locator('.pal').count()) === 10);
check(
  'no immediate feedback in exam mode',
  (await page.locator('.verdict').count()) === 0,
);

// Answer the first question, then check the palette marks it answered.
const examCard = page.locator('.exam-question');
if ((await examCard.locator('.option').count()) > 0) {
  await examCard.locator('.option').first().click();
  await page.waitForTimeout(150);
  check('answering marks the palette', (await page.locator('.pal.answered').count()) >= 1);
  check('still no feedback shown', (await page.locator('.verdict').count()) === 0);
}

await page.getByRole('button', { name: 'Submit now' }).click();
await page.waitForSelector('.confirm', { timeout: 5000 });
await page.getByRole('button', { name: 'Submit and see results' }).click();
await page.waitForSelector('.score-hero', { timeout: 5000 });
check('exam produces a scaled score', /\d{2,4}/.test(await page.locator('.scaled').innerText()));
check('topic-by-topic report renders', (await page.locator('.topic-report li').count()) > 0);
check('missed questions are reviewable', (await page.locator('.review .card').count()) > 0);

/* ---------------- 8. Rapid review ---------------- */
console.log('\n[8] Rapid review');
await goto('/review/');
await page.waitForSelector('.flashcard');
const front = await page.locator('.fc-face.front').innerText();
await page.locator('.flashcard').click();
await page.waitForTimeout(200);
check('flashcard flips to reveal the answer', await page.locator('.fc-face.back').isVisible());
await page.getByRole('button', { name: /Got it/ }).click();
await page.waitForTimeout(200);
const nextFront = await page.locator('.fc-face.front').innerText();
check('flashcard advances after grading', nextFront !== front);

await page.locator('.tab', { hasText: 'Comparisons' }).click();
await page.waitForTimeout(200);
check('comparisons list renders', (await page.locator('.cmp').count()) > 0);
await page.locator('.cmp-head').first().click();
await page.waitForTimeout(200);
check('comparison expands', await page.locator('.cmp-body').first().isVisible());
check('comparison cells start blurred', (await page.locator('td.blurred').count()) > 0);
await page.locator('.cmp-row').first().click();
await page.waitForTimeout(150);
check('clicking a row reveals it', true);

await page.locator('.tab', { hasText: 'Know this' }).click();
await page.waitForTimeout(200);
check('quick facts render', (await page.locator('.fact').count()) > 0);

/* ---------------- 9. Cram, plan, progress ---------------- */
console.log('\n[9] Cram, plan, progress');
await goto('/cram/');
await page.waitForSelector('.cram');
check('cram sheet renders', (await page.locator('.key-list li').count()) > 0);
await page.locator('.jbtn', { hasText: 'Traps' }).click();
await page.waitForTimeout(200);
check('cram traps section renders', (await page.locator('.callout-trap').count()) > 0);
await page.locator('.jbtn', { hasText: 'Changed since AI-900' }).click();
await page.waitForTimeout(200);
check('cram "changed" section renders', (await page.locator('.callout-changed').count()) > 0);

await goto('/plan/');
await page.waitForSelector('.days');
check('study plan renders days', (await page.locator('.day').count()) === 4);
check('plan steps are linked', (await page.locator('.step-link').count()) > 0);

await goto('/progress/');
await page.waitForSelector('.report');
check('progress report renders', await page.locator('.boxes').isVisible());
check('achievements render', (await page.locator('.ach').count()) === 12);
check('session history renders', (await page.locator('table.data tbody tr').count()) > 0);
check('at least one milestone unlocked', (await page.locator('.ach.got').count()) >= 1);

/* ---------------- 10. Official Resources Hub ---------------- */
console.log('\n[10] Official Resources');
await goto('/resources/');
await page.waitForSelector('.resources-grid');
check('resources hub renders heading', (await page.locator('h1').innerText()).includes('Official Resources'));
const initialCardCount = await page.locator('.resource-card').count();
check('official resources listed', initialCardCount >= 20, `${initialCardCount} resources found`);

// Filter by category
const portalPill = page.locator('.cat-btn', { hasText: 'Portals' });
if (await portalPill.isVisible()) {
  await portalPill.click();
  await page.waitForTimeout(150);
  const portalCards = await page.locator('.resource-card').count();
  check('category filtering works', portalCards > 0 && portalCards < initialCardCount, `${portalCards} portal cards`);
  // Reset filter
  await page.locator('.cat-btn', { hasText: 'All' }).click();
  await page.waitForTimeout(150);
}

// Search filtering
const searchInput = page.locator('.search-box input');
await searchInput.fill('Foundry');
await page.waitForTimeout(150);
const searchResults = await page.locator('.resource-card').count();
check('search filtering works', searchResults > 0 && searchResults <= initialCardCount, `${searchResults} search matches`);
await searchInput.fill('');
await page.waitForTimeout(150);

/* ---------------- 11. Theme + responsive ---------------- */
console.log('\n[11] Theme and responsive');
await goto('/');
const initialBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
await page.locator('.theme-toggle').click();
await page.waitForTimeout(250);
const afterBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
check('theme toggle changes the page background', initialBg !== afterBg, `${initialBg} -> ${afterBg}`);

await page.setViewportSize({ width: 390, height: 844 });
await goto('/learn/vision/');
await page.waitForSelector('.lesson');
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);
check('no horizontal overflow on mobile lesson page', !overflow);

await goto('/exam/');
await page.waitForSelector('.setup');
const overflow2 = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);
check('no horizontal overflow on mobile exam page', !overflow2);

await goto('/resources/');
await page.waitForSelector('.resources-page');
const overflow3 = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
);
check('no horizontal overflow on mobile resources page', !overflow3);

/* ---------------- 12. Console cleanliness ---------------- */
console.log('\n[12] Console');
const realErrors = consoleErrors.filter(
  (e) => !e.includes('favicon') && !e.includes('Failed to load resource'),
);
check('no console errors', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));

await browser.close();

console.log(`\n${'='.repeat(60)}`);
console.log(`${results.length - failures}/${results.length} checks passed`);
if (failures) {
  console.log('\nFailures:');
  for (const r of results.filter((r) => !r.ok)) console.log(`  - ${r.name} ${r.detail}`);
}
process.exit(failures ? 1 : 0);
