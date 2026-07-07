import React from 'react';

export default function TourCatalogSkeleton() {
  return (
    <div className="space-y-10 animate-pulse font-sans w-full" id="tour-catalog-skeleton">
      {/* Search & Location Bar Shimmer */}
      <div className="bg-slate-900/10 border border-slate-200/50 rounded-3xl p-5 md:p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 h-11 bg-slate-200 rounded-xl" />
          <div className="md:col-span-5 h-11 bg-slate-200 rounded-xl" />
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <div className="h-4 w-16 bg-slate-200 rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 w-20 bg-slate-200 rounded-full" />
          ))}
          <div className="ml-auto h-5 w-40 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Categories Horizontal Pills Shimmer */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 bg-slate-200 rounded-full shrink-0" />
        ))}
      </div>

      {/* Tour Cards Grid Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden flex flex-col justify-between p-1.5 space-y-4 shadow-xs"
          >
            {/* Image Box Shimmer */}
            <div className="relative bg-slate-200/80 h-52 rounded-2xl overflow-hidden">
              <div className="absolute top-3 left-3 h-5 w-16 bg-slate-300 rounded-full" />
              <div className="absolute top-3 right-3 h-5 w-12 bg-slate-300 rounded-lg" />
            </div>

            {/* Content Box Shimmer */}
            <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="space-y-1.5">
                  <div className="h-5 w-11/12 bg-slate-200 rounded-md" />
                  <div className="h-5 w-3/4 bg-slate-200 rounded-md" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="h-[1px] bg-slate-100" />
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="h-2.5 w-12 bg-slate-200 rounded" />
                    <div className="h-5 w-24 bg-slate-200 rounded-md" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 w-9 bg-slate-200 rounded-full" />
                    <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
