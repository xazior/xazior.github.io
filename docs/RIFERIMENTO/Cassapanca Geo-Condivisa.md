**📍 CASSAPANCA SMART CON GEOLOCALIZZAZIONE E CONDIVISIONE**

**Estensione Prodotto: Smart Locker Solutions SRL**

**EXECUTIVE SUMMARY**

La **Cassapanca Smart Geo-Condivisa** rappresenta un'evoluzione
strategica del progetto originale, trasformando il prodotto da
**dispositivo singolo isolato** a **nodo di una rete condivisa e
tracciata**.

**Proposizione di Valore Ampliata**

**Prima (Prodotto Base)**:

- "Smart box per ricezione pacchi in casa mia"

- Singolo utente, uso privato

- Tracciamento: Solo accessi locali

**Dopo (Geo-Condivisa)**:

- "Cassapanca smart connessa che conosco sempre dove si trova e chi può
  accedervi"

- Multi-utente, uso condiviso (famiglia, coinquilini, piccole comunità)

- Tracciamento: Geolocalizzazione GPS/Bluetooth + permessi granulari

- Ecosistema: Rete di cassapanche interconnesse

**Nuovi Mercati Sbloccati**

|  |  |  |
|----|----|----|
| Segmento | Scenario | TAM Incrementale |
| **Famiglia Multigenerazionale** | Nonna con cassapanca smart in giardino, nipoti vedono posizione, genitori gestiscono accessi | +€50M Italia |
| **Coinquilini/Coliving** | Spazi comuni condivisi con tracciamento di chi deposita/preleva | +€80M Europa |
| **Logistica Last-Mile** | Corrieri vedono cassapanca sulla mappa, la carica automaticamente se sotto batteria | +€200M Italia |
| **Smart Communities** | Reti di cassapanche nei quartieri per e-commerce cooperativo | +€150M Italia |
| **Hospitality** | Hotel/B&B con cassapanche nel giardino, ospiti accedono con QR/NFC + tracking | +€100M Europa |
| **Property Management** | Gestori immobiliari controllano più proprietà con accesso centralizzato | +€120M Italia |

**TAM Potenziale Incrementale**: €700M+ (vs €80M del prodotto base)

**ARCHITETTURA TECNICA AMPLIATA**

**Componenti Hardware Aggiuntivi**

**1. GPS/GNSS Module (Geolocalizzazione Precisa)**

|  |  |  |  |  |  |
|----|----|----|----|----|----|
| Opzione | Tecnologia | Precisione | Consumo | Costo | Note |
| **GPS u-blox NEO-M9N** | A-GPS + GALILEO | ±2m | 50mA (con SIM) | €35-45 | Outdoormost affidabile |
| **Quectel LC76F** | Dual-frequency GNSS | ±1m | 40mA | €25-35 | Più economico, buono per motori |
| **BeiDou + Galileo (Copernicus)** | Multi-constellation | ±0.5m | 35mA | €40-50 | Ridondanza europea |
| **LTE-M + Triangolazione** | Cell tower positioning | ±20-50m | 5mA | €15-25 | Alternativa basso consumo |

**Consiglio**: **u-blox NEO-M9N** per outdoor robusti, **LTE-M
fallback** per ambienti urbani

**2. Modulo LTE-M / NB-IoT (Tracking Remoto)**

Se cassapanca è in **spazi comuni o trasportata**:

|  |  |  |  |  |
|----|----|----|----|----|
| Opzione | Banda | Consumo | Costo | Applicazione |
| **Simcom SIM7670SA** | LTE-M / NB-IoT | 30mA peak | €20-30 | Tracking motion |
| **Quectel EC200T-EU** | LTE-M / Cat-M1 | 25mA peak | €18-25 | Posizione real-time |
| **Ericsson MONO2-G (legacy)** | 2G fallback | 50mA | €12-18 | Backup rurale |

**Consumo stima**: GPS full-time = 50mA = batteria esaurisce in 20
giorni  
→ **Soluzione**: GPS attivato **on-demand** (ogni 30 min) oppure con
**motion sensor** (accelerometro)

**3. Accelerometro + Motion Detection**

Riducibile da **sempre-acceso** a **smart-trigger**:

Stato SLEEP: Accelerometro passivo, consumo 10μA  
↓  
Movimento rilevato → Attiva GPS per 60 sec  
↓  
Update posizione cloud + torna SLEEP

