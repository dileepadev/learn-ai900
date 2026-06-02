# Fundamentals of Information Extraction

Table of Contents:

- [Fundamentals of Information Extraction](#fundamentals-of-information-extraction)
  - [Introduction to AI-powered information extraction concepts](#introduction-to-ai-powered-information-extraction-concepts)
    - [Information extraction processes](#information-extraction-processes)
    - [Understand the extraction of data from images](#understand-the-extraction-of-data-from-images)
    - [Understand the extraction of data from forms](#understand-the-extraction-of-data-from-forms)
    - [Understand multi-modal data extraction](#understand-multi-modal-data-extraction)
  - [Get started with AI-powered information extraction in Azure](#get-started-with-ai-powered-information-extraction-in-azure)
    - [Azure AI options for reading test](#azure-ai-options-for-reading-test)
      - [Azure AI Vision Image Analysis](#azure-ai-vision-image-analysis)
      - [Azure AI Document Intelligence](#azure-ai-document-intelligence)
      - [Azure AI Content Understanding](#azure-ai-content-understanding)
    - [What is knowledge mining?](#what-is-knowledge-mining)

## Introduction to AI-powered information extraction concepts

### Information extraction processes

| Step | Description |
| --- | --- |
| Source Identification | Identify the sources of information, such as documents, images, or web pages, that contain the data to be extracted. |
| Extraction | Use AI techniques, such as natural language processing (NLP) and computer vision, to extract relevant information from the identified sources. This may involve techniques like named entity recognition, sentiment analysis, and image recognition. |
| Transformation & Structuring | Transform the extracted information into a structured format, such as a database or spreadsheet, to facilitate analysis and decision-making. This may involve data cleaning, normalization, and organization. |
| Storage & Integration | Store the structured information in a suitable storage solution, such as a database or data warehouse, and integrate it with other systems or applications for further analysis and use. This may involve using APIs, data pipelines, or other integration methods. |

### Understand the extraction of data from images

Use OCR to extract text from images, and use computer vision techniques to extract other types of data, such as objects, faces, or spatial relationships. This can be useful for applications such as document digitization, data entry automation, and image analysis.

Use cases:

- Extracting text from scanned documents, such as invoices, receipts, or forms, to automate data entry and improve efficiency.  
- Extracting information from images, such as product labels, signage, or visual content, to enable search and analysis of visual data.
- Extracting spatial relationships from images, such as the arrangement of objects or the layout of a scene, to enable applications such as spatial analysis and augmented reality.
- Digital handwriting recognition to extract text from handwritten notes, forms, or documents, enabling digitization and analysis of handwritten content.

### Understand the extraction of data from forms

- Use form processing techniques to extract structured data from forms, such as invoices, surveys, or applications. This can involve using AI models to identify and extract key-value pairs, tables, and other relevant information from the forms. This can be useful for automating data entry, improving efficiency, and enabling analysis of form data.
- The field name is the key or type of data entry
- The field description is the value or content of the data entry
- The field value is the actual data extracted from the form, which can be used for further processing and analysis.

### Understand multi-modal data extraction

- Multi-modal data extraction involves extracting information from multiple types of data, such as text, images, and audio. This can be useful for applications that require a comprehensive understanding of the data, such as sentiment analysis, content moderation, or multi-modal search.

## Get started with AI-powered information extraction in Azure

### Azure AI options for reading test

#### Azure AI Vision Image Analysis

- Identify text and it's location in scanned documents, images, and PDFs
- Find ad read text in images, such as product labels, signage, or visual content, to enable search and analysis of visual data.
- Combine with other image analysis features, such as object detection and spatial analysis, to extract more comprehensive information from images and documents.

#### Azure AI Document Intelligence

- Design to support form processing by extracting fields and associated values from documents.
- Use prebuilt models for common document types, such as invoices and receipts, or customize models for specific document formats and field types.
- Create custom models to extract specific information from documents, such as key-value pairs, tables, and other relevant data, to automate data entry and improve efficiency in various applications.

#### Azure AI Content Understanding

- Use multi-modal data extraction capabilities to extract information from various types of content, such as text, images, and audio, to enable applications such as sentiment analysis, content moderation, and multi-modal search.
- Combine text extraction with other AI capabilities, such as natural language processing and computer vision, to extract more comprehensive insights from content and enable more advanced applications.
- Create custom analyzers to extract specific information from content, such as named entities, sentiment, and visual features, to enable more targeted analysis and insights from various types of data.

### What is knowledge mining?

- **Knowledge mining** is the process of extracting valuable insights and information from large volumes of data, such as documents, images, and other unstructured content. It involves using AI techniques, such as natural language processing, computer vision, and machine learning, to analyze and understand the data, and to extract meaningful insights that can be used for decision-making and other applications.
- **Azure AI Search** is a knowledge mining solution that enables you to extract insights from large volumes of data, such as documents, images, and other unstructured content. It provides capabilities for indexing, searching, and analyzing data, allowing you to uncover valuable insights and information from your data sources. With Azure AI Search, you can create custom search experiences, build intelligent applications, and enable advanced analytics on your data.
