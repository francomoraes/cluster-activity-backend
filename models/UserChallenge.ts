import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Challenge } from './Challenge';

@Entity({
    name: 'user_challenges'
})
class UserChallenge {
    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToOne(() => Challenge)
    @JoinColumn({ name: 'challengeId' })
    challenge!: Challenge;
}

export { UserChallenge };
