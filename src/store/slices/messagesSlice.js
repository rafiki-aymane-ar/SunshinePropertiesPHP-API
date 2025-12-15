import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend';

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/MessageAPI/get_conversations.php?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success && data.conversations) {
        return data.conversations;
      }
      return rejectWithValue(data.message || 'Erreur lors du chargement');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/MessageAPI/get_messages.php?conversation_id=${conversationId}`);
      const data = await response.json();
      
      if (data.success && data.messages) {
        return { conversationId, messages: data.messages };
      }
      return rejectWithValue(data.message || 'Erreur lors du chargement');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/send',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/MessageAPI/send_message.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      const data = await response.json();
      
      if (data.success) {
        return data.message;
      }
      return rejectWithValue(data.message || 'Erreur lors de l\'envoi');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchContacts = createAsyncThunk(
  'messages/fetchContacts',
  async ({ userId, userType }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/MessageAPI/get_contacts.php?user_id=${userId}&user_type=${userType}`);
      const data = await response.json();
      
      if (data.success && data.contacts) {
        return data.contacts;
      }
      return rejectWithValue(data.message || 'Erreur lors du chargement');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'messages/fetchUnreadCount',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/MessageAPI/get_unread_count.php?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        return data.unread_count || 0;
      }
      return rejectWithValue(data.message || 'Erreur lors du chargement');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    messages: {}, // { conversationId: [messages] }
    contacts: [],
    selectedConversation: null,
    unreadCount: 0,
    loading: false,
    sending: false,
    error: null,
  },
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    clearSelectedConversation: (state) => {
      state.selectedConversation = null;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
    updateConversation: (state, action) => {
      const { conversationId, updates } = action.payload;
      const index = state.conversations.findIndex(c => c.id === conversationId);
      if (index !== -1) {
        state.conversations[index] = { ...state.conversations[index], ...updates };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages[action.payload.conversationId] = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        const message = action.payload;
        const conversationId = message.conversation_id;
        
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);
        
        // Update conversation
        const convIndex = state.conversations.findIndex(c => c.id === conversationId);
        if (convIndex !== -1) {
          state.conversations[convIndex].last_message_at = message.created_at;
          state.conversations[convIndex].last_message = message.content;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })
      // Fetch contacts
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.contacts = action.payload;
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const {
  setSelectedConversation,
  clearSelectedConversation,
  addMessage,
  updateConversation,
  clearError,
} = messagesSlice.actions;

export default messagesSlice.reducer;

