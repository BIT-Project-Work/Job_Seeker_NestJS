import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now();
      const ext = extname(file.originalname);
      const filename = `${uniqueSuffix}-${file.originalname.replace(ext, '')}${ext}`;
      cb(null, filename);
    },
  }),

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Only .jpeg, .jpg, .png and .pdf formats are allowed',
        ),
        false,
      );
    }
  },
};
