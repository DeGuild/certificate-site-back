/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by certificatelicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const express = require("express");
//  const cookieParser = require('cookie-parser')();
const cors = require("cors")({ origin: true });
const certificate = express();

const validateWeb3Token = async (req, res, next) => {
  if (!req.headers.authorization) {
    functions.logger.error(
      "No web token was passed in the Authorization header."
    );
    res.status(403).send("Unauthorized");
    return;
  }

  const token = req.headers.authorization;

  try {
    const { address, body } = await Web3Token.verify(token);
    if (
      address === "0xAe488A5e940868bFFA6D59d9CDDb92Da11bb2cD9" ||
      address === "0x785867278139c1cA73bF1e978461c8028061aDf6" ||
      req.originalUrl === "/test"
    ) {
      next();
      return;
    }
  } catch (error) {
    functions.logger.error("Error while verifying Firebase ID token:", error);
  }
  res.status(403).send("Unauthorized");
  return;
};

const addCertificate = async (req, res) => {
  const address = req.body.address;
  const tokenId = req.body.tokenId;
  const title = req.body.title;
  const url = req.body.url
    ? req.body.url
    : "https://firebasestorage.googleapis.com/v0/b/deguild-2021.certificatespot.com/o/0.png?alt=media&token=131e4102-2ca3-4bf0-9480-3038c45aa372";
  // Push the new message into Firestore using the Firebase Admin SDK.
  await admin
    .firestore()
    .collection(`Certificate/${address}/tokens`)
    .doc(tokenId)
    .set({ url, address, tokenId: parseInt(tokenId, 10), title });

  // Send back a message that we've successfully written the message
  res.json({
    result: "Successful",
  });
};

const deleteCertificate = async (req, res) => {
  // Grab the text parameter.
  const address = req.body.address;
  // Push the new message into Firestore using the Firebase Admin SDK.
  await admin.firestore().collection("Certificate/").doc(`${address}`).delete();

  // Send back a message that we've successfully written the message
  res.json({
    result: "Successful",
  });
};

certificate.use(cors);
// certificate.use(validateWeb3Token);
certificate.post("/addCertificate", addCertificate);
certificate.post("/deleteCertificate", deleteCertificate);

exports.certificate = functions.https.onRequest(certificate);
