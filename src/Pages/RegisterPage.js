import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "../style/Auth.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const register = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.first_name || !form.last_name) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (form.password !== form.confirm_password) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    if (form.password.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/LoginRegisterAPI/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // Vérifier si la réponse est valide
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Réponse inscription:', data);

      if (data.success) {
        alert(data.message || "Compte créé avec succès!");
        window.location.href = '/login';
      } else {
        alert(data.message || "Erreur d'inscription. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      // Afficher le message d'erreur spécifique
      const errorMessage = error.message || "Erreur de connexion au serveur. Vérifiez votre connexion et réessayez.";
      alert("Erreur: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("Utilisateur Google inscrit:", user);

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
              localStorage.setItem('token', data.token || user.uid);
              localStorage.setItem('user', JSON.stringify(data.user || userData));
              alert("Inscription Google réussie!");
              window.location.href = '/dashboard';
              return;
            }
          }
        } catch (error) {
          console.error(`Erreur avec ${apiUrl}:`, error);
          continue;
        }
      }

      localStorage.setItem('token', user.uid);
      localStorage.setItem('user', JSON.stringify(userData));
      alert("Inscription Google réussie!");
      window.location.href = '/dashboard';

    } catch (error) {
      console.error("Erreur d'inscription Google:", error);
      alert("Erreur d'inscription Google: " + error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1 className="brand">🌞 Sunshine Agency</h1>

        <h2>Create Your Account</h2>
        <p className="subtitle">Join our platform and start exploring.</p>

        <form onSubmit={register} className="auth-form">
          {/* First Name & Last Name sur la même ligne */}
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                onChange={handleChange}
                required
                value={form.first_name}
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                onChange={handleChange}
                required
                value={form.last_name}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
              value={form.email}
            />
          </div>

          {/* Password & Confirm Password sur la même ligne */}
          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                value={form.password}
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
                value={form.confirm_password}
                minLength="6"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              value={form.phone}
            />
          </div>

          {/* Boutons Back To Login et CREATE ACCOUNT sur la même ligne */}
          <div className="form-buttons-row">
            <Link to="/login" className="btn-back">
              ← Back To Login
            </Link>
            <button type="submit" className="btn-create-account" disabled={loading}>
              {loading ? "Creating..." : "CREATE ACCOUNT"}
            </button>
          </div>

          <div className="divider">OR</div>

          {/* Bouton Google */}
          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleRegister}
            disabled={googleLoading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? "Inscription..." : "Sign up with Google"}
          </button>

          <p className="bottom-text">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </form>
      </div>

      <div className="auth-right">
        <h1>Join Thousands of Happy Clients</h1>
        <p>
          "Sunshine Agency made real estate simple for us. Amazing service and support throughout the entire process!"
        </p>

        <div className="testimonial">
          <img
            src="https://i.pravatar.cc/50?img=5"
            alt="client"
            className="client-img"
          />
          <div>
            <strong>Sarah M.</strong>
            <span>Property Investor</span>
          </div>
        </div>
      </div>
    </div>
  );
}