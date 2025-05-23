const taxonList = [];



// Fonction appelée quand on clique sur "Add"
function addTaxon() {
  const taxonInput = document.getElementById('taxonInput').value.trim();
  if (taxonInput && !taxonList.includes(taxonInput)) {
    taxonList.push(taxonInput);
    updateTaxonList();
  }
  document.getElementById('taxonInput').value = '';
}

// Supprimer un taxon
function removeTaxon(index) {
  taxonList.splice(index, 1);
  updateTaxonList();
}

// Mettre à jour l'affichage
function updateTaxonList() {
  const taxonContainer = document.getElementById('taxonList');
  taxonContainer.innerHTML = '';
  taxonList.forEach((taxon, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = taxon;
    listItem.classList.add('taxon-item');

    const removeButton = document.createElement('button');
    removeButton.textContent = 'x';
    removeButton.classList.add('remove-button');
    removeButton.onclick = () => removeTaxon(index);

    listItem.appendChild(removeButton);
    taxonContainer.appendChild(listItem);
  });
}

function simulateAdd(taxon) {
  document.getElementById('taxonInput').value = taxon;
  document.getElementById('ButtonTaxonInput').click();
}


// Liste ajout
document.getElementById('fileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    const content = e.target.result;
    const taxons = content.split(/\r?\n/).map(t => t.trim()).filter(t => t);
    for (const taxon of taxons) {
      simulateAdd(taxon); 
    }
  };

  reader.readAsText(file);
});







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

    let formattedHTML = '<div class="taxonomy-container">';
    formattedHTML += '<h5 style="text-align: center;">Taxonomy</h5>'; 
    formattedHTML += '<ul style="text-align: left; padding-left: 1rem;">';
    formattedHTML += `<li><strong>Phylum:</strong> ${[...phylumNames].join(", ")}</li>`;
    formattedHTML += `<li><strong>Class:</strong> ${[...classNames].join(", ")}</li>`;
    formattedHTML += `<li><strong>Order:</strong> ${[...orderNames].join(", ")}</li>`;
    formattedHTML += `<li><strong>Family:</strong> ${[...familyNames].join(", ")}</li>`;
    formattedHTML += `<li><strong>Genus:</strong> ${[...genusNames].join(", ")}</li>`;
    formattedHTML += `<li><strong>Species:</strong> ${[...speciesNames].join(", ")}</li>`;
    formattedHTML += '</ul></div>';

    return formattedHTML;
}




function displayData(data) {
  console.log('Affichage des données', data); 
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';  

  data.forEach(({ taxon, boldData, gbifData }) => {
        console.log('Traitement du taxon:', taxon);  
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


    const allSpeciesContainer = document.createElement('div');
    allSpeciesContainer.className = 'all-species-container';

    for (const species in speciesData) {
      const speciesSection = document.createElement('div');
      speciesSection.className = 'species-section';

      const speciesTitle = document.createElement('h4');
      speciesTitle.textContent = species;
      speciesSection.appendChild(speciesTitle);

      const boldContainer = document.createElement('div');
      boldContainer.className = 'bold-container';

      boldContainer.innerHTML += displayTaxonomy({ bold_records: { record: speciesData[species] } });
      boldContainer.innerHTML += formatBoldData({ bold_records: { record: speciesData[species] } });

      speciesSection.appendChild(boldContainer);

    const localisationSection = document.createElement('div');
    localisationSection.className = 'localisation-section';
    boldContainer.appendChild(localisationSection);
      
      const localisationTitle = document.createElement('h5');
      localisationTitle.textContent = 'Location';
      localisationSection.appendChild(localisationTitle);

      localisationSection.style.display = 'flex';
      localisationSection.style.flexDirection = 'column'; 
      localisationSection.style.alignItems = 'center'; 

      const mapContainer = document.createElement('div');
      mapContainer.className = 'map-container';
      mapContainer.id = `map-${taxon.replace(/\s+/g, '-')}-${species.replace(/\s+/g, '-')}`;

      localisationSection.appendChild(mapContainer);

      allSpeciesContainer.appendChild(speciesSection);

      // Initialisation de la carte avec les coordonnées filtrées
      setTimeout(() => {

        const map = L.map(mapContainer.id).setView([35, 0], 0);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Data from GBIF and BOLD'
        }).addTo(map);

        if (gbifData && gbifData.results && Array.isArray(gbifData.results)) {
          let hasPoints = false; 

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

            if (speciesInRecord.toLowerCase().includes(species.toLowerCase())) {
              const lat = parseFloat(record.collection_event?.coordinates?.lat);
              const lon = parseFloat(record.collection_event?.coordinates?.lon);

              if (!isNaN(lat) && !isNaN(lon)) {

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
      }, 200); // Délai de 200ms 
    }

    taxonSection.appendChild(allSpeciesContainer);
    resultsContainer.appendChild(taxonSection);

  });
}






function createListe1(boldData) {
  console.log('Création de liste1 pour les données BOLD'); 
  const markerSelect = document.getElementById('marker-select');
  if (!markerSelect) {
    alert("Marker select element not found.");
    return {};
  }

  const selectedMarker = markerSelect.value;
  
  if (!selectedMarker) {
    alert("Select a markercode");
    return {};
  }

  const minLengthInput = document.getElementById("min-length");
  const minLength = minLengthInput ? parseInt(minLengthInput.value, 10) : 150;

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
        if (Array.isArray(seq.nucleotides)) {  
          seq.nucleotides.forEach(nucleotide => { 
            const markerCode = seq.markercode || "N/A";
            const bin = record.bin_uri || "N/A";
            const sequence = nucleotide || "N/A";

            if (markerCode === selectedMarker && sequence !== "N/A" && isValidSequence(sequence)) {
              liste1[species].push({ markerCode, bin, sequence });
            }
          });
        } else { 
          const markerCode = seq.markercode || "N/A";
          const bin = record.bin_uri || "N/A";
          const sequence = seq.nucleotides || "N/A";

          if (markerCode === selectedMarker && sequence !== "N/A" && isValidSequence(sequence)) {
            liste1[species].push({ markerCode, bin, sequence });
          }
        }
      });
    } else if (record.sequences && record.sequences.sequence) {
      const seq = record.sequences.sequence;
      if (Array.isArray(seq.nucleotides)) {  
        seq.nucleotides.forEach(nucleotide => {
          const markerCode = seq.markercode || "N/A";
          const bin = record.bin_uri || "N/A";
          const sequence = nucleotide || "N/A";

          if (markerCode === selectedMarker && sequence !== "N/A" && isValidSequence(sequence)) {
            liste1[species].push({ markerCode, bin, sequence });
          }
        });
      } else {  
        const markerCode = seq.markercode || "N/A";
        const bin = record.bin_uri || "N/A";
        const sequence = seq.nucleotides || "N/A";

        if (markerCode === selectedMarker && sequence !== "N/A" && isValidSequence(sequence)) {
          liste1[species].push({ markerCode, bin, sequence });
        }
      }
    }
  });

  Object.keys(liste1).forEach(species => {
    liste1[species] = liste1[species].filter(entry => entry.sequence.length >= minLength);
  });

  return liste1;
}





