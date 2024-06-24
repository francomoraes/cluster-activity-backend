// UserChallenge.ts
import { Model, Column, Table, ForeignKey, DataType } from 'sequelize-typescript';
import { User } from './User';
import { Challenge } from './Challenge';

@Table({
    tableName: 'user_challenges'
})
class UserChallenge extends Model {
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    userId!: string;

    @ForeignKey(() => Challenge)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    challengeId!: string;
}

export { UserChallenge };
