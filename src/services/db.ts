import { Db, MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.COSMOS_CONNECTION;
const client = new MongoClient(url);

let database: Db = null;

export async function getDb() {
    if (!url) {
        throw new Error('COSMOS_CONNECTION is not set');
    }
    if (!client) {
        throw new Error('Mongo client not initialized');
    }
    if (database) {
        return database;
    } else {
        await client.connect();
        console.log('Connected to MongoDB');
        database = client.db('digital-passport-node');
        return database;
    }
}
