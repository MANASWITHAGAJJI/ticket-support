# Ticket Hub — Support Ticket System

A responsive, frontend-only customer support helpdesk built with HTML5, CSS3 and vanilla JavaScript. It follows the supplied internship brief and stores demo data in the browser's `localStorage`; no database or backend is required.

## Features
- Dashboard with ticket statistics, recent tickets and priority distribution
- Create, view, edit and delete support tickets
- Search tickets and filter by status, priority and assigned agent
- Ticket detail view with status, priority and agent updates
- Ticket conversation/reply history
- Knowledge base with add-article dialog
- Agent management and open workload counts
- Reports with status distribution and CSV export
- Responsive sidebar/mobile navigation
- Dark mode
- Browser localStorage persistence

## Run locally
1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. No build tools, package installation or server are required.

For best results, use a current version of Chrome, Edge, Firefox or Safari. Google Fonts are loaded from the web; the app remains usable if they are unavailable.

## Project files
- `index.html` — application structure
- `style.css` — layout, theme and responsive styling
- `script.js` — sample data, UI rendering, ticket CRUD and localStorage

## Notes
This is a frontend demonstration. Login/logout and notifications are simulated, and data is stored only in the browser profile where the app is opened. It is not a production-secure multi-user helpdesk.

## Deploy
You can publish the folder using GitHub Pages, Netlify or Vercel. For GitHub Pages, push these files to a public repository and enable Pages from the repository's Settings.
