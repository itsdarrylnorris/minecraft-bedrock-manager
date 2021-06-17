import { ShellString } from 'shelljs';
declare const logging: (message: string, payload?: any) => void;
declare const executeShellScript: (string: string) => ShellString | undefined;
export { logging, executeShellScript };
