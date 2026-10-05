# Mémoire du projet — Documents Tunisie

Fichier lu automatiquement par Claude Code au début de chaque session dans ce dossier.
**Dépôt PUBLIC : rien de personnel ni de secret ici, et jamais le nom d'un site concurrent.**
À tenir à jour à chaque modification importante (avec README et GUIDE).

## Qui et comment travailler
- Propriétaire : Ahmed (compte GitHub `Ah6259`), débutant. Expliquer simplement, **en français**.
- **Demander l'accord d'Ahmed avant de modifier le site** (sauf s'il dit « fais »). **Demander avant d'installer un logiciel.**
- Appliquer les **règles communes à tous ses sites** et la **consigne sécurité commune** (fichiers du dossier parent des projets).
- L'étude privée (concurrents, popularité, 55 documents) est hors de ce dépôt : `..\etude et plan.md`.
  Les preuves des conditions d'utilisation et des licences photos : `..\preuves conditions d'utilisation\` (jamais publiées).

## Le site
- Adresse prévue : https://ah6259.github.io/documents-tunisie/ — dépôt `Ah6259/documents-tunisie` (GitHub Pages, main).
- Couleur principale bordeaux `#8C2B3A`. Français + arabe (bouton, ou `?lang=ar`). Mobile d'abord.
- 15 modèles à remplir (PDF par l'impression du navigateur, **rien n'est envoyé**) + 4 grands contrats en « étapes seulement »
  (vente voiture, vente moto, location maison, bail commercial) : **modèle seulement après relecture par un avocat**.
- Données : `assets/documents.js`. Pages fabriquées par `node tools/generer.mjs` (ne pas éditer les HTML à la main).
- Date unique « vérifié le » : `MAJ` dans `assets/page.js`. Ne la changer qu'après une vraie relecture des sources.
- Ce qui n'est pas confirmé par un texte officiel va dans `averifier` (affiché « À vérifier »), jamais inventé.
- Sources citées : **officielles seulement** (`SOURCES` dans documents.js), liens en `rel="noopener noreferrer"`.
- Photos : Wikimedia Commons, licence libre vérifiée, crédit sur chaque bandeau + page À propos, ≤ 150 Ko,
  pas de visage, pas d'emblème de l'État. Preuves dans `..\preuves conditions d'utilisation\<date>\photos\`.
- Image d'aperçu : `assets/og-image-v2.jpg` (modèle `tools/og.html`). Si on la change : **nouveau nom de fichier**.
  Toujours en **JPEG < 250 Ko** (sinon WhatsApp n'affiche qu'une petite vignette ; le test le vérifie). L'ancien `og-image-v1.png` n'est plus utilisé.

## Sécurité (consigne commune du 05/10/2026)
- `robots.txt` : moteurs de recherche autorisés, robots d'IA et aspirateurs interdits ; `<meta name="robots" content="noai, noimageai">`.
- Statistiques **GoatCounter** (anonymes, sans cookies, 05/10/2026) sur toutes les pages : compteur partagé
  `https://prix-eaux-tunisie.goatcounter.com` (constante `COMPTEUR` dans generer.mjs ; pages séparées par chemin). Mentionné dans À propos.
- Installation sur le téléphone : `manifest.webmanifest` avec `"id": "/documents-tunisie/"` (UNIQUE : tous les sites d'Ahmed
  partagent l'origine ah6259.github.io ; sans id, Chrome disait « déjà installée »), icônes `assets/icons/` (192, 512, maskable,
  apple-touch-icon 180) tirées de `assets/logo.svg`. Liens dans le gabarit ; vérifié par le test.
- CSP en balise meta (scripts du site + gc.zgo.at, polices Google ; envoi au compteur GoatCounter) : **aucun script en ligne, aucun `style="…"`, aucun `onclick`**.
- Anti-copie légère (page.js + `.protege`) : modèles et étapes non sélectionnables, source ajoutée au texte copié ;
  les champs du formulaire restent libres. Anti-cadre (iframe d'un autre site).

## Tests (obligatoires avant toute publication)
- `node tools/generer.mjs` puis `node tools/test_site.mjs` (≈ 760 vérifications) → **TOUT PASSE**.
- `node tools/sabotage.mjs` : 17 sabotages, tous doivent être attrapés. `node tools/test_robot.mjs` : pannes du robot.
- Captures : serveur `python -m http.server 8931 --bind 127.0.0.1` dans `site/`, puis `sh tools/captures.sh`.
- jsdom : `npm install --no-save --no-package-lock jsdom` (une fois par PC).

## Robots
- `surveillance.yml` (1er du mois, TZ Africa/Tunis, groupe `robot`) : sources officielles + battement de cœur ; issue si panne.
- `tests.yml` : à chaque push.

## Reste à faire / idées
- Relecture des 4 grands contrats par un avocat, puis modèles.
- Pages « explication seulement » (certificat de résidence, non gage, TEJ…). Autres documents de l'étude (55).
