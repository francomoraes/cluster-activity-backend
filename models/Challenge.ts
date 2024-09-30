import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Workspace } from './Workspace';
import { User } from './User';

@Entity({
    name: 'challenges'
})
class Challenge {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({
        nullable: true
    })
    description!: string;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;

    @Column({
        default: true
    })
    isActive!: boolean;

    @Column({
        nullable: true
    })
    memberLimit!: number;

    @Column({
        nullable: true
    })
    image!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'ownerId' })
    user!: User;

    @ManyToOne(() => Workspace)
    @JoinColumn({ name: 'ownerId' })
    workspace!: Workspace;
}

export { Challenge };
