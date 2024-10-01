// src/seed.ts
import AppDataSource from './db/db';
import { User } from './models/User';
import { Workspace } from './models/Workspace';
import { Challenge } from './models/Challenge';
import { Activity } from './models/Activity';
import { UserChallenge } from './models/UserChallenge';
import { UserWorkspace } from './models/UserWorkspace';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        // Repositories
        const userRepository = AppDataSource.getRepository(User);
        const workspaceRepository = AppDataSource.getRepository(Workspace);
        const challengeRepository = AppDataSource.getRepository(Challenge);
        const activityRepository = AppDataSource.getRepository(Activity);
        const userChallengeRepository = AppDataSource.getRepository(UserChallenge);
        const userWorkspaceRepository = AppDataSource.getRepository(UserWorkspace);

        // Fixed UUIDs for seeding consistency
        const user1Id = uuidv4();
        const user2Id = uuidv4();
        const workspace1Id = uuidv4();
        const workspace2Id = uuidv4();
        const challenge1Id = uuidv4();
        const challenge2Id = uuidv4();
        const activity1Id = uuidv4();
        const activity2Id = uuidv4();

        // Seed Users
        const user1 = userRepository.create({
            id: user1Id,
            name: 'John Doe',
            email: 'john@example.com',
            password: '123' // Use bcrypt in real scenarios
        });

        const user2 = userRepository.create({
            id: user2Id,
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: '123'
        });

        await userRepository.save([user1, user2]);
        console.log('Users seeded');

        // Seed Workspaces
        const workspace1 = workspaceRepository.create({
            id: workspace1Id,
            name: 'Development Workspace',
            user: user1
        });

        const workspace2 = workspaceRepository.create({
            id: workspace2Id,
            name: 'Testing Workspace',
            user: user2
        });

        await workspaceRepository.save([workspace1, workspace2]);
        console.log('Workspaces seeded');

        // Seed Challenges
        const challenge1 = challengeRepository.create({
            id: challenge1Id,
            name: 'Initial Challenge 1',
            startDate: new Date(),
            endDate: new Date(),
            isActive: true,
            user: user1, // Set the relationship to user1
            workspace: workspace1 // Set the relationship to workspace1
        });

        const challenge2 = challengeRepository.create({
            id: challenge2Id,
            name: 'Initial Challenge 2',
            startDate: new Date(),
            endDate: new Date(),
            isActive: true,
            user: user2, // Set the relationship to user2
            workspace: workspace2 // Set the relationship to workspace2
        });

        await challengeRepository.save([challenge1, challenge2]);
        console.log('Challenges seeded');

        // Seed Activities
        const activity1 = activityRepository.create({
            id: activity1Id,
            title: 'First Activity',
            type: 'Task',
            duration: 60,
            user: user1, // Set the relationship to user1
            challenge: challenge1 // Set the relationship to challenge1
        });

        const activity2 = activityRepository.create({
            id: activity2Id,
            title: 'Second Activity',
            type: 'Task',
            duration: 90,
            user: user2, // Set the relationship to user2
            challenge: challenge2 // Set the relationship to challenge2
        });

        await activityRepository.save([activity1, activity2]);
        console.log('Activities seeded');

        // Seed UserWorkspaces (Associations between Users and Workspaces)
        const userWorkspace1 = userWorkspaceRepository.create({
            user: user1,
            workspace: workspace1
        });

        const userWorkspace2 = userWorkspaceRepository.create({
            user: user2,
            workspace: workspace2
        });

        await userWorkspaceRepository.save([userWorkspace1, userWorkspace2]);
        console.log('UserWorkspaces seeded');

        // Seed UserChallenges (Associations between Users and Challenges)
        const userChallenge1 = userChallengeRepository.create({
            userId: user1.id,
            challengeId: challenge1.id
        });

        const userChallenge2 = userChallengeRepository.create({
            userId: user2.id,
            challengeId: challenge2.id
        });

        await userChallengeRepository.save([userChallenge1, userChallenge2]);
        console.log('UserChallenges seeded');

        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding the database:', error);
    } finally {
        await AppDataSource.destroy(); // Close the data source connection
    }
}

seedDatabase();