**Componente**: **BMI160 (Bosch)** - €3-5, 2mm², I²C interface

**4. Batteria Ampliata (Dual-Mode)**

Scenario: Cassapanca **spostabile** tra proprietà o comunità:

|  |  |  |  |  |
|----|----|----|----|----|
| Configurazione | Capacità | GPS+LTE-M | GPS Only | Durata |
| **Singola Li-Ion 5000mAh** | 18.5Wh | 7-10 giorni | 14-20 giorni | Base |
| **Dual 2x 5000mAh (serie)** | 37Wh | 14-20 giorni | 28-40 giorni | Extended |
| **Con Solar 10W Panel** | 37Wh + rigenera | Indefinito | Indefinito | Outdoor perenne |

**Nota**: Se cassapanca **fissa in giardino** = solar obbligatorio per
GPS continuo

**ARCHITETTURA SOFTWARE E CLOUD**

**Backend Architettura**

┌─────────────────────────────────────────────────────────┐  
│ CLOUD PLATFORM │  
├─────────────────────────────────────────────────────────┤  
│ │  
│ ┌──────────────────┐ ┌──────────────────┐ │  
│ │ API Gateway │ │ Auth/JWT │ │  
│ │ (Public REST) │ │ OAuth2 │ │  
│ └────────┬─────────┘ └────────┬─────────┘ │  
│ │ │ │  
│ ┌────────▼─────────────────────▼────────┐ │  
│ │ Microservices Architettura │ │  
│ ├─────────────────────────────────────┤ │  
│ │ │ │  
│ │ ┌─ Location Service ────────────┐ │ │  
│ │ │ • GPS data ingestion │ │ │  
│ │ │ • Real-time position update │ │ │  
│ │ │ • Geo-fencing + Alerts │ │ │  
│ │ │ • History retention (90gg) │ │ │  
│ │ └─────────────────────────────┘ │ │  
│ │ │ │  
│ │ ┌─ Access Control Service ───────┐ │ │  
│ │ │ • Role-based permissions │ │ │  
│ │ │ • Temporary access tokens │ │ │  
│ │ │ • Share/Revoke logic │ │ │  
│ │ │ • Audit trail │ │ │  
│ │ └─────────────────────────────────┘ │ │  
│ │ │ │  
│ │ ┌─ Notification Service ────────┐ │ │  
│ │ │ • Push notifications │ │ │  
│ │ │ • SMS/Email alerts │ │ │  
│ │ │ • Webhook per partner API │ │ │  
│ │ └─────────────────────────────────┘ │ │  
│ │ │ │  
│ │ ┌─ Lock Control Service ────────┐ │ │  
│ │ │ • Open/Close commands │ │ │  
│ │ │ • State sync │ │ │  
│ │ │ • Emergency unlock │ │ │  
│ │ └─────────────────────────────────┘ │ │  
│ │ │ │  
│ └─────────────────────────────────────┘ │  
│ │  
│ ┌──────────────────┐ ┌──────────────────┐ │  
│ │ Database │ │ Time Series DB │ │  
│ │ (PostgreSQL) │ │ (InfluxDB) │ │  
│ │ • Users/Devices │ │ • Location hist │ │  
│ │ • Permissions │ │ • Access logs │ │  
│ │ • Sharing links │ │ • Events trace │ │  
│ └──────────────────┘ └──────────────────┘ │  
│ │  
└─────────────────────────────────────────────────────────┘  
▲ ▲ ▲ ▲  
│ │ │ │  
┌────┴──┐ ┌────┴──┐ ┌────┴──┐ ┌──┴─────┐  
│ App │ │ Web │ │ Smart │ │Partner │  
│Mobile │ │Portal │ │Home │ │API │  
└───────┘ └───────┘ └───────┘ └────────┘

**API Endpoints Critici**

// Base URL: <https://api.smartlocker.io/v1>

// 1. LOCATION ENDPOINTS  
GET /devices/{deviceId}/location  
→ { lat: 45.052, lng: 9.695, accuracy: 2.5, timestamp:
"2025-12-10T01:49Z" }

GET /devices/{deviceId}/location/history?days=7  
→ \[ { lat, lng, timestamp }, ... \]

