const taxonList = [];



function addTaxon() {
  const taxonInput = document.getElementById('taxonInput').value;
  console.log('Tentative d\'ajout du taxon :', taxonInput);  
  if (taxonInput && !taxonList.includes(taxonInput)) {
    taxonList.push(taxonInput);
    console.log('Taxon ajouté:', taxonInput);
    updateTaxonList();
  }
}


// Fonction pour supprimer un taxon de la liste
function removeTaxon(index) {
  taxonList.splice(index, 1);
  updateTaxonList();
}


function updateTaxonList() {
  const taxonContainer = document.getElementById('taxonList');
  taxonContainer.innerHTML = ''; // Vide la liste actuelle

  taxonList.forEach((taxon, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = taxon;
    listItem.classList.add('taxon-item'); 
    taxonContainer.appendChild(listItem);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'x';
    removeButton.classList.add('remove-button');

    removeButton.onclick = () => removeTaxon(index);
    
    listItem.appendChild(removeButton);
    taxonContainer.appendChild(listItem);
  });
}












// Fonction pour afficher la taxonomie BOLD
function displayTaxonomy(boldData) {
    if (!boldData || !boldData.bold_records || !boldData.bold_records.record) {
        return '<div class="taxonomy-container"><p>Aucune donnée BOLD disponible.</p></div>';
    }

    const records = Array.isArray(boldData.bold_records.record) 
        ? boldData.bold_records.record 
        : [boldData.bold_records.record];

    // Créer des ensembles pour éviter les doublons
    const classNames = new Set();
    const familyNames = new Set();
    const genusNames = new Set();
    const orderNames = new Set();
    const phylumNames = new Set();
    const speciesNames = new Set();

    records.forEach(record => {
        classNames.add(record.taxonomy?.class?.taxon?.name || "N/A");
        familyNames.add(record.taxonomy?.family?.taxon?.name || "N/A");
        genusNames.add(record.taxonomy?.genus?.taxon?.name || "N/A");
        orderNames.add(record.taxonomy?.order?.taxon?.name || "N/A");
        phylumNames.add(record.taxonomy?.phylum?.taxon?.name || "N/A");
        speciesNames.add(record.taxonomy?.species?.taxon?.name || "N/A");
    });

    // Construire le HTML avec la classe pour le CSS
    let formattedHTML = '<div class="taxonomy-container">';
    formattedHTML += "<h5>Taxonomy</h5><ul>";
    formattedHTML += `<li><strong>Phylum:</strong> ${[...phylumNames].join(", ")}</li>`;
    formattedHTML += `<li><strong>Class:</strong> ${[...classNames].join(", ")}</li>`;
    formattedHTML += `<li><strong>Order:</strong> ${[...orderNames].join(", ")}</li>`;
    formattedHTML += `<li><strong>Family:</strong> ${[...familyNames].join(", ")}</li>`;
    formattedHTML += `<li><strong>Genus:</strong> ${[...genusNames].join(", ")}</li>`;
    formattedHTML += `<li><strong>Species:</strong> ${[...speciesNames].join(", ")}</li>`;
    formattedHTML += "</ul></div>";

    return formattedHTML;
}




