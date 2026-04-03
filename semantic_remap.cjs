const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    const originalLength = content.length;

    // Backgrounds 
    // We only want to replace standalone classes, so we use word boundaries or lookaheads where possible.
    // Instead of regex complexity, we can globally replace since these are specific tailwind classes.
    // Use (?<=[\s"'\`]) and (?=[\s"'\`]) to ensure we don't match substrings like "bg-white-500" if they existed.
    const map = {
        'bg-white': 'bg-industrial-surface',
        'bg-gray-50': 'bg-industrial-bg',
        'text-gray-900': 'text-industrial-text',
        'text-gray-800': 'text-industrial-text',
        'text-gray-700': 'text-industrial-text',
        'text-gray-600': 'text-industrial-text-muted',
        'text-gray-500': 'text-industrial-text-muted',
        'text-gray-400': 'text-industrial-text-muted',
        'border-gray-100': 'border-industrial-border',
        'border-gray-200': 'border-industrial-border',
        'border-gray-300': 'border-industrial-border',
        'divide-gray-100': 'divide-industrial-border',
        'divide-gray-200': 'divide-industrial-border'
    };

    let newContent = content;
    for (const [key, value] of Object.entries(map)) {
        // Regex to safely replace precise class names in TSX className strings
        // It matches the key surrounded by spaces or quotes
        const regex = new RegExp(`(?<=[\\s"'\\\`])${key}(?=[\\s"'\\\`])`, 'g');
        newContent = newContent.replace(regex, value);

        // Additional handler for odd:bg-white
        if (key === 'bg-white') {
            newContent = newContent.replace(/(?<=[\\s"'\\\`])odd:bg-white(?=[\\s"'\\\`])/g, 'odd:bg-industrial-surface');
            newContent = newContent.replace(/(?<=[\\s"'\\\`])even:bg-white(?=[\\s"'\\\`])/g, 'even:bg-industrial-surface');
            newContent = newContent.replace(/(?<=[\\s"'\\\`])hover:bg-white(?=[\\s"'\\\`])/g, 'hover:bg-industrial-surface');
        }
    }

    // Special fix for Patients.tsx grid rows where we set even:bg-[#365D08]/[0.04] odd:bg-white
    newContent = newContent.replace(/odd:bg-white hover:bg-\[#365D08\]\/10/g, 'odd:bg-industrial-surface hover:bg-[#365D08]/10');
    // Special fix for NavigationTabs toggler icons (text-gray-200 is hardcoded in Sun icon)
    // Revert it if it caused bugs, but text-gray-200 is fine.

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
    }
}

const dir = path.join(process.cwd(), 'src');
const filesToScan = [];

function scanDir(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            filesToScan.push(fullPath);
        }
    }
}

scanDir(dir);
filesToScan.forEach(processFile);
console.log('Semantic variable remap completed.');
