# Würfel-Labor

Eine kleine Web-App für ein gemeinsames Würfel-Experiment zum Gesetz der großen Zahlen. Die Lehreransicht zeigt die relativen Häufigkeiten als sechs Live-Linien. Es gibt bewusst keine eingezeichnete theoretische Wahrscheinlichkeit.

## Firebase einrichten

1. Erstelle in der [Firebase Console](https://console.firebase.google.com/) ein Projekt.
2. Lege eine Realtime Database in einer EU-Region an. Die ausgewählte Datenbank-URL muss zu `databaseURL` passen.
3. Aktiviere unter **Authentication > Sign-in method** die Anmeldung **Anonymous**.
4. Kopiere die Web-App-Konfiguration aus den Projekteinstellungen in `firebase-config.js`.
5. Übertrage `database.rules.json` in **Realtime Database > Rules** und veröffentliche die Regeln.
6. Trage deine GitHub-Pages-Adresse in den Firebase Authentication-Einstellungen unter **Authorized domains** ein.

Die Firebase-Web-Konfiguration ist im Browser sichtbar und kein Passwort. Die Datenbankregeln sind deshalb wichtig: Nur angemeldete Geräte können lesen; Würfe dürfen nur als Augenzahlen von 1 bis 6 ergänzt werden.

## Lokal testen

Starte im Projektordner einen lokalen Webserver, zum Beispiel:

```powershell
py -m http.server 8000
```

Öffne danach `http://localhost:8000`. Die Anwendung benötigt für die Synchronisierung eine Internetverbindung und die eingerichtete Firebase-Konfiguration.

## Auf GitHub Pages veröffentlichen

Lade die Dateien in ein GitHub-Repository und aktiviere unter **Settings > Pages** die Veröffentlichung aus dem `main`-Branch und dem Projektordner `/ (root)`. Die App ist statisch; ein eigener Server ist nicht nötig.

## Verwendung

Die Lehrkraft startet eine Runde und projiziert die angezeigte QR-Code-Teilnahme. Schüler tippen nach jedem Wurf auf die passende Würfelseite. Die Lehreransicht aktualisiert Diagramm und Zähler live. Für eine neue Runde wird eine neue Sitzungs-URL erstellt.

Es werden keine Namen abgefragt. Anonyme Firebase-IDs und Würfe bleiben gespeichert, bis sie in der Firebase Console gelöscht werden. Vor dem Einsatz sollten die schulischen Datenschutzvorgaben geprüft werden.