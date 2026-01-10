import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, checkAuth } from "../store/slices/authSlice";
import Notification from "../Components/Notification";
import { useNotification } from "../hooks/useNotification";
import "../style/Auth.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();

  // ========================================================================
  // VÉRIFICATION DE L'AUTHENTIFICATION ET REDIRECTION
  // ========================================================================

  /**
   * Vérifie si l'utilisateur est déjà authentifié et redirige vers le dashboard approprié
   */
  useEffect(() => {
    const verifyAndRedirect = async () => {
      // Vérifier l'authentification dans Redux
      await dispatch(checkAuth());
      setCheckingAuth(false);
    };

    verifyAndRedirect();
  }, [dispatch]);

  /**
   * Redirige automatiquement si l'utilisateur est déjà connecté
   * (mais pas si on vient juste de se connecter - laisser la notification s'afficher)
   */
  useEffect(() => {
    if (!checkingAuth && isAuthenticated && user && !justLoggedIn) {
      // Redirection basée sur le rôle
      if (user.role === 'admin' || user.role === 'agent') {
        navigate('/admin-dashboard', { replace: true });
      } else if (user.role === 'client') {
        navigate('/client-dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, checkingAuth, navigate, justLoggedIn]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const login = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      showNotification("Veuillez remplir tous les champs", "warning", 3000);
      return;
    }

    try {
      const result = await dispatch(loginUser({ email: form.email, password: form.password }));

      if (loginUser.fulfilled.match(result)) {
        const user = result.payload.user;
        setJustLoggedIn(true);

        // Afficher la notification immédiatement
        showNotification("Connexion réussie! 🎉", "success", 3000);

        // Attendre un peu pour que React rende la notification, puis rediriger
        setTimeout(() => {
          setJustLoggedIn(false);
          if (user.role === 'admin' || user.role === 'agent') {
            navigate('/admin-dashboard');
          } else {
            navigate('/client-dashboard');
          }
        }, 3000);
      } else {
        showNotification(result.payload || "Erreur de connexion", "error", 4000);
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      showNotification("Erreur de connexion", "error", 4000);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("Utilisateur Google connecté:", user);

      const userData = {
        uid: user.uid,
        email: user.email,
        full_name: user.displayName,
        photo_url: user.photoURL,
        provider: 'google'
      };

      const apiUrls = [
        "http://localhost:8000/LoginRegisterAPI/google-login.php",
        "http://localhost:80/RafikiMoukrim_SunshineProperties_PHP_API/backend/LoginRegisterAPI/google-login.php",
        "http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/LoginRegisterAPI/google-login.php",
        "http://localhost/backend/LoginRegisterAPI/google-login.php",
        "/backend/LoginRegisterAPI/google-login.php"
      ];

      for (const apiUrl of apiUrls) {
        try {
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
            mode: 'cors'
          });

          if (res.ok) {
            const data = await res.json();

            if (data.success) {
              const googleUserData = {
                id: data.user?.id || user.uid,
                name: data.user?.full_name || user.displayName,
                full_name: data.user?.full_name || user.displayName,
                email: data.user?.email || user.email,
                role: data.user?.role || 'client',
                client_id: data.user?.client_id || data.user?.id
              };

              // Format nouveau
              localStorage.setItem('auth_token', data.token || user.uid);
              localStorage.setItem('user_data', JSON.stringify(googleUserData));
              // Format ancien
              localStorage.setItem('token', data.token || user.uid);
              localStorage.setItem('user', JSON.stringify(googleUserData));

              setJustLoggedIn(true);
              showNotification("Connexion Google réussie! 🎉", "success", 3000);

              // Redirection basée sur le rôle pour Google
              setTimeout(() => {
                setJustLoggedIn(false);
                if (data.user && (data.user.role === 'admin' || data.user.role === 'agent')) {
                  window.location.href = '/admin-dashboard';
                } else {
                  window.location.href = '/client-dashboard';
                }
              }, 3000);
              return;
            }
          }
        } catch (error) {
          console.error(`Erreur avec ${apiUrl}:`, error);
          continue;
        }
      }

      // Si l'API n'est pas disponible, utiliser Firebase uniquement
      const fallbackUserData = {
        id: user.uid,
        name: user.displayName,
        full_name: user.displayName,
        email: user.email,
        role: 'client',
        client_id: user.uid
      };

      // Format nouveau
      localStorage.setItem('auth_token', user.uid);
      localStorage.setItem('user_data', JSON.stringify(fallbackUserData));
      // Format ancien
      localStorage.setItem('token', user.uid);
      localStorage.setItem('user', JSON.stringify(fallbackUserData));

      setJustLoggedIn(true);
      showNotification("Connexion Google réussie! 🎉", "success", 3000);

      // Par défaut rediriger vers espace client
      setTimeout(() => {
        setJustLoggedIn(false);
        window.location.href = '/client-dashboard';
      }, 3000);

    } catch (error) {
      console.error("Erreur de connexion Google:", error);
      showNotification("Erreur de connexion Google: " + error.message, "error", 4000);
    } finally {
      setGoogleLoading(false);
    }
  };


  // ========================================================================
  // AFFICHAGE DU LOADER PENDANT LA VÉRIFICATION
  // ========================================================================

  // Afficher un loader pendant la vérification de l'authentification
  if (checkingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        background: '#0a0a0a',
        color: '#ffffff'
      }}>
        <div className="loading-spinner" style={{
          border: '4px solid rgba(0, 212, 170, 0.3)',
          borderTop: '4px solid #00d4aa',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Vérification de l'authentification...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ========================================================================
  // RENDU DU FORMULAIRE DE CONNEXION
  // ========================================================================

  return (
    <div className="auth-container">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={hideNotification}
        />
      )}

      {/* Bouton retour à l'accueil */}
      <Link to="/" className="btn-home">
        <span className="home-icon">←</span>
        <span>Retour à l'accueil</span>
      </Link>

      <div className="auth-left">
        <h1 className="brand">Sunshine Agency</h1>

        <h2>Welcome Back!</h2>
        <p className="subtitle">Sign in to access your dashboard.</p>

        <form onSubmit={login} className="auth-form">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            required
            value={form.email}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            required
            value={form.password}
          />

          {error && <div className="error-message" style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Connexion..." : "Sign In"}
          </button>

          <div className="divider">OR</div>

          {/* Bouton Google */}
          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? "Connexion..." : "Continue with Google"}
          </button>

          <p className="bottom-text">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </form>
      </div>

      <div className="auth-right">
        <h1>Find Your Dream Property Easily</h1>
        <p>
          "Sunshine Agency helped me find the perfect home. Smooth, transparent
          and professional service."
        </p>

        <div className="testimonial">
          <img
            src="https://i.pravatar.cc/50?img=12"
            alt="client"
            className="client-img"
          />
          <div>
            <strong>Adam B.</strong>
            <span>New Home Owner</span>
          </div>
        </div>
      </div>
    </div>
  );
}