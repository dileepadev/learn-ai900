import type { Block, Module } from '../types';
import { QUESTION_BY_ID } from '../questions';

import { foundations } from './foundations';
import { mlAndTransformers } from './ml-and-transformers';
import { responsibleAi } from './responsible-ai';
import { genaiModels } from './genai-models';
import { foundryPlatform } from './foundry-platform';
import { promptsAndChat } from './prompts-and-chat';
import { agents } from './agents';
import { ragFoundryIq } from './rag-foundry-iq';
import { textAnalysis } from './text-analysis';
import { speech } from './speech';
import { vision } from './vision';
import { informationExtraction } from './information-extraction';

const modules: Module[] = [
  foundations,
  mlAndTransformers,
  responsibleAi,
  genaiModels,
  foundryPlatform,
  promptsAndChat,
  agents,
  ragFoundryIq,
  textAnalysis,
  speech,
  vision,
  informationExtraction,
];

/** Catch broken question references at build time rather than in the browser. */
function validate(list: Module[]): Module[] {
  const ids = new Set<string>();
  for (const m of list) {
    if (ids.has(m.id)) throw new Error(`Duplicate module id: ${m.id}`);
    ids.add(m.id);

    for (const qid of m.quiz) {
      if (!QUESTION_BY_ID[qid]) {
        throw new Error(`Module "${m.id}" quiz references missing question "${qid}"`);
      }
    }
    for (const section of m.sections) {
      for (const block of section.blocks as Block[]) {
        if (block.t === 'check' && !QUESTION_BY_ID[block.qid]) {
          throw new Error(
            `Module "${m.id}" section "${section.id}" references missing question "${block.qid}"`,
          );
        }
      }
    }
  }
  return list;
}

export const MODULES: Module[] = validate(modules).sort((a, b) => a.order - b.order);

export const MODULE_BY_ID: Record<string, Module> = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
);

/** Total estimated study time across all lessons, in minutes. */
export const TOTAL_LESSON_MINUTES = MODULES.reduce((sum, m) => sum + m.minutes, 0);

/** Every inline knowledge-check question id used by a module, in order. */
export function checkIdsFor(module: Module): string[] {
  const ids: string[] = [];
  for (const section of module.sections) {
    for (const block of section.blocks) {
      if (block.t === 'check') ids.push(block.qid);
    }
  }
  return ids;
}
