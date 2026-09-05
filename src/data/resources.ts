export interface OfficialResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'exam' | 'portals' | 'services' | 'responsible-ai' | 'labs' | 'community';
  badge: string;
  featured?: boolean;
  relatedTopicId?: string;
  tags: string[];
}

export interface ResourceCategory {
  id: OfficialResource['category'];
  title: string;
  icon: string;
  description: string;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: 'exam',
    title: 'Exam & Certification',
    icon: '🎓',
    description: 'Official study guides, practice assessments, test sandbox, and certification policies.',
  },
  {
    id: 'portals',
    title: 'Foundry & Portals',
    icon: '🛠️',
    description: 'Cloud portals for model deployment, agent creation, prompt engineering, and resource setup.',
  },
  {
    id: 'services',
    title: 'Azure AI Services Docs',
    icon: '📚',
    description: 'Official documentation for Language, Speech, Vision, Content Understanding, and OpenAI.',
  },
  {
    id: 'responsible-ai',
    title: 'Responsible AI & Safety',
    icon: '⚖️',
    description: 'Microsoft Responsible AI Standard, 6 principles, Content Safety, and evaluation tools.',
  },
  {
    id: 'labs',
    title: 'GitHub Labs & SDKs',
    icon: '💻',
    description: 'Official Microsoft Learning repositories, Python SDK references, and sample projects.',
  },
  {
    id: 'community',
    title: 'Community & Media',
    icon: '🤝',
    description: 'Microsoft Q&A, Azure AI Tech Community forums, and official video shows.',
  },
];

