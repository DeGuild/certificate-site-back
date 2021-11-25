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
const cors = require("cors")({ origin: true });
const certificate = express();

const ownableABI = require("./contracts/Ownable.json").abi;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const Web3Token = require("web3-token");

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
    if (address) {
      next();
      return;
    }
  } catch (error) {
    functions.logger.error("Error while verifying Firebase ID token:", error);
  }
  res.status(403).send("Unauthorized");
  return;
};

const addCertificateWeb3 = async (req, res) => {
  const web3 = createAlchemyWeb3(functions.config().web3.api);

  const token = req.headers.authorization;
  const { address, body } = await Web3Token.verify(token);
  const userAddress = web3.utils.toChecksumAddress(address);

  const addressCertificate = req.body.address;
  const tokenId = req.body.tokenId;
  const title = req.body.title;
  const url = req.body.url;

  const ownable = new web3.eth.Contract(ownableABI, addressCertificate);
  const ownerOfManager = await ownable.methods.owner().call();
  functions.logger.log(ownerOfManager, userAddress);

  if (ownerOfManager !== userAddress) {
    res.status(403).send("Unauthorized");
    return;
  }
  await admin
    .firestore()
    .collection(`Certificate/`)
    .doc(addressCertificate)
    .set({ address: addressCertificate });

  // Push the new message into Firestore using the Firebase Admin SDK.
  await admin
    .firestore()
    .collection(`Certificate/${addressCertificate}/tokens`)
    .doc(tokenId)
    .set({ url, address: addressCertificate, tokenId: parseInt(tokenId, 10), title });

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
certificate.use(validateWeb3Token);
// certificate.post("/addCertificate", addCertificate);
certificate.post("/addCertificate", addCertificateWeb3);
certificate.post("/deleteCertificate", deleteCertificate);

exports.certificate = functions.https.onRequest(certificate);
