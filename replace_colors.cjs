const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/even:bg-blue-100\/50/g, "even:bg-[#365D08]/[0.04]");
    content = content.replace(/hover:bg-blue-50/g, "hover:bg-[#365D08]/10");
    content = content.replace(/bg-blue-50/g, "bg-[#365D08]/10");
    content = content.replace(/hover:bg-blue-900/g, "hover:bg-[#243F05]");
    content = content.replace(/shadow-blue-900\/20/g, "shadow-[#243F05]/20");
    content = content.replace(/shadow-blue-900\/30/g, "shadow-[#243F05]/30");
    
    // Replace residual hardcoded greens
    content = content.replace(/bg-\[#1b4332\]/g, "bg-industrial-accent");
    content = content.replace(/hover:bg-\[#081c15\]/g, "hover:bg-[#243F05]");
    content = content.replace(/text-\[#1b4332\]/g, "text-industrial-accent");
    content = content.replace(/focus:border-\[#1b4332\]/g, "focus:border-industrial-accent");
    content = content.replace(/focus:ring-\[#1b4332\]/g, "focus:ring-industrial-accent");

    fs.writeFileSync(filePath, content);
}

const files = [
    'src/pages/Waitlist.tsx',
    'src/pages/Goals.tsx',
    'src/pages/Patients.tsx',
    'src/pages/Finance.tsx',
    'src/pages/Tasks.tsx',
    'src/components/PatientForm.tsx',
    'src/components/TransactionForm.tsx'
];

files.forEach(f => replaceInFile(path.join(process.cwd(), f)));
console.log('Done replacements');