export const OFFICIAL_RESOURCES: OfficialResource[] = [
  // --- 1. Exam & Certification Essentials ---
  {
    id: 'study-guide',
    title: 'Official Study Guide for Exam AI-901',
    description:
      'The definitive source of truth for the exam. Lists every skill measured as of April 15, 2026, audience profile, and passing criteria.',
    url: 'https://learn.microsoft.com/credentials/certifications/resources/study-guides/ai-901',
    category: 'exam',
    badge: 'Study Guide',
    featured: true,
    tags: ['skills measured', 'syllabus', 'exam scope', 'requirements'],
  },
  {
    id: 'exam-page',
    title: 'Exam AI-901: Microsoft Azure AI Fundamentals',
    description:
      'Official Microsoft certification overview page. Schedule your exam via Pearson VUE, view exam languages, and see prerequisites.',
    url: 'https://learn.microsoft.com/credentials/certifications/exams/ai-901/',
    category: 'exam',
    badge: 'Certification Page',
    featured: true,
    tags: ['schedule', 'pearson vue', 'cost', 'registration'],
  },
  {
    id: 'practice-assessment',
    title: 'Official Practice Assessment (AI Skills Navigator)',
    description:
      'Free, official 50-question practice assessment on Microsoft AI Skills Navigator to test your readiness before the real exam.',
    url: 'https://aiskillsnavigator.microsoft.com/credentials/cert-83587e0a0754cfee561ade3e27d9fa1cdaf15ae03be52d2413b2b858d1b4eda4',
    category: 'exam',
    badge: 'Free Practice Test',
    featured: true,
    tags: ['free assessment', 'practice questions', 'skills navigator', 'mock test'],
  },
  {
    id: 'exam-sandbox',
    title: 'Microsoft Exam Sandbox (Demo UI)',
    description:
      'Experience the exact exam screen layout, question palettes, timer interface, and item types prior to exam day.',
    url: 'https://aka.ms/examdemo',
    category: 'exam',
    badge: 'Interactive Sandbox',
    featured: true,
    tags: ['sandbox', 'demo', 'exam ui', 'item types'],
  },
  {
    id: 'course-ai901t00',
    title: 'Course AI-901T00: Microsoft Azure AI Fundamentals',
    description:
      'Official instructor-led course syllabus and self-paced learning paths aligning with the AI-901 domains.',
    url: 'https://learn.microsoft.com/training/courses/ai-901t00',
    category: 'exam',
    badge: 'Official Course',
    tags: ['training', 'curriculum', 'learning paths', 'modules'],
  },
  {
    id: 'scoring-reports',
    title: 'Exam Scoring and Score Reports',
    description:
      'Official explanation of how Microsoft scaled scores (passing mark: 700 / 1000) and section bars are calculated.',
    url: 'https://learn.microsoft.com/credentials/certifications/exam-scoring-reports',
    category: 'exam',
    badge: 'Scoring Policy',
    tags: ['passing score', '700', 'score report', 'scaled score'],
  },
  {
    id: 'exam-accommodations',
    title: 'Request Exam Accommodations',
    description:
      'Official process to request additional time, assistive equipment, or testing accommodations for Microsoft exams.',
    url: 'https://learn.microsoft.com/credentials/certifications/request-accommodations',
    category: 'exam',
    badge: 'Accessibility',
    tags: ['accommodations', 'extra time', 'assistive technology'],
  },
  {
    id: 'certification-renewal',
    title: 'Microsoft Certification Renewal',
    description:
      'Overview of credential maintenance and how Microsoft certifications are kept active and verified on Microsoft Learn.',
    url: 'https://learn.microsoft.com/credentials/certifications/renew-your-microsoft-certification',
    category: 'exam',
    badge: 'Credential Life',
    tags: ['renewal', 'expiry', 'verification', 'badge'],
  },

  // --- 2. Azure AI Foundry & Cloud Portals ---
  {
    id: 'foundry-portal',
    title: 'Azure AI Foundry Portal',
    description:
      'The central portal (ai.azure.com) to discover models, test prompts in chat/completions playgrounds, configure agents, and evaluate outputs.',
    url: 'https://ai.azure.com',
    category: 'portals',
    badge: 'Primary Portal',
    featured: true,
    relatedTopicId: 'foundry-platform',
    tags: ['ai.azure.com', 'model catalog', 'playgrounds', 'prompt engineering'],
  },
  {
    id: 'azure-portal',
    title: 'Azure Management Portal',
    description:
      'The Azure resource portal (portal.azure.com) to provision multi-service AI resources, manage subscription limits, and retrieve API keys.',
    url: 'https://portal.azure.com',
    category: 'portals',
    badge: 'Cloud Portal',
    tags: ['portal.azure.com', 'keys', 'endpoints', 'resource groups', 'pricing tier'],
  },
  {
    id: 'foundry-docs',
    title: 'Azure AI Foundry Documentation',
    description:
      'Official guide to Microsoft Foundry: projects, hubs, compute connections, model fine-tuning, and deployment options.',
    url: 'https://learn.microsoft.com/azure/ai-studio/',
    category: 'portals',
    badge: 'Documentation',
    featured: true,
    relatedTopicId: 'foundry-platform',
    tags: ['projects', 'hubs', 'deployments', 'serverless api', 'managed compute'],
  },
  {
    id: 'model-catalog',
    title: 'Azure AI Model Catalog Guide',
    description:
      'Official documentation on browsing, benchmarking, and deploying foundation models (OpenAI, Meta Llama, Mistral, Microsoft Phi).',
    url: 'https://learn.microsoft.com/azure/ai-studio/how-to/model-catalog-overview',
    category: 'portals',
    badge: 'Model Catalog',
    relatedTopicId: 'model-components',
    tags: ['phi-3', 'phi-4', 'gpt-4o', 'llama', 'mistral', 'serverless'],
  },

  // --- 3. Core Azure AI Services Documentation ---
  {
    id: 'doc-language',
    title: 'Azure AI Language Documentation',
    description:
      'Guides and API reference for sentiment analysis, key phrase extraction, named entity recognition (NER), PII detection, and text summarization.',
    url: 'https://learn.microsoft.com/azure/ai-services/language-service/',
    category: 'services',
    badge: 'NLP Documentation',
    featured: true,
    relatedTopicId: 'text-speech',
    tags: ['sentiment', 'key phrases', 'ner', 'pii', 'summarization'],
  },
  {
    id: 'doc-speech',
    title: 'Azure AI Speech Documentation',
    description:
      'Documentation for real-time speech-to-text, neural text-to-speech synthesis, custom neural voice, speech translation, and speaker recognition.',
    url: 'https://learn.microsoft.com/azure/ai-services/speech-service/',
    category: 'services',
    badge: 'Audio Documentation',
    relatedTopicId: 'text-speech',
    tags: ['speech to text', 'text to speech', 'neural voice', 'translation', 'ssml'],
  },
  {
    id: 'doc-vision',
    title: 'Azure AI Vision Documentation',
    description:
      'Guides for computer vision: image analysis, optical character recognition (OCR), visual question answering, object detection, and Florence foundation models.',
    url: 'https://learn.microsoft.com/azure/ai-services/computer-vision/',
    category: 'services',
    badge: 'Vision Documentation',
    featured: true,
    relatedTopicId: 'vision',
    tags: ['ocr', 'image analysis', 'object detection', 'florence', 'tagging', 'smart crop'],
  },
  {
    id: 'doc-content-understanding',
    title: 'Azure Content Understanding Documentation',
    description:
      'The modern multi-modal information extraction service in Foundry Tools for extracting structured intelligence from documents, images, audio, and video.',
    url: 'https://learn.microsoft.com/azure/ai-services/content-understanding/',
    category: 'services',
    badge: 'Extraction Documentation',
    featured: true,
    relatedTopicId: 'information-extraction',
    tags: ['multimodal extraction', 'analyzers', 'video extraction', 'audio transcription', 'forms'],
  },
  {
    id: 'doc-doc-intelligence',
    title: 'Azure AI Document Intelligence Documentation',
    description:
      'Formerly Form Recognizer. Extract text, tables, document structure, key-value pairs, and prebuilt data (invoices, receipts, identity documents).',
    url: 'https://learn.microsoft.com/azure/ai-services/document-intelligence/',
    category: 'services',
    badge: 'Doc Intelligence',
    relatedTopicId: 'information-extraction',
    tags: ['form recognizer', 'invoices', 'receipts', 'id documents', 'layout model'],
  },
  {
    id: 'doc-openai',
    title: 'Azure OpenAI Service Documentation',
    description:
      'Official documentation on deploying and prompting OpenAI models (GPT-4o, embeddings, DALL-E 3) with enterprise security and private networking.',
    url: 'https://learn.microsoft.com/azure/ai-services/openai/',
    category: 'services',
    badge: 'Generative AI',
    relatedTopicId: 'genai-agents',
    tags: ['gpt-4o', 'dall-e 3', 'embeddings', 'tokens', 'parameters', 'temperature'],
  },
  {
    id: 'doc-ai-search',
    title: 'Azure AI Search (Foundry IQ & RAG)',
    description:
      'Documentation for search indexes, vector storage, hybrid search, semantic ranking, and building Retrieval-Augmented Generation pipelines.',
    url: 'https://learn.microsoft.com/azure/search/',
    category: 'services',
    badge: 'Search & RAG',
    relatedTopicId: 'rag-foundry-iq',
    tags: ['vector search', 'hybrid search', 'rag', 'semantic ranker', 'chunking', 'indexes'],
  },

  // --- 4. Responsible AI & Safety ---
  {
    id: 'rai-standard',
    title: 'Microsoft Responsible AI Standard (v2)',
    description:
      'Microsoft\u2019s internal framework and requirements for building ethical AI systems across fairness, reliability, privacy, inclusiveness, transparency, and accountability.',
    url: 'https://www.microsoft.com/ai/responsible-ai',
    category: 'responsible-ai',
    badge: 'Standard & Policy',
    featured: true,
    relatedTopicId: 'responsible-ai',
    tags: ['6 principles', 'fairness', 'transparency', 'accountability', 'inclusiveness', 'safety'],
  },
  {
    id: 'content-safety-docs',
    title: 'Azure AI Content Safety Documentation',
    description:
      'Documentation for scanning and filtering text and images for harm categories (hate, sexual, violence, self-harm), severity scores (0-7), and Prompt Shields.',
    url: 'https://learn.microsoft.com/azure/ai-services/content-safety/',
    category: 'responsible-ai',
    badge: 'Safety Service',
    featured: true,
    relatedTopicId: 'responsible-ai',
    tags: ['prompt shields', 'jailbreaks', 'harm categories', 'severity levels', 'filters'],
  },
  {
    id: 'fairlearn-tool',
    title: 'Fairlearn Open-Source Project',
    description:
      'Open-source toolkit supported by Microsoft to assess and mitigate unfairness and algorithmic disparity in machine learning models.',
    url: 'https://fairlearn.org',
    category: 'responsible-ai',
    badge: 'Open Source Toolkit',
    relatedTopicId: 'responsible-ai',
    tags: ['fairness', 'demographic parity', 'bias mitigation', 'metrics'],
  },
  {
    id: 'interpret-ml',
    title: 'InterpretML Open-Source Project',
    description:
      'Explainable AI toolkit by Microsoft Research providing Glassbox interpretable models (Explainable Boosting Machines) and blackbox explainer methods.',
    url: 'https://interpret.ml',
    category: 'responsible-ai',
    badge: 'Open Source Toolkit',
    relatedTopicId: 'responsible-ai',
    tags: ['transparency', 'explainability', 'feature importance', 'ebm', 'shap'],
  },
  {
    id: 'hax-toolkit',
    title: 'HAX Toolkit: Guidelines for Human-AI Interaction',
    description:
      '18 guidelines and design patterns created by Microsoft Research for intuitive, trustworthy, and transparent user interactions with AI.',
    url: 'https://www.microsoft.com/research/project/guidelines-for-human-ai-interaction/',
    category: 'responsible-ai',
    badge: 'UX Guidelines',
    relatedTopicId: 'responsible-ai',
    tags: ['human-ai interaction', 'ux design', 'user expectations', 'feedback loops'],
  },

  // --- 5. GitHub Labs & SDKs ---
  {
    id: 'ms-learning-github',
    title: 'Microsoft Learning Official GitHub Organization',
    description:
      'Official repository host for all Microsoft Certified exam labs, hands-on instructions, sample code, and lab datasets.',
    url: 'https://github.com/MicrosoftLearning',
    category: 'labs',
    badge: 'Official GitHub',
    featured: true,
    tags: ['hands-on labs', 'exercises', 'code walkthroughs', 'github'],
  },
  {
    id: 'azure-sdk-python',
    title: 'Azure SDK for Python Reference',
    description:
      'Official Python SDK documentation covering `azure-ai-projects`, `azure-ai-inference`, `azure-ai-textanalytics`, `azure-cognitiveservices-speech`, and more.',
    url: 'https://learn.microsoft.com/python/api/overview/azure/ai',
    category: 'labs',
    badge: 'Python SDK',
    featured: true,
    tags: ['python', 'pip', 'azure-ai-projects', 'sdk reference', 'client library'],
  },
  {
    id: 'azure-ai-samples',
    title: 'Azure AI Official Code Samples',
    description:
      'Comprehensive GitHub repository containing quickstarts, end-to-end RAG implementations, agent samples, and multimodal app code.',
    url: 'https://github.com/Azure-Samples/azure-ai-samples',
    category: 'labs',
    badge: 'Code Samples',
    tags: ['sample apps', 'agent templates', 'rag code', 'github samples'],
  },

  // --- 6. Community & Media ---
  {
    id: 'ms-qa-ai',
    title: 'Microsoft Q&A: Artificial Intelligence & Machine Learning',
    description:
      'Official technical discussion forum where Microsoft engineers, MVPs, and developers answer questions about Azure AI and exams.',
    url: 'https://learn.microsoft.com/answers/topics/azure-cognitive-services.html',
    category: 'community',
    badge: 'Official Forum',
    tags: ['questions', 'support', 'q&a', 'troubleshooting'],
  },
  {
    id: 'tech-community-ai',
    title: 'Microsoft Tech Community AI Hub',
    description:
      'Official engineering blogs, product announcements, best practices, and expert articles from the Azure AI product teams.',
    url: 'https://techcommunity.microsoft.com/t5/artificial-intelligence-and/ct-p/AI',
    category: 'community',
    badge: 'Engineering Blog',
    tags: ['blog', 'announcements', 'product team', 'articles'],
  },
  {
    id: 'ai-show',
    title: 'The AI Show on Microsoft Learn',
    description:
      'Official video show hosted by Microsoft researchers and product teams demonstrating new Azure AI features, models, and real-world apps.',
    url: 'https://learn.microsoft.com/shows/ai-show/',
    category: 'community',
    badge: 'Official Video Series',
    tags: ['videos', 'demos', 'tutorials', 'walkthroughs'],
  },
];
