#!/bin/bash

# Vérifier si Python est installé
if ! command -v python &> /dev/null
then
    echo "Python n'est pas installé. Veuillez l'installer avant de continuer."
    exit
fi

# Installer les dépendances Python
echo "Installation des dépendances Python..."
pip install -r requirements.txt

# Lancer le serveur Python
echo "Lancement du serveur..."
python server.py