function displayData(data) {
  console.log('Affichage des données', data);  // Log avant de commencer à traiter les données
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';  // Nettoie l'affichage précédent

  data.forEach(({ taxon, boldData, gbifData }) => {
        console.log('Traitement du taxon:', taxon);  // Log pour chaque taxon traité
    const taxonSection = document.createElement('div');
    taxonSection.className = 'taxon-section';

    const title = document.createElement('h3');
    title.textContent = `Results for ${taxon}`;
    taxonSection.appendChild(title);

    const speciesData = {};

    const liste1 = createListe1(boldData);


    // Regrouper les enregistrements BOLD par espèce
    if (boldData && boldData.bold_records && boldData.bold_records.record) {
      const records = Array.isArray(boldData.bold_records.record)
        ? boldData.bold_records.record
        : [boldData.bold_records.record];

      records.forEach(record => {
        const speciesName = record.taxonomy?.species?.taxon?.name || "N/A";
        
        // Si cette espèce n'existe pas encore dans speciesData, on la crée
        if (!speciesData[speciesName]) {
          speciesData[speciesName] = [];
        }
        speciesData[speciesName].push(record);
      });
    }


    // Conteneur global pour toutes les espèces
    const allSpeciesContainer = document.createElement('div');
    allSpeciesContainer.className = 'all-species-container';

    // Pour chaque espèce, créer une sous-section avec un container CSS
    for (const species in speciesData) {
      const speciesSection = document.createElement('div');
      speciesSection.className = 'species-section';

      const speciesTitle = document.createElement('h4');
      speciesTitle.textContent = species;
      speciesSection.appendChild(speciesTitle);

      // Conteneur pour les données BOLD
      const boldContainer = document.createElement('div');
      boldContainer.className = 'bold-container';

      // Ajouter les données taxonomiques et BOLD formatées
      boldContainer.innerHTML += displayTaxonomy({ bold_records: { record: speciesData[species] } });
      boldContainer.innerHTML += formatBoldData({ bold_records: { record: speciesData[species] } });

      speciesSection.appendChild(boldContainer);

      // Créer un conteneur pour la section "Localisation"
    const localisationSection = document.createElement('div');
    localisationSection.className = 'localisation-section';
    boldContainer.appendChild(localisationSection);
      
      // Ajouter un titre à la section "Localisation"
      const localisationTitle = document.createElement('h5');
      localisationTitle.textContent = 'Location';
      localisationSection.appendChild(localisationTitle);

      // Appliquer un style flex pour centrer la section "Localisation" horizontalement
      localisationSection.style.display = 'flex';
      localisationSection.style.flexDirection = 'column'; // Centrer le contenu verticalement aussi
      localisationSection.style.alignItems = 'center'; // Centrer horizontalement

      // Ajouter un conteneur de carte avec un style de largeur fixe
      const mapContainer = document.createElement('div');
      mapContainer.className = 'map-container';
      mapContainer.id = `map-${taxon.replace(/\s+/g, '-')}-${species.replace(/\s+/g, '-')}`;

      localisationSection.appendChild(mapContainer);

      allSpeciesContainer.appendChild(speciesSection);

      // Initialisation de la carte avec les coordonnées filtrées
      setTimeout(() => {

        const map = L.map(mapContainer.id).setView([35, 0], 0);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Vérifier si on a des données GBIF et des résultats
        if (gbifData && gbifData.results && Array.isArray(gbifData.results)) {
          let hasPoints = false; // Vérifier s'il y a au moins un point affiché

          gbifData.results.forEach(occurrence => {
            if (occurrence.decimalLatitude && occurrence.decimalLongitude) {
              const lat = occurrence.decimalLatitude;
              const lon = occurrence.decimalLongitude;
              const occurrenceSpecies = occurrence.acceptedScientificName || "N/A";


              // Vérifier si l'espèce de l'occurrence correspond à la sous-section espèce
              if (occurrenceSpecies.toLowerCase().includes(species.toLowerCase())) {
                hasPoints = true;

                // Ajout d'un cercle rouge de 5px de diamètre
                L.circleMarker([lat, lon], {
                  radius: 3,  // Taille du point
                  color: '#4CAF50',  // Couleur de la bordure
                  fillColor: '#4CAF50',  // Couleur de remplissage
                  fillOpacity: 0.8  // Opacité du remplissage
                }).addTo(map)
                  .bindPopup(`<b>${species}</b><br>Latitude: ${lat}, Longitude: ${lon}`);
              }
            }
          });

          if (!hasPoints) {
          }
        }

        // Ajouter les points BOLD uniquement pour l'espèce en cours
        if (boldData && boldData.bold_records && boldData.bold_records.record) {
          const records = Array.isArray(boldData.bold_records.record)
            ? boldData.bold_records.record
            : [boldData.bold_records.record];

          records.forEach(record => {
            const speciesInRecord = record.taxonomy?.species?.taxon?.name || "N/A";

            // Filtrer les occurrences BOLD pour afficher seulement celles correspondant à l'espèce actuelle
            if (speciesInRecord.toLowerCase().includes(species.toLowerCase())) {
              const lat = parseFloat(record.collection_event?.coordinates?.lat);
              const lon = parseFloat(record.collection_event?.coordinates?.lon);

              if (!isNaN(lat) && !isNaN(lon)) {

                // Ajout d'un cercle bleu pour les points BOLD
                L.circleMarker([lat, lon], {
                  radius: 3, 
                  color: '#4CAF50',
                  fillColor: '#4CAF50',
                  fillOpacity: 0.8 
                }).addTo(map)
                  .bindPopup(`<b>${speciesInRecord}</b><br>Latitude: ${lat}, Longitude: ${lon}`);
              }
            }
          });
        }
      }, 200); // Délai de 200ms pour s'assurer que tout est bien chargé
    }

    taxonSection.appendChild(allSpeciesContainer);
    resultsContainer.appendChild(taxonSection);

  });
}





