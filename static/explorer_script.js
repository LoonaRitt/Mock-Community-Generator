const flatTaxa = [];
const selectedItems = new Set();


function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


document.getElementById("marker-select").addEventListener("change", function () {
    const selectedMarker = this.value;
});



document.getElementById('searchButton').addEventListener('click', function () {
const fullTaxonName = document.getElementById('taxonInput').value.trim();
const taxonName = fullTaxonName.split(' ')[0]; 

if (fullTaxonName.split(/\s+/).length >= 2) {
  alert("Search for the genus associated with your input. The species name will be displayed in blue in the tree.");
}
  if (!taxonName) {
    alert("Please enter a taxon name.");
    return;
  }

  document.getElementById('loadingSpinner').style.display = 'block';

    const hierarchy = {};

    flatTaxa.forEach(taxon => {
      const {
        kingdom,
        phylum,
        class: className, 
        order,
        family,
        genus,
        canonicalName
      } = taxon;

      if (!kingdom || kingdom === "Non spécifié") return;
      if (!phylum || phylum === "Non spécifié") return;
      if (!className || className === "Non spécifié") return;
      if (!order || order === "Non spécifié") return;
      if (!family || family === "Non spécifié") return;
      if (!genus || genus === "Non spécifié") return;
      if (!canonicalName) return;

      if (!hierarchy[kingdom]) hierarchy[kingdom] = {};
      if (!hierarchy[kingdom][phylum]) hierarchy[kingdom][phylum] = {};
      if (!hierarchy[kingdom][phylum][className]) hierarchy[kingdom][phylum][className] = {};
      if (!hierarchy[kingdom][phylum][className][order]) hierarchy[kingdom][phylum][className][order] = {};
      if (!hierarchy[kingdom][phylum][className][order][family]) hierarchy[kingdom][phylum][className][order][family] = {};
      if (!hierarchy[kingdom][phylum][className][order][family][genus]) hierarchy[kingdom][phylum][className][order][family][genus] = [];

      hierarchy[kingdom][phylum][className][order][family][genus].push(canonicalName);
    });
    const familyToGenera = getGeneraFromHierarchy(hierarchy);
    console.log(familyToGenera);

    // Affichage des données BOLD
  fetch(`/searchBOLD?taxon=${encodeURIComponent(taxonName)}`)
  .then(response => response.json())
  .then(boldData => {
    const taxoTree = {};
    const selectedMarker = document.getElementById("marker-select").value;

    let higherRank = null; 

    Object.values(boldData).forEach(group => {
      const records = group.BOLD?.bold_records?.record || [];

      records.forEach(record => {
        const taxonomy = record.taxonomy || {};
        const sequences = record.sequences?.sequence || [];

        const taxoLevels = [
          { rank: "kingdom", value: taxonomy.kingdom?.taxon?.name },
          { rank: "phylum", value: taxonomy.phylum?.taxon?.name },
          { rank: "class", value: taxonomy.class?.taxon?.name },
          { rank: "order", value: taxonomy.order?.taxon?.name },
          { rank: "family", value: taxonomy.family?.taxon?.name },
          { rank: "genus", value: taxonomy.genus?.taxon?.name },
          { rank: "species", value: taxonomy.species?.taxon?.name }
        ];

        const inputNameLower = taxonName.toLowerCase();
        for (let i = 0; i < taxoLevels.length; i++) {
          const current = taxoLevels[i];
          if (current.value && current.value.toLowerCase() === inputNameLower) {
            const currentRank = current.rank.toUpperCase();
            higherRank = taxoLevels[i - 1]?.value || "Not found";
            break;
          }
        }


        // Normalisation en tableau
        const sequenceArray = Array.isArray(sequences) ? sequences : [sequences];

        const phylum = taxonomy.phylum?.taxon?.name;
        const className = taxonomy.class?.taxon?.name;
        const order = taxonomy.order?.taxon?.name;
        const family = taxonomy.family?.taxon?.name;
        const genus = taxonomy.genus?.taxon?.name;
        const species = taxonomy.species?.taxon?.name;

        if (phylum && className && order && family && genus && species) {
          taxoTree[phylum] ??= {};
          taxoTree[phylum][className] ??= {};
          taxoTree[phylum][className][order] ??= {};
          taxoTree[phylum][className][order][family] ??= {};
          taxoTree[phylum][className][order][family][genus] ??= {};
          taxoTree[phylum][className][order][family][genus][species] ??= [];

    sequenceArray.forEach(seq => {
      if (selectedMarker === "all" || seq.markercode === selectedMarker) {
        const sequenceInfo = {
         sequenceID: seq.sequenceID || null,
         genbank: seq.genbank_accession || null,
         markercode: seq.markercode || null,
         nucleotides: seq.nucleotides || null
        };
        taxoTree[phylum][className][order][family][genus][species].push(sequenceInfo);
      }
      });

        }
      });
    });


      function countSequencesPerGenus(tree) {
        const genusCounts = {};

        for (const phylum in tree) {
          for (const className in tree[phylum]) {
            for (const order in tree[phylum][className]) {
              for (const family in tree[phylum][className][order]) {
                for (const genus in tree[phylum][className][order][family]) {
                  let genusTotal = 0;
                  for (const species in tree[phylum][className][order][family][genus]) {
                    const sequences = tree[phylum][className][order][family][genus][species];
                    genusTotal += sequences.length;
                  }
                  genusCounts[genus] = genusTotal;
                }
              }
            }
          }
        }

        return genusCounts;
      }

      function countSequencesPerFamily(tree) {
        const familyCounts = {};

        for (const phylum in tree) {
          for (const className in tree[phylum]) {
            for (const order in tree[phylum][className]) {
              for (const family in tree[phylum][className][order]) {
                let familyTotal = 0;
                for (const genus in tree[phylum][className][order][family]) {
                  for (const species in tree[phylum][className][order][family][genus]) {
                    const sequences = tree[phylum][className][order][family][genus][species];
                    familyTotal += sequences.length;
                  }
                }
                familyCounts[family] = familyTotal;
              }
            }
          }
        }

        return familyCounts;
      }

      const genusSequenceCounts = countSequencesPerGenus(taxoTree);
      const familySequenceCounts = countSequencesPerFamily(taxoTree);
      const totalSequences = Object.values(genusSequenceCounts).reduce((sum, count) => sum + count, 0);

if (totalSequences === 0) {
  alert(`No sequences found for this taxon with the selected markercode. Please restart the search for the higher-level taxon: ${higherRank}`);
  document.getElementById('loadingSpinner').style.display = 'none';
  return;
}
    renderTaxonomyTree(taxoTree, genusSequenceCounts, familySequenceCounts, fullTaxonName);
  })
  .catch(error => {
    console.error("Erreur lors de la récupération des données BOLD :", error);
  });

})





