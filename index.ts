import express from 'express';
import cors from 'cors';
import db from './db/db';
import UserRoutes from './routes/UserRoutes';
import WorkspaceRoutes from './routes/WorkspaceRoutes';

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

db
    // .sync({force: true}).then(() => {
    .sync()
    .then(() => {
        app.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    })
    .catch((error: Error) => {
        console.log('Error: ', error);
    });
