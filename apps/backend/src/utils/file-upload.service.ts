// file-upload.service.ts
import { Injectable } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Injectable()
export class FileUploadService {
  constructor() {}

  getFileInterceptor(fieldName: string, destination: string) {
    return FileInterceptor(fieldName, {
      storage: diskStorage({
        destination,
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split('.').pop();
          cb(null, `${uniqueSuffix}.${extension}`);
        },
      }),
    });
  }
}
