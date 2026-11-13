# AFRITECH AI — Android installation path

This project is prepared for deployment as a secure HTTPS web app and Android-installable PWA. The AI backend stays on the server; do **not** put `GEMINI_API_KEY` in the Android app or frontend.

## 1. Deploy from an Android phone
1. Create/sign in to GitHub and upload the contents of this ZIP into a new repository named `afritech-ai`.
2. Create/sign in to Render and choose **New + → Blueprint**. Connect the GitHub repository and deploy the included `render.yaml`.
3. In the Render service's **Environment** settings, add `GEMINI_API_KEY` with your own key from Google AI Studio. Keep it private; never paste it into chat or commit it to GitHub.
4. Wait for the service to become Live. Open `https://YOUR-SERVICE.onrender.com/api/health`; it should show `status: "ok"` and `configured: true`.
5. Open the service homepage in Chrome on Android. Use Chrome menu → **Install app** or **Add to Home screen**.

## 2. APK note
The ZIP does not contain a signed Android APK. A public HTTPS URL is needed first for the simplest Trusted Web Activity packaging route (for example, PWABuilder). After deployment, use the live URL in PWABuilder to package an Android app, follow its signing steps, and add the Digital Asset Links file it provides under `public/.well-known/assetlinks.json` before publishing. Verify the generated APK on your device before sharing it.

## Important
- Render free services may sleep when idle and take time to wake.
- Gemini usage may have quotas or charges depending on the key/account.
- The health endpoint reports whether a key exists; it does not verify that the key has usable quota.
