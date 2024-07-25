const { createServer } = require('node:http');
const sqlite3 = require('sqlite3').verbose();

const hostname = '0.0.0.0';
const port = 3000;

let data = "";

let db = new sqlite3.Database('/home/pho/bots/bocchibot/flights.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        data += err.message + '\n';
        console.error(err.message);
    } else {
        data += "Connected to the flightmaster main database.\n";
        console.log('Connected to the flightmaster main database.');
    }
});

const server = createServer();

function db_request(res, query) {
    db.all(query, (err, rows) => {
        console.log("Sent query " + query);
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal server error');
        } else {
            res.write(JSON.stringify(rows));
        }
        res.end();
    });
}
function get_alerts(res, username) {
    maps = { 'sky' : '316730793055617028', 'pho' : '316730793055617028', 'rx' : '820832653833011201' };
    if (maps[username] === undefined) {
        res.statusCode = 400;
        res.end();
        console.log('undfeined');
        return;
    }
    db_request(res, `select year, month, day, origin, dest, cabin, airline from flights where user_id=`+ maps[username] + " order by year, month, day, airline, origin, dest, cabin");
}

server.on('request', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    if (req.headers.origin !== undefined)
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.url.startsWith('/api/get_alerts?id=')) {
        let name = req.url.substring(19);
        console.log(name);
        get_alerts(res, name);
    } else if (req.url.startsWith('/api/get_username?id=')) {
        res.write(JSON.stringify({'res':req.url.substring(21)}));
        res.end();
    } else {
        res.statusCode = 400;
        res.end();
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