let liste1BySpecies = {}; // Stocke une liste1 par espèce

// Fonction pour créer liste1 par espèce
function createListe1(boldData) {
      console.log('Création de liste1 pour les données BOLD'); 
    const markerSelect = document.getElementById('marker-select');
    const selectedMarker = markerSelect ? markerSelect.value : "all";

    if (!boldData || !boldData.bold_records || !boldData.bold_records.record) {
        console.warn("Aucune donnée BOLD disponible pour créer la liste1.");
        return {};
    }

    const records = Array.isArray(boldData.bold_records.record)
        ? boldData.bold_records.record
        : [boldData.bold_records.record];

    let liste1 = {}; 

    records.forEach(record => {
        const species = record.taxonomy?.species?.taxon?.name || "N/A";

        if (species === "N/A") {
            return; 
        }

        if (!liste1[species]) {
            liste1[species] = [];
        }

        if (record.sequences && Array.isArray(record.sequences.sequence)) {
            record.sequences.sequence.forEach(seq => {
                const markerCode = seq.markercode || "N/A";
                const bin = record.bin_uri || "N/A";
                const sequence = seq.nucleotides || "N/A";

                if (sequence !== "N/A" && markerCode !== "N/A" && isValidSequence(sequence)) {
                    liste1[species].push({ markerCode, bin, sequence });
                }
            });
        } else if (record.sequences && record.sequences.sequence) {
            const markerCode = record.sequences.sequence.markercode || "N/A";
            const bin = record.bin_uri || "N/A";
            const sequence = record.sequences.sequence.nucleotides || "N/A";

            if (sequence !== "N/A" && markerCode !== "N/A" && isValidSequence(sequence)) {
                liste1[species].push({ markerCode, bin, sequence });
            }
        }
    });

    Object.keys(liste1).forEach(species => {
        liste1BySpecies[species] = liste1[species];
    });

    return liste1;
}



// Fonction qui vérifie si une séquence ne contient que "a", "t", "g", "c", MAIS ne marche pas !!
function isValidSequence(sequence) {
    const validChars = /^[atgc]+$/i; 
    return validChars.test(sequence);
}



