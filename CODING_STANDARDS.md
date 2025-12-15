# 📐 Standards de Code - Sunshine Agency

Ce document définit les standards de code pour le projet Sunshine Agency.

## 📝 Commentaires et Documentation

### En-têtes de fichiers

Chaque fichier doit commencer par un en-tête JSDoc :

```javascript
/**
 * @fileoverview Description du fichier
 * @module path/to/module
 * @description
 * Description détaillée du fichier et de son rôle dans l'application.
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */
```

### Commentaires de sections

Utiliser des séparateurs visuels pour organiser le code :

```javascript
// ============================================================================
// IMPORTS
// ============================================================================

// ============================================================================
// CONSTANTES
// ============================================================================

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

// ========================================================================
// HOOKS
// ========================================================================

// ========================================================================
// HANDLERS
// ========================================================================

// ========================================================================
// EFFETS
// ========================================================================

// ========================================================================
// RENDU
// ========================================================================
```

### Documentation des fonctions

Toutes les fonctions publiques doivent avoir une documentation JSDoc :

```javascript
/**
 * Description de la fonction
 * 
 * @param {Type} paramName - Description du paramètre
 * @param {Type} [optionalParam] - Paramètre optionnel
 * @returns {Type} Description de la valeur de retour
 * 
 * @example
 * const result = myFunction('value');
 */
```

## 🏗️ Structure des composants

### Ordre des éléments dans un composant

1. **Imports** (groupés par catégorie)
2. **Documentation JSDoc**
3. **Constantes**
4. **Composant principal**
5. **Hooks** (useState, useEffect, etc.)
6. **Handlers** (fonctions de gestion d'événements)
7. **Fonctions utilitaires**
8. **Rendu JSX**
9. **Export**

### Exemple de structure

```javascript
/**
 * @fileoverview ...
 */
import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';

// ============================================================================
// CONSTANTES
// ============================================================================
const CONSTANT_VALUE = 'value';

// ============================================================================
// COMPOSANT
// ============================================================================
const MyComponent = ({ prop1, prop2 }) => {
  // ========================================================================
  // HOOKS
  // ========================================================================
  const [state, setState] = useState(null);
  const dispatch = useAppDispatch();

  // ========================================================================
  // EFFETS
  // ========================================================================
  useEffect(() => {
    // ...
  }, []);

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleClick = () => {
    // ...
  };

  // ========================================================================
  // RENDU
  // ========================================================================
  return (
    <div>
      {/* ... */}
    </div>
  );
};

export default MyComponent;
```

## 📦 Organisation des imports

### Ordre des imports

1. **React et bibliothèques React**
2. **Bibliothèques tierces**
3. **Composants locaux**
4. **Hooks et utilitaires**
5. **Styles**

```javascript
// 1. React
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Bibliothèques tierces
import { useAppDispatch } from 'react-redux';

// 3. Composants locaux
import Header from '../Components/Header';
import Footer from '../Components/Footer';

// 4. Hooks et utilitaires
import { useAppSelector } from '../store/hooks';
import { formatPrice } from '../utils/formatPrice';

// 5. Styles
import '../style/MyComponent.css';
```

## 🎨 Nommage

### Variables et fonctions

- **camelCase** pour les variables et fonctions
- **PascalCase** pour les composants
- **UPPER_SNAKE_CASE** pour les constantes
- Préfixer les handlers avec `handle` : `handleClick`, `handleSubmit`
- Préfixer les fonctions booléennes avec `is` ou `has` : `isLoading`, `hasError`

### Fichiers

- **PascalCase** pour les composants : `PropertyCard.js`
- **camelCase** pour les utilitaires : `formatPrice.js`
- **kebab-case** pour les fichiers de configuration : `api-config.js`

## 🔄 Redux

### Structure des slices

```javascript
/**
 * @fileoverview Slice Redux pour [domaine]
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ============================================================================
// CONSTANTES
// ============================================================================
const BASE_URL = 'http://localhost/sun/backend';

// ============================================================================
// ACTIONS ASYNCHRONES
// ============================================================================
export const fetchItems = createAsyncThunk(
  'domain/fetchItems',
  async (_, { rejectWithValue }) => {
    // ...
  }
);

// ============================================================================
// SLICE
// ============================================================================
const domainSlice = createSlice({
  name: 'domain',
  initialState: {
    // ...
  },
  reducers: {
    // ...
  },
  extraReducers: (builder) => {
    // ...
  },
});

export default domainSlice.reducer;
```

## 🎯 Bonnes pratiques

### 1. Gestion des erreurs

Toujours gérer les erreurs dans les appels API :

```javascript
try {
  const response = await fetch(url);
  const data = await response.json();
  // ...
} catch (error) {
  console.error('Erreur:', error);
  // Gérer l'erreur
}
```

### 2. Validation des props

Utiliser des valeurs par défaut et des vérifications :

```javascript
const MyComponent = ({ 
  prop1 = 'default', 
  prop2 = null 
}) => {
  if (!prop2) {
    return <div>Erreur: prop2 requis</div>;
  }
  // ...
};
```

### 3. Commentaires explicatifs

Ajouter des commentaires pour expliquer la logique complexe :

```javascript
// Calculer le prix total en tenant compte des réductions
// Si le client est premium, appliquer une réduction de 10%
const totalPrice = isPremium 
  ? basePrice * 0.9 
  : basePrice;
```

### 4. Éviter les commentaires inutiles

Ne pas commenter le code évident :

```javascript
// ❌ Mauvais
const count = items.length; // Obtenir la longueur du tableau

// ✅ Bon
const count = items.length;
```

## 📱 Responsive Design

Toujours tester sur mobile et desktop. Utiliser les media queries CSS :

```css
/* Mobile first */
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

## 🧪 Tests

Ajouter des tests pour les fonctions critiques :

```javascript
describe('formatPrice', () => {
  it('should format price correctly', () => {
    expect(formatPrice(150000)).toBe('150 000 €');
  });
});
```

## 📚 Ressources

- [JSDoc Documentation](https://jsdoc.app/)
- [React Best Practices](https://react.dev/learn)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

---

**Dernière mise à jour** : 2024

