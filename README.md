# 🚀 Vision Multimodale - Application de Vision par Ordinateur Assistée par IA

## 📋 Description du Projet

Application **full-stack** permettant :

- Lecture et extraction d'informations depuis **PDF** et **images**
- OCR multilingue via **Tesseract (Tess4J)**
- Lecture de **codes-barres** et **QR codes** via **ZXing**
- Extraction de la MRZ pour **passeports** et **CNI**
- Analyse des données via **Ollama** (LLM)
- Authentification **JWT** avec rôles
- Journalisation complète via **Audit Logging**

## 🏗️ Architecture

| Composant           | Technologie                   | Statut        |
| ------------------- | ----------------------------- | ------------- |
| **Backend**         | Spring Boot 3.3+ (Java 17)    | ✅ Configuré  |
| **Frontend**        | React 18 + Vite + TailwindCSS | ✅ Configuré  |
| **Base de données** | PostgreSQL 15                 | 🐳 Docker     |
| **OCR**             | Tesseract (Tess4J)            | 📦 Dépendance |
| **PDF Parsing**     | Apache PDFBox                 | 📦 Dépendance |
| **Codes-barres**    | ZXing                         | 📦 Dépendance |
| **LLM**             | Ollama                        | 🐳 Docker     |
| **Auth**            | Spring Security + JWT         | 📦 Dépendance |
| **Conteneurs**      | Docker + Docker Compose       | ✅ Configuré  |

## 🚀 Première Étape Implémentée

### ✅ **Sous-tâche 1.1 - Structure Frontend Réorganisée**

- [x] Projet Vite existant réorganisé dans le dossier `frontend/`
- [x] Dossiers de structure créés : `components/`, `pages/`, `services/`, `utils/`, `hooks/`, `types/`
- [x] TailwindCSS installé et configuré
- [x] Dépendances React ajoutées : `@headlessui/react`, `@heroicons/react`, `axios`, `react-router-dom`, `zustand`
- [x] Projet frontend compile et fonctionne correctement

### ✅ **Sous-tâche 1.2 - Structure Backend Spring Boot**

- [x] Arborescence Maven standard créée
- [x] Dossiers organisés : `controller/`, `service/`, `repository/`, `model/`, `config/`
- [x] Structure respecte les conventions Maven

### ✅ **Sous-tâche 1.3 - Configuration Maven (pom.xml)**

- [x] Spring Boot 3.3+ configuré
- [x] Java 17 configuré (adapté à l'environnement)
- [x] Toutes les dépendances nécessaires ajoutées
- [x] Projet compile et se package sans erreurs

### ✅ **Sous-tâche 1.4 - Configuration Frontend**

- [x] TailwindCSS configuré avec PostCSS
- [x] Dépendances UI et utilitaires installées
- [x] Configuration PostCSS corrigée

### ✅ **Sous-tâche 1.5 - Docker Compose**

- [x] Services configurés : PostgreSQL, Ollama, Backend, Frontend
- [x] Volumes et réseaux configurés
- [x] Variables d'environnement définies

### ✅ **Sous-tâche 1.6 - Configuration Spring Boot**

- [x] Fichier `application.properties` créé
- [x] Configuration base de données, JWT, uploads, logging
- [x] Classe principale Spring Boot créée

## 🛠️ Installation et Démarrage

### **Prérequis**

- Java 17+
- Node.js 18+
- Docker et Docker Compose
- Maven 3.6+

### **Installation des Dépendances**

```bash
# Frontend
cd frontend
npm install

# Backend (dépendances gérées par Maven)
cd backend
mvn clean compile
```

### **Démarrage avec Docker Compose**

```bash
# Démarrer tous les services
docker-compose up --build

# Ou utiliser le Makefile
make start
```

### **Commandes Utiles**

```bash
# Vérifier le statut des services
make status

# Voir les logs
make logs

# Arrêter l'application
make stop

# Nettoyer
make clean
```

## 📁 Structure du Projet

```
visionMultimodale/
├── frontend/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   ├── utils/          # Utilitaires
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── types/          # Types TypeScript
│   │   └── assets/         # Assets
│   ├── package.json        # Dépendances Node.js
│   ├── tailwind.config.js  # Configuration TailwindCSS
│   ├── postcss.config.js   # Configuration PostCSS
│   └── Dockerfile          # Image Docker frontend
├── backend/                 # Backend Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/vision/app/
│   │   │   │       ├── controller/  # Contrôleurs REST
│   │   │   │       ├── service/     # Services métier
│   │   │   │       ├── repository/  # Accès aux données
│   │   │   │       ├── model/       # Entités JPA
│   │   │   │       └── config/      # Configuration
│   │   │   └── resources/           # Fichiers de config
│   │   └── test/                    # Tests
│   ├── pom.xml             # Configuration Maven
│   ├── application.properties # Configuration Spring Boot
│   └── Dockerfile          # Image Docker backend
├── docker-compose.yml      # Orchestration des services
├── Makefile                # Commandes de développement
└── README.md               # Ce fichier
```

## 🔧 Configuration

### **Variables d'Environnement Backend**

- `SPRING_DATASOURCE_URL`: URL de la base de données
- `SPRING_DATASOURCE_USERNAME`: Nom d'utilisateur PostgreSQL
- `SPRING_DATASOURCE_PASSWORD`: Mot de passe PostgreSQL
- `OLLAMA_URL`: URL du service Ollama
- `JWT_SECRET`: Clé secrète pour les tokens JWT

### **Variables d'Environnement Frontend**

- `VITE_API_URL`: URL de l'API backend

## 📊 Prochaines Étapes

### **Tâche 2: Configuration de la Base de Données**

- [ ] Créer les entités JPA (User, Document, AuditLog)
- [ ] Configurer les repositories
- [ ] Créer les migrations de base de données

### **Tâche 3: Authentification et Sécurité**

- [ ] Implémenter Spring Security
- [ ] Créer les services JWT
- [ ] Configurer les contrôleurs d'authentification

### **Tâche 4: Services d'Extraction**

- [ ] Service OCR avec Tesseract
- [ ] Service de lecture PDF avec PDFBox
- [ ] Service de lecture codes-barres avec ZXing

### **Tâche 5: Intégration Ollama**

- [ ] Service d'analyse LLM
- [ ] API d'analyse de documents

## 🧪 Tests

### **Frontend**

```bash
cd frontend
npm run test
npm run lint
```

### **Backend**

```bash
cd backend
mvn test
```

## 🐛 Dépannage

### **Problème de Compilation Java**

- Vérifier que Java 17+ est installé : `java -version`
- Vérifier que Maven est installé : `mvn --version`

### **Problème de Dépendances Frontend**

- Supprimer `node_modules/` et `package-lock.json`
- Réinstaller : `npm install`

### **Problème Docker**

- Vérifier que Docker est démarré
- Nettoyer les conteneurs : `docker-compose down -v`

## 📚 Ressources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**🎯 Objectif de la première session : ACHIEVÉ !** ✅

La structure de base du projet full-stack est maintenant en place et fonctionnelle. Le frontend et le backend peuvent être compilés et démarrés avec Docker Compose.
