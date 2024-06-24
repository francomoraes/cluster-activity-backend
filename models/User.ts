import { Model, Column, Table, PrimaryKey, DataType, Default, HasMany, BelongsToMany } from 'sequelize-typescript';
import { Workspace } from './Workspace';
import { Challenge } from './Challenge';
import { UserWorkspace } from './UserWorkspace';
import { UserChallenge } from './UserChallenge';
import { Activity } from './Activity';

@Table({
    tableName: 'users'
})
class User extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    password!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    avatar?: string | null;

    @HasMany(() => Workspace)
    ownedWorkspaces!: Workspace[];

    @BelongsToMany(() => Workspace, () => UserWorkspace)
    joinedWorkspaces!: Workspace[];

    @HasMany(() => Challenge)
    createdChallenges!: Challenge[];

    @BelongsToMany(() => Challenge, () => UserChallenge)
    joinedChallenges!: Challenge[];

    @HasMany(() => Activity)
    activities!: Activity[];
}

export { User };
