import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './User';
import { Workspace } from './Workspace';

@Table({
    tableName: 'user_workspaces'
})
class UserWorkspace extends Model {
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    userId!: number;

    @ForeignKey(() => Workspace)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    workspaceId!: number;
}

export { UserWorkspace };