POST /devices/{deviceId}/geofence  
→ { radius: 100, center: { lat, lng }, action: "notify" }

// 2. SHARING & PERMISSIONS  
POST /devices/{deviceId}/share  
Body: { email: "<family@example.com>", role: "viewer\|manager", expires:
"2026-01-10" }  
→ { shareToken: "shr_abc123", expiresAt: "..." }

GET /devices/{deviceId}/shared-with  
→ \[ { email, role, granted_at }, ... \]

DELETE /devices/{deviceId}/share/{shareToken}  
→ { success: true }

// 3. COLLABORATIVE ACTIONS  
POST /devices/{deviceId}/open  
Body: { requester_id, reason: "retrieve_package" }  
→ { unlock_code: "A1B2C3", expiresIn: 300 }

GET /devices/{deviceId}/access-log  
→ \[ { user_email, action: "opened", timestamp, location }, ... \]

// 4. ALERTS & NOTIFICATIONS  
POST /devices/{deviceId}/alerts  
Body: { type: "low_battery\|tamper\|timeout", threshold: 20 }  
→ { alertId, status: "active" }

// 5. TRACKING FOR LOGISTICS  
GET /locations/nearby?lat=45.052&lng=9.695&radius=500  
→ \[ { deviceId, distance, status }, ... \]

**Data Model Principale**

{  
"device": {  
"id": "dev_cassapanca_001",  
"owner_id": "usr_leonardo",  
"model": "CassapancaPro-2025",  
"firmware_version": "1.4.2",  
"hardware_specs": {  
"gps_module": "uBlox_NEO_M9N",  
"lte_module": "Simcom_SIM7670SA",  
"battery_capacity_mah": 5000,  
"solar_panel_w": 10  
},  
"current_location": {  
"latitude": 45.0520,  
"longitude": 9.6950,  
"accuracy_m": 2.5,  
"altitude_m": 50,  
"timestamp": "2025-12-10T01:45:00Z",  
"source": "gps\|lte_triangulation\|bluetooth_beacon"  
},  
"status": {  
"is_locked": true,  
"battery_percent": 78,  
"signal_strength": -85,  
"gps_fix": "3D",  
"last_checkin": "2025-12-10T01:47:32Z"  
},  
"permissions": {  
"owner": {  
"user_id": "usr_leonardo",  
"role": "owner",  
"can_open": true,  
"can_share": true,  
"can_delete": true,  
"can_view_location": true,  
"can_view_logs": true  
},  
"shared_with": \[  
{  
"user_id": "usr_mamma",  
"email": "<mamma@famiglia.it>",  
"role": "manager",  
"can_open": true,  
"can_view_location": true,  
"can_view_logs": true,  
"expires_at": "2026-12-10T01:49:00Z"  
},  
{  
"user_id": "usr_nonna",  
"email": "<nonna@famiglia.it>",  
"role": "viewer",  
"can_open": false,  
"can_view_location": true,  
"can_view_logs": false,  
"expires_at": null  
}  
\]  
},  
"geofence": {  
"center": { "lat": 45.0520, "lng": 9.6950 },  
"radius_m": 50,  
"alert_on_exit": true,  
"alert_on_enter": false  
}  
},

"access_log": \[  
{  
"log_id": "log_2025_12_10_001",  
"timestamp": "2025-12-10T00:32:15Z",  
"user_id": "usr_leonardo",  
"action": "open",  
"method": "app_unlock",  
"location_gps": { "lat": 45.0519, "lng": 9.6951 },  
"device_battery_at_action": 82,  
"access_granted": true,  
"notes": "Retrieve package from DHL"  
}  
\]  
}

**CASI D'USO CON GEOLOCALIZZAZIONE**

**Caso 1: Famiglia Multi-Generazionale (RESIDENZIALE)**

**Scenario**:

- Leonardo: Proprietario cassapanca in giardino a Piacenza

- Mamma: Permesso "manager" (aprire, condividere, vedere posizione)

- Nonna: Permesso "viewer" (vedere posizione ma non aprire)

- Fratello: Accesso temporaneo (24h, scade domani)

**Flusso**:

1.  LEONARDO (Owner) crea cassapanca smart nel giardino  
    ├─ GPS attivo ogni 30 min (con accelerometro wake)  
    └─ Posizione memorizzata: 45.052°N, 9.695°E

