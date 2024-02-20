import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { collectionName } from "./config";

admin.initializeApp();

exports.trackDocumentChanges = functions
  .runWith({ failurePolicy: true })
  .firestore.document(collectionName)
  .onWrite(async (data, context) => {
    // If creatting document
    if (!data.before.exists) {
      return;
    }

    // If deleting document
    if (!data.after.exists) {
      return;
    }

    functions.logger.log(`Document UPDATED (${data.after.ref.path})`);
  });
