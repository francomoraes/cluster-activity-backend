import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Challenge } from './Challenge';

@Entity({
    name: 'user_challenges'
})
class UserChallenge {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    userId!: string;

    @Column()
    challengeId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToOne(() => Challenge)
    @JoinColumn({ name: 'challengeId' })
    challenge!: Challenge;
}

export { UserChallenge };
