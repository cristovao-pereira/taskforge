import 'dotenv/config';
const commonKeys = ['FIREBASE_SERVICE_ACCOUNT', 'FIREBASE_CONFIG', 'FIREBASE_API_KEY', 'FIREBASE_TOKEN', 'GOOGLE_APPLICATION_CREDENTIALS'];
commonKeys.forEach(key => {
  if (process.env[key]) {
    console.log(`Found: ${key}`);
  }
});