2.  LEONARDO invia link di condivisione a MAMMA  
    ├─ URL: smartlocker.app/share/abc123def456  
    ├─ QR code da scannerizzare  
    └─ Permessi: \[open, view_location, view_logs\]

3.  MAMMA accetta invito  
    ├─ App sincronizza cassapanca nel suo account  
    ├─ Vede icona mappa con cassapanca a Piacenza  
    └─ Riceve notifica: "Cassapanca collegata"

4.  NONNA chiede di condividere a FRATELLO per 24h  
    ├─ Fratello riceve temporary token valido 24h  
    ├─ Non ha permesso "open", solo "view_location"  
    └─ Dopo 24h accesso revocato automaticamente

5.  Arriva PACCO DHL  
    ├─ Corriere posizionato a 150m dalla cassapanca  
    ├─ App mostra cassapanca su mappa, "Consegna da qui"  
    ├─ Corriere inserisce codice temporaneo  
    ├─ Cassapanca si apre, deposita pacco  
    ├─ TUTTI (Leonardo, Mamma, Nonna, Fratello) ricevono notifica:  
    │ "Pacco depositato da \[DHL\], posizione: 45.052°N 9.695°E, ore
    14:30"  
    └─ Logging: Chi, quando, da dove, con quale dispositivo

6.  LEONARDO torna a casa  
    ├─ App vibra: "Sei a 50m dalla cassapanca"  
    ├─ Mappa mostra la sua posizione vs cassapanca  
    ├─ Apre app, visualizza accessi recenti (DHL ha aperto)  
    └─ Ritira pacco, cassapanca si richiude

**Valore UX**:

- Nonna vede sempre dove sta il contenitore (non si perde)

- Mamma sa chi ha acceduto e quando

- Leonardo sa esattamente dove è la cassapanca

- Corriere ha direzioni precise

**Caso 2: Coinquilini / Coliving (CONDIVISO)**

**Scenario**:

- 4 coinquilini in appartamento, 1 cassapanca in ingresso condominiale

- Ognuno ha un ruolo diverso

**Flusso**:

1.  ALICE (Affittatrice) crea cassapanca condominiale  
    ├─ GPS auto-config: edificio in Via Roma 42  
    ├─ Geofence: 100m dal cancello (perimetro condominio)  
    └─ Alert: "Exit geofence" (se qualcuno la ruba!)

2.  ALICE condivide con BOB, CHARLIE, DIANA  
    ├─ BOB → role "manager" (può gestire condivisioni ulteriori)  
    ├─ CHARLIE → role "user" (solo aprire)  
    └─ DIANA → role "viewer" (solo vedete)

3.  CHARLIE ordina pacco AMAZON  
    ├─ Riceve notifica: "Cassapanca a 50m dalla tua posizione"  
    ├─ Quando arriva a 30m: "Clicca 'Prepara' per notificare corriere"  
    └─ Corriere vede cassapanca su mappa inter-courier

4.  CORRIERE deposita  
    ├─ Cassapanca registra: timestamp, foto del pacco (se telecamera)  
    ├─ ALL ricevono: "Pacco per CHARLIE depositato da AMAZON"  
    └─ Logging: Accesso da IP correliere + geolocalizzazione

5.  CHARLIE preleva  
    ├─ App mostra: "Ultimo accesso: tu, ore 15:45"  
    ├─ Log mostra: AMAZON (12:30) → CHARLIE (15:45)  
    └─ Nessun mistero su chi ha toccato cosa

6.  BOB ACCIDENTALMENTE sposta cassapanca  
    ├─ Accelerometro rileva movimento  
    ├─ GPS aggiorna: Nuova posizione (fuori geofence)  
    ├─ ALICE riceve ALERT: "⚠️ Cassapanca è stata spostata!"  
    ├─ Localizzazione mostrata a TUTTI  
    └─ BOB riceve: "Notifica invio di movimento rilevato"

7.  BOB sposta di nuovo (la riporta al suo posto)  
    ├─ Geofence check: "Rientrata in perimetro"  
    ├─ TUTTI ricevono: "✅ Cassapanca rientrata in posizione normale"  
    └─ Alert dismiss automatico

**Valore UX**:

- BOB sa dove mettere la cassapanca (mappa interattiva)

- ALICE sa se è stata spostata (sicurezza)

