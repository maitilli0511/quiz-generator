const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store for quizzes
const quizzes = {};

// POST /api/quizzes - create a new quiz
app.post('/api/quizzes', (req, res) => {
  const quiz = req.body;
  if (
    !quiz ||
    !Array.isArray(quiz.questions) ||
    quiz.questions.length === 0
  ) {
    return res.status(400).json({ message: 'Invalid quiz data' });
  }

  // Basic validation of quiz questions
  for (const q of quiz.questions) {
    if (
      !q.question ||
      typeof q.question !== 'string' ||
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      q.options.some(opt => typeof opt !== 'string' || !opt.trim()) ||
      typeof q.correctOptionIndex !== 'number' ||
      q.correctOptionIndex < 0 ||
      q.correctOptionIndex >= q.options.length
    ) {
      return res.status(400).json({ message: 'Invalid question format' });
    }
  }

  // Generate unique quiz id
  const id = nanoid(8);
  quizzes[id] = quiz;

  res.json({ id, shareUrl: \`\${req.protocol}://\${req.get('host')}/quiz/\${id}\` });
});

// GET /api/quizzes/:id - get quiz data by id
app.get('/api/quizzes/:id', (req, res) => {
  const id = req.params.id;
  const quiz = quizzes[id];
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  res.json(quiz);
});

// Serve the quiz play page for /quiz/:id route
app.get('/quiz/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Quiz app backend running at http://localhost:\${PORT}\`);
});

