// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

exports.addCertificate = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const address = req.body.address;
  const url = req.body.url
    ? req.body.url
    : "https://firebasestorage.googleapis.com/v0/b/deguild-2021.appspot.com/o/0.png?alt=media&token=131e4102-2ca3-4bf0-9480-3038c45aa372";
  // Push the new message into Firestore using the Firebase Admin SDK.
   await admin
    .firestore()
    .collection("certificate/")
    .doc(`${address}`)
    .set({ url });
   await admin
    .firestore()
    .collection("deGuild/skills/addresses/")
    .doc(`${address}`)
    .set({ address });

  // Send back a message that we've successfully written the message
  res.json({
    result: "Successful",
  });
});

exports.readCertificate = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const address = req.path;
  const readResult = await admin
    .firestore()
    .collection("certificate/")
    .doc(address)
    .get();
  // Send back a message that we've successfully written the message
  functions.logger.log(readResult.data());

  res.json({
    imageUrl: `${readResult.data().url}`,
  });
});