import { importGtfs } from "gtfs";
import { readFile } from "fs/promises";
import path from "node:path";

const config = JSON.parse(
  await readFile(
    path.join(import.meta.dirname, "../gtfs-config/url-config.json"),
    "utf-8",
  ),
);

try {
  await importGtfs(config);
  console.log("Done!");
} catch (error) {
  console.error("Failed!");
  console.error(error);
}
