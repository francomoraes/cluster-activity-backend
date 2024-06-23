import { Model, Column, Table, PrimaryKey, DataType, Default, HasMany } from 'sequelize-typescript';
import { Workspace } from './Workspace';
import { Challenge } from './Challenge';

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
    workspaces!: Workspace[];

    @HasMany(() => Challenge)
    challenges!: Challenge[];
}

export { User };
