import { describe, test, assert, vi } from 'vitest';
import { GoogleService } from './google_service';
import config from '../config/config';
import { JWTInput } from 'google-auth-library/build/src/auth/credentials';

describe('GoogleService_getAuthToken', () => {
    test('getAuthToken', async () => {
        // arrange
        config.GOOGLE_SERVICE_ACCOUNT_EMAIL = "whatever";
        config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = "whatever";
        const srv = new GoogleService();

        // act
        const got = srv.getAuthToken();

        // assert
        assert.equal((got.jsonContent as JWTInput).client_email, "whatever");
        assert.equal((got.jsonContent as JWTInput).private_key, "whatever");
    });
});

describe('GoogleService_getSheetData', () => {
    test.skip('skip ci for real case', async () => {
        // arrange
        config.GOOGLE_SERVICE_ACCOUNT_EMAIL = "wahtever";
        config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = "whatever";
        const srv = new GoogleService();
        const spreadsheetId = 'whatever';
        const sheetName = 'reservations';

        // act
        const got = await srv.getSheetData(spreadsheetId, sheetName);

        // assert
        assert.equal((got as string[][])[0].length, 4);
        assert.equal((got as string[][])[0][0], 'Name');
        assert.equal((got as string[][])[0][1], 'Location');
        assert.equal((got as string[][])[0][2], 'Datetime');
        assert.equal((got as string[][])[0][3], 'Timezone');
    });

    test('OK', async () => {
        // arrange
        const srv = new GoogleService();
        const spreadsheetId = 'sheet-id';
        const sheetName = 'reservations';

        vi.spyOn(srv, 'getSheetData').mockResolvedValue([
            ['Name', 'Location', 'Datetime', 'Timezone'],
            ['John Doe', 'Tokyo', '2021-01-01T00:00:00', 'Asia/Tokyo']
        ]);

        // act
        try {
            const got = await srv.getSheetData(spreadsheetId, sheetName);

            // assert
            assert.equal((got as string[][]).length, 2);
            assert.equal((got as string[][])[0].length, 4);
            assert.equal((got as string[][])[0][0], 'Name');
            assert.equal((got as string[][])[0][1], 'Location');
            assert.equal((got as string[][])[0][2], 'Datetime');
            assert.equal((got as string[][])[0][3], 'Timezone');
            assert.equal((got as string[][])[1][0], 'John Doe');
            assert.equal((got as string[][])[1][1], 'Tokyo');
            assert.equal((got as string[][])[1][2], '2021-01-01T00:00:00');
            assert.equal((got as string[][])[1][3], 'Asia/Tokyo');
        }
        catch (e) {
            throw e;
        }
    });

    test('google sheets error', async () => {
        // arrange
        const srv = new GoogleService();
        const spreadsheetId = 'sheet-id';
        const sheetName = 'reservations';

        vi.spyOn(srv, 'getSheetData').mockRejectedValue(new Error('whatever'));

        // act
        try {
            await srv.getSheetData(spreadsheetId, sheetName);
        }
        catch (e) {
            // assert
            assert.equal(e.message, 'whatever');
        }
    });
});