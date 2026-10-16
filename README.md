# Fursona Forge — Public Beta v1.2

**For fursonas, OCs & new worlds.** This release is a free, local-first creative prototype. All actual editing tools work without an account. No personal accounts or public community are implemented.

## Live beta features

- Create, edit, search and delete fursonas / original characters.
- Upload a character portrait, select it as your in-app profile picture, and download it.
- Make worlds with written lore; make and edit 20×12 terrain maps and export PNG images.
- Save and copy commission **brief drafts**; no artist messaging, payments or order placement.
- Import and export JSON workspace backups; wishlist future features locally.
- Progressive web app support when served over HTTPS.
- New in v1.2: explicit beta notice, privacy/data page, GitHub Pages friendly `.nojekyll` file.

## Not in this release

Free cloud accounts, account synchronization, public galleries, genuine creator accounts, direct chats and fully functioning commissions are still planned. Sample creators in the app are fictional.

## Publish on GitHub Pages (recommended for easy updates)

1. Unzip this package on your computer.
2. Make a new **public** GitHub repository called `fursona-forge` (or open an existing one that you own).
3. Upload **all files inside** the unzipped `Fursona-Forge-Public-Beta` folder to the **root** of that repository, including `index.html`, `privacy.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `assets/` and `.nojekyll` if the upload interface allows it. Uploading the folder itself as a nested directory will break the Pages homepage.
4. Commit to `main`. In the repo open **Settings > Pages > Build and deployment > Source > Deploy from a branch**.
5. Select `main` and `/(root)`, then **Save**. GitHub shows the public site URL on the Pages settings screen. It is typically `https://YOUR-USERNAME.github.io/fursona-forge/` but your account may differ.
6. Open the real published link on desktop and phone, then check that character creation, world editor, map tools, backups, privacy link and navigation work.
7. Before advertising publicly, confirm your host's terms, accessibility, appropriate content expectations and owner/moderator responsibilities.

After updating files in `main`, GitHub Pages should publish the latest files. Some browsers may briefly display an older cached version; refresh and revisit if needed.

## No GitHub? Netlify Drop

Go to https://app.netlify.com/drop and drag in the extracted folder containing `index.html`. To keep control of the URL, sign in and claim/manage the project. The uploader still needs to complete the publish step.

## Protecting guest creations

All data is stored per browser and per site origin. Local files (`file://`), GitHub Pages and a future custom domain are **different storage locations**. Publishing or changing the domain **does not copy** the visitor's work. Guests must use Export Backup and Import Backup when migrating. Make backups before trying a new version or origin.

Never store personal API keys, secrets or user accounts in this static repo. Real accounts and messaging need secure server-side permission rules, privacy choices and moderation, especially for younger creators. Do not advertise them as live features.

## Future app stores

This release is a responsive website/PWA, **not** an App Store or Microsoft Store listing. A native wrapper, platform-specific signing and store review will be needed for app stores later.
