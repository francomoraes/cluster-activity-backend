import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    name: 'asset_types'
})
class AssetType {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    asset_class!: string;

    @Column({ type: 'varchar', length: 255 })
    asset_type!: string;
}

export { AssetType };
