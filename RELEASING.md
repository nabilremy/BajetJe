# Releasing BajetJe to Google Play

Package name: `com.bajetje.app` (fixed for good after the first upload). Play needs a signed Android App Bundle (`.aab`).
Signing uses an **upload key** that lives only on your computer. Its passwords come from `~/.gradle/gradle.properties`
(or environment variables), never from this repo. A release build without them stops with
"Release signing is not set up".

## One time: create the upload key

You need Android Studio (it ships the Java tools) and Node.

1. Make a folder outside the repo for the key, for example `~/keystores` (Windows: `C:\Users\<you>\keystores`).
2. Create the keystore. `keytool` is in Android Studio's `jbr/bin` folder
   (macOS: `/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin`,
   Windows: `C:\Program Files\Android\Android Studio\jbr\bin`):

   ```bash
   keytool -genkeypair -v -keystore ~/keystores/bajetje-upload.jks -storetype PKCS12 \
     -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```

   It asks for a password and your name / organisation (anything sensible, for example "BajetJe", country "MY").
   PKCS12 keystores use one password for the store and the key, so use the same one for both settings below.
3. Add these four lines to `~/.gradle/gradle.properties` (Windows: `C:\Users\<you>\.gradle\gradle.properties`;
   create the file if it does not exist). Use the full path, with forward slashes on Windows too:

   ```properties
   BAJETJE_UPLOAD_STORE_FILE=/Users/<you>/keystores/bajetje-upload.jks
   BAJETJE_UPLOAD_STORE_PASSWORD=<your password>
   BAJETJE_UPLOAD_KEY_ALIAS=upload
   BAJETJE_UPLOAD_KEY_PASSWORD=<your password>
   ```

   For CI, set the same four names as environment variables instead.
4. **Back up now**: copy `bajetje-upload.jks` and the password into a password manager (or two separate safe places).
   Play App Signing keeps the real app signing key at Google; if the upload key is lost, the account owner can ask for an
   upload key reset in Play Console (Test and release, App integrity), but it takes time.

`*.jks`, `*.keystore` and `keystore.properties` are in `.gitignore`. Never commit them.

## Build the bundle

From the repo root:

```bash
npm ci
npm run build            # typecheck + web build into dist/
npx cap sync android     # copy dist/ into the Android project
cd android
./gradlew bundleRelease  # Windows: gradlew.bat bundleRelease
```

The bundle is at `android/app/build/outputs/bundle/release/app-release.aab`. Check it is signed with your upload key:

```bash
keytool -printcert -jarfile app/build/outputs/bundle/release/app-release.aab
```

Then drag it into Play Console (Internal testing, Create new release).

## Next upload

Play rejects a bundle whose `versionCode` it has seen before.

1. In `android/app/build.gradle`, add 1 to `versionCode` (1, 2, 3, ...) and update `versionName` (what people see,
   for example `1.0.1` for fixes, `1.1.0` for new features).
2. Rebuild with the steps above and upload the new `app-release.aab`.

| Upload | versionCode | versionName |
|---|---|---|
| First internal test | 1 | 1.0.0 |
| Next fix | 2 | 1.0.1 |

## Requirements to recheck each year

- Target API: Google Play raises the minimum `targetSdkVersion` every August. It is set in `android/variables.gradle`
  (`targetSdkVersion = 36`, the minimum for new apps and updates since 31 August 2026).
- Version numbers and signing are the only per-release edits; everything else comes from the web build.
