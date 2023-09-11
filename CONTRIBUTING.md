# Contribuer

Merci de l'intérêt que vous portez à cartes.gouv.fr ! Toute forme de contribution est bienvenue.

## Contributions autres que du code

Il y a plus d'une façon de contribuer. Si vous avez des questions ou des sujets à aborder en rapport avec le cartes.gouv.fr, n'hésitez pas, en premier lieu, à utiliser le formulaire de contact du site. Vous pouvez également ouvrir une **issue**. Des formulaires sont prévus pour les signalements d'anomalie, les demandes d'évolution ou de documentation et vous pouvez bien sûr toujours partir d'une feuille blanche si vous préférez.

## Signaler une anomalie, suggérer une évolution, demander ou proposer de la documentation

[Ouvrez une issue](https://github.com/IGNF/cartes.gouv.fr/issues/new/choose) sur Github.

## Modifier le code et la documentation

Si vous savez utiliser Git et GitHub, vous pouvez directement contribuer au code et à la documentation du projet.

Voici quelques étapes pas à pas :

* Créez un compte sur GitHub
* Installez Git sur votre poste de travail
* Configurez Git avec vos noms et email
* Faites un fork de ce dépôt `votre_compte_github/cartes.gouv.fr`
* Clônez votre fork (en utilisant SSH ou HTTPS au choix)
* Dans votre répertoire local, ajoutez le dépôt principal de cartes.gouv.fr comme source `upstream` (en utilisant l'URL HTTPS)
* Vous pouvez vérifier l'état de vos remotes avec la commande `git remote -v` et vous devriez avoir :

    ```
    origin	git@github.com:votre_compte_github/cartes.gouv.fr.git (fetch)
    origin	git@github.com:votre_compte_github/cartes.gouv.fr.git (push)
    upstream	https://github.com/IGNF/cartes.gouv.fr.git (fetch)
    upstream	https://github.com/IGNF/cartes.gouv.fr.git (push)
    ```

    > :exclamation: Il est important que `origin` pointe sur votre fork du dépôt et pas sur le dépôt principal.

* Mettez à jour avant de créer une branche

    ```
    git checkout main
    ```

* Téléchargez les mises à jour de toutes les branches `upstream`

    ```
    git fetch upstream
    ```

* Mettez à jour votre branche `main` locale pour qu'elle soit au même niveau que la branche `main` du dépôt principal

    ```
    git rebase upstream/main
    ```

Si la commande `rebase` vous envoie un message d'erreur parce que vous avez des changements locaux non commités, placez les de côté dans le "stash"

```
git stash
```

Maintenant vous pouvez utiliser rebase puis réappliquer vos changements

```
git rebase upstream/main
git stash apply
```

Créez une nouvelle branche avec l'outil dont vous avez l'habitude sur votre dépôt local et travaillez dans cette nouvelle branche.

Ajoutez, commitez et pushez vos changements dans une nouvelle branche (ici `new-feature`) sur votre dépôt.

```
git push origin new-feature
```

### Créez une pull request

Quand vous effectuez le push, Github va vous répondre avec l'URL à utiliser pour créer une nouvelle pull request. Vous pouvez suivre cette URL ou la visiter plus tard sur GitHub. En vous rendant sur votre branche `new-feature`, GitHub va faire apparaitre un bouton pour créer une pull request.

### Après la création d'une pull request

L'équipe de cartes.gouv.fr va examiner votre pull request. Si besoin, des modifications pourront vous être demandées.

Une fois vos changements acceptés, l'équipe décidera s'il est plus approprié de merger votre branche, fusionner tous les commits en un seul ou bien effectuer un rebase de tous les commits à l'identique sur la branche main.

## Petite note juridique

Il est important que toute contribution ne contienne que du code dont la licence est clairement établie et compatible avec la licence du dépôt cartes.gouv.fr.