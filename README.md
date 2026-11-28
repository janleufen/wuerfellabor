# Würfel-Labor

Eine kleine Web-App für ein gemeinsames Legostein-Experiment zum Gesetz der großen Zahlen. Die Schüler ordnen jeden Wurf einer von vier Lagen des 2x4-Steins zu. Die Lehreransicht zeigt die relativen Häufigkeiten als vier Live-Linien; die Y-Achse ist in Zehnteln beschriftet, ohne eine theoretische Wahrscheinlichkeit einzuzeichnen.

## Firebase einrichten

1. Erstelle in der [Firebase Console](https://console.firebase.google.com/) ein Projekt.
2. Lege eine Realtime Database in einer EU-Region an. Die ausgewählte Datenbank-URL muss zu `databaseURL` passen.
3. Aktiviere unter **Authentication > Sign-in method** die Anmeldung **Anonymous**.
4. Kopiere die Web-App-Konfiguration aus den Projekteinstellungen in `firebase-config.js`.
5. Übertrage `database.rules.json` in **Realtime Database > Rules** und veröffentliche die Regeln.
6. Trage deine GitHub-Pages-Adresse in den Firebase Authentication-Einstellungen unter **Authorized domains** ein.

Die Firebase-Web-Konfiguration ist im Browser sichtbar und kein Passwort. Die Datenbankregeln sind deshalb wichtig: Nur angemeldete Geräte können lesen; Würfe dürfen nur als eine der vier Steinlagen ergänzt werden.

## Lokal testen

Starte im Projektordner einen lokalen Webserver, zum Beispiel:

```powershell
py -m http.server 8000
```

Öffne danach `http://localhost:8000`. Die Anwendung benötigt für die Synchronisierung eine Internetverbindung und die eingerichtete Firebase-Konfiguration.

Die Auswahlbilder der Legosteine kannst du ohne Firebase lokal unter `http://localhost:8000/brick-preview.html` ansehen.

## Auf GitHub Pages veröffentlichen

Lade die Dateien in ein GitHub-Repository und aktiviere unter **Settings > Pages** die Veröffentlichung aus dem `main`-Branch und dem Projektordner `/ (root)`. Die App ist statisch; ein eigener Server ist nicht nötig.

## Verwendung

Die Lehrkraft benennt und startet eine Runde und projiziert die angezeigte QR-Code-Teilnahme. Der Teilnahme-Link öffnet direkt die Schüleransicht mit einer Anmeldeanzeige; die Startseite zum Erstellen von Runden wird dort nicht eingeblendet. Gespeicherte Runden erscheinen auf der Startseite und können dort geöffnet oder gelöscht werden. Schüler tippen nach jedem Wurf auf die passende Lage des Legosteins. Die Lehreransicht aktualisiert Diagramm und Zähler live.

Es werden keine Schülernamen abgefragt. Die anonyme Anmeldung wird im Browser dauerhaft gespeichert; Firebase erneuert die Sitzungstokens automatisch und verbindet die Realtime Database nach einem Verbindungsabbruch erneut. Anonyme Firebase-IDs und Würfe bleiben gespeichert, bis sie in der Firebase Console gelöscht werden. Vor dem Einsatz sollten die schulischen Datenschutzvorgaben geprüft werden.