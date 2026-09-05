import type { Module } from '../types';

export const genaiModels: Module = {
  id: 'genai-models',
  order: 4,
  title: 'Choosing and configuring models',
  summary:
    'Model selection, deployment options and inference parameters - small in weight, dense in testable facts, and full of stale-material traps.',
  topic: 'model-components',
  minutes: 22,
  priority: 'high',
  icon: '🎛️',
  outcomes: [
    'Choose between an LLM and an SLM, and pick a model by modality',
    'Explain temperature, top_p, max_tokens, stop and the two penalties',
    'Choose the right deployment option and deployment type, using current names',
  ],
  quiz: ['mc-006', 'mc-007', 'mc-008', 'mc-009', 'mc-011', 'mc-012', 'mc-013', 'mc-017'],
  sections: [
    {
      id: 'selection',
      title: 'Picking a model: modality first',
      blocks: [
        {
          t: 'p',
          md: 'Model selection questions look complicated but resolve in two steps: **what modality goes in and out**, then **how much capability do you actually need**.',
        },
        {
          t: 'table',
          headers: ['You need to…', 'Model type'],
          rows: [
            ['Chat, follow instructions, reason over text', 'Language / chat model'],
            ['Reason about images or audio in a prompt', 'Multimodal model'],
            ['Turn text into vectors for search or RAG', 'Embedding model'],
            ['Create an image from a description', 'Image generation model (GPT-image family)'],
            ['Create a video from a description', 'Video generation model (Sora-2, preview)'],
          ],
        },
        {
          t: 'table',
          headers: ['', 'Large language model (LLM)', 'Small language model (SLM)'],
          rows: [
            ['Parameters', 'Tens to hundreds of billions', 'Roughly 1–14 billion'],
            ['Runs on', 'Cloud GPU capacity', 'Modest hardware, edge devices, laptops'],
            ['Cost & latency', 'Higher', 'Much lower'],
            ['Best at', 'Complex multi-step reasoning, broad knowledge', 'Focused tasks, classification, high throughput, offline'],
          ],
          caption: 'Microsoft\'s Phi family is the SLM to name if asked for an example.',
        },
        { t: 'check', qid: 'mc-009' },
      ],
    },
    {
      id: 'catalog',
      title: 'The model catalog',
      blocks: [
        {
          t: 'p',
          md: 'The Foundry **model catalog** is where you browse and filter models by capability, modality and provider, then deploy one. It now spans well over ten thousand models from Microsoft, OpenAI, Anthropic, Meta, Mistral, Cohere and the open-source community.',
        },
        {
          t: 'changed',
          title: 'Models sold by Azure vs. models from partners',
          body: '**Models sold by Azure** (all Azure OpenAI models plus selected others) are billed through your Azure subscription, covered by Azure SLAs and supported by Microsoft. **Models from partners and community** are billed via Azure Marketplace under the provider\'s terms.',
        },
      ],
    },
    {
      id: 'deployment',
      title: 'Deployment: options vs. types',
      blocks: [
        {
          t: 'key',
          title: 'Two levels, and the exam tests both',
          body: 'First choose a **deployment option**: *Serverless API* (preferred) or *managed compute*. If you chose Serverless API, then choose a **deployment type**, which decides where data is processed and how you pay.',
          priority: 'high',
        },
        {
          t: 'table',
          headers: ['', 'Serverless API', 'Managed compute'],
          rows: [
            ['Which models', 'All Foundry Models, including those sold by Azure and select partner models', 'Open-source, partner and custom models, NVIDIA NIM, industry models'],
            ['Who hosts it', 'Microsoft', 'Dedicated GPU capacity Foundry manages for you'],
            ['Billing', 'Token usage, or reserved provisioned throughput units (PTUs)', 'Hourly, per accelerator SKU'],
            ['Data processing', 'Regional, data zone, or global', 'Global'],
            ['Content filtering', 'Built-in and customisable', 'Not available in public preview'],
            ['Verdict', '**The preferred option - use it whenever possible**', 'Only when the model requires it'],
          ],
        },
        {
          t: 'changed',
          title: 'PTU is not a third option',
          body: 'Older notes list "Serverless API / Managed compute / PTU" as three peers. **Provisioned throughput is a deployment *type* inside the Serverless API option**, not a separate option. Likewise, "serverless API endpoints" and hub-based managed compute belong to the classic hub model.',
        },
        {
          t: 'p',
          md: 'Serverless API **deployment types** fall into three families - *standard* (pay per token), *provisioned* (reserved PTU capacity), and *batch* (discounted asynchronous). Each is offered with Global, Data Zone, or single-region processing. A *Developer* type exists for evaluating fine-tuned models.',
        },
        {
          t: 'table',
          headers: ['Processing scope', 'Where inference happens', 'Choose it when'],
          rows: [
            ['**Global**', 'Any Azure region', 'You want the highest default quota and traffic is variable'],
            ['**Data Zone**', 'Only within a specified zone: US, EU, or APAC', 'Compliance requires regional confinement'],
            ['**Standard / Regional Provisioned**', 'Within your chosen Azure geography', 'Strictest residency requirements'],
          ],
          caption: 'Data at rest always stays in the designated geography; these types govern where *inference* runs.',
        },
        { t: 'demo', name: 'deployment-picker', caption: 'Answer three questions and get the deployment recommendation.' },
        { t: 'check', qid: 'mc-012' },
        { t: 'check', qid: 'mc-013' },
      ],
    },
    {
      id: 'instant',
      title: 'Instant access',
      blocks: [
        {
          t: 'changed',
          title: 'You do not always need a deployment',
          body: '**Instant access** (preview) lets you call supported models by name and start inferencing with no Serverless API or managed compute deployment at all. Older material that insists a deployment is always required is out of date.',
        },
      ],
    },
    {
      id: 'parameters',
      title: 'Inference parameters',
      blocks: [
        {
          t: 'table',
          headers: ['Parameter', 'Controls', 'Exam-critical detail'],
          rows: [
            ['`temperature`', 'Randomness of token selection', '≈0 → focused, deterministic. ≈1+ → creative, varied.'],
            ['`top_p`', 'Probability mass of candidate tokens (nucleus sampling)', 'An **alternative** to temperature - tune one, not both.'],
            ['`max_tokens`', 'Maximum length of the **generated response**', 'It does **not** limit prompt length. That is the context window.'],
            ['`stop`', 'Sequences that halt generation immediately', 'Useful for clean structured output.'],
            ['`frequency_penalty`', 'Discourages tokens by **how often** they appeared', 'Reduces verbatim repetition.'],
            ['`presence_penalty`', 'Discourages tokens that appeared **at all**', 'Pushes the model towards new topics.'],
          ],
        },
        {
          t: 'demo',
          name: 'sampling',
          caption: 'Move the sliders and watch which token the model would pick.',
        },
        {
          t: 'trap',
          title: 'The max_tokens trap',
          body: 'At least one question will offer "limits the size of the prompt you can send" as a plausible answer for `max_tokens`. It limits the **completion**. Prompt length is bounded separately by the model\'s **context window**, and prompt + completion together must fit inside it.',
        },
        { t: 'check', qid: 'mc-006' },
        { t: 'check', qid: 'mc-008' },
      ],
    },
    {
      id: 'rag-vs-ft',
      title: 'RAG or fine-tuning?',
      blocks: [
        {
          t: 'key',
          title: 'One sentence to memorise',
          body: '**RAG for knowledge. Fine-tuning for behaviour.** If the requirement is private or frequently changing facts, or citable answers, that is retrieval. If the requirement is a different style, format or task performance, that is fine-tuning.',
          priority: 'high',
        },
        { t: 'check', qid: 'mc-017' },
      ],
    },
  ],
};
