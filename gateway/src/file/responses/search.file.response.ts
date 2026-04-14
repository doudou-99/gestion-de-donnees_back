import { FileResponse } from './file.response';

export interface SearchFileResponse {
  files: FileResponse[];
  numberResults: number;
}
