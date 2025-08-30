import { closeDb, openDb, Route } from "gtfs";
import { readFile } from "fs/promises";
import path from "node:path";
import { stopTimes } from "gtfs/models";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const config = JSON.parse(
  await readFile(
    path.join(import.meta.dirname, "../gtfs-config/url-config.json"),
    "utf-8"
  )
);

const db = openDb(config);

const routeNames = [
  "F6", // Distelweg
  "F2", // IJplein
  "F1", // Zamenhofstraat
  "F3", // Buiksloterweg
];

// only interested in a few stops
const stopIds = [
  "3152259", // "Amsterdam, Distelweg"
  "3152220", // "Amsterdam, IJplein"
  "3152022", // "Amsterdam, Zamenhofstraat"
  "3153037", // "Amsterdam, Buiksloterweg"
];

function toInPlaceholders(arr: Array<any>) {
  return arr.map(() => "?").join(",");
}

function stopTimesForDay(day: string) {
  const stopTimes: Route[] = db
    .prepare(
      `
WITH today AS (
      SELECT 
    ? AS service_date,
    strftime('%w', date(?)) AS weekday
)
-- SELECT st.departure_time, s.*, st.*, t.*, td.*, c.*, cd.*
SELECT st.departure_time, s.*, st.*
FROM stop_times st
JOIN trips t ON st.trip_id = t.trip_id
JOIN routes r ON t.route_id = r.route_id
JOIN stops s ON st.stop_id = s.stop_id
JOIN today td
LEFT JOIN calendar c ON t.service_id = c.service_id
LEFT JOIN calendar_dates cd ON (
    t.service_id = cd.service_id AND cd.date = strftime('%Y%m%d','now')
)
WHERE 
    r.route_short_name IN (${toInPlaceholders(routeNames)})
    AND t.direction_id = 0 -- filter by outbound only
    AND s.stop_id IN (${toInPlaceholders(stopIds)})
  AND (
        -- Case 1: calendar_dates overrides calendar
        (cd.exception_type = 1)      -- added today
        OR (cd.exception_type IS NULL -- no exception, use regular calendar
            AND c.start_date <= strftime('%Y%m%d','now')
            AND c.end_date >= strftime('%Y%m%d','now')
            AND (
                (td.weekday = '0' AND c.sunday = 1) OR
                (td.weekday = '1' AND c.monday = 1) OR
                (td.weekday = '2' AND c.tuesday = 1) OR
                (td.weekday = '3' AND c.wednesday = 1) OR
                (td.weekday = '4' AND c.thursday = 1) OR
                (td.weekday = '5' AND c.friday = 1) OR
                (td.weekday = '6' AND c.saturday = 1)
            )
        )
      )
  AND NOT (cd.exception_type = 2)  -- removed today
ORDER BY st.departure_time;
`
    )
    .all(day, day, ...routeNames, ...stopIds);

  return stopTimes;
}

new Date().toISOString();
// console.log(stopTimesForDay("20250817"));
const stopTimesToday = stopTimesForDay(new Date().toISOString());
const stopTimesTomorrow = stopTimesForDay(getTomorrowDate().toISOString());

const stopTimesTodayAndTomorrow = [...stopTimesToday, ...stopTimesTomorrow];

const output = JSON.stringify(stopTimesTodayAndTomorrow);
console.log(stopTimesTodayAndTomorrow);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.join(
  path.resolve(__dirname, ".."),
  "site/output",
  "output.json"
);
writeFileSync(outputFile, output, "utf-8");

// const routes: Route[] = db
//   .prepare(
//     `
//   SELECT *
//   FROM routes
//   WHERE agency_id = ? AND route_short_name IN (${routeNamePlaceholders})
//   ORDER BY route_short_name ASC
// `
//   )
//   .all("GVB", ...routeNames);

// console.log(routes);

// const routeIdPlaceholders = routes.map(() => "?").join(",");

// const trips = db
//   .prepare(
//     `
//     SELECT *
//     FROM trips
//     WHERE route_id IN  (${routeIdPlaceholders})
//     `
//   )
//   .all(...routes.map((r) => r.route_id));

// console.log(trips);

// closeDb(db);

function getTomorrowDate() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return tomorrow;
}
