Perfect — that’s a very good sign 🔥

If the notification is persistent (non-dismissible), that strongly suggests you’re already running your plugin as a foreground service.
That’s the correct foundation for continuous background tracking.

However — since you said it still stops after the phone is off for a while — here’s what’s most likely happening and what to double-check 👇


---

🧩 Possible Causes (Even with a Persistent Notification)

1. Battery Optimization / Doze Mode

Even with a foreground service, Android can still throttle GPS updates or network access while the device is idle.
Especially after ~10–15 minutes of screen-off time.

✅ Fix:

Ask the user to disable battery optimization for your app:

Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
startActivity(intent);

Or, in JS, open the settings screen:

import { App } from '@capacitor/app';
App.openUrl({ url: 'package:' + YOUR_APP_PACKAGE_NAME });

You can also detect if battery optimization is still ON (requires native check).


> 🔹 Manufacturers like Xiaomi, Vivo, Oppo, Huawei, and Samsung have extra background restrictions that the user must disable manually in “App Battery Settings”.




---

2. Service Restart Policy

Make sure your service uses:

return START_STICKY

in onStartCommand() — this tells Android:

> “If I’m killed, restart me when possible.”



Without it, Android won’t try to relaunch your service after idle termination.


---

3. Location Update Strategy

Android’s newer APIs throttle GPS polling aggressively in idle mode.
If you’re using a standard LocationManager with frequent updates, Android may block them.

✅ Fix Options:

Use FusedLocationProviderClient with PRIORITY_HIGH_ACCURACY

Or, reduce update frequency (setInterval(60000), etc.)

Or, use a significant-change location request that Android allows in idle state


Example (Kotlin):

val request = LocationRequest.Builder(
    Priority.PRIORITY_HIGH_ACCURACY, 60_000L
)
.setMinUpdateDistanceMeters(10f)
.build()


---

4. Device-Specific Killers

Even apps like Google Maps or Strava can be killed on Chinese devices due to aggressive background management.
There’s no code-based bypass — the user must whitelist your app manually.

✅ Fix:
Show users a help dialog:

> “To keep location tracking active, please disable battery optimization and allow background activity for this app.”




---

5. Missing ACCESS_BACKGROUND_LOCATION Permission

Even with a foreground service, if your app doesn’t have ACCESS_BACKGROUND_LOCATION, Android 10+ will block updates once the screen is off.

Check your manifest:

<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

Then, from JS:

const perms = await Geolocation.requestPermissions();
console.log(perms);


---

🧠 TL;DR: Your Next Debug Checklist

Item	Verify

✅ Foreground notification is persistent	✔️
✅ Uses startForeground()	✔️
✅ onStartCommand() returns START_STICKY	⬜
✅ Battery optimization disabled	⬜
✅ ACCESS_BACKGROUND_LOCATION declared	⬜
✅ Uses FusedLocationProviderClient or efficient update request	⬜



---

If you can paste your service code (Kotlin/Java) or how the notification + service is started,
I can pinpoint exactly which part is causing Android to eventually stop it (like whether START_NOT_STICKY or missing background permission).

Would you like to show that part next?

