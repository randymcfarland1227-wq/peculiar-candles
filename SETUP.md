# Setup

This site works entirely in the browser — no account or backend needed. Everything you enter (jars, oils, wicks, candle log) is saved to this browser's local storage, on this device.

## Put it online with GitHub Pages (free, optional)

Only needed if you want to reach the site from your phone or another computer. One-time setup — the push needs your own GitHub login, so it has to happen from your Terminal, not from Claude.

1. Go to **https://github.com/new** and create a repo (e.g. `peculiar-candles`). Leave it **public** (GitHub Pages needs that on a free account) and don't add a README/gitignore/license — keep it empty.
2. Open **Terminal** and run, replacing `YOUR-USERNAME` with your GitHub username:
   ```bash
   cd "/Users/randymcfarland/Documents/Claude/peculiar-candles"
   git init
   git config user.name "Your Name"
   git config user.email "you@example.com"
   git add .
   git commit -m "Initial Peculiar Candles site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/peculiar-candles.git
   git push -u origin main
   ```
   The first push will pop up a browser window to log in to GitHub — that's expected and normal.
3. On GitHub, go to the repo's **Settings → Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. Wait about a minute, then your site is live at `https://YOUR-USERNAME.github.io/peculiar-candles/`.

**Heads up:** local storage is per-browser, per-device — the GitHub Pages version and a locally-opened copy won't share data automatically, and clearing your browser's site data would clear your inventory. If that ever becomes a problem (e.g. you want it synced across devices, or backed by a Google Sheet like the other hub sites), just ask — the same optional-sync pattern used by routine-hub/goals-hub/sell-hub can be added here too.

**Future edits:** once this is set up, tell Claude what to change. Claude can edit the files and commit locally; you (or Claude, if `git push` is already authenticated on this machine) run `git push` to publish the update — GitHub Pages picks it up automatically within a minute or two.

## How the ratio calculator works

The wax-to-oil suggestion on the Build tab is an estimate, not a substitute for weighing your pour:

- **Wax weight** ≈ jar capacity (fl oz) × 0.85 — soy wax poured to a sensible fill line is close to water density, minus some loss to headspace and the wick bar.
- **Fragrance oil weight** ≈ wax weight × the selected intensity's fragrance load (Light 5%, Medium 7%, Strong 10% — the standard safe range for soy container candles).

Both the yield factor and the intensity percentages are defined at the top of `js/data.js` if you ever want to tune them.

## Editing reference data

Scent-note colors, wick types, intensity presets, and jar/candle status options live in `js/data.js` as plain JS objects — edit directly and refresh the page. Your actual inventory (jars, oils, wicks) and candle log live in the browser's local storage, managed entirely through the site itself.
