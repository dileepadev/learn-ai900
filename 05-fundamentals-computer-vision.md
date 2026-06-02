# Fundamentals of Computer Vision

Table of Contents:

- [Fundamentals of Computer Vision](#fundamentals-of-computer-vision)
  - [Introduction to computer vision concepts](#introduction-to-computer-vision-concepts)
    - [What is computer vision?](#what-is-computer-vision)
    - [Image processing](#image-processing)
    - [Convolutional Neural Networks (CNNs)](#convolutional-neural-networks-cnns)
    - [Multi-modal models](#multi-modal-models)
  - [Get started with computer vision in Azure](#get-started-with-computer-vision-in-azure)
    - [Computer vision services in Azure](#computer-vision-services-in-azure)
    - [Image analysis 4.0 with the AI Vision Service](#image-analysis-40-with-the-ai-vision-service)
    - [Detecting faces with the Face Service](#detecting-faces-with-the-face-service)
    - [Reading text with Optical Character Recognition (OCR)](#reading-text-with-optical-character-recognition-ocr)

## Introduction to computer vision concepts

### What is computer vision?

- Computer vision is a field of artificial intelligence (AI) that enables computers to interpret and understand visual information from the world. It involves the development of algorithms and models that can analyze and process images and videos to extract meaningful insights and make decisions based on visual data.
- Computer vision is used in various applications, including image recognition, object detection, facial recognition, and autonomous vehicles. It allows machines to perceive and understand the visual world, enabling them to perform tasks that typically require human vision, such as identifying objects, recognizing patterns, and understanding scenes.

### Image processing

- Image processing is a technique used in computer vision to enhance and manipulate images to improve their quality or extract useful information. It involves various operations, such as filtering, edge detection, and image segmentation, to analyze and interpret visual data. Image processing is used in applications such as medical imaging, surveillance, and quality control in manufacturing.

### Convolutional Neural Networks (CNNs)

- Convolutional Neural Networks (CNNs) are a type of deep learning model that is particularly effective for image recognition and classification tasks. CNNs use convolutional layers to automatically learn and extract features from images, allowing them to recognize patterns and objects in visual data. CNNs have been widely used in applications such as facial recognition, object detection, and image classification.

### Multi-modal models

- Multi-modal models are a type of AI model that can process and understand multiple types of data, such as images, text, and audio. These models can learn from different modalities of data to improve their performance and provide more comprehensive insights. Multi-modal models are used in applications such as image captioning, where the model generates descriptive text based on the content of an image.
- Foundation models include **language encoder** and **image encoder** models, which can be used together in multi-modal applications. For example, a language encoder can process text data while an image encoder processes visual data, allowing the model to understand and generate responses based on both types of information.

## Get started with computer vision in Azure

### Computer vision services in Azure

- Vision
  - Image analysis: Image tagging, captions, model customization, spatial analysis, and more.
  - Optical character recognition (OCR): Extract printed and handwritten text from images and documents.
  - Video analysis: Extract insights from videos, such as motion detection, object tracking, and content moderation.
- Face
  - Face detection: Detect and analyze human faces in images and videos.
  - Face recognition: Identify and verify individuals based on facial features.

### Image analysis 4.0 with the AI Vision Service

- Capabilities include:
  - Model customization
  - Read text from images
  - Detect people in images
  - Generate image captions
  - Detect objects
  - Tag visual features
  - Smart crop

### Detecting faces with the Face Service

- Can use to detect
  - Blur
  - Exposure
  - Glasses
  - Head pose
  - Noise
  - Occlusion
- Only managed Microsoft customers can access facial recognition capabilities:
  - Similarity matching
  - Identity verification

### Reading text with Optical Character Recognition (OCR)

- OCR is a technology that enables the extraction of text from images and documents. It can recognize printed and handwritten text, making it useful for applications such as document digitization, data entry automation, and text analysis.
- Options for quick text extraction from images, or asynchronous analysis of large documents, such as PDFs. The Azure AI Vision service provides OCR capabilities that can be used to extract text from images and documents, allowing you to automate data entry and improve efficiency in various applications.
