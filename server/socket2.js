import { createServer } from "http";
// import { Server } from "socket.io";
import express from "express";
import WebSocket from "ws";

import path from "path";
import { __root } from "./globals.js";
import { TopicManager } from "./TopicManager.js";
import { PlayerManager } from "./PlayerManager.js";

const port = parseInt(process.env.PORT, 10) || 80;
const host = process.env.PORT ? "0.0.0.0" : "localhost";

const local = !!process.env.npm_config_debug;
const publicPath = path.join(__root, "/client");
const indexHtml = !local ? "/dist/index.html" : "index-local.html";

const app = express();
const httpServer = createServer(app);

const socketOptions = {
    path: "/ws",
    server: httpServer,
};
const wss = new WebSocket.Server(socketOptions);

const messageHandler = new Map();

function parseMessage (data) {
    let oResult = {};
    try {
        const string = data;
        oResult = JSON.parse(string);
    } catch (err) {
        globalThis.console.log(err);
    }
    return oResult;
}

function handleMessage (ws, ab) {
    let message = ab;
    if (typeof ab === "string") {
        message = parseMessage(ab);
    }

    if (message.channel) {
        const handlerMap = messageHandler.get(message.channel) || new Map();

        try {
            handlerMap.forEach((scope, callback) => {
                callback.call(scope, ws, message.data, ws.id);
            });
        } catch (err) {
            console.error(err);
        }
    }
}

export function registerMessageHandler (channel, callback, scope) {
    let handlerMap = messageHandler.get(channel);
    if (handlerMap === undefined) {
        handlerMap = new Map();
        messageHandler.set(channel, handlerMap);
    }
    handlerMap.set(callback, scope);
}

export function publish (topic, channel, data) {
    const message = JSON.stringify({
        channel,
        data,
    });
    TopicManager.publish(topic, message);
}

export function send (ws, channel, data) {
    const message = JSON.stringify({
        channel,
        data,
    });
    ws.send(message);
}

export function subscribe (ws, topic) {
    try {
        TopicManager.subscribe(ws, topic);
    } catch (err) {
        console.error(`subscribe failed: ${topic}`);
        // console.error(err);
    }
}

export function unsubscribe (ws, topic) {
    try {
        TopicManager.unsubscribe(ws, topic);
    } catch (err) {
        console.error(`unsubscribe failed: ${topic}`);
        // console.error(err);
    }
}

export function startServer () {
    const expressOptions = {
        index: indexHtml,
    };

    app.use(express.static(publicPath, expressOptions));

    wss.on("connection", (ws) => {
        globalThis.console.log("WebSocket opens");
        const playerId = PlayerManager.addPlayer();
        ws.id = playerId;
        send(ws, "playerId", {
            id: ws.id,
        });

        ws.on("message", handleMessage.bind(null, ws));

        ws.on("close", () => {
            const ws = {
                id: playerId,
            };
            TopicManager.unsubscribeAll(ws);
            handleMessage(ws, {
                channel: "close",
                data: {},
            });
            PlayerManager.removePlayer(ws.id);
            globalThis.console.log("WebSocket closed");
        });
    });

    httpServer.listen(port, host, () => {
        globalThis.console.log(`Listening to http://${host}:${port}`);
    });
}
