import type { AuthoredQuestion, Question, TopicId } from '../types';
import { normalizeQuestion } from '../types';

import { responsibleAiQuestions } from './responsible-ai';
import { aiWorkloadQuestions } from './ai-workloads';
import { modelComponentQuestions } from './model-components';
import { foundryGenAiQuestions } from './foundry-genai-agents';
import { foundryTextSpeechQuestions } from './foundry-text-speech';
import { foundryVisionQuestions } from './foundry-vision';
import { foundryExtractionQuestions } from './foundry-extraction';
import { scenarioQuestions } from './scenarios';
import { foundryScenarioQuestions } from './scenarios-foundry';

const authored: AuthoredQuestion[] = [
  ...responsibleAiQuestions,
  ...aiWorkloadQuestions,
  ...modelComponentQuestions,
  ...foundryGenAiQuestions,
  ...foundryTextSpeechQuestions,
  ...foundryVisionQuestions,
  ...foundryExtractionQuestions,
  ...scenarioQuestions,
  ...foundryScenarioQuestions,
];

/**
 * Fails the build rather than shipping a bank with duplicate ids or a question
 * that can never be answered correctly.
 */
function validate(questions: Question[]): Question[] {
  const seen = new Set<string>();
  for (const q of questions) {
    if (seen.has(q.id)) throw new Error(`Duplicate question id: ${q.id}`);
    seen.add(q.id);

    if (q.type === 'single') {
      const correct = q.options.filter((o) => o.correct).length;
      if (correct !== 1) {
        throw new Error(`Question ${q.id} is single-answer but has ${correct} correct options`);
      }
    }
    if (q.type === 'multi') {
      const correct = q.options.filter((o) => o.correct).length;
      if (correct < 2) {
        throw new Error(`Question ${q.id} is multi-answer but has ${correct} correct options`);
      }
    }
    if (q.type === 'match' && q.pairs.length < 2) {
      throw new Error(`Question ${q.id} needs at least two pairs`);
    }
    if (q.type === 'order' && q.items.length < 3) {
      throw new Error(`Question ${q.id} needs at least three items to order`);
    }
  }
  return questions;
}

/** The full question bank. */
export const ALL_QUESTIONS: Question[] = validate(authored.map(normalizeQuestion));

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  ALL_QUESTIONS.map((q) => [q.id, q]),
);

/** Exam-style questions only - the ones that count towards a practice exam. */
export const EXAM_QUESTIONS: Question[] = ALL_QUESTIONS.filter((q) => q.kind === 'exam');

/** Inline knowledge checks used inside lessons. */
export const LEARN_QUESTIONS: Question[] = ALL_QUESTIONS.filter((q) => q.kind === 'learn');

export function questionsForTopic(topic: TopicId): Question[] {
  return ALL_QUESTIONS.filter((q) => q.topic === topic);
}

export function questionsForModule(moduleId: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.moduleId === moduleId);
}

export function getQuestions(ids: string[]): Question[] {
  return ids.map((id) => QUESTION_BY_ID[id]).filter((q): q is Question => Boolean(q));
}
