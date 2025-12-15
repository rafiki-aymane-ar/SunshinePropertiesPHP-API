import React, { useState, useEffect, useRef } from 'react';
import '../style/Messaging.css';

const BASE_URL = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend';

const Messaging = ({ userType, userId, userName }) => {
  // Vérifier que les paramètres requis sont présents
  if (!userType || !userId) {
    console.error('❌ Messaging: Paramètres manquants', { userType, userId, userName });
  }
  
  // Normaliser le userType : 'admin' devient 'agent' pour le système de messages
  const normalizedUserType = userType === 'admin' ? 'agent' : userType;
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageIdRef = useRef(null); // Pour suivre le dernier message chargé
  const typingTimeoutRef = useRef(null); // Pour gérer le timeout de typing
  const typingCheckIntervalRef = useRef(null); // Pour vérifier si l'autre tape

  // Charger les conversations
  useEffect(() => {
    if (!normalizedUserType || !userId) {
      console.error('❌ Paramètres manquants pour charger les conversations:', {
        normalizedUserType,
        userId,
        userType
      });
      setLoading(false);
      return;
    }
    
    fetchConversations();
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchConversations();
      fetchUnreadCount();
    }, 10000); // Rafraîchir toutes les 10 secondes
    return () => clearInterval(interval);
  }, [normalizedUserType, userId]);

  // Scroll vers le bas seulement quand shouldScroll est true et explicitement demandé
  useEffect(() => {
    if (shouldScroll) {
      scrollToBottom();
      setShouldScroll(false);
    }
    // Ne pas dépendre de messages pour éviter les scrolls non désirés
  }, [shouldScroll]);

  // Fonction pour vérifier si l'utilisateur est en bas de la conversation
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return false;
    const container = messagesContainerRef.current;
    const threshold = 150; // pixels depuis le bas
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom < threshold;
  };

  // Rafraîchir automatiquement les messages de la conversation active
  useEffect(() => {
    if (!selectedConversation) {
      lastMessageIdRef.current = null;
      return;
    }

    const refreshMessages = async () => {
      if (!normalizedUserType || !userId) return;

      try {
        let url;
        if (selectedConversation?.id) {
          url = `${BASE_URL}/MessageAPI/get_messages.php?conversation_id=${selectedConversation.id}&user_type=${normalizedUserType}&user_id=${userId}`;
        } else if (selectedConversation?.other_participant?.type && selectedConversation?.other_participant?.id) {
          url = `${BASE_URL}/MessageAPI/get_messages.php?user_type=${normalizedUserType}&user_id=${userId}&other_type=${selectedConversation.other_participant.type}&other_id=${selectedConversation.other_participant.id}`;
        } else {
          return;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.messages) {
          const newMessages = data.messages || [];
          
          // Comparer avec les messages actuels pour détecter les nouveaux
          setMessages(currentMessages => {
            // Si pas de messages actuels, c'est le premier chargement
            if (currentMessages.length === 0) {
              if (newMessages.length > 0) {
                lastMessageIdRef.current = newMessages[newMessages.length - 1]?.id;
                // Scroller vers le bas lors du premier chargement
                setTimeout(() => {
                  scrollToBottom();
                }, 100);
              }
              return newMessages;
            }

            // Vérifier s'il y a de nouveaux messages
            const currentLastId = currentMessages[currentMessages.length - 1]?.id;
            const newLastId = newMessages[newMessages.length - 1]?.id;

            // Si le dernier ID a changé ou si le nombre de messages a augmenté
            if (newMessages.length > currentMessages.length || newLastId !== currentLastId) {
              // Détecter les nouveaux messages (ceux qui ne sont pas dans currentMessages)
              const currentIds = new Set(currentMessages.map(m => m.id));
              const hasNewMessages = newMessages.some(m => !currentIds.has(m.id));

              if (hasNewMessages) {
                // Mettre à jour le dernier ID
                lastMessageIdRef.current = newLastId;

                // Scroller automatiquement vers le bas quand on reçoit un nouveau message
                // Utiliser un délai pour laisser le DOM se mettre à jour
                setTimeout(() => {
                  scrollToBottom();
                }, 200);

                // Mettre à jour le compteur de non-lus
                fetchUnreadCount();
              }

              return newMessages;
            }

            return currentMessages;
          });
        }
      } catch (error) {
        console.error('❌ Erreur rafraîchissement messages:', error);
      }
    };

    // Rafraîchir toutes les 3 secondes (pas immédiatement pour éviter les conflits avec le chargement initial)
    const interval = setInterval(refreshMessages, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation, normalizedUserType, userId]);

  const scrollToBottom = () => {
    // Scroller uniquement le conteneur des messages, JAMAIS toute la page
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Utiliser scrollTo pour un défilement fluide uniquement dans le conteneur
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const fetchConversations = async () => {
    try {
      if (!normalizedUserType || !userId) {
        console.error('❌ Impossible de charger les conversations - paramètres manquants');
        setLoading(false);
        return;
      }
      
      const url = `${BASE_URL}/MessageAPI/get_conversations.php?user_type=${normalizedUserType}&user_id=${userId}`;
      console.log('📡 Chargement des conversations:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Réponse conversations:', data);
      
      if (data.success) {
        console.log(`✅ ${data.conversations?.length || 0} conversations chargées`);
        setConversations(data.conversations || []);
      } else {
        console.error('❌ Erreur chargement conversations:', data.message);
      }
    } catch (error) {
      console.error('❌ Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/MessageAPI/get_unread_count.php?user_type=${normalizedUserType}&user_id=${userId}`
      );
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Erreur chargement non-lus:', error);
    }
  };

  // Charger les messages par ID de conversation (méthode préférée)
  const fetchMessagesByConversationId = async (conversationId, enableScroll = true) => {
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      console.log('🔍 Chargement des messages par ID de conversation:', {
        conversationId,
        userType: normalizedUserType,
        userId
      });
      
      if (!conversationId) {
        throw new Error('ID de conversation manquant');
      }
      
      if (!normalizedUserType || !userId) {
        throw new Error('Paramètres utilisateur manquants');
      }
      
      const url = `${BASE_URL}/MessageAPI/get_messages.php?conversation_id=${conversationId}&user_type=${normalizedUserType}&user_id=${userId}`;
      console.log('📡 URL de requête:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Réponse API messages:', data);
      
      if (data.success) {
        console.log(`✅ ${data.messages?.length || 0} messages chargés`);
        const loadedMessages = data.messages || [];
        setMessages(loadedMessages);
        
        // Initialiser le dernier message ID lors du chargement
        if (loadedMessages.length > 0) {
          lastMessageIdRef.current = loadedMessages[loadedMessages.length - 1]?.id;
        }
        
        fetchUnreadCount(); // Mettre à jour le compteur
        // NE PAS activer le scroll automatiquement - désactivé pour éviter les scrolls indésirables
      } else {
        console.error('❌ Erreur API messages:', data.message);
        setMessagesError(data.message || 'Erreur lors du chargement des messages');
        setMessages([]);
        lastMessageIdRef.current = null;
      }
    } catch (error) {
      console.error('❌ Erreur chargement messages:', error);
      setMessagesError(error.message || 'Impossible de charger les messages. Veuillez réessayer.');
      setMessages([]);
      lastMessageIdRef.current = null;
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchMessages = async (otherType, otherId, enableScroll = true) => {
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      console.log('🔍 Chargement des messages:', {
        userType: normalizedUserType,
        userId,
        otherType,
        otherId
      });
      
      // Vérifier que tous les paramètres sont présents
      if (!normalizedUserType || !userId || !otherType || !otherId) {
        throw new Error('Paramètres insuffisants pour charger les messages');
      }
      
      const url = `${BASE_URL}/MessageAPI/get_messages.php?user_type=${normalizedUserType}&user_id=${userId}&other_type=${otherType}&other_id=${otherId}`;
      console.log('📡 URL de requête:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Réponse API messages:', data);
      
      if (data.success) {
        console.log(`✅ ${data.messages?.length || 0} messages chargés`);
        const loadedMessages = data.messages || [];
        setMessages(loadedMessages);
        
        // Initialiser le dernier message ID lors du chargement
        if (loadedMessages.length > 0) {
          lastMessageIdRef.current = loadedMessages[loadedMessages.length - 1]?.id;
        }
        
        fetchUnreadCount(); // Mettre à jour le compteur
        // NE PAS activer le scroll automatiquement - l'utilisateur contrôle sa position
      } else {
        console.error('❌ Erreur API messages:', data.message);
        setMessagesError(data.message || 'Erreur lors du chargement des messages');
        setMessages([]);
        lastMessageIdRef.current = null;
      }
    } catch (error) {
      console.error('❌ Erreur chargement messages:', error);
      setMessagesError(error.message || 'Impossible de charger les messages. Veuillez réessayer.');
      setMessages([]);
      lastMessageIdRef.current = null;
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchContacts = async () => {
    setContactsLoading(true);
    setContactsError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/MessageAPI/get_contacts.php?user_type=${normalizedUserType}&user_id=${userId}`
      );
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts || {});
        console.log('Contacts chargés:', data.contacts);
      } else {
        setContactsError(data.message || 'Erreur lors du chargement des contacts');
        console.error('Erreur API contacts:', data.message);
      }
    } catch (error) {
      console.error('Erreur chargement contacts:', error);
      setContactsError('Impossible de charger les contacts. Veuillez réessayer.');
    } finally {
      setContactsLoading(false);
    }
  };

  const handleSelectConversation = (conv) => {
    console.log('💬 Conversation sélectionnée:', conv);
    
    // Vérifier que nous avons les paramètres nécessaires
    if (!normalizedUserType || !userId) {
      console.error('❌ Impossible de charger les messages - paramètres utilisateur manquants');
      setMessagesError('Paramètres insuffisants. Veuillez rafraîchir la page.');
      return;
    }
    
    setSelectedConversation(conv);
    setShowNewMessage(false);
    setMessages([]); // Réinitialiser les messages avant de charger
    setMessagesError(null);
    
    // Utiliser l'ID de conversation si disponible (méthode préférée)
    if (conv?.id) {
      console.log('📨 Utilisation de l\'ID de conversation:', conv.id);
      fetchMessagesByConversationId(conv.id, false); // Désactiver le scroll lors de la sélection
    } else if (conv?.other_participant?.type && conv?.other_participant?.id) {
      console.log('📨 Utilisation des paramètres other_participant');
      fetchMessages(conv.other_participant.type, conv.other_participant.id, false); // Désactiver le scroll lors de la sélection
    } else {
      console.error('❌ Conversation invalide - ID ou other_participant manquant:', conv);
      setMessagesError('Conversation invalide. Impossible de charger les messages.');
    }
  };

  const handleNewMessage = () => {
    fetchContacts();
    setShowNewMessage(true);
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    setSelectedConversation({
      other_participant: {
        type: contact.type,
        id: contact.id,
        name: contact.name,
        email: contact.email
      }
    });
    await fetchMessages(contact.type, contact.id, false); // Charger les messages
    setShowNewMessage(false);
    
    // Scroller vers le bas après le chargement des messages
    // Utiliser un délai pour laisser le DOM se mettre à jour
    setTimeout(() => {
      scrollToBottom();
    }, 400);
  };

  // Fonction pour signaler que l'utilisateur est en train d'écrire
  const handleTyping = (text) => {
    if (!selectedConversation || !normalizedUserType || !userId) return;

    // Annuler le timeout précédent
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Si l'utilisateur tape quelque chose
    if (text && text.trim().length > 0) {
      // Signaliser qu'on est en train d'écrire
      sendTypingStatus(true);
      
      // Arrêter de signaliser après 3 secondes d'inactivité
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000);
    } else {
      // Si le champ est vide, arrêter de signaliser
      sendTypingStatus(false);
    }
  };

  // Envoyer le statut de frappe au serveur
  const sendTypingStatus = async (isTyping) => {
    if (!selectedConversation || !normalizedUserType || !userId) return;

    try {
      await fetch(`${BASE_URL}/MessageAPI/set_typing.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_type: normalizedUserType,
          user_id: userId,
          receiver_type: selectedConversation.other_participant.type,
          receiver_id: selectedConversation.other_participant.id,
          is_typing: isTyping
        })
      });
    } catch (error) {
      console.error('Erreur envoi statut typing:', error);
    }
  };

  // Vérifier si l'autre personne est en train d'écrire
  const checkOtherTyping = async () => {
    if (!selectedConversation || !normalizedUserType || !userId) return;

    try {
      const response = await fetch(
        `${BASE_URL}/MessageAPI/get_typing.php?user_type=${normalizedUserType}&user_id=${userId}&sender_type=${selectedConversation.other_participant.type}&sender_id=${selectedConversation.other_participant.id}`
      );
      const data = await response.json();
      
      if (data.success) {
        const wasTyping = isOtherTyping;
        setIsOtherTyping(data.is_typing);
        
        // Si l'autre personne commence à écrire, scroller vers le bas
        if (data.is_typing && !wasTyping) {
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
      }
    } catch (error) {
      console.error('Erreur vérification typing:', error);
    }
  };

  // Vérifier périodiquement si l'autre personne tape
  useEffect(() => {
    if (!selectedConversation) {
      setIsOtherTyping(false);
      if (typingCheckIntervalRef.current) {
        clearInterval(typingCheckIntervalRef.current);
      }
      return;
    }

    // Vérifier immédiatement puis toutes les 2 secondes
    checkOtherTyping();
    typingCheckIntervalRef.current = setInterval(checkOtherTyping, 2000);

    return () => {
      if (typingCheckIntervalRef.current) {
        clearInterval(typingCheckIntervalRef.current);
      }
    };
  }, [selectedConversation, normalizedUserType, userId]);

  // Arrêter de signaliser la frappe quand on envoie le message
  useEffect(() => {
    if (!newMessage.trim() && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      sendTypingStatus(false);
    }
  }, [newMessage]);

  // Scroller vers le bas quand l'indication de typing apparaît
  useEffect(() => {
    if (isOtherTyping && selectedConversation) {
      // Scroller vers le bas quand l'autre personne commence à écrire
      // Utiliser un délai pour laisser le DOM se mettre à jour avec l'animation
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [isOtherTyping, selectedConversation]);

  // Scroller vers le bas quand les messages sont chargés pour la première fois après sélection d'un contact
  useEffect(() => {
    if (selectedConversation && messages.length > 0 && !messagesLoading) {
      // Scroller vers le bas après le chargement initial des messages (première fois seulement)
      // Ne pas scroller si c'est juste une mise à jour des messages
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedConversation?.other_participant?.id, messagesLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    // Arrêter de signaliser la frappe
    sendTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const messageContent = newMessage.trim();
    setSending(true);
    setShouldScroll(false); // Désactiver le scroll lors de l'envoi
    
    // Créer un message optimiste pour l'affichage immédiat
    const optimisticMessage = {
      id: 'temp-' + Date.now(),
      content: messageContent,
      sender_type: normalizedUserType,
      sender_id: parseInt(userId),
      receiver_type: selectedConversation.other_participant.type,
      receiver_id: selectedConversation.other_participant.id,
      created_at: new Date().toISOString(),
      is_read: false,
      is_optimistic: true // Flag pour identifier les messages optimistes
    };

    // Ajouter le message optimiste immédiatement
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);
    setNewMessage('');
    
    // Scroller vers le bas après l'ajout du message optimiste
    setTimeout(() => {
      scrollToBottom();
    }, 50);
    
    // Scroller vers le bas après l'ajout du message optimiste
    setTimeout(() => {
      scrollToBottom();
    }, 50);

    try {
      const response = await fetch(`${BASE_URL}/MessageAPI/send_message.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_type: normalizedUserType,
          sender_id: userId,
          receiver_type: selectedConversation.other_participant.type,
          receiver_id: selectedConversation.other_participant.id,
          content: messageContent
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('Message envoyé avec succès:', data);
        // Recharger les messages depuis le serveur pour avoir la liste complète et à jour
        // Le message optimiste sera remplacé par le vrai message
        // Recharger les messages et scroller vers le bas
        await fetchMessages(
          selectedConversation.other_participant.type,
          selectedConversation.other_participant.id,
          false // Ne pas utiliser le scroll automatique de fetchMessages
        );
        // Scroller manuellement après le rechargement
        setTimeout(() => {
          scrollToBottom();
        }, 100);
        fetchConversations();
      } else {
        console.error('Erreur lors de l\'envoi du message:', data);
        // En cas d'erreur, retirer le message optimiste
        setMessages(prevMessages => prevMessages.filter(msg => !msg.is_optimistic));
        setNewMessage(messageContent); // Remettre le message dans le champ
        alert('Erreur: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      // En cas d'erreur, retirer le message optimiste
      setMessages(prevMessages => prevMessages.filter(msg => !msg.is_optimistic));
      setNewMessage(messageContent); // Remettre le message dans le champ
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="messaging-container">
      {/* Liste des conversations */}
      <div className="conversations-panel">
        <div className="conversations-header">
          <h3>💬 Messages {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h3>
          <button className="new-message-btn" onClick={handleNewMessage}>
            ✏️ Nouveau
          </button>
        </div>

        <div className="conversations-list">
          {loading ? (
            <div className="loading-messages">Chargement...</div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''} ${conv.unread_count > 0 ? 'unread' : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="conv-avatar">
                  {getInitials(conv.other_participant?.name)}
                </div>
                <div className="conv-info">
                  <div className="conv-name">
                    {conv.other_participant?.name || 'Utilisateur'}
                    {conv.unread_count > 0 && (
                      <span className="conv-unread">{conv.unread_count}</span>
                    )}
                  </div>
                  <div className="conv-preview">
                    {conv.last_message_content?.substring(0, 40)}
                    {conv.last_message_content?.length > 40 ? '...' : ''}
                  </div>
                </div>
                <div className="conv-time">
                  {conv.last_message_at ? formatTime(conv.last_message_at) : ''}
                </div>
              </div>
            ))
          ) : (
            <div className="no-conversations">
              <p>📭 Aucune conversation</p>
              <button onClick={handleNewMessage}>Démarrer une conversation</button>
            </div>
          )}
        </div>
      </div>

      {/* Zone de messages */}
      <div className="messages-panel">
        {showNewMessage ? (
          <div className="new-message-panel">
            <h3>Nouveau message</h3>
            <p>Sélectionnez un contact :</p>
            <div className="contacts-list">
              {contactsLoading ? (
                <div className="loading-contacts">
                  <p>Chargement des contacts...</p>
                </div>
              ) : contactsError ? (
                <div className="contacts-error">
                  <p>❌ {contactsError}</p>
                  <button onClick={fetchContacts} className="retry-btn">
                    Réessayer
                  </button>
                </div>
              ) : normalizedUserType === 'client' ? (
                // Liste simple pour les clients
                Array.isArray(contacts) && contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div
                      key={`${contact.type}-${contact.id}`}
                      className="contact-item"
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="contact-avatar">{getInitials(contact.name)}</div>
                      <div className="contact-info">
                        <div className="contact-name">{contact.name}</div>
                        <div className="contact-role">{contact.role || 'Agent'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-contacts">
                    <p>Aucun agent disponible pour le moment.</p>
                  </div>
                )
              ) : (
                // Liste groupée pour les agents/admins
                <>
                  {contacts.agents && contacts.agents.length > 0 && (
                    <div className="contact-group">
                      <h4>👨‍💼 Agents</h4>
                      {contacts.agents.map((contact) => (
                        <div
                          key={`agent-${contact.id}`}
                          className="contact-item"
                          onClick={() => handleSelectContact({ ...contact, type: 'agent' })}
                        >
                          <div className="contact-avatar">{getInitials(contact.name)}</div>
                          <div className="contact-info">
                            <div className="contact-name">{contact.name}</div>
                            <div className="contact-role">{contact.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {contacts.clients && contacts.clients.length > 0 && (
                    <div className="contact-group">
                      <h4>👥 Clients</h4>
                      {contacts.clients.map((contact) => (
                        <div
                          key={`client-${contact.id}`}
                          className="contact-item"
                          onClick={() => handleSelectContact({ ...contact, type: 'client' })}
                        >
                          <div className="contact-avatar">{getInitials(contact.name)}</div>
                          <div className="contact-info">
                            <div className="contact-name">{contact.name}</div>
                            <div className="contact-role">Client</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!contacts.agents || contacts.agents.length === 0) && 
                   (!contacts.clients || contacts.clients.length === 0) && (
                    <div className="no-contacts">
                      <p>Aucun contact disponible pour le moment.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : selectedConversation ? (
          <>
            <div className="messages-header">
              <div className="recipient-info">
                <div className="recipient-avatar">
                  {getInitials(selectedConversation.other_participant?.name)}
                </div>
                <div>
                  <div className="recipient-name">
                    {selectedConversation.other_participant?.name}
                  </div>
                  <div className="recipient-status">
                    {selectedConversation.other_participant?.role || selectedConversation.other_participant?.type}
                  </div>
                </div>
              </div>
            </div>

            <div className="messages-list" ref={messagesContainerRef}>
              {messagesLoading ? (
                <div className="loading-messages">
                  <p>Chargement des messages...</p>
                </div>
              ) : messagesError ? (
                <div className="messages-error">
                  <p>❌ {messagesError}</p>
                  <button 
                    onClick={() => fetchMessages(
                      selectedConversation.other_participant.type,
                      selectedConversation.other_participant.id
                    )} 
                    className="retry-btn"
                  >
                    Réessayer
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div className="no-messages">
                  <p>Aucun message dans cette conversation.</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.sender_type === normalizedUserType && message.sender_id == userId ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">
                        {formatTime(message.created_at)}
                        {message.sender_type === normalizedUserType && message.sender_id == userId && (
                          <span className="message-status">
                            {message.is_read ? ' ✓✓' : ' ✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {isOtherTyping && (
                    <div className="message received typing-message">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping(e.target.value);
                }}
                onKeyDown={(e) => handleTyping(e.target.value)}
                disabled={sending}
              />
              <button type="submit" disabled={sending || !newMessage.trim()}>
                {sending ? '...' : '📤'}
              </button>
            </form>
          </>
        ) : (
          <div className="no-selection">
            <div className="no-selection-icon">💬</div>
            <h3>Sélectionnez une conversation</h3>
            <p>Choisissez une conversation existante ou démarrez-en une nouvelle</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
