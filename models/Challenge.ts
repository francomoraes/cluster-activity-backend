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

    @Column({ nullable: false })
    ownerId!: string;

    @Column({ nullable: false })
    workspaceId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'ownerId' })
    user!: User;

    @ManyToOne(() => Workspace)
    @JoinColumn({ name: 'workspaceId' })
    workspace!: Workspace;
}

export { Challenge };
