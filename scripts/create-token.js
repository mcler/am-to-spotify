const fs = require('fs');
const jwt = require('apple-music-jwt');

function exitWithError(message) {
    console.error(`⛔️ ${message}`);
    process.exit(-1);
}

const [_, __, keyPath, keyID, teamID] = process.argv;

if (!keyPath) exitWithError('Key path is not specified');
if (!keyID) exitWithError('Key ID is not specified');
if (!teamID) exitWithError('Team ID is not specified');
if (!fs.existsSync(keyPath)) exitWithError('Key file does not exist');

const secret = fs.readFileSync(keyPath, 'utf-8');

if (!secret) exitWithError('Could not read secret from file');

const token = jwt.generate(keyID, teamID, secret);

console.log(`🏁 MusicKit token created: ${token}`);
