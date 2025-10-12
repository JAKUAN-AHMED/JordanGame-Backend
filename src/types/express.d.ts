// // src/types/express.d.ts

import { Request } from 'express';
import { TFunction } from 'i18next'; // Import the TFunction type from i18next
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      t: TFunction;
      user?: JwtPayload & { userId: string; email: string; role: string; fname?: string };
    }
  }
}


