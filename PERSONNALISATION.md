# Guide de personnalisation — Template Paysagiste

Ce guide liste tout ce que vous devez modifier avant de mettre votre site en ligne.
Chaque section indique le fichier concerné, ce qu'il faut changer et pourquoi.

---

## 1. Identité de l'entreprise

Ces informations apparaissent sur tout le site. Faites une recherche-remplacement globale.

| Valeur actuelle | Remplacer par | Fichiers concernés |
|---|---|---|
| `Paysage Dupont` | Nom de votre entreprise | Tous les fichiers HTML, sitemap.xml, robots.txt, llms.txt |
| `PD` (logo initiales) | Vos initiales | Tous les fichiers HTML (classe `header__logo-mark`) |
| `Antoine Dupont` | Nom du fondateur | index.html (section fondateur + schema.org) |
| `04 78 12 34 56` / `+33478123456` | Votre n° de téléphone | Tous les fichiers HTML (header + footer), schema.org |
| `contact@paysage-dupont-lyon.fr` | Votre email | mentions-legales.html, politique-confidentialite.html, schema.org |
| `15 rue des Jardins, 69003 Lyon` | Votre adresse | mentions-legales.html, politique-confidentialite.html, schema.org |
| `paysage-dupont-lyon.fr` | Votre nom de domaine | Tous les fichiers HTML (canonical, OG), sitemap.xml, robots.txt, llms.txt |
| `SIRET 123 456 789 00012` | Votre SIRET | index.html (footer), mentions-legales.html, schema.org |
| `FR12 345678901` | Votre n° TVA intracommunautaire | mentions-legales.html |
| `8130Z` | Votre code APE (si différent) | mentions-legales.html |

---

## 2. Mentions légales — Champs obligatoires à compléter

Fichier : `pages/mentions-legales.html`

Ces champs contiennent des placeholders entre crochets `[...]` que vous DEVEZ remplacer :

| Placeholder | Ce qu'il faut mettre |
|---|---|
| `[Prénom Nom du paysagiste]` (x2) | Votre nom complet (responsable + directeur de publication) |
| `[N° RM à compléter]` | Votre numéro d'inscription au Répertoire des Métiers |
| `[Nom de la compagnie d'assurance]` | Le nom de votre assureur (RC pro + décennale) |
| `[Numéro du contrat]` | Le n° de votre contrat d'assurance |
| `[Nom du médiateur ou organisme de médiation]` | Votre médiateur de la consommation (obligatoire) |
| `[URL du médiateur]` | Le site web du médiateur |
| `[Adresse du médiateur]` | L'adresse postale du médiateur |

> **Important** : si vous n'avez pas encore de médiateur, vous devez en désigner un. C'est une obligation légale (art. L.612-1 du Code de la consommation). Exemples : CM2C, CNPM, AME Conso.

---

## 3. Photo du fondateur

Fichier : `index.html`, ligne ~700

La photo actuelle est une image Unsplash temporaire. Remplacez l'URL par votre propre photo :

```html
<!-- Remplacer cette URL -->
background: url('https://images.unsplash.com/photo-1507003211169-...') center/cover no-repeat;

<!-- Par votre photo locale -->
background: url('img/fondateur.webp') center/cover no-repeat;
```

Format recommandé : 400x400px, format WebP, cadrage visage, arrière-plan naturel (jardin, chantier).

---

## 4. Réseaux sociaux (Schema.org)

Fichier : `index.html`, dans le bloc JSON-LD `<script type="application/ld+json">` (Organization)

Cherchez `_sameAs_INSTRUCTION` et remplacez par vos vrais profils :

```json
"sameAs": [
  "https://www.facebook.com/votre-page",
  "https://www.instagram.com/votre-compte"
]
```

---

## 5. Google — Vérification et avis

Fichier : `index.html`

| Élément | Ligne | Action |
|---|---|---|
| `google-site-verification` | ~11 | Remplacer par votre propre code Google Search Console |
| `https://g.page/paysage-dupont-lyon/review` | ~736, ~785 | Remplacer par votre lien Google Business Profile |
| `4.8/5 sur 47 avis` | ~736 | Mettre à jour avec votre vraie note et nombre d'avis |
| `(consultés le 15 avril 2026)` | ~736 | Mettre la date réelle de consultation |
| Avis clients (section avis) | ~739-780 | Remplacer par vos vrais avis clients (noms, textes, villes) |
| Google Maps embed | ~799 | Remplacer l'URL iframe par votre propre embed Google Maps |

---