- CHARLIE sa che il pacco è arrivato e dove (tracking)

- DIANA (viewer) non rischia di accidentalmente aprirla

**Caso 3: Last-Mile Logistica (B2B)**

**Scenario**:

- 50 cassapanche sparse in un quartiere di Milano

- Corrieri di 5 aziende diverse (DHL, SDA, Poste, GLS, Bartolini)
  consegnano

- Hub centrale traccia tutte in tempo reale

**Flusso**:

1.  SETUP INIZIALE (Property Manager)  
    ├─ Crea 50 "PostBox Nodes" su mappa  
    ├─ Assegna ogni cassapanca a una proprietà  
    ├─ Ogni cassapanca ha GPS + LTE-M (sempre accesa)  
    ├─ Geo-fence definito per ogni condominio  
    └─ API espone: /locations/nearby?radius=500m

2.  CORRIERE DHL (Driver)  
    ├─ App mostra mappa con tutte le cassapanche a 5km  
    ├─ Naviga a "Via Roma 42 - Cassapanca Rossi"  
    ├─ Arriva a 100m, app buzz: "Destinazione 100m"  
    ├─ Arriva a 10m, app buzz: "Sei qui"  
    ├─ Scannerizza QR sulla cassapanca  
    ├─ Backend verifica: "Pacchi per questa proprietà: 2"  
    ├─ Cassapanca assegna temp code per il primo pacco  
    ├─ DHL apre, deposita, app registra: "DHL_001\_@10:32_Via_Roma_42"  
    └─ Cassapanca si richiude, backend notifica proprietario

3.  TRACCIAMENTO HUB CENTRALE  
    ├─ Operatore vede mappa live con:  
    │ ├─ 50 cassapanche (icone verde=OK, giallo=avviso, rosso=errore)  
    │ ├─ 5 corrieri in tempo reale (traccia GPS corriere)  
    │ ├─ Rotta ottimale per completare delivery  
    │ └─ ETA per ogni cassapanca (algoritmo ML-based)  
    │  
    ├─ Cassapanca \#12 mostra: "Batteria 45%, ultimo accesso 6h fa"  
    ├─ Sistema: "Agenda ispezione cassapanca \#12 domani"  
    ├─ Cassapanca \#34 mostra: "Geofence BREACH! Spostata 200m"  
    ├─ Sistema alert: "Potenziale furto o manomissione"  
    └─ Operatore ordina ispezione immediata

4.  STATISTICHE E ANALYTICS  
    ├─ Report giornaliero:  
    │ ├─ Consegne completate: 142  
    │ ├─ Tempo medio consegna: 4.2 min  
    │ ├─ Cassapanche inattive: 0  
    │ ├─ Batteri critiche (\<20%): 2  
    │ └─ Breach geofence: 0  
    │  
    └─ Property manager riceve: "Cassapanca \#3 necessita manutenzione
    (batt. 15%)"

**Valore UX**:

- Corrieri trovano cassapanche su mappa (no più appunti)

- Hub centrale sa dove sono TUTTI i pacchi in real-time

- Proprietari ricevono notifiche di consegna automatiche

- Sistema rileva anomalie (furti, malfunzionamenti)

**Caso 4: Smart Communities (ECOSISTEMA)**

**Scenario**:

- Quartiere ECO di 100 famiglie a Bologna

- 20 cassapanche distribuite negli spazi comuni

- Sharing economy: "Raccolgo il pacco per il mio vicino"

**Flusso**:

1.  SETUP COMMUNITY  
    ├─ Admin crea "Cassapanca Network" del quartiere  
    ├─ Mappa mostra 20 cassapanche in spazi pubblici  
    ├─ Ogni residente ha app con ubicazione cassapanche  
    └─ Sistema: Raccomandarsi cassapanche vicine (100m)

2.  FRANCESCA ordina online  
    ├─ Carrello da spedire a Bologna  
    ├─ App mostra: "Cassapanca più vicina: 150m da casa (Via Rossini)"  
    ├─ Francesca spunta: "Consegna a cassapanca smart"  
    ├─ E-commerce riceve info cassapanca + codice accesso temporaneo  
    └─ Traccia: Cassapanca Via Rossini

