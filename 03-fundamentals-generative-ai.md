# Fundamentals of Generative AI

Table of Contents:

- [Fundamentals of Generative AI](#fundamentals-of-generative-ai)
  - [Introduction to generative AI concepts](#introduction-to-generative-ai-concepts)
    - [What is generative AI?](#what-is-generative-ai)
    - [Language models (A very high level overview)](#language-models-a-very-high-level-overview)
    - [Transformer model](#transformer-model)
    - [Tokenization](#tokenization)
    - [Large language models (LLMs) and small language models (sm)](#large-language-models-llms-and-small-language-models-sm)
    - [Prompts](#prompts)
    - [What are agents?](#what-are-agents)
  - [Get started with generative AI in Azure](#get-started-with-generative-ai-in-azure)
    - [What is Azure AI Foundry?](#what-is-azure-ai-foundry)

## Introduction to generative AI concepts

### What is generative AI?

- Generative AI is a subset of artificial intelligence that focuses on creating new content, such as text, images, audio, or video, based on patterns learned from existing data. It uses machine learning techniques to generate novel and creative outputs that can mimic human-like creativity.
- Generative AI models are trained on large datasets and learn to understand the underlying structure and patterns of the data. They can then generate new content that is similar to the training data but not identical, allowing for creativity and originality in the generated outputs.
- Examples of generative AI include language models like GPT-3, which can generate human-like text, and image generation models like DALL-E, which can create images from textual descriptions. These models have a wide range of applications, including content creation, data augmentation, and even assisting in creative processes across various industries.

### Language models (A very high level overview)

- **Training**: The process of feeding a large dataset into a language model to learn patterns and relationships in the data. During training, the model adjusts its internal parameters to minimize the difference between its predictions and the actual data in the training set.
- **Inferencing**: The process of using a trained language model to make predictions or generate new content based on input data. During inferencing, the model applies the patterns and relationships it learned during training to produce outputs for new, unseen data.

### Transformer model

- The transformer models are based on the transformer architecture. The transformer architecture is designed to handle sequential data, such as text, and has become the foundation for many state-of-the-art language models.
- The transformer architecture consists of an encoder and a decoder. The encoder processes the input data and generates a representation of it, while the decoder takes this representation and generates the output.
- The key innovation of the transformer architecture is the use of self-attention mechanisms, which allow the model to weigh the importance of different parts of the input data when generating the output. This allows the model to capture long-range dependencies in the data and generate more coherent and contextually relevant outputs.

### Tokenization

- Tokenization is the process of breaking down text into smaller units called tokens. Tokens can be words, sub-words, or even individual characters, depending on the tokenization method used.
- **Step 1 - tokenization**: The first step in the training a transformer model is to tokenize the input text. This involves breaking down the text into smaller units (tokens) that can be processed by the model. For example, the sentence "Hello, how are you?" might be tokenized into ["Hello", ",", "how", "are", "you", "?"].
- **Step 2 - embedding**: After tokenization, the tokens are converted into numerical representations called embeddings. Embeddings are dense vector representations of the tokens that capture their semantic meaning and relationships. For example, the token "Hello" might be represented as a vector of numbers that captures its meaning and relationship to other tokens in the training data.
- **Step 3 - attention**: The attention mechanism allows the model to weigh the importance of different tokens when generating the output. This is done by calculating attention scores for each token based on its relationship to other tokens in the input sequence. The model can then focus on the most relevant tokens when generating the output, allowing it to capture long-range dependencies and generate more coherent and contextually relevant outputs.

### Large language models (LLMs) and small language models (sm)

- **Large language models (LLMs)**: These are language models that have a large number of parameters, typically in the billions or even trillions. LLMs are trained on massive datasets and can generate highly coherent and contextually relevant outputs. They are often used for tasks such as natural language understanding, text generation, and language translation.
- **Small language models (sm)**: These are language models that have a smaller number of parameters, typically in the millions or tens of millions. Small language models are trained on smaller datasets and may not be able to generate outputs that are as coherent or contextually relevant as LLMs. However, they can still be useful for certain tasks, such as text classification or sentiment analysis, where the focus is on understanding the meaning of the text rather than generating new content. Small language models can also be more efficient and faster to train and deploy compared to LLMs, making them a good choice for certain applications where computational resources are limited.

### Prompts

- A prompt is a piece of text that is used to guide the generation of content by a language model.
- Prompts can be used to specify the desired output or to provide context for the model to generate relevant content.
- For example, if you want a language model to generate a story about a cat, you might use the prompt "Write a story about a cat who goes on an adventure." The model would then generate a story based on the prompt, using the patterns and relationships it learned during training to create a coherent and contextually relevant output.
- Prompts can be simple or complex, depending on the desired output and the capabilities of the language model being used. They are a powerful tool for guiding the generation of content and can be used in a wide range of applications, from creative writing to data augmentation and beyond.

### What are agents?

- Agents are autonomous entities that can perceive their environment, make decisions, and take actions to achieve specific goals. In the context of generative AI, agents can be designed to interact with language models and other AI systems to perform tasks, solve problems, or generate content based on user input or predefined objectives.
- Agents have 3 core components:
  - **Model (LLM)**: The language model that the agent uses to generate content or make decisions based on input data.
  - **Tools**: The tools that the agent can use to interact with the environment or perform specific tasks. These can include APIs, databases, or other software systems that the agent can access to gather information, perform actions, or manipulate data.
  - **Instruction**: The instructions or rules that guide the agent's behavior and decision-making process. This can include predefined goals, constraints, or guidelines that the agent must follow when interacting with the environment or generating content.
- Agents can be designed to perform a wide range of tasks, from simple content generation to complex problem-solving and decision-making. They can be used in various applications, such as virtual assistants, chatbots, and even autonomous systems that can operate in dynamic environments. By leveraging the capabilities of language models and other AI technologies, agents can provide valuable assistance and support in a variety of contexts, helping users achieve their goals and solve problems more efficiently.

## Get started with generative AI in Azure

### What is Azure AI Foundry?

- Azure AI Foundry is a comprehensive platform that provides tools and services for building, deploying, and managing generative AI applications. It offers a range of features and capabilities that enable developers to create powerful AI solutions using Azure's infrastructure and services.
- Azure AI Foundry provides a unified environment for developing and deploying generative AI models, allowing developers to easily access and utilize Azure's AI capabilities. It includes tools for data preparation, model training, and deployment, as well as integration with other Azure services for storage, compute, and monitoring.
- With Azure AI Foundry, developers can leverage the power of generative AI to create innovative applications and solutions across various industries, from content creation and natural language processing to image generation and beyond. The platform provides a scalable and flexible environment for building and deploying generative AI models, making it easier for developers to bring their ideas to life and deliver value to their users.

- **Azure Ai Foundry Projects**
  - **Azure AI Foundry Resource**: A resource in Azure that serves as a container for all the components and assets related to a generative AI project. It provides a centralized location for managing and organizing the various elements of the project, such as data, models, and tools.
    - **Azure AI Foundry Models**: The generative AI models that are used in the project. These models can be trained on specific datasets and can be used to generate content or make predictions based on input data.
    - **Azure AI Foundry Agents**: The agents that are designed to interact with the generative AI models and perform specific tasks or actions based on user input or predefined objectives. These agents can leverage the capabilities of the models to generate content, make decisions, or solve problems in a variety of contexts.
    - **Azure AI Services**: The various Azure services that can be integrated with the Azure AI Foundry project to enhance its capabilities and functionality. This can include services for storage, compute, monitoring, and more, allowing developers to create powerful and scalable generative AI applications using Azure's infrastructure and services.
