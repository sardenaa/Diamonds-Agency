import React from 'react';
import { FileEdit } from 'lucide-react';
import { Blog as BlogArticle } from '../../../../types.js';

interface BlogsTabProps {
  blogs: BlogArticle[];
  editingBlogId: string | null;
  setEditingBlogId: (val: string | null) => void;
  newBlogTitleEn: string;
  setNewBlogTitleEn: (val: string) => void;
  newBlogTitleAr: string;
  setNewBlogTitleAr: (val: string) => void;
  newBlogDescriptionEn: string;
  setNewBlogDescriptionEn: (val: string) => void;
  newBlogDescriptionAr: string;
  setNewBlogDescriptionAr: (val: string) => void;
  newBlogBodyEn: string;
  setNewBlogBodyEn: (val: string) => void;
  newBlogBodyAr: string;
  setNewBlogBodyAr: (val: string) => void;
  newBlogCategory: string;
  setNewBlogCategory: (val: string) => void;
  newBlogImage: string;
  setNewBlogImage: (val: string) => void;
  newBlogSlug: string;
  setNewBlogSlug: (val: string) => void;
  handleSaveBlog: (e: React.FormEvent) => void;
  handleEditBlogClick: (blog: BlogArticle) => void;
  handleDeleteBlog: (id: string) => void;
}

export default function BlogsTab({
  blogs,
  editingBlogId,
  setEditingBlogId,
  newBlogTitleEn,
  setNewBlogTitleEn,
  newBlogTitleAr,
  setNewBlogTitleAr,
  newBlogDescriptionEn,
  setNewBlogDescriptionEn,
  newBlogDescriptionAr,
  setNewBlogDescriptionAr,
  newBlogBodyEn,
  setNewBlogBodyEn,
  newBlogBodyAr,
  setNewBlogBodyAr,
  newBlogCategory,
  setNewBlogCategory,
  newBlogImage,
  setNewBlogImage,
  newBlogSlug,
  setNewBlogSlug,
  handleSaveBlog,
  handleEditBlogClick,
  handleDeleteBlog,
}: BlogsTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <FileEdit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight">Sovereign Blog Articles Manager</h3>
            <p className="text-slate-400 text-[11px] uppercase tracking-wider font-extrabold">
              Publish editorial highlights and luxury updates
            </p>
          </div>
        </div>
        <div className="h-[1px] bg-slate-800" />

        <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
          <h4 className="text-amber-400 font-extrabold uppercase tracking-wider text-[10px]">
            {editingBlogId ? 'Edit Editorial Article' : 'Compose New Article'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Title (English)</label>
              <input
                required
                type="text"
                value={newBlogTitleEn}
                onChange={(e) => {
                  setNewBlogTitleEn(e.target.value);
                  if (!editingBlogId) {
                    setNewBlogSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                    );
                  }
                }}
                placeholder="e.g. Sunset champagne yacht excursions"
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Title (Arabic)</label>
              <input
                type="text"
                value={newBlogTitleAr}
                onChange={(e) => setNewBlogTitleAr(e.target.value)}
                placeholder="العنوان باللغة العربية"
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Category</label>
              <select
                value={newBlogCategory}
                onChange={(e) => setNewBlogCategory(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none cursor-pointer"
              >
                <option value="VIP Highlights">VIP Highlights</option>
                <option value="Yachting Ledger">Yachting Ledger</option>
                <option value="Cultural Expeditions">Cultural Expeditions</option>
                <option value="Hurghada Excursions">Hurghada Excursions</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Cover Image URL</label>
              <input
                required
                type="text"
                value={newBlogImage}
                onChange={(e) => setNewBlogImage(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">URL Slug</label>
              <input
                required
                type="text"
                value={newBlogSlug}
                onChange={(e) => setNewBlogSlug(e.target.value)}
                placeholder="sunset-yacht-excursions"
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Short Summary (English)</label>
              <textarea
                required
                value={newBlogDescriptionEn}
                onChange={(e) => setNewBlogDescriptionEn(e.target.value)}
                rows={2}
                placeholder="A brief summary for previews..."
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Short Summary (Arabic)</label>
              <textarea
                value={newBlogDescriptionAr}
                onChange={(e) => setNewBlogDescriptionAr(e.target.value)}
                rows={2}
                placeholder="ملخص قصير باللغة العربية..."
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Main Article Body (English)</label>
              <textarea
                required
                value={newBlogBodyEn}
                onChange={(e) => setNewBlogBodyEn(e.target.value)}
                rows={6}
                placeholder="Rich editorial prose..."
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none font-sans"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Main Article Body (Arabic)</label>
              <textarea
                value={newBlogBodyAr}
                onChange={(e) => setNewBlogBodyAr(e.target.value)}
                rows={6}
                placeholder="نص المقال باللغة العربية..."
                className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none text-right font-sans"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 px-6 rounded-xl transition-all cursor-pointer"
            >
              {editingBlogId ? 'Publish Changes' : 'Publish Article'}
            </button>
            {editingBlogId && (
              <button
                type="button"
                onClick={() => {
                  setEditingBlogId(null);
                  setNewBlogTitleEn('');
                  setNewBlogTitleAr('');
                  setNewBlogDescriptionEn('');
                  setNewBlogDescriptionAr('');
                  setNewBlogBodyEn('');
                  setNewBlogBodyAr('');
                  setNewBlogSlug('');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Blog articles list table */}
      <div className="bg-slate-800/20 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400 font-bold">
              <th className="p-3 text-[10px] uppercase">Cover</th>
              <th className="p-3 text-[10px] uppercase">Article Details</th>
              <th className="p-3 text-[10px] uppercase">Category</th>
              <th className="p-3 text-[10px] uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-medium">
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500 italic">
                  No articles registered on database.
                </td>
              </tr>
            ) : (
              blogs.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/25">
                  <td className="p-3">
                    <img src={b.image} alt={b.title.en} className="w-12 h-8 object-cover rounded-md border border-slate-700" />
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-slate-200 block">{b.title.en}</span>
                    <span className="text-[10px] text-slate-500 font-mono">slug: {b.slug}</span>
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-800 text-slate-300 border border-slate-750 px-2 py-0.5 rounded text-[10px] font-bold">
                      {b.category}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditBlogClick(b)}
                      className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlog(b.id)}
                      className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
