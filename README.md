# Documents Tunisie

Modèles de documents tunisiens **gratuits**, à remplir sur téléphone, en **français et en arabe**, avec les **étapes
officielles** après la signature (légalisation, recette des finances, ATTT…).
Adresse prévue : https://ah6259.github.io/documents-tunisie/ (GitHub Pages, branche `main`).

- **15 modèles à remplir** : formulaire → aperçu → PDF fabriqué **dans le téléphone** (impression du navigateur,
  « Enregistrer au format PDF »). Rien n'est envoyé, aucun compte, aucune bibliothèque externe.
- **4 grands contrats** (vente de voiture, de moto, location de maison, bail commercial) : pages « étapes » seulement ;
  le modèle sera publié **après relecture par un avocat**.
- Toutes les données (textes, champs, étapes, sources) sont dans `assets/documents.js`.
  Les pages HTML sont **fabriquées** par `node tools/generer.mjs` (ne pas les modifier à la main).

## Fichiers
| Fichier | Rôle |
|---|---|
| `assets/documents.js` | les documents : champs, modèles FR/AR, étapes, pièces, FAQ, sources |
| `assets/modele.js` | moteur : formulaire, aperçu, montants en lettres, contrôle, PDF |
| `assets/page.js` | langue, en-tête et pied communs, date `MAJ` (unique), protection anti-copie et anti-cadre |
| `assets/style.css` | présentation (couleur bordeaux), impression A4 |
| `assets/photos/` | photos des bandeaux (Wikimedia Commons, licences libres, `credits.json`) |
| `tools/generer.mjs` | fabrique les pages, le plan du site et le `?v=` (empreinte des fichiers) |
| `tools/test_site.mjs` | test complet (≈ 760 vérifications) — **à lancer après chaque modification** |
| `assets/avis.js`, `tools/test_avis.mjs` | section « Votre avis » de l'accueil (`#avis`, lien dans le pied de page) : envoi **au clic** à Formspree (formulaire `mwlpakqj`, commun à tous les sites d'Ahmed) avec les champs cachés `site` = « Documents Tunisie » et `page` ; son test (envoi simulé) |
| `tools/sabotage.mjs` | prouve que le test attrape les erreurs (17 sabotages) |
| `tools/surveiller_sources.mjs` + `test_robot.mjs` | robot de surveillance des sources officielles et ses scénarios de panne |
| `tools/captures.sh` | captures téléphone 340/390 px, français et arabe (dans `captures/`, ignoré) |

## Modifier le site
1. Changer `assets/documents.js` (ou un autre fichier de `assets/`).
2. `node tools/generer.mjs` (pages + `?v=` mis à jour tout seuls).
3. `node tools/test_site.mjs` → doit afficher **TOUT PASSE** (puis `node tools/test_sw.mjs` et `node tools/test_avis.mjs` : tout vert). Sinon, on ne publie pas.
4. Après une relecture des textes officiels : changer `MAJ` dans `assets/page.js`, puis étapes 2 et 3.

Tous droits réservés (voir LICENSE).

## Plan de continuité (le site doit vivre seul le plus longtemps possible)
| Ce qui tourne seul | Quand | En cas de problème |
|---|---|---|
| `surveillance.yml` : chaque source officielle citée répond-elle encore ? (3 essais, lecture lente) | le 1er de chaque mois | source disparue ou en panne → **alerte** (issue GitHub → email) ; le site n'est jamais modifié |
| Battement de cœur (commit vide) | chaque mois | évite la mise en pause des robots par GitHub (60 jours) |
| `tests.yml` : tous les tests | à chaque modification | email de GitHub en cas d'échec |
| Alerte « fiche âgée » sur le site | si `MAJ` a plus de 12 mois (date du visiteur) | le visiteur voit « information à revérifier » |

**Installation sur le téléphone** : `sw.js` (service worker) = **réseau d'abord** pour les pages et les données (le cache ne sert
que hors connexion) ; CSS/JS/images versionnés (?v=) = cache puis mise à jour. Si un téléphone garde une vieille version :
changer `CACHE_VERSION` dans `sw.js`. Test : `node tools/test_sw.mjs`.

**Chaque janvier (loi de finances)** et en cas d'alerte : demander à Claude « revérifie les sources de Documents Tunisie »
(droits d'enregistrement, timbre, légalisation, délais), corriger `assets/documents.js`, changer `MAJ`, générer, tester.
**Points encore « à vérifier »** : ils sont marqués sur chaque page concernée (jamais inventés).

## Nouveautés
- 05/10/2026 : nouvelle icône ; PDF sans mention du site et mise en page de lettre ; recherches sans résultat notées pour ajouter les documents demandés ; robot de nuit privé.
