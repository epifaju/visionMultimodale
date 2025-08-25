# Suite de Tests Frontend

Ce dossier contient tous les tests pour l'application frontend React avec Zustand.

## Structure des Tests

```
src/test/
├── setup.ts                 # Configuration globale des tests
├── test-utils.tsx          # Utilitaires et helpers de test
├── integration/            # Tests d'intégration
│   └── App.test.tsx       # Test de l'application complète
├── components/             # Tests des composants
│   ├── ui/                # Tests des composants UI de base
│   │   ├── Button.test.tsx
│   │   ├── Input.test.tsx
│   │   └── Card.test.tsx
│   └── auth/              # Tests des composants d'authentification
│       └── LoginForm.test.tsx
├── stores/                 # Tests des stores Zustand
│   └── authStore.test.ts
└── hooks/                  # Tests des hooks personnalisés
    └── useAppInitialization.test.ts
```

## Technologies Utilisées

- **Vitest** : Framework de test rapide et moderne
- **@testing-library/react** : Utilitaires pour tester les composants React
- **@testing-library/user-event** : Simulation des interactions utilisateur
- **jsdom** : Environnement DOM pour les tests
- **@testing-library/jest-dom** : Matchers supplémentaires pour les assertions

## Configuration

### Vitest

La configuration se trouve dans `vitest.config.ts` à la racine du projet :

- Support de React et TypeScript
- Environnement jsdom pour le DOM
- Alias de chemins configurés
- Couverture de code activée

### Setup Global

Le fichier `setup.ts` configure :

- Mocks de localStorage
- Mocks de matchMedia, IntersectionObserver, ResizeObserver
- Nettoyage automatique entre les tests

## Utilitaires de Test

### `test-utils.tsx`

Fournit des fonctions utilitaires :

- `render()` : Fonction de rendu personnalisée avec providers
- `resetStores()` : Réinitialisation des stores Zustand
- `createMockUser()`, `createMockDocument()` : Données de test
- `waitForStoreUpdate()` : Attente des mises à jour des stores
- `simulateUserAction()` : Simulation d'actions utilisateur

## Types de Tests

### 1. Tests Unitaires des Composants

Testent le comportement individuel des composants :

- Rendu correct
- Gestion des props
- Gestion des événements
- États (loading, error, success)
- Validation des formulaires

### 2. Tests des Stores Zustand

Testent la logique métier des stores :

- État initial
- Actions et mutations
- Persistance des données
- Gestion des erreurs
- Interactions entre stores

### 3. Tests d'Intégration

Testent le fonctionnement de l'application complète :

- Flux d'authentification
- Navigation entre composants
- Intégration des stores
- Gestion des erreurs globales

### 4. Tests des Hooks Personnalisés

Testent la logique des hooks :

- Initialisation
- Gestion des effets
- Intégration avec les stores
- Gestion des dépendances

## Exécution des Tests

### Commandes Disponibles

```bash
# Lancer les tests en mode watch
npm run test

# Interface graphique pour les tests
npm run test:ui

# Exécuter tous les tests une fois
npm run test:run

# Tests avec couverture de code
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

### Options de Vitest

```bash
# Tests spécifiques
npm run test Button.test.tsx

# Tests avec filtrage
npm run test -- --grep "Button"

# Tests avec couverture détaillée
npm run test:coverage -- --reporter=html
```

## Bonnes Pratiques

### 1. Organisation des Tests

- Un fichier de test par composant/fonction
- Tests groupés par fonctionnalité
- Noms de tests descriptifs et en français
- Utilisation des `describe` pour organiser les tests

### 2. Mocks et Stubs

- Mock des stores Zustand pour isoler les composants
- Mock des API externes
- Mock des navigateurs APIs (localStorage, etc.)
- Utilisation de `vi.fn()` pour les fonctions mock

### 3. Assertions

- Vérification du rendu des composants
- Vérification des interactions utilisateur
- Vérification des appels aux stores
- Vérification des états et transitions

### 4. Nettoyage

- Réinitialisation des stores entre les tests
- Nettoyage des mocks
- Nettoyage du DOM
- Utilisation de `beforeEach` et `afterEach`

## Exemples de Tests

### Test de Composant Simple

```typescript
it("renders correctly with default props", () => {
  render(<Button>Click me</Button>);

  const button = screen.getByRole("button", { name: "Click me" });
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass("bg-primary-600", "text-white");
});
```

### Test d'Interaction Utilisateur

```typescript
it("handles click events", async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();

  render(<Button onClick={handleClick}>Click me</Button>);

  const button = screen.getByRole("button");
  await user.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Test de Store Zustand

```typescript
it("should handle successful login", async () => {
  const store = useAuthStore.getState();
  const credentials = { username: "testuser", password: "password123" };

  const result = await store.login(credentials);

  expect(result).toBe(true);
  expect(useAuthStore.getState().isAuthenticated).toBe(true);
});
```

## Couverture de Code

La couverture de code est configurée pour inclure :

- **Statements** : Pourcentage de lignes exécutées
- **Branches** : Pourcentage de branches conditionnelles testées
- **Functions** : Pourcentage de fonctions appelées
- **Lines** : Pourcentage de lignes couvertes

### Exclusions

- Fichiers de configuration
- Fichiers de test
- Types TypeScript
- Fichiers de build

## Débogage des Tests

### Mode Debug

```bash
# Lancer les tests en mode debug
npm run test -- --debug
```

### Interface Graphique

```bash
# Interface web pour visualiser les tests
npm run test:ui
```

### Logs Détaillés

```bash
# Tests avec logs détaillés
npm run test -- --reporter=verbose
```

## Maintenance

### Ajout de Nouveaux Tests

1. Créer le fichier de test dans le bon dossier
2. Importer les utilitaires nécessaires
3. Mocker les dépendances externes
4. Écrire des tests couvrant tous les cas d'usage
5. Vérifier la couverture de code

### Mise à Jour des Tests

- Maintenir la synchronisation avec le code source
- Mettre à jour les mocks lors des changements d'API
- Adapter les tests aux nouvelles fonctionnalités
- Vérifier que tous les tests passent après refactoring

## Support

Pour toute question sur les tests :

- Consulter la documentation Vitest
- Vérifier les exemples dans le dossier `test/`
- Utiliser les utilitaires fournis dans `test-utils.tsx`
- Suivre les bonnes pratiques documentées ici
