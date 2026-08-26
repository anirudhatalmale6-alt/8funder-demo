# 8funder — démonstration publique

**https://anirudhatalmale6-alt.github.io/8funder-demo/**

Copie statique du site 8funder tel que l'extension le rend, en version
**1.17.0**. Aucune installation n'est nécessaire pour la regarder : c'est une
page web, elle s'ouvre sur un téléphone comme sur un ordinateur.

Elle existe pour une raison simple : le site en ligne tourne encore une
ancienne version, donc les animations et les couleurs décrites dans les
messages n'y sont pas visibles. Ici, elles le sont.

## Ce qu'il y a de nouveau en 1.17.0

**L'accueil est passé à la racine.** Sur `8funder.com`, la page d'accueil est
encore la démonstration du thème Arolax : logo de l'agence, menu
`DEMO / ADVANCED PORTFOLIO / HOME…`, titre coupé en deux (« StrategizingF
unding. »), et « 1k+ customers word-wide ». Ici, la racine ouvre directement
sur 8funder.

> L'ancienne adresse de démonstration, `/8funder-demo/8funder/`, renvoie
> maintenant vers la racine. Elle ne tombe pas en 404.

**Les touches de vert.** L'accent vif `#C9F31D` a été *relevé sur la page
d'accueil en ligne du client*, pas choisi : c'est déjà sa couleur. Il sert
maintenant de fil conducteur entre le thème et l'extension, qui étaient verts
tous les deux sans être du même vert.

| Où | Ce qu'on voit |
|---|---|
| Haut des bandeaux | un filet lime de 3 px |
| Bouton principal | pilule lime, texte noir — comme son bouton « LET'S TALK » |
| Jauge de défilement | fine barre lime en haut de l'écran, qui suit la lecture |
| Onglet courant | souligné en lime dans la barre du bandeau |
| Blocs de chiffres | filet lime au-dessus des nombres |
| Survol des cartes | le contour passe au lime |

Le lime n'est jamais employé comme couleur de texte sur fond clair (1,4:1,
illisible) : uniquement en fond avec de l'encre sombre, ou en filet. Les
**montants** restent en bronze — un chiffre d'argent doit se lire.

## Les animations

| Effet | Où le voir |
|---|---|
| Le titre monte à l'ouverture | l'accueil, au chargement |
| Les blocs apparaissent au défilement | partout, en descendant |
| Les compteurs montent jusqu'à leur valeur | l'accueil, bloc des chiffres |
| Les courbes de taux se tracent | `/taux/` |
| La jauge de défilement | tout en haut de l'écran, en descendant |

## Les limites de cette copie, dites d'avance

- **Plafonnée à 40 fiches par section.** Le répertoire complet fait 1 611
  programmes et 702 organismes ; tout copier donnait 46 Mo pour une
  démonstration où l'on veut juger un mouvement. Le script imprime ce qu'il
  laisse de côté, il ne le cache pas.
- **Les formulaires ne mènent nulle part.** Recherche, diagnostic, devis :
  c'est une copie de pages, il n'y a pas de WordPress derrière.
- **Ce n'est pas le site en ligne.** C'est ce que le site affichera une fois la
  1.17.0 installée.

## Reconstruire

```
python3 miroir-demo.py          # dans 8funder/, avec le WordPress local en marche
rsync -a --delete --exclude .git demo-anim/ gitwork-demo/
```

Le dossier `demo-anim` est effacé à chaque exécution : le dépôt Git vit dans
`gitwork-demo`, jamais dedans.
