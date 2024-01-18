const {Router,createServer} =require("../lib/octapus")
const path=require("path")
const router=new Router();

// router.get("/",(req,res)=>res.end("Hello Octapus"))


const base_route=router.get("/app",(req,res)=>{
    res.writeHead(200,{"Content-Type":"text/plain"});
    res.end("Hello Octapus")
})
router.merge(base_route)

function getUserList(req,res){
    res.writeHead(200,{"Content-Type":"application/json"})
    res.end("/users: " + JSON.stringify({user:["degraft","Frimpong"]}))
}

router.get("/users",getUserList)

router.get("/add",(req,res)=>{
    const htmlContent=`
    <html>
    <h1>Hello Octapus</h1>
    </html>
    `
    res.sendHtmlResponse(htmlContent)
})

// serving static file from assert dir
router.static('/public',{index:['index.html']})


createServer(router).listen(3000,()=>{
    console.log(`server is up on port 3000`)
})