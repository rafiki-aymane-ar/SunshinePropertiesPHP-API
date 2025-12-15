# 📚 Documentation Complète - Sunshine Agency

## 📖 Vue d'ensemble

Cette documentation fournit une vue complète de l'architecture, de l'organisation et des conventions du projet Sunshine Agency.

## 🗂️ Organisation des fichiers

### Structure complète

```
sun/
├── backend/                    # API PHP Backend
│   ├── AgentAPI/               # Endpoints pour les agents
│   ├── AppointmentAPI/         # Endpoints pour les rendez-vous
│   ├── ClientAPI/              # Endpoints pour les clients
│   ├── DashboardAPI/           # Endpoints pour le dashboard
│   ├── LoginRegisterAPI/       # Authentification
│   ├── MessageAPI/             # Système de messagerie
│   └── PropertyAPI/            # Endpoints pour les propriétés
│
├── public/                     # Fichiers statiques
│   └── index.html              # Point d'entrée HTML
│
└── src/                        # Code source React
    ├── Components/             # Composants réutilisables
    │   ├── AgentCard.js        # Carte d'affichage d'un agent
    │   ├── AgentManagement.js  # Gestion des agents (admin)
    │   ├── AppointmentManagement.js # Gestion des rendez-vous
    │   ├── ClientManagement.js # Gestion des clients
    │   ├── Footer.js           # Pied de page
    │   ├── Header.js           # En-tête du site
    │   ├── LoadingSkeleton.js  # Skeleton loader
    │   ├── Messaging.js        # Composant de messagerie
    │   ├── NoData.js           # Composant "Aucune donnée"
    │   ├── PropertyCard.js     # Carte d'affichage d'une propriété
    │   ├── PropertyManagement.js # Gestion des propriétés
    │   └── ProtectedRoute.js   # Protection des routes
    │
    ├── config/                  # Configuration
    │   └── api.js              # URLs et endpoints API
    │
    ├── Pages/                   # Pages principales
    │   ├── AdminDashboard.js   # Dashboard administrateur
    │   ├── ClientDashboard.js  # Dashboard client
    │   ├── HomePage.js         # Routeur front-office
    │   ├── LoginPage.js        # Page de connexion
    │   ├── RegisterPage.js     # Page d'inscription
    │   └── HomePage/           # Vues du front-office
    │       └── views/
    │           ├── AgentsView.js
    │           ├── ContactView.js
    │           ├── HomeView.js
    │           ├── PropertiesView.js
    │           └── PropertyDetailView.js
    │
    ├── services/               # Services API (ancien, à migrer)
    │   ├── agentService.js
    │   ├── dashboardService.js
    │   └── propertyService.js
    │
    ├── store/                  # Redux Store
    │   ├── index.js           # Configuration du store
    │   ├── hooks.js           # Hooks Redux personnalisés
    │   ├── README.md          # Documentation Redux
    │   └── slices/            # Slices Redux
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
    │   └── formatPrice.js     # Formatage des prix
    │
    ├── App.js                  # Composant racine + Router
    ├── firebase.js            # Configuration Firebase
    ├── index.css              # Styles globaux
    └── index.js               # Point d'entrée React
```

## 📝 Conventions de commentaires

### En-têtes de fichiers

Chaque fichier doit commencer par :

```javascript
/**
 * @fileoverview Description du fichier
 * @module path/to/module
 * @description
 * Description détaillée...
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */
```

### Sections de code

Utiliser des séparateurs pour organiser :

```javascript
// ============================================================================
// IMPORTS
// ============================================================================

// ============================================================================
// CONSTANTES
// ============================================================================

// ========================================================================
// HOOKS
// ========================================================================
```

### Documentation des fonctions

```javascript
/**
 * Description de la fonction
 * 
 * @param {Type} param - Description
 * @returns {Type} Description
 * 
 * @example
 * const result = myFunction('value');
 */
```

## 🔄 Flux de données

### Redux Store Structure

```
store/
├── auth              # État d'authentification
├── properties        # Propriétés immobilières
├── agents            # Agents commerciaux
├── clients           # Clients
├── appointments      # Rendez-vous
├── messages          # Messagerie
└── dashboard         # Dashboard et statistiques
```

### Flux d'authentification

1. **LoginPage** → `loginUser()` action
2. **authSlice** → Stocke token + user dans Redux + localStorage
3. **ProtectedRoute** → Vérifie `isAuthenticated` dans Redux
4. **Redirection** → Selon le rôle (admin/agent → admin-dashboard, client → client-dashboard)

### Flux de données des propriétés

1. **Component** → `dispatch(fetchProperties())`
2. **propertiesSlice** → Appel API
3. **Redux Store** → Mise à jour de l'état
4. **Component** → `useAppSelector` pour lire les données

## 🎯 Rôles et permissions

### Rôles utilisateurs

- **client** : 
  - Accès : Dashboard client, réservation de visites
  - Restrictions : Pas d'accès au back-office

- **agent** :
  - Accès : Dashboard admin (gestion limitée)
  - Restrictions : Peut gérer ses propres rendez-vous et messages

- **admin** :
  - Accès : Dashboard admin complet
  - Permissions : Toutes les opérations CRUD

### Protection des routes

```javascript
// Route client uniquement
<ProtectedRoute allowedRoles={['client']}>
  <ClientDashboard />
</ProtectedRoute>

// Route admin/agent
<ProtectedRoute allowedRoles={['admin', 'agent']}>
  <AdminDashboard />
</ProtectedRoute>
```

## 🔌 API Backend

### Structure des endpoints

Tous les endpoints suivent le pattern :
```
http://localhost/sun/backend/{Module}API/{action}.php
```

### Exemples

- `GET /PropertyAPI/get_properties.php` - Liste des propriétés
- `GET /PropertyAPI/get_property.php?id=1` - Détails d'une propriété
- `POST /LoginRegisterAPI/login.php` - Connexion
- `POST /AppointmentAPI/create_appointment.php` - Créer un rendez-vous

### Format des réponses

```json
{
  "success": true,
  "message": "Message de succès",
  "data": { /* données */ }
}
```

## 🎨 Styles et thème

### Thème sombre

L'application utilise un thème sombre avec :
- Couleur principale : `#00d4aa` (turquoise)
- Fond principal : `#0a0a0a` (noir)
- Fond secondaire : `#111111` (gris foncé)
- Texte : `#ffffff` (blanc)

### Glassmorphism

Certains composants utilisent l'effet glassmorphism :
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

## 📱 Responsive Design

### Breakpoints

- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### Approche Mobile First

Tous les styles commencent par mobile, puis s'adaptent pour desktop :

```css
/* Mobile */
.component {
  padding: 1rem;
}

/* Desktop */
@media (min-width: 768px) {
  .component {
    padding: 2rem;
  }
}
```

## 🧪 Tests et qualité

### Linting

Le projet utilise ESLint avec la configuration React App.

### Vérifications avant commit

- ✅ Pas d'erreurs de linting
- ✅ Code commenté correctement
- ✅ Fonctions documentées avec JSDoc
- ✅ Tests passent (si applicable)

## 📚 Ressources supplémentaires

- [README.md](./README.md) - Documentation principale
- [CODING_STANDARDS.md](./CODING_STANDARDS.md) - Standards de code
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Structure détaillée
- [src/store/README.md](./src/store/README.md) - Documentation Redux

## 🔗 Liens utiles

- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Router](https://reactrouter.com/)
- [JSDoc](https://jsdoc.app/)

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024