3.  CORRIERE consegna  
    ├─ App mostra cassapanca su mappa  
    ├─ Deposita pacco  
    ├─ Sistema notifica: FRANCESCA + COMUNITÀ  
    ├─ Notifica pubblica (opt-in): "Pacco depositato per Francesca, Via
    Rossini"  
    └─ (Francesca ha opt-in per notifiche "community")

4.  SMART NEIGHBORS  
    ├─ MARIO (vicino) vede: "Pacco per Francesca a 200m da qui"  
    ├─ MARIO chiede a Francesca: "Ritiro io?"  
    ├─ Francesca approva via app (share temporaneo)  
    ├─ MARIO riceve access code per 2h  
    ├─ MARIO va a cassapanca, apre, ritira pacco  
    ├─ Sistema registra: "Ritiro per conto di Francesca"  
    ├─ MARIO riceve crypto-reward: 0.5€ (incentivo community)  
    ├─ Francesca risparmia tempo + sostenibilità  
    └─ Tutte azioni loggare pubblicamente (tracciabilità)

5.  DASHBOARD COMMUNITY  
    ├─ Mappa mostra "pickup delivery completed: 45% del totale"  
    ├─ Stat: "Distanza media ridotta: 600m per pickup sharing"  
    ├─ Leaderboard: "Top sharers" (gamification)  
    ├─ Stats CO2: "Savings: 250kg CO2 questo mese"  
    └─ Community vede valore collettivo

**Valore UX**:

- Francesca non deve stare a casa ad aspettare

- Mario guadagna piccoli incentivi aiutando

- Comunità riduce consegne ripetute (sostenibilità)

- Tracciamento completo di tutti i movimenti

**MODELLO DI BUSINESS AMPLIATO**

**Revenue Streams (Geolocalizzazione + Condivisione)**

|  |  |  |  |
|----|----|----|----|
| Stream | Modello | Margine | TAM Stimato |
| **B2C Premium App** | €2.99/mese per geo+share illimitato | 85% | €4M anno |
| **B2B Logistics** | €500/cassapanca/anno (API + tracking) | 75% | €30M anno |
| **Smart Communities** | €0.05-0.10/delivery tracking (take 2%) | 60% | €20M anno |
| **Location Services** | API data anonymized per urban planners | 80% | €2M anno |
| **Insurance Data Feed** | Correlazione theft+location per assicurazioni | 70% | €5M anno |
| **Property Management** | Piattaforma SaaS multi-proprietà | 80% | €15M anno |

**Total Addressable Market (con Geo)**: €76M+ anno

**Pricing Tiers (B2C)**

┌─────────────────────────────────────────────────┐  
│ SMART LOCKER GEO PRICING │  
├─────────────────────────────────────────────────┤  
│ │  
│ 🆓 FREE │  
│ ├─ Basic lock/unlock │  
│ ├─ Local logs (7 giorni) │  
│ ├─ GPS info (only when stationary) │  
│ └─ Single user only │  
│ │  
│ 💎 PRO (€2.99/mese) │  
│ ├─ Everything in FREE │  
│ ├─ Real-time GPS tracking │  
│ ├─ Share with 5 family members │  
│ ├─ Geofence alerts │  
│ ├─ 90-day history │  
│ ├─ Priority support │  
│ └─ Integrazione HomeKit/Alexa │  
│ │  
│ 🚀 ENTERPRISE (Custom) │  
│ ├─ Everything in PRO │  
│ ├─ Unlimited sharing │  
│ ├─ Multi-property dashboard │  
│ ├─ Webhooks for integrations │  
│ ├─ Analytics & reports │  
│ ├─ SLA 99.9% │  
│ └─ Dedicated account manager │  
│ │  
└─────────────────────────────────────────────────┘

**ROADMAP TECNICA (18 MESI)**

**FASE 1: MVP Geo-Basico (Mesi 1-3)**

**Gennaio-Marzo 2026**

HARDWARE:  
├─ Integrazione u-blox NEO-M9N  
├─ Accelerometro BMI160  
├─ LTE-M come fallback  
└─ Batteria 5000mAh + solar 5W

FIRMWARE:  
├─ GPS on-demand activation  
├─ Motion-triggered positioning  
├─ Cloud sync ogni 30min  
└─ Low-power state management

BACKEND:  
├─ Location microservice (PostgreSQL + TimescaleDB)  
├─ Sharing logic (invite tokens)  
├─ Basic geofence (center + radius)  
└─ Webhook API per 3rd parties

