import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface User extends JwtPayload {
            id: number; // Ensure it's not optional if you're certain it will always be present
        }

        interface Request {
            user?: User;
            workspace?: Workspace;
        }
    }
}