function filterAndSelectLongestSequence(liste1, selectedMarker) {
    const excludeLowSeq = document.getElementById("excludeLowSeqCheckbox").checked;

    const minLengthInput = document.getElementById("min-length");
    const minLength = minLengthInput ? parseInt(minLengthInput.value, 10) : 150;

    liste1 = liste1.filter(entry => entry.sequence && entry.sequence.length >= minLength);
    if (liste1.length === 0) {
        return null; // 
    }

    if (selectedMarker !== "all") {
        const filteredList = liste1.filter(entry => entry.markerCode === selectedMarker);
        if (filteredList.length === 0) {
            return null; 
        }

        // Vérifier si l'espèce doit être exclue en fonction du nombre de séquences
        if (excludeLowSeq && filteredList.length <= 3) {
            return null; // Exclure cette espèce
        }

        // Sélectionner la séquence la plus longue
        return filteredList.reduce((a, b) => (a.sequence?.length || 0) > (b.sequence?.length || 0) ? a : b);
    } else {
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
            return null; 
        }

        // Sélectionner la séquence la plus longue
        return filteredList.reduce((a, b) => (a.sequence?.length || 0) > (b.sequence?.length || 0) ? a : b);
    }
}




function isValidSequence(sequence) {
    const regex = /^[ATCG]*$/;
    return regex.test(sequence);
}




