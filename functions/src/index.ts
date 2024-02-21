import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { config } from "./config";
import { DocumentData, DocumentSnapshot } from "firebase-admin/firestore";

admin.initializeApp();

exports.trackDocumentChanges = functions
  .runWith({ failurePolicy: true })
  .firestore.document(`${config.collection}/{documentId}`)
  .onWrite(async (data, context) => {
    // If changed document is a history record, abort
    if (data.after.ref.path.startsWith(`${config.logsCollection}/`)) {
      return;
    }

    // If creatting document
    if (!data.before.exists) {
      functions.logger.log(`Document CREATED (${data.after.ref.path})`);
      await saveRecord("CREATE", data.before, data.after, context);
      return;
    }

    // If deleting document
    if (!data.after.exists) {
      functions.logger.log(`Document DELETED (${data.after.ref.path})`);
      await saveRecord("DELETE", data.before, data.after, context);
      return;
    }

    functions.logger.log(`Document UPDATED (${data.after.ref.path})`);
    await saveRecord("UPDATE", data.before, data.after, context);
  });

async function saveRecord(
  operation: "CREATE" | "UPDATE" | "DELETE",
  before: DocumentSnapshot,
  after: DocumentSnapshot,
  context: functions.EventContext
) {
  const beforeData = getVersionedFields(before);
  const afterData = getVersionedFields(after);

  if (!documentChanged(beforeData, afterData)) {
    functions.logger.log(
      `No change found on (${after.ref.path}), Skiping log save`
    );
    return;
  }

  try {
    const record: DocumentData = {
      operation,
      collection: config.collection,
      document: after.ref.path,
      date: context.timestamp,
    };

    const author = getChangeAuthor(after.data() ?? {});
    if (author) {
      record.author = author;
    }

    if (operation === "UPDATE") {
      record.diff = getDocDiff(beforeData, afterData);
    }

    await admin
      .firestore()
      .collection(config.logsCollection)
      .add(nestObject(record));
  } catch (error) {
    functions.logger.error(`ERROR saving record`, error);
    throw error;
  }
}

function getDocDiff(beforeData: DocumentData, afterData: DocumentData) {
  const diff: { [key: string]: { old: any; new: any } } = {};

  [beforeData, afterData].forEach((version) => {
    Object.keys(version ?? {}).forEach((key) => {
      if (diff[key]) return;

      if (JSON.stringify(beforeData[key]) !== JSON.stringify(afterData[key])) {
        diff[key] = {
          old: beforeData[key] ?? null,
          new: afterData[key] ?? null,
        };
      }
    });
  });

  return diff;
}

function getChangeAuthor(document: DocumentData) {
  if (!config.authorField) return;
  return document[config.authorField];
}

export function documentChanged(
  beforeData: DocumentData,
  afterData: DocumentData
) {
  if (Object.entries(beforeData).length !== Object.entries(afterData).length) {
    return true;
  }

  for (const key of Object.keys(beforeData)) {
    if (JSON.stringify(beforeData[key]) !== JSON.stringify(afterData[key])) {
      return true;
    }
  }

  return false;
}

export function getVersionedFields(document: DocumentSnapshot) {
  const data: DocumentData = flattenObject(document.data());
  const toIgnore = config.ignoreFields.split(",").map((x) => x.trim());
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !toIgnore.includes(key))
  );
}

const flattenObject = (obj?: DocumentData, parentKey = "") => {
  if (parentKey !== "") parentKey += ".";
  let flattened: DocumentData = {};
  Object.keys(obj ?? {}).forEach((key) => {
    if (
      typeof obj?.[key] === "object" &&
      obj[key] !== null &&
      !obj[key].toDate && // Avoid flattening Firebase Timestamps
      Object.prototype.toString.call(obj[key]) !== "[object Date]"
    ) {
      Object.assign(flattened, flattenObject(obj[key], parentKey + key));
    } else {
      flattened[parentKey + key] = obj?.[key];
    }
  });
  return flattened;
};

export function nestObject(document: DocumentData) {
  return Object.entries(flattenObject(document)).reduce(
    (acc, [path, value]) => (
      path
        .split(".")
        .reduce(
          (finalValue, subpath, i, pathArray) =>
            (finalValue[subpath] ??= i === pathArray.length - 1 ? value : {}),
          acc as DocumentData
        ),
      acc
    ),
    {}
  );
}
