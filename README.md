# ATS Downloader

Application automatisée pour télécharger les cours depuis Moodle, Google Drive et d'autres sources pour les étudiants ATS.

## 📋 Fonctionnalités

- **Téléchargement automatique** des cours de :
  - Physique (depuis alexandrediet.net)
  - Mathématiques (depuis Google Drive)
  - Génie Électrique (depuis Moodle)
  - Génie Mécanique (depuis Moodle)
- **API REST** pour accéder aux fichiers téléchargés
- **Index JSON** des fichiers pour faciliter l'intégration avec d'autres applications
- **Serveur Express** pour servir les fichiers statiquement

## 🚀 Installation

### Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Un compte MonBureauNumérique
- Une clé API Google Drive

### Étapes d'installation

1. **Cloner le repository**

```bash
git clone https://github.com/chokinyan/ATSfinalBoss.git
cd ATSfinalBoss-1
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

```bash
cp .env.example .env
```

Puis éditer le fichier `.env` avec vos identifiants :

- `GOOGLE_DRIVE_API_KEY` : Votre clé API Google Drive ([Comment l&#39;obtenir](https://console.cloud.google.com/apis/credentials))
- `MBN_USERNAME` : Votre nom d'utilisateur MonBureauNumérique
- `MBN_PASSWORD` : Votre mot de passe MonBureauNumérique
- `MBN_JOUR_ANNIV`, `MBN_MOIS_ANNIV`, `MBN_ANNEE_ANNIV` : Votre date de naissance (pour l'authentification)
- `PORT` : Port du serveur (optionnel, défaut: 3000)

4. **Compiler le projet**

```bash
npm run build
```

## 📖 Utilisation

### Lancer le programme

Démarre le server ( conseil attendre un moment pour le premier téléchargement des fichier ) :

```bash
npm start
```

Cette commande va :

1. Vérifier la connexion internet
2. Télécharger les cours de physique et mathématiques
3. Se connecter à Moodle via MonBureauNumérique
4. Télécharger les cours de génie électrique et mécanique
5. Générer un index JSON de tous les fichiers téléchargés
6. Lancer le server

Les fichiers sont téléchargés dans le dossier `download/`.

#### Endpoints disponibles

##### Informations générales

- `GET /` - Liste des endpoints disponibles

##### Index des cours

- `GET /api/index` - Retourne l'index JSON complet de tous les cours
- `GET /elec/liste_cours` - Liste des cours de génie électrique
- `GET /math/liste_cours` - Liste des cours de mathématiques
- `GET /mecha/liste_cours` - Liste des cours de génie mécanique
- `GET /physique/liste_cours` - Liste des cours de physique

##### Fichiers statiques

- `GET /download/{path}` - Accéder aux fichiers via `/download/`
- `GET /elec/{path}` - Accéder directement aux fichiers de génie électrique
- `GET /math/{path}` - Accéder directement aux fichiers de mathématiques
- `GET /mecha/{path}` - Accéder directement aux fichiers de génie mécanique
- `GET /physique/{path}` - Accéder directement aux fichiers de physique

**Exemple** :

```bash
# Obtenir l'index complet
curl http://localhost:3000/api/index

