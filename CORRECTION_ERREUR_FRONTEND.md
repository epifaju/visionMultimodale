# Correction de l'erreur Frontend - ReferenceError: require is not defined

## Problème identifié

L'erreur suivante se produisait lors de l'exécution du script `setup-env.js` :

```
ReferenceError: require is not defined in ES module scope, you can use import instead
This file is being treated as an ES module because it has a '.js' file extension and '/app/package.json' contains "type": "module".
```

## Cause

Le fichier `frontend/package.json` contient `"type": "module"`, ce qui force Node.js à traiter tous les fichiers `.js` comme des modules ES6. Cependant, le fichier `setup-env.js` utilisait la syntaxe CommonJS (`require`).

## Solution appliquée

### 1. Conversion du fichier `setup-env.js` vers la syntaxe ES6

**Avant (CommonJS) :**

```javascript
const fs = require("fs");
const path = require("path");
```

**Après (ES6) :**

```javascript
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### 2. Changements apportés

- ✅ Remplacement de `require()` par `import`
- ✅ Ajout de `import { fileURLToPath } from "url"`
- ✅ Remplacement de `__dirname` par `path.dirname(fileURLToPath(import.meta.url))`
- ✅ Conservation de la même fonctionnalité

### 3. Test de la correction

Le script fonctionne maintenant correctement :

```bash
npm run setup
# ✅ Fichier .env créé avec la configuration par défaut
```

## Fichiers modifiés

- `frontend/setup-env.js` - Conversion vers la syntaxe ES6

## Configuration par défaut créée

Le script crée un fichier `.env` avec la configuration suivante :

```env
# Configuration API par défaut
VITE_API_URL=http://localhost:8080/api

# Mode de connexion (true = connexion directe, false = proxy Vite)
VITE_USE_DIRECT_CONNECTION=false

# Configuration CORS
VITE_CORS_ENABLED=true
```

## Vérification

Pour vérifier que la correction fonctionne :

1. Aller dans le répertoire `frontend`
2. Exécuter `npm run setup`
3. Vérifier que le fichier `.env` est créé sans erreur

## Notes importantes

- Cette correction est compatible avec la configuration `"type": "module"` du `package.json`
- Le script conserve toute sa fonctionnalité d'origine
- Aucun changement n'est nécessaire dans les autres fichiers du projet
