# Correction de l'erreur Ollama - "model 'llama3:latest' not found"

## Problème identifié

L'erreur suivante se produisait lors de l'analyse IA :

```
Error: Image analysis failed: 404 Not Found: "{"error":"model 'llama3:latest' not found"}"
```

## Causes identifiées

1. **Configuration manquante** : Aucune configuration Ollama dans `application.properties`
2. **Modèle non installé** : Le modèle `llama3.2:1b` n'était pas installé dans Ollama
3. **Gestion d'erreur insuffisante** : Pas de fallback quand Ollama n'est pas disponible
4. **Messages d'erreur peu informatifs** : L'utilisateur ne savait pas comment résoudre le problème

## Solutions appliquées

### 1. Configuration Ollama ajoutée

**Fichier : `backend/src/main/resources/application.properties`**

```properties
# Configuration Ollama
ollama.url=http://localhost:11434/api/generate
ollama.model=llama3.2:1b
ollama.timeout=120000
```

### 2. Amélioration de la gestion d'erreurs

**Fichier : `backend/src/main/java/com/vision/app/service/OllamaService.java`**

- ✅ **Vérification de disponibilité** : Test de connexion avant utilisation
- ✅ **Gestion des erreurs de modèle** : Détection spécifique des erreurs "model not found"
- ✅ **Mode fallback** : Retour d'un résultat mock quand Ollama n'est pas disponible
- ✅ **Messages d'erreur informatifs** : Instructions claires pour installer le modèle

### 3. Fonctionnalités ajoutées

#### Vérification de disponibilité

```java
private boolean isOllamaAvailable() {
    // Test de connexion avec timeout court
    // Retourne true si Ollama répond correctement
}
```

#### Mode fallback

```java
private OllamaResult createMockResult(String prompt) {
    // Retourne un résultat simulé avec instructions d'installation
    // Inclut des métadonnées réalistes
}
```

#### Gestion des erreurs de modèle

```java
if (errorMessage.contains("model") && errorMessage.contains("not found")) {
    return createErrorResult("Modèle Ollama non trouvé. Veuillez installer le modèle " + model + " avec: ollama pull " + model);
}
```

### 4. Scripts d'installation et de test

#### Script d'installation Ollama

- **Fichier : `install_ollama_windows.ps1`**
- Installation automatique d'Ollama via winget
- Installation du modèle configuré
- Test de fonctionnement

#### Script de test

- **Fichier : `test_ollama_fix.ps1`**
- Test de compilation et démarrage
- Test des endpoints de santé
- Test de l'analyse IA avec fallback

## Comportement après correction

### Si Ollama est installé et configuré

- ✅ Analyse IA réelle avec le modèle configuré
- ✅ Métadonnées de performance réelles
- ✅ Gestion des erreurs spécifiques

### Si Ollama n'est pas disponible

- ✅ Retour d'un résultat mock informatif
- ✅ Instructions d'installation claires
- ✅ Application continue de fonctionner
- ✅ Pas d'erreur bloquante

### Messages d'erreur améliorés

- **Modèle non trouvé** : "Modèle Ollama non trouvé. Veuillez installer le modèle llama3.2:1b avec: ollama pull llama3.2:1b"
- **Ollama non disponible** : Résultat mock avec instructions d'installation
- **Erreurs réseau** : Messages d'erreur spécifiques selon le type d'erreur

## Configuration recommandée

### 1. Installer Ollama

```bash
# Windows (via winget)
winget install Ollama.Ollama

# Ou télécharger depuis https://ollama.ai/
```

### 2. Installer le modèle

```bash
ollama pull llama3.2:1b
```

### 3. Démarrer Ollama

```bash
ollama serve
```

### 4. Vérifier l'installation

```bash
ollama list
```

## Fichiers modifiés

- `backend/src/main/resources/application.properties` - Configuration Ollama
- `backend/src/main/java/com/vision/app/service/OllamaService.java` - Gestion d'erreurs et fallback
- `install_ollama_windows.ps1` - Script d'installation (nouveau)
- `test_ollama_fix.ps1` - Script de test (nouveau)

## Vérification

Pour vérifier que la correction fonctionne :

1. **Sans Ollama** : L'application doit retourner un résultat mock
2. **Avec Ollama non configuré** : Message d'erreur informatif
3. **Avec Ollama configuré** : Analyse IA réelle

## Notes importantes

- L'application fonctionne maintenant même sans Ollama
- Les utilisateurs reçoivent des instructions claires pour installer Ollama
- Le mode fallback permet de tester l'interface sans dépendances externes
- La configuration est flexible et peut être modifiée dans `application.properties`
