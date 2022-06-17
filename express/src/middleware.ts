export function json_req(reqs: string[]) {
   return (req:any, res:any) => {
      for(req in reqs) {
         if(!res.body[req]) {
            res.sendStatus(401);
         }
      }
   }
}
