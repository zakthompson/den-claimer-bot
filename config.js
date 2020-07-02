module.exports = {
  defaultPrefix: '.',
  token: process.env.BOT_TOKEN,
  connectionString: process.env.DATABASE_URL || 'mongodb://localhost:27017',
  dbName: process.env.DB_NAME || 'den-claimer',
};
