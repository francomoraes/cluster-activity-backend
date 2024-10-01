import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Workspace } from './Workspace';

@Entity({
    name: 'user_workspaces'
})
class UserWorkspace {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    userId!: string;

    @Column()
    workspaceId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToOne(() => Workspace)
    @JoinColumn({ name: 'workspaceId' })
    workspace!: Workspace;
}

export { UserWorkspace };
