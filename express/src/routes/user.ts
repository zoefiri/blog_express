import { app, prisma } from '../app';
import { json_req } from '../middleware';
import express from 'express';
import * as auth from '../auth';

const router = express.Router();

router.get('/id/:id', async (req, res) => {
   const id = Math.abs(parseInt(req.params.id, 10));
   if(isNaN(id)) {
      res.sendStatus(400);
      return
   }

   try {
      const user = await prisma.user.findUnique({
         select: {
            pwdhash: false,
            salt: false,
            email: false
         },
         where: {
            id
         },
      });
      res.json(user);
   } catch (e) {
      console.log('db err')
      res.sendStatus(400)
      return
   }
});

router.post('/auth', json_req(['title', 'body']),  async (req, res) => {
   const email = req.body.email;

   let user;
   try {
      user = await prisma.user.findUnique({
         where: {
            email
         }
      });
   } catch (e) {
      console.log('db err')
      res.sendStatus(400)
      return;
   }

   if (user) {
      const pwdhash = await auth.pwdHash(req.body.pwd, user.salt);
      console.log('authing', pwdhash, user.pwdhash);
      if(user.pwdhash === pwdhash) {
         console.log('authing2')
         res.json( {"token": auth.genToken(user.email)} );
         return;
      } else res.sendStatus(401);
   } else res.sendStatus(401);
   return;
});

router.post('/register', json_req(['email', 'register_secret', 'pwd', 'username']), async (req, res) => {
   if(req.body.register_secret !== process.env.REGISTER_SECRET) {
      res.sendStatus(401);
      return;
   }

   const email = req.body.email;
   const authInfo = await auth.genAuth(req.body.pwd);

   const existing = await prisma.user.findMany({ where: { email } })
   if (existing.length !== 0) {
      res.sendStatus(403);
      return;
   }
   const user = await prisma.user.create({
      data: {
         username: req.body.username,
         email,
         pwdhash: await authInfo.pwdHashed,
         salt: authInfo.salt
      }
   });
   res.send( {"token":auth.genToken(user.email)} );
});

export default router;
