import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

let playerMap = new Map();

(async function scrape() {
    // Set up the WebDriver and specify the path to your ChromeDriver
    let options = new chrome.Options();
    options.addArguments('headless');  // Run Chrome in headless mode
    options.addArguments('disable-gpu');  // Applicable on Windows
    options.addArguments('no-sandbox');  // Bypass OS security model
    options.addArguments('disable-dev-shm-usage');  // Overcome limited resource problems
    options.addArguments('--disable-extensions'); // Disable extensions
    options.addArguments('--disable-plugins'); // Disable plugins
    options.addArguments('--disable-images'); // Disable images
    options.addArguments('--no-proxy-server'); // No proxy server

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        for (let i = 1; i < 4; i++) {
            // Navigate to the Transfermarkt most valuable players page
            await driver.get(`https://www.transfermarkt.us/spieler-statistik/wertvollstespieler/marktwertetop?ajax=yw1&page=${i}`);

            // Wait until the table with the data is located
            await driver.wait(until.elementLocated(By.css('.responsive-table')), 5000);

            // Wait for the elements to be located
            let elements = await driver.wait(until.elementsLocated(By.css('tr')), 5000);

            // Extract the names of all players with class 'even'
            let playerObjects = await Promise.all(elements.map(async (element) => {
                try {
                    // Find all <a> elements within the row
                    let nameElements = await element.findElements(By.css('a'));
                    let valueHtml = await nameElements[3].getAttribute('innerHTML');
                    let nameHtml = await nameElements[1].getAttribute('innerHTML');
                    return { name: nameHtml, value: valueHtml };
                } catch (err) {
                    console.error('Error processing element:', err);
                    return null;
                }
            }));

            // Filter out any null values from the results and add to the Map
            playerObjects.filter(player => player !== null).forEach(player => playerMap.set(player.name, player));
        }

        // Convert the Map values to an array and save to a JSON file
        const playerObjectsArray = Array.from(playerMap.values());
        fs.writeFileSync('playersData.json', JSON.stringify(playerObjectsArray, null, 2));
        console.log('Scraped Data saved to playersData.json:', playerObjectsArray);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Quit the WebDriver session
        await driver.quit();
    }
})();
