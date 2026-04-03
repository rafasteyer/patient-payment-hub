const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove any class that starts with dark: carefully
    let newContent = content.replace(/dark:[a-zA-Z0-9\-\/\[\]#\.]+/g, '');
    
    // Clean up multiple spaces that might have been left
    newContent = newContent.replace(/  +/g, ' ');
    newContent = newContent.replace(/ "/g, '"');
    newContent = newContent.replace(/" /g, '"');
    
    fs.writeFileSync(filePath, newContent);
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
    'src/components/NavigationTabs.tsx',
    'src/layouts/MainLayout.tsx'
];

files.forEach(f => processFile(path.join(process.cwd(), f)));
console.log('Reverted dark classes.');
