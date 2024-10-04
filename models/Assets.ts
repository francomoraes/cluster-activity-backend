import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AssetType } from './AssetTypes';
import { UserCustomAssetType } from './UserCustomAssetType';

@Entity({
    name: 'assets'
})
class Asset {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'uuid' })
    user_id!: string; // References the id in the User table

    @Column({ nullable: true })
    global_asset_type_id!: number;

    @ManyToOne(() => AssetType, (assetType) => assetType.id, { nullable: true })
    @JoinColumn({ name: 'global_asset_type_id' })
    global_asset_type!: AssetType | null;

    @Column({ nullable: true })
    custom_asset_type_id!: number;

    @ManyToOne(() => UserCustomAssetType, (userCustomAssetType) => userCustomAssetType.id, {
        nullable: true
    })
    @JoinColumn({ name: 'custom_asset_type_id' })
    custom_asset_type!: UserCustomAssetType | null;

    @Column({ type: 'varchar', length: 10 })
    asset_ticker!: string;

    @Column({ type: 'float' })
    asset_qty!: number;

    @Column({ type: 'float' })
    avg_price!: number;

    @Column({ type: 'float' })
    current_price!: number;

    @Column({ type: 'varchar', length: 3 })
    currency!: string;
}

export { Asset };
