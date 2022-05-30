import { app, prisma } from '../app';
import express from 'express';
import * as auth from '../auth';

const router = express.Router();

router.get('/id/:id', async (req, res) => {
   const id = Math.abs(parseInt(req.params.id, 10));

   const user = await prisma.user.findUnique({
      select: {
         pwdhash: false,
         salt: false,
         email: false
      },
      where: {
         id: id
      },
   });
   res.json(user);
});

router.post('/auth', async (req, res) => {
   if(!req.body.email || !req.body.pwd) throw new Error('email or password not provided');
   const email = req.body.email;

   const user = await prisma.user.findUnique({
      where: {
         email: email
      }
   });

   if (user) {
      const pwdhash = await auth.pwdHash(req.body.pwd, user.salt);
      if(user.pwdhash == pwdhash) res.send(auth.genToken(user.email));
      return;
   }
   res.status(401);
});

router.post('/register', async (req, res) => {
   if(req.body.register_secret != process.env.REGISTER_SECRET) { 
      res.send(401);
      return;
   }
   if(!req.body.email || !req.body.pwd) throw new Error('email or password not provided');

   const email = req.body.email;
   const auth_info = await auth.genAuth(req.body.pwd);

   const user = await prisma.user.create({
      data: {
         username: req.body.username,
         email: email,
         pwdhash: await auth_info.pwd_hash,
         salt: auth_info.salt
      }
   });
   res.send(auth.genToken(user.email));
});

export default router;
