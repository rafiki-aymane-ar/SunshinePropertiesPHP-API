# 🌞 Sunshine Properties - Plateforme Immobilière

Bienvenue sur le projet **Sunshine Properties**, une application web complète pour la gestion et la consultation de biens immobiliers. Ce projet combine une interface utilisateur moderne avec une API backend robuste.

## 🚀 Vue d'ensemble du Projet

Cette application permet aux utilisateurs de :
*   Consulter des listes de biens immobiliers (maisons, appartements, studios, etc.).
*   Voir les détails de chaque propriété.
*   Contacter des agents immobiliers.
*   S'inscrire et se connecter (Client, Agent, Admin).
*   Gérer ses favoris et ses recherches.

### 🛠 Technologies Utilisées

*   **Frontend** : [React.js](https://reactjs.org/) (v18+)
    *   Gestion d'état : Redux Toolkit
    *   Routage : React Router
    *   Design : CSS Modules / Variables CSS (Support Mode Sombre/Clair)
*   **Backend** : PHP (Native / Vanilla)
    *   Architecture : API RESTful
    *   Base de données : MySQL / MariaDB via PDO
*   **Authentification** : JWT (JSON Web Tokens) & Firebase (pour Google Auth optionnel)

---

## ⚙️ Installation et Lancement

Pour faire tourner le projet localement, vous devez lancer le Frontend et le Backend séparément.

### Pré-requis
*   Node.js installé
*   PHP installé 
*   Base de données MySQL configurée (importer le script SQL s'il est fourni dans `database/` ou configurer `backend/config/db.php`)

### 1️⃣ Démarrer le Backend (API)

Le backend doit tourner sur le port **8000** pour que le frontend puisse communiquer avec lui.

```bash
# Dans le dossier racine du projet
php -S localhost:8000 -t backend
```

> **Note :** L'API sera accessible via `http://localhost:8000`.

### 2️⃣ Démarrer le Frontend (React)

Ouvrez un nouveau terminal :

```bash
# Dans le dossier racine du projet
npm install  # (Si ce n'est pas déjà fait)
npm start
```

> L'application s'ouvrira automatiquement sur `http://localhost:3000`.

---

## 📂 Structure du Projet

```
RafikiMoukrim_SunshineProperties_PHP_API/
├── backend/            # Code source de l'API PHP
│   ├── config/         # Configuration DB (db.php)
│   ├── AgentAPI/       # Endpoints pour les agents
│   ├── PropertyAPI/    # Endpoints pour les propriétés
│   ├── UserAPI/        # Endpoints utilisateurs
│   └── LoginRegisterAPI/ # Authentification
│
├── src/                # Code source React
│   ├── Components/     # Composants réutilisables (Header, Footer...)
│   ├── Pages/          # Pages principales (Home, Login, Dashboard...)
│   ├── services/       # Services d'appel API (propertyService, authService...)
│   ├── store/          # Redux Store
│   └── style/          # Fichiers CSS globaux et thèmes
│
└── public/             # Assets statiques
```

## 🎨 Fonctionnalités Clés

*   **Mode Sombre / Clair** : Basculement de thème en un clic.
*   **Tableau de Bord** : Interface dédiée pour les clients et administrateurs.
*   **Recherche Avancée** : Filtrage des biens par prix, type, ville, etc.
*   **Responsive** : Design adapté aux mobiles et ordinateurs.

---


