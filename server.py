from flask import Flask, request, jsonify, render_template, send_file
import requests
import xmltodict
import io
import json
import numpy as np
from subprocess import run
from tempfile import NamedTemporaryFile



app = Flask(__name__)




# Fonction pour récupérer les données occurrences de GBIF
def get_gbif_data(taxon):
    match_url = f"https://api.gbif.org/v1/species/match?name={taxon}"
    try:
        match_response = requests.get(match_url, timeout=10)
        match_response.raise_for_status()
        match_data = match_response.json()
    except requests.RequestException as e:
        return {"error": f"Erreur lors de la récupération de l'usageKey pour {taxon}: {str(e)}"}
    
    usageKey = match_data.get("usageKey")
    if not usageKey:
        return {"error": f"Aucun usageKey trouvé pour le taxon {taxon}."}

    occurrence_url = f"https://api.gbif.org/v1/occurrence/search?taxon_key={usageKey}&limit=400"
    try:
        occurrence_response = requests.get(occurrence_url, timeout=10)
        occurrence_response.raise_for_status()
        return occurrence_response.json()
    except requests.RequestException as e:
        return {"error": f"Erreur lors de la récupération des données GBIF pour {taxon}: {str(e)}"}






# Fonction pour récupérer les données BOLD
def get_bold_data(taxon):
    url = f"https://v4.boldsystems.org/index.php/API_Public/combined?taxon={taxon}"
    try:
        response = requests.get(url, timeout=10000)
        response.raise_for_status()
        data = xmltodict.parse(response.content)
        return data  
    except requests.RequestException as e:
        print(f"Erreur serveur : {e}")
        return {"error": f"Erreur lors de la récupération des données BOLD pour {taxon}: {str(e)}"}
    except Exception as e:
        return {"error": f"Erreur de conversion XML en JSON pour {taxon}: {str(e)}"}
    except Exception as e:
        print(f"Erreur serveur : {e}")
        return {"error": f"Erreur serveur côté BOLD : {str(e)}"}







# Route API pour récupérer les données de plusieurs taxons
@app.route('/search', methods=['GET'])
def search_taxa():
    taxons = request.args.getlist('taxon')
    results = {}

    for taxon in taxons:
        bold_data = get_bold_data(taxon)
        gbif_data = get_gbif_data(taxon)
        results[taxon] = {"BOLD": bold_data, "GBIF": gbif_data}

    return jsonify(results)



# Route API pour récupérer les données de plusieurs taxons
@app.route('/searchBOLD', methods=['GET'])
def search_bold():
    taxons = request.args.getlist('taxon')
    results = {}

    for taxon in taxons:
        bold_data = get_bold_data(taxon)
        results[taxon] = {"BOLD": bold_data}

    return jsonify(results)














# Fonction pour récupérer les données de BOLD directement convertie
def get_bold_raw_json(taxon):
    url = f"https://v4.boldsystems.org/index.php/API_Public/combined?taxon={taxon}&format=json"
    try:
        response = requests.get(url, timeout=100000)
        response.raise_for_status()
        return response.json()  # <- Données brutes directement
    except requests.RequestException as e:
        return {"error": f"Erreur réseau pour {taxon} : {str(e)}"}
    except Exception as e:
        return {"error": f"Erreur de traitement JSON brut pour {taxon} : {str(e)}"}




@app.route('/boldRaw', methods=['GET'])
def bold_raw_data():
    taxons = request.args.getlist('taxon')
    results = {}

    for taxon in taxons:
        raw_data = get_bold_raw_json(taxon)
        results[taxon] = raw_data

    return jsonify(results)












def get_taxa_with_keys(usageKey):
    url = f"https://api.gbif.org/v1/species/{usageKey}/children?limit=1000"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()

    taxa_list = []

    for result in data.get("results", []):
        taxon_info = {
            "scientificName": result.get("scientificName"),
            "canonicalName": result.get("canonicalName"),
            "rank": result.get("rank"),
            "kingdom": {
                "name": result.get("kingdom"),
                "key": result.get("kingdomKey")
            },
            "phylum": {
                "name": result.get("phylum"),
                "key": result.get("phylumKey")
            },
            "class": {
                "name": result.get("class"),
                "key": result.get("classKey")
            },
            "order": {
                "name": result.get("order"),
                "key": result.get("orderKey")
            },
            "family": {
                "name": result.get("family"),
                "key": result.get("familyKey")
            },
            "genus": {
                "name": result.get("genus"),
                "key": result.get("genusKey")
            },
            "species": {
                "name": result.get("species"),
                "key": result.get("speciesKey")
            },
            "taxonKey": result.get("key")
        }

        taxa_list.append(taxon_info)

    return taxa_list



@app.route('/match', methods=['GET'])
def match_taxon():
    taxon_name = request.args.get('name')
    if not taxon_name:
        return jsonify({'error': 'Taxon name missing'}), 400

    gbif_response = requests.get(f"https://api.gbif.org/v1/species/match?name={taxon_name}")
    gbif_data = gbif_response.json()

    if 'usageKey' not in gbif_data:
        return jsonify({'error': 'Taxon not found'}), 404

    usage_key = gbif_data.get('usageKey')
    children = get_taxa_with_keys(usage_key)

    return jsonify({
        'scientificName': gbif_data.get('scientificName'),
        'usageKey': usage_key,
        'rank': gbif_data.get('rank'),
        'children': children  
    })



@app.route('/taxa', methods=['GET'])
def get_all_children():
    usageKey = request.args.get("usageKey")
    if not usageKey:
        return jsonify({"error": "usageKey manquant"}), 400

    all_results = []
    offset = 0
    limit = 100

    while True:
        url = f"https://api.gbif.org/v1/species/{usageKey}/children?limit={limit}&offset={offset}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        results = data.get("results", [])
        all_results.extend(results)

        if data.get("endOfRecords", True):
            break

        offset += limit

    return jsonify(all_results)




@app.route('/')
def home():
    return render_template('home.html')

@app.route('/page_generator')
def page_generator():
    return render_template('page_generator.html')

@app.route('/page_explorer')
def page_explorer():
    return render_template('page_explorer.html')

@app.route('/page_about')
def page_about():
    return render_template('page_about.html')

if __name__ == '__main__':
    app.run(debug=True)
