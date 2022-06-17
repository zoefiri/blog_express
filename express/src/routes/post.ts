import { app, prisma } from '../app';
import { json_req } from '../middleware';
import express from 'express';
import * as auth from '../auth';

const router = express.Router();

router.get('/latest/:count', async (req, res) => {
   const count = Math.abs(parseInt(req.params.count, 10));
   if(isNaN(count)) {
      res.sendStatus(400);
      return
   }

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
   if(isNaN(id)) {
      res.sendStatus(400);
      return
   }

   try {
      const post = await prisma.post.findUnique({
         where: {
            id
         }
      });
      res.json(post);
   } catch (e) {
      console.log('db err')
      res.sendStatus(400)
      return
   }
});

router.post('/new', json_req(['title', 'body']), auth.verifyToken, async (req:any, res) => {
   const json = req.body;

   let author;
   try {
      author = await prisma.user.findUnique({ where: { email: req.tokenEmail.email } });
   } catch (e) {
      console.log('db err')
      res.sendStatus(400)
      return
   }

   if(author) {
      const post = await prisma.post.create({
         data: {
            authorId: author.id,
            title: json.title,
            body: json.body
         }
      });
      res.send(post);
   }
   else {
      res.sendStatus(403);
   }
});

router.post('/update/:id', json_req(['title', 'body']), async (req:any, res) => {
   const id = parseInt(req.params.id, 10);
   if(isNaN(id)) {
      res.sendStatus(400);
      return
   }
   const json = req.body;

   let author;
   try {
      author = await prisma.user.findUnique({ where: { email: req.tokenEmail.email } });
   } catch (e) {
      console.log('db err')
      res.sendStatus(400)
      return
   }

   if(author) {
      const post = await prisma.post.update({
         where: {
            id
         },
         data: {
            authorId: author.id,
            title: json.title,
            body: json.body,
         }
      });
      res.send(post);
   }
   else {
      res.sendStatus(403);
   }
});

export default router;
