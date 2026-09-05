# Original study notes (archived)

These are the original markdown study notes this repository started as. They are kept for
reference, but **the interactive site in [`src/`](../src/) is now the canonical, verified
content** - it was written against the current AI-901 skills measured (April 15, 2026) and
checked against Microsoft Learn.

Prefer the site. Use these notes only as background reading, and read the corrections below
first.

## Corrections - where these notes are out of date

Microsoft changed several things after these notes were written. Everything in this table has
been fixed in the site; it has **not** been rewritten in the note files themselves.

| Note | What the notes say | What is true now | Corrected lesson |
| :--- | :--- | :--- | :--- |
| `01-ai-overview.md` | A **Foundry Hub** is the top-level container; projects live inside it and depend on Storage, Key Vault and ACR. | Hub-based projects are the **classic** model. The current default is a **Foundry resource** with **Foundry projects** as child resources, needing no separate storage or key vault. Hubs remain only for select cases such as open-source model hosting and Azure ML capabilities. | [The Microsoft Foundry platform](../src/data/modules/foundry-platform.ts) |
| `02-generative-ai-and-agents.md` | Deployment options are "Serverless API / Managed Compute / PTU". | There are **two options** - Serverless API (preferred) and managed compute. **Provisioned throughput is a deployment *type*** within Serverless API, alongside standard and batch, each available as Global, Data Zone or single-region. **Instant access** (preview) removes the deployment step entirely for supported models. | [Choosing and configuring models](../src/data/modules/genai-models.ts) |
| `02-generative-ai-and-agents.md` | Agents are described generically; the SDK sample uses `from_connection_string`, `create_thread`, `create_message`, `create_and_process_run`. | Foundry Agent Service has **two agent types**: **prompt agents** (declarative, Foundry-run) and **hosted agents** (your container). Calling the **Responses API** directly gives an ephemeral agent with no Foundry resource. Current samples use a **project endpoint**, `create_version` with a `PromptAgentDefinition`, conversations and responses. **Toolboxes** share curated tools across agents. | [AI agents in Foundry](../src/data/modules/agents.ts) |
| `05-computer-vision.md` | Image generation is DALL·E 3. | Image generation is now the **GPT-image family** (`gpt-image-1`, `-mini`, `-1.5`, `-2`); DALL·E 3 is still available. Video generation is **Sora-2** (preview). | [Vision and image generation](../src/data/modules/vision.ts) |
| `05-computer-vision.md` | Uses Azure AI Vision Image Analysis for OCR and tagging. | **Image Analysis 4.0 is deprecated**, retiring 25 September 2028. Microsoft directs OCR to **Document Intelligence**, faces to the **Face** service, and image embeddings to models such as Cohere Embed or SigLIP. | [Vision and image generation](../src/data/modules/vision.ts) |
| All notes | "Azure AI Language", "Azure AI Vision", "Cognitive Services". | The current names are **Azure Language / Speech / Vision / Content Understanding in Foundry Tools**. Expect current naming in exam wording. | [AI workloads](../src/data/modules/foundations.ts) |
| `07-rag-and-foundry-iq.md` | Classic RAG pipeline. | Still correct, but incomplete: **agentic retrieval** decomposes a query into parallel subqueries, uses conversation history, reranks semantically and returns cited, structured results. **Foundry IQ** knowledge bases are multi-source, shareable across agents, and permission-aware at query time. | [RAG and Foundry IQ](../src/data/modules/rag-foundry-iq.ts) |

## What is still accurate

The responsible AI principles, text analysis techniques, speech concepts, computer vision task
definitions and the information extraction lifecycle in these notes are all still correct. The
site covers the same ground with knowledge checks attached.

## Why they were not simply rewritten

Two copies of the same material drift apart. The site is the version that gets maintained,
carries the questions, and tracks your progress; these files are a snapshot of where the
project started.
