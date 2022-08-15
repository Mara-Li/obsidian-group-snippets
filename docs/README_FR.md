-> [EN](README.md)

# Obsidian Group Snippet

Ce module permet de créer un groupe de snippets et de les classer en un clic (ou commande) ! Il permet aussi de lier un groupe de snippets à un thème, pour l'activer quand **vous changez de thème** ! Il fonctionne aussi lorsque vous passez du thème clair au thème sombre (et vice et versa) !

## Usage

1. Aller dans les paramètres du module
2. Ajouter un groupe (en cliquant sur le bouton +)
3. Ajouter un nom au groupe
4. Cliquer sur le bouton `edit` pour ajouter des snippets au groupe

Après cela vous avez votre groupe de snippets ! 🎉🎉

Le module va activer le **snippet activé**, et **désactiver** les snippets désactivés !

Pour lancer les commandes, vous pouvez :
1. Depuis la palette de commande
	1. `Recharger les snippets` pour recharger le plugin (et chargez les nouveaux groupes)
	2. `Activer le groupe : ${groupName}` pour activer le groupe
2. Depuis la fenêtre de paramètres directement en cliquant sur l'icône de 'fenêtre de commande'.

Vous pouvez aussi activer tous les snippets du groupe en cliquant sur l'icône `oeil` (cliquer sur l'icône croix pour désactiver tous les snippets du groupe).

Aussi, et c'est le "game changer" ici ! Vous pouvez automatiquement basculer entre les groupes de snippets en fonction de votre thème ou du jeu de couleur d'Obsidian !
Le basculement est basé sur le **nom du groupe**, et le **nom du thème**. Le nom du groupe **doit** inclure le nom du thème, et optionnellement le nom du jeu de couleur comme `dark` ou `light`.[^1]
Par exemple, le groupe `minimal dark` sera activé si vous passez du mode clair au mode sombre, mais aussi si vous êtes en mode sombre et que vous passez à Minimal.

De plus, les snippets liés à d'autres thèmes (ou jeu de couleur) seront désactivés automatiquement 😀 !

Normalement, vous devriez totalement remplacer les paramètres de Snippets !

🗒️ Notes : Vous devez recharger les snippets (en utilisant le bouton de rechargement) quand vous supprimez des snippets. Mais, ne vous inquiétez pas, le module ne peut pas activer un snippet qui n'existe pas ! C'est juste la liste qui a besoin d'être rechargée :).

![](docs/docs_gif.gif)

## 🤖 Développement

1. Forker le dépôt sur GitHub
2. Cloner le dépôt sur votre ordinateur
3. Lancer `npm install` dans le dépôt cloné
4. Lancer `npm run build` dans le dépôt cloné. Vous pouvez aussi utiliser `npm run dev` pour voir vos changements en direct !

## Credit & remerciement
- [MySnippets](https://github.com/chetachiezikeuzor/MySnippets-Plugin)
- [Snippets Commands](https://github.com/deathau/snippet-commands-obsidian)

[^1]: La traduction s'applique ici. Ainsi, vous pouvez utiliser à la fois `dark`, `light` de l'Anglais, mais aussi `sombre` et `clair` du Français.
