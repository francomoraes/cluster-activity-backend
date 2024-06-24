import { Model, Column, Table, PrimaryKey, DataType, Default, ForeignKey, BelongsToMany, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { UserWorkspace } from './UserWorkspace';
import { Challenge } from './Challenge';
//Workspace

@Table({
    tableName: 'workspaces'
})
class Workspace extends Model {
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
        allowNull: true
    })
    description!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    ownerId!: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    isPrivate!: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
    isActive!: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    memberLimit!: number;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    image!: string;

    @BelongsToMany(() => User, () => UserWorkspace)
    users!: User[];

    @HasMany(() => Challenge, 'workspaceId')
    challenges!: Challenge[];
}

export { Workspace };
