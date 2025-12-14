# Analisi Progettuale Hardware: Suezo Eye v1.0

> **Stato Documento:** Draft / Specifica Iniziale
> **Obiettivo:** Definizione architettura hardware per prototipo funzionale ed economico (MVP).
> **Focus:** Ottimizzazione costi tramite componenti COTS (Commercial Off-The-Shelf) e Design for Additive Manufacturing (DFAM).

---

## 1. Strategia di Design & Ottimizzazione Costi

L'obiettivo è realizzare un prodotto dall'aspetto "Enterprise" (alluminio, display nitidi) mantenendo i costi da prototipo.

### 1.1 Filosofia "Consumer Reuse"
Invece di cercare componenti industriali custom (costosi), sfrutteremo componenti derivati da mercati ad altissimo volume:
*   **Smart Home Panels:** Il mercato dei termostati smart/pannelli di controllo (es. Tuya, Sonoff) ha standardizzato i display quadrati da 3.5" e 4". Sono più economici dei display industriali puri.
*   **Action Cams / Drones:** L'elettronica per l'AI Vision (SoC, sensori ottici) è estremamente economica grazie al mercato dei droni entry-level.
*   **Automotive Aftermarket:** Meccanismi di chiusura e attuatori 12V robusti ed economici.

### 1.2 Struttura Ibrida (Hybrid Frame)
Una cassa 80x80x80cm stampata interamente in 3D è infattibile (troppo tempo, costi alti, scarsa rigidità).
*   **Struttura Portante:** Profili in alluminio estruso (Standard V-Slot 2020 o 2040). Economici, modulari, tagliabili su misura.
*   **Pannellatura:** Dibond (pannello composito Alluminio-Polietilene-Alluminio) da 3mm. Tagliabile laser/CNC, finitura superficiale "alluminio spazzolato" identica ai render, costo frazione dell'alluminio pieno.
*   **Giunzioni & Dettagli Estetici (Eyes):** Stampa 3D (PETG o ASA) per le parti complesse, cover arrotondate e alloggiamenti elettronica.

---

## 2. Componente Chiave: Il "Suezo Eye" (Display)

### Requisito Utente: Display Quadrato ~80x80mm
*   **Ottimizzazione di Mercato:** I display quadrati (1:1 ratio) non sono standard per tablet/telefoni. Tuttavia, sono lo standard per gli **Smart Knob** e **Smart Control Panels**.

### Opzioni Selezionate:

#### Opzione A (Miglior Rapporto Q/P - Consigliata): **Display TFT 4.0" Quadrato (720x720)**
È la dimensione standard per i gateway smart home di fascia alta.
*   **Dimensione Attiva:** ~72x72mm (molto vicino agli 80mm richiesti, con la cornice nera si arriva a 80).
*   **Interfaccia:** MIPI DSI (Richiede una board host potente) o RGB/SPI (gestibile da MCU).
*   **Costo:** ~25-35€ (pannello + driver).
*   **Consiglio Prototipo:** Utilizzare un modulo **"Round/Square LCD Module with Touch"** basato su ESP32-S3 già integrato (es. Waveshare, LilyGO).
    *   *Vantaggio:* Hai già MCU + Display + Driver + Touch in un pacchetto unico da montare nel "case occhio".

#### Opzione B (Low Cost): **Display TFT 3.5" (320x480 o 480x320) Mascherato**
Usare un display rettangolare standard (diffusissimo per Raspberry Pi), montato verticalmente e "mascherato" dal case stampato in 3D per mostrare solo una porzione quadrata.
*   **Costo:** ~10-15€.
*   **Svantaggio:** Luminosità e angolo di visione inferiori (spesso TN, non IPS). Spreco di pixel.

---

## 3. Architettura Elettronica (The "Brains")

Per un prototipo funzionale che debba gestire AI (Face Recognition) e UI fluida, Arduino non basta.

### 3.1 Core Processing (AI + Logic)
Consiglio un'architettura **Dual-Core**:
1.  **AI/Vision Module:** **Espressif ESP32-S3** (versione con 8MB PSRAM).
    *   Supporta AI hardware acceleration (ESP-DL) per face detection semplice.
    *   Gestisce il display direttamente.
    *   WiFi/BLE nativi per app control.
    *   **Costo:** ~5-8€ (DevKit).
2.  **Alternativa High-Performance:** **Rockchip RV1103/RV1106** (es. Luckfox Pico).
    *   Linux embedded pico-size. NPU dedicata per AI seria (Object detection, non solo face).
    *   **Costo:** ~10-15€. Consigliato se "Suezo" deve riconoscere oggetti complessi.

