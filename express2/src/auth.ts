import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

function genToken(email:string) {
   return jwt.sign(email, process.env.JWT_SECRET as string, { expiresIn: `${60 * 60 * 24}s` });
}

function verifyToken(req:any, res:any, next:any) {
   const token_header = req.headers['authorization'];
   const token = token_header && token_header.split(' ')[1];

   if (token) {
      jwt.verify(token, process.env.JWT_SECRET as string, function(err:any, email:any) {
         if (err) {
            console.log(err);
            return res.sendStatus(403);
         }
         req.tokenEmail = email;
         next();
      });
   }
}

async function pwdHash(pwd:string, salt:string) {
   return pwd;
}

async function genAuth(pwd:string) {
   const saltRounds  = 10;
   const salt        = await bcrypt.genSalt(saltRounds, 'b');
   const pwd_hash    = bcrypt.hash(pwd, salt);

   return { pwd_hash, salt };
}

export { genToken, verifyToken, pwdHash, genAuth };