## 6. Microsoft Clarity (analytics)

Fichier : `js/main.js`, ligne ~230

Remplacez `YOUR_CLARITY_ID` par votre vrai ID de projet Clarity :

```javascript
var CLARITY_PROJECT_ID = 'votre-id-clarity';
```

Si vous n'utilisez pas Clarity, laissez `YOUR_CLARITY_ID` — le script ne se chargera pas.

Après modification, re-minifiez le fichier JS (voir section 10).

---

## 7. Nom de domaine et hébergement

### Sitemap
Fichier : `sitemap.xml` — Remplacez toutes les occurrences de `paysage-dupont-lyon.fr` par votre domaine.

### Robots.txt
Fichier : `robots.txt` — Mettez à jour l'URL du sitemap en dernière ligne.

### llms.txt
Fichier : `llms.txt` — Réécrivez entièrement avec les informations de votre entreprise (services, zone, tarifs).

### Canonical et OG
Tous les fichiers HTML contiennent des balises `canonical` et `og:url` avec `paysage-dupont-lyon.fr`. Faites un rechercher-remplacer global.

---

## 8. Formulaire Netlify

Fichier : `pages/contact.html`

Le formulaire est configuré pour Netlify Forms. Si vous utilisez un autre hébergeur :
- Remplacez `data-netlify="true"` par votre propre solution de traitement de formulaire
- Mettez à jour l'action du formulaire si nécessaire
- Le formulaire de consentement cookies (`consent-journal`) utilise aussi Netlify Forms

Si vous restez sur Netlify : le formulaire fonctionne tel quel, rien à changer sauf les données de l'entreprise.

---

## 9. Contenu éditorial à personnaliser

| Section | Fichier | Ce qu'il faut adapter |
|---|---|---|
| Texte fondateur (bio, citation) | index.html | Votre parcours, votre philosophie |
| Credentials (7 ans, 4 personnes) | index.html | Vos vraies données |
| Réalisations galerie | pages/galerie.html | Vos propres photos avant/après |
| Textes services | pages/creation-jardin.html, etc. | Adapter à vos spécialités |
| Pages villes SEO | pages/paysagiste-ecully.html, etc. | Adapter aux villes de votre zone |
| Tarifs dans llms.txt | llms.txt | Vos vrais tarifs |

---

## 10. Après modifications — Checklist technique

1. **Re-minifier le JavaScript** : après avoir modifié `js/main.js`, re-générez `js/main.min.js` avec un outil comme [Terser](https://terser.org/) ou en ligne sur [javascript-minifier.com](https://javascript-minifier.com/)

2. **Bumper le cache** : changez `?v=8` en `?v=9` (ou plus) dans tous les fichiers HTML pour forcer le rechargement du CSS et JS par les navigateurs

3. **Tester les formulaires** : soumettez un formulaire de test sur Netlify pour vérifier que les données arrivent

4. **Valider les JSON-LD** : testez vos données structurées sur [validator.schema.org](https://validator.schema.org/) ou [Google Rich Results Test](https://search.google.com/test/rich-results)

5. **Soumettre le sitemap** : dans Google Search Console, soumettez votre sitemap.xml mis à jour

---

## Structure des fichiers

```
template-paysagiste/
  index.html              ← Page d'accueil principale
  404.html                ← Page d'erreur 404
  sitemap.xml             ← Plan du site pour Google
  robots.txt              ← Directives pour les moteurs de recherche
  llms.txt                ← Fiche entreprise pour les IA
  netlify.toml            ← Configuration Netlify (formulaires, headers)
  css/
    style.css             ← CSS source
    style.min.css         ← CSS minifié (utilisé en production)
  js/
    main.js               ← JavaScript source
    main.min.js           ← JavaScript minifié (utilisé en production)
  img/                    ← Images optimisées (WebP + JPG fallback)
  pages/
    contact.html          ← Formulaire de devis
    merci.html            ← Page de confirmation après envoi
    galerie.html          ← Galerie de réalisations
    creation-jardin.html  ← Service : création de jardin
    amenagement-terrasse.html ← Service : terrasse
    entretien-jardin.html ← Service : entretien
    allees-clotures.html  ← Service : allées et clôtures
    paysagiste-ecully.html    ← Page SEO locale
    paysagiste-caluire.html   ← Page SEO locale
    paysagiste-villeurbanne.html ← Page SEO locale
    mentions-legales.html     ← Mentions légales (OBLIGATOIRE)
    politique-confidentialite.html ← Politique RGPD (OBLIGATOIRE)
```
