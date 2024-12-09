const fs = require('fs');
const path = require('path');

// Шлях до кореневої папки, де знаходяться файли
const rootFolder = path.join(__dirname, 'articles');

// Точна назва файлу
const targetFileName = 'новий код статті.txt';

// Шлях до файлу результату
const outputFilePath = path.join(__dirname, 'results.json');

// Рекурсивна функція для пошуку конкретного файлу
function findTargetFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            // Якщо це папка, проходимо її рекурсивно
            findTargetFiles(filePath, arrayOfFiles);
        } else if (file === targetFileName) {
            // Якщо назва файлу відповідає точно, додаємо його
            arrayOfFiles.push(filePath);
        }
    });

    return arrayOfFiles;
}

// Знаходимо всі файли з заданою назвою
const allFiles = findTargetFiles(rootFolder);

if (allFiles.length === 0) {
    console.log(`Файли з назвою "${targetFileName}" не знайдено.`);
} else {
    // Функція для обробки одного файлу
    function processFile(filePath) {
        const html = fs.readFileSync(filePath, 'utf-8');

        const regex = /\[caption[^\]]*\](.*?)\[\/caption\]/gs;

        const matches = [...html.matchAll(regex)];

        const result = {
            file: path.basename(filePath), // Назва файлу
            folder: path.basename(path.dirname(filePath)), // Назва папки
            links: [],
            totalLinks: 0
        };

        matches.forEach(match => {
            const captionContent = match[1];
            const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>/g;
            let linkMatch;

            while ((linkMatch = linkRegex.exec(captionContent)) !== null) {
                result.links.push(linkMatch[1]);
            }
        });

        result.totalLinks = result.links.length;
        return result;
    }

    // Обробляємо всі знайдені файли
    const results = allFiles.map(processFile);

    // Записуємо результати у JSON-файл
    fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 4), 'utf-8');
    console.log(`Результати збережено у файл ${outputFilePath}`);
}