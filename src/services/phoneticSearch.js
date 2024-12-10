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
export function phoneticSearch(query, items, field = 'name', threshold = 0.3) {
  if (!query) return items;

  const queryPhonetic = getFrenchPhoneticCode(query);
  
  return items.map(item => ({
    item,
    similarity: Math.max(
      // Vérifier la similarité phonétique
      calculateSimilarity(query, item[field]),
      // Vérifier si le terme de recherche est inclus dans le nom
      item[field].toLowerCase().includes(query.toLowerCase()) ? 1 : 0,
      // Vérifier si le nom commence par le terme de recherche
      item[field].toLowerCase().startsWith(query.toLowerCase()) ? 1 : 0
    )
  }))
  .filter(({ similarity }) => similarity >= threshold)
  .sort((a, b) => b.similarity - a.similarity)
  .map(({ item }) => item);
}

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