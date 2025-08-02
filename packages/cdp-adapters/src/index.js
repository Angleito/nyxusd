"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCDPAdapter = exports.MidnightCDPAdapter = exports.ArbitrumCDPAdapter = exports.PolygonCDPAdapter = exports.EthereumCDPAdapter = exports.BaseCDPAdapter = void 0;
var baseAdapter_1 = require("./baseAdapter");
Object.defineProperty(exports, "BaseCDPAdapter", { enumerable: true, get: function () { return baseAdapter_1.BaseCDPAdapter; } });
// Blockchain-specific adapters
var ethereum_1 = require("./ethereum");
Object.defineProperty(exports, "EthereumCDPAdapter", { enumerable: true, get: function () { return ethereum_1.EthereumCDPAdapter; } });
var polygon_1 = require("./polygon");
Object.defineProperty(exports, "PolygonCDPAdapter", { enumerable: true, get: function () { return polygon_1.PolygonCDPAdapter; } });
var arbitrum_1 = require("./arbitrum");
Object.defineProperty(exports, "ArbitrumCDPAdapter", { enumerable: true, get: function () { return arbitrum_1.ArbitrumCDPAdapter; } });
var midnight_1 = require("./midnight");
Object.defineProperty(exports, "MidnightCDPAdapter", { enumerable: true, get: function () { return midnight_1.MidnightCDPAdapter; } });
// Adapter factory
const ethereum_2 = require("./ethereum");
const polygon_2 = require("./polygon");
const arbitrum_2 = require("./arbitrum");
const midnight_2 = require("./midnight");
const createCDPAdapter = (chain, config) => {
    switch (chain.toLowerCase()) {
        case 'ethereum':
            return new ethereum_2.EthereumCDPAdapter(config);
        case 'polygon':
            return new polygon_2.PolygonCDPAdapter(config);
        case 'arbitrum':
            return new arbitrum_2.ArbitrumCDPAdapter(config);
        case 'midnight':
            return new midnight_2.MidnightCDPAdapter(config);
        default:
            throw new Error(`Unsupported blockchain: ${chain}`);
    }
};
exports.createCDPAdapter = createCDPAdapter;
//# sourceMappingURL=index.js.map