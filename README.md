# SuperNØva Smart Locker System

Sistema completo di smart locker con GPS tracking, controllo accessi e intelligenza artificiale integrata.

## 🏗️ Architettura

```
App/
├── frontend/           # Landing page marketing
│   ├── index.html     # Homepage
│   ├── styles.css     # Stili premium dark theme
│   └── script.js      # Animazioni e interattività
│
├── webapp/             # Web app di gestione
│   ├── index.html     # Dashboard e controlli
│   ├── app.css        # Stili dashboard
│   └── app.js         # Logica applicativa
│
├── backend/            # API Node.js/Express
│   ├── server.js      # Entry point
│   ├── middleware/    # Auth, logging, error handling
│   └── routes/        # Endpoint API
│
├── database/           # Schema PostgreSQL
│   └── schema.sql     # Definizione tabelle
│
└── docs/               # Documentazione
    └── api-specification.yaml
```

## 🚀 Quick Start

### Frontend (Landing Page)
```bash
# Apri direttamente nel browser
cd frontend
open index.html
# oppure usa un server locale
npx serve .
```

### Web App
```bash
# Apri direttamente nel browser
cd webapp
open index.html
# oppure usa un server locale
npx serve .
```

**Credenziali Demo:**
- Email: `demo@example.com`
- Password: `password123`

### Backend API
```bash
cd backend

# Installa dipendenze
npm install

# Copia configurazione
cp .env.example .env
# Modifica .env con i tuoi valori

# Avvia in development
npm run dev

# Avvia in production
npm start
```

Il server sarà disponibile su `http://localhost:3000`

### Database
```bash
# Crea database PostgreSQL
createdb supernova_db

# Esegui schema
psql supernova_db < database/schema.sql
```

## 🌐 GitHub Pages Deployment

La landing page è automaticamente deployata a GitHub Pages tramite GitHub Actions.

**URL**: [tvrvlli.com](https://tvrvlli.com)

### Come Funziona
- Ogni push su `main` che modifica il contenuto di `/frontend` triggera il workflow
- Il workflow copia la cartella `frontend` su `gh-pages`
- GitHub Pages automaticamente serve i file da `gh-pages`

### Configurazione
- `_config.yml`: Configura Jekyll e esclude cartelle non necessarie
- `.nojekyll`: Dice a GitHub di servire i file statici senza processare con Jekyll
- `.github/workflows/deploy-pages.yml`: Workflow GitHub Actions per il deploy automatico

### Verifica Locale
```bash
# Installa un server locale per testare
cd frontend
npx serve .
# Apri http://localhost:3000
```

## 📋 Funzionalità

### Landing Page
- ✅ Design premium dark theme con glassmorphism
- ✅ Animazioni e micro-interazioni
- ✅ Sezione specifiche tecniche interattiva
- ✅ Prezzi e piani di abbonamento
- ✅ Form contatto con validazione
- ✅ Responsive design

### Web App
- ✅ Dashboard con statistiche real-time
- ✅ Gestione dispositivi (lock/unlock)
- ✅ Mappa interattiva con posizioni GPS
- ✅ Controllo accessi e permessi
- ✅ Condivisione con familiari
- ✅ Log accessi con filtri ed export
- ✅ Configurazione alert e notifiche

### Backend API
- ✅ Autenticazione JWT con refresh token
- ✅ CRUD dispositivi
- ✅ GPS tracking e geofencing
- ✅ Controllo accessi role-based
- ✅ Codici temporanei di accesso
- ✅ Log audit trail
- ✅ WebSocket per aggiornamenti real-time
- ✅ Rate limiting e sicurezza

## 🔧 Specifiche Hardware Validate

| Componente | Modello | Prezzo | Note |
|------------|---------|--------|------|
| MCU | Nordic nRF5340 | €40-42 | Dual-core ARM Cortex-M33, BLE 5.2, Thread |
| GPS | u-blox NEO-M9N | €35-45 | Precisione ±2m, multi-costellazione |
| LTE-M | Simcom SIM7670SA | €20-30 | Cat-M1/NB-IoT |
| Accelerometro | Bosch BMI160 | €3-5 | Rilevamento movimento/tamper |
| Batteria | LiFePO4 5000mAh | €25-35 | 90-150 giorni autonomia |
| Serratura | DC Motor + Worm Gear | €10-25 | IP65, auto-bloccante |

### Correzioni Applicate

⚠️ **Batteria**: Corretto da "GPS full-time = 20 giorni" a **"GPS on-demand = 90-150 giorni"**
- Modalità sleep con wake-up da accelerometro
- GPS attivato solo su movimento o richiesta
- Profilo di consumo validato contro specifiche Nordic

## 💰 Modello di Business

### Hardware
- **CassapancaPro 2025**: €599 una tantum

### Software SaaS
| Tier | Prezzo | Funzionalità |
|------|--------|--------------|
| Free | €0/mese | Lock/unlock base, log 7gg, 1 utente |
| SmartSecurity | €5.99/mese | GPS real-time, 5 familiari, AI, 90gg log |
| Enterprise | Custom | Utenti illimitati, API, SLA 99.9% |

## 🔐 Sicurezza

- **Crittografia**: AES-256 end-to-end
- **Trasporto**: TLS 1.3
- **Autenticazione**: JWT con refresh token
- **Password**: bcrypt (12 rounds)
- **API**: Rate limiting, Helmet.js, CORS
- **Hardware**: ARM TrustZone

## 📡 API Endpoints

### Autenticazione
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

### Dispositivi
```
GET    /api/v1/devices
POST   /api/v1/devices
GET    /api/v1/devices/:id
PATCH  /api/v1/devices/:id
DELETE /api/v1/devices/:id
POST   /api/v1/devices/:id/lock
POST   /api/v1/devices/:id/unlock
```

### Posizioni
```
GET  /api/v1/locations/:deviceId
POST /api/v1/locations/:deviceId
GET  /api/v1/locations/:deviceId/history
POST /api/v1/locations/:deviceId/geofence
```

### Controllo Accessi
```
GET    /api/v1/access/:deviceId/permissions
POST   /api/v1/access/:deviceId/share
DELETE /api/v1/access/:deviceId/share/:permId
POST   /api/v1/access/:deviceId/temp-code
POST   /api/v1/access/:deviceId/verify-code
```

### Log
```
GET /api/v1/logs
GET /api/v1/logs/:deviceId
GET /api/v1/logs/:deviceId/stats
GET /api/v1/logs/export/csv
```

## 🔌 WebSocket Events

```javascript
// Client -> Server
socket.emit('authenticate', token);
socket.emit('subscribe:device', deviceId);

// Server -> Client
socket.on('device:status', { deviceId, status });
socket.on('device:location', { deviceId, location });
socket.on('alert:geofence', { deviceId, type, distance });
```

## 📱 Casi d'Uso

1. **Famiglia Multi-Generazionale**
   - Nonna vede posizione
   - Mamma gestisce accessi
   - Figli ricevono notifiche consegne

2. **Coliving/Condominio**
   - Spazi comuni condivisi
   - Token temporanei per ospiti
   - Alert se cassapanca viene spostata

3. **Logistica Last-Mile**
   - Corrieri vedono posizione su mappa
   - Codici automatici per apertura
   - Dashboard fleet per hub centrale

## 🧪 Testing

```bash
cd backend
npm test
```

## 📄 Licenza

Proprietario - © 2025 SuperNØva Smart Locker Solutions SRL

---

Realizzato con ❤️ a Piacenza, Italia
