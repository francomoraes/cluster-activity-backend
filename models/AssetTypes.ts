import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity({
    name: 'asset_types'
})
class AssetType {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'varchar', length: 255 })
    asset_class!: string;

    @Column({ type: 'varchar', length: 255 })
    asset_type!: string;
}

export { AssetType };
