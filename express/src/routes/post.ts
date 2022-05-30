import { app, prisma } from '../app';
import express from 'express'

const router = express.Router();

router.get('/latest/:count', async (req, res) => {
   const count = Math.abs(parseInt(req.params.count, 10));

   const posts = await prisma.post.findMany({
      take: count,
      orderBy: [ { date: 'desc' } ],
   });
   res.json(posts);
});

router.get('/search/:term', async (req, res) => {
   const term = req.params.term

   console.log('dbg:', term);
   const posts = await prisma.post.findMany({
      where: {
         title: {
            contains: term
         },
         body: {
            contains: term
         }
      }
   });
   res.json(posts);
});

router.get('/id/:id', async (req, res) => {
   const id = parseInt(req.params.id, 10);

   const post = await prisma.post.findUnique({
      where: {
         id: id
      }
   });
   res.json(post);
});

router.post('/new', async (req, res) => {
   const json = req.body();

   const post = await prisma.post.create({
      data: {
         authorId: json.authorId,
         title: json.title,
         body: json.body,
         date: json.date
      }
   });
   res.send(post);
});

router.post('/update/:id', async (req, res) => {
   const id = parseInt(req.params.id, 10);
   const json = req.body();

   const post = await prisma.post.update({
      where: {
         id: id
      },
      data: {
         authorId: json.authorId,
         title: json.title,
         body: json.body,
         date: json.date
      }
   });
   res.send(post);
});

export default router;
