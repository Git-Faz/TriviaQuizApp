import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Added JWT import

dotenv.config();
const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(compression()); // Compress responses

// CORS Middleware
app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS Origin:', origin);
    const allowedOrigins = [
      process.env.CLIENT_URL, 
      'http://localhost:5173', 
      'http://localhost:4173'
    ];

    console.log('CLIENT_URL:', process.env.CLIENT_URL);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Rejected Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin', 
    'Expires', 
    'Cache-Control',
    'Pragma', // Added for cache control
    'Accept-Encoding', // Added for compression
    'Content-Length', // For request body size
    'If-None-Match', // For ETag-based caching
    'User-Agent', // For client identification
    ],
  exposedHeaders: ['Set-Cookie', 'Date', 'ETag']
}));

// Body Parsing Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// PostgreSQL Connection Pool (using DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// JWT Secret from environment or fallback
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret-for-dev';
// JWT Expiration duration in seconds (24 hours)
const JWT_EXPIRES_IN = 24 * 60 * 60;

// Test Database Connection
pool.connect()
  .then(client => {
    console.log('Connected to the database!');
    client.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.stack);
  });

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client:', err.stack);
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  // Get token from Authorization header or query parameter
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

// Middleware to Check if User is an Admin
function isAdmin(req, res, next) {
  console.log('User data:', req.user);
  console.log('User role:', req.user ? req.user.role : 'No user data');

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      user_id: user.user_id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// User Registration (with bcrypt)
app.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  const userRole = 'user';

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Check if email already exists
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = 'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id';
    const result = await pool.query(query, [username, email, hashedPassword, userRole]);
    
    const userData = { 
      user_id: result.rows[0].id, 
      username, 
      email, 
      role: userRole 
    };
    
    // Generate JWT token
    const token = generateToken(userData);
    
    console.log('User registered:', userData);
    
    res.json({ 
      message: 'Registration successful', 
      user: userData,
      token: token
    });
  } catch (err) {
    console.error('Error inserting user:', err.stack);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Login (with bcrypt)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const userData = { 
        user_id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      };
      
      // Generate JWT token
      const token = generateToken(userData);
      
      console.log('User logged in:', userData);
      
      res.json({ 
        message: 'Login successful', 
        user: userData,
        token: token
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Login error:', err.stack);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Logout is now handled client-side by removing the token

// Edit Profile (with bcrypt for password updates)
app.put('/api/update-profile', authenticateToken, async (req, res) => {
  const { user_id } = req.user;
  const { username, email, password } = req.body;

  // Validate at least one field is provided
  if (!username && !email && !password) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    // Check if email already exists (if email is being updated)
    if (email && email !== req.user.email) {
      const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, user_id]);
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: "Email already registered" });
      }
    }

    let query = 'UPDATE users SET ';
    const fields = [];
    const values = [];
    let paramCounter = 1;

    if (username) {
      fields.push(`username = $${paramCounter}`);
      values.push(username);
      paramCounter++;
    }
    if (email) {
      fields.push(`email = $${paramCounter}`);
      values.push(email);
      paramCounter++;
    }
    if (password) {
      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      fields.push(`password = $${paramCounter}`);
      values.push(hashedPassword);
      paramCounter++;
    }

    query += fields.join(', ') + ` WHERE id = $${paramCounter}`;
    values.push(user_id);

    await pool.query(query, values);
    
    // Update the user data with new values
    const updatedUserData = {
      ...req.user,
      username: username || req.user.username,
      email: email || req.user.email
    };
    
    // Generate a new token with updated user info
    const token = generateToken(updatedUserData);
    
    res.json({
      message: "Profile updated successfully",
      user: {
        username: updatedUserData.username,
        email: updatedUserData.email
      },
      token: token
    });
  } catch (err) {
    console.error('Error updating profile:', err.stack);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// Check token validity
app.get('/api/check-token', authenticateToken, (req, res) => {
  console.log('Token check - User data:', req.user);
  
  res.json({
    authenticated: true,
    user: {
      user_id: req.user.user_id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Get User Info
app.get('/api/user', authenticateToken, (req, res) => {
  console.log('Getting user data - User ID:', req.user.user_id);
  
  const { user_id, username, email, role } = req.user;
  res.json({ 
    user_id, 
    username, 
    email, 
    role
  });
});

// Admin Routes
app.use('/admin', authenticateToken);

// Admin: Get Questions by Category
app.get('/admin/questions', authenticateToken, isAdmin, async (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  try {
    const normalizedCategory = category === 'General Knowledge' ? 'GK' : category;
    const result = await pool.query('SELECT * FROM questions WHERE category = $1', [normalizedCategory]);
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err.stack);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Admin: Add a Question
app.post('/admin/add-question', authenticateToken, isAdmin, async (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_option, category } = req.body;
  
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option || !category) {
    return res.status(400).json({ error: "All fields are required." });
  }
  
  try {
    const normalizedCategory = category === 'General Knowledge' ? 'GK' : category;
    const query = `INSERT INTO questions (question_text, a, b, c, d, correct_option, category)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
    
    const result = await pool.query(query, [
      question_text, option_a, option_b, option_c, option_d, 
      correct_option, normalizedCategory
    ]);
    
    res.json({ message: "Question added successfully!", question_id: result.rows[0].id });
  } catch (err) {
    console.error("Database error:", err.stack);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Admin: View Questions by Category
app.get('/admin/view-questions', authenticateToken, isAdmin, async (req, res) => {
  const { category } = req.query;

  try {
    let query, params;
    
    if (category) {
      const normalizedCategory = category === 'General Knowledge' ? 'GK' : category;
      query = 'SELECT * FROM questions WHERE category = $1 ORDER BY id DESC';
      params = [normalizedCategory];
    } else {
      query = 'SELECT * FROM questions ORDER BY id DESC';
      params = [];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err.stack);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Admin: Delete a Question
app.delete('/admin/delete-question/:id', authenticateToken, isAdmin, async (req, res) => {
  const questionId = req.params.id;

  try {
    const result = await pool.query('DELETE FROM questions WHERE id = $1', [questionId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Database error:', err.stack);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Load Quiz
app.get('/questions', authenticateToken, async (req, res) => {
  let { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  try {
    const normalizedCategory = category === 'General Knowledge' ? 'GK' : category;
    const result = await pool.query('SELECT * FROM questions WHERE category = $1', [normalizedCategory]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching questions:', err.stack);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Submit Quiz
app.post('/submit-quiz', authenticateToken, async (req, res) => {
  console.log('Submit quiz - User ID:', req.user.user_id);
  
  const { user_id } = req.user;
  const { quiz_id, category, answers } = req.body;

  if (!quiz_id || !category) {
    return res.status(400).json({ error: "Quiz ID and category are required" });
  }
  if (!answers || answers.length === 0) {
    return res.status(400).json({ error: "No answers submitted" });
  }

  try {
    const normalizedCategory = category === 'General Knowledge' ? 'GK' : category;
    let correctAnswers = 0;
    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');
      
      for (const answer of answers) {
        const questionResult = await client.query(
          'SELECT correct_option FROM questions WHERE id = $1',
          [answer.question_id]
        );
        
        if (questionResult.rows.length === 0) {
          throw new Error("Question not found");
        }

        const is_correct = questionResult.rows[0].correct_option === answer.selected_option ? 1 : 0;
        if (is_correct) correctAnswers++;

        await client.query(
          'INSERT INTO answers (user_id, question_id, selected_option, is_correct) VALUES ($1, $2, $3, $4)',
          [user_id, answer.question_id, answer.selected_option, is_correct]
        );
      }

      const totalQuestions = answers.length;
      await client.query(
        `INSERT INTO user_quiz (user_id, quiz_id, category, total_score, questions_attempted, correct_answers)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user_id, quiz_id, normalizedCategory, correctAnswers, totalQuestions, correctAnswers]
      );
      
      // Commit transaction
      await client.query('COMMIT');
      
      res.json({
        message: "Quiz submitted successfully",
        score: correctAnswers,
        total: totalQuestions,
        quiz_id: quiz_id
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Quiz submission error:", err.stack);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Fetch Quiz Results
app.get('/quiz-results/:quiz_id', authenticateToken, async (req, res) => {
  const { user_id } = req.user;
  const { quiz_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT q.id, q.question_text, a.selected_option, q.correct_option, a.is_correct 
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      JOIN user_quiz uq ON uq.quiz_id = $1 AND uq.user_id = a.user_id
      WHERE a.user_id = $2
    `, [quiz_id, user_id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err.stack);
    return res.status(500).json({ error: "Database error" });
  }
});

// Get User Quiz Statistics
app.get('/quiz-stats', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;
  
  try {
    const query = `
      SELECT 
        category,
        COUNT(*) as attempts,
        MAX(total_score) as highscore,
        AVG(total_score) as average
      FROM 
        user_quiz
      WHERE 
        user_id = $1
      GROUP BY 
        category
    `;
    
    const result = await pool.query(query, [userId]);
    
    // Map category for client consistency
    const mappedResults = result.rows.map(result => ({
      ...result,
      category: result.category === 'GK' ? 'General Knowledge' : result.category
    }));
    
    res.json(mappedResults);
  } catch (err) {
    console.error('Database error:', err.stack);
    return res.status(500).json({ error: "Failed to fetch quiz statistics" });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Token debugging endpoint
app.get('/api/debug-token', authenticateToken, (req, res) => {
  res.json({
    tokenExists: true,
    decodedToken: req.user,
    headers: {
      'user-agent': req.headers['user-agent'],
      'origin': req.headers.origin,
      'host': req.headers.host,
      'authorization': req.headers['authorization'] ? '(present)' : '(not present)'
    }
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
  next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});