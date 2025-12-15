# Structure du Projet Sunshine Agency

## Vue d'ensemble

Ce projet est une application immobilière complète avec un front-office public et un back-office d'administration, utilisant React avec Redux pour la gestion d'état.

## Structure des dossiers

```
sun/
├── backend/                    # API PHP (Laragon/XAMPP)
│   ├── AgentAPI/
│   ├── AppointmentAPI/
│   ├── ClientAPI/
│   ├── DashboardAPI/
│   ├── LoginRegisterAPI/
│   ├── MessageAPI/
│   └── PropertyAPI/
│
├── public/                     # Fichiers statiques
│   └── index.html
│
└── src/                        # Code source React
    ├── Components/             # Composants réutilisables
    │   ├── AgentCard.js
    │   ├── AgentManagement.js
    │   ├── AppointmentManagement.js
    │   ├── ClientManagement.js
    │   ├── Footer.js
    │   ├── Header.js
    │   ├── LoadingSkeleton.js
    │   ├── Messaging.js
    │   ├── NoData.js
    │   ├── PropertyCard.js
    │   └── PropertyManagement.js
    │
    ├── config/                 # Configuration
    │   └── api.js              # URLs API
    │
    ├── Pages/                  # Pages principales
    │   ├── AdminDashboard.js   # Dashboard admin
    │   ├── ClientDashboard.js  # Dashboard client
    │   ├── HomePage.js         # Page d'accueil (router)
    │   ├── LoginPage.js        # Connexion
    │   ├── RegisterPage.js     # Inscription
    │   └── HomePage/           # Vues du front-office
    │       └── views/
    │           ├── AgentsView.js
    │           ├── ContactView.js
    │           ├── HomeView.js
    │           ├── PropertiesView.js
    │           └── PropertyDetailView.js
    │
    ├── services/               # Services API (ancien, à migrer vers Redux)
    │   ├── agentService.js
    │   ├── dashboardService.js
    │   └── propertyService.js
    │
    ├── store/                  # Redux Store
    │   ├── index.js            # Configuration du store
    │   ├── hooks.js            # Hooks typés
    │   ├── README.md           # Documentation Redux
    │   └── slices/             # Slices Redux
    │       ├── agentsSlice.js
    │       ├── appointmentsSlice.js
    │       ├── authSlice.js
    │       ├── clientsSlice.js
    │       ├── dashboardSlice.js
    │       ├── messagesSlice.js
    │       └── propertiesSlice.js
    │
    ├── style/                  # Fichiers CSS
    │   ├── AgentCard.css
    │   ├── AgentManagement.css
    │   ├── AppointmentManagement.css
    │   ├── Auth.css
    │   ├── Buttons.css
    │   ├── ClientDashboard.css
    │   ├── ClientManagement.css
    │   ├── Dashboard.css
    │   ├── Footer.css
    │   ├── Header.css
    │   ├── HomePage.css
    │   ├── LoadingSkeleton.css
    │   ├── Messaging.css
    │   ├── NoData.css
    │   ├── PropertyCard.css
    │   └── PropertyManagement.css
    │
    ├── utils/                  # Utilitaires
    │   └── formatPrice.js
    │
    ├── App.js                  # Composant racine + Router
    ├── firebase.js             # Configuration Firebase
    └── index.js                # Point d'entrée + Redux Provider
```

## Architecture

### Frontend (React + Redux)

- **React Router** : Navigation entre les pages
- **Redux Toolkit** : Gestion d'état globale
- **Firebase** : Authentification Google (optionnel)
- **CSS Modules** : Styles par composant

### Backend (PHP)

- **API REST** : Endpoints PHP pour chaque module
- **MySQL** : Base de données
- **Laragon/XAMPP** : Serveur local

## Flux de données

### Avant Redux (ancien)
```
Component → useState → fetch API → setState
```

### Après Redux (nouveau)
```
Component → dispatch(action) → Redux Thunk → API → Redux Store → Component re-render
```

## Migration vers Redux

### Composants migrés
- ✅ `LoginPage.js` - Utilise `authSlice`

### Composants à migrer
- ⏳ `HomePage.js` - Utiliser `propertiesSlice` et `agentsSlice`
- ⏳ `AdminDashboard.js` - Utiliser tous les slices
- ⏳ `ClientDashboard.js` - Utiliser `appointmentsSlice` et `messagesSlice`
- ⏳ `PropertyManagement.js` - Utiliser `propertiesSlice`
- ⏳ `AgentManagement.js` - Utiliser `agentsSlice`
- ⏳ `ClientManagement.js` - Utiliser `clientsSlice`
- ⏳ `AppointmentManagement.js` - Utiliser `appointmentsSlice`
- ⏳ `Messaging.js` - Utiliser `messagesSlice`

## Bonnes pratiques

1. **Utiliser Redux pour l'état global** : Données partagées entre composants
2. **Garder useState pour l'état local** : UI state, formulaires temporaires
3. **Centraliser les appels API** : Dans les thunks Redux
4. **Sélecteurs optimisés** : Utiliser `useAppSelector` avec des sélecteurs spécifiques
5. **Actions typées** : Utiliser les actions créées par Redux Toolkit

## Commandes utiles

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start

# Build de production
npm run build

# Tests
npm test
```

## Configuration

### Variables d'environnement
- `BASE_URL` : URL de l'API backend (défaut: `http://localhost/sun/backend`)

### Redux DevTools
Le store Redux est configuré pour fonctionner avec Redux DevTools. Installez l'extension navigateur pour déboguer l'état.

## Prochaines améliorations

1. ✅ Redux Store implémenté
2. ⏳ Migration complète des composants
3. ⏳ Ajout de sélecteurs optimisés (memoization)
4. ⏳ Gestion d'erreurs centralisée
5. ⏳ Cache et invalidation intelligente
6. ⏳ Tests unitaires pour les slices

