# See it in action

Update, create or delete any document and see the log being created inside `${param:LOGS_COLLECTION}`.

Everything in `${param:AUTHOR_FIELD}` field will be saved in the "author" key.

### TS Interfaces

```ts
interface LogRecord {
  id: string;
  collection: string;
  date: Date;
  document: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  author?: { id: string; name: string };
  diff?: LogDiff;
}

interface LogDiff {
  [x: string]: LogDiff | { old: any; new: any };
}
```

# Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.
