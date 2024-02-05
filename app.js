const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.send('¡Hola, esta es la página de inicio!');
    
});

app.post('/api/scrape', async (req, res) => {
    try {
        const productURLs = await scrapeData();
        res.json({ productURLs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al realizar el scraping.', details: error.message});
    }
});

async function scrapeData() {
    console.log('Iniciando scraping...');
    const maxPages = 50;
    const paginationURLsToVisit = ['https://scrapeme.live/shop'];
    const visitedURLs = [];
    const productURLs = new Set();

    while (paginationURLsToVisit.length !== 0 && visitedURLs.length <= maxPages) {
        const paginationURL = paginationURLsToVisit.pop();
        const pageHTML = await axios.get(paginationURL);
        visitedURLs.push(paginationURL);

        const $ = cheerio.load(pageHTML.data);

        $('.page-numbers a').each((index, element) => {
            const paginationURL = $(element).attr('href');
            if (!visitedURLs.includes(paginationURL) && !paginationURLsToVisit.includes(paginationURL)) {
                paginationURLsToVisit.push(paginationURL);
            }
        });

        $('li.product a.woocommerce-LoopProduct-link').each((index, element) => {
            const productURL = $(element).attr('href');
            productURLs.add(productURL);
        });
    }
    console.log('Scraping finalizado.');
    return [...productURLs];
}





app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
