# STIPHANTUBE deployment

1. Create a Docker-capable Web Service.
2. Use this repository root as the service root.
3. Build with the included `Dockerfile`.
4. Start command: `npm start`.
5. Set environment variables from `.env.example`.
6. After deployment, copy the HTTPS service URL.
7. Put that URL into `STIPHANTUBE_BASE_URL` in `STIPHANTUBE_ANDROID/app/build.gradle.kts`.
8. Build the Android APK and upload the APK to STIPHAN STORE.

The service must have `yt-dlp` and FFmpeg available; the included Dockerfile installs both.
