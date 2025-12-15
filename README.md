# 🌞 Sunshine Agency – Application immobilière

> Application web complète de gestion immobilière avec front‑office public et back‑office d'administration, composée d’un **frontend React** et d’une **API PHP**.

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Structure du projet](#-structure-du-projet)
- [Configuration de l'API](#-configuration-de-lapi)
- [Technologies utilisées](#-technologies-utilisées)
- [Guide de développement](#-guide-de-développement)
- [API Backend](#-api-backend)
- [Authentification](#-authentification)
- [Contribuer](#-contribuer)

## 🎯 À propos

Sunshine Agency est une application web moderne de gestion immobilière développée avec **React** et **Redux Toolkit** côté frontend et une **API REST PHP/MySQL** côté backend.  
Elle permet aux clients de rechercher des propriétés, de planifier des visites et de communiquer avec les agents, tandis que les administrateurs et agents gèrent l'ensemble des opérations via un dashboard complet.

### Caractéristiques principales

- 🏠 **Gestion des propriétés** : CRUD complet avec recherche, filtres avancés et affichage détaillé
- 👥 **Gestion des clients** : Suivi des informations, préférences et historique de contact
- 👨‍💼 **Gestion des agents** : Administration des agents commerciaux et de leurs portefeuilles
- 📅 **Rendez-vous** : Planification, suivi et gestion des visites
- 💬 **Messagerie** : Communication en temps réel entre clients et agents
- 📊 **Dashboard** : Statistiques, graphiques et vue d'ensemble de l'activité

## ✨ Fonctionnalités

### Front‑Office (public)

- ✅ Page d'accueil avec propriétés vedettes
- ✅ Catalogue complet des propriétés avec filtres (prix, localisation, type, etc.)
- ✅ Détails des propriétés avec galerie d’images
- ✅ Liste des agents avec profils détaillés
- ✅ Formulaire de contact
- ✅ Réservation de visites (nécessite authentification)
- ✅ Dashboard client pour gérer ses rendez-vous et ses demandes

### Back‑Office (admin / agent)

- ✅ Dashboard avec statistiques en temps réel
- ✅ Gestion complète des propriétés (CRUD)
- ✅ Gestion des clients
- ✅ Gestion des agents
- ✅ Gestion des rendez-vous avec calendrier
- ✅ Système de messagerie intégré
- ✅ Synchronisation automatique des données avec l’API

## 🏗️ Architecture

### Structure frontend (React)

```text
src/
├── Components/              # Composants réutilisables (UI, layout, widgets)
│   ├── ProtectedRoute.js    # Protection des routes
│   ├── Header.js            # En-tête du site
│   ├── Footer.js            # Pied de page
│   ├── PropertyCard.js      # Carte de propriété
│   ├── AgentCard.js         # Carte d'agent
│   └── Messaging.js         # Composant de messagerie
│
├── Pages/                   # Pages principales et vues
│   ├── HomePage/            # Sous-pages du front-office (Home, propriétés, etc.)
│   ├── HomePage.js          # Routeur front-office
│   ├── LoginPage.js         # Connexion
│   ├── RegisterPage.js      # Inscription
│   ├── AdminDashboard.js    # Dashboard admin
│   └── ClientDashboard.js   # Dashboard client
│
├── store/                   # Redux Store
│   ├── index.js             # Configuration du store
│   ├── hooks.js             # Hooks Redux personnalisés
│   └── slices/              # Slices Redux
│       ├── authSlice.js         # Authentification
│       ├── propertiesSlice.js   # Propriétés
│       ├── agentsSlice.js       # Agents
│       ├── clientsSlice.js      # Clients
│       ├── appointmentsSlice.js # Rendez-vous
│       ├── messagesSlice.js     # Messagerie
│       └── dashboardSlice.js    # Dashboard
│
├── services/                # Services d'accès à l’API (requêtes HTTP)
│   ├── agentService.js      # Appels liés aux agents
│   ├── dashboardService.js  # Appels liés au dashboard/statistiques
│   └── propertyService.js   # Appels liés aux propriétés
│
├── config/                  # Configuration globale
│   └── api.js               # URLs de l’API et constantes associées
│
├── hooks/                   # Hooks personnalisés
│   └── useNotification.js   # Gestion des notifications
│
├── utils/                   # Utilitaires
│   └── formatPrice.js       # Formatage des prix
│
└── style/                   # Fichiers CSS
    └── *.css                # Styles globaux et par composant
```

### Structure backend (PHP)

```text
backend/
├── AgentAPI/           # API des agents
├── AppointmentAPI/     # API des rendez-vous
├── ClientAPI/          # API des clients
├── DashboardAPI/       # API du dashboard
├── LoginRegisterAPI/   # API d'authentification
├── MessageAPI/         # API de messagerie
└── PropertyAPI/        # API des propriétés
```

## 🚀 Installation

### Prérequis

- **Node.js** v16 ou supérieur
- **npm** ou **yarn**
- **XAMPP / Laragon** (pour le backend PHP)
- **MySQL** (ou MariaDB)

### Clonage du projet

```bash
git clone <repository-url>
cd SunshineAgency   # ou le nom réel de votre dossier
```

### Installation du frontend

```bash
npm install
```

### Installation / configuration du backend

1. Placer le dossier `backend/` dans le répertoire racine de votre serveur (par ex. `htdocs` ou `www` sous Laragon).
2. Importer le fichier SQL fourni (base de données Sunshine) dans MySQL.
3. Configurer les identifiants de connexion MySQL (hôte, base, utilisateur, mot de passe) dans les fichiers de configuration PHP (par ex. `config.php` ou équivalent).

### Lancer les serveurs

1. **Backend PHP**
   - Démarrer Apache et MySQL depuis XAMPP / Laragon.
   - Vérifier que l’API est accessible, par exemple :  
     `http://localhost/sun/backend` ou `http://localhost/SunshineAgency/backend` selon votre configuration.

2. **Frontend React**

   ```bash
   npm start
   ```

   L’application sera généralement disponible sur : `http://localhost:3000`.

### Accès rapide

- **Front‑office** : `http://localhost:3000`
- **Page de connexion** : `http://localhost:3000/login`

## 📁 Structure du projet

### Organisation des fichiers (résumé)

- **Components/** : Composants React réutilisables
- **Pages/** : Pages principales de l'application
- **store/** : Configuration Redux et slices
- **config/** : Fichiers de configuration (ex : URLs de l’API)
- **utils/** : Fonctions utilitaires (formatage, helpers, etc.)
- **style/** : Fichiers CSS (un par composant)

### Conventions de nommage

- **Composants** : PascalCase (`PropertyCard.js`)
- **Fichiers CSS** : PascalCase (`PropertyCard.css`)
- **Hooks** : camelCase avec préfixe `use` (`useAppDispatch`)
- **Actions Redux** : camelCase (`fetchProperties`)
- **Constantes** : UPPER_SNAKE_CASE (`BASE_URL`)

## ⚙️ Configuration de l’API

- **URL de base de l’API** : définie dans `src/config/api.js` via une constante (par ex. `BASE_URL`).
- Adapter cette URL à votre environnement local, par ex. :
  - `http://localhost/sun/backend`
  - ou `http://localhost/SunshineAgency/backend`
- En production, utiliser une URL sécurisée (`https://…`) et, idéalement, des variables d’environnement.

## 🛠️ Technologies utilisées

### Frontend

- **React 18+** : Bibliothèque UI
- **Redux Toolkit** : Gestion d'état globale
- **React Router** : Routage client
- **CSS3** : Styles (thème sombre, glassmorphism)

### Backend

- **PHP 7.4+** : API REST
- **MySQL / MariaDB** : Base de données relationnelle
- **PDO** : Accès à la base de données et requêtes préparées

### Outils de développement

- **Create React App** : Boilerplate / outil de build
- **ESLint** : Linting et qualité du code
- **Git** : Contrôle de version

## 📖 Guide de développement

### Ajouter un nouveau composant

1. Créer le fichier dans `src/Components/`.
2. Créer le fichier CSS correspondant dans `src/style/`.
3. Exporter le composant par défaut.
4. Ajouter les commentaires JSDoc si nécessaire.

### Ajouter une nouvelle route

1. Ajouter la route dans `src/App.js`.
2. Créer la page dans `src/Pages/` si nécessaire.
3. Protéger la route avec `ProtectedRoute` si elle est réservée aux utilisateurs authentifiés.

### Ajouter un nouveau slice Redux

1. Créer le fichier dans `src/store/slices/`.
2. Définir les actions asynchrones avec `createAsyncThunk`.
3. Créer le slice avec `createSlice`.
4. Ajouter le reducer dans `src/store/index.js`.

### Exemple de composant

```javascript
/**
 * @fileoverview Description du composant
 * @module Components/MyComponent
 */
import React from 'react';
import '../style/MyComponent.css';

/**
 * Composant MyComponent
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element}
 */
const MyComponent = ({ prop1, prop2 }) => {
  return (
    <div className="my-component">
      {/* Contenu */}
    </div>
  );
};

export default MyComponent;
```

## 🔌 API Backend

### Endpoints principaux

- `GET /PropertyAPI/get_properties.php` – Liste des propriétés
- `GET /PropertyAPI/get_property.php?id=X` – Détails d'une propriété
- `POST /LoginRegisterAPI/login.php` – Connexion
- `GET /AppointmentAPI/get_appointments.php` – Liste des rendez-vous
- `POST /MessageAPI/send_message.php` – Envoyer un message

Pour plus de détails, voir la documentation complète dans `backend/README.md` (si disponible).

## 🔐 Authentification

### Rôles utilisateurs

- **client** : Accès au dashboard client uniquement
- **agent** : Accès au dashboard admin (gestion limitée)
- **admin** : Accès complet au dashboard admin

### Flux d'authentification

1. L'utilisateur se connecte via `LoginPage`.
2. Les identifiants sont envoyés à l'API.
3. Le token et les données utilisateur sont stockés dans Redux et `localStorage`.
4. `ProtectedRoute` vérifie l'authentification pour les routes protégées.
5. L’utilisateur est redirigé automatiquement selon son rôle.

## 🤝 Contribuer

1. Forker le projet.
2. Créer une branche (`git checkout -b feature/AmazingFeature`).
3. Committer les changements (`git commit -m 'Add some AmazingFeature'`).
4. Pousser vers la branche (`git push origin feature/AmazingFeature`).
5. Ouvrir une Pull Request.

### Standards de code

- Utiliser des commentaires JSDoc pour les fonctions et composants importants.
- Suivre les conventions de nommage définies plus haut.
- Ajouter des commentaires explicatifs pour la logique complexe.
- Lancer les tests / le linting avant de commit.

## 📝 Licence

Ce projet est **propriétaire**. Tous droits réservés.

## 👥 Équipe

Sunshine Agency Development Team

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024
