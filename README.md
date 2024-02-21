# Firestore Document Changes Tracker

**Author**: Gaussiana 

**Description**: Creates firestore logs for every change on a collection.



**Details**: Use this extension to save a log of changes in all the documents on a collection


# Billing

This extension uses other Firebase or Google Cloud Platform services which may have associated charges:

- Cloud Functions

When you use Firebase Extensions, you're only charged for the underlying resources that you use. A paid-tier billing plan is only required if the extension uses a service that requires a paid-tier plan, for example calling to a Google Cloud Platform API or making outbound network requests to non-Google services. All Firebase services offer a free tier of usage. [Learn more about Firebase billing.](https://firebase.google.com/pricing)




**Configuration Parameters:**

* Collection path to track changes: Collection path to track changes

* Collection path to store changes: Collection path where all the logs will be saved

* Ignore fields: Comma separated fields that won't trigger a new history version (nor will be saved on the version data). Nested fields are supported with parent.child syntax.

* Field name with modifier user information: Field where the user that made the last change is store (if present it gets copied to log, else ignored)



**Cloud Functions:**

* **trackDocumentChanges:** Firestore-OnWrite-triggered function that keep track of the changes of documents



**Access Required**:



This extension will operate with the following project IAM roles:

* datastore.user (Reason: Allows the extension to write to Firestore.)
