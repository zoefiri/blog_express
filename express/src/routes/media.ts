import { app, prisma } from '../app';
import { json_req } from '../middleware';
import express from 'express';
import * as auth from '../auth';
import { Passport } from 'passport';

const router = express.Router();

router.post('/', json_req(['media', 'post']), auth.verifyToken, async (req:any, res) => {
   const media = req.body.media;
   const post  = req.body.post;

   // check if post exists, if it does get author
   let author;
   if (post && typeof post === 'number') {
      try {
         const parentPost = await prisma.post.findUnique({ where: { id:post } })
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

   for (const mediaName in media) {
      if(media[mediaName].type && ["image", "video", "audio"].includes(media[mediaName].type) && media[mediaName].data) {
         try {
            await prisma.media.create({
               data: {
                  postId: post,
                  name: mediaName,
                  type: media[mediaName].type,
                  data: media[mediaName].data
               }
            });
         } catch(e) {
            console.log('db err');
            res.sendStatus(400);
            return;
         }
      }
      else res.sendStatus(400)
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
