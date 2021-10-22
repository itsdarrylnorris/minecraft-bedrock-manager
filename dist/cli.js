#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const [, , ...args] = process.argv;
(0, utils_1.executeShellScript)(`node /root/Projects/minecraft-manager/dist/index.js ${args}`);
//# sourceMappingURL=cli.js.map