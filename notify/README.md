# Sow Tracker notification service

A small service that runs on Cloudflare's free plan and sends Sow Tracker's notifications.

- The app sends it the phone's push address, its time zone, and the **dates** on which something is due. It never receives sow names, boars or records.
- Once an hour it checks whether today is on a phone's list. If so, and it is 6 AM or later there, it sends one "wake up" push. The app on the phone then shows the notification with the sow details, which never left the phone.

## Setting it up

In Cloudflare, create a Worker by importing this GitHub repository, with:

- Project name: `sow-tracker`
- Deploy command: `npx wrangler deploy`

Leave the other settings alone. The `wrangler.jsonc` file in the main folder tells Cloudflare where the service's code is.

Then put the Worker's web address into `PUSH_URL` near the bottom of `index.html` in the main folder.
