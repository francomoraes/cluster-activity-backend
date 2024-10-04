import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    name: 'user_custom_asset_types'
})
class UserCustomAssetType {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'uuid' })
    user_id!: string; // References the id in the User table

    @Column({ type: 'varchar', length: 255 })
    asset_class!: string;

    @Column({ type: 'varchar', length: 255 })
    asset_type!: string;
}

export { UserCustomAssetType };
