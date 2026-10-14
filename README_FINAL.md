# STIPHANTUBE — STIPHAN STORE Edition

This package is structured as a SnapTube-style downloader product to distribute through **STIPHAN STORE**.

## Core flow

**Instagram/TikTok/YouTube/Facebook → Share → STIPHANTUBE → video detected → quality → Download**

The web/backend uses `yt-dlp` + FFmpeg and supports the sites that the installed yt-dlp version can access. Some sites/content may require authentication or may be blocked by the source; DRM-protected content is not supported.

## Included

- Next.js web UI
- Node backend API
- yt-dlp + FFmpeg Docker image
- MP4 quality selection and MP3 extraction
- Android Share Intent wrapper
- Ads area in the UI, ready for ad-network IDs
- Share URL auto-forwarding

## Important

A real downloader backend cannot run from GitHub Pages alone. The Docker service needs a server/container host. The Android app needs the final backend/web URL in `STIPHANTUBE_BASE_URL` before building the APK.

## Android

Open `STIPHANTUBE_ANDROID` in Android Studio. In `app/build.gradle.kts`, replace the placeholder `STIPHANTUBE_BASE_URL` with the deployed STIPHANTUBE URL, then build the APK.

## Ads

The interface already contains clearly labeled ad placements. For real monetization, connect an approved ad network and add its client/slot IDs. Do not ship with fake ad claims; the bundled cards are only UI placeholders until a real ad network is connected.

## Deployment

Use `Dockerfile` on a container host that allows long-running Node processes and enough CPU/RAM for yt-dlp + FFmpeg. Do not use a static-only host.
