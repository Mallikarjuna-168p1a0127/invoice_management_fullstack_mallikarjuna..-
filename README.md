# Invoice Management System

## Project Overview

The Invoice Management System is a simple web application that allows users to create, view, update, and delete invoices. It consists of a frontend built using React.js and a backend built using Node.js, Express, and SQLite3 for storage. The backend supports CRUD operations for managing invoices and uses JWT (JSON Web Tokens) for user authentication.

### Features:
- **Frontend (React.js):**
  - Login and Signup pages.
  - Invoice management with form validation.
  - User authentication (using JWT).
  - A Home page displaying a list of invoices.
  - Create, read, update, and delete invoices.
  
- **Backend (Node.js + Express):**
  - RESTful API with CRUD operations for invoices.
  - User authentication with JWT.
  - SQLite3 database for storing invoice data.

---

## Tech Stack

- **Frontend:**
  - React.js
  - React Router
  - LocalStorage for persistent data (or optional MongoDB)
  - CSS for styling

- **Backend:**
  - Node.js
  - Express.js
  - SQLite3
  - bcrypt for password hashing
  - jsonwebtoken for authentication

---

## Prerequisites

- Node.js (v14+)
- npm or yarn
- SQLite3 (for the backend)

---

## Frontend Setup

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/invoice-management-system.git
   cd invoice-management-system
Navigate to the frontend directory and install dependencies:
cd frontend

npm install
Run the React development server:

npm start
This will run the frontend on http://localhost:3000. The app should now be accessible in your browser.

Backend Setup
Navigate to the backend directory:
cd backend

Install the backend dependencies:
npm install

Create the SQLite database:
node createDatabase.js

Run the backend server:
npm start
The backend API will now be running on http://localhost:3000.

API Endpoints
POST /api/auth/signup: Create a new user (Requires email, password, and name).
POST /api/auth/login: Authenticate user and receive a JWT.
GET /api/invoices: Fetch all invoices (Requires authentication).
POST /api/invoices: Create a new invoice (Requires authentication).
PUT /api/invoices/:id: Update an existing invoice (Requires authentication).
DELETE /api/invoices/:id: Delete an invoice (Requires authentication).


Database Schema

Users Table:
Field	Type	Description
id	INTEGER	Primary key, auto-increment
email	TEXT	Unique email
password	TEXT	Hashed password
name	TEXT	User's name

Invoices Table:

Field	Type	Description
id	INTEGER	Primary key, auto-increment
invoice_no	TEXT	Unique invoice number
client_name	TEXT	Client's name
date	TEXT	Invoice date (ISO format)
amount	REAL	Invoice amount
status	TEXT	Status of the invoice (Paid, Unpaid, Pending)

How to Use the Application
Frontend:
Login Page: Use the login form to log in with your credentials.
Sign-Up Page: If you don't have an account, sign up by providing an email, password, and your name.
Home Page: Once logged in, you'll be able to see a list of invoices stored on the backend.
Invoice Form Page: Use this page to add a new invoice or edit an existing invoice.
Backend:
The backend is a simple REST API that serves as the data provider for the frontend. It handles user authentication and CRUD operations for invoices. You'll need to send a valid JWT in the Authorization header for protected routes (invoices).
Additional Features (Bonus)
Sorting and Filtering: The application supports sorting invoices by status or date.
Deployment: You can deploy the frontend on services like Netlify or Vercel, and deploy the backend on services like Render or Heroku.
