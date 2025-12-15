import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend';

const DASHBOARD_APIS = [
  { url: `${BASE_URL}/DashboardAPI/get_basic_stats.php`, name: 'Basic Stats API' },
  { url: `${BASE_URL}/DashboardAPI/get_dashboard_data.php`, name: 'Dashboard API' },
  { url: `${BASE_URL}/DashboardAPI/test_simple.php`, name: 'Test API' },
];

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    let lastError = null;

    for (const api of DASHBOARD_APIS) {
      try {
        const response = await fetch(api.url);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return {
              stats: data.stats || {
                properties: data.properties || 0,
                appointments: data.appointments || 0,
                clients: data.clients || 0,
                agents: data.agents || 0,
              },
              recentActivities: data.recentActivities || [],
              workingUrl: api.url,
              source: api.name,
            };
          }
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    return rejectWithValue(lastError?.message || 'Aucune API disponible');
  }
);

export const fetchStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/DashboardAPI/get_basic_stats.php`);
      const data = await response.json();
      
      if (data.success) {
        return {
          properties: data.stats?.properties || data.properties || 0,
          appointments: data.stats?.appointments || data.appointments || 0,
          clients: data.stats?.clients || data.clients || 0,
          agents: data.stats?.agents || data.agents || 0,
        };
      }
      return rejectWithValue(data.message || 'Erreur lors du chargement');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: {
      properties: 0,
      appointments: 0,
      clients: 0,
      agents: 0,
    },
    recentActivities: [],
    loading: false,
    error: null,
    syncStatus: {
      lastSync: null,
      isSyncing: false,
      error: null,
      workingUrl: null,
      source: null,
    },
  },
  reducers: {
    setSyncStatus: (state, action) => {
      state.syncStatus = { ...state.syncStatus, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.syncStatus.isSyncing = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.syncStatus.isSyncing = false;
        state.stats = action.payload.stats;
        state.recentActivities = action.payload.recentActivities;
        state.syncStatus.workingUrl = action.payload.workingUrl;
        state.syncStatus.source = action.payload.source;
        state.syncStatus.lastSync = new Date().toISOString();
        state.syncStatus.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.syncStatus.isSyncing = false;
        state.error = action.payload;
        state.syncStatus.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setSyncStatus, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

