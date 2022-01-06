import http from 'http';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import logger from './logger.js';
import createChatServer from './lib/createChatServer.js';


let cache = {};
const displayCacheInterval = 600000; //milliseconds

const send404 = (response) => {
    logger("Displaying Error 404");
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.write(`Error 404 : Whoopsy! I can't find droid... I mean... files... you are looking for`);
    response.end();

}

const sendFile = (response, filePath, fileContents) => {
    logger("Serving file:", filePath);
    response.writeHead(200, { "content-type": mime.getType(path.basename(filePath)) });
    response.end(fileContents);
}

const serveStatic = (response, cache, absPath) => {
    logger("Asked for file:", absPath);
    if (cache[absPath]) {
        logger("Using Cache");
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.access(absPath, fs.constants.R_OK, (error) => {
            if (error) {
                logger("Can't access/find file from path: " + absPath);
                send404(response);
            } else {
                fs.readFile(absPath, (err, data) => {
                    if (err) {
                        logger("Can't read file from path: " + absPath);
                        send404(response);
                    } else {
                        logger("Loading File");
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            }
        });
    }
}

const server = http.createServer((request, response) => {
    let filePath = false;
    if (request.url === '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }
    const absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

server.listen(3865, () => {
    logger("Main Server took control over the PORT! And it's working now ^_^");
})

const chatServer = new createChatServer(server);

chatServer.listen();

setInterval(() => {
    logger("Cache Status: ", Object.keys(cache).length, " files");
}, displayCacheInterval);