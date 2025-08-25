# Architecture des Stores Zustand

Ce dossier contient l'implémentation de la gestion d'état globale de l'application Vision Multimodale utilisant Zustand.

## Structure des Stores

### 1. `authStore.ts` - Gestion de l'authentification

**Responsabilités :**

- Gestion de l'état de connexion utilisateur
- Stockage des informations utilisateur et du token JWT
- Actions de connexion, déconnexion, inscription
- Rafraîchissement automatique des tokens
- Persistance de l'état d'authentification

**État :**

```typescript
{
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Actions principales :**

- `login(credentials)` - Connexion utilisateur
- `logout()` - Déconnexion
- `register(userData)` - Inscription
- `refreshToken()` - Rafraîchissement du token
- `updateProfile(updates)` - Mise à jour du profil

### 2. `documentStore.ts` - Gestion des documents

**Responsabilités :**

- Stockage de la liste des documents
- Gestion de la queue de traitement
- Stockage des résultats de traitement
- Filtrage et recherche de documents
- Actions de traitement des documents

**État :**

```typescript
{
  documents: Document[]
  currentDocument: Document | null
  processingQueue: Document[]
  processingResults: Map<number, ProcessingResult>
  filters: DocumentFilters
  isLoading: boolean
  error: string | null
}
```

**Actions principales :**

- `addDocument(document)` - Ajout d'un document
- `processDocument(id)` - Traitement d'un document
- `setFilters(filters)` - Application de filtres
- `searchDocuments(query)` - Recherche de documents
- `loadDocuments()` - Chargement des documents

### 3. `uiStore.ts` - Gestion de l'interface utilisateur

**Responsabilités :**

- Gestion des notifications système
- État de la sidebar et navigation
- Gestion du thème (clair/sombre)
- Gestion de la langue
- État de chargement global

**État :**

```typescript
{
  notifications: Notification[]
  sidebarOpen: boolean
  currentView: string
  theme: 'light' | 'dark'
  language: 'fr' | 'en'
  isLoading: boolean
}
```

**Actions principales :**

- `addNotification(notification)` - Ajout d'une notification
- `toggleTheme()` - Basculement du thème
- `setLanguage(lang)` - Changement de langue
- `showSuccessMessage(message)` - Message de succès
- `showErrorMessage(message)` - Message d'erreur

## Store Combiné

### `useAppStore()` - Hook d'accès global

Ce hook combine tous les stores et fournit des actions globales :

```typescript
const { auth, documents, ui, resetAllStores, isAppReady } = useAppStore();
```

**Actions combinées :**

- `resetAllStores()` - Réinitialisation de tous les stores
- `isAppReady()` - Vérification de l'état de préparation
- `hasGlobalError()` - Vérification des erreurs globales
- `clearAllErrors()` - Nettoyage de toutes les erreurs

## Persistance des Données

Tous les stores utilisent le middleware `persist` de Zustand pour sauvegarder automatiquement l'état dans le localStorage :

- **Auth Store** : Utilisateur, token, état de connexion
- **Document Store** : Documents, filtres, document courant
- **UI Store** : Thème, langue, état de la sidebar

## Gestion des Erreurs

Chaque store gère ses propres erreurs avec :

- État d'erreur localisé
- Actions de nettoyage des erreurs
- Intégration avec le système de notifications

## Utilisation dans les Composants

### Exemple d'utilisation basique :

```typescript
import { useAuthStore } from "@/stores";

function MyComponent() {
  const { user, login, isLoading } = useAuthStore();

  // Utilisation directe
}
```

### Exemple d'utilisation combinée :

```typescript
import { useAppStore } from "@/stores";

function MyComponent() {
  const { auth, documents, ui } = useAppStore();

  // Accès à tous les stores
}
```

## Avantages de cette Architecture

1. **Séparation des responsabilités** - Chaque store a un rôle spécifique
2. **Persistance automatique** - Sauvegarde automatique dans localStorage
3. **Type safety** - TypeScript complet pour tous les stores
4. **Performance** - Re-render uniquement des composants qui utilisent les stores modifiés
5. **Débogage** - Intégration avec les outils de développement
6. **Testabilité** - Stores facilement testables individuellement

## Migration depuis d'autres Solutions

Cette architecture peut facilement remplacer :

- **Redux** - Zustand est plus léger et simple
- **Context API** - Meilleure performance et moins de boilerplate
- **MobX** - Plus simple et moins de configuration

## Bonnes Pratiques

1. **Utiliser les stores individuels** pour les composants qui n'ont besoin que d'un domaine
2. **Utiliser useAppStore** pour les composants qui ont besoin de plusieurs stores
3. **Éviter les mutations directes** - Toujours utiliser les actions définies
4. **Gérer les erreurs** dans chaque store et les afficher via le système de notifications
5. **Utiliser la persistance** pour les données importantes (auth, préférences utilisateur)
