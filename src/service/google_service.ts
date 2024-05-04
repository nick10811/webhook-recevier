import { google } from "googleapis";
import Config from "../config/config";

export class GoogleService {
    private _privateKey: string;
    private _clientEmail: string;
    private _scope = ["https://www.googleapis.com/auth/spreadsheets"];
    private _sheets = google.sheets({ version: 'v4' });

    constructor() {
        if (Config.ENVIRONMENT === 'prod') {
            // ref: https://stackoverflow.com/a/78060606
            this._privateKey = Config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n");
        } else {
            this._privateKey = Config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
        }
        this._clientEmail = Config.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    }

    getAuthToken() {
        return new google.auth.GoogleAuth({
            credentials: {
                client_email: this._clientEmail,
                private_key: this._privateKey
            },
            scopes: this._scope
        });
    }

    async getSheetData(spreadsheetId: string, sheetName: string) {
        const auth = this.getAuthToken();
        const resp = await this._sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: sheetName
        });
        return resp.data.values;

    }

    async appendSheetData(spreadsheetId: string, sheetName: string, values: string[][]) {
        const auth = this.getAuthToken();
        const resp = await this._sheets.spreadsheets.values.append({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: sheetName,
            valueInputOption: 'RAW',
            requestBody: {
                values: values
            }
        });
        return resp.data;
    }

    async updateSheetRow(spreadsheetId: string, sheetName: string, range: string, values: string[]) {
        const auth = this.getAuthToken();
        const resp = await this._sheets.spreadsheets.values.update({
            auth: auth,
            spreadsheetId: spreadsheetId,
            range: sheetName + '!' + range,
            valueInputOption: 'RAW',
            requestBody: {
                values: [values]
            }
        });
        return resp.data;
    }

    async deleteSheetRow(spreadsheetId: string, sheetId: number, indexOfRow: number) {
        const auth = this.getAuthToken();
        const resp = await this._sheets.spreadsheets.batchUpdate({
            auth: auth,
            spreadsheetId: spreadsheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: indexOfRow,
                            endIndex: indexOfRow + 1
                        }
                    }
                }]
            }
        });
        return resp.data;
    }
}

export default new GoogleService();