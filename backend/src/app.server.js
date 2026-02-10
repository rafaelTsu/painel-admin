import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './env.config.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { auditMiddleware } from './middlewares/audit.middleware.js';
import { testConnection } from './db/sequelize.db.js';
import { healthRouter } from './routes/health.router.js';
import { authRouter } from './routes/auth.router.js';
import { userRouter } from './routes/user.router.js';
import { groupRouter } from './routes/group.router.js';
import { variableRouter } from './routes/variable.router.js';
import { categoryRouter } from './routes/category.router.js';
import { templateRouter } from './routes/template.router.js';
import simulationRouter from './routes/simulation.router.js';
import { globalVariableRouter } from './routes/global-variable.router.js';
import { authenticate } from './middlewares/auth.middleware.js';
import { requireGroupMembership } from './middlewares/require-group-membership.middleware.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global middlewares
app.use(auditMiddleware);

// Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/groups', groupRouter);
app.use('/api/variables', authenticate, globalVariableRouter); // Global Library

// Group scoped resources
// /api/groups/:groupId/variables
app.use('/api/groups/:groupId/variables', authenticate, requireGroupMembership, variableRouter);
// /api/groups/:groupId/categories
app.use('/api/groups/:groupId/categories', authenticate, requireGroupMembership, categoryRouter);
// /api/groups/:groupId/templates
app.use('/api/groups/:groupId/templates', authenticate, requireGroupMembership, templateRouter);
// /api/groups/:groupId/simulations
app.use('/api/groups/:groupId/simulations', authenticate, requireGroupMembership, simulationRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Admin Panel API' });
});

// Error handling - must be last
app.use(errorMiddleware);

// Server startup
const start = async () => {
    try {
        await testConnection();
        app.listen(env.PORT, () => {
             console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

// Only start if running directly (simple check)
if (process.argv[1] && process.argv[1].endsWith('app.server.js')) {
    start();
}

export { app };
