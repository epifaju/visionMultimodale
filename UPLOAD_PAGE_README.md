# Page d'Upload et Gestion des Documents

## Vue d'ensemble

La nouvelle page d'upload (`/upload`) combine deux fonctionnalités principales :

1. **Upload de nouveaux documents** - Interface drag & drop pour télécharger des fichiers
2. **Gestion des documents existants** - Liste complète avec filtres, recherche et pagination

## URL d'accès

- **Frontend** : `http://localhost:5173/upload`
- **Backend API** : `http://localhost:8080/api/documents`

## Fonctionnalités implémentées

### 1. Upload de Documents

- **Drag & Drop** : Glissez-déposez vos fichiers directement sur la zone d'upload
- **Sélection manuelle** : Cliquez sur "Sélectionner des fichiers" pour ouvrir l'explorateur
- **Types supportés** : Images (JPEG, PNG, TIFF), PDF, documents texte
- **Limites** : Maximum 10 fichiers, 25MB par fichier
- **Validation** : Vérification automatique des types et tailles de fichiers
- **Feedback visuel** : Indicateurs de progression et messages de succès

### 2. Gestion des Documents

- **Liste complète** : Affichage de tous les documents uploadés
- **Filtres avancés** :
  - Par statut (En attente, En cours, Terminés, Traités, Erreurs)
  - Par type de fichier (PDF, JPEG, PNG, TIFF)
  - Tri par date, nom, taille ou statut
  - Ordre croissant/décroissant
- **Recherche** : Recherche dans le contenu des documents avec debounce
- **Pagination** : Navigation entre les pages (20 documents par page)
- **Actions** : Boutons pour voir et télécharger les documents

### 3. Interface Utilisateur

- **Design moderne** : Interface responsive avec Tailwind CSS
- **Navigation intuitive** : Bouton de retour au dashboard
- **Statuts visuels** : Icônes et couleurs pour chaque statut de traitement
- **Responsive** : S'adapte aux écrans mobiles et desktop
- **Accessibilité** : Labels appropriés et structure sémantique

## Structure des Composants

### UploadPage.tsx

- Composant principal combinant upload et gestion
- Gestion d'état pour documents, filtres et pagination
- Intégration avec l'API backend

### FileUpload.tsx

- Composant d'upload avec drag & drop
- Validation des fichiers
- Gestion des erreurs et du feedback

### Composants UI

- `Button`, `Card`, `LoadingSpinner` pour l'interface
- Styles cohérents avec le reste de l'application

## API Backend

### Endpoints utilisés

```typescript
// Récupération des documents avec filtres
GET /api/documents?page=0&size=20&sortBy=uploadedAt&sortDir=desc&status=PENDING

// Upload et traitement d'un document
POST /api/documents/process
Content-Type: multipart/form-data
```

### Paramètres de requête

- `page` : Numéro de page (0-indexed)
- `size` : Nombre d'éléments par page
- `sortBy` : Champ de tri (uploadedAt, fileName, fileSize, status)
- `sortDir` : Direction du tri (asc, desc)
- `status` : Filtre par statut
- `fileType` : Filtre par type de fichier
- `searchQuery` : Recherche textuelle

## Utilisation

### 1. Accéder à la page

- Connectez-vous à l'application
- Naviguez vers `/upload` ou cliquez sur le bouton d'upload depuis le dashboard

### 2. Uploader des documents

- Glissez-déposez vos fichiers dans la zone d'upload
- Ou cliquez pour sélectionner des fichiers
- Les fichiers sont automatiquement validés et uploadés
- Un message de confirmation s'affiche après l'upload

### 3. Gérer les documents existants

- Utilisez les filtres pour affiner la liste
- Recherchez dans le contenu des documents
- Naviguez entre les pages avec la pagination
- Cliquez sur "Voir" pour examiner un document
- Cliquez sur "Télécharger" pour récupérer un fichier

## Configuration

### Limites configurables

```typescript
// Dans UploadPage.tsx
maxFiles={10}           // Nombre maximum de fichiers
maxFileSize={25}        // Taille maximale en MB
acceptedTypes={['image/*', 'application/pdf', 'text/*']} // Types acceptés
```

### Pagination

```typescript
// Nombre d'éléments par page
size: 20;
```

## Dépendances

- **Frontend** : React 18+, TypeScript, Tailwind CSS
- **Backend** : Spring Boot, Java 17
- **API** : Axios pour les requêtes HTTP
- **Routage** : React Router v6

## Développement

### Ajouter de nouveaux types de fichiers

1. Modifiez `acceptedTypes` dans `UploadPage.tsx`
2. Ajoutez la validation dans `FileUpload.tsx`
3. Mettez à jour les filtres de type de fichier

### Étendre les actions

1. Ajoutez de nouveaux boutons dans la colonne Actions
2. Implémentez les fonctions correspondantes
3. Mettez à jour l'API backend si nécessaire

### Personnaliser les filtres

1. Ajoutez de nouveaux états de filtrage
2. Modifiez la fonction `loadDocuments`
3. Ajoutez les contrôles UI correspondants

## Tests

La page inclut des tests pour :

- Validation des fichiers
- Gestion des erreurs
- Responsive design
- Accessibilité

## Support

Pour toute question ou problème :

1. Vérifiez les logs du navigateur (F12)
2. Vérifiez les logs du backend
3. Consultez la documentation de l'API
4. Vérifiez la configuration des CORS si nécessaire





