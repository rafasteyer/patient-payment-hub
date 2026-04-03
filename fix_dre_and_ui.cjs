const fs = require('fs');
const path = require('path');

// 1. Table Rows
const pages = ['Finance.tsx', 'Patients.tsx', 'Tasks.tsx', 'Waitlist.tsx'].map(f => path.join(__dirname, 'src/pages', f));

pages.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    // Replace any corrupted or old even/odd coloring with the new stronger ones
    const regex = /className="even:bg-\[#365D08\]\/\[0\.04\][^"]*"/g;
    const replacement = 'className="even:bg-[#365D08]/[0.08] dark:even:bg-[#365D08]/20 odd:bg-industrial-surface hover:bg-[#365D08]/15 dark:hover:bg-[#365D08]/30 transition-colors group"';
    if (content.match(regex)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(f, content);
    }
});

// 2. Patients.tsx - Export and Import Zeros (Carteirinha & CPF)
const patientsPath = path.join(__dirname, 'src/pages/Patients.tsx');
let patContent = fs.readFileSync(patientsPath, 'utf8');

// Fix Export
patContent = patContent.replace(/'Carteirinha': p\.cardNumber \|\| '',/g, `'Carteirinha': p.cardNumber ? \`="\${p.cardNumber}"\` : '',`);
patContent = patContent.replace(/'CPF': p\.cpf \|\| '',/g, `'CPF': p.cpf ? \`="\${p.cpf}"\` : '',`);

// Fix Import
if (!patContent.includes('const cleanString =')) {
    patContent = patContent.replace(/const parseAmountInput =/g, `const cleanString = (val: any) => String(val || '').replace(/^[="]+|["]+$/g, '').trim();\n            const parseAmountInput =`);
}
patContent = patContent.replace(/cardNumber: row\.cardNumber[^\n]*,/g, `cardNumber: cleanString(row.cardNumber || row.Carteirinha || row.CARTEIRINHA),`);
patContent = patContent.replace(/cpf: row\.cpf[^\n]*,/g, `cpf: cleanString(row.cpf || row.CPF || row.Cpf),`);

fs.writeFileSync(patientsPath, patContent);

// 3. Finance.tsx - DRE
const financePath = path.join(__dirname, 'src/pages/Finance.tsx');
let finContent = fs.readFileSync(financePath, 'utf8');

const dreBlock = `
 <div className="bg-industrial-surface rounded-xl shadow-sm border border-industrial-border overflow-hidden p-6 max-w-4xl mx-auto">
 <h3 className="text-lg font-bold text-industrial-text border-b border-industrial-border pb-4 mb-4">Demonstrativo de Resultados do Exercício (DRE)</h3>
 
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="border-b-2 border-industrial-border text-industrial-text">
 <th className="py-2.5 px-2 font-bold uppercase">DESCRIÇÃO</th>
 <th className="py-2.5 px-2 font-bold uppercase text-right">VALOR (R$)</th>
 <th className="py-2.5 px-2 font-bold uppercase text-right">%</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-industrial-border text-industrial-text">
 {/* RECEITA */}
 <tr className="bg-[#365D08]/10 font-bold">
 <td className="py-3 px-2">(+) RECEITA BRUTA</td>
 <td className="py-3 px-2 text-right text-green-600">{filteredSummary.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
 <td className="py-3 px-2 text-right">100,00%</td>
 </tr>

 {/* DEDUÇÕES */}
 <tr className="font-semibold text-red-600 uppercase">
 <td className="py-3 px-2">(-) Deduções da Receita</td>
 <td className="py-3 px-2 text-right">R$ 0,00</td>
 <td className="py-3 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Impostos Simples Nacional</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>

 {/* CUSTOS / OPERACIONAIS */}
 <tr className="font-semibold text-red-600 uppercase">
 <td className="py-3 px-2">(-) Despesas Operacionais</td>
 <td className="py-3 px-2 text-right">R$ 0,00</td>
 <td className="py-3 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Aluguel (Helena Imóveis)</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Condomínio (Imofar)</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Fiador (Loft)</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Luz (RGE)</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>

 {/* ADMINISTRATIVAS */}
 <tr className="font-semibold text-red-600 uppercase">
 <td className="py-3 px-2">(-) Despesas Administrativas</td>
 <td className="py-3 px-2 text-right">R$ 0,00</td>
 <td className="py-3 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Contador (Facilite)</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Internet Fixa (Claro)</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Créditos Celular (Vivo)</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Material de Escritório / Copa / Limpeza</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Taxas (Alvará, Vigilância, CRP)</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted uppercase">
 <td className="py-2 px-6">Transporte</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>

 {/* PESSOAL */}
 <tr className="font-semibold text-red-600 uppercase">
 <td className="py-3 px-2">(-) Pessoal e Encargos</td>
 <td className="py-3 px-2 text-right">R$ 0,00</td>
 <td className="py-3 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Pró-Labore Líquido (Mara)</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Pró-Labore Líquido (Rafael)</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">INSS sobre Pró-Labore</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Remuneração Débora</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 <tr className="text-industrial-text-muted">
 <td className="py-2 px-6">Remuneração Gislaine</td>
 <td className="py-2 px-2 text-right">R$ 0,00</td>
 <td className="py-2 px-2 text-right">0,00%</td>
 </tr>
 
 {/* OUTRAS DESPESAS (Dinamico para suportar dados reais não catalogados acima) */}
 <tr className="font-semibold text-red-600 uppercase">
 <td className="py-3 px-2">(-) Total Despesas Lançadas (Sistema)</td>
 <td className="py-3 px-2 text-right">{filteredSummary.expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
 <td className="py-3 px-2 text-right">{filteredSummary.revenue > 0 ? ((filteredSummary.expenses / filteredSummary.revenue) * 100).toLocaleString('pt-BR', {maximumFractionDigits:2}) + '%' : '0,00%'}</td>
 </tr>

 {/* LUCRO LIQUIDO */}
 <tr className="border-t-2 border-industrial-border text-lg mt-4 bg-industrial-bg font-bold">
 <td className="py-4 px-2">(=) LUCRO LÍQUIDO</td>
 <td className={filteredSummary.netProfit >= 0 ? "py-4 px-2 text-right text-industrial-accent" : "py-4 px-2 text-right text-red-600"}>
 {filteredSummary.netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
 </td>
 <td className="py-4 px-2 text-right">{filteredSummary.revenue > 0 ? ((filteredSummary.netProfit / filteredSummary.revenue) * 100).toLocaleString('pt-BR', {maximumFractionDigits:2}) + '%' : '0,00%'}</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
`;

// Replace the generic DRE block with our highly customized templated block
const regex = /<div className="bg-industrial-surface rounded-xl shadow-sm border border-industrial-border overflow-hidden p-6 max-w-3xl mx-auto">[\s\S]*?(?=\s*<\/div>\s*<TransactionForm)/;
if (finContent.match(regex)) {
    finContent = finContent.replace(regex, dreBlock);
    fs.writeFileSync(financePath, finContent);
}

console.log('Script Success');
