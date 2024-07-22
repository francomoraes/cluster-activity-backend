import { User } from '../models/User';

export async function findOrCreateUserFromGoogle(profile: any): Promise<User | null> {
    const { sub: googleId, name, email, picture: avatar } = profile || {};

    let user = await User.findOne({ where: { email } });

    if (!user) {
        user = await User.create({
            name,
            email,
            googleId,
            avatar,
            password: null
        });
    }

    return user;
}
