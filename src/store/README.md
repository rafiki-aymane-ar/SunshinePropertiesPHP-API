# Redux Store Structure

Ce projet utilise **Redux Toolkit** pour la gestion d'état globale.

## Structure

```
src/store/
├── index.js              # Configuration du store Redux
├── hooks.js              # Hooks typés pour utiliser Redux
└── slices/               # Slices Redux (modules d'état)
    ├── authSlice.js      # Authentification
    ├── propertiesSlice.js # Propriétés immobilières
    ├── agentsSlice.js    # Agents
    ├── clientsSlice.js   # Clients
    ├── appointmentsSlice.js # Rendez-vous
    ├── messagesSlice.js   # Messagerie
    └── dashboardSlice.js # Dashboard/Statistiques
```

## Utilisation

### 1. Dans un composant React

```javascript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProperties } from '../store/slices/propertiesSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.properties);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  return (
    <div>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error}</p>}
      {items.map(item => <div key={item.id}>{item.title}</div>)}
    </div>
  );
}
```

### 2. Actions disponibles

#### Auth (`authSlice`)
- `loginUser({ email, password })` - Connexion
- `logoutUser()` - Déconnexion
- `checkAuth()` - Vérifier l'authentification
- `updateUser(userData)` - Mettre à jour les données utilisateur
- `clearError()` - Effacer les erreurs

#### Properties (`propertiesSlice`)
- `fetchProperties()` - Récupérer toutes les propriétés
- `fetchPropertyById(id)` - Récupérer une propriété
- `fetchFeaturedProperties()` - Récupérer les propriétés vedettes
- `createProperty(data)` - Créer une propriété
- `updateProperty({ id, ...data })` - Mettre à jour
- `deleteProperty(id)` - Supprimer
- `setFilters(filters)` - Filtrer les propriétés
- `setSelectedProperty(property)` - Sélectionner une propriété

#### Agents (`agentsSlice`)
- `fetchAgents()` - Récupérer tous les agents
- `fetchAgentById(id)` - Récupérer un agent
- `createAgent(data)` - Créer un agent
- `updateAgent({ id, ...data })` - Mettre à jour
- `deleteAgent(id)` - Supprimer

#### Clients (`clientsSlice`)
- `fetchClients()` - Récupérer tous les clients
- `fetchClientById(id)` - Récupérer un client
- `createClient(data)` - Créer un client
- `updateClient({ id, ...data })` - Mettre à jour
- `deleteClient(id)` - Supprimer

#### Appointments (`appointmentsSlice`)
- `fetchAppointments()` - Récupérer tous les rendez-vous
- `fetchClientAppointments(clientId)` - Récupérer les RDV d'un client
- `createAppointment(data)` - Créer un rendez-vous
- `updateAppointment({ id, ...data })` - Mettre à jour
- `deleteAppointment(id)` - Supprimer

#### Messages (`messagesSlice`)
- `fetchConversations(userId)` - Récupérer les conversations
- `fetchMessages(conversationId)` - Récupérer les messages
- `sendMessage(data)` - Envoyer un message
- `fetchContacts({ userId, userType })` - Récupérer les contacts
- `fetchUnreadCount(userId)` - Compter les non lus

#### Dashboard (`dashboardSlice`)
- `fetchDashboardData()` - Récupérer les données du dashboard
- `fetchStats()` - Récupérer les statistiques

## Migration depuis useState

### Avant (useState)
```javascript
const [properties, setProperties] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetch('/api/properties')
    .then(res => res.json())
    .then(data => {
      setProperties(data);
      setLoading(false);
    });
}, []);
```

### Après (Redux)
```javascript
const dispatch = useAppDispatch();
const { items: properties, loading } = useAppSelector(state => state.properties);

useEffect(() => {
  dispatch(fetchProperties());
}, [dispatch]);
```

## Avantages

1. **État global** : Accès à l'état depuis n'importe quel composant
2. **Cache** : Les données sont mises en cache dans le store
3. **Actions centralisées** : Toute la logique API est centralisée
4. **DevTools** : Support Redux DevTools pour le debugging
5. **Performance** : Évite les re-renders inutiles avec des sélecteurs optimisés

## Prochaines étapes

Pour migrer un composant vers Redux :

1. Identifier les états locaux qui pourraient être globaux
2. Importer les hooks et actions Redux
3. Remplacer `useState` par `useAppSelector`
4. Remplacer les appels API directs par `dispatch(action)`
5. Tester que tout fonctionne correctement

