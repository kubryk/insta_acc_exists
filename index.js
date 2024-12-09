// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs'); // Підключаємо модуль для роботи з файлами

// // Функція для затримки
// function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function checkAccountExists(url) {
//     try {
//         const response = await axios.get(url, { timeout: 5000 }); // Set timeout for request

//         // Завантажуємо HTML в cheerio
//         const $ = cheerio.load(response.data);

//         // Отримуємо текст з тегу <title>
//         const title = $('title').text();
//         console.log(`Перевіряємо: ${url} -> Заголовок: ${title}`);

//         // Якщо у заголовку є "Instagram" або інші ознаки відсутності акаунта
//         if (title === "Instagram") {
//             return { url, exists: false };
//         } else {
//             return { url, exists: true };
//         }
//     } catch (error) {
//         console.log(`Помилка при перевірці: ${url} -> ${error.message}`);
//         return { url, exists: false };
//     }
// }

// // Функція для перевірки акаунтів з затримкою
// async function checkAccountsWithDelay(links, delayTime) {
//     const results = [];

//     for (let i = 0; i < links.length; i++) {
//         const link = links[i];

//         if (link.includes('instagram')) {
//             const result = await checkAccountExists(link);
//             results.push({ ...result, number: i + 1 });
//         } else {
//             // Якщо посилання не на Instagram, автоматично вважаємо, що акаунт існує
//             console.log(`Пропускаємо перевірку: ${link} -> Вважаємо, що існує`);
//             results.push({ url: link, exists: true, number: i + 1 });
//         }

//         // Затримка між запитами
//         if (i < links.length - 1) {
//             await delay(delayTime);
//         }
//     }

//     return results;
// }

// // Масив посилань
// const links = [
//     'https://www.instagram.com/hairbykatelyn_greer/',
//     'https://www.instagram.com/columbus.blonde.whisperer/',
// ];

// // Викликаємо функцію перевірки акаунтів з затримкою 5 секунд між запитами
// checkAccountsWithDelay(links, 5000)
//     .then(results => {
//         console.log("Перевірка акаунтів завершена. Повний звіт:");

//         // Формуємо результат для запису у файл
//         let output = "Перевірка акаунтів завершена. Повний звіт:\n\n";
//         results.forEach(result => {
//             output += `${result.number} - ${result.url} - ${result.exists ? 'Є' : 'НЕМА'}\n`;
//         });

//         // Додатковий звіт
//         const totalChecked = results.length;
//         const totalExists = results.filter(result => result.exists).length;
//         const totalNotExists = totalChecked - totalExists;

//         output += `\nЗагальна кількість акаунтів: ${totalChecked}\n`;
//         output += `Акаунти, які існують: ${totalExists}\n`;
//         output += `Акаунти, яких не існує: ${totalNotExists}\n`;

//         // Записуємо результат у текстовий файл
//         fs.writeFile('account_check_report.txt', output, (err) => {
//             if (err) {
//                 console.log('Помилка при записі у файл:', err);
//             } else {
//                 console.log('Звіт успішно записано у файл "account_check_report.txt"');
//             }
//         });
//     })
//     .catch(error => {
//         console.log('Помилка:', error);
//     });



const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Функція для затримки
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkAccountExists(url) {
    try {
        const response = await axios.get(url, { timeout: 5000 }); // Set timeout for request

        // Завантажуємо HTML в cheerio
        const $ = cheerio.load(response.data);

        // Отримуємо текст з тегу <title>
        const title = $('title').text();
        console.log(`Перевіряємо: ${url} -> Заголовок: ${title}`);

        // Якщо у заголовку є "Instagram" або інші ознаки відсутності акаунта
        if (title === "Instagram") {
            return { url, exists: false };
        } else {
            return { url, exists: true };
        }
    } catch (error) {
        console.log(`Помилка при перевірці: ${url} -> ${error.message}`);
        return { url, exists: false };
    }
}

// Функція для перевірки акаунтів з затримкою
async function checkAccountsWithDelay(links, delayTime) {
    const results = [];

    for (let i = 0; i < links.length; i++) {
        const link = links[i];

        if (link.includes('instagram')) {
            const result = await checkAccountExists(link);
            results.push({ ...result, number: i + 1 });
        } else {
            // Якщо посилання не на Instagram, автоматично вважаємо, що акаунт існує
            console.log(`Пропускаємо перевірку: ${link} -> Вважаємо, що існує`);
            results.push({ url: link, exists: true, number: i + 1 });
        }

        // Затримка між запитами
        if (i < links.length - 1) {
            await delay(delayTime);
        }
    }

    return results;
}

// Зчитування JSON файлу
fs.readFile('results.json', 'utf8', async (err, data) => {
    if (err) {
        console.log('Помилка при зчитуванні файлу:', err);
        return;
    }

    const jsonData = JSON.parse(data);

    // Обробляємо кожен запис в JSON
    for (const item of jsonData) {
        console.log(`Перевіряємо акаунти з файлу: ${item.file}, в папці: ${item.folder}`);

        const links = item.links;
        const checkedResults = await checkAccountsWithDelay(links, 5000); // Затримка між запитами 5 секунд

        // Формуємо результат для цього запису
        let output = `Звіт для файлу: ${item.file} (Папка: ${item.folder})\n\n`;
        checkedResults.forEach(result => {
            output += `${result.number} - ${result.url} - ${result.exists ? '' : 'НЕМА'}\n`;
        });

        // Додатковий звіт
        const totalChecked = checkedResults.length;
        const totalExists = checkedResults.filter(result => result.exists).length;
        const totalNotExists = totalChecked - totalExists;

        output += `\nЗагальна кількість акаунтів: ${totalChecked}\n`;
        output += `Акаунти, які існують: ${totalExists}\n`;
        output += `Акаунти, яких не існує: ${totalNotExists}\n`;

        // Записуємо результат у текстовий файл після кожної ітерації
        fs.appendFile('account_check_report.txt', output + '\n\n', (err) => {
            if (err) {
                console.log('Помилка при записі у файл:', err);
            } else {
                console.log(`Звіт для файлу ${item.file} записано у файл`);
            }
        });
    }
});