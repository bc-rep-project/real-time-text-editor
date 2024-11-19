const { randomBytes } = require('node:crypto');

function generateSecret() {
  const secret = randomBytes(32).toString('base64');
  console.log('Your NEXTAUTH_SECRET:');
  console.log(secret);
}

generateSecret(); 