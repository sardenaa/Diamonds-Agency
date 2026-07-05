import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, ShieldCheck, PenTool } from 'lucide-react';
import { AppLanguage } from '../types.js';

interface SignaturePadProps {
  lang: AppLanguage;
  onSave: (signatureDataUrl: string | null) => void;
}

export default function SignaturePad({ lang, onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Clear signature
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw background placeholder text if empty? Or just keep it clear
    setIsEmpty(true);
    onSave(null);
  };

  // Get responsive coordinates
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    // Configure pristine ink styling
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // dark charcoal ink

    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Save to parent
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  // Prevent scrolling when drawing on touch screens
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventScroll = (e: TouchEvent) => {
      if (e.target === canvas) {
        e.preventDefault();
      }
    };

    document.body.addEventListener('touchstart', preventScroll, { passive: false });
    document.body.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.removeEventListener('touchstart', preventScroll);
      document.body.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <div className="space-y-2 border border-slate-200 p-4 rounded-2xl bg-white shadow-sm">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
            {lang === 'ar' ? 'التوقيع الرقمي السيادي للرحلة' : 'SOVEREIGN DIGITAL EXPEDITION SIGNATURE'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'إعادة التعيين' : 'Clear Ink'}</span>
        </button>
      </div>

      <div className="relative border-2 border-dashed border-slate-200 hover:border-amber-500/40 rounded-xl overflow-hidden bg-slate-50/50 transition-colors">
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-36 cursor-crosshair block"
          style={{ touchAction: 'none' }}
        />
        {isEmpty && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 select-none">
            <span className="text-xs font-bold text-center opacity-60 leading-relaxed px-4">
              {lang === 'ar'
                ? 'وقع هنا بإصبعك أو الماوس لاعتماد الاتفاقية'
                : 'Sign here with mouse or touch to authorize charter agreement'}
            </span>
            <span className="text-[10px] uppercase font-mono opacity-40 mt-1 tracking-widest">
              X _________________________
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold bg-slate-50 px-3 py-2 rounded-lg">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          {lang === 'ar'
            ? 'بتوقيعك، توافق على شروط الخدمة الفاخرة للرحلة وقواعد الخصوصية السيادية.'
            : 'Your signature will be recorded in our secure digital ledger under VIP service protocols.'}
        </span>
      </div>
    </div>
  );
}
