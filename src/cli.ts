#!/usr/bin/env node
import { executeShellScript } from './utils'

// Grab provided args.
const [, , ...args] = process.argv

executeShellScript(`node /root/Projects/minecraft-manager/dist/index.js ${args}`)
