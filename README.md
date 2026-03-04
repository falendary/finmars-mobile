<p align="center">
  <a href="https://finmars.io" target="_blank">
    <img src="https://github.com/finmars-platform/finmars-core/blob/main/finmars-misc/logo_white_bg.png" alt="Finmars" height="84"/>
  </a>
</p>

# Finmars Mobile App

The **Finmars Mobile App** is the mobile client for the Finmars financial management platform.
It is built with **Ionic + Capacitor**, allowing the same application to run as a **web app, Android app, and iOS app**.

The mobile application connects to the Finmars backend and provides access to dashboards, reports, and portfolio data from a mobile device.

---

# Prerequisites

Before running the project locally you need:

* Node.js (recommended ≥ 20)
* npm
* Ionic CLI
* Android Studio (for Android builds)
* Xcode (for iOS builds, macOS only)

Install Ionic CLI globally:

```bash
npm install -g @ionic/cli
```

---

# Installation

Clone the repository and install dependencies.

```bash
git clone https://github.com/finmars-platform/finmars-mobile.git
cd finmars-mobile

npm install
```

Install required plugin:

```bash
npm install ionic-plugin-deeplinks
```

Sync Capacitor platforms:

```bash
ionic cap sync
```

---

# Running the App in Browser (Development)

Build the web version and start the development server.

```bash
npm run build
VITE_BASE_URL='/m/' VITE_APP_PLATFORM='web' ionic serve
```

The application will start in your browser.

---

# Android Development

## Requirements

* Android Studio installed
* Android SDK configured
* An emulator or a physical Android device

## Build and Run

```bash
VITE_APP_PLATFORM='android' npm run build
ionic cap sync android
npx cap run android
```

This builds the application and runs it on the connected Android device or emulator.

To open the project manually in Android Studio:

```bash
ionic cap open android
```

---

## Android Version Update

Before publishing to Google Play, update the version number in:

```
android/app/build.gradle
```

Increase:

```
versionCode
```

---

## Install APK on a Device

If you built a release APK in Android Studio:

```bash
adb install app-release.apk
```

Check connected devices:

```bash
adb devices
```

Disconnect devices:

```bash
adb disconnect
```

---

# Android Release Build

To generate a signed build:

1. Open the project in Android Studio
2. Navigate to **Build → Generate Signed Bundle / APK**
3. Select **APK**
4. Provide your keystore information
5. The release build will appear in:

```
android/app/release
```

Upload the resulting `app-release.apk` to **Google Play Console**.

---

# iOS Development

Documentation:
[https://capacitorjs.com/docs/ios](https://capacitorjs.com/docs/ios)

## Install iOS platform

```bash
npm install @capacitor/ios
```

Ensure Xcode is selected:

```bash
sudo xcode-select --switch /Applications/Xcode.app
```

Build the project:

```bash
VITE_BASE_URL='/m/' VITE_APP_PLATFORM='ios' npm run build
npx cap add ios
npx cap open ios
```

To sync project changes:

```bash
ionic cap sync ios
```

Run the app using Xcode simulator or connected iPhone.

---

# Deep Links

The app supports deep linking using:

```
ionic-plugin-deeplinks
```

Example installation:

```bash
cordova plugin add ionic-plugin-deeplinks \
  --variable URL_SCHEME=finmars \
  --variable DEEPLINK_SCHEME=https \
  --variable DEEPLINK_HOST=finmars.com \
  --variable ANDROID_PATH_PREFIX=/
```

Android configuration may require updating:

```
android/app/src/main/AndroidManifest.xml
```

Helpful resources:

* [https://devdactic.com/setup-deep-links-capacitor](https://devdactic.com/setup-deep-links-capacitor)
* [https://developers.google.com/digital-asset-links/tools/generator](https://developers.google.com/digital-asset-links/tools/generator)

Example Digital Asset Links configuration:

```
https://finmars.com/.well-known/assetlinks.json
```

Example content:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.finmars.mobile",
    "sha256_cert_fingerprints": [
      "1A:6C:25:F9:8E:5D:4F:FF:54:82:07:18:B9:CB:95:28:14:CD:3F:92:FF:80:35:EC:B1:48:AE:EE:8E:FE:72:30"
    ]
  }
}]
```

---

# Environment Variables

Environment variables are defined using `.env` files.

Example `.env.example`:

```
VITE_BASE_URL=/m/
VITE_APP_PLATFORM=web
VITE_KEYCLOAK_URL=
```

Do not commit real `.env` files to the repository.

---

# macOS Android SDK Setup

If Android SDK is not detected, add it to your shell profile.

Edit:

```
~/.bash_profile
```

Add:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Reload shell:

```bash
source ~/.bash_profile
```

---

# License

Please refer to the [LICENSE](LICENSE) file for license details.

---

# Support

For bug reports or feature requests please open an issue in this repository.
For Finmars platform documentation visit:

[https://docs.finmars.com](https://docs.finmars.com)
