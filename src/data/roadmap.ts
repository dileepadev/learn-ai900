import type { TopicId } from './types';

/**
 * A three-day sprint plan. Each day is a sequence of steps the learner works
 * through; the plan page marks a step complete when its modules are done.
 *
 * Deliberately front-loaded with the heaviest-weighted topics, and every day
 * ends with retrieval practice rather than more reading.
 */

export interface PlanStep {
  kind: 'learn' | 'practice' | 'exam' | 'review' | 'cram';
  label: string;
  /** Module ids, when kind is 'learn'. */
  moduleIds?: string[];
  topics?: TopicId[];
  minutes: number;
  /** Why this step earns its place, in one line. */
  why: string;
}

export interface PlanDay {
  id: string;
  title: string;
  goal: string;
  steps: PlanStep[];
}

export const SPRINT_PLAN: PlanDay[] = [
  {
    id: 'day-1',
    title: 'Day 1 - Concepts and the platform',
    goal: 'Cover the whole of Domain 1 and understand what Microsoft Foundry actually is.',
    steps: [
      {
        kind: 'learn',
        label: 'AI workloads and how models work',
        moduleIds: ['foundations', 'ml-and-transformers'],
        minutes: 33,
        why: 'Scenario routing is the most common question shape on the paper.',
      },
      {
        kind: 'learn',
        label: 'Responsible AI',
        moduleIds: ['responsible-ai'],
        minutes: 20,
        why: 'About 18% of the exam and almost pure scenario-matching - the best marks per minute on the syllabus.',
      },
      {
        kind: 'learn',
        label: 'Models, deployment and parameters',
        moduleIds: ['genai-models'],
        minutes: 22,
        why: 'Dense with testable facts, and full of stale-material traps.',
      },
      {
        kind: 'learn',
        label: 'The Foundry platform',
        moduleIds: ['foundry-platform'],
        minutes: 15,
        why: 'Everything in Domain 2 assumes you know resource vs. project.',
      },
      {
        kind: 'practice',
        label: 'Practice set - Domain 1',
        topics: ['responsible-ai', 'model-components', 'ai-workloads'],
        minutes: 20,
        why: 'Retrieval beats re-reading. Find the gaps while there is time to fix them.',
      },
    ],
  },
  {
    id: 'day-2',
    title: 'Day 2 - Building with Foundry',
    goal: 'Cover Domain 2: prompts, agents, grounding, and the modality services.',
    steps: [
      {
        kind: 'learn',
        label: 'Prompts and a chat client',
        moduleIds: ['prompts-and-chat'],
        minutes: 20,
        why: 'Message roles and prompting techniques come up repeatedly.',
      },
      {
        kind: 'learn',
        label: 'Agents',
        moduleIds: ['agents'],
        minutes: 22,
        why: 'Prompt agents vs. hosted agents is new terminology and very likely to be tested.',
      },
      {
        kind: 'learn',
        label: 'RAG and Foundry IQ',
        moduleIds: ['rag-foundry-iq'],
        minutes: 20,
        why: 'Grounding, agentic retrieval, and permission-aware answers.',
      },
      {
        kind: 'learn',
        label: 'Text, speech and vision',
        moduleIds: ['text-analysis', 'speech', 'vision'],
        minutes: 52,
        why: 'Three implementation objectives worth about 23% combined.',
      },
      {
        kind: 'practice',
        label: 'Practice set - Domain 2',
        topics: ['foundry-genai-agents', 'foundry-text-speech', 'foundry-vision'],
        minutes: 20,
        why: 'Consolidate while the material is fresh.',
      },
    ],
  },
  {
    id: 'day-3',
    title: 'Day 3 - Extraction, exam simulation, weak areas',
    goal: 'Finish the syllabus, then find out honestly where you stand.',
    steps: [
      {
        kind: 'learn',
        label: 'Content Understanding',
        moduleIds: ['information-extraction'],
        minutes: 22,
        why: 'About 15% of the exam and entirely new since AI-900 - no prior knowledge to fall back on.',
      },
      {
        kind: 'exam',
        label: 'Full timed practice exam',
        minutes: 50,
        why: 'The only honest read on whether you would pass today.',
      },
      {
        kind: 'practice',
        label: 'Drill your weakest topics',
        minutes: 25,
        why: 'The exam report tells you exactly where the remaining time should go.',
      },
      {
        kind: 'review',
        label: 'Rapid review - flashcards and comparisons',
        minutes: 20,
        why: 'High-density facts and the distinctions that get confused.',
      },
    ],
  },
  {
    id: 'exam-day',
    title: 'Exam day',
    goal: 'Consolidate. Do not cram new material.',
    steps: [
      {
        kind: 'cram',
        label: 'The cram sheet',
        minutes: 25,
        why: 'Every "know this" fact, trap and comparison in one pass.',
      },
      {
        kind: 'practice',
        label: 'Questions you got wrong',
        minutes: 15,
        why: 'Close the last gaps. Nothing new this close in.',
      },
      {
        kind: 'exam',
        label: 'A short mini-exam to warm up',
        minutes: 20,
        why: 'Arrive already in exam rhythm.',
      },
    ],
  },
];

/** Sitting-the-exam advice, shown on the plan page and in cram mode. */
export const EXAM_DAY_TIPS: { title: string; body: string }[] = [
  {
    title: 'Read the last line of the question first',
    body: 'Case-style questions bury the actual ask under a paragraph of setup. Find what is being asked, then read the scenario for the details that matter.',
  },
  {
    title: 'Classify before you evaluate the options',
    body: 'Decide the workload - generative, agentic, text, speech, vision, extraction - before reading the answers. It usually eliminates two options immediately.',
  },
  {
    title: 'Be wary of absolutes',
    body: '"Always", "never" and "the only way" are usually wrong. Microsoft documentation rarely speaks in absolutes.',
  },
  {
    title: 'Prefer the narrowest tool that satisfies the requirement',
    body: 'If a prebuilt feature answers the question, "train a custom model" and "fine-tune it" are usually distractors.',
  },
  {
    title: 'Trust current naming',
    body: 'Foundry Tools, Foundry resource and project, prompt agents, Content Understanding. An option that says "Cognitive Services" or requires an AI hub deserves suspicion.',
  },
  {
    title: 'Mark and move',
    body: 'You have 40-60 questions. Do not lose four minutes on one. Flag it, answer everything else, and come back with the time you have left.',
  },
];
