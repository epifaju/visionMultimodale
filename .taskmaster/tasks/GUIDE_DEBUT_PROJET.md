# 🚀 Guide de Démarrage - Projet Vite Existant

## 🎯 **Situation actuelle**

✅ **Projet Vite créé** avec `npm create vite@latest visionMultimodale`  
✅ **React 19 + TypeScript** configuré  
✅ **ESLint** configuré  
✅ **Structure de base** en place

## 📋 **Prochaines étapes immédiates**

### **Étape 1: Réorganiser la structure frontend (Tâche 1.1)**

```bash
# Créer le dossier frontend à la racine
mkdir frontend

# Déplacer tous les fichiers frontend existants dans frontend/
mv src/ frontend/
mv package.json frontend/
mv package-lock.json frontend/
mv vite.config.ts frontend/
mv tsconfig.json frontend/
mv tsconfig.app.json frontend/
mv tsconfig.node.json frontend/
mv eslint.config.js frontend/
mv index.html frontend/
mv public/ frontend/

# Créer les dossiers manquants dans frontend/src/
mkdir frontend/src/components
mkdir frontend/src/pages
mkdir frontend/src/services
mkdir frontend/src/utils
mkdir frontend/src/hooks
mkdir frontend/src/types
```

### **Étape 2: Installer TailwindCSS (Tâche 1.4)**

```bash
# Aller dans le dossier frontend
cd frontend

# Installer TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react

# Initialiser TailwindCSS
npx tailwindcss init -p
```

### **Étape 3: Créer la structure backend (Tâche 1.2)**

```bash
# Retourner à la racine
cd ..

# Créer le dossier backend à la racine
mkdir backend
cd backend

# Créer la structure Maven
mkdir -p src/main/java/com/vision/app
mkdir -p src/main/resources
mkdir -p src/test/java
mkdir -p src/test/resources
```

### **Étape 4: Configurer TailwindCSS**

Créer/modifier `frontend/tailwind.config.js` :

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Modifier `frontend/src/index.css` :

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🏗️ **Structure finale du projet**

```
visionMultimodale/          # Votre projet existant
├── frontend/               # Frontend React (existant + adapté)
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   ├── utils/         # Utilitaires
│   │   ├── hooks/         # Hooks personnalisés
│   │   ├── types/         # Types TypeScript
│   │   └── assets/        # Assets (existant)
│   ├── package.json       # Existant (adapté)
│   ├── vite.config.ts     # Existant
│   ├── tsconfig.json      # Existant
│   └── index.html         # Existant
├── backend/               # Backend Spring Boot (nouveau)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── vision/
│   │   │   │           └── app/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
├── docker-compose.yml     # À créer
└── README.md              # Existant
```

## 🔧 **Commandes de vérification**

### **Vérifier le frontend**

```bash
# Aller dans le dossier frontend
cd frontend

# Tester que le projet démarre
npm run dev

# Vérifier la compilation
npm run build

# Vérifier le linting
npm run lint
```

### **Vérifier la structure**

```bash
# Retourner à la racine
cd ..

# Vérifier que tous les dossiers sont créés
ls -la frontend/
ls -la backend/
```

## 📚 **Dépendances à ajouter au frontend/package.json**

```json
{
  "dependencies": {
    "@headlessui/react": "^2.0.0",
    "@heroicons/react": "^2.0.0",
    "axios": "^1.6.0",
    "react-router-dom": "^6.8.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

## 🎯 **Objectifs de la première session**

1. ✅ **Réorganiser le projet frontend** dans un dossier séparé
2. ✅ **Créer tous les dossiers frontend** manquants
3. ✅ **Installer et configurer TailwindCSS**
4. ✅ **Créer la structure backend** de base
5. ✅ **Vérifier que le projet frontend** fonctionne toujours
6. ✅ **Préparer la structure** pour les prochaines tâches

## 🚨 **Points d'attention**

- **Sauvegarder** avant de commencer (Git commit)
- **Tester** après chaque modification
- **Vérifier** que `npm run dev` fonctionne depuis `frontend/`
- **Sauvegarder** les changements avec Git après chaque étape

## 📖 **Prochaines étapes**

Après avoir terminé cette session :

1. **Tâche 1.3** : Créer le `backend/pom.xml`
2. **Tâche 1.5** : Créer le `docker-compose.yml`
3. **Tâche 1.6** : Configurer Spring Boot
4. **Tâche 2** : Configuration de la base de données

## 💡 **Conseils**

- **Commencez petit** : une étape à la fois
- **Testez régulièrement** : après chaque modification
- **Utilisez Git** : pour sauvegarder vos progrès
- **Documentez** : vos décisions et modifications
- **Vérifiez** que le frontend fonctionne depuis le nouveau dossier

## 🔄 **Commandes de déplacement (PowerShell)**

Si vous utilisez PowerShell, utilisez ces commandes :

```powershell
# Créer le dossier frontend
New-Item -ItemType Directory -Name "frontend"

# Déplacer les fichiers
Move-Item src frontend/
Move-Item package.json frontend/
Move-Item package-lock.json frontend/
Move-Item vite.config.ts frontend/
Move-Item tsconfig.json frontend/
Move-Item tsconfig.app.json frontend/
Move-Item tsconfig.node.json frontend/
Move-Item eslint.config.js frontend/
Move-Item index.html frontend/
Move-Item public frontend/
```

---

**Prêt à commencer ?** 🚀

Commencez par l'**Étape 1** et réorganisez votre projet dans la nouvelle structure !
