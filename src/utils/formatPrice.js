/**
 * @fileoverview Utilitaires de formatage
 * @module utils/formatPrice
 * @description
 * Fonctions utilitaires pour le formatage des données,
 * notamment les prix en format monétaire français.
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */

// ============================================================================
// FONCTIONS DE FORMATAGE
// ============================================================================

/**
 * Formate un prix en format monétaire français (EUR)
 * 
 * @param {number} price - Prix à formater
 * @returns {string} Prix formaté (ex: "150 000 €")
 * 
 * @example
 * formatPrice(150000) // "150 000 €"
 * formatPrice(2500.50) // "2 501 €" (arrondi)
 * 
 * @throws {TypeError} Si price n'est pas un nombre
 */
export const formatPrice = (price) => {
  // Validation du paramètre
  if (typeof price !== 'number' || isNaN(price)) {
    console.warn('formatPrice: price doit être un nombre valide', price);
    return '0 €';
  }

  // Formatage avec Intl.NumberFormat pour la localisation française
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0 // Pas de décimales pour les prix immobiliers
  }).format(price);
};