# Télécharger un fichier spécifique
curl http://localhost:3000/elec/La%20chaîne%20d'information/01_TD_CodageInformation.pdf -o fichier.pdf
```

## 🛠️ Scripts disponibles

| Commande                 | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `npm run build`        | Compile le TypeScript en JavaScript                 |
| `npm start`            | Compile et lance le téléchargement des cours      |
| `npm run start:server` | Compile et démarre le serveur API                  |
| `npm run dev`          | Mode développement avec watch (pour le downloader) |
| `npm run typecheck`    | Vérifie les types TypeScript sans compiler         |
| `npm run lint`         | Analyse le code avec ESLint                         |
| `npm run lint:fix`     | Corrige automatiquement les problèmes ESLint       |
| `npm run format`       | Formate le code avec Prettier                       |
| `npm run format:check` | Vérifie le formatage sans modifier les fichiers    |
| `npm run quality`      | Lance typecheck + lint + format:check               |
| `npm run fix`          | Lance lint:fix + format                             |

## 📁 Structure du projet

```
ATSfinalBoss-1/
├── src/
│   ├── auth/
│   │   └── connexionMbn.ts      # Authentification MonBureauNumérique
│   ├── courses/
│   │   ├── genieElectrique.ts   # Téléchargement cours électrique
│   │   ├── genieMecanique.ts    # Téléchargement cours mécanique
│   │   ├── math.ts              # Téléchargement cours maths
│   │   └── physique.ts          # Téléchargement cours physique
│   ├── types/
│   │   ├── *.d.ts               # Définitions de types TypeScript
│   │   └── index.d.ts           # Export des types
│   ├── utils/
│   │   ├── buildDownloadIndex.ts # Génération de l'index JSON
│   │   ├── sanitizeFileName.ts   # Nettoyage des noms de fichiers
│   │   └── sleep.ts              # Fonction utilitaire sleep
│   ├── index.ts                  # Point d'entrée du downloader
│   └── server.ts                 # Serveur Express API
├── download/                     # Fichiers téléchargés
│   ├── index.json               # Index généré automatiquement
│   ├── elec/                    # Cours de génie électrique
│   ├── math/                    # Cours de mathématiques
│   ├── mecha/                   # Cours de génie mécanique
│   └── physique/                # Cours de physique
├── .env                          # Variables d'environnement (à créer)
├── .env.example                  # Exemple de variables d'environnement
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration avancée

### Personnaliser les timeouts

Les timeouts sont définis dans les fichiers de téléchargement :

- Connexion Moodle : 30s (`connexionMbn.ts`)
- Navigation pages : 50s (`genieElectrique.ts`, `genieMecanique.ts`)
- Attente téléchargement : 30s (`genieMecanique.ts`)

### Modifier les sources

Les sources de cours sont configurées dans :

- **Physique** : `https://alexandrediet.net/?p=223`
- **Maths** : Google Drive (IDs de dossiers dans `courses/math.ts`)
- **Électrique/Mécanique** : Moodle (URLs dans les fichiers respectifs)

## ⚠️ Notes importantes

1. **Sécurité** : Ne JAMAIS committer le fichier `.env` contenant vos identifiants
2. **Permissions** : L'application nécessite l'accès à Moodle et Google Drive
3. **Téléchargement** : Le premier téléchargement peut prendre plusieurs minutes selon votre connexion
4. **Espace disque** : Prévoir au moins 20 Go d'espace pour les cours

## 🐛 Problèmes courants

### "No internet connection detected"

- Vérifiez votre connexion internet
- Vérifiez que vous n'êtes pas derrière un proxy qui bloque les requêtes

### "Error building index"

- Assurez-vous que le dossier `download/` existe
- Vérifiez les permissions d'écriture

### Erreurs d'authentification Moodle

- Vérifiez vos identifiants dans `.env`
- Vérifiez votre date de naissance
- Essayez de vous connecter manuellement pour vérifier que votre compte fonctionne

### Erreurs Google Drive API

- Vérifiez que votre clé API est valide
- Vérifiez que l'API Google Drive est activée dans votre projet Google Cloud
- Vérifiez les quotas de votre projet

## 📝 Développement

### Ajouter un nouveau cours

1. Créer un nouveau fichier dans `src/courses/`
2. Définir les types dans `src/types/`
3. Implémenter la logique de téléchargement
4. Importer et appeler dans `src/index.ts`
5. Ajouter la route dans `src/server.ts`

### Tests

```bash
npm run typecheck  # Vérifier les types
npm run lint       # Vérifier la qualité du code
npm run format     # Formater le code
```

## 📄 Licence

MIT

## 👤 Auteur

**chokinyan**

---

**Note** : Ce projet est conçu pour un usage personnel dans le cadre des études ATS. Respectez les droits d'auteur des contenus téléchargés.
