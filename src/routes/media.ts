import { app, prisma } from '../app';
import { json_req } from '../middleware';
import express from 'express';
import * as auth from '../auth';
import multer from 'multer';
import { Passport } from 'passport';

const router = express.Router();

router.post('/', auth.verifyToken, multer().fields([{ name: 'media', maxCount: 100 }]), async (req:any, res) => {
   let json;
   try {
      json = JSON.parse(req.body.json)
   } catch(e) {
      console.log('json parsing err');
      res.sendStatus(400);
      return;
   }
   const media = 'media' in json ? json.media : null;
   const postId  = 'post' in json  ? parseInt(json.post, 10) : NaN;

   // check if post exists, if it does get author
   let author;
   if (!isNaN(postId) && media) {
      try {
         const parentPost = await prisma.post.findUnique({ where: { id:postId } })
         if(parentPost) {
            author = await prisma.user.findUnique({ where: { id: parentPost.authorId } });
            if (!author || author.email !== req.tokenEmail.email) {
               res.send(403);
               return;
            }
         }
         else {
            res.send(400);
            return;
         }
      } catch (e) {
         console.log('db err')
         res.sendStatus(400)
         return;
      }
   }
   else {
      res.send(400);
      return;
   }

   if (typeof(req.files.media) === 'object') for (const file of req.files.media) {
      if(true){
         if(file.originalname in media
            && 'type' in media[file.originalname]
            && ["image", "video", "audio"].includes(media[file.originalname].type)) {
            try {
               await prisma.media.create({
                  data: {
                     postId,
                     name: file.originalname,
                     type: media[file.originalname].type,
                     data: file.buffer
                  }
               });
            } catch(e) {
               console.log('db err');
               res.sendStatus(400);
               return;
            }
         }
         else {
            res.sendStatus(400);
            return;
         }
      }
   }
   res.sendStatus(200);
});

router.get('/id/:id', async (req, res) => {
   const id = Math.abs(parseInt(req.params.id, 10));
   if(isNaN(id)) {
      res.sendStatus(400);
      return
   }

   try {
      const media = await prisma.media.findUnique({
         where: {
            id
         },
      });
      res.json(media);
   } catch (e) {
      console.log('db err');
      res.sendStatus(400);
      return;
   }
});

export default router;
