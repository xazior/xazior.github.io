Ecco il Piano d'Azione tattico per **Abu (CTO & Lead Tech)** per i
prossimi 30-45 giorni.

Il focus è triplo: **Architettura** (scegliere i pezzi
giusti), **Integrazione** (far parlare Hardware e Software)
e **Leadership Tecnica** (gestire Vincenzo e Digio + interfaccia con
Nicola/Luca).

------------------------------------------------------------------------

**📅 SETTIMANA 1: Architecture & Safety First**

*Obiettivo: Definire "Il Cervello" e lo Schema Elettrico prima di
comprare o saldare nulla.*

| **Azione Prioritaria** | **Dettagli Operativi** | **Interazioni Chiave** | **Output Atteso** |
|----|----|----|----|
| **1. Tech Stack Decision** | Scegliere la MCU definitiva (es. ESP32 per costi/WiFi o Raspberry per potenza/Linux). Definire protocollo (MQTT o HTTP?). | **Vincenzo** (Backend compatibility) \<br\> **Enrico** (Budget) | Documento "System Architecture V1" approvato. |
| **2. Briefing con Nicola** | Consegnare a Nicola la lista dei carichi (10 serrature, LED, CPU). Chiedere lo schema per alimentazione e protezioni. | **Nicola** (Advisor Elettrico) | Schema unifilare preliminare (Input per Matteo). |
| **3. Setup Dev Environment** | Creare la Repository (GitHub/GitLab). Impostare le regole di Branch e Merge. Assegnare i primi ticket a Vincenzo e Digio. | **Vincenzo & Digio** | Ambiente di sviluppo pronto. Nessuno scrive codice a caso. |

------------------------------------------------------------------------

**📅 SETTIMANA 2-3: The "Breadboard" Phase**

*Obiettivo: Proof of Life. Far scattare una serratura sul tavolo con un
comando inviato dal PC/Telefono.*

| **Azione Prioritaria** | **Dettagli Operativi** | **Interazioni Chiave** | **Output Atteso** |
|----|----|----|----|
| **1. Firmware Core** | Scrivere il firmware base per il microcontrollore: connessione WiFi, gestione stati (Aperto/Chiuso), driver serrature. | **Nessuna** (Deep Work) | Firmware V0.1 funzionante su breadboard. |
| **2. Gestione Vincenzo (Security)** | Revisionare il codice Backend/API scritto da Vincenzo. Assicurarsi che l'autenticazione sia sicura prima di integrarla. | **Vincenzo** (Code Review) | API funzionanti e sicure per il comando "Open". |
| **3. BOM Elettronica Definitiva** | Chiudere la lista componenti esatta (codici precisi da DigiKey/Mouser) e passarla a Enrico per l'acquisto. | **Enrico** (Acquisti) \<br\> **Nicola** (Check finale) | Ordine componenti partiti. |

------------------------------------------------------------------------

**📅 SETTIMANA 4+: Integration & Stress Test**

*Obiettivo: Spostare tutto dentro la scatola di metallo e vedere se
regge.*

| **Azione Prioritaria** | **Dettagli Operativi** | **Interazioni Chiave** | **Output Atteso** |
|----|----|----|----|
| **1. Cablaggio Prototipo** | Assemblare fisicamente l'elettronica nel primo chassis. Seguire rigorosamente lo schema di Nicola. Gestire il cable management. | **Team Assemblaggio** \<br\> **Matteo** (Check spazi) | Il "Cervello" è montato nel locker. |
| **2. End-to-End Test** | Testare il flusso completo: Utente preme bottone su App (Digio) -\> Server valida (Vincenzo) -\> Locker apre (Abu). | **Digio & Vincenzo** | Video del primo sblocco remoto riuscito. |
| **3. Stress Test con Luca** | Consegnare il prototipo a Luca. Simulare blackout (test UPS), riavvii continui e uso intensivo. Analizzare i log di errore. | **Luca** (Advisor QA) | Report di stabilità (e lista bug da fixare). |

------------------------------------------------------------------------
