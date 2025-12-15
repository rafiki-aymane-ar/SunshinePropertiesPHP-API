/**
 * @fileoverview Composant ChatBot pour la recherche de propriétés
 * @module Components/ChatBot
 * @description
 * Chatbot interactif qui pose des questions à l'utilisateur et suggère
 * des propriétés basées sur ses réponses.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import '../style/ChatBot.css';

// Composant mémorisé pour les messages
const MessageItem = memo(({ msg, handleAnswer, handlePropertyClick, handleRestart, inputRef, isLastQuestion }) => {
  return (
    <div className={`message ${msg.sender}`}>
      {msg.sender === 'bot' && (
        <span className="message-avatar">🤖</span>
      )}
      <div className="message-content">
        <p>{msg.text}</p>
        
        {/* Afficher les options de réponse */}
        {msg.data?.type === 'question' && (
          <div className="message-options">
            {msg.data.question.type === 'select' ? (
              <div className="options-grid">
                {msg.data.question.options.map((option, optIndex) => (
                  <button
                    key={optIndex}
                    className="option-button"
                    onClick={() => handleAnswer(option.value, msg.data.questionId)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <form
                className="text-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.target.querySelector('input');
                  const value = input.value.trim();
                  if (value) {
                    handleAnswer(value, msg.data.questionId);
                    input.value = '';
                  }
                }}
              >
                <div className="input-wrapper">
                  <input
                    ref={isLastQuestion ? inputRef : null}
                    type="text"
                    placeholder={msg.data.question.placeholder || "Tapez votre réponse..."}
                    autoFocus={isLastQuestion}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.target.form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                      }
                    }}
                  />
                  <button type="submit" className="submit-btn">
                    <span>✓</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Afficher les propriétés suggérées */}
        {msg.data?.type === 'properties' && (
          <PropertiesList 
            properties={msg.data.properties}
            approximate={msg.data.approximate}
            onPropertyClick={handlePropertyClick}
          />
        )}

        {/* Message pour aucun résultat */}
        {msg.data?.type === 'no-results' && (
          <button className="option-button" onClick={handleRestart}>
            Élargir ma recherche
          </button>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-renders inutiles
  return prevProps.msg === nextProps.msg &&
         prevProps.handleAnswer === nextProps.handleAnswer &&
         prevProps.handlePropertyClick === nextProps.handlePropertyClick &&
         prevProps.handleRestart === nextProps.handleRestart &&
         prevProps.isLastQuestion === nextProps.isLastQuestion;
});

MessageItem.displayName = 'MessageItem';

// Composant mémorisé pour les cartes de propriétés
const PropertyCard = memo(({ property, onClick }) => {
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(property.price || 0);
  }, [property.price]);

  const defaultImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  
  return (
    <div
      className="suggested-property-card"
      onClick={onClick}
    >
      <div className="property-image-wrapper">
        <img 
          src={property.image || defaultImage} 
          alt={property.title} 
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        {property.type && (
          <div className="property-type-badge">
            {property.type}
          </div>
        )}
      </div>
      <div className="property-info">
        <div className="property-header">
          <h4>{property.title}</h4>
          <p className="property-price">{formattedPrice}</p>
        </div>
        <p className="property-location">
          <span className="location-icon">📍</span>
          {property.city || property.address || 'Adresse non disponible'}
        </p>
        <div className="property-features">
          {(property.rooms || property.bedrooms) && (
            <div className="feature-item">
              <span className="feature-icon">🛏️</span>
              <span className="feature-value">{property.rooms || property.bedrooms}</span>
              <span className="feature-label">ch.</span>
            </div>
          )}
          {(property.surface || property.area) && (
            <div className="feature-item">
              <span className="feature-icon">📐</span>
              <span className="feature-value">{property.surface || property.area}</span>
              <span className="feature-label">m²</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PropertyCard.displayName = 'PropertyCard';

// Composant pour afficher la liste des propriétés avec pagination
const PropertiesList = memo(({ properties, approximate, onPropertyClick }) => {
  const [visibleCount, setVisibleCount] = useState(6);
  const INITIAL_COUNT = 6;
  const INCREMENT = 6;
  
  const visibleProperties = useMemo(() => {
    return properties.slice(0, visibleCount);
  }, [properties, visibleCount]);
  
  const hasMore = properties.length > visibleCount;
  const remainingCount = properties.length - visibleCount;
  
  const handleShowMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + INCREMENT, properties.length));
  }, [properties.length]);
  
  const handleShowLess = useCallback(() => {
    setVisibleCount(INITIAL_COUNT);
    // Scroll vers le haut de la liste
    const propertiesContainer = document.querySelector('.suggested-properties');
    if (propertiesContainer) {
      propertiesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  
  return (
    <div className="suggested-properties">
      {approximate && (
        <div className="approximate-note">
          <span className="approximate-icon">⚠️</span>
          <span>Résultats approximatifs basés sur vos critères</span>
        </div>
      )}
      <div className="properties-count">
        {properties.length} propriété{properties.length > 1 ? 's' : ''} trouvée{properties.length > 1 ? 's' : ''}
      </div>
      <div className="properties-list">
        {visibleProperties.map((property, propIndex) => (
          <PropertyCard
            key={property.id || propIndex}
            property={property}
            onClick={() => onPropertyClick(property)}
          />
        ))}
      </div>
      {hasMore && (
        <button className="show-more-btn" onClick={handleShowMore}>
          Voir {Math.min(INCREMENT, remainingCount)} propriété{Math.min(INCREMENT, remainingCount) > 1 ? 's' : ''} de plus
          <span className="arrow">↓</span>
        </button>
      )}
      {visibleCount > INITIAL_COUNT && (
        <button className="show-less-btn" onClick={handleShowLess}>
          Voir moins
          <span className="arrow">↑</span>
        </button>
      )}
    </div>
  );
});

PropertiesList.displayName = 'PropertiesList';

const ChatBot = ({ properties, onPropertySelect, width, height, maxHeight, bottom, right }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [suggestedProperties, setSuggestedProperties] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Debug: Log quand les propriétés changent
  useEffect(() => {
    console.log('🔔 ChatBot: Propriétés reçues:', {
      count: properties?.length || 0,
      sample: properties?.[0],
      allProperties: properties
    });
  }, [properties]);
  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatbotSize, setChatbotSize] = useState(() => {
    const saved = localStorage.getItem('chatbot-size');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      width: width || 715,
      height: height || 700,
      maxHeight: maxHeight || '85vh',
      bottom: bottom || 30,
      right: right || 30
    };
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const filterCacheRef = useRef(new Map());
  const isProcessingAnswerRef = useRef(false);
  const lastQuestionIdRef = useRef(null);
  const containerRef = useRef(null);
  const resizeRef = useRef({ isResizing: false, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });
  const isSearchingRef = useRef(false);

  // Questions du chatbot - mémorisées
  const questions = useMemo(() => [
    {
      id: 'budget',
      question: "Quel est votre budget approximatif ?",
      type: 'select',
      options: [
        { value: '0-100000', label: 'Moins de 100 000 €' },
        { value: '100000-200000', label: '100 000 € - 200 000 €' },
        { value: '200000-300000', label: '200 000 € - 300 000 €' },
        { value: '300000-500000', label: '300 000 € - 500 000 €' },
        { value: '500000+', label: 'Plus de 500 000 €' }
      ]
    },
    {
      id: 'type',
      question: "Quel type de propriété recherchez-vous ?",
      type: 'select',
      options: [
        { value: 'appartement', label: 'Appartement' },
        { value: 'maison', label: 'Maison' },
        { value: 'villa', label: 'Villa' },
        { value: 'terrain', label: 'Terrain' },
        { value: 'bureau', label: 'Bureau/Commercial' }
      ]
    },
    {
      id: 'city',
      question: "Dans quelle ville souhaitez-vous habiter ?",
      type: 'text',
      placeholder: 'Ex: Paris, Lyon, Marseille...'
    },
    {
      id: 'rooms',
      question: "Combien de chambres souhaitez-vous ?",
      type: 'select',
      options: [
        { value: '1', label: '1 chambre' },
        { value: '2', label: '2 chambres' },
        { value: '3', label: '3 chambres' },
        { value: '4', label: '4 chambres' },
        { value: '5+', label: '5 chambres ou plus' }
      ]
    },
    {
      id: 'surface',
      question: "Quelle surface minimum recherchez-vous ?",
      type: 'select',
      options: [
        { value: '0-50', label: 'Moins de 50 m²' },
        { value: '50-80', label: '50 - 80 m²' },
        { value: '80-120', label: '80 - 120 m²' },
        { value: '120-150', label: '120 - 150 m²' },
        { value: '150+', label: 'Plus de 150 m²' }
      ]
    }
  ], []);

  // Fonction pour ajouter un message
  const addMessage = useCallback((sender, text, data = null) => {
    setMessages(prev => [...prev, { sender, text, data, timestamp: new Date() }]);
  }, []);

  // Scroll vers le bas - optimisé avec debounce
  const scrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) {
      cancelAnimationFrame(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  // Parser les réponses texte pour extraire des valeurs numériques
  const parseTextAnswer = useCallback((text, questionId) => {
    const lowerText = text.toLowerCase();
    
    // Parser le budget
    if (questionId === 'budget') {
      const numbers = text.match(/\d+/g);
      if (numbers) {
        const value = parseInt(numbers.join(''));
        if (value < 100000) return '0-100000';
        if (value < 200000) return '100000-200000';
        if (value < 300000) return '200000-300000';
        if (value < 500000) return '300000-500000';
        return '500000+';
      }
    }
    
    // Parser le type
    if (questionId === 'type') {
      if (lowerText.includes('appart') || lowerText.includes('studio')) return 'appartement';
      if (lowerText.includes('maison') || lowerText.includes('house')) return 'maison';
      if (lowerText.includes('villa')) return 'villa';
      if (lowerText.includes('terrain') || lowerText.includes('land')) return 'terrain';
      if (lowerText.includes('bureau') || lowerText.includes('office')) return 'bureau';
    }
    
    // Parser les chambres
    if (questionId === 'rooms') {
      const numbers = text.match(/\d+/);
      if (numbers) {
        const rooms = parseInt(numbers[0]);
        if (rooms >= 5) return '5+';
        return rooms.toString();
      }
    }
    
    // Parser la surface
    if (questionId === 'surface') {
      const numbers = text.match(/\d+/g);
      if (numbers) {
        const value = parseInt(numbers.join(''));
        if (value < 50) return '0-50';
        if (value < 80) return '50-80';
        if (value < 120) return '80-120';
        if (value < 150) return '120-150';
        return '150+';
      }
    }
    
    return text; // Retourner le texte original si pas de parsing possible
  }, []);

  // Fonction de filtrage optimisée avec approximations et cache
  const filterProperties = useCallback(() => {
    if (!properties || properties.length === 0) {
      console.log('⚠️ Aucune propriété disponible pour le filtrage');
      return [];
    }

    console.log('🔍 Filtrage des propriétés:', {
      totalProperties: properties.length,
      userAnswers,
      sampleProperty: properties[0]
    });

    // Créer une clé de cache basée sur les réponses utilisateur
    const cacheKey = JSON.stringify(userAnswers);
    if (filterCacheRef.current.has(cacheKey)) {
      const cached = filterCacheRef.current.get(cacheKey);
      console.log('✅ Utilisation du cache:', cached.length);
      return cached;
    }

    let filtered = [...properties];
    let scores = new Map(); // Système de scoring pour les approximations

    // Fonction helper pour calculer un score de correspondance
    const calculateScore = (property, criteria, weight = 1) => {
      if (!scores.has(property.id)) {
        scores.set(property.id, 0);
      }
      scores.set(property.id, scores.get(property.id) + weight);
    };

    // Filtrer par budget avec tolérance de ±20%
    if (userAnswers.budget) {
      const budgetValue = userAnswers.budget.value;
      let min, max;
      
      if (budgetValue.includes('+')) {
        min = parseInt(budgetValue.replace(/\D/g, ''));
        max = Infinity;
      } else {
        const parts = budgetValue.split('-');
        min = parseInt(parts[0].replace(/\D/g, ''));
        max = parseInt(parts[1]?.replace(/\D/g, '') || '999999999');
      }

      filtered = filtered.filter(prop => {
        const price = parseFloat(prop.price) || 0;
        const tolerance = (max - min) * 0.2; // 20% de tolérance
        const exactMatch = price >= min && (max === Infinity || price <= max);
        const approximateMatch = price >= (min - tolerance) && (max === Infinity || price <= (max + tolerance));
        
        if (exactMatch) {
          calculateScore(prop, 'budget', 2);
          return true;
        } else if (approximateMatch) {
          calculateScore(prop, 'budget', 1);
          return true;
        }
        return false;
      });
    }

    // Filtrer par type avec correspondance flexible
    if (userAnswers.type) {
      const typeValue = userAnswers.type.value.toLowerCase();
      filtered = filtered.filter(prop => {
        const propType = (prop.type || '').toLowerCase();
        const exactMatch = propType.includes(typeValue) || typeValue.includes(propType);
        
        if (exactMatch) {
          calculateScore(prop, 'type', 2);
          return true;
        }
        
        // Correspondances approximatives
        const typeSynonyms = {
          'appartement': ['appart', 'apt', 'studio', 'flat'],
          'maison': ['house', 'home', 'villa'],
          'villa': ['maison', 'house', 'mansion'],
          'terrain': ['land', 'lot', 'parcel'],
          'bureau': ['office', 'commercial', 'bureau']
        };
        
        const synonyms = typeSynonyms[typeValue] || [];
        const hasSynonym = synonyms.some(syn => propType.includes(syn));
        
        if (hasSynonym) {
          calculateScore(prop, 'type', 1);
          return true;
        }
        
        return false;
      });
    }

    // Filtrer par ville avec correspondance partielle
    if (userAnswers.city) {
      const cityValue = userAnswers.city.value.toLowerCase().trim();
      filtered = filtered.filter(prop => {
        const propCity = (prop.city || prop.address || '').toLowerCase();
        if (!propCity) return false; // Ignorer les propriétés sans ville/adresse
        
        const exactMatch = propCity.includes(cityValue) || cityValue.includes(propCity);
        
        if (exactMatch) {
          calculateScore(prop, 'city', 2);
          return true;
        }
        
        // Correspondance partielle (premiers caractères)
        if (cityValue.length >= 3 && propCity.startsWith(cityValue.substring(0, 3))) {
          calculateScore(prop, 'city', 1);
          return true;
        }
        
        return false;
      });
    }

    // Filtrer par nombre de chambres avec tolérance de ±1
    if (userAnswers.rooms) {
      const roomsValue = userAnswers.rooms.value;
      let targetRooms;
      
      if (roomsValue === '5+') {
        targetRooms = 5;
        filtered = filtered.filter(prop => {
          const rooms = parseInt(prop.rooms || prop.bedrooms) || 0;
          if (rooms >= targetRooms) {
            calculateScore(prop, 'rooms', 2);
            return true;
          } else if (rooms >= targetRooms - 1) {
            calculateScore(prop, 'rooms', 1);
            return true;
          }
          return false;
        });
      } else {
        targetRooms = parseInt(roomsValue);
        filtered = filtered.filter(prop => {
          const rooms = parseInt(prop.rooms || prop.bedrooms) || 0;
          if (rooms === targetRooms) {
            calculateScore(prop, 'rooms', 2);
            return true;
          } else if (Math.abs(rooms - targetRooms) <= 1) {
            calculateScore(prop, 'rooms', 1);
            return true;
          }
          return false;
        });
      }
    }

    // Filtrer par surface avec tolérance de ±15%
    if (userAnswers.surface) {
      const surfaceValue = userAnswers.surface.value;
      let min, max;
      
      if (surfaceValue.includes('+')) {
        min = parseInt(surfaceValue.replace(/\D/g, ''));
        max = Infinity;
      } else {
        const parts = surfaceValue.split('-');
        min = parseInt(parts[0].replace(/\D/g, ''));
        max = parseInt(parts[1]?.replace(/\D/g, '') || '999999');
      }

      filtered = filtered.filter(prop => {
        const area = parseFloat(prop.surface || prop.area) || 0;
        const tolerance = (max - min) * 0.15; // 15% de tolérance
        const exactMatch = area >= min && (max === Infinity || area <= max);
        const approximateMatch = area >= (min - tolerance) && (max === Infinity || area <= (max + tolerance));
        
        if (exactMatch) {
          calculateScore(prop, 'surface', 2);
          return true;
        } else if (approximateMatch) {
          calculateScore(prop, 'surface', 1);
          return true;
        }
        return false;
      });
    }

    // Trier par score de correspondance (meilleures correspondances en premier)
    filtered.sort((a, b) => {
      const scoreA = scores.get(a.id) || 0;
      const scoreB = scores.get(b.id) || 0;
      return scoreB - scoreA;
    });

    const result = filtered.slice(0, 8); // Limiter à 8 résultats
    
    // Mettre en cache le résultat (limiter la taille du cache à 10 entrées)
    if (filterCacheRef.current.size >= 10) {
      const firstKey = filterCacheRef.current.keys().next().value;
      filterCacheRef.current.delete(firstKey);
    }
    filterCacheRef.current.set(cacheKey, result);
    
    return result;
  }, [properties, userAnswers]);

  // Recherche avec approximations encore plus larges
  const filterPropertiesWithApproximation = useCallback(() => {
    if (!properties || properties.length === 0) {
      console.log('⚠️ Aucune propriété disponible pour la recherche');
      return [];
    }

    console.log('🔍 Recherche avec approximations:', {
      totalProperties: properties.length,
      userAnswers,
      sampleProperty: properties[0]
    });

    let filtered = [...properties];
    let scores = new Map();

    // Budget avec tolérance de ±50% pour plus de flexibilité
    // Ne pas filtrer, juste scorer pour garder toutes les propriétés
    if (userAnswers.budget) {
      const budgetValue = userAnswers.budget.value;
      let min, max;
      
      if (budgetValue.includes('+')) {
        min = parseInt(budgetValue.replace(/\D/g, '')) * 0.5; // -50%
        max = Infinity;
      } else {
        const parts = budgetValue.split('-');
        min = parseInt(parts[0].replace(/\D/g, '')) * 0.5;
        max = parseInt(parts[1]?.replace(/\D/g, '') || '999999999') * 1.5; // +50%
      }

      filtered.forEach(prop => {
        const price = parseFloat(prop.price) || 0;
        if (price >= min && (max === Infinity || price <= max)) {
          scores.set(prop.id, (scores.get(prop.id) || 0) + 1);
        } else {
          // Même si le budget ne correspond pas, on garde la propriété avec un score plus bas
          scores.set(prop.id, (scores.get(prop.id) || 0) + 0.2);
        }
      });
    } else {
      // Si pas de budget, accepter tous les budgets
      filtered.forEach(prop => {
        scores.set(prop.id, (scores.get(prop.id) || 0) + 0.5);
      });
    }

    // Type - accepter tous les types si pas de correspondance ou avec score réduit
    if (userAnswers.type) {
      const typeValue = userAnswers.type.value.toLowerCase();
      filtered.forEach(prop => {
        const propType = (prop.type || '').toLowerCase();
        if (propType.includes(typeValue) || typeValue.includes(propType)) {
          scores.set(prop.id, (scores.get(prop.id) || 0) + 1);
        } else {
          // Même si le type ne correspond pas exactement, on garde la propriété avec un score plus bas
          scores.set(prop.id, (scores.get(prop.id) || 0) + 0.3);
        }
      });
    } else {
      // Si pas de type spécifié, toutes les propriétés sont acceptables
      filtered.forEach(prop => {
        scores.set(prop.id, (scores.get(prop.id) || 0) + 0.5);
      });
    }

    // Ville - recherche très large, accepter même sans correspondance exacte
    if (userAnswers.city) {
      const cityValue = userAnswers.city.value.toLowerCase().trim();
      filtered.forEach(prop => {
        const propCity = (prop.city || prop.address || '').toLowerCase();
        if (propCity.includes(cityValue) || cityValue.length >= 2 && propCity.includes(cityValue.substring(0, 2))) {
          scores.set(prop.id, (scores.get(prop.id) || 0) + 1);
        } else {
          // Même sans correspondance de ville, on garde la propriété
          scores.set(prop.id, (scores.get(prop.id) || 0) + 0.2);
        }
      });
    } else {
      filtered.forEach(prop => {
        scores.set(prop.id, (scores.get(prop.id) || 0) + 0.5);
      });
    }

    // Chambres - tolérance très large
    if (userAnswers.rooms) {
      const roomsValue = userAnswers.rooms.value;
      let targetRooms = roomsValue === '5+' ? 5 : parseInt(roomsValue);
      
      filtered.forEach(prop => {
        const rooms = parseInt(prop.rooms || prop.bedrooms) || 0;
        if (Math.abs(rooms - targetRooms) <= 2) {
          scores.set(prop.id, (scores.get(prop.id) || 0) + 0.8);
        } else {
          scores.set(prop.id, (scores.get(prop.id) || 0) + 0.3);
        }
      });
    }

    // Surface - tolérance très large
    if (userAnswers.surface) {
      const surfaceValue = userAnswers.surface.value;
      let min, max;
      
      if (surfaceValue.includes('+')) {
        min = parseInt(surfaceValue.replace(/\D/g, '')) * 0.5;
        max = Infinity;
      } else {
        const parts = surfaceValue.split('-');
        min = parseInt(parts[0].replace(/\D/g, '')) * 0.5;
        max = parseInt(parts[1]?.replace(/\D/g, '') || '999999') * 1.5;
      }

      filtered.forEach(prop => {
        const area = parseFloat(prop.surface || prop.area) || 0;
        if (area >= min && (max === Infinity || area <= max)) {
          scores.set(prop.id, (scores.get(prop.id) || 0) + 0.8);
        } else {
          scores.set(prop.id, (scores.get(prop.id) || 0) + 0.3);
        }
      });
    }

    // Trier par score (meilleures approximations en premier)
    filtered.sort((a, b) => {
      const scoreA = scores.get(a.id) || 0;
      const scoreB = scores.get(b.id) || 0;
      return scoreB - scoreA;
    });

    // Retourner au moins 6 propriétés, même si les scores sont faibles
    const result = filtered.slice(0, Math.max(6, filtered.length));
    console.log('✅ Résultats approximatifs:', result.length, result);
    return result;
  }, [properties, userAnswers]);

  const searchProperties = useCallback(() => {
    // Empêcher les appels multiples
    if (isSearchingRef.current) {
      return;
    }
    
    isSearchingRef.current = true;
    setIsSearching(true);
    addMessage('bot', "Parfait ! Je recherche des propriétés qui correspondent à vos critères... 🔍");

    // Utiliser requestIdleCallback si disponible, sinon requestAnimationFrame
    const scheduleSearch = (callback, options) => {
      if (window.requestIdleCallback) {
        return window.requestIdleCallback(callback, options);
      } else {
        return requestAnimationFrame(callback);
      }
    };
    
    scheduleSearch(() => {
      // Utiliser setTimeout pour permettre au UI de se mettre à jour
      setTimeout(() => {
        console.log('🔍 Début de la recherche:', {
          totalProperties: properties?.length || 0,
          userAnswers
        });
        
        const filtered = filterProperties();
        console.log('📊 Résultats du filtrage principal:', filtered.length);
        setSuggestedProperties(filtered);

        if (filtered.length > 0) {
          addMessage('bot', `J'ai trouvé ${filtered.length} propriété(s) qui correspondent à vos critères ! 🎉`, {
            type: 'properties',
            properties: filtered
          });
        } else {
          // Recherche élargie avec approximations - toujours suggérer des approximations
          const approximateResults = filterPropertiesWithApproximation();
          if (approximateResults.length > 0) {
            addMessage('bot', `Je n'ai pas trouvé de correspondance exacte avec vos critères. Voici ${approximateResults.length} propriété(s) qui pourraient vous intéresser :`, {
              type: 'properties',
              properties: approximateResults,
              approximate: true
            });
          } else {
            // Si même les approximations ne donnent rien, suggérer toutes les propriétés disponibles
            const allProperties = properties && properties.length > 0 ? properties.slice(0, 8) : [];
            console.log('📊 Toutes les propriétés disponibles:', allProperties.length, properties?.length);
            
            if (allProperties.length > 0) {
              addMessage('bot', `Je n'ai pas trouvé de propriétés correspondant exactement à vos critères. Voici ${allProperties.length} propriété(s) qui pourraient vous intéresser :`, {
                type: 'properties',
                properties: allProperties,
                approximate: true
              });
            } else {
              console.log('❌ Aucune propriété disponible dans la base de données');
              addMessage('bot', "Je n'ai pas trouvé de propriétés correspondant à vos critères. Voulez-vous élargir votre recherche ?", {
                type: 'no-results'
              });
            }
          }
        }
        setIsSearching(false);
        isSearchingRef.current = false;
      }, 600); // Réduit de 800ms à 600ms
    }, { timeout: 1000 });
  }, [addMessage, filterProperties, filterPropertiesWithApproximation]);

  // Fonction askQuestion - doit être définie après searchProperties
  const askQuestion = useCallback((stepIndex) => {
    if (stepIndex >= questions.length) {
      searchProperties();
      return;
    }

    const question = questions[stepIndex];
    // Vérifier qu'on n'ajoute pas la même question deux fois
    if (lastQuestionIdRef.current !== question.id) {
      lastQuestionIdRef.current = question.id;
      addMessage('bot', question.question, { type: 'question', questionId: question.id, question });
      setCurrentStep(stepIndex);
    }
  }, [addMessage, searchProperties, questions]);

  const handleAnswer = useCallback((answer, questionId) => {
    // Empêcher les doubles clics ou réponses multiples
    if (isProcessingAnswerRef.current) {
      return;
    }
    
    // Vérifier si cette question a déjà été répondue
    if (userAnswers[questionId]) {
      return;
    }
    
    isProcessingAnswerRef.current = true;
    
    // Parser la réponse si c'est du texte libre
    const parsedAnswer = typeof answer === 'string' && answer.length > 10 
      ? parseTextAnswer(answer, questionId) 
      : answer;
    
    // Formater la réponse pour l'affichage
    let displayAnswer = parsedAnswer;
    if (typeof parsedAnswer === 'string') {
      // Capitaliser la première lettre
      displayAnswer = parsedAnswer.charAt(0).toUpperCase() + parsedAnswer.slice(1).toLowerCase();
      // Remplacer les tirets et underscores par des espaces
      displayAnswer = displayAnswer.replace(/[-_]/g, ' ');
      // Limiter la longueur si nécessaire
      if (displayAnswer.length > 50) {
        displayAnswer = displayAnswer.substring(0, 47) + '...';
      }
    }
    
    // Ajouter la réponse de l'utilisateur
    addMessage('user', displayAnswer);
    
    // Sauvegarder la réponse
    const question = questions.find(q => q.id === questionId);
    const option = question?.options?.find(opt => opt.value === parsedAnswer);
    
    setUserAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: {
          value: parsedAnswer,
          label: option?.label || parsedAnswer
        }
      };
      
      // Passer à la question suivante après la mise à jour
      setTimeout(() => {
        const currentStepIndex = Object.keys(newAnswers).length;
        if (currentStepIndex < questions.length) {
          const nextQuestion = questions[currentStepIndex];
          // Vérifier qu'on n'ajoute pas la même question deux fois
          if (lastQuestionIdRef.current !== nextQuestion.id) {
            lastQuestionIdRef.current = nextQuestion.id;
            addMessage('bot', nextQuestion.question, { type: 'question', questionId: nextQuestion.id, question: nextQuestion });
            setCurrentStep(currentStepIndex);
          } else {
            // Si la question est déjà affichée, on réinitialise quand même le flag
            isProcessingAnswerRef.current = false;
          }
        } else {
          searchProperties();
          isProcessingAnswerRef.current = false;
        }
        // Réinitialiser le flag après un délai supplémentaire pour éviter les doubles clics
        setTimeout(() => {
          isProcessingAnswerRef.current = false;
        }, 100);
      }, 300);
      
      return newAnswers;
    });
  }, [parseTextAnswer, addMessage, searchProperties, questions, userAnswers]);

  const handleRestart = useCallback(() => {
    setMessages([]);
    setCurrentStep(0);
    setUserAnswers({});
    setSuggestedProperties([]);
    filterCacheRef.current.clear(); // Vider le cache
    isProcessingAnswerRef.current = false;
    lastQuestionIdRef.current = null;
    isSearchingRef.current = false; // Réinitialiser le flag de recherche
    setIsSearching(false);
    addMessage('bot', "Parfait ! Recommençons. 👋");
    setTimeout(() => {
      const question = questions[0];
      lastQuestionIdRef.current = question.id;
      addMessage('bot', question.question, { type: 'question', questionId: question.id, question });
      setCurrentStep(0);
    }, 1000);
  }, [addMessage, questions]);

  // Initialiser le chatbot avec un message de bienvenue
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      isProcessingAnswerRef.current = false;
      lastQuestionIdRef.current = null;
      addMessage('bot', "Bonjour ! 👋 Je suis votre assistant virtuel. Je vais vous aider à trouver la propriété idéale en quelques questions.");
      setTimeout(() => {
        const question = questions[0];
        lastQuestionIdRef.current = question.id;
        addMessage('bot', question.question, { type: 'question', questionId: question.id, question });
        setCurrentStep(0);
      }, 1000);
    }
  }, [isOpen, messages.length, addMessage, questions]);

  // Scroll vers le bas quand de nouveaux messages arrivent - optimisé
  useEffect(() => {
    if (messages.length > 0) {
      // Délai pour permettre au DOM de se mettre à jour
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, scrollToBottom]); // Utiliser messages.length au lieu de messages

  const handlePropertyClick = (property) => {
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  // Sauvegarder les dimensions dans localStorage
  useEffect(() => {
    localStorage.setItem('chatbot-size', JSON.stringify(chatbotSize));
  }, [chatbotSize]);

  // Gestion du redimensionnement
  const handleMouseDown = useCallback((e) => {
    if (!containerRef.current) return;
    
    e.preventDefault();
    setIsResizing(true);
    const rect = containerRef.current.getBoundingClientRect();
    
    resizeRef.current = {
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
    };

    const handleMouseMove = (e) => {
      if (!resizeRef.current.isResizing) return;
      
      const width = resizeRef.current.startWidth + (e.clientX - resizeRef.current.startX);
      const height = resizeRef.current.startHeight - (e.clientY - resizeRef.current.startY);
      
      const minWidth = 300;
      const minHeight = 400;
      const maxWidth = window.innerWidth - 60;
      const maxHeight = window.innerHeight - 60;
      
      setChatbotSize(prev => ({
        ...prev,
        width: Math.max(minWidth, Math.min(maxWidth, width)),
        height: Math.max(minHeight, Math.min(maxHeight, height)),
      }));
    };

    const handleMouseUp = () => {
      resizeRef.current.isResizing = false;
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  // Gestion des paramètres de taille
  const handleSizeChange = useCallback((type, value) => {
    setChatbotSize(prev => ({
      ...prev,
      [type]: type === 'maxHeight' ? value : parseInt(value) || prev[type]
    }));
  }, []);

  return (
    <>
      {/* Bouton flottant pour ouvrir le chatbot */}
      {!isOpen && (
        <button 
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le chatbot"
        >
          <span className="chatbot-icon">💬</span>
          <span className="chatbot-badge">Nouveau</span>
        </button>
      )}

      {/* Fenêtre du chatbot */}
      {isOpen && (
        <div 
          ref={containerRef}
          className={`chatbot-container ${isResizing ? 'resizing' : ''}`}
          style={{
            '--chatbot-width': `${chatbotSize.width}px`,
            '--chatbot-height': `${chatbotSize.height}px`,
            '--chatbot-max-height': chatbotSize.maxHeight,
            '--chatbot-bottom': `${chatbotSize.bottom}px`,
            '--chatbot-right': `${chatbotSize.right}px`,
          }}
        >
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-avatar">🤖</span>
              <div>
                <h3>Assistant Immobilier</h3>
                <p>En ligne</p>
              </div>
            </div>
            <div className="chatbot-actions">
              <button 
                className="chatbot-settings"
                onClick={() => setShowSettings(!showSettings)}
                title="Paramètres"
              >
                ⚙️
              </button>
              <button 
                className="chatbot-restart"
                onClick={handleRestart}
                title="Recommencer"
              >
                🔄
              </button>
              <button 
                className="chatbot-close"
                onClick={() => setIsOpen(false)}
                aria-label="Fermer le chatbot"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => {
              // Déterminer si c'est la dernière question active
              const isLastQuestion = msg.data?.type === 'question' && 
                index === messages.length - 1 &&
                !messages.slice(index + 1).some(m => m.data?.type === 'question');
              
              return (
                <MessageItem
                  key={`msg-${index}-${msg.timestamp?.getTime() || index}`}
                  msg={msg}
                  handleAnswer={handleAnswer}
                  handlePropertyClick={handlePropertyClick}
                  handleRestart={handleRestart}
                  inputRef={inputRef}
                  isLastQuestion={isLastQuestion}
                />
              );
            })}

            {isSearching && (
              <div className="message bot">
                <span className="message-avatar">🤖</span>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Panneau de paramètres */}
          {showSettings && (
            <div className="chatbot-settings-panel">
              <h4>Personnaliser la taille</h4>
              <div className="settings-group">
                <label>
                  Largeur: {chatbotSize.width}px
                  <input
                    type="range"
                    min="300"
                    max={window.innerWidth - 60}
                    value={chatbotSize.width}
                    onChange={(e) => handleSizeChange('width', e.target.value)}
                  />
                </label>
                <label>
                  Hauteur: {chatbotSize.height}px
                  <input
                    type="range"
                    min="400"
                    max={window.innerHeight - 60}
                    value={chatbotSize.height}
                    onChange={(e) => handleSizeChange('height', e.target.value)}
                  />
                </label>
                <label>
                  Position bas: {chatbotSize.bottom}px
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={chatbotSize.bottom}
                    onChange={(e) => handleSizeChange('bottom', e.target.value)}
                  />
                </label>
                <label>
                  Position droite: {chatbotSize.right}px
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={chatbotSize.right}
                    onChange={(e) => handleSizeChange('right', e.target.value)}
                  />
                </label>
              </div>
              <button 
                className="reset-size-btn"
                onClick={() => {
                  setChatbotSize({
                    width: 715,
                    height: 700,
                    maxHeight: '85vh',
                    bottom: 30,
                    right: 30
                  });
                }}
              >
                Réinitialiser
              </button>
            </div>
          )}

          {/* Poignée de redimensionnement */}
          <div 
            className="chatbot-resize-handle"
            onMouseDown={handleMouseDown}
            title="Redimensionner"
          >
            <span>↘</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