function filterAndSelectLongestSequence(liste1, selectedMarker) {
    const excludeLowSeq = document.getElementById("excludeLowSeqCheckbox").checked;

    if (selectedMarker !== "all") {
        // Filtrer par markerCode spécifique
        const filteredList = liste1.filter(entry => entry.markerCode === selectedMarker);
        if (filteredList.length === 0) {
            return null; // Aucune séquence trouvée pour ce marker
        }

        // Vérifier si l'espèce doit être exclue en fonction du nombre de séquences
        if (excludeLowSeq && filteredList.length <= 3) {
            return null; // Exclure cette espèce
        }

        // Sélectionner la séquence la plus longue
        return filteredList.reduce((a, b) => (a.sequence?.length || 0) > (b.sequence?.length || 0) ? a : b);
    } else {
        // Vérifier si tous les BIN sont "N/A"
        const allBinsNA = liste1.every(entry => entry.bin === "N/A");

        let filteredList = [];

        if (allBinsNA) {
            // Regrouper par markerCode et compter les occurrences
            const markerCounts = {};
            liste1.forEach(entry => {
                if (entry.markerCode !== "N/A") {  
                    markerCounts[entry.markerCode] = (markerCounts[entry.markerCode] || 0) + 1;
                }
            });

            if (Object.keys(markerCounts).length === 0) {
                return null; // Aucun marker valide trouvé
            }

            // Sélectionner le markerCode avec le plus de séquences
            const maxMarker = Object.keys(markerCounts).reduce((a, b) => markerCounts[a] >= markerCounts[b] ? a : b);

            // Vérifier si ce marker doit être exclu
            if (excludeLowSeq && markerCounts[maxMarker] <= 3) {
                return null; // Exclure cette espèce
            }

            // Filtrer la liste pour ne conserver que les séquences du marker majoritaire
            filteredList = liste1.filter(entry => entry.markerCode === maxMarker);

        } else {
            // Regrouper par BIN et compter les occurrences
            const binCounts = {};
            liste1.forEach(entry => {
                if (entry.bin !== "N/A") {
                    binCounts[entry.bin] = (binCounts[entry.bin] || 0) + 1;
                }
            });

            if (Object.keys(binCounts).length === 0) {
                return null; // Aucun BIN valide trouvé
            }

            // Sélectionner le BIN avec le plus de séquences
            const maxBin = Object.keys(binCounts).reduce((a, b) => binCounts[a] >= binCounts[b] ? a : b);

            // Vérifier si ce BIN doit être exclu
            if (excludeLowSeq && binCounts[maxBin] <= 3) {
                return null; // Exclure cette espèce
            }

            // Filtrer la liste pour ne conserver que les séquences du BIN majoritaire
            filteredList = liste1.filter(entry => entry.bin === maxBin);
        }

        if (filteredList.length === 0) {
            return null; // Rien à retourner si aucune séquence trouvée
        }

        // Sélectionner la séquence la plus longue
        return filteredList.reduce((a, b) => (a.sequence?.length || 0) > (b.sequence?.length || 0) ? a : b);
    }
}






// Liste pour stocker toutes les données de barcode
let allBarcodeData = [];
let speciesSeen = new Set();
let fastaBlob = null;


