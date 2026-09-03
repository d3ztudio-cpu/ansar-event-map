# Ansar Campus Event Map

Public event map with a protected visual venue editor.

- Website: <https://d3ztudio-cpu.github.io/ansar-event-map/>
- Login: <https://d3ztudio-cpu.github.io/ansar-event-map/admin.html>
- Authorised editor: institution-controlled media account

Google authentication, the GitHub Pages domain, and the venue-specific Firestore rules are configured in the existing `ansar-english-school` Firebase project. The venue rule was merged into the school's existing ruleset so its other applications remain unchanged.

## Administration

Choose **Login** on the public map and authenticate with the authorised Google account or private access key. Other accounts are signed out automatically.

Click the map to add a marker. Select or drag an existing marker to edit it. Changes appear publicly after **Save venue**. Uncheck **Visible on public map** to retain a venue without showing it.

On the first successful login, the current locations in `data/venues.json` are imported automatically.

## Local preview

```sh
python -m http.server 8000
```

Then open <http://localhost:8000>.
