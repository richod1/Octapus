const {Router,createServer} =require("../lib/octapus")

const router=new Router();

router.get("/",(req,res)=>{
    res.write(200,{"Content-Type":"text/plain"})
    res.send("Hello Octapus")
})

createServer(router).listen(3000,(err)=>{
    if(err) throw new Error("server failed")
    console.log(`server is up on port 3000`)
})