import type { Module } from '../types';

export const ragFoundryIq: Module = {
  id: 'rag-foundry-iq',
  order: 8,
  title: 'RAG and Foundry IQ',
  summary:
    'Grounding agents in your own data: the RAG pipeline, agentic retrieval, and what a Foundry IQ knowledge base actually is.',
  topic: 'foundry-genai-agents',
  minutes: 20,
  priority: 'high',
  icon: '📚',
  outcomes: [
    'Walk through the RAG pipeline and say what happens at query time',
    'Explain what Foundry IQ provides beyond a plain search index',
    'Diagnose a grounding failure and pick the right fix',
  ],
  quiz: ['fg-030', 'fg-031', 'fg-032', 'fg-033', 'fg-034', 'fg-035', 'fg-036'],
  sections: [
    {
      id: 'why',
      title: 'Why RAG exists',
      blocks: [
        {
          t: 'p',
          md: 'A model knows only what was in its training data, up to its cutoff. It cannot know your policies, your contracts, or what changed last week - and it will confidently make something up rather than say so.',
        },
        {
          t: 'key',
          title: 'The fix in one line',
          body: 'Retrieve the relevant passages from your own content at query time, put them in the prompt as **grounding data**, and have the model answer from them - with **citations** back to the source.',
          priority: 'high',
        },
      ],
    },
    {
      id: 'pipeline',
      title: 'The pipeline',
      blocks: [
        {
          t: 'demo',
          name: 'rag-pipeline',
          caption: 'Click through each stage to see what happens to a real question.',
        },
        {
          t: 'p',
          md: 'Everything up to indexing happens **ahead of time**. Retrieval and generation happen **per query**. If a question asks what happens "when the user asks a question", the answer starts at retrieval.',
        },
        {
          t: 'table',
          headers: ['Stage', 'What it does', 'Why it matters'],
          rows: [
            ['**Ingest**', 'Pull in source documents', 'Determines what the assistant can ever know'],
            ['**Chunk**', 'Split into focused passages', 'A whole handbook as one vector represents nothing precisely'],
            ['**Embed & index**', 'Vectorise passages and store them', 'Enables semantic matching, not just keywords'],
            ['**Retrieve**', 'Find the passages closest to the query', 'The quality ceiling for the whole system'],
            ['**Augment**', 'Insert those passages into the prompt', 'This is the "grounding data"'],
            ['**Generate**', 'Model answers from the context, with citations', 'Traceable, checkable output'],
          ],
        },
        { t: 'check', qid: 'fg-033' },
        { t: 'check', qid: 'fg-036' },
      ],
    },
    {
      id: 'agentic',
      title: 'Agentic retrieval',
      blocks: [
        {
          t: 'changed',
          title: 'Classic RAG is no longer the only pattern',
          body: 'Classic RAG issues **one query** per question. **Agentic retrieval** uses a model to plan: it reads conversation history for context, decomposes a complex question into several focused subqueries, runs them **in parallel**, applies semantic ranking, and returns structured grounding data with citations and execution metadata.',
        },
        {
          t: 'table',
          headers: ['Choose…', 'When'],
          rows: [
            ['**Agentic retrieval**', 'The client is an agent or chatbot; queries are complex or conversational; you want maximum relevance and structured, cited responses'],
            ['**Classic RAG**', 'You need generally available features only, want simplicity and speed, or already have orchestration code and want fine-grained control'],
          ],
        },
        { t: 'check', qid: 'fg-032' },
      ],
    },
    {
      id: 'foundry-iq',
      title: 'Foundry IQ',
      blocks: [
        {
          t: 'p',
          md: '**Foundry IQ** is the managed knowledge layer that gives an agent a single endpoint to your organisation\'s data. It is built on Azure AI Search, but you configure it in Foundry rather than managing indexes directly.',
        },
        {
          t: 'key',
          title: 'The vocabulary',
          body: 'A **knowledge base** = one or more **knowledge sources** (Azure Blob Storage, SharePoint, OneLake, public web) plus retrieval parameters. **Multiple agents can share one knowledge base.**',
          priority: 'high',
        },
        {
          t: 'list',
          items: [
            'Automates **chunking, embedding generation and metadata extraction**; indexers can run on a schedule for incremental refresh.',
            'Issues **keyword, vector or hybrid** queries across indexed and remote sources.',
            'Uses **agentic retrieval** to plan queries, select sources, run parallel searches and aggregate results.',
            'Returns **extractive data with citations** so answers trace back to source documents.',
            'Synchronises **access control lists**, honours **Microsoft Purview sensitivity labels**, and enforces permissions **at query time**.',
            'Can run queries under the **caller\'s Microsoft Entra identity** for end-to-end permission enforcement.',
          ],
        },
        {
          t: 'trap',
          title: 'The permission-aware angle',
          body: 'Foundry IQ is the standard answer to "the agent must never show restricted content to an unauthorised user". That is a **privacy and security** requirement - content filters, which block harmful categories, have no concept of who may see which document.',
        },
        { t: 'check', qid: 'fg-031' },
        { t: 'check', qid: 'fg-035' },
      ],
    },
    {
      id: 'related',
      title: 'The other IQ services',
      blocks: [
        {
          t: 'table',
          headers: ['Service', 'Grounds agents in…'],
          rows: [
            ['**Foundry IQ**', 'Enterprise content you connect: Blob Storage, SharePoint, OneLake, public web'],
            ['**Work IQ** (preview)', 'Microsoft 365 work data - emails, meetings, documents, Teams messages - queried live'],
            ['**Fabric IQ** (preview)', 'Microsoft Fabric data and semantic models'],
          ],
        },
      ],
    },
    {
      id: 'debug',
      title: 'When grounding fails',
      blocks: [
        {
          t: 'p',
          md: 'A grounded assistant that answers something unsupported has failed in one of two places. Diagnose before you change anything.',
        },
        {
          t: 'table',
          headers: ['Symptom', 'Likely cause', 'Fix'],
          rows: [
            ['Answer ignores the retrieved passages', 'The prompt did not constrain the model', 'System message: answer only from context, say "I don\'t know" otherwise'],
            ['Retrieved passages were irrelevant', 'Chunking, embedding or search configuration', 'Revisit chunk size, embedding model, and keyword vs. semantic vs. hybrid search'],
            ['Answers are slow', 'Large index, too many passages', 'Filtering, reranking, tighter retrieval'],
            ['Token budget exceeded', 'Too much retrieved content in the prompt', 'Filter, rank or summarise passages before augmenting'],
            ['Sensitive content leaked', 'No permission enforcement on retrieval', 'Permission-aware retrieval (Foundry IQ) - not a content filter'],
          ],
        },
        { t: 'check', qid: 'fg-034' },
      ],
    },
  ],
};
