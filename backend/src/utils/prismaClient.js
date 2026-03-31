const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSQLite } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');

const databasePath = path.join(__dirname, '../../prisma/ns-foundation.db'); // Adjust path as needed

const connection = new Database(databasePath);
const adapter = new PrismaBetterSQLite(connection);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
