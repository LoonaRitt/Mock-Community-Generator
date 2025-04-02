Mock Communities Generator - Outil en Ligne de Commande


Accès en ligne : https://mock-community-generator.onrender.com/


Le chargement de ce lien peut prendre plusieurs minutes.


L'onglet "Access the Taxon Sequence Explorer" sera bientôt en ligne.


Présentation :

Cet outil a été développé lors d’un stage étudiant en L3 Sciences de la Vie - parcours Population, Génomique et Évolution - à Aix-Marseille Université, sous la direction de [Nom], maître de conférences et co-responsable de la formation.


À quoi sert cet outil ?

Le Mock Communities Generator permet de générer des communautés témoins (mock communities) pour des applications en métabarcoding. Il utilise les API de BOLD et GBIF pour récupérer les séquences d’ADN des taxa recherchés.

Fonctionnalités principales :
- Interface web intuitive (locale et en ligne).
- Recherche et sélection de séquences de taxon depuis les bases de données BOLD et GBIF.
- Téléchargement des séquences au format FASTA.


1️⃣ Installation locale

Prérequis :
- Python 3 doit être installé.
- pip (gestionnaire de paquets Python).

Installation sous Windows :
1. Ouvrez PowerShell ou CMD.
2. Double-cliquez sur setup_windows.bat.
3. Le script installe les dépendances et lance le serveur automatiquement.

Installation sous macOS/Linux :
1. Ouvrez un terminal.
2. Accédez au dossier du projet :
   cd chemin/vers/votre/projet
3. Option 1 : Utiliser setup_unix.sh
   chmod +x setup_unix.sh  # (à exécuter une seule fois)
   ./setup_unix.sh

   Si le script ne fonctionne pas, essayez :
   bash setup_unix.sh

4. Option 2 : Utiliser Makefile (si `make` est installé)
   make install  # Installation des dépendances
   make run      # Lancement du serveur
   make setup    # Installation + lancement


2️⃣ Lancement du serveur

Une fois installé, ouvrez votre navigateur et accédez à http://127.0.0.1:5000 pour utiliser l’interface web.


3️⃣ Contenu du projet

- server.py : Serveur Python.
- requirements.txt : Liste des dépendances Python.
- setup_windows.bat : Script d’installation pour Windows.
- setup_unix.sh : Script d’installation pour Linux.
- Makefile : Automatisation des tâches sous Linux/macOS.


🙌 Contribution

Les contributions sont les bienvenues ! Si vous avez des idées d’amélioration, n’hésitez pas à ouvrir une issue ou une pull request.

Merci d’utiliser Mock Communities Generator !