function getGeneraFromHierarchy(hierarchy) {
  const familyToGeneraMap = {};

  for (const kingdom in hierarchy) {
    for (const phylum in hierarchy[kingdom]) {
      for (const className in hierarchy[kingdom][phylum]) {
        for (const order in hierarchy[kingdom][phylum][className]) {
          for (const family in hierarchy[kingdom][phylum][className][order]) {
            const genera = Object.keys(hierarchy[kingdom][phylum][className][order][family]);
            if (genera.length > 0) {
              familyToGeneraMap[family] = genera;
            }
          }
        }
      }
    }
  }

  return familyToGeneraMap;
}




function extractTaxonomyPaths(boldData) {
  const taxonomyPaths = [];

  for (const family in boldData) {
    const records = boldData[family]?.BOLD?.bold_records?.record || [];
    
    records.forEach(record => {
      const taxonomy = record?.taxonomy;
      
      if (taxonomy) {
        const kingdom = taxonomy?.phylum?.taxon?.name || "Non spécifié";
        const phylum = taxonomy?.phylum?.taxon?.name || "Non spécifié";
        const className = taxonomy?.class?.taxon?.name || "Non spécifié";
        const order = taxonomy?.order?.taxon?.name || "Non spécifié";
        const family = taxonomy?.family?.taxon?.name || "Non spécifié";
        const genus = taxonomy?.genus?.taxon?.name || "Non spécifié";
        const species = taxonomy?.species?.taxon?.name || "Non spécifié";

        const taxonomicPath = [
          `Kingdom: ${kingdom}`,
          `Phylum: ${phylum}`,
          `Class: ${className}`,
          `Order: ${order}`,
          `Family: ${family}`,
          `Genus: ${genus}`,
          `Species: ${species}`
        ].join(" > ");

        taxonomyPaths.push(taxonomicPath);
      }
    });
  }

  console.log(taxonomyPaths);
}

extractTaxonomyPaths(boldData);



function createTreeHTML(obj) {
  const ul = document.createElement("ul");

  for (const key in obj) {
    const li = document.createElement("li");

    if (Array.isArray(obj[key])) {
      const totalLength = obj[key].reduce((acc, seq) => {
        const len = seq.nucleotides ? seq.nucleotides.length : 0;
        return acc + len;
      }, 0);
      li.textContent = `${key} (Total length: ${totalLength} bp)`;
    } else {
      li.textContent = key;
      li.appendChild(createTreeHTML(obj[key])); 
    }
    console.log(key)
    ul.appendChild(li);
  }

  return ul;
}




const container = document.getElementById("taxonomyTree");
container.innerHTML = ""; 
container.appendChild(createTreeHTML(taxoTree));



document.getElementById('sortSelect').addEventListener('change', () => {
  if (window.latestTree && window.latestGenusCounts && window.latestFamilyCounts) {
    renderTaxonomyTree(window.latestTree, window.latestGenusCounts, window.latestFamilyCounts);
  }
});



