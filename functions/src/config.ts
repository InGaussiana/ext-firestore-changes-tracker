export const config = {
  collection: process.env.COLLECTION,
  logsCollection: process.env.LOGS_COLLECTION ?? "logs",
  ignoreFields: process.env.IGNORE_FIELDS ?? "",
  authorField: process.env.AUTHOR_FIELD ?? "updated_by",
};
