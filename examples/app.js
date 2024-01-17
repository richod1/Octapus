const {Router,createServer} =require("../lib/octapus")

const router=new Router();

router.get("/",(req,res)=>res.end("Hello Octapus"))

createServer(router).listen(3000,()=>{
    console.log(`server is up on port 3000`)
})