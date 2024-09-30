import { Request, Response } from 'express';
import { Repository, In } from 'typeorm';
import getToken from './get-token';
import getUserByToken from './get-user-by-token';
import { User } from '../models/User';
import AppDataSource from '../db/db'; // Import the initialized AppDataSource

export const getMembers = async (
    req: Request,
    res: Response,
    entityModel: Repository<any>, // TypeORM repository for the entity (e.g., Challenge, Workspace)
    userEntityModel: Repository<any>, // TypeORM repository for the join table (e.g., UserChallenge, UserWorkspace)
    entityId: string,
    idParamName: string
) => {
    try {
        // Step 1: Get Token
        const token = getToken(req);

        if (!token) {
            return res.status(401).json({ message: 'No token found' });
        }

        // Step 2: Get User by Token
        const user = await getUserByToken(token);

        if (!user) {
            return res.status(401).json({ message: 'No user found' });
        }

        // Step 3: Get All UsersIds linked to the Entity
        const userEntities = await userEntityModel.find({
            where: {
                [idParamName]: entityId
            },
            relations: ['user'] // Ensure the User relation is loaded if using an object
        });

        if (!userEntities || userEntities.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        // Extract user IDs from the join table
        const userIds = userEntities.map((userEntity) => userEntity.user.id);

        // Step 4: Get All Users
        const members = await AppDataSource.getRepository(User).find({
            where: {
                id: In(userIds)
            },
            select: ['id', 'name', 'email'] // Exclude sensitive fields like password
        });

        // Step 5: Return Members
        return res.status(200).json(members);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};