let allBarcodeData = [];
let speciesSeen = new Set();
let fastaBlob = null;


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

    const sequences = record.sequences?.sequence;

    if (Array.isArray(sequences)) {
        sequences.forEach(seq => {
            let nucleotides = seq.nucleotides || "";
            if (Array.isArray(nucleotides)) {
                nucleotides.forEach(nuc => {
                    const cleanedSequence = nuc.replace(/-/g, "");
                    speciesData[species].push({
                        bin: record.bin_uri || "N/A",
                        markerCode: seq.markercode || "N/A",
                        sequence: cleanedSequence,
                        sequenceID: seq.sequenceID || "",
                        genbank_accession: seq.genbank_accession || "N/A",
                    });
                });
            } else {
                const cleanedSequence = nucleotides.replace(/-/g, "");
                speciesData[species].push({
                    bin: record.bin_uri || "N/A",
                    markerCode: seq.markercode || "N/A",
                    sequence: cleanedSequence,
                    sequenceID: seq.sequenceID || "",
                    genbank_accession: seq.genbank_accession || "N/A",
                });
            }
        });
    } else if (sequences) {
        let nucleotides = sequences.nucleotides || "";
        if (Array.isArray(nucleotides)) {
            nucleotides.forEach(nuc => {
                const cleanedSequence = nuc.replace(/-/g, "");
                speciesData[species].push({
                    bin: record.bin_uri || "N/A",
                    markerCode: sequences.markercode || "N/A",
                    sequence: cleanedSequence,
                    sequenceID: sequences.sequenceID || "",
                    genbank_accession: sequences.genbank_accession || "N/A",
                });
            });
        } else {
            const cleanedSequence = nucleotides.replace(/-/g, "");
            speciesData[species].push({
                bin: record.bin_uri || "N/A",
                markerCode: sequences.markercode || "N/A",
                sequence: cleanedSequence,
                sequenceID: sequences.sequenceID || "",
                genbank_accession: sequences.genbank_accession || "N/A",
            });
        }
    }

    });

    Object.keys(speciesData).forEach(species => {
        const liste1 = speciesData[species];
        const markerSelect = document.getElementById('marker-select');
        const selectedMarker = markerSelect ? markerSelect.value : "all";
        const longestEntry = filterAndSelectLongestSequence(liste1, selectedMarker);

        const allMarkerCodesNA = liste1.every(entry => entry.markerCode === "N/A");

        // Filtrage des séquences sur le marker code sélectionné
        const filteredListe1 = selectedMarker === "all"
            ? liste1
            : liste1.filter(entry => entry.markerCode === selectedMarker);

        const groupedData = {};
        filteredListe1.forEach(({ markerCode, bin, sequence }) => {
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

        formattedHTML += presentationTable;

        if (allMarkerCodesNA) {
            formattedHTML += `
                <div class="barcode-container">
                    <h5>Representative barcode</h5>
                    <p>No marker code associated to ${species}.</p>
                </div>`;
            return; 
        }

        if (longestEntry === null) {
            formattedHTML += `
                <div class="barcode-container">
                    <h5>Representative barcode</h5>
                    <p>Not enough sequences available to determine a representative barcode or no sequence associated with marker code ${selectedMarker} for ${species}.</p>
                </div>`;
            return; 
        }

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

        const existingIndex = allBarcodeData.findIndex(entry => entry.species === species);

        if (existingIndex !== -1) {
            allBarcodeData[existingIndex] = newEntry;
        } else {
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
                    <li>
                        <strong>Sequence :</strong>
                        <div style="text-align: left; font-size: 0.85rem; margin-top: 1rem; word-wrap: break-word; white-space: normal;">
                         ${longestEntry.sequence}
                         </div>
                    </li>
                </ul>
            </div>`;
    });

    // Convertir en FASTA
    const fastaData = allBarcodeData.map(entry => {
       const speciesFormatted = entry.species.charAt(0).toUpperCase() + entry.species.slice(1);
       return `>${speciesFormatted} | ${entry.sequenceID} | ${entry.markerCode} | ${entry.bin} | ${entry.genbank_accession}\n${entry.sequence}`;
    }).join('\n\n');

    fastaBlob = new Blob([fastaData], { type: "text/plain" });

    return formattedHTML;
}









// Fonction pour récupérer les données depuis le serveur Python
async function fetchData() {
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
        behavior: "smooth" 
    });
});




// Création du conteneur pour les boutons
const buttonsContainer = document.createElement('div');
buttonsContainer.style.display = 'flex';
buttonsContainer.style.justifyContent = 'space-between';
buttonsContainer.style.width = '100%';
buttonsContainer.style.marginTop = '10px';

const downloadButton = document.createElement('button');
downloadButton.id = 'downloadButton';
downloadButton.classList.add('download-button');
downloadButton.style.display = 'none'; 
downloadButton.title = ""; // <- ici

downloadButton.innerHTML = `
  <span class="button-text">Download FASTA file</span>
  <span class="spinner" style="display: none;"></span>
  <span class="tooltip-container">
    <span class="help-icon">?</span>
    <span class="tooltip-text">Loading may take several minutes. The FASTA file has the following format: >species | sequenceID | markerCode | bin | genbank_accession</span>
`;

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

buttonsContainer.appendChild(downloadButton);

const searchButton = document.getElementById('searchButton');
searchButton.parentNode.insertBefore(buttonsContainer, searchButton.nextSibling);

function showLoadingIndicator() {
  downloadButton.style.display = 'inline-flex';
  downloadButton.querySelector('.button-text').style.display = 'none';
  downloadButton.querySelector('.spinner').style.display = 'inline-block';
  downloadButton.disabled = true;
}

function hideLoadingIndicator() {
  downloadButton.querySelector('.spinner').style.display = 'none';
  downloadButton.querySelector('.button-text').style.display = 'inline';
  downloadButton.disabled = false;
}

searchButton.onclick = () => {
  showLoadingIndicator();
  fetchData().finally(() => {
    hideLoadingIndicator();
  });
};


