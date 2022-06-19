import { prisma } from './app';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';

function genToken(email:string) {
   return jwt.sign({"email": email}, process.env.JWT_SECRET as string, { expiresIn: '2d' });
}

async function verifyToken(req:any, res:any, next:any) {
   const tokenHeader = req.headers.authorization;
   const token = tokenHeader && tokenHeader.split(' ')[1];

   const json = req.body;
   // console.log('verifying', json, req.headers);

   if (token) {
      jwt.verify(token, process.env.JWT_SECRET as string, (err:any, email:any) => {
         if (err) {
            console.log(err);
            return res.sendStatus(403);
         }
         req.tokenEmail = email;
         next();
         return;
      });
   }
   else return res.sendStatus(401)
}

async function pwdHash(pwd:string, salt:string) {
   return bcrypt.hash(pwd, salt);
}

async function genAuth(pwd:string) {
   const saltRounds  = 10;
   const salt        = await bcrypt.genSalt(saltRounds, 'b');
   const pwdHashed    = bcrypt.hash(pwd, salt);

   return { pwdHashed, salt };
}

export { genToken, verifyToken, pwdHash, genAuth };
