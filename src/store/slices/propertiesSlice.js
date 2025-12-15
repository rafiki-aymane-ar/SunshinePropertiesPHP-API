import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend';

// Async thunks
export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/PropertyAPI/get_properties.php`);
      const data = await response.json();
      
      if (data.success && data.properties) {
        return data.properties.map(prop => ({
          id: prop.id,
          title: prop.title || 'Propriété sans titre',
          description: prop.description || '',
          price: parseFloat(prop.price) || 0,
          type: prop.type || 'appartement',
          area: parseFloat(prop.surface) || 0,
          bedrooms: parseInt(prop.rooms) || 0,
          bathrooms: parseInt(prop.bathrooms) || 0,
          address: prop.address || '',
          city: prop.city || '',
          image: prop.image || prop.images?.[0] || '/default-property.jpg',
          status: prop.status || 'disponible',
          created_at: prop.created_at,
        }));
      }
      return rejectWithValue(data.message || 'Erreur lors du chargement');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchById',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/PropertyAPI/get_property.php?id=${propertyId}`);
      const data = await response.json();
      
      if (data.success && data.property) {
        const prop = data.property;
        return {
          id: prop.id,
          title: prop.title || 'Propriété sans titre',
          description: prop.description || '',
          price: parseFloat(prop.price) || 0,
          type: prop.type || 'appartement',
          area: parseFloat(prop.surface) || 0,
          bedrooms: parseInt(prop.rooms) || 0,
          bathrooms: parseInt(prop.bathrooms) || 0,
          address: prop.address || '',
          city: prop.city || '',
          image: prop.image || prop.images?.[0] || '/default-property.jpg',
          status: prop.status || 'disponible',
          created_at: prop.created_at,
        };
      }
      return rejectWithValue(data.message || 'Propriété non trouvée');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFeaturedProperties = createAsyncThunk(
  'properties/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/PropertyAPI/get_properties.php?featured=true`);
      const data = await response.json();
      
      if (data.success && data.properties) {
        return data.properties.slice(0, 6).map(prop => ({
          id: prop.id,
          title: prop.title || 'Propriété sans titre',
          description: prop.description || '',
          price: parseFloat(prop.price) || 0,
          type: prop.type || 'appartement',
          area: parseFloat(prop.surface) || 0,
          bedrooms: parseInt(prop.rooms) || 0,
          bathrooms: parseInt(prop.bathrooms) || 0,
          address: prop.address || '',
          city: prop.city || '',
          image: prop.image || prop.images?.[0] || '/default-property.jpg',
          status: prop.status || 'disponible',
        }));
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProperty = createAsyncThunk(
  'properties/create',
  async (propertyData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/PropertyAPI/create_property.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      });
      const data = await response.json();
      
      if (data.success) {
        return data.property;
      }
      return rejectWithValue(data.message || 'Erreur lors de la création');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProperty = createAsyncThunk(
  'properties/update',
  async ({ id, ...propertyData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/PropertyAPI/update_property.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...propertyData }),
      });
      const data = await response.json();
      
      if (data.success) {
        return data.property;
      }
      return rejectWithValue(data.message || 'Erreur lors de la mise à jour');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/delete',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/PropertyAPI/delete_property.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: propertyId }),
      });
      const data = await response.json();
      
      if (data.success) {
        return propertyId;
      }
      return rejectWithValue(data.message || 'Erreur lors de la suppression');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const propertiesSlice = createSlice({
  name: 'properties',
  initialState: {
    items: [],
    featured: [],
    selectedProperty: null,
    loading: false,
    error: null,
    filters: {
      type: 'all',
      searchTerm: '',
      minPrice: null,
      maxPrice: null,
    },
  },
  reducers: {
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload;
    },
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        type: 'all',
        searchTerm: '',
        minPrice: null,
        maxPrice: null,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch featured
      .addCase(fetchFeaturedProperties.fulfilled, (state, action) => {
        state.featured = action.payload;
      })
      // Create
      .addCase(createProperty.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update
      .addCase(updateProperty.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedProperty?.id === action.payload.id) {
          state.selectedProperty = action.payload;
        }
      })
      // Delete
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
        if (state.selectedProperty?.id === action.payload) {
          state.selectedProperty = null;
        }
      });
  },
});

export const {
  setSelectedProperty,
  clearSelectedProperty,
  setFilters,
  clearFilters,
  clearError,
} = propertiesSlice.actions;

export default propertiesSlice.reducer;

