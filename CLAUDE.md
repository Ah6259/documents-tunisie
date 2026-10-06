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
- **Le PDF ne porte AUCUNE mention du site** (décision d'Ahmed 05/10/2026 : c'est le document de la personne, on aide seulement à l'écrire ; l'avertissement « modèle indicatif / relisez » reste sur la page web). Test + sabotage le vérifient.
- 16 modèles à remplir (PDF par l'impression du navigateur, **rien n'est envoyé**) + 4 grands contrats en « étapes seulement »
  (vente voiture, vente moto, location maison, bail commercial) : **modèle seulement après relecture par un avocat**
  + 5 « démarches expliquées » (`GUIDES`, explication seulement, jamais de modèle, 05/10/2026) : divorce, mariage,
  contrat de travail CDI/CDD (loi n° 2025-9), CIVP/Karama/Service civil (décret n° 2019-542, ANETI), prêt d'honneur (06/10/2026).
- Données : `assets/documents.js`. Pages fabriquées par `node tools/generer.mjs` (ne pas éditer les HTML à la main).
- Date unique « vérifié le » : `MAJ` dans `assets/page.js`. Ne la changer qu'après une vraie relecture des sources.
- Ce qui n'est pas confirmé par un texte officiel va dans `averifier` (affiché « À vérifier »), jamais inventé.
- Sources citées : **officielles seulement** (`SOURCES` dans documents.js), liens en `rel="noopener noreferrer"`.
- Photos : Wikimedia Commons, licence libre vérifiée, crédit sur chaque bandeau + page À propos, ≤ 150 Ko,
  pas de visage, pas d'emblème de l'État. Preuves dans `..\preuves conditions d'utilisation\<date>\photos\`.
- Image d'aperçu : `assets/og-image-v3.jpg` (modèle `tools/og.html`, logo plume du 05/10/2026). Si on la change : **nouveau nom de fichier**.
  Toujours en **JPEG < 250 Ko** (sinon WhatsApp n'affiche qu'une petite vignette ; le test le vérifie). Les anciens `og-image-v1.png` et `og-image-v2.jpg` ne sont plus utilisés.

## Sécurité (consigne commune du 05/10/2026)
- `robots.txt` : moteurs de recherche autorisés, robots d'IA et aspirateurs interdits ; `<meta name="robots" content="noai, noimageai">`.
- Statistiques **GoatCounter** (anonymes, sans cookies, 05/10/2026) sur toutes les pages : compteur partagé
  `https://prix-eaux-tunisie.goatcounter.com` (constante `COMPTEUR` dans generer.mjs ; pages séparées par chemin). Mentionné dans À propos.
  Événement `pdf-<slug>` envoyé au clic sur « Télécharger le PDF » (modele.js) : seulement le nom du modèle, jamais le contenu → classement des documents les plus demandés (onglet Events / chemins pdf-… dans GoatCounter).
- Installation sur le téléphone : `manifest.webmanifest` avec `"id": "/documents-tunisie/"` (UNIQUE : tous les sites d'Ahmed
  partagent l'origine ah6259.github.io ; sans id, Chrome disait « déjà installée »), icônes `assets/icons/` (192, 512, maskable,
  apple-touch-icon 180) tirées de `assets/logo.svg`. Liens dans le gabarit ; vérifié par le test.
- **Service worker** (05/10/2026, installation complète Chrome/Android + iPhone) : `sw.js` à la racine, portée `/documents-tunisie/`,
  enregistré à la fin de `assets/page.js` (https seulement, try/catch). **Réseau d'abord** pour les pages HTML et les données (le cache ne sert
  que hors connexion ; sinon page « Hors connexion » FR+AR) ; CSS/JS/images avec `?v=` : cache puis mise à jour en arrière-plan.
  Jamais en cache : non-GET, autres origines, autres sites d'Ahmed. Caches `documents-tunisie-<CACHE_VERSION>` (on ne supprime QUE les nôtres).
  Vieille version bloquée sur un téléphone → changer `CACHE_VERSION`. Meta iPhone (`apple-mobile-web-app-capable`, `-title`
  « Documents TN ») dans le gabarit generer.mjs. Test : `node tools/test_sw.mjs` (faux navigateur ; accepte un dossier en argument).
