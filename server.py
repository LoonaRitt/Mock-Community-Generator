from flask import Flask, request, jsonify, render_template, send_file
import requests
import xmltodict
import io
import json
import numpy as np
from subprocess import run
from tempfile import NamedTemporaryFile



app = Flask(__name__)



# Fonction pour récupérer les données de BOLD
def get_bold_data(taxon):
    url = f"https://v4.boldsystems.org/index.php/API_Public/combined?taxon={taxon}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = xmltodict.parse(response.content)

        records = data.get("records", {}).get("record", [])
        if isinstance(records, dict):
            records = [records]  

        extracted_data = []
        for record in records:
            bin_uri = record.get("bin_uri", "N/A")
            nucleotides = record.get("sequences", {}).get("sequence", {}).get("nucleotides", "N/A")
            species = record.get("taxonomy", {}).get("species", {}).get("taxon", {}).get("name", "N/A")
            
            extracted_data.append({
                "BIN": bin_uri,
                "Espèce": species,
                "Sequence code barre": nucleotides
            })
        
        return data
    except requests.RequestException as e:
        return {"error": f"Erreur lors de la récupération des données BOLD pour {taxon}: {str(e)}"}
    except Exception as e:
        return {"error": f"Erreur de conversion XML en JSON pour {taxon}: {str(e)}"}



        return extracted_data if extracted_data else {"error": "Aucune donnée trouvée"}
    except requests.RequestException as e:
        return {"error": f"Erreur lors de la récupération des données BOLD pour {taxon}: {str(e)}"}
    except Exception as e:
        return {"error": f"Erreur de conversion XML en JSON pour {taxon}: {str(e)}"}




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



@app.route('/')
def home():
    return render_template('home.html')

@app.route('/page_generator')
def page_generator():
    return render_template('page_generator.html')


if __name__ == '__main__':
    app.run(debug=True)