// Fonction principale pour traiter les données BOLD et afficher la séquence la plus longue
function formatBoldData(boldData) {
    if (!boldData || !boldData.bold_records || !boldData.bold_records.record) {
        return "<p>Aucune donnée BOLD disponible.</p>";
    }

    const records = Array.isArray(boldData.bold_records.record) 
        ? boldData.bold_records.record 
        : [boldData.bold_records.record];

    let formattedHTML = '';

    const speciesData = {};
    records.forEach(record => {
        const species = record.taxonomy?.species?.taxon?.name || "N/A";
        

        if (!speciesData[species]) {
            speciesData[species] = [];
        }
        speciesData[species].push({
            bin: record.bin_uri || "N/A",
            markerCode: record.sequences?.sequence?.markercode || "N/A",
            sequence: record.sequences?.sequence?.nucleotides || "",
            sequenceID: record.sequences?.sequence?.sequenceID || "",
            genbank_accession: record.sequences?.sequence?.genbank_accession || "N/A",
        });
    });

    Object.keys(speciesData).forEach(species => {
        const liste1 = speciesData[species];
        const markerSelect = document.getElementById('marker-select');
        const selectedMarker = markerSelect ? markerSelect.value : "all";
        const longestEntry = filterAndSelectLongestSequence(liste1, selectedMarker);


        // Vérification : est-ce que tous les markerCode sont "N/A" ?
        const allMarkerCodesNA = liste1.every(entry => entry.markerCode === "N/A");

        // Regrouper les séquences par markerCode et BIN
        const groupedData = {};
        liste1.forEach(({ markerCode, bin, sequence }) => {
            const key = `${markerCode}-${bin}`;
            if (!groupedData[key]) {
                groupedData[key] = {
                    markerCode,
                    bin,
                    sequences: []
                };
            }
            groupedData[key].sequences.push(sequence);
        });


        // Construire le tableau "Présentation des séquences"
        let presentationTable = `
           <div class="sequences-container">
            <h5>Sequence summary</h5>
              <table border="1" style="border-collapse: collapse;">
                  <tr>
                       <th style="padding: 10px;">Marker Code</th>
                        <th style="padding: 10px;">BIN</th>
                        <th style="padding: 10px;">Total number of sequences</th>
                        <th style="padding: 10px;">Number of unique sequences</th>
                    </tr>`;

        // Trier les données par markerCode par ordre alphabétique
        const sortedData = Object.values(groupedData).sort((a, b) => {
            return a.markerCode.localeCompare(b.markerCode);
        });

        sortedData.forEach(({ markerCode, bin, sequences }) => {
            const uniqueSequences = [...new Set(sequences)];
         presentationTable += `
        <tr>
            <td style="padding: 10px;">${markerCode}</td>
            <td style="padding: 10px;">${bin}</td>
            <td style="padding: 10px;">${sequences.length}</td>
            <td style="padding: 10px;">${uniqueSequences.length}</td>
        </tr>`;
        });

        presentationTable += `</table></div>`;

        // Ajout du tableau à la sortie HTML
        formattedHTML += presentationTable;

        if (allMarkerCodesNA) {
            formattedHTML += `
                <div class="barcode-container">
                    <h5>Representative barcode</h5>
                    <p>No marker code associated to ${species}.</p>
                </div>`;
            return; // On passe à l'espèce suivante
        }

        if (longestEntry === null) {
            formattedHTML += `
                <div class="barcode-container">
                    <h5>Representative barcode</h5>
                    <p>Not enough sequences available to determine a representative barcode or no sequence associated with marker code ${selectedMarker} for ${species}.</p>
                </div>`;
            return; 
        }


        // Si une séquence a été trouvée, afficher les détails
        const { sequence, markerCode, bin, genbank_accession, sequenceID } = longestEntry;

        const formattedSpecies = species.toLowerCase().replace(/\s+/g, "_");

        const newEntry = {
            species: formattedSpecies,
            markerCode: longestEntry.markerCode,
            bin: longestEntry.bin,
            genbank_accession: longestEntry.genbank_accession,
            sequence: longestEntry.sequence,
            sequenceID: longestEntry.sequenceID
        };

        // Vérifier si l'espèce est déjà présente dans allBarcodeData
        const existingIndex = allBarcodeData.findIndex(entry => entry.species === species);

        if (existingIndex !== -1) {
            // Remplacer l'ancienne entrée par la nouvelle
            allBarcodeData[existingIndex] = newEntry;
        } else {
            // Ajouter une nouvelle entrée si l'espèce n'existe pas encore
            allBarcodeData.push(newEntry);
        }

        formattedHTML += `
            <div class="barcode-container">
                <h5>Representative barcode</h5>
                <ul class="barcode-list" style="list-style-type: none; padding: 0;">
                    <li class="barcode-item"><strong>Marker Code :</strong> ${longestEntry.markerCode}</li>
                    <li class="barcode-item"><strong>BIN :</strong> ${longestEntry.bin}</li>
                    <li class="barcode-item"><strong>Genbank accession :</strong> ${longestEntry.genbank_accession}</li>
                </ul>
                <ul class="barcode-list-sequence" style="list-style-type: none; padding: 0;">
                    <li style="word-wrap: break-word; white-space: normal;">
                        <strong>Sequence :</strong> ${longestEntry.sequence}
                    </li>
                </ul>
            </div>`;
    });

    // Convertir en FASTA
    const fastaData = allBarcodeData.map(entry => {
        return `>${entry.species} | ${entry.sequenceID} | ${entry.markerCode} | ${entry.bin} | ${entry.genbank_accession}\n${entry.sequence}`;
    }).join('\n\n');

    fastaBlob = new Blob([fastaData], { type: "text/plain" });

    return formattedHTML;
}






function findMinDistanceSequence(liste1) {
    let minDistance = Infinity;
    let closestSequence = null;
    let speciesName = '';

    // Comparer chaque séquence avec toutes les autres
    for (const species in liste1) {
        const sequences = liste1[species];

        sequences.forEach((seq1, index) => {
            for (let i = index + 1; i < sequences.length; i++) {
                const seq2 = sequences[i];
                const distance = calculateSequenceDistance(seq1.sequence, seq2.sequence);

                // Mettre à jour la séquence la plus proche si nécessaire
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSequence = seq1;
                    speciesName = species;
                }
            }
        });
    }
}

