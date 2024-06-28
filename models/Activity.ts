import { BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from './User';
import { Challenge } from './Challenge';

@Table({
    tableName: 'activities'
})
class Activity extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: string;

    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    title!: string;

    @Column({
        type: DataType.STRING
    })
    description!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    image!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    type!: string;

    @Column({
        type: DataType.INTEGER
    })
    duration!: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    ownerId!: string;

    @ForeignKey(() => Challenge)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    challengeId!: string;

    @BelongsTo(() => User)
    user!: User;

    @BelongsTo(() => Challenge)
    challenge!: Challenge;
}

export { Activity };
