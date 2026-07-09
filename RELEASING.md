# Folio releasen

## Einmalig eingerichtet (bereits erledigt)

- App-Icon (`Backend/icons/`) — das echte Folio-Logo, generiert via `tauri icon`.
- `Backend/tauri.conf.json` bündelt `.app` + `.dmg` (`bundle.active: true`, `targets: "all"`).
- Updater-Plugin (`tauri-plugin-updater` + `@tauri-apps/plugin-updater`) ist verdrahtet; die App
  prüft nach dem Entsperren automatisch auf neue Releases und zeigt bei Bedarf einen Hinweis
  unten rechts.
- Update-Signierschlüssel liegt unter `~/.tauri/folio-updater.key` (privat) /
  `~/.tauri/folio-updater.key.pub` (öffentlich, bereits in `tauri.conf.json` als `pubkey`
  eingetragen). **Diesen privaten Schlüssel sichern** (z.B. Passwortmanager) — ohne ihn können
  künftige Updates nicht mehr signiert werden.
- `.github/workflows/release.yml` — baut bei jedem Tag `vX.Y.Z` automatisch `.app` + `.dmg` +
  Update-Manifest und legt einen **Entwurf**-Release auf GitHub an.

## Einmalig noch zu tun (nur du kannst das)

GitHub-Repo-Secret setzen, damit die CI die Update-Artefakte signieren kann:

```bash
gh secret set TAURI_SIGNING_PRIVATE_KEY < ~/.tauri/folio-updater.key
```

(oder manuell: GitHub → Repo → Settings → Secrets and variables → Actions → New repository secret,
Inhalt der Datei `~/.tauri/folio-updater.key` einfügen.)

## Eine neue Version releasen

1. Version an zwei Stellen hochzählen (müssen übereinstimmen):
   - `Backend/tauri.conf.json` → `"version"`
   - `Backend/Cargo.toml` → `[package] version`
2. Committen.
3. Taggen und pushen:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```
4. GitHub Actions baut automatisch und legt einen **Draft-Release** an (nichts ist live, bis du
   ihn veröffentlichst). Release-Notes im Draft anpassen, dann auf GitHub „Publish release" klicken.
5. Sobald veröffentlicht: neue Downloads bekommen das neue `.dmg`; bereits installierte Folio-Apps
   finden das Update automatisch beim nächsten Start (Banner unten rechts).

## Lokal testen, ohne zu releasen

```bash
cd Backend && ../Frontend/node_modules/.bin/tauri build
```

Ergebnis liegt in `Backend/target/release/bundle/macos/Folio.app` und
`Backend/target/release/bundle/dmg/Folio_<version>_aarch64.dmg`.

## Aktueller Stand: unsigniert

Es ist (noch) kein Apple Developer Program-Zertifikat hinterlegt. Das heisst:

- Du selbst: keine Einschränkung, lokal gebaute Apps laufen ohne Warnung.
- Freunde, die das `.dmg` herunterladen: macOS zeigt beim ersten Öffnen „Apple kann nicht
  bestätigen, dass diese App frei von Malware ist". Lösung: **Rechtsklick auf Folio.app → Öffnen**
  (statt Doppelklick) — einmalig pro Person, dann merkt sich macOS die Freigabe.
- Auto-Update funktioniert technisch auch unsigniert, aber ohne Signatur kann es sein, dass jede
  neue Version dieselbe Gatekeeper-Bestätigung erneut braucht.

### Später nachrüsten (Apple Developer Program, 99 USD/Jahr)

1. Bei [developer.apple.com](https://developer.apple.com) anmelden.
2. In Xcode oder über `xcrun` ein „Developer ID Application"-Zertifikat erzeugen, als `.p12`
   exportieren.
3. Diese GitHub-Secrets setzen: `APPLE_CERTIFICATE` (base64 des .p12), `APPLE_CERTIFICATE_PASSWORD`,
   `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD` (App-spezifisches Passwort, nicht das
   normale Apple-ID-Passwort), `APPLE_TEAM_ID`.
4. In `.github/workflows/release.yml` den auskommentierten Apple-Block wieder einkommentieren.

Ab dann läuft Signierung + Notarization automatisch bei jedem Release mit, und die Gatekeeper-
Warnung verschwindet komplett — auch beim Auto-Update.
