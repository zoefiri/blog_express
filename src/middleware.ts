export function json_req(reqs: string[]) {
   return (req:any, res:any, next:any) => {
      let nextFlag = true;
      for(const required of reqs) {
         if(!(required in req.body)) {
            res.sendStatus(401);
            nextFlag = false;
         }
      }
      console.log(nextFlag);
      if(nextFlag){
         next();
         console.log(nextFlag, 'uRRR');
      }
   }
}
