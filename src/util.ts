import { readdir, stat } from 'node:fs/promises';
import { XCOM_SAVE_PATH } from './config';
import { join } from 'node:path';

const saveRegex = /^save\d+$/;

export const listSaves = async () => {
    const files = await readdir(XCOM_SAVE_PATH);
    return Promise.all(files.filter((x) => saveRegex.test(x)).map((x) => mapSave(x)));
};

const mapSave = async (name: string) => {
    const filePath = join(XCOM_SAVE_PATH, name);
    const fileStats = await stat(filePath);
    return {
        name,
        filePath,
        modifiedTime: fileStats.mtime
    };
};
