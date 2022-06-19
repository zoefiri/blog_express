import { app, prisma } from '../app';
import { json_req } from '../middleware';
import express from 'express';
import multer from 'multer';
import * as auth from '../auth';

const router = express.Router();

router.get('/id/:id', async (req, res) => {
   const id = Math.abs(parseInt(req.params.id, 10));
   if(isNaN(id)) {
      res.sendStatus(400);
      return;
   }

   try {
      const user = await prisma.user.findUnique({
         select: {
            pwdhash: false,
            salt: false,
            email: false,
            username: true,
            PFP: true,
            id: true,
         },
         where: {
            id
         },
      });
      res.json(user);
   } catch (e) {
      console.log('db err', e);
      res.sendStatus(400);
      return;
   }
});

router.post('/auth', json_req(['email', 'pwd']),  async (req, res) => {
   const email = req.body.email;

   let user;
   try {
      user = await prisma.user.findUnique({
         where: {
            email
         }
      });
   } catch (e) {
      console.log('db err', e)
      res.sendStatus(400)
      return;
   }

   if (user) {
      const pwdhash = await auth.pwdHash(req.body.pwd, user.salt);
      if(user.pwdhash === pwdhash) {
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

   try {
      const user = await prisma.user.create({
         data: {
            username: req.body.username,
            email,
            pwdhash: await authInfo.pwdHashed,
            salt: authInfo.salt
         }
      });
      res.send( {"token":auth.genToken(user.email)} );
   } catch (e) {
      console.log('db err', e)
      res.sendStatus(400)
      return;
   }
});

router.post('/update', auth.verifyToken, multer().single('img'), async (req:any, res) => {
   let json;
   try {
      json = JSON.parse(req.body.json);
   } catch(e) {
      console.log('json parsing err');
      res.sendStatus(400);
      return;
   }
   console.log(json, req.file, 'URRR')

   let user;
   user = await prisma.user.findMany({ where: { email: req.tokenEmail.email } });
   if(!user.length) {
      console.log('db err');
      res.sendStatus(400);
      return;
   }

   let username = user[0].username;
   let PFP = user[0].PFP;
   let pwdhash = user[0].pwdhash;
   let salt = user[0].salt;
   if('username' in json) username = json.username;
   if('file' in req && 'buffer' in req.file) {
      PFP = req.file.buffer;
   }
   if('pwd' in json) {
      const authInfo = await auth.genAuth(req.body.pwd);
      salt = authInfo.salt;
      pwdhash = await authInfo.pwdHashed;
   }


   if(user) {
      try {
         const userUpdated = await prisma.user.update({
            where: {
               id: user[0].id
            },
            data: {
               username,
               PFP,
               pwdhash,
               salt
            }
         });
         res.send(userUpdated);
      } catch (e) {
         console.log('db err', e)
         res.sendStatus(400)
         return;
      }
   }
   else {
      res.sendStatus(403);
   }
});

export default router;
