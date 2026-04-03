const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Make sure we don't double append
    if (content.includes('dark:bg-gray-800')) return;

    // Backgrounds
    content = content.replace(/bg-white/g, "bg-white dark:bg-gray-800");
    content = content.replace(/bg-gray-50\/50/g, "bg-gray-50/50 dark:bg-gray-800/80");
    content = content.replace(/bg-gray-50\/30/g, "bg-gray-50/30 dark:bg-gray-800/40");
    content = content.replace(/bg-gray-50/g, "bg-gray-50 dark:bg-gray-900/50");
    content = content.replace(/bg-gray-100/g, "bg-gray-100 dark:bg-gray-700/50");
    
    // Borders
    content = content.replace(/border-gray-100/g, "border-gray-100 dark:border-gray-700");
    content = content.replace(/border-gray-200/g, "border-gray-200 dark:border-gray-600");
    content = content.replace(/border-gray-300/g, "border-gray-300 dark:border-gray-600");
    content = content.replace(/divide-gray-100/g, "divide-gray-100 dark:divide-gray-700");

    // Text
    content = content.replace(/text-gray-400/g, "text-gray-400 dark:text-gray-500");
    content = content.replace(/text-gray-500/g, "text-gray-500 dark:text-gray-400");
    content = content.replace(/text-gray-600/g, "text-gray-600 dark:text-gray-300");
    content = content.replace(/text-gray-700/g, "text-gray-700 dark:text-gray-200");
    content = content.replace(/text-gray-800/g, "text-gray-800 dark:text-gray-200");
    content = content.replace(/text-gray-900/g, "text-gray-900 dark:text-white");
    content = content.replace(/text-industrial-text/g, "text-industrial-text dark:text-gray-100");
    content = content.replace(/text-industrial-text-muted/g, "text-industrial-text-muted dark:text-gray-400");
    
    // Zebra striping
    content = content.replace(/odd:bg-white/g, "odd:bg-white dark:odd:bg-gray-800");
    content = content.replace(/even:bg-\[#365D08\]\/\[0\.04\]/g, "even:bg-[#365D08]/[0.04] dark:even:bg-[#365D08]/20");
    
    // Hover states
    content = content.replace(/hover:bg-\[#365D08\]\/10/g, "hover:bg-[#365D08]/10 dark:hover:bg-[#365D08]/30");
    
    fs.writeFileSync(filePath, content);
}

const files = [
    'src/pages/Waitlist.tsx',
    'src/pages/Dashboard.tsx',
    'src/pages/Goals.tsx',
    'src/pages/Patients.tsx',
    'src/pages/Finance.tsx',
    'src/pages/Tasks.tsx',
    'src/components/PatientForm.tsx',
    'src/components/TransactionForm.tsx',
    'src/components/CsvTools.tsx',
    'src/layouts/NavigationTabs.tsx',
    'src/layouts/MainLayout.tsx'
];

files.forEach(f => processFile(path.join(process.cwd(), f)));
console.log('Dark mode classes applied.');
