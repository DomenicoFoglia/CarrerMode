# Decisioni tecniche — CareerMode

Documento che raccoglie le scelte di progettazione e architettura prese durante la fase di pianificazione, con le relative motivazioni.

---

## Architettura generale

**Scelta:** SPA (Single Page Application) con backend API separato.

**Motivazione:** React gestisce l'intera UI in modo reattivo, mentre Laravel espone solo API REST. Questa separazione permette in futuro di aggiungere un client mobile (Flutter) senza toccare il backend.

---

## Autenticazione

**Scelta:** Laravel Sanctum con token API.

**Motivazione:** Sanctum è più semplice di Passport per questo caso d'uso (SPA + mobile futuro). I token vengono inviati nell'header `Authorization: Bearer` da ogni richiesta React.

---

## Chiavi primarie UUID

**Scelta:** UUID invece di integer auto-increment per tutte le tabelle.

**Motivazione:** Gli UUID non espongono informazioni sulla quantità di dati nel sistema (un utente non può indovinare che esistono 10.000 candidature vedendo `id=10001`). Inoltre facilitano la sincronizzazione futura con eventuale storage esterno.

---

## Database

**Scelta:** MySQL 8.

**Motivazione:** Ampiamente supportato, compatibile con qualsiasi hosting italiano, e ben integrato con Laravel. Il team conosce già MySQL dalla formazione bootcamp.

---

## State management frontend

**Scelta:** Zustand.

**Motivazione:** Redux è eccessivo per questo progetto. Zustand è leggero (~1KB), non richiede boilerplate, e permette di gestire lo stato globale (utente autenticato, tema attivo) in modo semplice. Per i dati server-side (lista candidature, ecc.) si useranno chiamate dirette con Axios senza cache globale nella v1.0.

---

## Temi UI

**Scelta:** CSS custom properties (variabili CSS) per i temi, con un file CSS per tema.

**Motivazione:** Il cambio tema avviene in tempo reale applicando una classe al tag `<html>` o `<body>`. Non serve nessuna libreria esterna. La preferenza tema viene salvata nel database (`users.theme`) e ripristinata ad ogni accesso.

**Temi disponibili v1.0:**
- midnight (default) — blu notte
- forest — verde scuro
- ember — arancione bruciato
- steel — grigio acciaio
- crimson — rosso scuro
- violet — viola notte

**Temi previsti v1.1:**
- Temi light da definire

---

## Gestione file allegati

**Scelta:** Laravel Storage (disco local in sviluppo, S3 in produzione).

**Motivazione:** `Storage::disk('local')` in sviluppo è sufficiente. In produzione basterà cambiare `FILESYSTEM_DISK=s3` nel `.env` senza toccare il codice. I file vengono organizzati in `attachments/{user_id}/{application_id}/`.

**Sicurezza:** I file non sono mai accessibili direttamente via URL pubblico. Il download avviene sempre tramite il controller che verifica l'ownership.

---

## Reminder e notifiche

**Scelta:** Laravel Scheduler + Laravel Notifications.

**Motivazione:** Un comando schedulato controlla ogni minuto i reminder con `remind_at <= now()` e `sent = false`, invia la notifica via email e imposta `sent = true`. Non è necessario un sistema di code (Queue) nella v1.0.

**Configurazione cron (su server):**
```
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

---

## Soft delete

**Scelta:** Non implementato nella v1.0.

**Motivazione:** La v1.0 usa hard delete per semplicità. Se in futuro si vuole il cestino/ripristino, basterà aggiungere `SoftDeletes` al model e la colonna `deleted_at` alla migration.

---

## Validazione

**Scelta:** Laravel Form Requests per la validazione backend.

**Motivazione:** Separare la logica di validazione dai controller mantiene il codice pulito. Ogni endpoint che accetta dati ha il suo Form Request dedicato (`StoreApplicationRequest`, `UpdateApplicationRequest`, ecc.).

---

## Autorizzazione

**Scelta:** Laravel Policies.

**Motivazione:** `ApplicationPolicy` garantisce che ogni utente possa vedere, modificare ed eliminare solo le proprie candidature. La policy viene invocata automaticamente nei controller tramite `$this->authorize()`.

---

## API Response format

**Scelta:** Laravel API Resources.

**Motivazione:** Le API Resources (`ApplicationResource`, `ApplicationCollection`) permettono di formattare in modo consistente le risposte JSON, nascondendo campi interni e aggiungendo dati calcolati (es. `applications_count` nei tag).

---

## Paginazione

**Scelta:** Paginazione server-side con 15 risultati per pagina (configurabile).

**Motivazione:** Un utente attivo potrebbe avere centinaia di candidature. Caricare tutto in una sola chiamata sarebbe inefficiente. La paginazione server-side è gestita da Laravel (`->paginate()`).

---

## Grafici

**Scelta:** Recharts (libreria React).

**Motivazione:** Recharts è ben integrata con React, ha una API dichiarativa, è leggera e ha una buona documentazione. Alternativa valutata: Chart.js — scartata perché richiede più configurazione con React.

---

## UI ispirata a Football Manager

**Scelta:** Dark theme di default, layout a pannelli, tabelle dense di dati, badge colorati per gli stati.

**Motivazione:** Scelta estetica distintiva che differenzia CareerMode dai competitor (Teal, Huntr) che usano tutti interfacce bianche e minimaliste. Rende il progetto memorabile sul CV.
