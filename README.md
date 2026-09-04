# Learn AI-901: Microsoft Azure AI Fundamentals

This repository contains comprehensive study notes, conceptual deep-dives, architectural diagrams, and hands-on code examples for the **AI-901: Microsoft Azure AI Fundamentals** certification exam.

Exam **AI-901** is Microsoft's updated foundational certification, replacing the retired AI-900 exam. AI-901 places a major emphasis on **Microsoft Foundry**, **Generative AI**, **AI Agents**, **Foundry IQ (RAG)**, **Azure Content Understanding**, and **hands-on Python SDK client implementations**.

---

## Table of Contents

- [Learn AI-901: Microsoft Azure AI Fundamentals](#learn-ai-901-microsoft-azure-ai-fundamentals)
  - [Table of Contents](#table-of-contents)
  - [Exam Summary](#exam-summary)
  - [What Changed: AI-900 vs. AI-901](#what-changed-ai-900-vs-ai-901)
  - [Course Curriculum & Modules](#course-curriculum--modules)
  - [Skills Measured (as of April 15, 2026)](#skills-measured-as-of-april-15-2026)
    - [1. Identify AI concepts and capabilities (40–45%)](#1-identify-ai-concepts-and-capabilities-4045)
    - [2. Implement AI solutions by using Microsoft Foundry (55–60%)](#2-implement-ai-solutions-by-using-microsoft-foundry-5560)
  - [Official Microsoft Learn Resources](#official-microsoft-learn-resources)

---

## Exam Summary

| Attribute | Details |
| :--- | :--- |
| **Exam Code** | AI-901 |
| **Exam Title** | Microsoft Azure AI Fundamentals |
| **Credential Earned** | Microsoft Certified: Azure AI Fundamentals |
| **Passing Score** | 700 / 1000 |
| **Question Count** | 40–60 questions (Multiple choice, multi-select, drag-and-drop, case scenarios) |
| **Target Audience** | Aspiring AI developers, engineers, and technology professionals beginning their career in AI solution development |
| **Technical Prerequisites** | Foundational understanding of AI concepts, Azure cloud resources, and **Python coding syntax** (REST APIs, SDKs, CLIs) |

---

## What Changed: AI-900 vs. AI-901

| Dimension | AI-900 (Retired) | AI-901 (Current) |
| :--- | :--- | :--- |
| **Core Architecture** | Fragmented across individual Azure Cognitive Services & Azure Machine Learning Studio | Unified under **Microsoft Foundry** (portal, hub, project, tools, and agent service) |
| **Machine Learning Focus** | Classical ML (Supervised/Unsupervised, Regression/Classification/Clustering algorithms, AutoML, Azure ML Designer) | Foundations of Generative AI, LLMs/SLMs, transformer architecture, tokenization, embeddings, and model configuration parameters |
| **Agents & Automation** | Basic mention of Azure Bot Service / conversational AI | Deep focus on **AI Agents** (Model + Instructions + Tools), single-agent creation in Foundry, and agent client SDKs |
| **Knowledge & RAG** | Azure AI Search standalone overview | **Retrieval-Augmented Generation (RAG)** & **Microsoft Foundry IQ** for permission-aware, grounded agent responses |
| **Information Extraction** | Form Recognizer / Document Intelligence standalone | **Azure Content Understanding** in Foundry Tools across documents, images, audio, and video |
| **Implementation / Code** | Conceptual only; no coding syntax tested | **55–60% practical Foundry implementation**, including lightweight Python client applications using Foundry SDK & REST APIs |

---

## Course Curriculum & Modules

This repository is organized into 7 modular learning guides that reflect the official Microsoft Learn curriculum for Course **AI-901T00**:

1. [**01 - AI Overview, Responsible AI & Microsoft Foundry**](./01-ai-overview.md)
   - Core AI concepts and workloads (Generative AI, Agents, NLP, Speech, Vision, Information Extraction)
   - Foundational machine learning principles (features, labels, training vs. inference)
   - Deep learning & Transformer architecture (Self-Attention, Encoders/Decoders)
   - Guiding principles of Responsible AI (Fairness, Reliability & Safety, Privacy & Security, Inclusiveness, Transparency, Accountability)
   - Microsoft Foundry architecture: Hubs, Projects, Resources, Model Catalog, and Foundry Tools

2. [**02 - Generative AI Models, Prompt Engineering & AI Agents**](./02-generative-ai-and-agents.md)
   - How generative AI models work (LLMs vs. SLMs, tokenization, embeddings, prediction)
   - Model selection in the Foundry Model Catalog based on capabilities
   - Deployment options (Serverless API vs. Managed Compute / PTU) and parameters (`temperature`, `top_p`, `max_tokens`, penalties)
   - Prompt engineering best practices (System prompts, User prompts, Few-shot prompting)
   - AI Agent architecture (Model, Instructions, Tools)
   - Creating single-agent solutions in the Foundry Portal
   - Lightweight Python client applications with the Foundry SDK (`azure-ai-projects` / Chat & Agent APIs)

3. [**03 - Natural Language Processing & Text Analysis**](./03-natural-language-processing.md)
   - NLP concepts and semantic modeling
   - Common text analysis techniques: Key phrase extraction, Named Entity Recognition (NER), Sentiment analysis, Summarization
   - Azure AI Language in Foundry Tools
   - Building a lightweight Python text analysis client application

4. [**04 - Speech Recognition, Speech Synthesis & Multimodal Voice**](./04-speech.md)
   - Fundamentals of Speech Processing: Acoustic signals, phonemes, audio sampling
   - Speech Recognition (Speech-to-Text / ASR) and Speech Synthesis (Text-to-Speech / TTS)
   - Responding to spoken prompts using deployed multimodal models
   - Azure Speech in Foundry Tools
   - Building a lightweight Python speech application

5. [**05 - Computer Vision, Multimodal Vision & Image/Video Generation**](./05-computer-vision.md)
   - Computer vision core tasks: Image classification, Object detection, Segmentation, OCR, Face analysis
   - Interpreting visual input in prompts with multimodal models
   - Generative image and video models (Diffusion models, DALL-E)
   - Building a lightweight Python vision application

6. [**06 - Information Extraction & Azure Content Understanding**](./06-information-extraction.md)
   - The information extraction lifecycle: Source identification, extraction, structuring, integration
   - Azure AI Document Intelligence in Foundry Tools (prebuilt vs. custom models)
   - Azure Content Understanding: Multimodal extraction across documents, forms, images, audio, and video
   - Defining custom schemas and analyzers
   - Building a lightweight Python information extraction application

7. [**07 - Retrieval-Augmented Generation (RAG) & Microsoft Foundry IQ**](./07-rag-and-foundry-iq.md)
   - RAG architecture: Ingestion, Chunking, Vector Embeddings, Indexing, Vector Search, Augmented Generation
   - Microsoft Foundry IQ: Managed knowledge retrieval layer
   - Grounding AI agents with enterprise data and citation-backed responses
   - Connecting Foundry IQ knowledge bases to AI agents and Python client applications

---

## Skills Measured (as of April 15, 2026)

### 1. Identify AI concepts and capabilities (40–45%)

- **Describe principles of responsible AI**
  - Describe considerations for fairness in an AI solution
  - Describe considerations for reliability and safety in an AI solution
  - Describe considerations for privacy and security in an AI solution
  - Describe considerations for inclusiveness in an AI solution
  - Describe considerations for transparency in an AI solution
  - Describe considerations for accountability in an AI solution
- **Identify AI model components and configurations**
  - Describe how generative AI models work
  - Identify an appropriate AI model, based on capabilities
  - Identify appropriate model deployment options and configuration parameters
- **Identify AI workloads**
  - Identify scenarios for common AI workloads, including generative and agentic AI, text analysis, speech, computer vision, and information extraction
  - Describe common text analysis techniques, including keyword extraction, entity detection, sentiment analysis, and summarization
  - Identify features and capabilities of speech recognition and speech synthesis
  - Identify features and capabilities of computer vision and image-generation models
  - Identify techniques to extract information from text, images, audio, and videos

### 2. Implement AI solutions by using Microsoft Foundry (55–60%)

- **Implement generative AI apps and agents by using Foundry**
  - Create effective system and user prompts for generative AI models
  - Deploy a model and interact with it in the Foundry portal
  - Create a lightweight chat client application by using the Foundry SDK
  - Create and test a single-agent solution in the Foundry portal
  - Create a lightweight client application for an agent
- **Implement AI solutions for text and speech by using Foundry**
  - Build a lightweight application that includes text analysis
  - Respond to spoken prompts by using a deployed multimodal model
  - Build a lightweight application by using Azure Speech in Foundry Tools
- **Implement AI solutions with computer vision and image-generation capabilities by using Foundry**
  - Interpret visual input in prompts by using a deployed multimodal model
  - Create new visual outputs by using generative models
  - Build a lightweight application that includes vision capabilities
- **Implement AI solutions for information extraction by using Foundry**
  - Extract information from documents and forms by using Azure Content Understanding in Foundry Tools
  - Extract information from images by using Content Understanding
  - Extract information from audio and video by using Content Understanding
  - Build a lightweight application with information extraction capabilities by using Content Understanding

---

## Official Microsoft Learn Resources

- **Exam Page**: [Exam AI-901: Microsoft Azure AI Fundamentals](https://learn.microsoft.com/credentials/certifications/exams/ai-901/)
- **Official Study Guide**: [Study guide for Exam AI-901](https://learn.microsoft.com/credentials/certifications/resources/study-guides/ai-901)
- **Learning Path 1**: [AI concepts for developers and technology professionals](https://learn.microsoft.com/training/paths/ai-concepts/)
- **Learning Path 2**: [Get started with AI applications and agents on Azure](https://learn.microsoft.com/training/paths/get-started-ai-apps-agents/)
- **Course**: [AI-901T00: Introduction to AI in Azure](https://learn.microsoft.com/training/courses/ai-901t00)
- **Practice Assessment**: [AI Skills Navigator Practice Assessment](https://aiskillsnavigator.microsoft.com/credentials/cert-83587e0a0754cfee561ade3e27d9fa1cdaf15ae03be52d2413b2b858d1b4eda4)
- **Portal**: [Microsoft Foundry Portal](https://ai.azure.com)
