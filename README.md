## Mobile App

### Prerequisites

npm install
sudo npm i -g @ionic/cli

npm install ionic-plugin-deeplinks
npm install @awesome-cordova-plugins/deeplinks
ionic cap sync

### Build and run Server

npm run build
ionic serve

### Build APK

npm install @capacitor/android
npx cap add android
npx cap open android
npx cap build android

ionic
ionic capacitor build android


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

npx cap add ios
npx cap open ios
npx cap build ios

### Deeplinks

cordova plugin add ionic-plugin-deeplinks --variable URL_SCHEME=finmars --variable DEEPLINK_SCHEME=https --variable DEEPLINK_HOST=finmars.com  --variable ANDROID_PATH_PREFIX=/

### Notes

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


