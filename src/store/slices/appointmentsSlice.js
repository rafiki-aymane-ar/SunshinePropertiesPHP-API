import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend';

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/AppointmentAPI/get_appointments.php`);
      const data = await response.json();
      
      if (data.success && data.appointments) {
        return data.appointments;
      }
      return rejectWithValue(data.message || 'Erreur lors du chargement');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchById',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/AppointmentAPI/get_appointment.php?id=${appointmentId}`);
      const data = await response.json();
      
      if (data.success && data.appointment) {
        return data.appointment;
      }
      return rejectWithValue(data.message || 'Rendez-vous non trouvé');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchClientAppointments = createAsyncThunk(
  'appointments/fetchByClient',
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/AppointmentAPI/get_appointments.php?client_id=${clientId}`);
      const data = await response.json();
      
      if (data.success && data.appointments) {
        return data.appointments;
      }
      return rejectWithValue(data.message || 'Erreur lors du chargement');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/AppointmentAPI/create_appointment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      const data = await response.json();
      
      if (data.success) {
        return data.appointment;
      }
      return rejectWithValue(data.message || 'Erreur lors de la création');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async ({ id, ...appointmentData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/AppointmentAPI/update_appointment.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...appointmentData }),
      });
      const data = await response.json();
      
      if (data.success) {
        return data.appointment;
      }
      return rejectWithValue(data.message || 'Erreur lors de la mise à jour');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/delete',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/AppointmentAPI/delete_appointment.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId }),
      });
      const data = await response.json();
      
      if (data.success) {
        return appointmentId;
      }
      return rejectWithValue(data.message || 'Erreur lors de la suppression');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: {
    items: [],
    clientAppointments: [],
    selectedAppointment: null,
    loading: false,
    error: null,
    filters: {
      status: 'all',
      date: null,
      agent_id: null,
      client_id: null,
    },
  },
  reducers: {
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    },
    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        date: null,
        agent_id: null,
        client_id: null,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.selectedAppointment = action.payload;
      })
      // Fetch by client
      .addCase(fetchClientAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClientAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.clientAppointments = action.payload;
      })
      .addCase(fetchClientAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.clientAppointments.push(action.payload);
      })
      // Update
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        const clientIndex = state.clientAppointments.findIndex(a => a.id === action.payload.id);
        if (clientIndex !== -1) {
          state.clientAppointments[clientIndex] = action.payload;
        }
        if (state.selectedAppointment?.id === action.payload.id) {
          state.selectedAppointment = action.payload;
        }
      })
      // Delete
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a.id !== action.payload);
        state.clientAppointments = state.clientAppointments.filter(a => a.id !== action.payload);
        if (state.selectedAppointment?.id === action.payload) {
          state.selectedAppointment = null;
        }
      });
  },
});

export const {
  setSelectedAppointment,
  clearSelectedAppointment,
  setFilters,
  clearFilters,
  clearError,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;

