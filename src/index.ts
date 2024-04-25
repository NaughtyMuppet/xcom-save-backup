import { getSaveInfo } from 'xcom-save-parser';
import { setTimeout } from 'node:timers/promises';
import { listSaves } from './util';
import { DateTime } from 'luxon';
import { cp, readFile } from 'node:fs/promises';
import { BACKUP_SAVE_PATH, SAVE_CHECK_INTERVAL_MS } from './config';
import { mkdirp } from 'mkdirp';
import { join } from 'node:path';

const enum SaveGameType {
    Strategy = 'XComStrategyGame.XComHeadQuartersGame',
    Tactical = 'XComGame.XComTacticalGame'
}

const main = async () => {
    await mkdirp(BACKUP_SAVE_PATH);
    while (true) {
        const recentTime = DateTime.now().minus({ minutes: 30 }).toJSDate();
        const saves = await listSaves();
        const recentSaves = saves.filter((x) => x.modifiedTime >= recentTime);
        if (recentSaves.length === 0) {
            await setTimeout(SAVE_CHECK_INTERVAL_MS);
            continue;
        }
        for (const save of recentSaves) {
            const fileContent = await readFile(save.filePath);
            const saveInfo = getSaveInfo(fileContent);
            const { date, gameNumber } = saveInfo.gameInfo.gameInfo;
            const currentSavePath = join(
                BACKUP_SAVE_PATH,
                `game-${gameNumber}`,
                DateTime.fromFormat(date, 'M/d/yyyy').toFormat('yyyy-MM-dd')
            );
            await mkdirp(currentSavePath);
            const saveName = getSaveName(saveInfo);
            await cp(save.filePath, join(currentSavePath, saveName));
            console.log(`Saved ${saveName} to ${currentSavePath}`);
        }
        await setTimeout(SAVE_CHECK_INTERVAL_MS);
    }
};

const getSaveName = (saveInfo: ReturnType<typeof getSaveInfo>) => {
    const { gameInfo, mapInfo } = saveInfo.gameInfo;
    const saveTime = gameInfo.time.replace(':', '');
    if (mapInfo.game === SaveGameType.Strategy) {
        return `save-${saveTime}-strategy-${slugify(gameInfo.gameDate!)}-${slugify(gameInfo.gameTime!)}`;
    }
    return `save-${saveTime}-tactical-${slugify(gameInfo.operationName)}-${slugify(mapInfo.mapName)}`;
};

const slugify = (str: string) => str.toLowerCase().replaceAll(/[:\s]/g, '-');

process.nextTick(main);
