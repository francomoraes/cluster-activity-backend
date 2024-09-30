import express from 'express';
import cors from 'cors';
import UserRoutes from './routes/UserRoutes';
import WorkspaceRoutes from './routes/WorkspaceRoutes';
import authRouter from './routes/oauth';
import requestRouter from './routes/request';
import AppDataSource from './db/db';

const app = express();

app.use(express.json());
app.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173'
    })
);
app.use(express.static('public'));

app.use('/users', UserRoutes);
app.use('/workspaces', WorkspaceRoutes);
app.use('/auth/google', authRouter);
app.use('/request', requestRouter);

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected');
        app.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    })
    .catch((error: any) => {
        console.log('Error connecting to database', error);
    });
