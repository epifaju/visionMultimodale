# 🔧 Guide de Dépannage - Vision Multimodale

## 🚨 Problèmes Courants et Solutions

### 1. **Problème de Connexion**

#### Symptômes :
- Erreur "Impossible de se connecter au serveur"
- Erreur 401 (Unauthorized)
- Erreur CORS dans la console

#### Solutions :

**A. Vérifier que le backend est démarré :**
```bash
cd backend
mvn spring-boot:run
```

**B. Vérifier les logs du backend :**
- Cherchez les erreurs dans la console
- Vérifiez que la base de données PostgreSQL est accessible

**C. Tester la connectivité :**
```bash
curl http://localhost:8080/api/documents/ping
```

### 2. **Problème d'Upload de Fichiers**

#### Symptômes :
- Erreur "Network Error"
- Fichier non traité
- Timeout lors de l'upload

#### Solutions :

**A. Vérifier la taille du fichier :**
- Maximum : 50MB
- Formats supportés : PDF, JPEG, PNG, TIFF

**B. Vérifier les services backend :**
```bash
curl http://localhost:8080/api/documents/status
```

**C. Tester l'upload simple :**
```bash
curl -X POST -F "file=@test.pdf" http://localhost:8080/api/documents/test-upload
```

### 3. **Problème d'Authentification**

#### Symptômes :
- Erreur "Invalid credentials"
- Token expiré
- Redirection vers login

#### Solutions :

**A. Utiliser les identifiants par défaut :**
- Username : `admin`
- Password : `admin123`

**B. Vérifier le token JWT :**
- Ouvrir les DevTools (F12)
- Onglet Application > Local Storage
- Vérifier la présence de `authToken`

**C. Nettoyer le cache :**
```javascript
localStorage.removeItem('authToken');
localStorage.clear();
```

### 4. **Problème de Base de Données**

#### Symptômes :
- Erreur de connexion à PostgreSQL
- Tables non trouvées
- Erreur 500 lors de l'authentification

#### Solutions :

**A. Vérifier PostgreSQL :**
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Se connecter à la base
psql -h localhost -p 5434 -U vision -d vision
```

**B. Recréer la base de données :**
```sql
DROP DATABASE IF EXISTS vision;
CREATE DATABASE vision;
GRANT ALL PRIVILEGES ON DATABASE vision TO vision;
```

**C. Vérifier la configuration :**
- Fichier : `backend/src/main/resources/application.properties`
- URL : `jdbc:postgresql://localhost:5434/vision`
- Username : `vision`
- Password : `vision`

### 5. **Problème de Services Externes**

#### Symptômes :
- OCR ne fonctionne pas
- Analyse IA échoue
- Erreur "Service not available"

#### Solutions :

**A. Vérifier Tesseract (OCR) :**
```bash
tesseract --version
```

**B. Vérifier Ollama (IA) :**
```bash
ollama list
ollama pull llama2
```

**C. Vérifier les dépendances Java :**
```bash
cd backend
mvn dependency:tree
```

## 🛠️ Commandes de Diagnostic

### Test Complet de l'Application
```bash
# Exécuter le script de test
./test_fixes.ps1
```

### Vérification des Ports
```bash
# Vérifier que les ports sont libres
netstat -an | findstr :8080
netstat -an | findstr :5173
netstat -an | findstr :5434
```

### Logs Détaillés
```bash
# Backend avec logs détaillés
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--logging.level.com.vision.app=DEBUG"

# Frontend avec logs détaillés
cd frontend
npm run dev -- --verbose
```

## 🔍 Debugging Avancé

### 1. **Activer les Logs Détaillés**

**Backend (application.properties) :**
```properties
logging.level.com.vision.app=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
```

**Frontend (Console DevTools) :**
```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'true');
```

### 2. **Intercepter les Requêtes**

**Avec DevTools :**
1. Ouvrir F12
2. Onglet Network
3. Filtrer par "XHR" ou "Fetch"
4. Reproduire le problème
5. Analyser les requêtes/réponses

### 3. **Tester les Endpoints Individuellement**

```bash
# Test ping
curl http://localhost:8080/api/documents/ping

# Test auth
curl -X POST http://localhost:8080/api/auth/test-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test upload
curl -X POST -F "file=@test.pdf" \
  http://localhost:8080/api/documents/test-upload
```

## 📞 Support

### Informations à Fournir en Cas de Problème :

1. **Version du système :**
   - OS (Windows/Linux/Mac)
   - Version de Java
   - Version de Node.js
   - Version de PostgreSQL

2. **Logs d'erreur :**
   - Console du navigateur (F12)
   - Logs du backend
   - Logs de la base de données

3. **Étapes de reproduction :**
   - Actions effectuées
   - Fichiers utilisés
   - Messages d'erreur exacts

4. **Configuration :**
   - Fichiers de configuration modifiés
   - Variables d'environnement
   - Ports utilisés

### Commandes de Récupération Rapide :

```bash
# Redémarrer tout
cd backend && mvn spring-boot:run &
cd frontend && npm run dev &

# Nettoyer et reconstruire
cd backend && mvn clean install
cd frontend && npm run build

# Réinitialiser la base de données
psql -h localhost -p 5434 -U vision -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

## ✅ Checklist de Vérification

- [ ] Backend Spring Boot démarré sur le port 8080
- [ ] Frontend React démarré sur le port 5173
- [ ] PostgreSQL accessible sur le port 5434
- [ ] Base de données `vision` créée
- [ ] Utilisateur `admin` créé avec mot de passe `admin123`
- [ ] Services externes (Tesseract, Ollama) installés
- [ ] Pas d'erreurs dans les logs
- [ ] Test de connectivité réussi
- [ ] Test d'authentification réussi
- [ ] Test d'upload réussi
