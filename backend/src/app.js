// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { getConnection } from './config/database.js';
import routes from './routes/index.js';
import { specs } from './docs/swagger.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, error: 'Too many requests' } }));

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true, customCss: '.swagger-ui .topbar { display: none }' }));

// Routes
app.use('/api', routes);

// Home
app.get('/', (req, res) => res.json({ name: 'ChronosPresence API', version: '2.0.0', docs: '/docs', health: '/health' }));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Error handler
app.use((err, req, res, next) => res.status(500).json({ success: false, error: err.message }));

// Start
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger: http://localhost:${PORT}/docs`);
  try {
    await getConnection();
    console.log('✅ Database ready');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
});

export default app;