function addToSelection(name, element) {
  if (selectedItems.has(name)) {
    selectedItems.delete(name);
    element.classList.remove('selected');
  } else {
    selectedItems.add(name);
    element.classList.add('selected');
  }
}


function downloadListAsTxt() {
  const blob = new Blob([Array.from(selectedItems).join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'selected_taxa.txt';
  a.click();
  URL.revokeObjectURL(url);
}


function toggleSpeciesVisibility(toggleId, button) {
  const genusElement = document.getElementById(toggleId);
  if (!genusElement) return;

  const currentlyHidden = genusElement.style.display === 'none';
  genusElement.style.display = currentlyHidden ? '' : 'none';
  button.textContent = currentlyHidden ? ' - ' : ' + ';
}



function renderTaxonomyTree(tree, genusSequenceCounts, familySequenceCounts, fullTaxonName = "", higherTaxon = "") {
  const container = document.getElementById("taxonomyTree");
  container.innerHTML = "";
  const sortMode = document.getElementById('sortSelect')?.value || 'alpha';
  container.style.fontSize = 'clamp(12px, 1.1vw, 15px)';     
  container.style.marginLeft = '-180px'; 
  container.style.marginTop = '10px'; 

  function createList(obj, level = 0, parentPrefixes = []) {
    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none';
    ul.style.margin = '0';
    ul.style.padding = '0';

    let keys = Object.keys(obj);
    if (sortMode === 'sequenceCount') {
      if (level === 3) keys.sort((a, b) => (familySequenceCounts[b] || 0) - (familySequenceCounts[a] || 0));
      else if (level === 4) keys.sort((a, b) => (genusSequenceCounts[b] || 0) - (genusSequenceCounts[a] || 0));
      else if (level === 5) keys.sort((a, b) => (obj[b]?.length || 0) - (obj[a]?.length || 0));
      else keys.sort();
    } else {
      keys.sort((a, b) => a.localeCompare(b));
    }

    const ranks = ["PHYLUM", "CLASS", "ORDER", "FAMILY", "GENUS", "SPECIES"];

    keys.forEach((key, index) => {
      const li = document.createElement('li');
      const isLast = index === keys.length - 1;

      let prefixHTML = '';
      parentPrefixes.forEach((isLastParent) => {
        prefixHTML += isLastParent
          ? '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
          : '<span style="color: darkgray;">│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
      });

      const branch = (level === 0) ? '' : (isLast ? '└── ' : '├── ');
      prefixHTML += `<span style="color: darkgray;">${branch}</span>`;

      let label = '';
      if (level === 3) { // FAMILY
        const genusKeys = Object.keys(obj[key] || {});
        if (genusKeys.length === 1) {
          label = `FAMILY : ${key}`;
        } else {
          const count = familySequenceCounts[key] || 0;
          label = `FAMILY : ${key} (${count} seq)`;
        }
     } else if (level === 4) { // GENUS
        const count = genusSequenceCounts[key] || 0;

        const toggleId = `genus-${key.replace(/\s+/g, '_')}`; 
label = `
  <span style="display: inline-flex; align-items: center; gap: 6px; margin-left: -38px; margin-top: -28px; margin-bottom: -28px;">
    <span class="selectable-name" onclick="addToSelection('${key}', this)">
      GENUS : ${key} (${count} seq)
    </span>
    <button onclick="toggleSpeciesVisibility('${toggleId}', this)" class="toggle-button"> - </button>
  </span>`;

      } else if (level === 5) { 
        const count = obj[key].length;
        if (key.toLowerCase() === fullTaxonName.toLowerCase()) {
          console.log("Espèce trouvée :", key);
          label = `<span class="selectable-name species-highlight" onclick="addToSelection('${key}', this)">${key} (${count} seq)</span>`;
        } else {
          label = `<span class="selectable-name" onclick="addToSelection('${key}', this)">${key} (${count} seq)</span>`;
        }
      } else {
        label = `${ranks[level]} : ${key}`;
      }

    li.innerHTML = `
     <div class="taxon-line">
       ${prefixHTML}${label}
      </div>
    `;

      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
    const speciesList = createList(obj[key], level + 1, [...parentPrefixes, isLast]);
    speciesList.id = `genus-${key.replace(/\s+/g, '_')}`;
    li.appendChild(speciesList);
      }

      ul.appendChild(li);
    });

    return ul;
  }
const title = document.createElement('h2');
title.textContent = "Taxonomy Tree";
title.style.marginBottom = '50px';
title.style.marginLeft = '200px';
title.style.textAlign = 'center';  
title.style.fontSize = 'clamp(30px, 4vw, 35px)';      
container.appendChild(title);


  container.appendChild(createList(tree));
  document.getElementById('loadingSpinner').style.display = 'none';

}
