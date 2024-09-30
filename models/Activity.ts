import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Challenge } from './Challenge';

@Entity({
    name: 'activities'
})
class Activity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column({ nullable: true })
    description!: string;

    @Column()
    image!: string;

    @Column()
    type!: string;

    @Column()
    duration!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'ownerId' })
    user!: User;

    @ManyToOne(() => Challenge)
    @JoinColumn({ name: 'challengeId' })
    challenge!: Challenge;
}

export { Activity };
