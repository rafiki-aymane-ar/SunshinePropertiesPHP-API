/**
 * @fileoverview Slice Redux pour la gestion de l'authentification
 * @module store/slices/authSlice
 * @description
 * Gère l'état d'authentification de l'application :
 * - Connexion/Déconnexion des utilisateurs
 * - Vérification de l'authentification
 * - Stockage des tokens et données utilisateur
 * - Synchronisation avec localStorage
 * 
 * @author Sunshine Agency Development Team
 * @version 1.0.0
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ============================================================================
// CONSTANTES
// ============================================================================

/** URL de base de l'API backend */
const BASE_URL = 'http://localhost:8000';

// Initial state from localStorage
const getInitialAuthState = () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const userData = localStorage.getItem('user_data') || localStorage.getItem('user');

  if (token && userData) {
    try {
      return {
        isAuthenticated: true,
        token,
        user: JSON.parse(userData),
        loading: false,
        error: null,
      };
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }

  return {
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    error: null,
  };
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    const apiUrls = [
      `${BASE_URL}/LoginRegisterAPI/login.php`,
      // `http://localhost:80/RafikiMoukrim_SunshineProperties_PHP_API/backend/LoginRegisterAPI/login.php`,
    ];

    for (const apiUrl of apiUrls) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          mode: 'cors',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const userData = {
              id: data.user.id,
              name: data.user.name || data.user.full_name,
              full_name: data.user.full_name || data.user.name,
              email: data.user.email,
              role: data.user.role,
              client_id: data.user.client_id || data.user.id,
            };

            // Store in both formats for compatibility
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(userData));
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(userData));

            return { token: data.token, user: userData };
          }
        }
      } catch (error) {
        console.error(`Error with ${apiUrl}:`, error);
      }
    }

    return rejectWithValue('Impossible de se connecter au serveur');
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return null;
});

export const checkAuth = createAsyncThunk('auth/check', async () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const userData = localStorage.getItem('user_data') || localStorage.getItem('user');

  if (token && userData) {
    try {
      return {
        token,
        user: JSON.parse(userData),
      };
    } catch (e) {
      return null;
    }
  }
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user_data', JSON.stringify(state.user));
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
      })
      // Check auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
        } else {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
        }
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;

