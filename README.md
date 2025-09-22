# Organigramma Aziendale

Applicazione React + TypeScript che permette di progettare un organigramma interattivo: crea reparti collegati tra loro, gestisci mansioni e dipendenti, personalizza colori e layout direttamente dal browser.

## Requisiti

- Node.js 22.12.0 o superiore (consigliato per evitare avvisi durante la build)
- npm 10+

## Sviluppo locale

```bash
npm install
npm run dev
```

Visita l'URL indicato in console (di norma `http://localhost:5173`).

## Build di produzione

```bash
npm run build
```

I file ottimizzati finiscono nella cartella `dist/`.

## Deploy automatico su GitHub Pages

Il repository include il workflow `.github/workflows/deploy.yml` che costruisce e pubblica l'app su GitHub Pages ogni volta che vengono effettuati push sul branch `main` (o manualmente via _Run workflow_).

1. Pubblica il repository su GitHub e abilita **Settings → Pages → Build and deployment → GitHub Actions**.
2. Effettua un push su `main`. Il workflow:
   - installa le dipendenze;
   - esegue `npm run build`;
   - carica i file da `dist/` su GitHub Pages.
3. L'URL finale viene mostrato alla fine del job "Deploy to GitHub Pages".

### Base path e repository

Il file `vite.config.ts` imposta automaticamente il `base` corretto quando la build avviene su GitHub Actions:

- per repository di tipo progetto (`username/repo`), i file vengono serviti da `/repo/`;
- per siti utente/organizzazione (`username.github.io`) la base resta `/`.

Se devi forzare un path diverso (per esempio in ambienti self-hosted), imposta la variabile `VITE_BASE_PATH` prima di eseguire la build:

```bash
VITE_BASE_PATH=/custom-base/ npm run build
```

## Script npm disponibili

- `npm run dev` – avvia il server di sviluppo Vite;
- `npm run build` – esegue TypeScript e la build di produzione;
- `npm run preview` – serve localmente la build prodotta;
- `npm run lint` – avvia ESLint.

---

Per personalizzazioni aggiuntive (nuovi workflow, domini personalizzati, ecc.) aggiorna la cartella `.github/workflows/` o le impostazioni Pages secondo le tue esigenze.
