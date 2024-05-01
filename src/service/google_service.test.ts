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

});

describe('GoogleService_appendSheetData', () => {
    test.skip('skip ci for real case', async () => {
        // arrange
        config.GOOGLE_SERVICE_ACCOUNT_EMAIL = "whatever";
        config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = "whatever";
        const srv = new GoogleService();
        const spreadsheetId = 'whatever';
        const sheetName = 'reservations';
        const values = [['demo - John Doe', 'New York', '2021-01-01 10:00', 'America/New_York']];

        // act
        const got = await srv.appendSheetData(spreadsheetId, sheetName, values);

        // assert
        assert.equal(got.spreadsheetId, "whatever");
    });

});