const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, 'invoiceDB.db');
let db = null;

// JWT secret key
const JWT_SECRET = 'INVOICE_SECRET_KEY';

// Initialize database and server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT NOT NULL,
        client_name TEXT NOT NULL,
        date TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT CHECK(status IN ('Paid', 'Unpaid', 'Pending')),
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/');
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Middleware to verify JWT token
const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, JWT_SECRET, async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.userId = payload.userId;
        next();
      }
    });
  }
};

// User Registration
app.post('/register', async (request, response) => {
  const { name, email, password } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const selectUserQuery = `SELECT * FROM users WHERE email = ?`;
    const dbUser = await db.get(selectUserQuery, [email]);
    
    if (dbUser !== undefined) {
      response.status(400).json({ error: "Email already registered" });
    } else {
      const createUserQuery = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `;
      await db.run(createUserQuery, [name, email, hashedPassword]);
      response.status(200).json({ message: "User created successfully" });
    }
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// User Login
app.post('/login', async (request, response) => {
  const { email, password } = request.body;
  
  try {
    const selectUserQuery = `SELECT * FROM users WHERE email = ?`;
    const dbUser = await db.get(selectUserQuery, [email]);
    
    if (dbUser === undefined) {
      response.status(400).json({ error: "Invalid email" });
    } else {
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      
      if (isPasswordMatched) {
        const payload = { userId: dbUser.id };
        const jwtToken = jwt.sign(payload, JWT_SECRET);
        response.send({ jwtToken });
      } else {
        response.status(400).json({ error: "Invalid password" });
      }
    }
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Create Invoice
app.post('/invoices', authenticateToken, async (request, response) => {
  const { invoice_number, client_name, date, amount, status } = request.body;
  const userId = request.userId;
  
  try {
    const createInvoiceQuery = `
      INSERT INTO invoices (invoice_number, client_name, date, amount, status, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.run(createInvoiceQuery, [invoice_number, client_name, date, amount, status, userId]);
    response.status(201).json({ message: "Invoice created successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Get All Invoices
app.get('/invoices', authenticateToken, async (request, response) => {
  const userId = request.userId;
  const { status, sort_by } = request.query;
  
  try {
    let getInvoicesQuery = `SELECT * FROM invoices WHERE user_id = ?`;
    const queryParams = [userId];

    if (status) {
      getInvoicesQuery += ` AND status = ?`;
      queryParams.push(status);
    }

    if (sort_by === 'date') {
      getInvoicesQuery += ` ORDER BY date DESC`;
    }

    const invoices = await db.all(getInvoicesQuery, queryParams);
    response.json(invoices);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Update Invoice
app.put('/invoices/:id', authenticateToken, async (request, response) => {
  const { id } = request.params;
  const { invoice_number, client_name, date, amount, status } = request.body;
  const userId = request.userId;
  
  try {
    const updateInvoiceQuery = `
      UPDATE invoices 
      SET invoice_number = ?,
          client_name = ?,
          date = ?,
          amount = ?,
          status = ?
      WHERE id = ? AND user_id = ?
    `;
    const result = await db.run(
      updateInvoiceQuery,
      [invoice_number, client_name, date, amount, status, id, userId]
    );
    
    if (result.changes > 0) {
      response.json({ message: "Invoice updated successfully" });
    } else {
      response.status(404).json({ error: "Invoice not found" });
    }
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// Delete Invoice
app.delete('/invoices/:id', authenticateToken, async (request, response) => {
  const { id } = request.params;
  const userId = request.userId;
  
  try {
    const deleteInvoiceQuery = `DELETE FROM invoices WHERE id = ? AND user_id = ?`;
    const result = await db.run(deleteInvoiceQuery, [id, userId]);
    
    if (result.changes > 0) {
      response.json({ message: "Invoice deleted successfully" });
    } else {
      response.status(404).json({ error: "Invoice not found" });
    }
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});