const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Create data directory
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  console.log('Creating data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create admin config file
const adminConfigFile = path.join(dataDir, 'admin-config.json');
const password = 'rollwithadvantage';
const hashedPassword = bcrypt.hashSync(password, 10);

const adminConfig = {
  username: 'admin',
  passwordHash: hashedPassword,
  createdAt: new Date().toISOString()
};

fs.writeFileSync(
  adminConfigFile,
  JSON.stringify(adminConfig, null, 2),
  'utf8'
);

console.log('Admin config file created successfully at:', adminConfigFile);
console.log('Username: admin');
console.log('Password: rollwithadvantage');