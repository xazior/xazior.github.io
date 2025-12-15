# 🚀 Setup Firebase - Piattaforma Votazione Nomi

## Configurazione Firebase Step-by-Step

### 1. Creare Progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com)
2. Clicca "Add Project" 
3. Nome progetto: `voting-platform` (o quello che preferisci)
4. Accetta i termini e clicca "Create project"
5. Attendi la creazione (30-60 secondi)

### 2. Configurare Authentication

1. Nel dashboard Firebase, vai su **Authentication**
2. Clicca **"Get started"**
3. Vai su tab **"Sign-in method"**
4. Abilita **"Email/Password"**
5. Salva le modifiche

### 3. Creare Utenti di Test

1. Vai su tab **"Users"** in Authentication
2. Clicca **"Add user"** per ogni utente:

**Utente 1:**
- Email: `leo@voting.local`
- Password: `tvrvlli2025`

**Utente 2:**
- Email: `enri@voting.local` 
- Password: `tvrvlli2025`

**Utente 3:**
- Email: `fane@voting.local`
- Password: `tvrvlli2025`

**Utente 4:**
- Email: `digio@voting.local`
- Password: `tvrvlli2025`

**Utente 5:**
- Email: `vince@voting.local`
- Password: `tvrvlli2025`

**Utente 6:**
- Email: `abu@voting.local`
- Password: `tvrvlli2025`

### 4. Configurare Firestore Database

1. Vai su **"Firestore Database"** nel menu a sinistra
2. Clicca **"Create database"**
3. Seleziona **"Start in test mode"** (per development)
4. Cloud location: scegli `europe-west` (o il più vicino)
5. Clicca **"Done"**

### 5. Configurare Security Rules

1. Nella pagina Firestore, vai su tab **"Rules"**
2. Sostituisci il contenuto con queste regole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write all data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Clicca **"Publish"**

### 6. Ottenere Firebase Config

1. Vai su **"Project Overview"** (icona ⚙️ in alto a sinistra)
2. Clicca **"Project settings"**
3. Scroll down fino a **"Your apps"**
4. Clicca **"Web"** (`</>` icon)
5. Nome app: `voting-platform-web`
6. **NON** spuntare "Set up Firebase Hosting"
7. Clicca **"Register app"**
8. Copia il `firebaseConfig` object

### 7. Aggiornare Frontend

Apri il file `naming-proposals.html` e sostituisci la configurazione Firebase:

```javascript
// TROVA QUESTA SEZIONE:
const firebaseConfig = {
    apiKey: "demo-api-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project-id",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// SOSTITUISCI CON I TUOI DATI REALI:
const firebaseConfig = {
    apiKey: "AIzaSyC-tuoKuQJdCHt8v3N9h8Hh2GKw8p0s2s",
    authDomain: "voting-platform.firebaseapp.com",
    projectId: "voting-platform",
    storageBucket: "voting-platform.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789"
};
```

### 8. (Opzionale) Configurare ImgBB per Immagini

Se vuoi abilitare l'upload di immagini:

1. Vai su [ImgBB](https://api.imgbb.com)
2. Registrati gratis
3. Vai su [API Keys](https://api.imgbb.com/1.0/key)
4. Crea una nuova API key
5. Sostituisci `"demo-key"` nel codice con la tua key reale:

```javascript
const response = await fetch('https://api.imgbb.com/1/upload?key=LA_TUA_API_KEY_QUI', {
    method: 'POST',
    body: formData
});
```

### 9. Test della Configurazione

1. Apri `naming-proposals.html` nel browser
2. Seleziona un utente dal dropdown
3. Inserisci password: `tvrvlli2025`
4. Clicca "Accedi"
5. Dovresti vedere la dashboard della piattaforma di votazione

### 10. Deploy su GitHub Pages

1. Pusha i file su GitHub
2. Vai su Settings > Pages del repository
3. Source: Deploy from a branch
4. Branch: `main` (o `master`)
5. Folder: `/ (root)`
6. Salva e attendi il deploy

## 🔧 Troubleshooting

### Errore: "Permission denied"
- Verifica che le Firestore Rules siano pubblicate
- Controlla che l'utente sia autenticato

### Errore: "Invalid API key"
- Verifica che il `firebaseConfig` sia corretto
- Controlla che la project ID corrisponda

### Login non funziona
- Verifica che i 6 utenti siano stati creati
- Controlla che l'email/password siano corrette

### Proposals non si caricano
- Verifica che Firestore Database sia in modalità test
- Controlla la console browser per errori

## 📊 Firestore Collections Generate

La piattaforma creerà automaticamente queste collections:

- `proposals` - Contiene tutte le proposte di naming
- `votes` - Contiene tutti i voti degli utenti  
- `topChoices` - Contiene le top 3 scelte per ogni utente/categoria

## 🔒 Sicurezza Produzione

Per uso in produzione, aggiorna le Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Proposals: everyone can read, only authenticated can write
    match /proposals/{proposalId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Votes: users can only read/write their own votes
    match /votes/{voteId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Top choices: users can only manage their own
    match /topChoices/{choiceId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## ✅ Checklist Setup

- [ ] Firebase project creato
- [ ] Authentication abilitato con Email/Password
- [ ] 6 utenti creati con credenziali corrette
- [ ] Firestore Database in modalità test
- [ ] Security Rules applicate
- [ ] Firebase config copiato nel frontend
- [ ] Test login funzionante
- [ ] Deploy su GitHub Pages completato

🎉 **La piattaforma di votazione Firebase è pronta per l'uso!**