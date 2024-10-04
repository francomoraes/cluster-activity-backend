// src/seed.ts
import AppDataSource from './db/db';
import { Asset, AssetType } from './models';
import { User } from './models/User';
import { UserCustomAssetType } from './models/UserCustomAssetType';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        // Repositories
        const userRepository = AppDataSource.getRepository(User);
        const assetRepository = AppDataSource.getRepository(Asset);
        const assetTypeRepository = AppDataSource.getRepository(AssetType);
        const userCustomAssetTypeRepository = AppDataSource.getRepository(UserCustomAssetType);

        // Fixed UUIDs for seeding consistency
        const user1Id = uuidv4();
        const user2Id = uuidv4();
        const customType1Id = uuidv4();
        const customType2Id = uuidv4();

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

        // Seed Global Asset Types
        const assetType1 = assetTypeRepository.create({
            asset_class: 'Renda fixa',
            asset_type: 'Bonds Curtos'
        });

        const assetType2 = assetTypeRepository.create({
            asset_class: 'Mercado Imobiliário',
            asset_type: 'Reits'
        });

        const assetType3 = assetTypeRepository.create({
            asset_class: 'Stocks',
            asset_type: 'Stocks'
        });

        await assetTypeRepository.save([assetType1, assetType2, assetType3]);
        console.log('Global Asset Types seeded');

        // Seed User Custom Asset Types
        const customType1 = userCustomAssetTypeRepository.create({
            user_id: user1.id,
            asset_class: 'Crypto',
            asset_type: 'Bitcoin'
        });

        const customType2 = userCustomAssetTypeRepository.create({
            user_id: user2.id,
            asset_class: 'Commodities',
            asset_type: 'Gold'
        });

        await userCustomAssetTypeRepository.save([customType1, customType2]);
        console.log('User Custom Asset Types seeded');

        // Seed Assets
        const asset1 = assetRepository.create({
            user_id: user1.id,
            global_asset_type: assetType1, // Link to a global asset type
            asset_ticker: 'SHV',
            asset_qty: 23.28,
            avg_price: 110.35,
            current_price: 110.58,
            currency: 'USD'
        });

        const asset2 = assetRepository.create({
            user_id: user1.id,
            custom_asset_type: customType1, // Link to a user custom asset type
            asset_ticker: 'BTC',
            asset_qty: 0.5,
            avg_price: 45000,
            current_price: 50000,
            currency: 'USD'
        });

        const asset3 = assetRepository.create({
            user_id: user2.id,
            global_asset_type: assetType2, // Link to a global asset type
            asset_ticker: 'VNQ',
            asset_qty: 20,
            avg_price: 100.0,
            current_price: 110.0,
            currency: 'USD'
        });

        const asset4 = assetRepository.create({
            user_id: user2.id,
            custom_asset_type: customType2, // Link to a user custom asset type
            asset_ticker: 'GLD',
            asset_qty: 10,
            avg_price: 1800.0,
            current_price: 1900.0,
            currency: 'USD'
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
