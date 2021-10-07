// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();
const cors = require("cors")({
  origin: true,
});

exports.addCertificate = functions.https.onRequest(async (req, res) => {
  const address = req.body.address;
  const url = req.body.url
    ? req.body.url
    : "https://firebasestorage.googleapis.com/v0/b/deguild-2021.appspot.com/o/0.png?alt=media&token=131e4102-2ca3-4bf0-9480-3038c45aa372";
  // Push the new message into Firestore using the Firebase Admin SDK.
  await admin
    .firestore()
    .collection("certificate/")
    .doc(`${address}`)
    .set({ url, address });

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

  cors(
    (req,
    res,
    () => {
      res.json({
        imageUrl: `${readResult.data().url}`,
      });
    })
  );
});

exports.deleteCertificate = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const address = req.body.address;
  // Push the new message into Firestore using the Firebase Admin SDK.
  await admin.firestore().collection("certificate/").doc(`${address}`).delete();

  // Send back a message that we've successfully written the message
  res.json({
    result: "Successful",
  });
});

exports.allCertificates = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const lastItem = req.path;
  let data = [];
  if (lastItem.length > 1) {
    const paths = lastItem.split("/");
    if (paths[2] === "next") {
      const startAtSnapshot = admin
        .firestore()
        .collection("certificate/")
        .orderBy("address", "desc")
        .startAfter(paths[1]);

      const items = await startAtSnapshot.limit(8).get();
      items.forEach((doc) => {
        data.push(doc.id);
      });
    } else if (paths[2] === "previous") {
      const startAtSnapshot = admin
        .firestore()
        .collection("certificate/")
        .orderBy("address", "asc")
        .startAfter(paths[1]);

      const items = await startAtSnapshot.limit(8).get();
      items.forEach((doc) => {
        data.push(doc.id);
      });
    }
  } else {
    const readResult = await admin
      .firestore()
      .collection("certificate/")
      .orderBy("address", "desc")
      .limit(8)
      .get();
    // Send back a message that we've successfully written the message3
    readResult.forEach((doc) => {
      data.push(doc.id);
    });
    // readResult.map
    functions.logger.log(readResult);
  }

  cors(
    (req,
    res,
    () => {
      res.json({
        result: data,
      });
    })
  );
});
