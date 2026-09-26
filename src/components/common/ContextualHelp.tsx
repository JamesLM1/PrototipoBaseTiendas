import React from 'react';
import { HelpCircle, X, BookOpen, Scale, Calculator } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HelpButtonProps {
  topicKey: string;
  className?: string;
  ariaLabel?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  topicKey,
  className = '',
  ariaLabel = 'Ver ayuda contextual del campo',
}) => {
  const { openHelp } = useApp();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openHelp(topicKey);
      }}
      aria-label={ariaLabel}
      title="Ayuda y sustento normativo"
      className={`inline-flex items-center justify-center w-4 h-4 text-slate-400 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full transition-colors ml-1 ${className}`}
    >
      <HelpCircle className="w-3.5 h-3.5" />
    </button>
  );
};

export const ContextualHelpModal: React.FC = () => {
  const { activeHelpTopic, closeHelp } = useApp();

  if (!activeHelpTopic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
      >
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 id="help-title" className="text-sm font-semibold text-slate-900">
              {activeHelpTopic.titulo}
            </h3>
          </div>
          <button
            type="button"
            onClick={closeHelp}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm text-slate-700">
          <div>
            <p className="leading-relaxed">{activeHelpTopic.definicion}</p>
          </div>

          {activeHelpTopic.formula && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-1">
                <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                <span>Expresión Matemática</span>
              </div>
              <code className="text-xs text-indigo-900 font-mono block overflow-x-auto whitespace-nowrap py-1">
                {activeHelpTopic.formula}
              </code>
            </div>
          )}

          {activeHelpTopic.normativa && (
            <div className="flex items-start gap-2 text-xs text-slate-600 bg-amber-50/70 p-3 rounded-lg border border-amber-200/60">
              <Scale className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900">Marco Legal & SBS:</span>{' '}
                {activeHelpTopic.normativa}
              </div>
            </div>
          )}

          {activeHelpTopic.ejemplo && (
            <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span className="font-medium text-slate-700">Ejemplo práctico:</span>{' '}
              {activeHelpTopic.ejemplo}
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={closeHelp}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
