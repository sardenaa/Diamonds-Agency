import React from 'react';
import { Sparkles } from 'lucide-react';
import { AppLanguage } from '../../../../types.js';

interface AiConsoleTabProps {
  lang: AppLanguage;
  aiType: string;
  setAiType: (val: string) => void;
  aiKeywords: string;
  setAiKeywords: (val: string) => void;
  aiGenerating: boolean;
  handleAiGenerate: () => void;
  aiGeneratedContent: string;
}

export default function AiConsoleTab({
  lang,
  aiType,
  setAiType,
  aiKeywords,
  setAiKeywords,
  aiGenerating,
  handleAiGenerate,
  aiGeneratedContent,
}: AiConsoleTabProps) {
  return (
    <div className="space-y-6 animate-fade-in text-xs md:text-sm">
      <div className="bg-slate-800/20 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          <h4 className="text-sm font-bold uppercase text-amber-400 tracking-wider">AI Content Assistant</h4>
        </div>
        <p className="text-slate-400 text-xs font-semibold leading-relaxed">
          Use Google Gemini to generate descriptions, itineraries, blog posts, and keywords.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Task Type</label>
            <select
              value={aiType}
              onChange={(e) => setAiType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white w-full focus:outline-none cursor-pointer"
            >
              <option value="Tour Description">Tour Description</option>
              <option value="Bespoke Itinerary">Itinerary</option>
              <option value="Luxury Blog Article">Blog Post</option>
              <option value="SEO Keywords Map">SEO Keywords</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Seed Subject Keywords</label>
            <input
              type="text"
              value={aiKeywords}
              onChange={(e) => setAiKeywords(e.target.value)}
              placeholder="e.g. VIP Pyramids Sunset champagne horse carriage..."
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white w-full focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAiGenerate}
          disabled={aiGenerating || !aiKeywords.trim()}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{aiGenerating ? 'Generating...' : 'Generate Content'}</span>
        </button>
      </div>

      {aiGeneratedContent && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 animate-fade-in text-xs md:text-sm">
          <h5 className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px]">
            {lang === 'ar' ? 'محتوى ذكي تم توليده بواسطة جيميني' : 'Generated Content'}
          </h5>
          <div className="h-[1px] bg-slate-800 my-2" />
          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{aiGeneratedContent}</p>
        </div>
      )}
    </div>
  );
}
