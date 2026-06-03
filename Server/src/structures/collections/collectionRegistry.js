// collectionRegistry.js
// Centralized exporter for collection state handlers.

const collectionStateHandler = require("./collectionStateHandler");
const stackStateHandler = require("./stackStateHandler");
const queueStateHandler = require("./queueStateHandler");
const dequeStateHandler = require("./dequeStateHandler");
const hashMapStateHandler = require("./hashMapStateHandler");
const hashSetStateHandler = require("./hashSetStateHandler");
const priorityQueueStateHandler = require("./priorityQueueStateHandler");

module.exports = {
    collectionStateHandler,
    stackStateHandler,
    queueStateHandler,
    dequeStateHandler,
    hashMapStateHandler,
    hashSetStateHandler,
    priorityQueueStateHandler
};
