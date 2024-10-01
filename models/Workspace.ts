import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity({
    name: 'workspaces'
})
class Workspace {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({
        nullable: true
    })
    description!: string;

    @Column({
        default: false
    })
    isPrivate!: boolean;

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

    @ManyToOne(() => User)
    @JoinColumn({ name: 'ownerId' })
    user!: User;
}

export { Workspace };
