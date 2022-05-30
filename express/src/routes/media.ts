import { app, prisma } from '../app';
import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
   const media = req.body.media;
   const post  = req.body.post;

   for (const media_name in media) {
      await prisma.media.create({
         data: {
            postId: post,
            name: media_name,
            type: media[media_name].type,
            data: media[media_name].data
         }
      });
   }
   res.status(200);
});

router.get('/id/:id', async (req, res) => {
   const id = Math.abs(parseInt(req.params.id, 10));

   const media = await prisma.media.findUnique({
      where: {
         id: id
      },
   });
   res.json(media);
});

export default router;
