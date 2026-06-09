import React from 'react';

export default function DiagnosticBanner({ diagnostic }) {
  if (!diagnostic) return null;

  const isError = diagnostic.severity === "error";
  const themeClasses = isError
    ? "bg-red-950/40 border-red-900/50 text-red-100"
    : "bg-yellow-950/40 border-yellow-900/50 text-yellow-100";
    
  const iconClass = isError ? "text-red-500" : "text-yellow-500";
  
  const Icon = isError ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
  );

  return (
    <div className={`p-4 rounded-lg border shadow-sm mb-0 flex flex-col gap-3 ${themeClasses}`}>
      <div className="flex items-center gap-2 font-bold text-lg">
        {Icon}
        <span>{diagnostic.title}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-1 opacity-80 flex items-center gap-1">
            Why It Happened
          </h3>
          <p className="text-sm opacity-90">{diagnostic.explanation}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-1 opacity-80 flex items-center gap-1">
            Suggested Fix
          </h3>
          <p className="text-sm opacity-90">{diagnostic.suggestedFix}</p>
        </div>
      </div>

      {diagnostic.rawMessage && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <details className="text-xs opacity-75">
            <summary className="cursor-pointer hover:opacity-100 flex items-center gap-1 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><polyline points="8 10 12 14 8 18"></polyline><line x1="16" x2="16" y1="18" y2="18"></line></svg>
              Show Raw Error Output
            </summary>
            <div className="mt-2 p-2 rounded bg-black/30 font-mono whitespace-pre-wrap overflow-x-auto">
              {diagnostic.rawMessage}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
