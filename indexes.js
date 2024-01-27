const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');


const BASE_URL = 'https://gamefaqs.gamespot.com';

const browserHeaders = {
 
    'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding' : 'gzip, deflate, br',
    'Accept-Language' : 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
    'Cache-Control' : 'max-age=0',
    'Cookie' : 'gf_dvi=ZjY1YjUzMDU2MDA5ZmYwMDM0ZDIxN2U1ZmZhYzg3OTI3ZGIzOGMxYmNiOTE5Zjk3NDgwYTRjZGQxNmQzNjViNTMwNTY%3D; gf_geo_id=QlIvU1Av; fv20240128=1; Geo={%22region%22:%22SP%22%2C%22city%22:%22hortolandia%22%2C%22country_name%22:%22brazil%22%2C%22country%22:%22BR%22%2C%22continent%22:%22SA%22}; usprivacy=1---; OptanonAlertBoxClosed=2024-01-27T16:36:03.279Z; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Jan+27+2024+13%3A36%3A03+GMT-0300+(Hor%C3%A1rio+Padr%C3%A3o+de+Bras%C3%ADlia)&version=202310.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0; wikia_beacon_id=3homWQpqbq; sessionId=c0f87a84-9e94-4d0d-8f1c-aa81adf039a6; pvNumber=1; pvNumberGlobal=1; _BB.bs={%22session%22:%22e%22%2C%22subses%22:%222%22}; _BB.d={%22ttag%22:%22%22%2C%22ftag%22:%22%22%2C%22pv%22:%221%22}; OneTrustWPCCPAGoogleOptOut=true; _pbjs_userid_consent_data=3524755945110770; _sharedid=fe467f46-f736-42d7-a0b2-6ecb4d3a4f6f; _cc_id=ac9ab7db924632d4e61bfd1caa1548f9; panoramaId_expiry=1706978166305; panoramaId=4084131c6543d6af13502b5a77174945a70274281de6320a0b3566c460580cd0; panoramaIdType=panoIndiv; cto_bidid=AuDQv19idDd6QXclMkJ0eFBUTm0lMkJ5Z1dwejhQM0tqMVplJTJCSXV0T09PTUFFVVdseTNNdkhFVk1uSFZXbWI4UTFQYm9OQTBTJTJCVXRhJTJCJTJGdHd3WlR6czAlMkZIRHd5M0JHeWxWOUJWT05hYnpEdWdGamp3TUJZJTNE; __gads=ID=8f23348ccf299b56:T=1706373367:RT=1706373367:S=ALNI_MbCxF8mWqZRskGuX7JdDam29aBKcQ; __gpi=UID=00000a099cfe36d5:T=1706373367:RT=1706373367:S=ALNI_MYP2cdfaNbqN909_8B6yK0E3MFwdw; cto_bundle=8B2OE18lMkZSTlpvOFV3UHZKUUNRQmU1TVlvTmFXMWZOc0k5NnJxU1h2QndlU2RYNUhYZkpYUFpIU3Z1VEtXVUNpdHQ5WXFVaXI3YTAlMkJuQWRHd3Y4U1lLcHBTR0UlMkJ6elA2aW11M3ZTbXZWR1pGekszaFBaQk52M2NZS21yZEVYdCUyRmdTM1g5ZGZhTzZZZDlZJTJCR0p3bVBiTnhPWFYzbUxvM2dJUGxvU3ZGSTBEclA4MUcwaFp2TEJ3VmEweXN1S2hCczBoVFhVUHZRWlVjSEhuMDhtaG5YWU00VlRFUWxhRVFqWHBSMXdIZVI3N1VOYVliU2tzMFNKOHJMdDElMkJ2ZnAxT2olMkZHN0haalElMkJESmNkTDFTamc1bDlva2ZsVnR4UXA2QXJxNHpKU1B0ZERRbDB5N3dVVHBUZ2d2MVZzRGVPTjBoTkk0OWE',
    'Sec-Ch-Ua' : '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile' : '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest' : 'document',
    'Sec-Fetch-Mode' : 'navigate',
    'Sec-Fetch-Site' : 'none',
    'Sec-Fetch-User' : '?1',
    'Upgrade-Insecure-Requests' : '1',
    'User-Agent' :'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

const slug = (str) => {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
};


const writeToFile = (data, path) => {

    const promiseCallback = (resolve, reject) => {
        fs.writeFile(path, data, (error) => {
            if (error) {
                reject(error);
                return;
            }
                resolve(true);
            });
    };
    return new Promise(promiseCallback);
};

const readFromFile = (filename) => {
    const promiseCallback = (resolve, reject) => {
        fs.readFile(filename, 'utf8', (error, contents) => {
            if (error) {
                //console.log('*** readFromFile', error);
                resolve(null);
                return;
            }
            resolve(contents);
        });
    }
    return new Promise(promiseCallback);
};


const getPage = (path) => {
    const url = `${BASE_URL}${path}`
    const options = {
        headers: browserHeaders
    };
    return axios.get(url, options).then((response) => response.data);
};

const getCachePage = (path) => {
    const filename = `cache/${slug(path)}.html`;
    const promiseCallback = async (resolve, reject) => {
        const cacheHTML = await readFromFile(filename);
        if(!cacheHTML) {
            //console.log('*** getCachePage.fresh');
            const html = await getPage(path);
            await writeToFile(html, filename);
            resolve(html);
            return;
        }
        //console.log('*** getCachePage.cached');
        resolve(cacheHTML);
    };

    return new Promise(promiseCallback);
};

const saveData = (data, path) => {
    const promiseCallback = async (resolve, reject) => {
        if (!data || data.length == 0) return resolve(reject);
        const dataToStore = JSON.stringify({ data: data }, null, 2);
        const created = await writeToFile(dataToStore, path);
        resolve(true);
    };

    return new Promise(promiseCallback);
};

const getPageItems = (html) => {
    const $ = cheerio.load(html);
    const promiseCallback = (resolve, reject) => {
        const selector = '#content > div.post_content.row > div > div:nth-child(1) > div.body > table > tbody > tr';

        const games = [];
        $(selector).each((i, element) => {
            const a = $('td.rtitle > a', element)
            const title = a.text();
            const href = a.attr('href');
            const id = href.split('/').pop();
            games.push({id,title, path: href});
            //console.log('*** getPageItems', id,title, href);
        });        
        resolve(games)
    };
    return new Promise(promiseCallback);
};

const getAllPages = async (start, finish) => {
    let page = start;
    do {
        const path = `/n64/category/999-all?page=${page}`;
        await getCachePage(path)
                .then(getPageItems)
                .then((data) => saveData(data, `db/./db-${page}.json`))
                .then(console.log)
                .catch(console.error);
        page ++;
    } while(page < finish );
}

getAllPages(0, 10);