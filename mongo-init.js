// mongo-init.js — runs once when the container is first created
db = db.getSiblingDB('password_manager');

db.createCollection('users');
db.createCollection('vaultentries');

db.users.createIndex({ googleId: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.vaultentries.createIndex({ owner: 1 });
db.vaultentries.createIndex({ owner: 1, siteName: 1 });

print('MongoDB initialised with indexes.');
