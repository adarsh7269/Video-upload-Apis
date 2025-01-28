
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const routes = require('./routes');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use(routes);

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
