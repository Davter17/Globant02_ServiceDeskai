// MongoDB initialization script
// This script runs when the MongoDB container is first created

db = db.getSiblingDB('servicedesk');

// Create collections
db.createCollection('users');
db.createCollection('offices');
db.createCollection('reports');
db.createCollection('messages');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.reports.createIndex({ status: 1 });
db.reports.createIndex({ userId: 1 });
db.reports.createIndex({ createdAt: -1 });
db.messages.createIndex({ reportId: 1 });
db.messages.createIndex({ createdAt: -1 });

print('Database initialized successfully!');
