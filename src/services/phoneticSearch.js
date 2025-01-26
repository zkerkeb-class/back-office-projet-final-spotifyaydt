// Fonction simplifiée de conversion phonétique pour le français
function getFrenchPhoneticCode(str) {
  if (!str) return '';
  
  // Convertir en minuscules et supprimer les accents
  str = str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Règles de transformation phonétique
  return str
    // Remplacer les groupes de consonnes
    .replace(/ph/g, 'f')
    .replace(/qu/g, 'k')
    .replace(/gu(?=[eiy])/g, 'g')
    .replace(/ch/g, 'sh')
    .replace(/ain|ein|in|un|ym|im/g, 'a')
    .replace(/eau|au|o/g, 'o')
    .replace(/ou|oo/g, 'u')
    .replace(/ai|ei|é|è|ê|ay|er|ez/g, 'e')
    // Simplifier les consonnes doubles
    .replace(/([a-z])\1+/g, '$1')
    // Supprimer les lettres muettes finales
    .replace(/[tdsp]$/, '');
}

// Fonction de calcul de similarité
function calculateSimilarity(str1, str2) {
  const code1 = getFrenchPhoneticCode(str1);
  const code2 = getFrenchPhoneticCode(str2);
  
  let similarity = 0;
  const maxLength = Math.max(code1.length, code2.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (code1[i] === code2[i]) {
      similarity++;
    }
  }
  
  return similarity / maxLength;
}

// Fonction de recherche phonétique
export const phoneticSearch = (query, items, field = '', threshold = 0.3) => {
  if (!query || !items || !Array.isArray(items)) return [];

  // Fonction pour obtenir la valeur à comparer
  const getValue = (item) => {
    if (!item) return '';
    if (field) {
      return item[field]?.toString() || '';
    }
    return item?.toString() || '';
  };

  // Fonction pour calculer la distance de Levenshtein
  const levenshtein = (a, b) => {
    if (!a || !b) return 0;
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  // Normaliser le texte
  const normalize = (text) => {
    if (!text) return '';
    return text.toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const normalizedQuery = normalize(query);

  return items.filter(item => {
    const value = normalize(getValue(item));
    if (!value) return false;

    // Distance de Levenshtein normalisée
    const maxLength = Math.max(normalizedQuery.length, value.length);
    if (maxLength === 0) return false;

    const distance = levenshtein(normalizedQuery, value);
    const similarity = 1 - distance / maxLength;

    return similarity >= threshold;
  });
};

// Fonction de suggestion d'artistes similaires
export function findSimilarArtists(artist, allArtists, maxSuggestions = 5) {
  if (!artist || !allArtists.length) return [];

  const similarities = allArtists
    .filter(a => a.id !== artist.id)
    .map(otherArtist => {
      // Calculer la similarité basée sur plusieurs critères
      const nameSimilarity = calculateSimilarity(artist.name, otherArtist.name);
      const genreSimilarity = artist.genres.filter(g => 
        otherArtist.genres.includes(g)
      ).length / Math.max(artist.genres.length, otherArtist.genres.length);

      return {
        artist: otherArtist,
        score: (nameSimilarity * 0.3) + (genreSimilarity * 0.7)
      };
    });

  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map(s => s.artist);
} 