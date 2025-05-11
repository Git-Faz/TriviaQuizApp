import express from 'express';
import mysql from 'mysql2';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(session({
  secret: 'Tyler_durden99',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    sameSite: 'lax',
    secure: false 
  }
}));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Dexter_2024',
  database: 'quizapp'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database!');
});

// Middleware to check if user is an admin
function isAdmin(req, res, next) {
  console.log('Session data:', req.session);
  console.log('Session user:', req.session.user);
  console.log('User role:', req.session.user ? req.session.user.role : 'No user in session');

  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
}

// User registration
app.post('/register', (req, res) => {
  const { username, email, password, role = 'user' } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(query, [username, email, password, role], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ error: 'Registration failed' });
    }
    req.session.user = { user_id: result.insertId, username, email, role };
    res.json({ message: 'Registration successful', user: req.session.user });
  });
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Login failed' });

    if (results.length === 0) {
      return res.status(401).json({ error: 'User not registered' });
    }

    const user = results[0];
    if (user.password === password) {
      req.session.user = { user_id: user.id, username: user.username, email: user.email, role: user.role };
      console.log('Session set after login:', req.session.user); // Added logging
      res.json({ message: 'Login successful', user: req.session.user });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out successfully" });
  });
});


// Edit profile
app.put('/api/update-profile', (req, res) => {
  if (!req.session.user) {
      return res.status(401).json({ error: "Not logged in" });
  }

  const { user_id } = req.session.user;
  const { username, email, password } = req.body;

  let query = 'UPDATE users SET ';
  const fields = [];
  const values = [];

  if (username) {
      fields.push('username = ?');
      values.push(username);
  }
  if (email) {
      fields.push('email = ?');
      values.push(email);
  }
  if (password) {
      fields.push('password = ?');
      values.push(password);
  }

  if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
  }

  query += fields.join(', ') + ' WHERE id = ?';
  values.push(user_id);

  db.query(query, values, (err, result) => {
      if (err) {
          console.error('Error updating profile:', err);
          return res.status(500).json({ error: "Failed to update profile" });
      }

      if (username) req.session.user.username = username;
      if (email) req.session.user.email = email;

      res.json({
          username: req.session.user.username,
          email: req.session.user.email
      });
  });
});

// Admin: Get questions by category
app.get('/admin/questions', isAdmin, (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  const normalizedCategory = category === 'General Knowledge' ? 'GK' : category;
  db.query('SELECT * FROM questions WHERE category = ?', [normalizedCategory], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Admin: Add a question
app.post('/admin/add-question', isAdmin, (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_option, category } = req.body;
  
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option || !category) {
    return res.status(400).json({ error: "All fields are required." });
  }
  
  const normalizedCategory = category === 'General Knowledge' ? 'GK' : category;
  const query = `INSERT INTO questions (question_text, a, b, c, d, correct_option, category)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.query(query, [question_text, option_a, option_b, option_c, option_d, correct_option, normalizedCategory], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error", details: err });
    }
    res.json({ message: "Question added successfully!", question_id: result.insertId });
  });
});

// Admin: View questions by category
app.get('/admin/view-questions', isAdmin, (req, res) => {
  const { category } = req.query;

  let query = 'SELECT * FROM questions ORDER BY id DESC';
  let params = [];

  if (category) {
    const normalizedCategory = category === 'General Knowledge' ? 'GK' : category;
    query = 'SELECT * FROM questions WHERE category = ? ORDER BY id DESC';
    params = [normalizedCategory];
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Admin: Delete a question
app.delete('/admin/delete-question/:id', isAdmin, (req, res) => {
  const questionId = req.params.id;

  db.query('DELETE FROM questions WHERE id = ?', [questionId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  });
});

// Check user role
app.get('/api/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const { user_id, username, email, role } = req.session.user;
  res.json({ user_id, username, email, role });
});

// Load quiz
app.get('/questions', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "User not logged in" });
  }
  let { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  const normalizedCategory = category === 'General Knowledge' ? 'GK' : category;
  console.log('Fetching questions for category:', normalizedCategory);
  db.query('SELECT * FROM questions WHERE category = ?', [normalizedCategory], (err, results) => {
    if (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Questions found:', results.length);
    res.json(results);
  });
});

// Submit quiz
app.post('/submit-quiz', (req, res) => {
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

  const normalizedCategory = category === 'General Knowledge' ? 'GK' : category;
  let correctAnswers = 0;
  const queries = answers.map(answer => {
    return new Promise((resolve, reject) => {
      db.query('SELECT correct_option FROM questions WHERE id = ?', [answer.question_id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject(new Error("Question not found"));

        const is_correct = results[0].correct_option === answer.selected_option ? 1 : 0;
        if (is_correct) correctAnswers++;

        db.query(
          'INSERT INTO answers (user_id, question_id, selected_option, is_correct) VALUES (?, ?, ?, ?)',
          [user_id, answer.question_id, answer.selected_option, is_correct],
          (err) => err ? reject(err) : resolve()
        );
      });
    });
  });

  Promise.all(queries)
    .then(() => {
      const totalQuestions = answers.length;
      db.query(
        `INSERT INTO user_quiz (user_id, quiz_id, category, total_score, questions_attempted, correct_answers)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, quiz_id, normalizedCategory, correctAnswers, totalQuestions, correctAnswers],
        (err) => {
          if (err) return res.status(500).json({ error: "Error saving quiz results" });
          res.json({
            message: "Quiz submitted successfully",
            score: correctAnswers,
            total: totalQuestions,
            quiz_id: quiz_id
          });
        }
      );
    })
    .catch(err => {
      console.error("Quiz submission error:", err);
      res.status(500).json({ error: "Database error", details: err.message });
    });
});

// Fetch quiz results
app.get('/quiz-results/:quiz_id', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "User not logged in" });
  }
  const { user_id } = req.session.user;
  const { quiz_id } = req.params;

  db.query(`
    SELECT q.id, q.question_text, a.selected_option, q.correct_option, a.is_correct 
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    JOIN user_quiz uq ON uq.quiz_id = ? AND uq.user_id = a.user_id
    WHERE a.user_id = ?
  `, [quiz_id, user_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

// Get user quiz statistics
app.get('/quiz-stats', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const userId = req.session.user.user_id;
  
  const query = `
    SELECT 
      category,
      COUNT(*) as attempts,
      MAX(total_score) as highScore,
      AVG(total_score) as average
    FROM 
      user_quiz
    WHERE 
      user_id = ?
    GROUP BY 
      category
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: "Failed to fetch quiz statistics" });
    }
    
    // Map category for client consistency
    const mappedResults = results.map(result => ({
      ...result,
      category: result.category === 'GK' ? 'General Knowledge' : result.category
    }));
    
    res.json(mappedResults);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
