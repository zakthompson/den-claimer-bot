const assert = require('assert');
const { MongoClient } = require('mongodb');

const { connectionString, dbName } = require('../config');

const client = new MongoClient(connectionString, { useUnifiedTopology: true });

class Database {
  constructor() {
    client.connect((err) => {
      assert.equal(null, err);
      console.log('Connected to database');
      this.current = client.db(dbName);
    });
  }
}

module.exports = new Database();
