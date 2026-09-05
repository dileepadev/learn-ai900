import type { AuthoredQuestion } from '../types';

/**
 * Topic: Implement generative AI apps and agents by using Foundry (~20%).
 *
 * The single heaviest topic. Covers prompts, deploying and testing models in
 * the portal, the Foundry SDK chat client, building a single agent, agent
 * client code, and RAG / Foundry IQ grounding.
 */
export const foundryGenAiQuestions: AuthoredQuestion[] = [
  /* ---------------- Prompts ---------------- */
  {
    id: 'fg-001',
    topic: 'foundry-genai-agents',
    moduleId: 'prompts-and-chat',
    objective: 'Create effective system and user prompts for generative AI models',
    difficulty: 'easy',
    kind: 'learn',
    prompt: 'What belongs in the system message rather than the user message?',
    options: [
      {
        id: 'a',
        text: 'The assistant\'s persona, rules, tone and output format - set once by the developer',
        correct: true,
      },
      {
        id: 'b',
        text: 'The end user\'s current question',
        correct: false,
        why: 'That is the user message by definition.',
      },
      {
        id: 'c',
        text: 'The model\'s previous replies',
        correct: false,
        why: 'Those are assistant messages, replayed to give the model conversation history.',
      },
      {
        id: 'd',
        text: 'The API key',
        correct: false,
        why: 'Credentials go in the request header, never in message content.',
      },
    ],
    explanation:
      'System message = standing instructions from the developer. User message = what the person asked right now. Assistant message = what the model said before. Keeping them straight is the foundation of every prompt question on this exam.',
    tags: ['prompts', 'roles'],
  },
  {
    id: 'fg-002',
    topic: 'foundry-genai-agents',
    moduleId: 'prompts-and-chat',
    objective: 'Create effective system and user prompts for generative AI models',
    difficulty: 'medium',
    kind: 'exam',
    prompt:
      'A prompt includes three worked examples of input and the desired labelled output before the real input. What is this technique called?',
    options: [
      { id: 'a', text: 'Few-shot prompting', correct: true },
      {
        id: 'b',
        text: 'Zero-shot prompting',
        correct: false,
        why: 'Zero-shot means no examples are provided - you simply state the task.',
      },
      {
        id: 'c',
        text: 'Fine-tuning',
        correct: false,
        why: 'Fine-tuning retrains model weights on a dataset. Examples inside a prompt change nothing about the model.',
      },
      {
        id: 'd',
        text: 'Chain-of-thought prompting',
        correct: false,
        why: 'Chain-of-thought asks the model to reason step by step before answering; it is about *reasoning*, not about supplying examples.',
      },
    ],
    explanation:
      'Few-shot prompting demonstrates the pattern you want - useful for enforcing an exact output format or a labelling scheme. It is an inference-time technique, so it costs prompt tokens but requires no training.',
    tags: ['prompts', 'few-shot'],
  },
  {
    id: 'fg-003',
    topic: 'foundry-genai-agents',
    moduleId: 'prompts-and-chat',
    objective: 'Create effective system and user prompts for generative AI models',
    difficulty: 'medium',
    kind: 'exam',
    scenario:
      'A support assistant sometimes answers questions about competitors and occasionally replies in a chatty tone that does not match the brand.',
    prompt: 'What is the most appropriate first fix?',
    options: [
      {
        id: 'a',
        text: 'Strengthen the system message with explicit scope boundaries and tone rules',
        correct: true,
      },
      {
        id: 'b',
        text: 'Lower the temperature to 0',
        correct: false,
        why: 'That makes off-topic answers more consistent, not fewer. Temperature does not encode scope.',
      },
      {
        id: 'c',
        text: 'Fine-tune the model on brand documents',
        correct: false,
        why: 'Expensive and slow for something a well-written system message solves. Prompt first, fine-tune only if prompting genuinely cannot achieve it.',
      },
      {
        id: 'd',
        text: 'Reduce max_tokens so replies are shorter',
        correct: false,
        why: 'Shorter off-brand answers are still off-brand.',
      },
    ],
    explanation:
      'Behavioural boundaries - what the assistant will and will not discuss, and how it should sound - belong in the system message. It is the cheapest, fastest and most maintainable control surface.',
    tags: ['prompts', 'system-message', 'trap'],
  },
  {
    id: 'fg-004',
    topic: 'foundry-genai-agents',
    moduleId: 'prompts-and-chat',
    objective: 'Create effective system and user prompts for generative AI models',
    difficulty: 'hard',
    kind: 'exam',
    type: 'multi',
    prompt:
      'Which two practices make a system prompt more effective? (Choose two.)',
    options: [
      {
        id: 'a',
        text: 'State the output format explicitly, including an example of it',
        correct: true,
      },
      {
        id: 'b',
        text: 'Tell the model what to do when it does not know the answer',
        correct: true,
      },
      {
        id: 'c',
        text: 'Keep instructions vague so the model can be creative',
        correct: false,
        why: 'Ambiguity is the main cause of inconsistent output. Specificity is the point of a system prompt.',
      },
      {
        id: 'd',
        text: 'Put the instructions in the user message instead so they are easier to change',
        correct: false,
        why: 'Instructions in user messages are easily overridden by subsequent user input and are the weaker position for standing rules.',
      },
      {
        id: 'e',
        text: 'Include the API key so the model can authenticate itself',
        correct: false,
        why: 'Never put credentials in prompt content.',
      },
    ],
    explanation:
      'Good system prompts are specific about role, scope, format and failure behaviour. "If the answer is not in the provided context, say you do not know" is one of the highest-value sentences you can add to a grounded assistant.',
    tags: ['prompts', 'hard', 'multi-select'],
  },

  /* ---------------- Foundry platform / portal ---------------- */
  {
    id: 'fg-010',
    topic: 'foundry-genai-agents',
    moduleId: 'foundry-platform',
    objective: 'Deploy a model and interact with it in the Foundry portal',
    difficulty: 'medium',
    kind: 'exam',
    prompt:
      'In current Microsoft Foundry, what is the relationship between a Foundry resource and a Foundry project?',
    options: [
      {
        id: 'a',
        text: 'The project is a child of the Foundry resource; security, networking and governance are set on the resource and inherited by projects, which organise the work',
        correct: true,
      },
      {
        id: 'b',
        text: 'The project is the parent, and Foundry resources are created inside it',
        correct: false,
        why: 'Reversed. The resource is the Azure-level container; projects are subresources of it.',
      },
      {
        id: 'c',
        text: 'They are unrelated - you choose one or the other',
        correct: false,
        why: 'You work inside a project, and that project belongs to a resource.',
      },
      {
        id: 'd',
        text: 'A project requires a separate Azure Storage account and Key Vault to exist first',
        correct: false,
        why: 'That was the hub-based model. Foundry projects do not require you to provision separate storage and key vault resources.',
      },
    ],
    explanation:
      'Foundry projects are child resources of a Foundry resource. Admins configure security, connectivity and governance once at the resource level; developers then create projects as folders to organise their work, inheriting those settings by default.',
    reference: {
      label: 'What is Microsoft Foundry?',
      url: 'https://learn.microsoft.com/azure/foundry/what-is-foundry',
    },
    tags: ['foundry', 'architecture', 'currency'],
  },
  {
    id: 'fg-011',
    topic: 'foundry-genai-agents',
    moduleId: 'foundry-platform',
    objective: 'Deploy a model and interact with it in the Foundry portal',
    difficulty: 'hard',
    kind: 'exam',
    prompt:
      'Older study material describes creating an "AI hub" before you can create a project. What is the current guidance?',
    options: [
      {
        id: 'a',
        text: 'Hub-based projects are now the classic model; new investment is in Foundry projects on a Foundry resource, and a hub is only needed for selected cases such as open-source model hosting and Azure Machine Learning capabilities',
        correct: true,
      },
      {
        id: 'b',
        text: 'Hubs are required for every Foundry project',
        correct: false,
        why: 'They are not. Serverless API deployments and Foundry projects explicitly do not require an AI Hub.',
      },
      {
        id: 'c',
        text: 'Hubs have been deleted from Azure entirely',
        correct: false,
        why: 'They still exist and are still supported for specific scenarios - they are simply no longer the default.',
      },
      {
        id: 'd',
        text: 'Hubs and projects are two names for the same object',
        correct: false,
        why: 'They are distinct resource types with different capabilities.',
      },
    ],
    explanation:
      'Microsoft moved most hub capabilities under the Foundry resource type. If a practice question or older note insists on hubs, storage accounts and key vaults as prerequisites, it predates the current model.',
    reference: {
      label: 'Migrate from hub-based to Foundry projects',
      url: 'https://learn.microsoft.com/azure/foundry-classic/how-to/migrate-project',
    },
    tags: ['foundry', 'currency', 'hard', 'trap'],
  },
  {
    id: 'fg-012',
    topic: 'foundry-genai-agents',
    moduleId: 'foundry-platform',
    objective: 'Deploy a model and interact with it in the Foundry portal',
    difficulty: 'easy',
    kind: 'learn',
    type: 'order',
    prompt: 'Put the steps for deploying and trying a model in the Foundry portal in order.',
    items: [
      { id: 'd1', text: 'Open your project in the Foundry portal' },
      { id: 'd2', text: 'Browse the model catalog and choose a model' },
      { id: 'd3', text: 'Create a deployment, choosing the deployment type' },
      { id: 'd4', text: 'Open the playground and chat with the deployment' },
      { id: 'd5', text: 'Copy the project endpoint and deployment name into your app' },
    ],
    explanation:
      'Portal flow: project → catalog → deploy → playground → wire into code. The playground is the fastest way to sanity-check a system prompt before writing any client code.',
    tags: ['foundry', 'portal', 'workflow'],
  },
  {
    id: 'fg-013',
    topic: 'foundry-genai-agents',
    moduleId: 'foundry-platform',
    objective: 'Deploy a model and interact with it in the Foundry portal',
    difficulty: 'medium',
    kind: 'exam',
    prompt: 'What are Foundry Tools?',
    options: [
      {
        id: 'a',
        text: 'The Azure AI capabilities available alongside models in Foundry - Language, Speech, Vision, Content Understanding and others',
        correct: true,
      },
      {
        id: 'b',
        text: 'The command-line utilities for managing Azure subscriptions',
        correct: false,
        why: 'That is the Azure CLI.',
      },
      {
        id: 'c',
        text: 'Third-party plugins installed from a marketplace',
        correct: false,
        why: 'Foundry Tools are first-party Azure AI capabilities, not community add-ons.',
      },
      {
        id: 'd',
        text: 'The debugging panel in the Foundry portal',
        correct: false,
        why: 'Observability and tracing are separate features.',
      },
    ],
    explanation:
      'The services once called Azure AI services (and before that Cognitive Services) are now presented as Foundry Tools: Azure Language in Foundry Tools, Azure Speech in Foundry Tools, Azure Vision in Foundry Tools, Azure Content Understanding in Foundry Tools. Expect the exam to use the new names.',
    tags: ['foundry', 'naming', 'currency'],
  },
  {
    id: 'fg-014',
    topic: 'foundry-genai-agents',
    moduleId: 'prompts-and-chat',
    objective: 'Create a lightweight chat client application by using the Foundry SDK',
    difficulty: 'medium',
    kind: 'exam',
    prompt:
      'Which two values does a lightweight Foundry chat client typically need in order to call a deployed model?',
    options: [
      {
        id: 'a',
        text: 'The project endpoint and the model deployment name, plus a credential',
        correct: true,
      },
      {
        id: 'b',
        text: 'The Azure subscription ID and the resource group name',
        correct: false,
        why: 'Those identify resources for management operations. Inference calls go to an endpoint.',
      },
      {
        id: 'c',
        text: 'The model\'s parameter count and context window size',
        correct: false,
        why: 'Useful to know, but not required to make a call.',
      },
      {
        id: 'd',
        text: 'The training dataset URI',
        correct: false,
        why: 'Irrelevant to calling a hosted model.',
      },
    ],
    explanation:
      'Endpoint + deployment name + credential. In current samples the endpoint is the project endpoint (`https://<resource>.services.ai.azure.com/api/projects/<project>`), stored as `PROJECT_ENDPOINT`, and Microsoft Entra credentials are preferred over keys.',
    tags: ['sdk', 'chat-client'],
  },
  {
    id: 'fg-015',
    topic: 'foundry-genai-agents',
    moduleId: 'prompts-and-chat',
    objective: 'Create a lightweight chat client application by using the Foundry SDK',
    difficulty: 'medium',
    kind: 'exam',
    prompt:
      'Which authentication approach does Microsoft recommend for a Foundry client application?',
    options: [
      {
        id: 'a',
        text: 'Microsoft Entra ID (keyless) credentials such as a managed identity',
        correct: true,
      },
      {
        id: 'b',
        text: 'Embedding the API key in the client source code',
        correct: false,
        why: 'Keys in source are a leak waiting to happen. Even when keys are used, they belong in configuration or a secret store.',
      },
      {
        id: 'c',
        text: 'Anonymous access with IP allow-listing',
        correct: false,
        why: 'Inference endpoints always require authentication.',
      },
      {
        id: 'd',
        text: 'A shared user password stored in the repository',
        correct: false,
        why: 'Not a supported authentication mechanism, and a serious security failure.',
      },
    ],
    explanation:
      'Both Serverless API and managed compute support keys and Microsoft Entra authentication; Entra (keyless) is the recommendation, with `DefaultAzureCredential` for development and a specific credential such as a managed identity in production.',
    tags: ['sdk', 'auth', 'security'],
  },

  /* ---------------- Agents ---------------- */
  {
    id: 'fg-020',
    topic: 'foundry-genai-agents',
    moduleId: 'agents',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'easy',
    kind: 'learn',
    prompt: 'What are the three building blocks of an AI agent?',
    options: [
      { id: 'a', text: 'A model, instructions, and tools', correct: true },
      {
        id: 'b',
        text: 'A model, a database, and a web front end',
        correct: false,
        why: 'Storage and UI are implementation details around an agent, not what defines one.',
      },
      {
        id: 'c',
        text: 'Training data, weights, and a tokenizer',
        correct: false,
        why: 'Those are components of a model, one level down.',
      },
      {
        id: 'd',
        text: 'A prompt, a temperature, and a stop sequence',
        correct: false,
        why: 'Those are inference settings for a single call.',
      },
    ],
    explanation:
      'Model = the reasoning engine. Instructions = who it is and what it may do. Tools = how it acts on the world. Remove tools and you have a chatbot, not an agent.',
    tags: ['agents', 'definition', 'cram'],
  },
  {
    id: 'fg-021',
    topic: 'foundry-genai-agents',
    moduleId: 'agents',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'medium',
    kind: 'exam',
    prompt:
      'Foundry Agent Service offers two agent types. Which describes a **prompt agent**?',
    options: [
      {
        id: 'a',
        text: 'A declaratively defined agent - instructions, model and tools - that Foundry runs for you with no code or infrastructure to manage',
        correct: true,
      },
      {
        id: 'b',
        text: 'An agent you package as a container and Foundry runs with a managed endpoint',
        correct: false,
        why: 'That is a *hosted* agent - the type you use when you bring your own code and framework.',
      },
      {
        id: 'c',
        text: 'An agent that runs entirely in the browser',
        correct: false,
        why: 'Neither agent type runs client-side.',
      },
      {
        id: 'd',
        text: 'A one-off agent whose definition lives only in your application code',
        correct: false,
        why: 'That is the ephemeral pattern you get by calling the Responses API directly - no agent resource is created in Foundry at all.',
      },
    ],
    explanation:
      'Prompt agents are configuration-only and the recommended starting point: author them in the portal or with the SDK/REST, and Foundry runs them. Hosted agents let you bring code built with Agent Framework, LangGraph, the OpenAI or Anthropic Agent SDKs, or your own, shipped as a container or zip.',
    reference: {
      label: 'Agents in Microsoft Foundry',
      url: 'https://learn.microsoft.com/azure/foundry/agents/overview',
    },
    tags: ['agents', 'currency', 'prompt-vs-hosted'],
  },
  {
    id: 'fg-022',
    topic: 'foundry-genai-agents',
    moduleId: 'agents',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'hard',
    kind: 'exam',
    type: 'match',
    leftLabel: 'Requirement',
    rightLabel: 'Best approach',
    prompt: 'Match each requirement to the way you should build the agent.',
    pairs: [
      {
        id: 'a1',
        left: 'Ship an internal assistant quickly with no runtime code to maintain',
        right: 'Prompt agent',
      },
      {
        id: 'a2',
        left: 'Run custom orchestration logic written with LangGraph, with Foundry handling hosting and scaling',
        right: 'Hosted agent',
      },
      {
        id: 'a3',
        left: 'Call Foundry models and tools from code you already run elsewhere, with no agent resource in Foundry',
        right: 'Responses API directly',
      },
    ],
    explanation:
      'Three rungs on the same ladder: least to manage (prompt agent) → your code, Foundry-hosted (hosted agent) → your code, your host (Responses API). Prompt agents and hosted agents are the two *agent types*; the Responses API path creates an ephemeral agent with no persisted resource.',
    reference: {
      label: 'Agents in Microsoft Foundry - choose how to build',
      url: 'https://learn.microsoft.com/azure/foundry/agents/overview',
    },
    tags: ['agents', 'currency', 'matching', 'hard'],
  },
  {
    id: 'fg-023',
    topic: 'foundry-genai-agents',
    moduleId: 'agents',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'medium',
    kind: 'exam',
    scenario:
      'An agent must answer questions about company policy, run numerical calculations on an uploaded spreadsheet, and look up today\'s exchange rate.',
    prompt: 'Which combination of tools does it need?',
    options: [
      {
        id: 'a',
        text: 'A knowledge/file search tool, code interpreter, and a web search tool',
        correct: true,
      },
      {
        id: 'b',
        text: 'Only a larger model with a bigger context window',
        correct: false,
        why: 'Context size does not give a model the ability to execute code or reach live data.',
      },
      {
        id: 'c',
        text: 'Only a fine-tuned model',
        correct: false,
        why: 'Fine-tuning changes behaviour, not the ability to act on external systems or compute exact results.',
      },
      {
        id: 'd',
        text: 'Only a higher temperature so the model is more resourceful',
        correct: false,
        why: 'Temperature affects randomness, nothing else.',
      },
    ],
    explanation:
      'Read the verbs. "Answer from our documents" ⇒ retrieval/knowledge. "Calculate on a file" ⇒ code interpreter. "Today\'s rate" ⇒ live web search. In Foundry, tools can be curated into a **toolbox** and shared across agents through a single managed endpoint with central governance.',
    reference: {
      label: 'Foundry Toolbox overview',
      url: 'https://learn.microsoft.com/azure/foundry/agents/concepts/toolbox-overview',
    },
    tags: ['agents', 'tools'],
  },
  {
    id: 'fg-024',
    topic: 'foundry-genai-agents',
    moduleId: 'agents',
    objective: 'Create a lightweight client application for an agent',
    difficulty: 'medium',
    kind: 'exam',
    prompt:
      'In the current Foundry SDK, what does a client application do to have a conversation with an existing prompt agent?',
    options: [
      {
        id: 'a',
        text: 'Create an AIProjectClient against the project endpoint, then create a conversation and send requests that reference the agent',
        correct: true,
      },
      {
        id: 'b',
        text: 'Download the agent definition and run it locally',
        correct: false,
        why: 'A prompt agent runs in Foundry Agent Service. The client calls it; it does not execute the agent itself.',
      },
      {
        id: 'c',
        text: 'Send raw SQL to the agent endpoint',
        correct: false,
        why: 'Not how any of this works.',
      },
      {
        id: 'd',
        text: 'Redeploy the underlying model on every call',
        correct: false,
        why: 'Deployment happens once; inference calls reuse it.',
      },
    ],
    explanation:
      'The shape is: authenticate → `AIProjectClient(endpoint, credential)` → get an OpenAI-compatible client from the project → create a conversation → send a request referencing the agent → read the reply. The service keeps conversation history across turns.',
    reference: {
      label: 'Quickstart: Create a prompt agent',
      url: 'https://learn.microsoft.com/azure/foundry/agents/quickstarts/prompt-agent',
    },
    tags: ['agents', 'sdk', 'currency'],
  },
  {
    id: 'fg-025',
    topic: 'foundry-genai-agents',
    moduleId: 'agents',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'medium',
    kind: 'learn',
    prompt:
      'Where do you test an agent interactively before wiring it into an application?',
    options: [
      { id: 'a', text: 'The agents playground in the Foundry portal', correct: true },
      {
        id: 'b',
        text: 'The Azure portal\'s resource blade',
        correct: false,
        why: 'The Azure portal manages the resource; agent authoring and testing happen in the Foundry portal.',
      },
      {
        id: 'c',
        text: 'Azure Monitor',
        correct: false,
        why: 'Monitor shows telemetry after the fact.',
      },
      {
        id: 'd',
        text: 'You cannot test an agent until it is deployed to production',
        correct: false,
        why: 'Interactive testing before release is a core part of the workflow.',
      },
    ],
    explanation:
      'The playground lets you chat with the agent, inspect tool calls, iterate on instructions, and then take a preconfigured code snippet straight into your development environment.',
    tags: ['agents', 'portal'],
  },
  {
    id: 'fg-026',
    topic: 'foundry-genai-agents',
    moduleId: 'agents',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'hard',
    kind: 'exam',
    prompt: 'What is a Foundry **toolbox**?',
    options: [
      {
        id: 'a',
        text: 'A curated set of tools - web search, file search, code interpreter, MCP servers, custom functions - shared across agents through one managed endpoint with central authentication and versioning',
        correct: true,
      },
      {
        id: 'b',
        text: 'The local SDK package you install to build agents',
        correct: false,
        why: 'That is just the SDK.',
      },
      {
        id: 'c',
        text: 'A folder of sample notebooks',
        correct: false,
        why: 'Samples are documentation, not a platform concept.',
      },
      {
        id: 'd',
        text: 'A UI panel showing an agent\'s recent tool calls',
        correct: false,
        why: 'That is observability/tracing.',
      },
    ],
    explanation:
      'Toolboxes solve the governance problem of tools: define them once, then share them across many agents with consistent authentication, governance and versioning instead of reconfiguring per agent.',
    reference: {
      label: 'Toolbox overview',
      url: 'https://learn.microsoft.com/azure/foundry/agents/concepts/toolbox-overview',
    },
    tags: ['agents', 'toolbox', 'currency', 'hard'],
  },
  {
    id: 'fg-027',
    topic: 'foundry-genai-agents',
    moduleId: 'agents',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'medium',
    kind: 'exam',
    type: 'multi',
    prompt:
      'Which two are genuine advantages of a prompt agent over a hosted agent? (Choose two.)',
    options: [
      { id: 'a', text: 'There is no runtime code to maintain', correct: true },
      { id: 'b', text: 'There is no container compute to manage or pay for', correct: true },
      {
        id: 'c',
        text: 'It can run arbitrary custom orchestration logic you wrote',
        correct: false,
        why: 'That is precisely what hosted agents are for. Prompt agents are declarative.',
      },
      {
        id: 'd',
        text: 'Only prompt agents get a managed endpoint',
        correct: false,
        why: 'Both agent types get a managed endpoint and Foundry-managed autoscaling.',
      },
      {
        id: 'e',
        text: 'Only prompt agents can use Foundry models and platform tools',
        correct: false,
        why: 'Hosted agents reach the same models and tools through the Responses API on the project endpoint.',
      },
    ],
    explanation:
      'Prompt agents trade flexibility for simplicity: no code, no compute, fastest start. Hosted agents cost container compute on top of inference and tool usage, in exchange for running your own logic.',
    reference: {
      label: 'Compare agent types',
      url: 'https://learn.microsoft.com/azure/foundry/agents/overview',
    },
    tags: ['agents', 'prompt-vs-hosted', 'multi-select'],
  },

  /* ---------------- RAG / Foundry IQ ---------------- */
  {
    id: 'fg-030',
    topic: 'foundry-genai-agents',
    moduleId: 'rag-foundry-iq',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'easy',
    kind: 'learn',
    type: 'order',
    prompt: 'Put the stages of a retrieval-augmented generation pipeline in order.',
    items: [
      { id: 'r1', text: 'Ingest source documents' },
      { id: 'r2', text: 'Chunk them into passages' },
      { id: 'r3', text: 'Generate embeddings and build an index' },
      { id: 'r4', text: 'At query time, retrieve the most relevant passages' },
      { id: 'r5', text: 'Add the retrieved passages to the prompt as grounding data' },
      { id: 'r6', text: 'The model generates an answer with citations' },
    ],
    explanation:
      'Everything up to indexing happens ahead of time; retrieval and generation happen per query. The exam mostly tests that you know retrieval happens *before* generation and that grounding data goes into the prompt.',
    tags: ['rag', 'pipeline', 'cram'],
  },
  {
    id: 'fg-031',
    topic: 'foundry-genai-agents',
    moduleId: 'rag-foundry-iq',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'medium',
    kind: 'exam',
    prompt: 'What is Foundry IQ?',
    options: [
      {
        id: 'a',
        text: 'A managed knowledge layer that gives agents a configurable, multi-source knowledge base and returns permission-aware, cited answers using agentic retrieval',
        correct: true,
      },
      {
        id: 'b',
        text: 'A benchmark suite that scores how intelligent a model is',
        correct: false,
        why: 'The name suggests it, but IQ here refers to the knowledge layer, not a model score.',
      },
      {
        id: 'c',
        text: 'A fine-tuning service',
        correct: false,
        why: 'It does not modify models at all.',
      },
      {
        id: 'd',
        text: 'A monitoring dashboard for agents',
        correct: false,
        why: 'That is Foundry Observability.',
      },
    ],
    explanation:
      'A Foundry IQ **knowledge base** is made of **knowledge sources** - Azure Blob Storage, SharePoint, OneLake, public web - plus retrieval parameters. It automates chunking, embedding and metadata extraction, enforces permissions at query time, and returns grounded answers with citations. Multiple agents can share one knowledge base.',
    reference: {
      label: 'What is Foundry IQ?',
      url: 'https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq',
    },
    tags: ['rag', 'foundry-iq', 'currency'],
  },
  {
    id: 'fg-032',
    topic: 'foundry-genai-agents',
    moduleId: 'rag-foundry-iq',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'hard',
    kind: 'exam',
    prompt:
      'How does *agentic retrieval* differ from classic RAG?',
    options: [
      {
        id: 'a',
        text: 'A model decomposes a complex query into several focused subqueries, runs them in parallel, reranks the results, and returns structured grounding data with citations',
        correct: true,
      },
      {
        id: 'b',
        text: 'It skips the index and sends the whole corpus to the model',
        correct: false,
        why: 'No corpus of any size fits in a context window; retrieval is still essential.',
      },
      {
        id: 'c',
        text: 'It replaces embeddings with keyword search only',
        correct: false,
        why: 'It can issue keyword, vector or hybrid queries - it adds capability rather than removing it.',
      },
      {
        id: 'd',
        text: 'It runs the model on the client device',
        correct: false,
        why: 'Nothing about where inference runs changes.',
      },
    ],
    explanation:
      'Classic RAG usually issues one query per question. Agentic retrieval plans: it uses conversation history for context, splits the question into subqueries, executes them in parallel, applies semantic ranking, and returns structured results with citations - better for conversational, multi-part questions. Foundry IQ uses agentic retrieval.',
    reference: {
      label: 'Agentic RAG in Microsoft Foundry',
      url: 'https://learn.microsoft.com/azure/foundry/concepts/retrieval-augmented-generation',
    },
    tags: ['rag', 'agentic-retrieval', 'hard', 'currency'],
  },
  {
    id: 'fg-033',
    topic: 'foundry-genai-agents',
    moduleId: 'rag-foundry-iq',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'medium',
    kind: 'exam',
    prompt:
      'Why is chunking necessary when building a knowledge base for RAG?',
    options: [
      {
        id: 'a',
        text: 'Retrieval and context windows work best on focused passages; whole documents dilute relevance and blow the token budget',
        correct: true,
      },
      {
        id: 'b',
        text: 'Because models cannot read PDF files',
        correct: false,
        why: 'Extraction handles the file format. Chunking is about passage size, not file type.',
      },
      {
        id: 'c',
        text: 'To encrypt the documents',
        correct: false,
        why: 'Chunking has nothing to do with encryption.',
      },
      {
        id: 'd',
        text: 'Because embeddings can only be created from single words',
        correct: false,
        why: 'Embeddings are created from passages of text, not individual words.',
      },
    ],
    explanation:
      'A 90-page handbook embedded as one vector represents everything and therefore nothing. Chunked passages give precise matches and fit comfortably in the prompt. Foundry IQ automates chunking and embedding for indexed knowledge sources.',
    tags: ['rag', 'chunking'],
  },
  {
    id: 'fg-034',
    topic: 'foundry-genai-agents',
    moduleId: 'rag-foundry-iq',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'hard',
    kind: 'exam',
    scenario:
      'A grounded assistant returns an answer that is not supported by any of the retrieved passages.',
    prompt: 'Which two responses address the problem most directly?',
    type: 'multi',
    options: [
      {
        id: 'a',
        text: 'Instruct the model in the system prompt to answer only from the provided context and to say it does not know otherwise',
        correct: true,
      },
      {
        id: 'b',
        text: 'Review chunking and retrieval configuration so the right passages are actually being returned',
        correct: true,
      },
      {
        id: 'c',
        text: 'Increase max_tokens',
        correct: false,
        why: 'A longer answer is not a better-grounded one.',
      },
      {
        id: 'd',
        text: 'Switch to a larger model and change nothing else',
        correct: false,
        why: 'A bigger model still cannot cite what retrieval never gave it.',
      },
      {
        id: 'e',
        text: 'Disable citations so users cannot tell',
        correct: false,
        why: 'That hides the failure and undermines transparency.',
      },
    ],
    explanation:
      'Grounding failures come from two places: the model was not told to stay within the context, or retrieval did not supply the right context. Microsoft\'s own troubleshooting guidance names both - enable citations and use clear system messages, and revisit chunking, embedding quality and search configuration.',
    tags: ['rag', 'hallucination', 'hard', 'multi-select'],
  },
  {
    id: 'fg-035',
    topic: 'foundry-genai-agents',
    moduleId: 'rag-foundry-iq',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'medium',
    kind: 'exam',
    prompt:
      'Which statement about a Foundry IQ knowledge base is correct?',
    options: [
      {
        id: 'a',
        text: 'One knowledge base can be shared by multiple agents',
        correct: true,
      },
      {
        id: 'b',
        text: 'Each agent must have its own dedicated knowledge base',
        correct: false,
        why: 'Sharing one knowledge base across agents is an explicit capability - it is the point of a managed knowledge *layer*.',
      },
      {
        id: 'c',
        text: 'A knowledge base can only connect to a single data source',
        correct: false,
        why: 'A knowledge base is deliberately multi-source: Blob Storage, SharePoint, OneLake and public web can all be knowledge sources in the same base.',
      },
      {
        id: 'd',
        text: 'Knowledge bases cannot return citations',
        correct: false,
        why: 'Returning extractive data with citations so answers can be traced to source documents is one of its headline capabilities.',
      },
    ],
    explanation:
      'Knowledge base = knowledge sources + retrieval parameters, shareable across agents, permission-aware, citation-returning.',
    reference: {
      label: 'What is Foundry IQ?',
      url: 'https://learn.microsoft.com/azure/foundry/agents/concepts/what-is-foundry-iq',
    },
    tags: ['rag', 'foundry-iq'],
  },
  {
    id: 'fg-036',
    topic: 'foundry-genai-agents',
    moduleId: 'rag-foundry-iq',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'medium',
    kind: 'exam',
    prompt: 'What is a vector index used for in a RAG solution?',
    options: [
      {
        id: 'a',
        text: 'Finding passages whose meaning is close to the query, even when they share no keywords',
        correct: true,
      },
      {
        id: 'b',
        text: 'Storing the model\'s weights',
        correct: false,
        why: 'Weights live in the model, not in your search index.',
      },
      {
        id: 'c',
        text: 'Caching previous answers',
        correct: false,
        why: 'That would be a response cache - a different thing entirely.',
      },
      {
        id: 'd',
        text: 'Compressing documents to save storage',
        correct: false,
        why: 'Embeddings are not a storage optimisation; the original text is still needed to build the prompt.',
      },
    ],
    explanation:
      'Vector search matches on semantics rather than exact words, so "how much holiday do I get" retrieves a passage titled "Annual leave entitlement". Hybrid search combines vector and keyword matching for the best of both.',
    tags: ['rag', 'vector-search'],
  },
  {
    id: 'fg-037',
    topic: 'foundry-genai-agents',
    moduleId: 'agents',
    objective: 'Create a lightweight client application for an agent',
    difficulty: 'hard',
    kind: 'exam',
    prompt:
      'A sample from an older tutorial calls `create_thread()`, `create_message()` and `create_and_process_run()` against a connection string. What should you know about this for the current exam?',
    options: [
      {
        id: 'a',
        text: 'It reflects the earlier Assistants-style agent API; current Foundry samples use a project endpoint, agent versions, and conversations with the Responses API',
        correct: true,
      },
      {
        id: 'b',
        text: 'It is the current recommended pattern for all new agent clients',
        correct: false,
        why: 'It is the older pattern. Current quickstarts set `PROJECT_ENDPOINT`, create agent versions, and use conversations plus responses.',
      },
      {
        id: 'c',
        text: 'Threads and runs are concepts from Azure Machine Learning pipelines',
        correct: false,
        why: 'They came from the Assistants API, not Azure ML.',
      },
      {
        id: 'd',
        text: 'Connection strings are the only supported authentication method',
        correct: false,
        why: 'Microsoft Entra credentials against a project endpoint are the current recommendation.',
      },
    ],
    explanation:
      'You are unlikely to be asked to write this code from memory, but you may be asked to recognise the current shape. Modern flow: `AIProjectClient(endpoint, credential)` → `agents.create_version(...)` with a `PromptAgentDefinition` → `conversations.create()` → `responses.create()`.',
    reference: {
      label: 'Quickstart: Create a prompt agent',
      url: 'https://learn.microsoft.com/azure/foundry/agents/quickstarts/prompt-agent',
    },
    tags: ['agents', 'sdk', 'currency', 'hard'],
  },
  {
    id: 'fg-038',
    topic: 'foundry-genai-agents',
    moduleId: 'foundry-platform',
    objective: 'Deploy a model and interact with it in the Foundry portal',
    difficulty: 'medium',
    kind: 'exam',
    prompt:
      'A team wants to try a supported model immediately without creating a deployment. What does Foundry offer?',
    options: [
      {
        id: 'a',
        text: 'Instant access (preview), which lets you call supported models by name with no Serverless API or managed compute deployment',
        correct: true,
      },
      {
        id: 'b',
        text: 'Nothing - a deployment is always required first',
        correct: false,
        why: 'This used to be true and is a good example of stale study material.',
      },
      {
        id: 'c',
        text: 'You must download the model weights locally',
        correct: false,
        why: 'Not an option for hosted models.',
      },
      {
        id: 'd',
        text: 'You must open a support ticket for temporary access',
        correct: false,
        why: 'No ticket is involved.',
      },
    ],
    explanation:
      'Instant access (preview) removes the deployment step for trying supported models. Note it is a preview feature - the exam concentrates on GA behaviour but may include commonly used preview features.',
    reference: {
      label: 'Deployment overview for Microsoft Foundry Models',
      url: 'https://learn.microsoft.com/azure/foundry/concepts/deployments-overview',
    },
    tags: ['foundry', 'deployment', 'currency'],
  },
  {
    id: 'fg-039',
    topic: 'foundry-genai-agents',
    moduleId: 'agents',
    objective: 'Create and test a single-agent solution in the Foundry portal',
    difficulty: 'easy',
    kind: 'learn',
    prompt:
      'What distinguishes an AI agent from a plain chat completion call?',
    options: [
      {
        id: 'a',
        text: 'The agent pursues a goal over multiple steps and can invoke tools to act, rather than returning a single response',
        correct: true,
      },
      {
        id: 'b',
        text: 'The agent always uses a larger model',
        correct: false,
        why: 'Model size is unrelated; agents can and often do run on small models.',
      },
      {
        id: 'c',
        text: 'The agent runs on the client rather than in the cloud',
        correct: false,
        why: 'Foundry agents run in Agent Service.',
      },
      {
        id: 'd',
        text: 'The agent never uses a system prompt',
        correct: false,
        why: 'An agent\'s instructions play exactly that role.',
      },
    ],
    explanation:
      'Chat completion: one prompt, one answer. Agent: a goal, a loop of reasoning and tool calls, and a result. Tools are what make the difference.',
    tags: ['agents', 'definition'],
  },
  {
    id: 'fg-040',
    topic: 'foundry-genai-agents',
    moduleId: 'prompts-and-chat',
    objective: 'Create effective system and user prompts for generative AI models',
    difficulty: 'medium',
    kind: 'exam',
    prompt:
      'Which prompting technique most improves a model\'s performance on a multi-step arithmetic or logic problem?',
    options: [
      { id: 'a', text: 'Chain-of-thought - ask the model to reason step by step', correct: true },
      {
        id: 'b',
        text: 'Raising temperature so it explores more possibilities',
        correct: false,
        why: 'More randomness on a problem with one right answer makes things worse.',
      },
      {
        id: 'c',
        text: 'Shortening the prompt to save tokens',
        correct: false,
        why: 'Removing the information needed to reason does not help.',
      },
      {
        id: 'd',
        text: 'Setting a stop sequence',
        correct: false,
        why: 'Stop sequences control where output ends, not how the model reasons.',
      },
    ],
    explanation:
      'Asking for intermediate steps gives the model room to work the problem out in tokens rather than leaping to an answer. For exact arithmetic, better still: give the agent a code interpreter tool.',
    tags: ['prompts', 'chain-of-thought'],
  },
];
