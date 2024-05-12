import {
    Model,
    Column,
    Table,
    PrimaryKey,
    DataType,
    Default
} from 'sequelize-typescript';

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
}

export { User };
