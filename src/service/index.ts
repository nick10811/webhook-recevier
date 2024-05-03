export * from './line_service';
export * from './google_service';

import lineService from './line_service';
import googleService from './google_service';

const service = {
    line: lineService,
    google: googleService
};

export default service;