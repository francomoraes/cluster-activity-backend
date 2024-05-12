import {
    Model,
    Column,
    Table,
    PrimaryKey,
    DataType,
    Default
} from 'sequelize-typescript';
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
}

export { Workspace };
