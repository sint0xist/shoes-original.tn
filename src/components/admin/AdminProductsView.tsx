import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Sparkles, Flame, Tag, Save, X, Image as ImageIcon, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import { Product, Category, Brand, SizeStock } from '../../types';
import { addProduct, updateProduct, deleteProduct } from '../../services/storeService';
import { compressFileToDataUrl, compressImageDataUrl, getPayloadSizeInBytes } from '../../lib/imageCompressor';
import { sortSizes } from '../../lib/sizeUtils';

interface AdminProductsViewProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

export const AdminProductsView: React.FC<AdminProductsViewProps> = ({
  products,
  categories,
  brands
}) => {
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newSizeLabel, setNewSizeLabel] = useState('');

  // Default shoe sizes 36 to 45
  const defaultSizes: SizeStock[] = [
    { size: '36', stock: 2 },
    { size: '37', stock: 3 },
    { size: '38', stock: 4 },
    { size: '39', stock: 5 },
    { size: '40', stock: 5 },
    { size: '41', stock: 6 },
    { size: '42', stock: 6 },
    { size: '43', stock: 4 },
    { size: '44', stock: 2 },
    { size: '45', stock: 0 }
  ];

  const handleOpenAdd = () => {
    setEditingProduct({
      name: '',
      brandId: brands[0]?.id || '',
      brandName: brands[0]?.name || '',
      categoryId: categories[0]?.id || '',
      categoryName: categories[0]?.name || '',
      description: '',
      price: 159,
      promoPrice: undefined,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'],
      videos: [],
      sizes: defaultSizes,
      isNew: true,
      isBestSeller: false,
      isPromo: false,
      published: true
    });
    setNewImageUrl('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({
      ...p,
      images: p.images?.length ? p.images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'],
      videos: p.videos || []
    });
    setNewImageUrl('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (p: Product) => {
    await updateProduct(p.id, { published: !p.published });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Image Upload Handlers
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const compressedDataUrl = await compressFileToDataUrl(file, 1000, 0.75);
      if (compressedDataUrl) {
        setEditingProduct((prev) => {
          if (!prev) return prev;
          const updatedImgs = [...(prev.images || [])];
          if (!updatedImgs.includes(compressedDataUrl)) {
            updatedImgs.push(compressedDataUrl);
          }
          return { ...prev, images: updatedImgs };
        });
      }
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setEditingProduct((prev) => {
      if (!prev) return prev;
      const updated = [...(prev.images || []), newImageUrl.trim()];
      return { ...prev, images: updated };
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setEditingProduct((prev) => {
      if (!prev) return prev;
      const updated = [...(prev.images || [])];
      updated.splice(index, 1);
      return { ...prev, images: updated };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setEditingProduct((prev) => {
      if (!prev || !prev.images) return prev;
      const updated = [...prev.images];
      const [selected] = updated.splice(index, 1);
      updated.unshift(selected);
      return { ...prev, images: updated };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim()) {
      setErrorMsg('Le nom du produit est requis.');
      return;
    }
    if (!editingProduct.price || editingProduct.price <= 0) {
      setErrorMsg('Veuillez saisir un prix valide.');
      return;
    }

    setLoading(true);

    try {
      const selectedBrandObj = brands.find((b) => b.id === editingProduct.brandId);
      const selectedCategoryObj = categories.find((c) => c.id === editingProduct.categoryId);

      const rawImages = editingProduct.images?.length
        ? editingProduct.images
        : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'];

      const compressedImages = await Promise.all(
        rawImages.map((img) => compressImageDataUrl(img, 1000, 0.75))
      );

      const productPayload = {
        name: editingProduct.name.trim(),
        brandId: editingProduct.brandId || brands[0]?.id || '',
        brandName: selectedBrandObj?.name || editingProduct.brandName || 'Marque',
        categoryId: editingProduct.categoryId || categories[0]?.id || '',
        categoryName: selectedCategoryObj?.name || editingProduct.categoryName || 'Catégorie',
        description: editingProduct.description || '',
        price: Number(editingProduct.price),
        promoPrice: editingProduct.promoPrice ? Number(editingProduct.promoPrice) : undefined,
        images: compressedImages,
        videos: editingProduct.videos || [],
        sizes: editingProduct.sizes || defaultSizes,
        isNew: !!editingProduct.isNew,
        isBestSeller: !!editingProduct.isBestSeller,
        isPromo: !!editingProduct.isPromo || (!!editingProduct.promoPrice && editingProduct.promoPrice < editingProduct.price),
        published: editingProduct.published ?? true
      };

      const payloadSizeBytes = getPayloadSizeInBytes(productPayload);
      if (payloadSizeBytes > 900000) {
        setErrorMsg(
          `La taille totale du produit (${(payloadSizeBytes / (1024 * 1024)).toFixed(2)} Mo) dépasse la limite de 1 Mo acceptée par la base de données. Veuillez supprimer certaines images ou vidéos volumineuses.`
        );
        setLoading(false);
        return;
      }

      if (editingProduct.id) {
        await updateProduct(editingProduct.id, productPayload);
      } else {
        await addProduct(productPayload);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Save product error:', err);
      setErrorMsg(err?.message || 'Erreur lors de l\'enregistrement du produit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Gestion des Produits ({products.length})</h2>
          <p className="text-xs text-slate-500 font-medium">
            Ajoutez, modifiez ou ajustez les stocks et prix par pointure.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Produit</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4">Marque & Catégorie</th>
                <th className="py-3 px-4">Prix</th>
                <th className="py-3 px-4">Stock Total</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun produit disponible. Cliquez sur "Ajouter un produit".
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <div className="flex gap-1 pt-0.5">
                          {p.isNew && <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.2 rounded-md">Nouveau</span>}
                          {p.isBestSeller && <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-md">Top Vente</span>}
                          {p.promoPrice && <span className="text-[9px] bg-rose-100 text-rose-800 font-extrabold px-1.5 py-0.2 rounded-md">Promo</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-blue-600 block">{p.brandName}</span>
                        <span className="text-slate-400 text-[11px]">{p.categoryName}</span>
                      </td>
                      <td className="py-3 px-4">
                        {p.promoPrice ? (
                          <div>
                            <span className="font-black text-rose-600 block">{p.promoPrice} DT</span>
                            <span className="text-slate-400 line-through text-[10px]">{p.price} DT</span>
                          </div>
                        ) : (
                          <span className="font-black text-slate-900">{p.price} DT</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-extrabold ${totalStock === 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {totalStock} unités
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                            p.published
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {p.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{p.published ? 'Publié' : 'Masqué'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
          <div className="min-h-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct.id ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nom du Produit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Nike Air Max 270"
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Marque</label>
                  <select
                    value={editingProduct.brandId || ''}
                    onChange={(e) => {
                      const b = brands.find((br) => br.id === e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        brandId: e.target.value,
                        brandName: b?.name || ''
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Catégorie</label>
                  <select
                    value={editingProduct.categoryId || ''}
                    onChange={(e) => {
                      const c = categories.find((cat) => cat.id === e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: e.target.value,
                        categoryName: c?.name || ''
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Prix Normal (DT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="159"
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Promo Price */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Prix Promo (DT) (Optionnel)
                  </label>
                  <input
                    type="number"
                    placeholder="129"
                    value={editingProduct.promoPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        promoPrice: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Photos & Media Section */}
                <div className="sm:col-span-2 space-y-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  {/* Photos Attachment Manager */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>Photos du Produit (Galerie)</span>
                      </label>
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] flex items-center gap-1.5 transition-all shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Importer des Photos</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Add Image URL input */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Ou collez une URL d'image (ex: https://...)"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                      >
                        Ajouter URL
                      </button>
                    </div>

                    {/* Image Thumbnails List */}
                    {editingProduct.images && editingProduct.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {editingProduct.images.map((img, idx) => (
                          <div
                            key={idx}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-white group shadow-xs ${
                              idx === 0 ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
                            }`}
                          >
                            <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-blue-600 text-white font-black text-[9px] uppercase tracking-wider">
                                Principale
                              </span>
                            )}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-[10px] font-bold"
                                  title="Définir comme principale"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 text-[10px] font-bold"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Description du produit..."
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Stock Management Per Size */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Stock par Pointure (Quantités disponibles)
                </label>
                <p className="text-[11px] text-slate-500 font-medium -mt-1.5">
                  Ajoutez n'importe quelle pointure : 46, 47, demi-pointures (43 1/2, 46 1/2), etc.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(editingProduct.sizes || defaultSizes).map((sz, idx) => (
                    <div key={sz.size} className="relative p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedSizes = (editingProduct.sizes || defaultSizes).filter((_, i) => i !== idx);
                          setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                        }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 flex items-center justify-center"
                        title="Supprimer cette pointure"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-extrabold text-slate-800 block text-center">
                        Taille {sz.size}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={sz.stock}
                        onChange={(e) => {
                          const updatedSizes = [...(editingProduct.sizes || defaultSizes)];
                          updatedSizes[idx] = { ...sz, stock: Math.max(0, Number(e.target.value)) };
                          setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg py-1 px-2 text-xs text-center font-bold focus:outline-hidden"
                      />
                    </div>
                  ))}
                </div>

                {/* Add a custom size */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSizeLabel}
                    onChange={(e) => setNewSizeLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;
                      e.preventDefault();
                      const label = newSizeLabel.trim();
                      if (!label) return;
                      const current = editingProduct.sizes || defaultSizes;
                      if (current.some((s) => s.size === label)) {
                        setNewSizeLabel('');
                        return;
                      }
                      const updatedSizes = sortSizes([...current, { size: label, stock: 0 }]);
                      setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                      setNewSizeLabel('');
                    }}
                    placeholder="Ex: 47 ou 46 1/2"
                    className="flex-1 bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const label = newSizeLabel.trim();
                      if (!label) return;
                      const current = editingProduct.sizes || defaultSizes;
                      if (current.some((s) => s.size === label)) {
                        setNewSizeLabel('');
                        return;
                      }
                      const updatedSizes = sortSizes([...current, { size: label, stock: 0 }]);
                      setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                      setNewSizeLabel('');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter la pointure
                  </button>
                </div>
              </div>

              {/* Badges Checkboxes */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isNew || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isNew: e.target.checked })}
                    className="rounded-md border-slate-300 text-blue-600"
                  />
                  <span>Badge Nouveau</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isBestSeller || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                    className="rounded-md border-slate-300 text-amber-600"
                  />
                  <span>Badge Top Vente</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.published ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, published: e.target.checked })}
                    className="rounded-md border-slate-300 text-emerald-600"
                  />
                  <span>Publié en ligne</span>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg transition-all"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer le Produit'}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};
