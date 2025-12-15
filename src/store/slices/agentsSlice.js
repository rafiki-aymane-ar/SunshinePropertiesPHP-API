import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend';

export const fetchAgents = createAsyncThunk(
  'agents/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/AgentAPI/get_agents.php`);
      const data = await response.json();
      
      if (data.success && data.agents) {
        return data.agents.map(agent => ({
          id: agent.id,
          name: agent.full_name || agent.name || 'Agent',
          full_name: agent.full_name || agent.name || 'Agent',
          email: agent.email || '',
          phone: agent.phone || '',
          avatar: agent.avatar || agent.image || null,
          role: agent.role === 'agent' ? 'Agent Immobilier' : agent.role || 'Agent',
          properties_sold: parseInt(agent.properties_sold) || 0,
          experience: parseInt(agent.experience) || 0,
          is_active: agent.is_active !== undefined ? agent.is_active : true,
        }));
      }
      return rejectWithValue(data.message || 'Erreur lors du chargement');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAgentById = createAsyncThunk(
  'agents/fetchById',
  async (agentId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/UserAPI/get_user.php?id=${agentId}`);
      const data = await response.json();
      
      if (data.success && data.user) {
        const agent = data.user;
        return {
          id: agent.id,
          name: agent.full_name || agent.name || 'Agent',
          full_name: agent.full_name || agent.name || 'Agent',
          email: agent.email || '',
          phone: agent.phone || '',
          avatar: agent.avatar || agent.image || null,
          role: agent.role === 'agent' ? 'Agent Immobilier' : agent.role || 'Agent',
          properties_sold: parseInt(agent.properties_sold) || 0,
          experience: parseInt(agent.experience) || 0,
          is_active: agent.is_active !== undefined ? agent.is_active : true,
        };
      }
      return rejectWithValue(data.message || 'Agent non trouvé');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAgent = createAsyncThunk(
  'agents/create',
  async (agentData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/UserAPI/create_user.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      const data = await response.json();
      
      if (data.success) {
        return data.user;
      }
      return rejectWithValue(data.message || 'Erreur lors de la création');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAgent = createAsyncThunk(
  'agents/update',
  async ({ id, ...agentData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/UserAPI/update_user.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...agentData }),
      });
      const data = await response.json();
      
      if (data.success) {
        return data.user;
      }
      return rejectWithValue(data.message || 'Erreur lors de la mise à jour');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAgent = createAsyncThunk(
  'agents/delete',
  async (agentId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/UserAPI/delete_user.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agentId }),
      });
      const data = await response.json();
      
      if (data.success) {
        return agentId;
      }
      return rejectWithValue(data.message || 'Erreur lors de la suppression');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const agentsSlice = createSlice({
  name: 'agents',
  initialState: {
    items: [],
    selectedAgent: null,
    loading: false,
    error: null,
    stats: {
      total: 0,
      active: 0,
      admins: 0,
    },
  },
  reducers: {
    setSelectedAgent: (state, action) => {
      state.selectedAgent = action.payload;
    },
    clearSelectedAgent: (state) => {
      state.selectedAgent = null;
    },
    calculateStats: (state) => {
      state.stats = {
        total: state.items.length,
        active: state.items.filter(a => a.is_active).length,
        admins: state.items.filter(a => a.role === 'admin').length,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.stats = {
          total: action.payload.length,
          active: action.payload.filter(a => a.is_active).length,
          admins: action.payload.filter(a => a.role === 'admin').length,
        };
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchAgentById.fulfilled, (state, action) => {
        state.selectedAgent = action.payload;
      })
      // Create
      .addCase(createAgent.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.stats.total = state.items.length;
      })
      // Update
      .addCase(updateAgent.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedAgent?.id === action.payload.id) {
          state.selectedAgent = action.payload;
        }
        state.stats = {
          total: state.items.length,
          active: state.items.filter(a => a.is_active).length,
          admins: state.items.filter(a => a.role === 'admin').length,
        };
      })
      // Delete
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a.id !== action.payload);
        if (state.selectedAgent?.id === action.payload) {
          state.selectedAgent = null;
        }
        state.stats.total = state.items.length;
      });
  },
});

export const {
  setSelectedAgent,
  clearSelectedAgent,
  calculateStats,
  clearError,
} = agentsSlice.actions;

export default agentsSlice.reducer;

