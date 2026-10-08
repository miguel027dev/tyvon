# TYVON Native · prototype v0.1

A **new Android-native UI**, implemented with Android Views in Java, not WebView.
Do not replace the existing production Android wrapper with this unfinished client.

Current scope:
- native login and registration with server-side Argon2id sessions;
- native onboarding (age, schedule, equipment, goal and experience);
- native home, workout recording, history and profile;
- canonical Python exercise planning served at /api/native/plan;
- set records require explicitly entered reps/seconds, optional load and RIR;
- saved logs use existing /api/account If-Match revision protection;
- HTTPS, server session cookies and CSRF headers.

**Limitations before shipping:** no physical-device QA; auth cookies are in-memory and
require login after process restart; Google Sign-In native isn't integrated; offline
drafts and incremental/idempotent server writes are not implemented; accessibility,
font scaling, Android 15 system insets, account/privacy flows and performance need
device testing. Do not publish this debug APK as a production release.

The separate application ID is intentional to avoid replacing an installed TYVON
while validating the native experience. A future release must finalize the
production package ID, signing key and migration strategy.

Build with JDK17, Android SDK35 and Gradle8.9:

  cd android-native && gradle :app:assembleDebug

Debug APK is signed with the SDK debug key and is for internal testing only.
The GitHub Actions workflow uploads an installable debug APK when the branch builds.
