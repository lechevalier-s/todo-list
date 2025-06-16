Implémentation pour le Test Technique Full Stack pour Key Consulting.

Implémentation découpée en 2 projets :
- un projet Java pour l'API : todo-list
- un projet Angular pour l'IHM : todo-list-ng

Environnement :
- Java 21
- Maven 3.9.9
- NodeJs 22.13.0
- Angular 19.1.6

Remarques :
- L'ajout d'une nouvelle tâche aurait pu se faire dans une modale ou MatDialog, ce qui aurait permis de conserver la pagination, 
mais le choix a été fait de créer une nouvelle page afin de mettre en oeuvre le routage
- La pagination se fait uniquement en local côté Angular. Une nouvelle API côté Java aurait pu permettre de lire uniquement la 
partie du tableau à afficher en fonction de la pagination ou des index en entrée, mais cela n'apportait pas grand chose ici
- Le filtre sur les tâches à effectuer aurait pu se faire au niveau Angular en filtrant sur le statut completed, mais l'appel
à l'API Java est réalisé à chaque changement de filtre (bouton toggle "Toutes" ou "A faire") afin de respecter la consigne
d'utiliser toutes les routes de l'API
