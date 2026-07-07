import React from 'react';
import { Tag } from 'lucide-react';
import { Coupon } from '../../../types.js';

interface CouponsTabProps {
  coupons: Coupon[];
  newCouponCode: string;
  setNewCouponCode: (val: string) => void;
  newCouponDiscount: number;
  setNewCouponDiscount: (val: number) => void;
  newCouponValidUntil: string;
  setNewCouponValidUntil: (val: string) => void;
  editingCouponCode: string | null;
  setEditingCouponCode: (val: string | null) => void;
  handleSaveCoupon: (e: React.FormEvent) => void;
  handleToggleCoupon: (code: string, active: boolean) => void;
  handleDeleteCoupon: (code: string) => void;
}

export default function CouponsTab({
  coupons,
  newCouponCode,
  setNewCouponCode,
  newCouponDiscount,
  setNewCouponDiscount,
  newCouponValidUntil,
  setNewCouponValidUntil,
  editingCouponCode,
  setEditingCouponCode,
  handleSaveCoupon,
  handleToggleCoupon,
  handleDeleteCoupon,
}: CouponsTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight">Promo Codes & Coupons Management</h3>
            <p className="text-slate-400 text-[11px] uppercase tracking-wider font-extrabold">
              Generate and track luxury incentive vouchers
            </p>
          </div>
        </div>
        <div className="h-[1px] bg-slate-800" />

        <form
          onSubmit={handleSaveCoupon}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs"
        >
          <div>
            <label className="block text-slate-400 font-bold mb-1">Coupon Code</label>
            <input
              required
              type="text"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              placeholder="e.g. LUXURY20"
              className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none uppercase"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Discount %</label>
            <input
              required
              type="number"
              min={1}
              max={100}
              value={newCouponDiscount}
              onChange={(e) => setNewCouponDiscount(parseInt(e.target.value) || 10)}
              className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Valid Until</label>
            <input
              required
              type="date"
              value={newCouponValidUntil}
              onChange={(e) => setNewCouponValidUntil(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white w-full focus:outline-none"
            />
          </div>
          <div>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-4 rounded-lg w-full transition-colors cursor-pointer"
            >
              {editingCouponCode ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-800/20 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400 font-bold">
              <th className="p-3 text-[10px] uppercase">Coupon Code</th>
              <th className="p-3 text-[10px] uppercase">Discount %</th>
              <th className="p-3 text-[10px] uppercase">Valid Until</th>
              <th className="p-3 text-[10px] uppercase text-center">Status</th>
              <th className="p-3 text-[10px] uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-medium">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                  No active promo codes currently configured.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.code} className="hover:bg-slate-800/25">
                  <td className="p-3">
                    <span className="font-mono text-amber-400 font-black">{c.code}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-emerald-400">{c.discountPercent}% Off</span>
                  </td>
                  <td className="p-3">
                    <span className="text-slate-300">{c.validUntil}</span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleCoupon(c.code, c.active)}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                        c.active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {c.active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCouponCode(c.code);
                        setNewCouponCode(c.code);
                        setNewCouponDiscount(c.discountPercent);
                        setNewCouponValidUntil(c.validUntil);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(c.code)}
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
