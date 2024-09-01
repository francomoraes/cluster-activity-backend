import {
    Model,
    Column,
    Table,
    PrimaryKey,
    DataType,
    Default,
    ForeignKey,
    BelongsTo,
    BelongsToMany,
    HasMany
} from 'sequelize-typescript';
import { Workspace } from './Workspace';
import { User } from './User';
import { UserChallenge } from './UserChallenge';
import { Activity } from './Activity';
//Challenge

@Table({
    tableName: 'challenges'
})
class Challenge extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name!: string;

    @Column({
        type: DataType.STRING
    })
    description!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    startDate!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    endDate!: Date;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    ownerId!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
    isActive!: boolean;

    @Column({
        type: DataType.INTEGER
    })
    memberLimit!: number;

    @Column({
        type: DataType.STRING
    })
    image!: string;

    @ForeignKey(() => Workspace)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    workspaceId!: string;

    @BelongsTo(() => Workspace)
    workspace!: Workspace;

    @BelongsTo(() => User)
    owner!: User;

    @BelongsToMany(() => User, () => UserChallenge)
    users!: User[];

    @HasMany(() => Activity)
    activities!: Activity[];
}

export { Challenge };
