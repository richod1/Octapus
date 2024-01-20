const {Router,createServer} =require("../lib/octapus")
const path=require("path")
const app=Router.octa();

// router.get("/",(req,res)=>res.end("Hello Octapus"))


const base_route=app.get("/app",(req,res)=>{
    res.writeHead(200,{"Content-Type":"text/plain"});
    res.end("Hello Octapus")
})
app.merge(base_route)

function getUserList(req,res){
    res.writeHead(200,{"Content-Type":"application/json"})
    res.end("/users: " + JSON.stringify({user:["degraft","Frimpong"]}))
}

app.get("/users",getUserList)

app.get("/add",(req,res)=>{
    const htmlContent=`
    <html>
    <h1>Hello Octapus</h1>
    </html>
    `
    res.sendHtmlResponse(htmlContent)
})

app.json({inflate:true})

// use() static method
app.use(async (req,res,next)=>{
    console.log(`[${new Date()}] ${req.method} ${req.url}`);
    await next();
})

// serving static file from assert dir
app.static('/public',{index:['index.html']})


createServer(app).listen(3000,()=>{
    console.log(`server is up on port 3000`)
})