import React, { useState } from 'react';
import { X, Lock, Mail, Key, Database, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { seedDatabaseIfEmpty } from '../../services/storeService';

interface AdminLoginModalProps {
  isEmbedded?: boolean;
  onClose?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isEmbedded = false, onClose }) => {
  const { isLoginModalOpen, setIsLoginModalOpen, loginAdmin, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('amineadem@gmail.com');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [seedStatus, setSeedStatus] = useState('');

  if (!isEmbedded && !isLoginModalOpen) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsLoginModalOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await loginAdmin(email, password);
    } catch (err: any) {
      console.warn('Login error:', err?.code, err?.message);
      const code = err?.code || 'unknown-error';
      if (code === 'auth/operation-not-allowed') {
        setErrorMsg(`Erreur Firebase [${code}]: La connexion Email/Mot de passe n'est pas activée dans Firebase Console.`);
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setErrorMsg(`Erreur Firebase [${code}]: Identifiants invalides ou mot de passe incorrect.`);
      } else if (code === 'auth/user-not-found') {
        setErrorMsg(`Erreur Firebase [${code}]: Aucun compte trouvé pour ${email}.`);
      } else if (code === 'auth/invalid-email') {
        setErrorMsg(`Erreur Firebase [${code}]: Format d'adresse email invalide.`);
      } else {
        setErrorMsg(`Erreur Firebase [${code}]: ${err?.message || 'Impossible de se connecter.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google login error:', err?.message || err);
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('La connexion Google n\'est pas activée dans la console Firebase.');
      } else {
        setErrorMsg('Erreur lors de la connexion Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeedStatus('Initialisation de la base de données...');
    const result = await seedDatabaseIfEmpty();
    if (result) {
      setSeedStatus('Base de données initialisée avec succès avec les produits et paramètres Amino-Shoes !');
    } else {
      setSeedStatus('La base de données contient déjà des données ou l\'initialisation a été ignorée.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 bg-white p-0.5 mx-auto shadow-md">
            <img
              src="/logo.jpg"
              alt="Amino-Shoes Logo"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-xl font-black text-slate-900">Espace Administration</h2>
          <p className="text-xs text-slate-500 font-medium">
            Accédez à la gestion du magasin Amino-Shoes.
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Se connecter avec Google</span>
          </button>
        </div>

        <div className="relative flex items-center my-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="shrink-0 px-3 text-[11px] font-semibold text-slate-400">ou avec Email</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Email Administrateur
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter par Email'}
          </button>
        </form>

        {/* Database Quick Seed Helper */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-[11px] text-slate-400 font-medium">
            Premier lancement ? Chargez les données de démonstration Amino-Shoes dans Firestore:
          </p>
          <button
            onClick={handleSeed}
            type="button"
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Initialiser la base de données (Produits & Paramètres)</span>
          </button>
          {seedStatus && <p className="text-[11px] font-bold text-emerald-600 mt-1">{seedStatus}</p>}
        </div>
      </div>
    </div>
  );
};

