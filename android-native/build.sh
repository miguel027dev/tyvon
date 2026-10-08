#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
: "${ANDROID_HOME:?Defina ANDROID_HOME para um SDK com platform android-35 e build-tools 35.0.0}"
bt="$ANDROID_HOME/build-tools/35.0.0"
platform="$ANDROID_HOME/platforms/android-35/android.jar"
if [[ ! -f "$platform" ]]; then platform="$ANDROID_HOME/platforms/android-35/android-35/android.jar"; fi
mkdir -p build/compiled build/classes build/dex
"$bt/aapt2" compile --dir app/src/main/res -o build/compiled
mapfile -t resources < <(find build/compiled -name '*.flat')
"$bt/aapt2" link -o build/base.apk -I "$platform" --manifest app/src/main/AndroidManifest.xml --java build/generated "${resources[@]}"
mapfile -t sources < <(find app/src/main/java build/generated -name '*.java')
javac --release 8 -cp "$platform" -d build/classes "${sources[@]}"
jar cf build/classes.jar -C build/classes .
"$bt/d8" --min-api 26 --lib "$platform" --output build/dex build/classes.jar
cp build/base.apk build/unsigned.apk
(cd build/dex && zip -q ../unsigned.apk classes*.dex)
"$bt/zipalign" -f 4 build/unsigned.apk build/aligned.apk
if [[ -z "${TYVON_KEYSTORE:-}" ]]; then
 if [[ ! -f build/validation.keystore ]]; then keytool -genkeypair -keystore build/validation.keystore -storepass android -keypass android -alias validation -dname 'CN=TYVON Validation' -keyalg RSA -keysize 2048 -validity 3650 >/dev/null 2>&1; fi
 signing_key=build/validation.keystore
 signing_alias=validation
 signing_pass=android
else
 signing_key="$TYVON_KEYSTORE"
 signing_alias="${TYVON_KEY_ALIAS:?Defina TYVON_KEY_ALIAS}"
 signing_pass="${TYVON_KEYSTORE_PASSWORD:?Defina TYVON_KEYSTORE_PASSWORD}"
fi
export TYVON_BUILD_SIGNING_PASSWORD="$signing_pass"
"$bt/apksigner" sign --ks "$signing_key" --ks-key-alias "$signing_alias" --ks-pass env:TYVON_BUILD_SIGNING_PASSWORD --out build/TYVON-Iron-2.0-native.apk build/aligned.apk
"$bt/apksigner" verify --verbose build/TYVON-Iron-2.0-native.apk
sha256sum build/TYVON-Iron-2.0-native.apk > build/TYVON-Iron-2.0-native.sha256
