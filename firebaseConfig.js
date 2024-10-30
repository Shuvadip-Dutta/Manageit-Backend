const admin = require("firebase-admin");

const serviceAccount = require("./upload-89b43-firebase-adminsdk-is3ca-f837760081.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'upload-89b43.appspot.com'
});

const bucket = admin.storage().bucket();
module.exports = bucket;