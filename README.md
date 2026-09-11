# PocketTrack
A simple personal expense tracker built with Ionic and Angular to help users record, organize, and monitor their daily expenses.


PocketTrack

PocketTrack is a simple personal expense tracking application developed with Ionic and Angular. The application allows users to record, organize, and review their daily expenses in order to maintain a basic overview of their spending.

🎯 Objective

The main objective of PocketTrack is to provide users with a simple and intuitive way to keep track of their personal expenses. The application is designed as a beginner-friendly mobile application focused on basic expense management.

✨ Features
View a summary of recorded expenses.
View a list of expenses.
Add new expenses.
Organize expenses by category.
Display the total amount of recorded expenses.
Navigate between different application views.
📱 Application Views

The application includes the following main views:

Dashboard

The main screen of the application, where users can see a summary of their expenses and their total spending.

Expenses

A list of the expenses recorded in the application, including information such as description, amount, category, and date.

Add Expense

A form that allows users to enter and register a new expense.

🗂️ Data Model

The initial data model is based on an Expense entity with the following properties:

Property	Type	Description
id	number	Unique identifier for the expense
description	string	Description of the expense
amount	number	Amount of money spent
category	string	Category assigned to the expense
date	string	Date when the expense was recorded
🛠️ Technologies Used
Ionic Framework - Mobile UI components and application framework.
Angular - Application framework and structure.
TypeScript - Application logic and data management.
HTML - Application structure and content.
CSS - Application styling and layout.
Angular NgModules - Application module organization and configuration.
Git - Version control and project management.
📂 Project Structure

The project follows an Angular and Ionic structure based on NgModules.

src/
└── app/
    ├── home/
    ├── expenses/
    ├── add-expense/
    ├── models/
    ├── app-routing.module.ts
    └── app.module.ts

The application is organized into different pages and modules to separate the main views and functionality.

🚀 Getting Started
Prerequisites

Make sure you have the following tools installed:

Node.js
npm
Ionic CLI
Angular
Installation

Clone the repository:

git clone <repository-url>

Navigate to the project directory:

cd pockettrack

Install the project dependencies:

npm install
Running the Application

Start the development server with:

ionic serve

The application will be available through the local development server provided by Ionic.

🔧 Development

PocketTrack was developed as a beginner-level Ionic and Angular project to practice fundamental concepts such as:

Angular components and pages.
Angular NgModules.
Routing and navigation.
TypeScript interfaces and data models.
Forms and user input.
Ionic UI components.
Basic data manipulation.
CSS styling.
📸 Application Screenshots

Screenshots of the application in execution will be included here to demonstrate the implemented views and functionality.

📌 Project Status

This project is currently under development as part of an academic assignment. The current version focuses on the basic functionality and structure required for a personal expense tracking application.

👩‍💻 Author

Mariana

PocketTrack is an academic project developed for learning purposes.
