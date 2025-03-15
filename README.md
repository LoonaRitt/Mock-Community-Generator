Outil en Ligne de Commande - Mock Communities Generator



🎯 À quoi sert cet outil ?

Cet outil permet de générer des communautés témoins (mock communities) pour des utilisations en métabarcoding via des API spécialisées (BOLD et GBIF). Il offre une interface web simple et intuitive, accessible localement, pour explorer et visualiser les résultats. Il suffit d'entrer une liste de taxa, puis l'outil sélectionne les séquences les plus pertinentes, téléchargeables au format FASTA.

Comment ça fonctionne ?

- Téléchargez le projet.

- Exécutez le script correspondant à votre système (Windows ou macOS/Linux).

- Le serveur s'ouvrira automatiquement dans votre navigateur.

En quelques secondes, vous serez prêt à explorer vos données !


📁 Contenu du projet

server.py : Serveur Python basé sur Flask.

requirements.txt : Liste des dépendances Python.

setup_unix.sh : Script d'installation et de lancement pour Linux/macOS.

setup_windows.bat : Script d'installation et de lancement pour Windows.

Makefile : Automatisation des tâches pour Linux/macOS.


⚙️ Prérequis

Python 3 doit être installé sur votre système.

pip (gestionnaire de paquets Python).

Pour Linux/macOS, assurez-vous que le terminal dispose des permissions d'exécution.


🚀 Installation et Lancement

🪟 Pour Windows : 

- Ouvrez le terminal (PowerShell ou CMD).

- Naviguez jusqu'au dossier du projet (clique droit sur le dossier contenant ce projet, puis cliquez sur "copier en tant que chemin d'accès") :

  cd chemin\vers\votre\projet

- Exécutez le script :

  setup_windows.bat

- Le script installera les dépendances et lancera automatiquement le serveur.


🍎🐧 Pour macOS/Linux

- Ouvrez le terminal.

- Naviguez jusqu'au dossier du projet :

  cd chemin/vers/votre/projet

  
Option 1 : Utiliser setup_unix.sh

- Rendez le script exécutable (uniquement nécessaire une fois) :

  chmod +x setup_unix.sh

- Ensuite, exécutez le script :

  ./setup_unix.sh

👉 Si le script ne s'exécute pas, essayez :

  bash setup_unix.sh


Option 2 : Utiliser le Makefile (si make est installé)

- Pour installer les dépendances :

  make install

- Pour lancer le serveur :

  make run

- Ou tout faire en une seule commande :

  make setup
  

✅ Vérification

Une fois le serveur lancé, un message de confirmation apparaîtra.

Accédez à l'interface via votre navigateur, à l'adresse http://127.0.0.1:5000


❓ Résolution des problèmes

- Vérifiez si Python est installé :

  python --version

- Si python ne fonctionne pas, essayez :

  python3 --version

- Vérifiez que pip est installé :

  pip --version

- Sur macOS/Linux, si setup_unix.sh ne s'exécute pas, vérifiez les permissions avec :

  ls -l setup_unix.sh

- et corrigez-les si nécessaire avec :

  chmod +x setup_unix.sh
  

🙌 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests pour améliorer ce projet.

Merci d'utiliser cet outil ! 🚀

