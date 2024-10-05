import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    name: 'assets'
})
class Asset {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'uuid' })
    user_id!: string;

    @Column({ type: 'varchar', length: 255 })
    asset_class!: string;

    @Column({ type: 'varchar', length: 255 })
    asset_type!: string;

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

    @Column({ type: 'varchar', length: 255 })
    custody!: string;
}

export { Asset };
