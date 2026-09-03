# Ansar Campus Event Map

A public, mobile-friendly event venue map with a protected visual editor at `admin.html`. Venue changes are stored in Cloud Firestore and appear on the public map in real time. Only the verified Google account `ansarmedia@ansarschool.in` can write; that restriction is enforced by Firestore, not only by the browser.

## One-time Firebase setup

1. Create a Firebase project at <https://console.firebase.google.com/> using an institution-controlled account.
2. In **Build → Authentication → Sign-in method**, enable **Google**. Add `ansarmap.github.io` under **Authentication → Settings → Authorized domains**.
3. In **Build → Firestore Database**, create a database in Production mode and select a nearby region.
4. In **Project settings → Your apps**, create a Web App. Copy its `firebaseConfig` values into `firebase-config.js`.
5. Install the Firebase CLI, sign in to the institution project, and deploy the included rules:

   ```sh
   npm install -g firebase-tools
   firebase login
   firebase use --add
   firebase deploy --only firestore:rules
   ```

6. Commit and push the site to the repository's default branch. GitHub Pages will serve it as before. On the first successful admin login, the current venue data in `data/venues.json` is automatically imported into Firestore.

## Administration

Open `https://ansarmap.github.io/admin.html`, sign in as `ansarmedia@ansarschool.in`, then click the map to add a marker. Existing markers can be selected or dragged. Changes are live after **Save venue**. Uncheck **Visible on public map** to retain a venue without showing it publicly.

## Repository ownership

Because the old repository was controlled by a student, transfer ownership to an institution-owned GitHub organization/account: **Repository Settings → General → Danger Zone → Transfer ownership**. After the transfer, enable Pages under **Settings → Pages**, restrict repository administration to permanent staff, require 2FA, and keep at least two institution-owned administrators. Firebase should likewise be owned by institution accounts.

## Local preview

Serve the folder over HTTP (opening files directly will block JSON loading):

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`. The public map uses `data/venues.json` until Firebase is configured.