- CSP en balise meta (scripts du site + gc.zgo.at, polices Google ; envoi au compteur GoatCounter) : **aucun script en ligne, aucun `style="…"`, aucun `onclick`**.
- Anti-copie légère (page.js + `.protege`) : modèles et étapes non sélectionnables, source ajoutée au texte copié ;
  les champs du formulaire restent libres. Anti-cadre (iframe d'un autre site).

## Votre avis (05/10/2026, règle d'Ahmed : sur chacun de ses sites)
- Section `#avis` en bas de l'accueil (constante `AVIS` dans generer.mjs : carte FR + AR, note 😀🙂😐🙁 facultative, message
  obligatoire ≤ 1000 caractères, e-mail facultatif), lien « Votre avis » dans le pied de page (`page.js`).
- `assets/avis.js` (fichier externe, chargé seulement sur l'accueil, compté dans le `?v=`) envoie par `fetch` à
  `https://formspree.io/f/mwlpakqj` (Accept JSON) **seulement au clic**, avec les champs cachés `site` = « Documents Tunisie »,
  `page`, `_subject` et le piège `_gotcha`. CSP (`FORMSPREE` dans generer.mjs) : `connect-src` + `form-action`. Champs
  sélectionnables malgré l'anti-copie ; le service worker laisse passer formspree.io ; mentionné dans À propos (« Vos données »).
- Formspree gratuit = 50 envois/mois pour TOUS les sites (même formulaire). Test : `node tools/test_avis.mjs` (accepte un dossier).

## Tests (obligatoires avant toute publication)
- `node tools/generer.mjs` puis `node tools/test_site.mjs` (≈ 1190 vérifications) → **TOUT PASSE**.
- `node tools/sabotage.mjs` : 24 sabotages, tous doivent être attrapés. `node tools/test_robot.mjs` : pannes du robot.
- `node tools/test_sw.mjs` : service worker (réseau d'abord, exclusions, meta iPhone).
- `node tools/test_avis.mjs` : Votre avis (section, lien du pied de page sur toutes les pages, CSP, envoi simulé, refus si vide).
- Captures : serveur `python -m http.server 8931 --bind 127.0.0.1` dans `site/`, puis `sh tools/captures.sh`.
- jsdom : `npm install --no-save --no-package-lock jsdom` (une fois par PC).

## Robots
- `surveillance.yml` (1er du mois, TZ Africa/Tunis, groupe `robot`) : sources officielles + battement de cœur ; issue si panne.
- `tests.yml` : à chaque push.

## Reste à faire / idées
- Relecture des 4 grands contrats par un avocat, puis modèles.
- Autres pages « explication seulement » (`GUIDES`, encart « Explication seulement », section « Démarches expliquées » de l'accueil) : certificat de résidence, non gage, TEJ… Autres documents de l'étude (55).

## Mise à jour du 05/10/2026 (soir)
- **Icône (famille commune des 5 sites)** : un seul symbole en aplats 2-3 tons, accent doré `#F2B33D`, sans texte ni brillance (règle d'Ahmed : jamais d'effet « image IA » ni de clip-art). Ce site : **plume de stylo**. Source = `assets/logo.svg` ; PNG 192/512 = dessin arrondi, maskable 512 et iPhone 180 = même dessin sur carré plein, symbole à 78 %. Générateur (hors dépôt) : `_claude code project/icones des sites - generateur.py`. Changer l'icône → renouveler `CACHE_VERSION` de `sw.js`.
- **« Gratuit » mis en avant** (titres Google, descriptions, aperçus de partage, manifeste), seulement là où c'est vrai. La future partie payante n'est jamais annoncée à l'avance (décision d'Ahmed).
- **Aperçus WhatsApp** : tous les sites sont réglés pareil (1200 × 630, JPEG léger). WhatsApp sur PC fait de petites vignettes : envoyer les liens depuis le téléphone (ou transférer un message préparé sur le téléphone).
- **Règle d'Ahmed : tout tourne sur internet (GitHub), sans son PC ni son intervention, « même s'il meurt ».**
- **PDF** : mise en page de lettre administrative (police à empattement, titre détaché, marges A4 25/22 mm, 45 mm pour signer et légaliser) ; aucune mention du site.
- **Statistiques GoatCounter** : événements `pdf-<slug>` (PDF fabriqués) et `recherche-vide/<mot>` (recherche sans résultat, chiffres retirés, une fois par mot) ; annoncés dans À propos et sous la recherche.
- **Robot privé** `Ah6259/documents-tunisie-robot` (dépôt PRIVÉ = dossier `../robot nuit`) : `releve.yml` chaque nuit à 1h07 (relève GoatCounter, clé en secret `GOATCOUNTER_CLE`, compteur **prix-eaux-tunisie** avec x) → `liste des documents demandes.md` ; `controle-matin.yml` à 7h (journal écrit depuis moins de 26 h, pas d'échec signalé, tests du site ; e-mail GitHub sinon).
- **Tâche Claude dans le cloud** `documents-tunisie-nuit` (créée par Ahmed via /schedule, 2h chaque nuit, https://claude.ai/code/routines/trig_01PPNDm6h4qk7N2mtKHJ7tHq) : une nouveauté au plus par nuit ; documents simples publiés seulement si tous les tests passent ; contrats et documents à risque en brouillon (`brouillons/` du dépôt privé) ; compte rendu dans `journal de nuit.md`.
- Contrôle des concurrents étendu (empreintes de mots et de noms de domaine complets ; un nom de rue de Tunis présent dans un crédit photo reste autorisé).
- **Lien vers l'annuaire gratuit « Avocats et notaires Tunisie »** (constante `ANNUAIRE` de generer.mjs, encart `#annuaire` avant les étapes) : 4 grands contrats, 4 démarches expliquées et reconnaissance de dette ; mariage = notaires (عدول الإشهاد) + annuaire des prestataires de mariage. Texte neutre (profession réglementée : jamais « meilleur », pas de classement), jamais dans le PDF (test + 2 sabotages), clic compté par page.js (événements `lien-avocats/<slug>` et `lien-mariage/mariage`).

## Prêt d'honneur (06/10/2026)
- Démarche `pret-d-honneur` + modèle `demande-pret-d-honneur` (textes communs `HONNEUR_*` dans documents.js ; champ `modele` d'un guide = lien vers un modèle, `attention` d'un modèle = encart « Important » avant le formulaire, `motscles` = mots de la recherche). Sources : décret n° 2026-148 (JORT, texte intégral non lu), **circulaire BCT n° 2026-08 lue** (dépôt UNIQUEMENT sur la plateforme en ligne de la banque depuis le 01/10/2026 : une lettre papier n'est pas prise en compte → la lettre sert à préparer), annonce BTS. Liens : annuaire des comptables + calculateur de crédit (événements `lien-comptables/…`, `lien-outils/…`). À revoir quand les banques publient leurs listes de pièces.

## Exemple du document (06/10/2026, demande d'Ahmed)
- Section `#exemple` AVANT « Remplir le modèle » : la lettre remplie avec des données **fictives** (champ `exemple` de chaque modèle : `{ id: valeur | [fr, ar] }` ; sinon `ex` du champ ; sinon libellé), même rendu que le PDF (`feuilleExemple` de modele.js, fabriquée par generer.mjs), FR ou AR selon la langue, étiquette + filigrane « EXEMPLE / مثال », réduite (60 % de l'écran) avec `<details>` « Agrandir l'exemple ». **Nouveau modèle → lui donner un `exemple`** (CIN « 0XXXXXXX », jamais de vraie personne). Jamais imprimée (seul `#impression` l'est), pas d'événement GoatCounter ; tests + 3 sabotages.
