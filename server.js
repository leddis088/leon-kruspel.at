const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: false, // We provide a meta-based CSP in index.html
  crossOriginEmbedderPolicy: false
}));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html by default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Listen on port 3000
const PORT = 8800;
app.listen(PORT, () => {
  console.log(`Leon site (Node) listening on http://localhost:${PORT}`);
});
