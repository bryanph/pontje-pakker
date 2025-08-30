import { importGtfs } from "gtfs";
import { readFile } from "fs/promises";
import path from "node:path";

const config = JSON.parse(
  await readFile(
    path.join(import.meta.dirname, "../gtfs-config/url-config.json"),
    "utf-8"
  )
);

try {
  await importGtfs(config);
} catch (error) {
  console.error(error);
}
