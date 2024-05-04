import { describe, test, expect } from 'vitest';
import { GoogleService } from './google_service';
import Config from '../config/config';
import { JWTInput } from 'google-auth-library/build/src/auth/credentials';

describe('GoogleService.getAuthToken', () => {
    test('ok', async () => {
        // arrange
        Config.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'whatever';
        Config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = 'whatever';
        const srv = new GoogleService();

        // act
        const got = srv.getAuthToken();

        // expect
        expect((got.jsonContent as JWTInput).client_email).toBe('whatever');
        expect((got.jsonContent as JWTInput).private_key).toBe('whatever');
    });
});

describe('GoogleService.getSheetData', () => {
    test.skip('skip ci for real case', async () => {
        // arrange
        Config.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'whatever';
        Config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = 'whatever';
        const srv = new GoogleService();
        const spreadsheetId = '1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ';
        const sheetName = 'reservations';

        // act
        const got = await srv.getSheetData(spreadsheetId, sheetName);

        // expect
        expect(got).toBeInstanceOf(Array);
        expect((got as string[][])[0].length).toEqual(6);
        expect((got as string[][])[0][0]).toEqual('ID');
        expect((got as string[][])[0][1]).toEqual('Name');
        expect((got as string[][])[0][2]).toEqual('Location');
        expect((got as string[][])[0][3]).toEqual('Datetime');
        expect((got as string[][])[0][4]).toEqual('Timezone');
        expect((got as string[][])[0][5]).toEqual('Status');
    });
});

describe('GoogleService_appendSheetData', () => {
    test.skip('skip ci for real case', async () => {
        // arrange
        Config.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'whatever';
        Config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = 'whatever';
        const srv = new GoogleService();
        const spreadsheetId = '1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ';
        const sheetName = 'reservations';
        const values = [['demo - John Doe', 'New York', '2021-01-01 10:00', 'America/New_York']];

        // act
        const got = await srv.appendSheetData(spreadsheetId, sheetName, values);

        // expect
        expect(got.spreadsheetId).toBe("1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ");
        expect(got.updates).not.toBeUndefined();
    });

});

describe('GoogleService.updateSheetRow', () => {
    test.skip('skip ci for real case', async () => {
        // arrange
        Config.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'whatever';
        Config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = 'whatever';
        const srv = new GoogleService();
        const spreadsheetId = '1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ';
        const sheetName = 'reservations';
        const range = 'A2';
        const values = ['Updated1', 'Updated2', 'Updated3'];

        // act
        const got = await srv.updateSheetRow(spreadsheetId, sheetName, range, values);

        // expect
        expect(got.spreadsheetId).toBe('1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ');
        expect(got.updatedCells).toBe(3);
        expect(got.updatedColumns).toBe(3);
        expect(got.updatedRange).toBe('reservations!A2:C2');
        expect(got.updatedRows).toBe(1);
    });
});

describe('GoogleService.deleteSheetRow', () => {
    test.skip('skip ci for real case', async () => {
        // arrange
        Config.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'whatever';
        Config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = 'whatever';
        const srv = new GoogleService();
        const spreadsheetId = '1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ';
        const sheetId = 0;
        const indexOfRow = 3;

        // act
        const got = await srv.deleteSheetRow(spreadsheetId, sheetId, indexOfRow);

        // expect
        expect(got.spreadsheetId).toBe('1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ');
        expect(got.replies).not.toBeUndefined();
    });
});