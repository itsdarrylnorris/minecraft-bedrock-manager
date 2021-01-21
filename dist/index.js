"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class MineCraftManager {
    constructor(options) {
        this.logging = (message, payload = null) => {
            var date = new Date();
            console.log(`[${date.toISOString()}] ${message}`);
            if (payload) {
                if (typeof payload === 'string' || payload instanceof String) {
                    console.log(`[${date.toISOString()}] ${payload}`);
                }
                else {
                    console.log(`[${date.toISOString()}] ${JSON.stringify(payload)}`);
                }
            }
        };
        if (options && options.path) {
            this.options = options;
        }
        else {
            this.options = {
                path: process.env.options_path || '~/MinecraftServer/',
                backup_path: process.env.options_path || '~/Backups/',
                strings: {
                    pre_backup_message: process.env.options_pre_backup_message ||
                        'We are shutting down the server temporary, we are making a backup.',
                    post_backup_message: process.env.options_post_backup_message || 'We are done with the backup, the server is back on.',
                    error_backup_message: process.env.options_error_backup_message || 'Something went wrong build out the backup',
                },
            };
        }
    }
    startBackup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.sendMessageToDiscord(this.options.strings.pre_backup_message);
                this.stopMinecraftServer();
                this.compressFile();
                this.moveBackupToPath();
                this.uploadBackupToGoogleDrive();
            }
            catch (e) {
                this.logging(e);
                this.sendMessageToDiscord(this.options.strings.post_backup_message);
            }
        });
    }
    moveBackupToPath() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logging(`Moving backup to ${this.options.backup_path}`);
            this.logging(`Done moving backup to ${this.options.backup_path}`);
        });
    }
    startMinecraftServer() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    stopMinecraftServer() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logging('Stopping server');
        });
    }
    compressFile() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logging('Compressing file');
            this.logging('Done Compressing file');
        });
    }
    sendMessageToDiscord(string) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logging('Sending this message to discord', string);
        });
    }
    uploadBackupToGoogleDrive() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logging('Saving backup in Google Drive');
        });
    }
}
const minecraft = new MineCraftManager({});
minecraft.startBackup();
//# sourceMappingURL=index.js.map