import type { Module } from '../types';

export const foundryPlatform: Module = {
  id: 'foundry-platform',
  order: 5,
  title: 'The Microsoft Foundry platform',
  summary:
    'Resources, projects, the portal and Foundry Tools. This is where most outdated study material goes wrong - the hub model is now "classic".',
  topic: 'foundry-genai-agents',
  minutes: 15,
  priority: 'high',
  icon: '🏗️',
  outcomes: [
    'Explain the Foundry resource → project relationship',
    'Recognise hub-based material as the classic model',
    'Name what lives in the Foundry portal and what Foundry Tools are',
  ],
  quiz: ['fg-010', 'fg-011', 'fg-013', 'fg-038'],
  sections: [
    {
      id: 'what',
      title: 'What Microsoft Foundry is',
      blocks: [
        {
          t: 'p',
          md: 'Microsoft Foundry unifies **agents, models and tools** under one management grouping, with enterprise features built in - role-based access control, networking, policy, tracing, monitoring and evaluations under a single Azure resource provider namespace. The portal is at [ai.azure.com](https://ai.azure.com).',
        },
        {
          t: 'table',
          headers: ['You can build…', 'Using…'],
          rows: [
            ['Agents', 'Declarative **prompt agents**, or code-based **hosted agents**'],
            ['Model-powered apps', 'Models from the catalog, deployed or via instant access'],
            ['Grounded answers', 'Toolboxes, knowledge and retrieval - including Foundry IQ'],
          ],
        },
      ],
    },
    {
      id: 'resource-project',
      title: 'Resource and project',
      blocks: [
        {
          t: 'steps',
          title: 'The hierarchy, top down',
          steps: [
            {
              label: 'Azure subscription',
              detail: 'Billing and identity boundary, as with any Azure workload.',
            },
            {
              label: 'Foundry resource',
              detail:
                'The Azure resource that scopes design, deployment, governance and runtime access. Admins set security, networking, connectivity and policy here, once. It is the default resource type for projects built in the Foundry portal.',
            },
            {
              label: 'Foundry project',
              detail:
                'A child resource of the Foundry resource. Developers create projects as folders to organise their work - model deployments, agents, evaluations, data. Projects inherit the parent\'s settings by default, and can have their own RBAC.',
            },
          ],
        },
        {
          t: 'key',
          title: 'The distinction that gets tested',
          body: 'Security, networking, governance and connectivity are configured **at the resource level** and inherited. Individual deployments, agents and experiments live **in the project**. The design goal is to take IT admins out of the day-to-day loop.',
          priority: 'high',
        },
        { t: 'check', qid: 'fg-010' },
      ],
    },
    {
      id: 'hubs',
      title: 'Hubs are now the classic model',
      blocks: [
        {
          t: 'changed',
          title: 'This is the biggest currency trap on the exam',
          body: 'Older material says you must create an **AI hub** - with its own Azure Storage account, Key Vault and container registry - before you can create a project. Microsoft has moved most hub capabilities under the **Foundry resource** type. Hub-based projects are now accessible in the **Foundry (classic)** portal, and new investment is in Foundry projects.',
        },
        {
          t: 'list',
          items: [
            '**Foundry projects do not require an AI hub.** Serverless API deployments explicitly do not need one.',
            'Hubs still exist for **selected use cases** - notably open-source model hosting, fine-tuning of those models, and Azure Machine Learning capabilities.',
            'Under the covers: a Foundry resource is `Microsoft.CognitiveServices/account` of kind `AIServices`; a Foundry project is a **subresource** of it.',
            'A hub is `Microsoft.MachineLearningServices/workspace` of kind `hub` - a different resource provider entirely.',
          ],
        },
        { t: 'check', qid: 'fg-011' },
      ],
    },
    {
      id: 'tools',
      title: 'Foundry Tools',
      blocks: [
        {
          t: 'p',
          md: '**Foundry Tools** are the first-party Azure AI capabilities available alongside models. The Foundry resource itself supports agents, evaluations, Azure OpenAI, Speech, Vision, Language and Content Understanding.',
        },
        {
          t: 'table',
          headers: ['Current name', 'Older name you may see', 'Use it for'],
          rows: [
            ['Azure **Language** in Foundry Tools', 'Text Analytics / Cognitive Services Language', 'Sentiment, key phrases, NER, PII, summarization, CLU'],
            ['Azure **Speech** in Foundry Tools', 'Speech Services', 'Speech to text, text to speech, translation'],
            ['Azure **Vision** in Foundry Tools', 'Computer Vision', 'Image analysis, OCR, Face (with limits)'],
            ['Azure **Content Understanding** in Foundry Tools', '(new - no AI-900 equivalent)', 'Multimodal extraction across documents, images, audio, video'],
          ],
        },
        { t: 'check', qid: 'fg-013' },
      ],
    },
    {
      id: 'portal',
      title: 'Getting something running in the portal',
      blocks: [
        {
          t: 'steps',
          title: 'Deploy and try a model',
          steps: [
            { label: 'Open your project', detail: 'Sign in to the Foundry portal and select or create a project.' },
            { label: 'Browse the model catalog', detail: 'Filter by capability, modality or provider to find a model that fits.' },
            { label: 'Create a deployment', detail: 'Choose the deployment type - Global Standard is the usual default - and name the deployment. The name is what your code will reference.' },
            { label: 'Test in the playground', detail: 'Chat with the deployment, iterate on the system prompt, and check the behaviour before writing any code.' },
            { label: 'Wire it into your app', detail: 'Copy the project endpoint and deployment name. The playground can also hand you a preconfigured code snippet.' },
          ],
        },
        { t: 'check', qid: 'fg-038' },
      ],
    },
  ],
};
