# CareerMode

**CareerMode** è un'applicazione web per il tracciamento e la gestione delle candidature di lavoro, ispirata nell'interfaccia a Football Manager. Permette di tenere sotto controllo ogni candidatura — dallo stato al CV allegato — con statistiche, reminder e temi visivi personalizzabili.

---

## Indice

1. [Panoramica del progetto](#panoramica-del-progetto)
2. [Funzionalità v1.0](#funzionalità-v10)
3. [Stack tecnologico](#stack-tecnologico)
4. [Struttura del progetto](#struttura-del-progetto)
5. [Installazione](#installazione)
6. [Variabili d'ambiente](#variabili-dambiente)
7. [Database](#database)
8. [API](#api)
9. [Temi UI](#temi-ui)
10. [Roadmap](#roadmap)

---

## Panoramica del progetto

CareerMode nasce da un problema reale: gestire decine di candidature sparse tra email, fogli Excel e appunti è caotico e inefficiente. L'applicazione centralizza tutto in un'unica interfaccia, con un'estetica dark ispirata ai giochi manageriali come Football Manager e Civilization.

Il progetto è pensato come applicazione multi-utente con registrazione, dove ogni utente gestisce i propri dati in modo completamente isolato.

---

## Funzionalità v1.0

- Tracciamento candidature con stato (inviata, colloquio, in attesa, rifiutata, bozza)
- Salvataggio del testo originale dell'offerta di lavoro
- Allegati per CV e cover letter (upload e download)
- Valutazione personale dell'offerta (stelle e percentuale di compatibilità)
- Tag personalizzabili per ogni candidatura
- Statistiche e grafici aggregati
- Reminder con notifiche per colloqui e scadenze
- 6 temi dark preimpostati + possibilità di temi light futuri
- Autenticazione multi-utente con Laravel Sanctum

---

## Stack tecnologico

| Layer | Tecnologia |
|---|---|
| Backend | PHP 8.2 + Laravel 11 |
| Autenticazione | Laravel Sanctum |
| Database | MySQL 8 |
| Frontend | React 18 + Vite |
| State management | Zustand |
| HTTP client | Axios |
| Grafici | Recharts |
| Storage file | Laravel Storage (local/S3) |
| Job scheduling | Laravel Scheduler (reminder) |

---

## Struttura del progetto

```
careermode/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── ApplicationController.php
│   │   │   ├── AttachmentController.php
│   │   │   ├── ReminderController.php
│   │   │   ├── TagController.php
│   │   │   ├── AuthController.php
│   │   │   └── UserController.php
│   │   ├── Requests/
│   │   │   ├── StoreApplicationRequest.php
│   │   │   └── UpdateApplicationRequest.php
│   │   └── Resources/
│   │       ├── ApplicationResource.php
│   │       └── ApplicationCollection.php
│   ├── Models/
│   │   ├── Application.php
│   │   ├── Attachment.php
│   │   ├── Reminder.php
│   │   ├── Tag.php
│   │   └── User.php
│   ├── Policies/
│   │   └── ApplicationPolicy.php
│   └── Notifications/
│       └── ReminderNotification.php
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── routes/
│   ├── api.php
│   └── web.php
├── storage/app/attachments/
└── frontend/                  ← progetto React separato
    └── src/
        ├── pages/
        ├── components/
        ├── hooks/
        ├── store/
        ├── api/
        └── themes/
```

---

## Installazione

### Prerequisiti

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL 8

### Backend (Laravel)

```bash
git clone https://github.com/tuousername/careermode.git
cd careermode

composer install
cp .env.example .env
php artisan key:generate

# Configura il database nel file .env
php artisan migrate --seed
php artisan storage:link

php artisan serve
```

### Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env

# Imposta VITE_API_URL nel file .env
npm run dev
```

---

## Variabili d'ambiente

### Backend `.env`

```env
APP_NAME=CareerMode
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=careermode
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173

MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@careermode.app

FILESYSTEM_DISK=local
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Database

Lo schema completo è documentato in [`docs/database.md`](docs/database.md).

Le tabelle principali sono:

- `users` — utenti registrati
- `applications` — candidature di lavoro
- `attachments` — CV e cover letter allegati
- `reminders` — promemoria per colloqui e scadenze
- `tags` — etichette personalizzate
- `application_tags` — tabella pivot many-to-many

---

## API

La documentazione completa delle API REST è in [`docs/api.md`](docs/api.md).

Tutte le route (eccetto registrazione e login) richiedono autenticazione via Bearer Token (Laravel Sanctum).

Base URL: `http://localhost:8000/api`

---

## Temi UI

CareerMode include 6 temi dark preimpostati, selezionabili dalle impostazioni del profilo utente. La preferenza viene salvata nel database e applicata a ogni accesso.

| Nome | Colore primario |
|---|---|
| Midnight Blue (default) | #4a9eff |
| Forest Green | #3dba7e |
| Ember Orange | #e8843a |
| Steel Gray | #a0a8b8 |
| Crimson Red | #e05a5a |
| Violet Night | #9b7de8 |

Il sistema di temi è implementato tramite CSS custom properties, permettendo il cambio in tempo reale senza reload della pagina.

---

## Roadmap

### v1.0 — MVP
- [x] Progettazione UI/UX
- [x] Schema database
- [x] Architettura tecnica
- [ ] Setup progetto Laravel + React
- [ ] Autenticazione (registrazione, login, logout)
- [ ] CRUD candidature
- [ ] Upload allegati
- [ ] Reminder
- [ ] Statistiche e grafici
- [ ] Temi UI

### v1.1 — Futuri miglioramenti
- [ ] Temi light
- [ ] Esportazione dati (CSV, PDF)
- [ ] Parsing automatico offerta tramite URL
- [ ] Matching AI tra offerta e CV
- [ ] Generazione cover letter con AI
- [ ] App mobile (Flutter)
