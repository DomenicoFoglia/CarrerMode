<p align="center">
  <img src="frontend/public/web-app-manifest-192x192.png" width="80" alt="CarrerMode logo" />
</p>

<h1 align="center">
  <span style="color:#e0e4ee">Carrer</span><span style="color:#4a9eff">Mode</span>
</h1>

<p align="center">
  Web application full stack per gestire le candidature di lavoro in modo strutturato e intelligente.<br>
  Traccia ogni candidatura, valuta le offerte con l'AI, imposta reminder via email e monitora i tuoi progressi.
</p>

---

Imamgine->Dashboard

---

## Indice

- [Stack tecnologico](#stack-tecnologico)
- [Funzionalità](#funzionalità)
- [Screenshot](#screenshot)
- [Installazione](#installazione)
- [Avvio in locale](#avvio-in-locale)
- [Struttura del repository](#struttura-del-repository)
- [Autore](#autore)

---

## Stack tecnologico

**Backend**
- PHP 8.4 con Laravel 13
- MySQL 8.0
- Laravel Sanctum (autenticazione token)
- Google Gemini 2.5 Flash (integrazione AI)
- Laravel Scheduler e Notifications (email reminder)

**Frontend**
- React 19 con Vite
- Zustand (state management)
- Axios con interceptor
- React Router DOM
- Recharts 2.15
- react-i18next (internazionalizzazione IT/EN)
- react-hot-toast
- lucide-react

---

## Funzionalità

- Registrazione e autenticazione con token Sanctum
- CRUD completo delle candidature con campi dettagliati: azienda, ruolo, stato, RAL, tipo di contratto, fonte, note personali e testo dell'offerta
- Filtri server-side per stato, ricerca testuale e tag (modalità AND/OR) con paginazione configurabile
- Tag colorati personalizzabili per ogni utente
- Allegati per ogni candidatura: caricamento, visualizzazione e download di CV e cover letter (PDF, DOCX, ODT)
- Esportazione di tutte le candidature in formato CSV compatibile con Excel
- Reminder con notifica email automatica tramite Laravel Scheduler
- Statistiche avanzate: andamento mensile, distribuzione stati, tag più usati, tipi di contratto
- Analisi AI dell'offerta di lavoro rispetto al CV con match score, punti di forza e lacune
- Generazione cover letter personalizzata con AI
- Chiave API Gemini configurabile per ogni utente (cifrata nel database)
- 10 temi visivi (6 scuri, 4 chiari) con persistenza nel database
- Interfaccia completamente tradotta in italiano e inglese
- Onboarding guidato al primo accesso, ripetibile dalle impostazioni
- Dashboard asimmetrica con layout 70/30 e colonna destra sticky
- Design responsive con breakpoint a 1100px

---

## Screenshot


<!-- SCREENSHOT: Pagina candidature con filtri e tag -->
*Lista candidature con filtri avanzati*

---

<!-- SCREENSHOT: Dettaglio candidatura con pannello AI -->
*Dettaglio candidatura con analisi AI*

---

<!-- SCREENSHOT: Pagina statistiche -->
*Statistiche avanzate*

---

<!-- SCREENSHOT: Pagina impostazioni con temi -->
*Impostazioni e selezione tema*

---

## Installazione

### Prerequisiti

- PHP 8.4 
- Composer
- Node.js 18+
- MySQL 8.0

### Backend

```bash
# Clona il repository
git clone https://github.com/DomenicoFoglia/CarrerMode.git
cd CarrerMode

# Installa le dipendenze PHP
composer install

# Copia il file di configurazione
cp .env.example .env

# Genera la chiave applicazione
php artisan key:generate

# Configura il file .env con i dati del database
# DB_DATABASE=carrermode
# DB_USERNAME=root
# DB_PASSWORD=

# Crea il database
mysql -u root -p -e "CREATE DATABASE carrermode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Esegui le migration
php artisan migrate
```

### Frontend

```bash
cd frontend

# Installa le dipendenze
npm install
```

### Configurazione email (opzionale, per i reminder)

Nel file `.env` configura il mailer. In sviluppo si consiglia [Mailtrap](https://mailtrap.io):

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=il_tuo_username
MAIL_PASSWORD=la_tua_password
MAIL_FROM_ADDRESS=noreply@carrermode.it
MAIL_FROM_NAME="CarrerMode"
```

### Chiave API Gemini (opzionale, per le funzionalità AI)

Non è necessaria una chiave nel file `.env`. Ogni utente inserisce la propria chiave direttamente dalla pagina Impostazioni dell'applicazione. La chiave gratuita di [Google AI Studio](https://aistudio.google.com/apikey) è sufficiente (250 richieste al giorno).

---

## Avvio in locale

Apri tre terminali separati:

**Terminale 1 — Backend**
```bash
php artisan serve
```

**Terminale 2 — Frontend**
```bash
cd frontend
npm run dev
```

**Terminale 3 — Scheduler email (opzionale)**
```bash
php artisan schedule:work
```

L'applicazione sarà disponibile su `http://localhost:5173`.

---

## Struttura del repository

```
CarrerMode/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuthController.php
│   │   ├── ApplicationController.php
│   │   ├── AttachmentController.php
│   │   ├── ReminderController.php
│   │   ├── TagController.php
│   │   ├── UserController.php
│   │   └── AiController.php
│   ├── Models/
│   └── Notifications/
│       └── ReminderNotification.php
├── database/migrations/
├── routes/
│   ├── api.php
│   └── console.php
├── storage/app/attachments/
└── frontend/
    └── src/
        ├── api/
        ├── components/
        │   ├── layout/
        │   ├── ConfirmModal.jsx
        │   ├── LanguageSwitcher.jsx
        │   └── OnboardingModal.jsx
        ├── pages/
        ├── store/
        ├── themes/
        └── locales/
            ├── it.json
            └── en.json
```

---

## Autore

**Domenico Foglia**

- GitHub: [github.com/DomenicoFoglia](https://github.com/DomenicoFoglia)
- LinkedIn: [linkedin.com/in/domenicofoglia](https://linkedin.com/in/domenicofoglia)

---

*Costruito con Laravel e React 2026*