// Appeler cette fonction après avoir récupéré toutes les séquences et les avoir mises dans liste1
findMinDistanceSequence(liste1BySpecies);







// Fonction pour récupérer les données depuis le serveur Python
async function fetchData() {
        console.log("📡 fetchData() appelée !");
      allBarcodeData = [];
    speciesSeen.clear();
    fastaBlob = null;
  const combinedData = [];

  for (const taxon of taxonList) {
    try {
      const response = await fetch(`/search?taxon=${taxon}`);
      const data = await response.json();
      
      if (Object.keys(data).length > 0) {
        combinedData.push({ taxon, boldData: data[taxon].BOLD, gbifData: data[taxon].GBIF });
      } else {
        console.warn(`Aucune donnée trouvée pour le taxon ${taxon}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des données pour le taxon ${taxon}:`, error);
    }
  }

  if (combinedData.length > 0) {
    displayData(combinedData);
  } else {
    console.log("Aucune donnée à afficher.");
  }

}





// Récupérer le bouton
var mybutton = document.getElementById("scrollToTopBtn");

// Bouton scroll fixe
window.onscroll = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
};

// Faire défiler la page en haut
mybutton.addEventListener("click", function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: "smooth" // Ajoute une animation douce
    });
});







// Indicateur de chargement dans le HTML
const loadingIndicator = document.createElement('div');
loadingIndicator.id = 'loadingIndicator';
loadingIndicator.style.display = 'none';
loadingIndicator.style.marginTop = '10px';
loadingIndicator.style.marginLeft = '14px';
loadingIndicator.style.padding = '10px';
loadingIndicator.style.backgroundColor = 'rgba(233, 250, 237, 0.8)';
loadingIndicator.style.color = 'black';
loadingIndicator.style.borderRadius = '5px';
loadingIndicator.style.fontSize = '16px';
loadingIndicator.innerText = 'Loading data...';

// Insérer l'indicateur après le bouton "Rechercher"
const Button = document.getElementById('searchButton');
searchButton.parentNode.insertBefore(loadingIndicator, searchButton.nextSibling);

// Création du conteneur pour les boutons
const buttonsContainer = document.createElement('div');
buttonsContainer.style.display = 'flex';
buttonsContainer.style.justifyContent = 'space-between';
buttonsContainer.style.width = '100%';
buttonsContainer.style.marginTop = '10px';


// Création du bouton "Télécharger fichier FASTA"
const downloadButton = document.createElement('button');
downloadButton.id = 'downloadButton';
downloadButton.classList.add('download-button'); // Ajout de la classe
downloadButton.style.display = 'none'; // Caché par défaut
downloadButton.innerText = 'Download FASTA file';


// Ajouter un gestionnaire d'événements pour le téléchargement
downloadButton.addEventListener('click', () => {
    if (fastaBlob) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(fastaBlob);
        a.download = "Mock_Community.fasta";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        alert("Aucune donnée à télécharger !");
    }
});


// Insérer les boutons dans le conteneur
buttonsContainer.appendChild(downloadButton);

// Insérer le conteneur après l'indicateur de chargement
loadingIndicator.parentNode.insertBefore(buttonsContainer, loadingIndicator.nextSibling);

// Fonction pour afficher l'indicateur de chargement
function showLoadingIndicator() {
  loadingIndicator.style.display = 'block';
  downloadButton.style.display = 'none'; // Cacher le bouton de téléchargement pendant le chargement
}

// Fonction pour cacher l'indicateur de chargement
function hideLoadingIndicator() {
  loadingIndicator.style.display = 'none';
  downloadButton.style.display = 'block'; // Afficher une fois le chargement terminé
}

// Modification de la fonction pour exécuter la recherche avec l'indicateur de chargement
searchButton.onclick = () => {
  showLoadingIndicator();
  fetchData().finally(() => {
    hideLoadingIndicator();
  });
};




