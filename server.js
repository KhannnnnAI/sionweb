const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));

// API endpoints
const soundcloudHandler = require('./api/soundcloud-profile');
app.get('/api/soundcloud-profile', soundcloudHandler);

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'Web Sion API is running' });
});

// Phục vụ giao diện web tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback (Express 5 compatible)
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
