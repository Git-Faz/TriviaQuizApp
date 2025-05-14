import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import bcrypt from 'bcryptjs';
import connectPgSimple from 'connect-pg-simple';

const PgSession = connectPgSimple(session);

dotenv.config();
const app = express();

app.set('trust proxy', 1);
// Middleware: Security and Performance
//app.use(helmet()); // Secure HTTP headers
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
    
    // Log the CLIENT_URL environment variable to verify it's correct
    console.log('CLIENT_URL:', process.env.CLIENT_URL);
    
    // More permissive check that handles null, undefined, and empty string
    if (origin === null || origin === undefined || origin === '' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log rejected origins to help with debugging
      console.log('Rejected Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
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

/* const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
}); */

// Get the session cookie name from environment or use default
const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'connect.sid';

// Session Middleware
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  name: sessionCookieName,
  secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
  resave: true,
  saveUninitialized: true,
  proxy: true,
  cookie: {
    sameSite: 'none',
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined
  }
}));

// Ensure CORS headers are set before any response
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

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

// Middleware to refresh session on protected routes
function refreshSession(req, res, next) {
  if (req.session && req.session.user) {
    // Touch the session to refresh its expiry
    req.session.touch();
  }
  next();
}

// Middleware to Check if User is an Admin
function isAdmin(req, res, next) {
  console.log('Session data:', req.session);
  console.log('Session user:', req.session.user);
  console.log('User role:', req.session.user ? req.session.user.role : 'No user in session');

  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
}

// User Registration (with bcrypt)
app.post('/register', async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;

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
    const result = await pool.query(query, [username, email, hashedPassword, role]);
    
    req.session.user = { user_id: result.rows[0].id, username, email, role };
    
    // Force session save before responding
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session save failed' });
      }
      
      console.log('Session after registration:', req.session.id);
      console.log('User in session:', req.session.user);
      
      res.json({ 
        message: 'Registration successful', 
        user: req.session.user,
        sessionID: req.session.id
      });
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
      req.session.user = { 
        user_id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      };
      
      // Force session save before responding
      req.session.save(err => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: 'Session save failed' });
        }
        
        console.log('Session after login:', req.session.id);
        console.log('User in session:', req.session.user);
        
        res.json({ 
          message: 'Login successful', 
          user: req.session.user,
          sessionID: req.session.id
        });
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Login error:', err.stack);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Logout - FIXED
app.post('/logout', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(200).json({ message: "Already logged out" });
  }
  
  // Store session ID before destroying it
  const sessionID = req.session.id;
  
  // Get the cookie options to properly clear the cookie
  const cookieOptions = {
    path: '/',
    sameSite: 'none',
    secure: true,
    httpOnly: true
  };
  
  console.log(`Destroying session ${sessionID}`);
  
  // Properly destroy the session
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err.stack);
      return res.status(500).json({ error: "Logout failed" });
    }
    
    // Clear the session cookie with the same settings used to create it
    res.clearCookie(sessionCookieName, cookieOptions);
    
    // Also clear any other cookies you set
    res.clearCookie('user_logged_in', {
      path: '/',
      sameSite: 'none',
      secure: true,
      httpOnly: true
    });
    
    console.log(`Session ${sessionID} destroyed successfully`);
    res.status(200).json({ message: "Logged out successfully" });
  });
});

// Edit Profile (with bcrypt for password updates)
app.put('/api/update-profile', refreshSession, async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const { user_id } = req.session.user;
  const { username, email, password } = req.body;

  // Validate at least one field is provided
  if (!username && !email && !password) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    // Check if email already exists (if email is being updated)
    if (email && email !== req.session.user.email) {
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
    
    // Update the session data
    if (username) req.session.user.username = username;
    if (email) req.session.user.email = email;
    
    // Force session save before responding
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session save failed' });
      }
      
      res.json({
        message: "Profile updated successfully",
        user: {
          username: req.session.user.username,
          email: req.session.user.email
        }
      });
    });
  } catch (err) {
    console.error('Error updating profile:', err.stack);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// Check Session - New route to verify session status
app.get('/api/check-session', (req, res) => {
  console.log('Session check - Session ID:', req.session.id);
  console.log('Session check - User data:', req.session.user);
  
  if (!req.session.user) {
    return res.status(401).json({ 
      authenticated: false,
      message: "No active session"
    });
  }
  
  res.json({
    authenticated: true,
    user: {
      user_id: req.session.user.user_id,
      username: req.session.user.username,
      email: req.session.user.email,
      role: req.session.user.role
    }
  });
});

// Check User Role
app.get('/api/user', refreshSession, (req, res) => {
  console.log('Getting user data - Session ID:', req.session.id);
  
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  
  const { user_id, username, email, role } = req.session.user;
  res.json({ 
    user_id, 
    username, 
    email, 
    role,
    sessionActive: true
  });
});

// Admin Routes
app.use('/admin', refreshSession);

// Admin: Get Questions by Category
app.get('/admin/questions', isAdmin, async (req, res) => {
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
app.post('/admin/add-question', isAdmin, async (req, res) => {
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
app.get('/admin/view-questions', isAdmin, async (req, res) => {
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
app.delete('/admin/delete-question/:id', isAdmin, async (req, res) => {
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
app.get('/questions', refreshSession, async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "User not logged in" });
  }
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
app.post('/submit-quiz', refreshSession, async (req, res) => {
  console.log('Submit quiz - Session ID:', req.session.id);
  console.log('Submit quiz - User data:', req.session.user);
  
  if (!req.session.user) {
    return res.status(401).json({ error: "User not logged in" });
  }
  
  const { user_id } = req.session.user;
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
app.get('/quiz-results/:quiz_id', refreshSession, async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "User not logged in" });
  }
  const { user_id } = req.session.user;
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
app.get('/quiz-stats', refreshSession, async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const userId = req.session.user.user_id;
  
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

app.get('/api/debug-session', (req, res) => {
  res.json({
    sessionExists: !!req.session,
    sessionID: req.session?.id || 'none',
    hasUser: !!req.session?.user,
    cookieSettings: {
      maxAge: req.session?.cookie?.maxAge,
      httpOnly: req.session?.cookie?.httpOnly,
      secure: req.session?.cookie?.secure,
      sameSite: req.session?.cookie?.sameSite
    },
    headers: {
      'user-agent': req.headers['user-agent'],
      'origin': req.headers.origin,
      'host': req.headers.host
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