APP:  
├─ Mappa con cassapanca  
├─ Historia tracciamento 7gg  
├─ Share interface (email invite)  
└─ Geofence alerts (pushnotif)

COST: €15k dev + €8k hardware prototype  
DELIVERABLE: Closed beta con 50 tester

**FASE 2: Logistica & Analytics (Mesi 4-9)**

**Aprile-Settembre 2026**

HARDWARE:  
├─ Fotocamera IP65 (opzionale)  
├─ Sensore PIR  
├─ Migrazione to production batch

FIRMWARE:  
├─ Video capture on unlock  
├─ PIR triggers instant GPS  
└─ OTA updates

BACKEND:  
├─ Advanced geofence (polygon, building)  
├─ Analytics dashboard (heatmap, ETA)  
├─ Logistics API (corrieri)  
├─ Multi-property SaaS  
├─ Webhooks per integrazioni

APP:  
├─ Mappa real-time per corrieri  
├─ Analytics consumer dashboard  
├─ Social features (community)  
└─ Gamification (badges, rewards)

INTEGRATIONS:  
├─ Google Maps API  
├─ Twilio (SMS alerts)  
├─ Stripe (payment subscriptions)  
└─ Shopify app store

COST: €45k dev  
DELIVERABLE: Open beta, first enterprise pilots

**FASE 3: Smart Communities & Scale (Mesi 10-18)**

**Ottobre 2026 - Giugno 2027**

BACKEND:  
├─ Community network protocol  
├─ Incentive system (smart contract lite)  
├─ DAO-style voting per community  
├─ Advanced ML for routing optimization

APP:  
├─ Community map interface  
├─ Neighbor matching algorithm  
├─ Reputation system  
├─ Crypto-rewards (blockchain optional)

ENTERPRISE:  
├─ Multi-tenant admin panel  
├─ Insurance data partnerships  
├─ Fleet management (pro)

COST: €80k dev + €30k marketing  
DELIVERABLE: Full product launch, enterprise deals

**RISCHI E MITIGAZIONI**

**Rischio 1: Consumo Batteria (GPS è Power-Hungry)**

**Problema**: GPS sempre attivo = batteria in 20 giorni

**Mitigazioni**:

1.  ✅ **Motion-triggered** (accelerometro wake) = 90% riduzione consumo

2.  ✅ **Solar panel obbligatorio** per outdoor permanente

3.  ✅ **LTE-M fallback** (più efficiente di GPS per urban)

4.  ✅ **User-configurable interval** (ogni 30min vs ogni 1h vs
    on-demand)

**Rischio 2: Privacy e GDPR**

**Problema**: Tracciamento locazione = dati sensibili (art. 9 GDPR)

**Mitigazioni**:

1.  ✅ **Consent esplicito** al primo setup

2.  ✅ **Data minimization**: coordinate stese ogni 30min non 24/7

3.  ✅ **Right to deletion**: utente può cancellare cronologia geo

4.  ✅ **Encrypted transport**: HTTPS + TLS 1.3

5.  ✅ **DPA** con cloud provider (AWS/Azure/DigitalOcean)

6.  ✅ **Privacy policy traducibile**: IT/EN minimo

**Rischio 3: Spoofing/Jamming GPS**

**Problema**: Hacker finge falsa posizione per rubare cassapanca

**Mitigazioni**:

1.  ✅ **Dual-constellation** (GPS + Galileo + GLONASS) = harder to
    spoof

2.  ✅ **Signal strength check**: ignora segnali deboli

3.  ✅ **Motion anomaly detection**: se balza 1000km istantaneamente =
    reject

4.  ✅ **Dead reckoning**: se perde GPS, continua dead reckon + alert

5.  ✅ **Encrypted firmware**: codice non reversibile

**Rischio 4: Latenza Rete (GPS non arriva al cloud)**

**Problema**: LTE-M offline = dati persi

**Mitigazioni**:

1.  ✅ **Local storage** su device (SSD 32GB interno) = buffer 6 mesi

2.  ✅ **Eventual consistency**: sync quando torna online

3.  ✅ **WiFi fallback**: se home WiFi disponibile

4.  ✅ **LoRaWAN network** (range \>10km, basso consumo): per aree
    rurali

