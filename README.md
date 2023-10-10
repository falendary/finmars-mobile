## Mobile App

### Prerequisites

npm install
sudo npm i -g @ionic/cli
npm install ionic-plugin-deeplinks // this one is extremely important
ionic cap sync

### Build and run Server

npm run build
VITE_BASE_URL='/m/' VITE_APP_PLATFORM='web' ionic serve

### Build APK

npm install @capacitor/android
npx cap add android
npx cap open android

# This two actuially builds app
VITE_APP_PLATFORM='android' npm run build && npx cap run android

# Change in android/app/src/main/res/values/strings.xml
<string name="custom_url_scheme">finmars</string>

# How to push new version to google play
go to ```android/app/build.gradle```
update versionCode

npx cap build android
-- for signing build
npx cap build android --keystorepath=/Users/szhitenev/projects/finmars/data/keystores/android/finmars-keystore --keystorealias=key0 --keystorealiaspass=[pass] --keystorepass=[pass]


ionic cap sync android
VITE_APP_PLATFORM='android' ionic capacitor build android


### Release APP

You need to have a keystore and configured android studio
1) Build -> Generate Signed Bundle / APK
2) Pick generate release
3) Check your local ./android/app/release folder
4) Upload app-release.apk to google play console


## BUILD IOS

https://capacitorjs.com/docs/ios

npm install @capacitor/ios

sudo xcode-select --switch /Applications/Xcode.app

Update signing team in xcode

VITE_BASE_URL='/m/'  npm run build
npx cap add ios
npx cap open ios
npx cap build ios

# This one is required to force changes to Xcode builder
ionic cap sync ios



### Deeplinks

cordova plugin add ionic-plugin-deeplinks --variable URL_SCHEME=finmars --variable DEEPLINK_SCHEME=https --variable DEEPLINK_HOST=finmars.com  --variable ANDROID_PATH_PREFIX=/

in android/app/src/main/AndroidManifest.xml add 

https://devdactic.com/setup-deep-links-capacitor - good article

Update nginx to be able serve
https://developers.google.com/digital-asset-links/tools/generator [generator]
https://stackoverflow.com/questions/69384022/how-to-not-need-a-dotted-file-path-in-nginx-configuration [nginx]

https://finmars.com/.well-known/assetlinks.json
Example content:
```
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target" : { "namespace": "android_app", "package_name": "com.finmars.mobile",
    "sha256_cert_fingerprints": ["1A:6C:25:F9:8E:5D:4F:FF:54:82:07:18:B9:CB:95:28:14:CD:3F:92:FF:80:35:EC:B1:48:AE:EE:8E:FE:72:30"] }
}]
```



### Notes

npm install @capacitor/configure


BASE_URL is deprecated


On macOS:

Open Terminal.
Open the bash profile with the command open -e ~/.bash_profile. If that file doesn't exist, you can create it with the command touch ~/.bash_profile.
Add these lines to the file, then save and close it:
bash
Copy code
export ANDROID_HOME=/Users/[username]/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools



cordova plugin add ionic-plugin-deeplinks --variable URL_SCHEME=finmars --variable DEEPLINK_SCHEME=https --variable DEEPLINK_HOST=finmars.com


npm install @capacitor/browser
npx cap sync
