import { userInfo } from 'node:os';
import { join } from 'node:path';
import { config } from 'dotenv';

config();

export const XCOM_SAVE_PATH =
    process.env.XCOM_SAVE_PATH ||
    join('C:', 'Users', userInfo().username, 'Documents', 'My Games', 'XCOM - Enemy Within', 'XComGame', 'SaveData');
export const SAVE_CHECK_INTERVAL_MS = Number(process.env.SAVE_CHECK_INTERVAL_MS) || 20_000;

// eslint-disable-next-line unicorn/prefer-module
export const BACKUP_SAVE_PATH = process.env.BACKUP_SAVE_PATH || join(__dirname, '..', 'saves');
