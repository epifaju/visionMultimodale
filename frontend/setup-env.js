// Script de configuration automatique de l'environnement
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Configuration API par défaut
VITE_API_URL=http://localhost:8080/api

# Mode de connexion (true = connexion directe, false = proxy Vite)
VITE_USE_DIRECT_CONNECTION=false

# Configuration CORS
VITE_CORS_ENABLED=true
`;

const envPath = path.join(__dirname, ".env");

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log("✅ Fichier .env créé avec la configuration par défaut");
} else {
  console.log("ℹ️ Fichier .env existe déjà");
}
