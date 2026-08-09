import React, { useState } from 'react';
import { Plus, Edit, Trash2, Layers, Tag, Check, X, Loader2 } from 'lucide-react';
import { Category, Brand } from '../../types';
import {
  addCategory,
  updateCategory,
  deleteCategory,
  addBrand,
  updateBrand,
  deleteBrand
} from '../../services/storeService';

interface AdminCategoriesBrandsViewProps {
  categories: Category[];
  brands: Brand[];
}

export const AdminCategoriesBrandsView: React.FC<AdminCategoriesBrandsViewProps> = ({
  categories,
  brands
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setErrorMsg(null);
      const slug = newCatName.toLowerCase().trim().replace(/\s+/g, '-');
      await addCategory({ name: newCatName.trim(), slug });
      setNewCatName('');
    } catch (err: any) {
      console.error('Error adding category:', err);
      setErrorMsg('Erreur lors de l\'ajout de la catégorie');
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      setErrorMsg(null);
      const slug = newBrandName.toLowerCase().trim().replace(/\s+/g, '-');
      await addBrand({ name: newBrandName.trim(), slug });
      setNewBrandName('');
    } catch (err: any) {
      console.error('Error adding brand:', err);
      setErrorMsg('Erreur lors de l\'ajout de la marque');
    }
  };

  const confirmDeleteCat = async (id: string) => {
    try {
      setIsDeleting(true);
      setErrorMsg(null);
      await deleteCategory(id);
      setDeletingCatId(null);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setErrorMsg('Erreur lors de la suppression de la catégorie');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteBrand = async (id: string) => {
    try {
      setIsDeleting(true);
      setErrorMsg(null);
      await deleteBrand(id);
      setDeletingBrandId(null);
    } catch (err: any) {
      console.error('Error deleting brand:', err);
      setErrorMsg('Erreur lors de la suppression de la marque');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-bold flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Column */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Catégories ({categories.length})
            </h3>
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddCat} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Nom catégorie (ex: Hommes, Sport...)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </form>

          {/* List */}
          <div className="divide-y divide-slate-100">
            {categories.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{c.name}</span>
                
                {deletingCatId === c.id ? (
                  <div className="flex items-center gap-2 bg-rose-50 p-1 rounded-lg">
                    <span className="text-[11px] font-bold text-rose-700">Supprimer ?</span>
                    <button
                      onClick={() => confirmDeleteCat(c.id)}
                      disabled={isDeleting}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Confirmer la suppression"
                    >
                      {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Oui
                    </button>
                    <button
                      onClick={() => setDeletingCatId(null)}
                      disabled={isDeleting}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-1 rounded transition-colors"
                      title="Annuler"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingCatId(c.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors rounded-lg hover:bg-rose-50"
                    title="Supprimer la catégorie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Brands Column */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              Marques ({brands.length})
            </h3>
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddBrand} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Nom marque (ex: Nike, Adidas...)"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </form>

          {/* List */}
          <div className="divide-y divide-slate-100">
            {brands.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{b.name}</span>
                
                {deletingBrandId === b.id ? (
                  <div className="flex items-center gap-2 bg-rose-50 p-1 rounded-lg">
                    <span className="text-[11px] font-bold text-rose-700">Supprimer ?</span>
                    <button
                      onClick={() => confirmDeleteBrand(b.id)}
                      disabled={isDeleting}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Confirmer la suppression"
                    >
                      {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Oui
                    </button>
                    <button
                      onClick={() => setDeletingBrandId(null)}
                      disabled={isDeleting}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-1 rounded transition-colors"
                      title="Annuler"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingBrandId(b.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors rounded-lg hover:bg-rose-50"
                    title="Supprimer la marque"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
