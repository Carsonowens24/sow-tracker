# Sow Tracker

A phone app for logging sow breedings on a hog operation. It is a web page you add to your home screen, so there is nothing to install from an app store. Your records are saved on the phone itself and the app opens with no signal.

## What it does

The app has six screens. Switch between them with the bar at the bottom.

- **Home:** the farm logo, the microphone, and backup and reminder buttons.
- **Breeding:** every breeding, newest first, with an **Add breeding** button.
- **Heat:** every heat record, with an **Add heat** button.
- **Coming in:** sows due back in heat or due to farrow.
- **Vaccines:** jobs that come due as each litter gets older, counted from its farrowing date: **Parasail** at 10 days old, then **Vaccinations** and **Wean** at 3 weeks old. Overdue jobs are outlined in red and jobs due today or tomorrow in orange. Tap a job to mark it done with the date; for weaning you can also enter the number weaned. Jobs due show in the yellow bar on Home, in notifications (if turned on), and in calendar reminders. A litter needs a farrowing date to get jobs.
- **Litters:** a numbered list of litters with each one's pedigree, for example "1  Hang Time × 10-7 QF". Tap a litter to see everything about it (number, sire, dam, number of males and females, farrowing date and notes), and tap **Edit litter** to change it. Add one with **Add litter**, or tap a breeding on the Breeding screen and choose **Add a litter from this breeding**. Litters are included in the spreadsheet export, restore, and sharing.

How to read the colors:

- **Dots on each entry:** blue is a breeding, pink is heat signs noticed, red is first standing, grey is went out.
- **Coming in:** a red outline means overdue, an orange outline means due today or tomorrow.
- **Orange checkmark:** flashes in the middle of the screen each time an entry is saved.

- **Log a breeding by voice.** Tap the big microphone and say something like:
  - "Sow 118 was bred to Hang Time on July 26th"
  - "Rosie bred to Hang Time today"
  - "Bred sow 12 dash 4 to Big Red yesterday"
  - If you don't say a date, it uses today.
- **Check before saving.** The app shows the sow, boar and date it understood. Fix anything, then tap Save.
- **Type it instead.** The "Or type it here" box understands the same sentences. On an iPhone you can tap the microphone key on the keyboard and talk, which also works where the big button does not.
- **Fill in by hand.** A blank form with buttons for boars you have used recently.
- **Breeding list.** Newest first. Type in "Find a sow" to filter. A sow bred more than once in the same week is marked "2nd breeding this heat".
- **Heat tracking.** Log the three stages of a heat with the same microphone:
  - "Sow 118 showing heat signs today" (heat signs noticed)
  - "Sow 118 first standing this morning" (first standing)
  - "118 went out yesterday" (went out)
  - You can add a time ("at 6:30 am") or just say morning, afternoon or evening. Time is optional.
  - Or tap **Add heat** to fill it in by hand.
- **Breedings and Heat tabs.** The main list switches between the two. "Find a sow" filters whichever one is showing.
- **Helpful dates.** Worked out for you on each sow's page:
  - Next heat: 21 days after her last heat (first standing if you logged it, otherwise her first breeding or heat signs).
  - Due to farrow: 114 days after the first breeding of her latest heat.
- **Coming in tab.** Sows due back in heat in the next 3 weeks (so a sow shows up the day she is bred, marked "Bred to" and the boar's name) and sows due to farrow in the next 2 weeks, soonest first. Overdue ones stay on the list for a week. A bred sow drops off the "due back" list once she is a week past her date with no new heat logged.
- **Yellow bar.** When you open the app, a yellow bar at the top tells you how many sows are due now or by tomorrow. Tap it to see them. The app cannot send notifications while it is closed.
- **Edit from the list.** Tap any breeding or heat record in the main list, then choose **Edit** or **See her history**.
- **Export spreadsheet (CSV).** At the bottom of the main screen. Makes a file with every breeding and heat record that opens in Excel, Numbers or Google Sheets. On an iPhone the Share sheet opens: choose **Save to Files** or **Mail** to send it to yourself.
- **Restore from a spreadsheet.** Pick a file you exported earlier and the app adds back any entries that are missing. It never deletes anything, so it is safe to run twice.
- **Calendar reminders.** Makes a calendar file with each sow's expected return to heat and farrowing date, with an alert at 6 AM that day. Once the events are in your iPhone Calendar, the phone reminds you even when the app is closed. If a sow's dates change later, the old calendar events stay until you delete them in Calendar.
- **Notifications (optional).** Once the notification service in the `notify` folder is running, a **Turn on notifications** button appears at the bottom of the main screen. You then get a notification at 6 AM on the day a sow is due back in heat or due to farrow, even with the app closed. Only the due dates are sent to the service; sow names and records stay on the phone.
- **Sharing between phones (optional).** At the bottom of Home, under **Sharing**. Tap **Start sharing from this phone** to get a 12-character share code, then on the other phone enter that code and tap **Join**. Both phones then show the same records. Each phone keeps its own full copy, so the app still works with no signal and catches up when it reconnects. If the same entry is changed on two phones, the most recent change wins. Anyone with the share code can see and change the records, so only give it to people who should have them.
- **Sow history.** Each sow has her own page, with every breeding and heat record she has and buttons to log another one for her.
- **Edit or delete.** On the sow's page, tap an entry to change or delete it.

Sows can be a number (118), a name (Rosie) or an ear notch (12-4).


## Putting it on your iPhone

The app has to live at a web address that starts with `https`. The free way is GitHub Pages.

One-time setup:

1. Make a free account at https://github.com/signup
2. Create a new repository named `sow-tracker` and set it to **Public**.
3. Put the files from this folder in it (Claude can do this for you once your GitHub account is connected at https://claude.ai/connect-github).
4. In the repository, open **Settings**, then **Pages**. Under "Branch" choose `main`, leave the folder as `/ (root)`, and tap **Save**.
5. After a minute or two your app is at `https://YOUR-USERNAME.github.io/sow-tracker/`

On the phone:

1. Open that address in **Safari**.
2. Tap the **Share** button (square with an arrow), then **Add to Home Screen**.
3. Open Sow Tracker from the new icon. The first time you tap the microphone, tap **Allow**.

Open it once while you have a signal. After that it opens in the barn with none.

## Getting updates

When the app is updated, close it fully (swipe it away) and open it again while you are connected to the internet. The version number at the bottom of the main screen tells you which one you have.

## Good to know

- **Voice and signal.** The big microphone button may need a signal to work. If it does not respond, use the text box and the keyboard's microphone key.
- **Your records live on this phone.** They are not sent anywhere unless you turn on sharing; with sharing on, a copy is also kept in the online service so the other phones can get it. Deleting the home screen icon or clearing Safari's website data erases them, so export the spreadsheet regularly and keep the file somewhere off the phone (email it to yourself). The app shows when you last exported.
- **Public repository.** Only the app's code is public. Your breeding records are never in it.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app: screen layout, styling and logic |
| `sw.js` | Keeps a copy on the phone so it opens offline |
| `manifest.webmanifest` | Name, colors and icon for the home screen |
| `app-icon-180.png`, `app-icon-512.png` | Home screen icons (the farm logo) |
| `logo.jpg` | The farm logo shown on the Home screen |
| `notify/`, `wrangler.jsonc` | The optional online service for notifications and sharing (runs on Cloudflare) |
