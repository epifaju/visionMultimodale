# Page des Documents - Vision Multimodale

## Vue d'ensemble

La page des documents (`/documents`) permet aux utilisateurs de consulter, filtrer et gérer tous leurs documents traités par l'application Vision Multimodale.

## Fonctionnalités

### 🔍 Affichage des documents
- **Liste paginée** : Affichage de 20 documents par page avec navigation
- **Informations détaillées** : Nom du fichier, type, taille, statut, date d'upload
- **Statuts visuels** : Icônes et couleurs pour chaque statut de traitement

### 🎯 Filtrage et recherche
- **Filtre par statut** : PENDING, PROCESSING, COMPLETED, PROCESSED, ERROR
- **Filtre par type de fichier** : PDF, JPEG, PNG, TIFF
- **Recherche textuelle** : Recherche dans le contenu extrait des documents
- **Tri personnalisable** : Par nom, taille, statut ou date d'upload

### 📱 Interface utilisateur
- **Design responsive** : Adaptation automatique aux différentes tailles d'écran
- **Navigation intuitive** : Bouton de retour au dashboard et liens vers l'upload
- **États de chargement** : Indicateurs visuels pendant les opérations
- **Gestion d'erreurs** : Messages d'erreur clairs avec possibilité de réessayer

## Structure technique

### Composants utilisés
- `DocumentsPage` : Composant principal de la page
- `Card` : Conteneurs pour les sections
- `Button` : Boutons d'action
- `LoadingSpinner` : Indicateur de chargement

### Types TypeScript
```typescript
interface Document {
  id: number;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  status: ProcessingStatus;
  uploadedAt: string;
  // ... autres propriétés
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
}
```

### API Backend
- **Endpoint** : `GET /api/documents`
- **Paramètres** : pagination, filtres, tri, recherche
- **Authentification** : JWT Bearer token requis
- **Réponse** : Structure paginée avec métadonnées

## Utilisation

### Accès à la page
1. Se connecter à l'application
2. Naviguer vers `/documents` ou cliquer sur "Documents" dans la barre de navigation
3. La page se charge automatiquement avec les documents de l'utilisateur

### Filtrage des documents
1. **Par statut** : Sélectionner un statut dans le menu déroulant
2. **Par type** : Choisir un type de fichier spécifique
3. **Par recherche** : Taper du texte dans le champ de recherche (délai de 500ms)
4. **Tri** : Choisir le critère et l'ordre de tri

### Navigation
- **Pagination** : Boutons Première, Précédente, Suivante, Dernière
- **Retour** : Bouton "← Retour au Dashboard"
- **Upload** : Lien vers la page d'upload depuis la page vide

## Gestion des erreurs

### Types d'erreurs
- **Erreur de chargement** : Problème lors de la récupération des documents
- **Erreur d'API** : Problème de communication avec le backend
- **Erreur d'authentification** : Token expiré ou invalide

### Actions de récupération
- Bouton "Réessayer" pour relancer le chargement
- Redirection automatique vers la page de connexion si nécessaire
- Messages d'erreur explicites pour l'utilisateur

## Tests

### Tests unitaires
- Rendu des composants
- Gestion des états de chargement
- Interactions utilisateur (filtres, recherche, pagination)
- Gestion des erreurs

### Tests d'intégration
- Communication avec l'API backend
- Navigation entre les pages
- Persistance des filtres et de la pagination

## Développement

### Ajout de nouvelles fonctionnalités
1. **Nouveaux filtres** : Ajouter dans l'interface et la logique de filtrage
2. **Nouveaux statuts** : Mettre à jour les icônes et couleurs
3. **Nouvelles actions** : Ajouter des boutons dans la colonne Actions

### Personnalisation
- **Thème** : Modifier les couleurs via les classes Tailwind CSS
- **Langue** : Adapter les textes pour d'autres langues
- **Mise en page** : Ajuster la grille et les espacements

## Dépendances

- **React Router** : Navigation et routage
- **Axios** : Communication HTTP avec le backend
- **Tailwind CSS** : Styles et composants UI
- **TypeScript** : Typage statique et sécurité du code

## Performance

### Optimisations
- **Debounce** : Recherche avec délai de 500ms
- **Pagination** : Chargement de 20 documents par page
- **Mise en cache** : Réutilisation des données déjà chargées
- **Lazy loading** : Chargement à la demande

### Monitoring
- Temps de réponse de l'API
- Nombre de requêtes par session
- Performance des filtres et de la recherche
