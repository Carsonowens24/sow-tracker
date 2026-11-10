# Sow Tracker online service

A small service that runs on Cloudflare's free plan. It does two optional jobs: sending Sow Tracker's notifications, and sharing records between phones.

## Sharing

When sharing is turned on in the app, each phone sends its records here under a 12-character share code, and the service hands back the combined set. For each entry the most recent change wins, and deleted entries are remembered so they do not come back from another phone. Records are only stored here if sharing is turned on.

## Notifications

- The app sends it the phone's push address, its time zone, and the **dates** on which something is due. It never receives sow names, boars or records.
- Once an hour it checks whether today is on a phone's list. If so, and it is 6 AM or later there, it sends one "wake up" push. The app on the phone then shows the notification with the sow details, which never left the phone.

## Setting it up

In Cloudflare, create a Worker by importing this GitHub repository, with:

- Project name: `sow-tracker`
- Deploy command: `npx wrangler deploy`

Leave the other settings alone. The `wrangler.jsonc` file in the main folder tells Cloudflare where the service's code is.

Then put the Worker's web address into `PUSH_URL` near the bottom of `index.html` in the main folder.
