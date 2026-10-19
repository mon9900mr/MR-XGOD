# MASTERXGOD — CS2 Hub

Bilingual Persian/English responsive static preview for MASTERXGOD.

## Included
- Landing page, CS2 tool cards, community links
- TeamSpeak launch link: ts3server://217.18.90.7:2014
- Telegram channel and group links
- Account/settings/security UI preview and language toggle
- GitHub Pages deployment workflow

## Security and status
This branch is a static UI preview. Steam OpenID authentication, editable persistent profiles, support tickets, database, and admin authorization are **not active** in this static site. Never ask users for Steam passwords. Implement Steam OpenID on a server and validate the assertion server-side. Do not promote the first anonymous login to admin; configure the owner SteamID64 as a trusted environment secret and bootstrap it once.

## Publish
GitHub Actions must be enabled and GitHub Pages configured to use GitHub Actions. Check the workflow run for the final published URL.
