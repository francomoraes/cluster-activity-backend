// src/seed.ts
import AppDataSource from './db/db';
import { Asset, AssetType } from './models';
import { User } from './models/User';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        // Repositories
        const userRepository = AppDataSource.getRepository(User);
        const assetRepository = AppDataSource.getRepository(Asset);
        const assetTypeRepository = AppDataSource.getRepository(AssetType);

        // Fixed UUIDs for seeding consistency
        const user1Id = uuidv4();
        const user2Id = uuidv4();

        // Seed Users
        const user1 = userRepository.create({
            id: user1Id,
            name: 'John Doe',
            email: 'john@example.com',
            password: '123' // Use bcrypt in real scenarios
        });

        const user2 = userRepository.create({
            id: user2Id,
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: '123'
        });

        await userRepository.save([user1, user2]);
        console.log('Users seeded');

        // Seed AssetTypes
        const assetType1 = assetTypeRepository.create({
            user: user1,
            asset_class: 'Renda Fixa',
            asset_type: 'Bonds Curtos'
        });

        const assetType2 = assetTypeRepository.create({
            user: user1,
            asset_class: 'Renda Fixa',
            asset_type: 'Pré-fixado'
        });

        const assetType3 = assetTypeRepository.create({
            user: user2,
            asset_class: 'Stocks',
            asset_type: 'Stocks'
        });

        const assetType4 = assetTypeRepository.create({
            user: user2,
            asset_class: 'Mercado Imobiliário',
            asset_type: 'Reits'
        });

        // Save AssetTypes before using them in Assets
        await assetTypeRepository.save([assetType1, assetType2, assetType3, assetType4]);
        console.log('AssetTypes seeded');

        // Seed Assets with correct relationships to AssetTypes
        const asset1 = assetRepository.create({
            user_id: user1.id,
            asset_class: assetType1.asset_class,
            asset_type: assetType1.asset_type,
            asset_ticker: 'BRCR11',
            asset_qty: 100,
            avg_price: 100,
            current_price: 105,
            currency: 'BRL',
            custody: 'XP'
        });

        const asset2 = assetRepository.create({
            user_id: user1.id,
            asset_class: assetType2.asset_class,
            asset_type: assetType2.asset_type,
            asset_ticker: 'BRCR11',
            asset_qty: 100,
            avg_price: 100,
            current_price: 105,
            currency: 'BRL',
            custody: 'XP'
        });

        const asset3 = assetRepository.create({
            user_id: user2.id,
            asset_class: assetType3.asset_class,
            asset_type: assetType3.asset_type,
            asset_ticker: 'AAPL',
            asset_qty: 100,
            avg_price: 100,
            current_price: 105,
            currency: 'USD',
            custody: 'Avenue'
        });

        const asset4 = assetRepository.create({
            user_id: user2.id,
            asset_class: assetType4.asset_class,
            asset_type: assetType4.asset_type,
            asset_ticker: 'XPML11',
            asset_qty: 100,
            avg_price: 100,
            current_price: 105,
            currency: 'BRL',
            custody: 'XP'
        });

        await assetRepository.save([asset1, asset2, asset3, asset4]);
        console.log('Assets seeded');

        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding the database:', error);
    } finally {
        await AppDataSource.destroy(); // Close the data source connection
    }
}

seedDatabase();