### 3.2 Connectivity & Location
*   **Modulo GNSS (GPS):** BEITIAN BN-880 o u-blox NEO-6M (economici, efficaci).
*   **Connettività LTE-M/NB-IoT:** SIM7000G Module. Fondamentale per il tracking "standalone" senza WiFi.

### 3.3 Power Management
*   **Batteria:** Pacco Li-Ion 21700 (più densità delle 18650) 3S2P (12V nominali) per alimentare motori lock e display.
*   **Solar Charging:** Modulo MPPT economico (CN3791) collegato a pannello semiflessibile sul coperchio.

---

## 4. Bill of Materials (BOM) Preliminare - Prototipo v1

| Categoria | Componente | Specifiche / Note | Costo Stima (€) |
| :--- | :--- | :--- | :--- |
| **Struttura** | Profili V-Slot 2020 | 12x 80cm (tagliati a misura) + Corner Brackets | 45.00 |
| **Pannelli** | Lastra Dibond (Alluminio Comp.) | 3mm Spessore, Finitura Spazzolata (1mq) | 35.00 |
| **Stampa 3D** | Filamento PETG/ASA | Grigio "Space Grey" / Nero Opaco (2kg) | 40.00 |
| **Display** | Waveshare 4.0" Touch | O modulo ESP32-S3 con Display 4" Integrato | 45.00 |
| **Visione** | Modulo Camera OV2640/OV5640 | Grandangolo 160° (Fisheye) | 8.00 |
| **Compute** | ESP32-S3 DevKit | Se non integrato nel display | 8.00 |
| **Lock** | Elettroserratura 12V Solenoide | Tipo "Cabinet Lock" robusto | 12.00 |
| **Power** | 4x Celle Li-Ion 21700 + BMS | ~10.000mAh tot | 25.00 |
| **IoT** | Modulo SIM7000G | LTE/GPS Combo | 20.00 |
| **Varie** | Viteria, Cablaggio, Colle | Inserti filettati M3/M4/M5 (Fondamentali!) | 15.00 |
| **TOTALE** | | **Stima Materiali Vivi** | **~253.00 €** |

---

## 5. Analisi Meccanica & Stampa 3D (DFAM)

### 5.1 Il Case "Suezo Eye" (Display Module)
Da progettare come un componente modulare estraibile.
*   **Materiale:** ASA (resistente UV per esterno) o PETG.
*   **Finitura:** Stampa con setting "Fuzzy Skin" (Cura Slicer) o verniciatura post-processing per matchare la texture alluminio sabbiato.
*   **Design:**
    *   *Front Bezel:* Sottile, copre i bordi del display.
    *   *Main Body:* Cubo smussato (chamfered edges) che ospita PCB display e Camera.
    *   *Mounting:* Si aggancia ai profili 2020 interni tramite dadi a T (T-Nuts).

### 5.2 Il Case "Lock Eye" (Meccanismo)
*   **Estetica:** Deve sembrare un occhio meccanico (come da render).
*   **Funzione:** Ospita il servomotore o il solenoide di sblocco e il lettore NFC circolare.
*   **Componenti:**
    *   *Anello LED:* NeoPixel Ring 16 o 24 LED per feedback di stato (Rosso/Verde/Pulse).
    *   *Copertura:* Plexiglass fumè tagliato laser o stampato in resina trasparente.

### 5.3 Angolari "Armor"
Per dare il look "ChestUp" robusto senza lavorare blocchi di metallo:
*   Stampare angolari "Low Poly" o smussati che coprono le giunzioni dei profili 2020.
*   Colore a contrasto (es. Grigio scuro su pannelli alluminio chiari) o tono su tono.

---

## 6. Next Steps Operativi

1.  **CAD Design (Fusion 360 / SolidWorks):**
    *   Disegnare lo scheletro ("Skeleton Sketch") del cubo 80x80x80.
    *   Modellare l'housing del display 4" (sulla base del datasheet Waveshare/ESP32-Display).
    *   Progettare gli angolari per nascondere i tagli del Dibond.

2.  **Sourcing Display:**
    *   Acquistare il modulo **ESP32-S3 con Display 4.0" (es. serie "Cheap Yellow Display" o varianti high-end)**. Riduce drasticamente il cablaggio e la complessità software.

3.  **Proof of Concept (PoC) "The Eye":**
    *   Stampare solo l'housing dell'occhio.
    *   Montare display e camera.
    *   Validare l'estetica e le proporzioni prima di costruire l'intera cassa.
