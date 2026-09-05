import type { Module } from '../types';

export const promptsAndChat: Module = {
  id: 'prompts-and-chat',
  order: 6,
  title: 'Prompts and a chat client',
  summary:
    'Message roles, prompting techniques that actually move the needle, and the shape of a lightweight Foundry chat client.',
  topic: 'foundry-genai-agents',
  minutes: 20,
  priority: 'high',
  icon: '💬',
  outcomes: [
    'Put the right content in system, user and assistant messages',
    'Choose between zero-shot, few-shot and chain-of-thought prompting',
    'Describe what a Foundry chat client needs and how it authenticates',
  ],
  quiz: ['fg-002', 'fg-003', 'fg-004', 'fg-014', 'fg-015', 'fg-040'],
  sections: [
    {
      id: 'roles',
      title: 'Three message roles',
      blocks: [
        {
          t: 'table',
          headers: ['Role', 'Who writes it', 'What goes in it'],
          rows: [
            ['**system**', 'The developer', 'Persona, scope, rules, tone, output format, what to do when unsure'],
            ['**user**', 'The end user', 'The current question or instruction'],
            ['**assistant**', 'The model', 'Previous replies, replayed to give the model conversation history'],
          ],
        },
        {
          t: 'demo',
          name: 'prompt-roles',
          caption: 'Change the system message and see how the same question gets answered differently.',
        },
        { t: 'check', qid: 'fg-001' },
      ],
    },
    {
      id: 'techniques',
      title: 'Prompting techniques',
      blocks: [
        {
          t: 'table',
          headers: ['Technique', 'What it is', 'Use it when'],
          rows: [
            ['**Zero-shot**', 'State the task, give no examples', 'The task is common and the format is obvious'],
            ['**Few-shot**', 'Include several input → output examples', 'You need an exact output format or labelling scheme'],
            ['**Chain-of-thought**', 'Ask the model to reason step by step', 'Multi-step reasoning or logic problems'],
          ],
        },
        {
          t: 'key',
          title: 'None of these change the model',
          body: 'All three are **inference-time** techniques that cost prompt tokens and require no training. Fine-tuning is the one that changes weights. A question offering "fine-tune the model" as a fix for a formatting or tone problem is usually the wrong answer — try the system prompt first.',
          priority: 'high',
        },
        { t: 'check', qid: 'fg-002' },
        { t: 'check', qid: 'fg-040' },
      ],
    },
    {
      id: 'good-prompts',
      title: 'What makes a system prompt good',
      blocks: [
        {
          t: 'list',
          ordered: true,
          items: [
            '**Role and scope** — who the assistant is, and explicitly what it will not discuss.',
            '**Output format** — state it, and show an example of it.',
            '**Failure behaviour** — "if the answer is not in the provided context, say you do not know". This single line prevents a great deal of hallucination in grounded apps.',
            '**Tone** — one concrete sentence beats three adjectives.',
          ],
        },
        {
          t: 'code',
          lang: 'text',
          caption: 'A system prompt with all four elements',
          code: `You are a support assistant for Contoso Cloud.
Answer only from the context provided in the conversation.
If the answer is not in the context, say: "I don't have that information."
Never discuss competitors or pricing.
Reply in at most three sentences, plain language, no marketing tone.`,
        },
        { t: 'check', qid: 'fg-003' },
        { t: 'check', qid: 'fg-004' },
      ],
    },
    {
      id: 'client',
      title: 'A lightweight chat client',
      blocks: [
        {
          t: 'p',
          md: 'You will not be asked to write this from scratch, but you should recognise the shape and know what each piece is for.',
        },
        {
          t: 'steps',
          title: 'What every Foundry chat client does',
          steps: [
            {
              label: 'Get a credential',
              detail:
                'Microsoft Entra ID (keyless) is the recommendation — `DefaultAzureCredential` for development, a specific credential such as a managed identity in production. Keys work too, but never put them in source code.',
            },
            {
              label: 'Point at the project endpoint',
              detail:
                'Typically `https://<your-resource>.services.ai.azure.com/api/projects/<project-name>`, read from an environment variable such as PROJECT_ENDPOINT.',
            },
            {
              label: 'Build the messages',
              detail: 'A system message with your standing instructions, then the user message, plus any prior assistant messages for history.',
            },
            {
              label: 'Call the model by deployment name',
              detail: 'Pass the deployment name you chose in the portal, along with parameters such as temperature and max_tokens.',
            },
            { label: 'Read the reply', detail: 'Take the generated content out of the response and show it to the user.' },
          ],
        },
        {
          t: 'code',
          lang: 'python',
          caption: 'The shape of it — endpoint, credential, deployment name, messages',
          code: `import os
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint=os.environ["PROJECT_ENDPOINT"],
    credential=DefaultAzureCredential(),
)

client = project.get_openai_client()

response = client.chat.completions.create(
    model=os.environ["MODEL_DEPLOYMENT_NAME"],
    messages=[
        {"role": "system", "content": "You are a concise IT support assistant."},
        {"role": "user", "content": "What is an AI agent?"},
    ],
    temperature=0.3,
    max_tokens=200,
)

print(response.choices[0].message.content)`,
        },
        {
          t: 'changed',
          title: 'If your notes use a connection string',
          body: 'Older samples authenticate with `AIProjectClient.from_connection_string(...)`. Current samples use a **project endpoint** with a Microsoft Entra credential. Recognise both, prefer the current one.',
        },
        { t: 'check', qid: 'fg-014' },
        { t: 'check', qid: 'fg-015' },
      ],
    },
  ],
};
