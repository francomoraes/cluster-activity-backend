import { User } from '../models/User';
import AppDataSource from '../db/db'; // Import the initialized AppDataSource
import { Repository } from 'typeorm';

export async function findOrCreateUserFromGoogle(profile: any): Promise<User | null> {
    const { sub: googleId, name, email, picture: avatar } = profile || {};

    // Get the User repository
    const userRepository: Repository<User> = AppDataSource.getRepository(User);

    // Find the user by email
    let user = await userRepository.findOne({ where: { email } });

    // If user doesn't exist, create a new one
    if (!user) {
        user = userRepository.create({
            name,
            email,
            googleId,
            avatar,
            password: undefined
        });

        await userRepository.save(user);
    }

    return user;
}
