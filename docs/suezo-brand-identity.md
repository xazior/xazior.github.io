# Suezo - Brand Identity & Character Design

## 🏢 L'Azienda

### Nome
**ChestUp**

### Logo
Stile **Pokéball quadrata** - fusione tra cassapanca e occhio:
- Forma base: Rettangolo arrotondato (la cassapanca)
- Divisione orizzontale: Coperchio sopra, corpo sotto
- Elemento centrale: Occhio circolare (Suezo)
- Palette: Gradiente viola→rosa (#8b5cf6 → #ec4899)
- Sfondo: Nero/grigio scuro

```
    ┌──────────────────────┐
    │     COPERCHIO        │  ← Grigio scuro
    ├──────────────────────┤  ← Linea gradiente
    │                      │
    │        ◉            │  ← Occhio (gradiente)
    │                      │
    └──────────────────────┘  ← Corpo cassapanca
```

---

## 🎭 Il Personaggio

### Nome
**Suezo** (pronuncia: /ˈswezo/)
- Suona amichevole e memorabile
- Ha un tono giapponese/internazionale
- Facile da ricordare e pronunciare

### Personalità
- **Fedele**: Come un cane da guardia digitale
- **Silenzioso**: Lavora in background senza disturbare
- **Sveglio**: Sempre attento, mai distratto
- **Rassicurante**: Ti fa sentire al sicuro

### Voice & Tone (per UI/Notifiche)
```
✓ "Pacco in arrivo. Mi preparo."
✓ "Qualcuno si avvicina. Lo conosco."
✗ "ATTENZIONE! MOVIMENTO RILEVATO!" (troppo aggressivo)
✗ "Il tuo pacco è qui 📦🎉" (troppo infantile)
```

---

## 👁️ Visual Design

### Concetto Base
Suezo è una **cassapanca minimalista con due occhi luminosi**.
- Forma: Rettangolo arrotondato (la cassapanca)
- Caratteristica distintiva: Due occhi LED viola che brillano nell'oscurità
- Personalità: Si sente la presenza senza essere invadente

### Stile Artistico
```
Minimalismo geometrico
├── Linee pulite, niente dettagli inutili
├── Palette ristretta (nero, grigio, viola)
├── Silhouette riconoscibile anche in miniatura
└── Animazioni fluide e naturali
```

### Varianti del Character

#### 1. Suezo Default (Idle)
- Corpo rettangolare scuro con angoli arrotondati
- Due occhi viola che brillano dolcemente
- Leggero movimento "respirazione" (su/giù lento)
- Coperchio leggermente sollevato come sopracciglio

#### 2. Suezo Attento (Alert)
- Occhi più grandi e luminosi
- Movimento rapido di scansione (sinistra-destra)
- Glow viola più intenso

#### 3. Suezo Felice (Package Received)
- Occhi "chiusi a mezzaluna" (sorriso)
- Leggero sobbalzo di contentezza
- Effetto particelle viola attorno

#### 4. Suezo Protettivo (Security Mode)
- Un solo occhio visibile (come vigilante)
- Glow rosso invece di viola
- Postura "abbassata" più minacciosa

#### 5. Suezo Sleep (Power Save)
- Occhi spenti / opachi
- Leggero "russare" grafico (Zzz)
- Movimento quasi impercettibile

---

## 🎨 Palette Colori

### Primaria
| Nome | HEX | Uso |
|------|-----|-----|
| Nero Profondo | `#000000` | Background |
| Grigio Carbone | `#1a1a1a` | Corpo Suezo |
| Viola Elettrico | `#8b5cf6` | Occhi, accenti |
| Rosa Energia | `#ec4899` | Gradient secondario |

### Stati
| Stato | Colore Occhi |
|-------|--------------|
| Normale | Viola `#8b5cf6` |
| Allerta | Ambra `#f59e0b` |
| Pericolo | Rosso `#ef4444` |
| Successo | Verde `#10b981` |

---

## 📦 Merchandise Concepts

### Tier 1: Accessori Digitali
- **Sticker Pack** (iMessage, WhatsApp, Telegram)
  - 20+ pose di Suezo
  - Animati (GIF)
  - Gratuiti per clienti SuperNØva

- **Wallpapers**
  - Desktop (4K)
  - Mobile (lockscreen + homescreen)
  - Apple Watch faces

- **Widget iOS/Android**
  - Suezo che mostra stato cassapanca
  - Cambia espressione in base agli eventi

### Tier 2: Merchandise Fisico Base
- **Sticker Vinile** (pack da 5)
  - €4.99
  - Resistenti acqua
  - Suezo in varie pose

- **T-Shirt**
  - €29.99
  - Nero con Suezo piccolo sul petto
  - 100% cotone organico

- **Tote Bag**
  - €19.99
  - Canvas nero
  - Suezo grande stampato

### Tier 3: Merchandise Premium
- **Peluche Suezo**
  - €49.99
  - 25cm di altezza
  - Occhi LED funzionanti (USB ricaricabile)
  - Edizione numerata

- **Scultura da Scrivania**
  - €79.99
  - Resina verniciata
  - 15cm
  - Base con luce LED viola

- **Art Print Firmata**
  - €129.99
  - Edizione limitata 100 pezzi
  - A2 su carta d'artista
  - Firmata dal designer

### Tier 4: Collector's Edition
- **Suezo Pro Companion**
  - €199.99
  - Versione premium del peluche
  - Connesso via Bluetooth
  - Si illumina con gli alert reali della cassapanca
  - Packaging da collezione

---

## 🖥️ Presenza nell'App

### App Icon
- Sfondo nero
- Solo gli occhi di Suezo (viola)
- Riconoscibile a qualsiasi dimensione

### Splash Screen
- Suezo al centro che "si sveglia"
- Occhi che si accendono gradualmente
- Transizione fluida verso la home

### Empty States
Quando non ci sono dati:
```
[Suezo che guarda in giro]
"Nessun dispositivo ancora.
 Aggiungi la tua prima cassapanca."
```

### Loading States
Suezo che "pensa":
- Occhi che pulsano
- Leggero movimento laterale

### Notifiche
Avatar di Suezo accanto a ogni notifica:
- Felice → consegna ricevuta
- Attento → movimento rilevato
- Neutro → info generica

---

## 📱 Animazioni Chiave

### 1. Blink (Battito)
```
Durata: 150ms
Timing: ease-in-out
Frequenza: ogni 4-6 secondi (random)
```

### 2. Float (Respiro)
```
Durata: 4s
Movimento: translateY(-10px)
Timing: ease-in-out
Loop: infinito
```

### 3. Wake Up
```
Sequenza:
1. Occhi spenti (0ms)
2. Primo occhio si accende (200ms)
3. Secondo occhio (400ms)
4. Glow pieno (600ms)
```

### 4. Alert Reaction
```
Sequenza:
1. Occhi diventano grandi (100ms)
2. Colore cambia (150ms)
3. Leggero "sobbalzo" (200ms)
4. Ritorno normale (500ms)
```

---

## 🎬 Storyboard Spot Pubblicitario (30s)

```
[0-5s]
Scena: Porta di casa. È notte.
Audio: Silenzio, solo grilli.
Visual: Si vede solo il glow viola di Suezo nel buio.

[5-10s]
Scena: Furgone delle consegne si avvicina.
Audio: Motore in lontananza.
Visual: Gli occhi di Suezo si illuminano di più.

[10-15s]
Scena: Corriere deposita pacco.
Audio: "Grazie!" sussurrato.
Visual: Suezo fa un piccolo "cenno" con il coperchio.

[15-20s]
Scena: Notifica su telefono.
Audio: Suono discreto.
Visual: "Pacco ricevuto. Tutto al sicuro. - Suezo"

[20-25s]
Scena: Proprietario (mattina dopo) apre cassapanca.
Visual: Suezo fa gli "occhi felici".
Audio: Suono soddisfacente di apertura.

[25-30s]
Scena: Logo SuperNØva.
Tagline: "Suezo. Il custode che non dorme mai."
```

---

## 🔮 Evoluzione Futura

### Suezo 2.0 (Concept)
- Corpo più "organico" (meno squadrato)
- Movimenti più espressivi
- Bocca stilizzata per più espressioni

### Suezo Family
- **Suezo Mini**: Per cassapanche piccole
- **Suezo Pro**: Versione business (più seria)
- **Suezo Home**: Per uso domestico (più amichevole)

### Suezo Universe
Personaggi secondari:
- **Bolt**: La batteria (amico di Suezo)
- **Signal**: L'antenna (il comunicatore)
- **Keyla**: La serratura (la guardiana)

---

*Documento creato per SuperNØva Smart Locker - Dicembre 2024*
