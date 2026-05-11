# Fundamentals of Machine Learning

Table of Contents:

- [Fundamentals of Machine Learning](#fundamentals-of-machine-learning)
  - [Introduction to machine learning concepts](#introduction-to-machine-learning-concepts)
    - [What is machine learning?](#what-is-machine-learning)
    - [Types of machine learning](#types-of-machine-learning)
    - [Model training and evaluation](#model-training-and-evaluation)
    - [Model algorithms and evaluation metrics](#model-algorithms-and-evaluation-metrics)
    - [Deep learning](#deep-learning)
  - [Get started with machine learning in Azure](#get-started-with-machine-learning-in-azure)

## Introduction to machine learning concepts

### What is machine learning?

- Machine Learning is a subset of Artificial Intelligence that focuses on the development of algorithms and statistical models that enable computers to perform tasks without explicit instructions, relying on patterns and inference instead.
- They are predictive models that learn from data to make predictions or decisions without being explicitly programmed to perform the task.
- Machine learning models have the relationship between features and labels.
  - **Features** are the input variables used to make predictions. They are the attributes or characteristics of the data that the model uses to learn patterns and relationships.
  - **Labels** are the output variables that the model is trying to predict. They represent the target variable or the outcome that the model is trained to predict based on the features.
- **Training** is the process of feeding data into a machine learning model to allow it to learn patterns and relationships between features and labels. During training, the model adjusts its internal parameters to minimize the difference between its predictions and the actual labels in the training data.
- **Inference** is the process of using a trained machine learning model to make predictions on new, unseen data. During inference, the model takes the input features and applies the learned patterns to generate predictions or decisions based on those features.

### Types of machine learning

- **Supervised machine learning**: In supervised learning, the model is trained on a labeled dataset, where each input data point is associated with a corresponding output label. The model learns to map the input features to the correct labels, allowing it to make predictions on new, unseen data.
  - **Regression**: A type of supervised learning where the model predicts a continuous output variable based on input features. For example, predicting house prices based on features like size, location, and number of bedrooms.
  - **Classification**: A type of supervised learning where the model predicts a discrete output variable (class) based on input features. For example, classifying emails as spam or not spam based on features like the presence of certain keywords, sender information, and email structure.
    - **Binary classification**: A classification task where there are only two classes (e.g., spam vs. not spam).
    - **Multiclass classification**: A classification task where there are more than two classes (e.g., classifying types of flowers based on petal and sepal measurements).
- **Unsupervised machine learning**: In unsupervised learning, the model is trained on an unlabeled dataset, where the input data points do not have corresponding output labels. The model learns to identify patterns, relationships, and structures in the data without any guidance on what the correct output should be.
  - **Clustering**: A type of unsupervised learning where the model groups similar data points together based on their features. For example, grouping customers into segments based on their purchasing behavior and demographics.

### Model training and evaluation

1. **Training Dataset**: Data used to train the model
   - A portion of the data used to train the machine learning model. The model learns patterns and relationships from this dataset to make predictions.

2. **Validation Dataset**: Data used to tune and improve the model
   - A separate portion of the data used to evaluate the performance of the model during training. It helps to tune hyperparameters and prevent overfitting by providing an unbiased evaluation of the model's performance on unseen data.

3. **Algorithm**: Method used to learn patterns from data
   - A specific method or technique used to train a machine learning model. Examples include linear regression, decision trees, support vector machines, and neural networks.

4. **Model**: Learned system that makes predictions
   - The output of the training process, which is a mathematical representation of the learned patterns and relationships in the data. The model can be used to make predictions on new, unseen data based on the input features.

5. **Validation**: Checking model performance during training
   - The process of evaluating the performance of a machine learning model using a validation dataset. This involves assessing how well the model's predictions match the actual labels in the validation dataset and using this information to tune hyperparameters and improve the model's performance.

6. **Evaluate the Model**: Measuring how accurate the final model is
   - The process of assessing the performance of a trained machine learning model using various metrics and techniques. This involves comparing the model's predictions to the actual labels in the validation or testing dataset to determine how well the model is performing and to identify areas for improvement.

### Model algorithms and evaluation metrics

- **Regression**: A type of supervised learning where the model predicts a continuous output variable based on input features.
  - Examples:
    - Linear Regression
    - Polynomial Regression
    - Support Vector Regression (SVR)
  - Evaluation metrics:
    - Mean Absolute Error (MAE)
    - Mean Squared Error (MSE)
    - Root Mean Squared Error (RMSE)
    - R-squared (R²)

- **Classification**: A type of supervised learning where the model predicts a discrete output variable (class) based on input features.
  - Examples:
    - Logistic Regression
    - Decision Tree
    - Random Forest
    - Support Vector Machine (SVM)
  - Evaluation metrics:
    - Accuracy
    - Precision
    - Recall
    - F1 Score

- **Clustering**: A type of unsupervised learning where the model groups similar data points together based on their features.
  - Examples:
    - K-Means
    - Hierarchical Clustering
    - DBSCAN
  - Evaluation metrics:
    - Silhouette Score
    - Davies-Bouldin Index
    - Calinski-Harabasz Index

### Deep learning

- A subset of machine learning that focuses on neural networks with many layers (deep neural networks) to model complex patterns in data. Deep learning is particularly effective for tasks such as image recognition, natural language processing, and speech recognition.
- **Artificial Neural Networks (ANNs)**: A type of deep learning model inspired by the structure and function of the human brain. ANNs consist of layers of interconnected nodes (neurons) that process and transmit information. They are used for a wide range of tasks, including classification, regression, and pattern recognition.
- **Transformer architecture**: A type of deep learning model that has revolutionized natural language processing and other sequence modeling tasks. The Transformer architecture uses self-attention mechanisms to capture long-range dependencies in data, allowing it to process and generate sequences of data more effectively than traditional recurrent neural networks (RNNs). Transformers are the basis for many state-of-the-art models in NLP, such as BERT and GPT.

## Get started with machine learning in Azure
