# Sow Tracker

A phone app for logging sow breedings on a hog operation. It is a web page you add to your home screen, so there is nothing to install from an app store. Your records are saved on the phone itself and the app opens with no signal.

## What works so far (step 1)

- **Log a breeding by voice.** Tap the big microphone and say something like:
  - "Sow 118 was bred to Hang Time on July 26th"
  - "Rosie bred to Hang Time today"
  - "Bred sow 12 dash 4 to Big Red yesterday"
  - If you don't say a date, it uses today.
- **Check before saving.** The app shows the sow, boar and date it understood. Fix anything, then tap Save.
- **Type it instead.** The "Or type it here" box understands the same sentences. On an iPhone you can tap the microphone key on the keyboard and talk, which also works where the big button does not.
- **Fill in by hand.** A blank form with buttons for boars you have used recently.
- **Breeding list.** Newest first. Type in "Find a sow" to filter. A sow bred more than once in the same week is marked "2nd breeding this heat".
- **Edit or delete.** Tap any breeding in the list.

Sows can be a number (118), a name (Rosie) or an ear notch (12-4).

Still to come: sow history page, heat cycle tracking, next-heat and farrowing dates, the "coming up" screen, and CSV export.

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

## Good to know

- **Voice and signal.** The big microphone button may need a signal to work. If it does not respond, use the text box and the keyboard's microphone key.
- **Your records live only on this phone.** They are not sent anywhere. Deleting the home screen icon or clearing Safari's website data erases them. CSV backup is coming in a later step.
- **Public repository.** Only the app's code is public. Your breeding records never leave your phone.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app: screen layout, styling and logic |
| `sw.js` | Keeps a copy on the phone so it opens offline |
| `manifest.webmanifest` | Name, colors and icon for the home screen |
| `icon-180.png`, `icon-512.png` | Home screen icons |
