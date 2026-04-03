import React from 'react';
import { Upload, Download } from 'lucide-react';
import Papa from 'papaparse';

interface CsvToolsProps {
 dataToExport: any[];
 exportFilename: string;
 onImport: (parsedData: unknown[]) => void;
}

export function CsvTools({ dataToExport, exportFilename, onImport }: CsvToolsProps) {
 const handleExport = () => {
 const csv = Papa.unparse(dataToExport);
 const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
 const link = document.createElement('a');
 if (link.download !== undefined) {
 const url = URL.createObjectURL(blob);
 link.setAttribute('href', url);
 link.setAttribute('download', exportFilename);
 link.style.visibility = 'hidden';
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 }
 };

 const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 Papa.parse(file, {
 header: true,
 skipEmptyLines: true,
 complete: (results) => {
 onImport(results.data);
 e.target.value = ''; // Reset the input to allow uploading the same file again
 },
 error: (err) => {
 alert(`Erro ao ler arquivo CSV: ${err.message}`);
 }
 });
 };

 return (
 <div className="flex gap-2">
 <label className="flex items-center gap-2 px-4 py-2 bg-industrial-surface border border-industrial-border hover:bg-gray-50 text-industrial-text text-sm font-medium rounded-lg cursor-pointer transition-colors shadow-sm active:scale-95">
 <Upload size={16} />
 <span className="hidden sm:inline">Importar</span>
 <input type="file"accept=".csv"className="hidden"onChange={handleImport} />
 </label>
 <button 
 onClick={handleExport}
 className="flex items-center gap-2 px-4 py-2 bg-industrial-surface border border-industrial-border hover:bg-gray-50 text-industrial-text text-sm font-medium rounded-lg transition-colors shadow-sm active:scale-95"
 >
 <Download size={16} />
 <span className="hidden sm:inline">Exportar</span>
 </button>
 </div>
 );
}