**Rischio 5: Geofence False Alarms**

**Problema**: Vento sposta leggermente cassapanca, trigger 100 alert

**Mitigazioni**:

1.  ✅ **Hysteresis**: alert solo se esce geofence \>2 minuti (non noise
    momentaneo)

2.  ✅ **Accuracy filter**: ignora se accuracy GPS \>10m (inaffidabile)

3.  ✅ **User-configurable sensitivity**: slider tra "relax" e
    "paranoid"

**COMPETITIVE POSITIONING**

**Vs Smart Lock Tradizionali (Ultraloq, Level, August)**

|                       |             |                  |
|-----------------------|-------------|------------------|
| Aspetto               | Traditional | Smart Locker Geo |
| Geolocalizzazione     | ❌ No       | ✅ Yes           |
| Condivisione family   | 🟡 Limited  | ✅ Full          |
| Tracking tempo reale  | ❌ No       | ✅ Yes           |
| Multi-property        | ❌ No       | ✅ Yes           |
| Logistics integration | ❌ No       | ✅ Yes           |
| Prezzo                | €200-300    | €449-599         |

**Vs Amazon Key (Delivery Box)**

|                   |                        |                     |
|-------------------|------------------------|---------------------|
| Aspetto           | Amazon Key             | Smart Locker Geo    |
| Geolocalizzazione | ❌ No (fixed location) | ✅ Yes              |
| Proprietà         | Amazon (affitto)       | ✅ Your own         |
| Multi-corriere    | ❌ Amazon only         | ✅ All couriers     |
| Community sharing | ❌ No                  | ✅ Yes              |
| Privacy           | Bassa (Amazon vede)    | ✅ High (encrypted) |

**CALCOLO ROI PER UTENTE FINALE**

**Scenario: Famiglia con 3 Consegne/Settimana**

COSTI ATTUALI (no cassapanca):  
├─ Tempo assenza da casa: 4h/sett × €20/ora opport. = €80/sett  
├─ Redelivery fallite: 0.5/sett × €10 = €5/sett  
├─ Benzina ritiro pacco ufficio postale: €2/sett  
└─ TOTALE: €87/sett = €4.524/anno

COSTI CON CASSAPANCA GEO:  
├─ Hardware: €599 (one-time, ammortizzato 3 anni = €200/anno)  
├─ App Premium: €2.99/mese = €36/anno  
├─ Servizi cloud: €0 (incluso)  
└─ TOTALE: €236/anno

RISPARMIO NETTO: €4.288/anno (94% savings!)  
ROI: 18 mesi

**CONCLUSIONE E NEXT STEPS**

**Amplificazione TAM**

L'aggiunta di **geolocalizzazione + condivisione** trasforma il prodotto
da **smart storage device** (€80M TAM) a **distributed logistics
network** (€700M+ TAM).

**Differenziazione Competitiva**

1.  **Solo prodotto**: Cassapanca smart (vs Amazon Key, Ultraloq
    retrofit)

2.  **Con geo**: Rete di cassapanche tracciabili + community-driven
    logistics

**Go-to-Market Phases**

**Fase 1 (Q1 2026)**: B2C premium (famiglia) con app geo  
**Fase 2 (Q2-Q3 2026)**: B2B logistics (corrieri) con dashboard  
**Fase 3 (Q4 2026)**: Smart communities (quartieri bologna, milano)

**KPI Critici**

- **DAU** (Daily Active Users): Target 10k by EOY 2026

- **Locations tracked**: Target 50k cassapanche by EOY 2026

- **Delivery trackings**: Target 1M/mese by Q4 2026

- **CAC** (Customer Acquisition Cost): €25 B2C, €2k B2B

- **LTV** (Lifetime Value): €180 B2C (€3/mese × 60 mesi), €30k B2B

**Finanziamenti Sbloccabili (Aggiornato)**

Con prodotto geo-enabled, TAM espanso:

- **Smart & Start Italia**: €1.5M+ (progetto più ambizioso)

- **Bando ER**: €300-400k (logistica è priority)

- **EIC Accelerator**: €2M+ (deep tech + logistics EU)

- **Venture Capital**: €3-5M (logistica è hot topic)

**Documento compilato**: Dicembre 2025  
**Validità**: 2025-2027  
**Prossimo review**: Marzo 2026 (post-MVP geo)
