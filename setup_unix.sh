#!/bin/bash

# Vérifier si Python3 est installé
if ! command -v python3 &> /dev/null
then
    echo "Python3 n'est pas installé. Veuillez l'installer avant de continuer."
    exit 1
fi

# Vérifier si pip3 est installé
if ! command -v pip3 &> /dev/null
then
    echo "pip3 n'est pas installé. Installation en cours..."
    sudo apt update && sudo apt install -y python3-pip
fi

# Installer les dépendances Python
echo "Installation des dépendances Python..."
pip3 install -r requirements.txt

# Lancer le serveur Python
echo "Lancement du serveur..."
python3 server.py
