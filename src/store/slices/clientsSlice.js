import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend';

const API_BASE_URLS = [
  'http://localhost:80/RafikiMoukrim_SunshineProperties_PHP_API/backend/ClientAPI',
  'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/ClientAPI',
  'http://localhost/backend/ClientAPI',
  '/RafikiMoukrim_SunshineProperties_PHP_API/backend/ClientAPI',
];

const findWorkingUrl = async () => {
  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}/get_clients.php`);
      if (response.ok) return baseUrl;
    } catch (error) {
      continue;
    }
  }
  return API_BASE_URLS[0];
};

export const fetchClients = createAsyncThunk(
  'clients/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const baseUrl = await findWorkingUrl();
      const response = await fetch(`${baseUrl}/get_clients.php`);
      const data = await response.json();
      
      if (data.success && data.clients) {
        return data.clients;
      }
      return rejectWithValue(data.message || 'Erreur lors du chargement');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchClientById = createAsyncThunk(
  'clients/fetchById',
  async (clientId, { rejectWithValue }) => {
    try {
      const baseUrl = await findWorkingUrl();
      const response = await fetch(`${baseUrl}/get_client.php?id=${clientId}`);
      const data = await response.json();
      
      if (data.success && data.client) {
        return data.client;
      }
      return rejectWithValue(data.message || 'Client non trouvé');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/create',
  async (clientData, { rejectWithValue }) => {
    try {
      const baseUrl = await findWorkingUrl();
      const response = await fetch(`${baseUrl}/create_client.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
      const data = await response.json();
      
      if (data.success) {
        return data.client;
      }
      return rejectWithValue(data.message || 'Erreur lors de la création');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateClient = createAsyncThunk(
  'clients/update',
  async ({ id, ...clientData }, { rejectWithValue }) => {
    try {
      const baseUrl = await findWorkingUrl();
      const response = await fetch(`${baseUrl}/update_client.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...clientData }),
      });
      const data = await response.json();
      
      if (data.success) {
        return data.client;
      }
      return rejectWithValue(data.message || 'Erreur lors de la mise à jour');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/delete',
  async (clientId, { rejectWithValue }) => {
    try {
      const baseUrl = await findWorkingUrl();
      const response = await fetch(`${baseUrl}/delete_client.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clientId }),
      });
      const data = await response.json();
      
      if (data.success) {
        return clientId;
      }
      return rejectWithValue(data.message || 'Erreur lors de la suppression');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState: {
    items: [],
    selectedClient: null,
    loading: false,
    error: null,
    filters: {
      status: 'all',
      searchTerm: '',
    },
  },
  reducers: {
    setSelectedClient: (state, action) => {
      state.selectedClient = action.payload;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        searchTerm: '',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.selectedClient = action.payload;
      })
      // Create
      .addCase(createClient.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedClient?.id === action.payload.id) {
          state.selectedClient = action.payload;
        }
      })
      // Delete
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
        if (state.selectedClient?.id === action.payload) {
          state.selectedClient = null;
        }
      });
  },
});

export const {
  setSelectedClient,
  clearSelectedClient,
  setFilters,
  clearFilters,
  clearError,
} = clientsSlice.actions;

export default clientsSlice.reducer;

