const http=require("node:http")
const nodemon=require("nodemon")
const {path,join}=require('path')
const {readFileSync,statSync,createReadStream}=require('fs');
const { readdirSync } = require("node:fs");
const serveStatic=require("serve-static")
const ejs=require("ejs")
class Router{
    constructor(defaultContentType='text/html'){
        this.rootNode=new RouteNode();
        this.defaultContentType=defaultContentType;
        this.middlewareStack=[];
        this.viewPath='';
        this.ciewEngine='ejs'
    }

    use(middleware){
        this.middlewareStack.push(middleware)
    }

    async executeMiddleware(req,res,index=0){
        const next=async ()=>{
            await this.executeMiddleware(req,res,index +1);
        };

        if(indindex < this.middlewareStack.length){
            const currentMiddleware=this.middlewareStack[index];
            await currentMiddleware(req,res,next)
        }
        
    }

    // static method
    static octa(){
        return new Router();
    }

    // json parsing
    json(options={}){
        const jsonMiddleware=(req,res,next)=>{
            let data='';
            req.on('data',(chunk)=>{
                data +=chunk;
            })

            req.on('end',()=>{
                try{
                    req.ody=JSON.parse(data,options.reviver)
                    next();
                }catch(error){
                    res.wrireHead(400,{'Content-Type':'text/plain'})
                    res.end('Invalid JSON')
                }
            })
        };
        this.use(jsonMiddleware)
        return this;
    }

    #generateNestedRoutes(currentNode,currentPrefix,newRouter){
        for(const[method,handler] of Object.entries(currentNode.handler)){
            newRouter.addRoute(method,currentPrefix,handler)
        
        }
        for(const [pathSegment,subNode] of Object.entries(currentNode.children)){
            this.#generateNestedRoutes(subNode,`${currentPrefix}/${pathSegment}`,newRouter);
        }
        if(currentNode.param){
            this.#generateNestedRoutes(currentNode.param,`${currentPrefix}/:${currentNode.param.paramName}`,
            newNode)
        }
    }

    addRoute(httpMethod, routePath, requestHandler) {
        let currentNode = this.rootNode;
        let pathStart = 1,
            pathEnd = 1,
            pathLength = routePath.length;
        for (; pathEnd <= pathLength; ++pathEnd) {
            if (pathEnd === pathLength || routePath[pathEnd] === "/") {
                let pathSegment = routePath.substring(pathStart, pathEnd);
                let nextNode;
                if (pathSegment[0] === ":") {
                    if (!currentNode.param) {
                        currentNode.param = new RouteNode();
                        currentNode.param.paramName = pathSegment.substring(1);
                    }
                    nextNode = currentNode.param;
                } else {
                    nextNode =
                        currentNode.children[pathSegment] || (currentNode.children[pathSegment] = new RouteNode());
                }
                currentNode = nextNode;
                pathStart = pathEnd + 1;
            }
        }
        currentNode.handler[httpMethod] = requestHandler;
    }

    #mergeNodes(currentNode, nodeToMerge) {
        for (const [method, handler] of Object.entries(nodeToMerge.handler)) {
            currentNode.handler[method] = handler;
        }
        for (const [pathSegment, subNode] of Object.entries(nodeToMerge.children)) {
            if (!currentNode.children[pathSegment]) {
                currentNode.children[pathSegment] = new RouteNode();
            }
            this.#mergeNodes(currentNode.children[pathSegment], subNode);
        }
        if (nodeToMerge.param) {
            if (!currentNode.param) {
                currentNode.param = new RouteNode();
                currentNode.param.paramName = nodeToMerge.param.paramName;
            }
            this.#mergeNodes(currentNode.param, nodeToMerge.param);
        }
    }

    printTree() {
        this.#printNode(this.rootNode, "Root");
    }

    #printNode(node, prefix, level = 0, prefixSymbol = "") {
        let indentation = " ".repeat(level * 4);

        console.log(`${prefixSymbol ? `${indentation}${prefixSymbol} ${prefix || "/"}` : prefix}`);

        // Print handlers for this node
        for (const [method, handler] of Object.entries(node.handler)) {
            const handlerName =
                handler.name ||
                handler
                    .toString()
                    .replace(/[\n]/g, "")
                    .replace(/[\s]{2,}/g, " ")
                    .substring(0, 30) + "...";
            console.log(`${indentation}    └─ [${method}] ↠  ${handlerName}`);
        }

        // Recursively print children
        for (const [childPrefix, childNode] of Object.entries(node.children)) {
            this.#printNode(childNode, childPrefix, level + 1, "├─");
        }

        // Recursively print parameterized child
        if (node.param) {
            this.#printNode(node.param, `:${node.param.paramName}`, level + 1, "├─");
        }
    }

    // constructor(defaultContentType='text/html'){
    //     this.rootNode=new RouteNode();
    //     this.defaultContentType=defaultContentType;
    // }

    async handleRequest(nativeReq, nativeRes) {
        // const req = new Request(nativeReq);
        // const res = new Response(nativeRes);

        const { method, url } = nativeReq;
        const queryDelimiter = url.indexOf("?");
        const routePath = queryDelimiter === -1 ? url : url.substring(0, queryDelimiter);
        const routeHandler = this.#findRouteHandler(method, routePath);

        if (!routeHandler) {
            nativeRes.writeHead(404);
            nativeRes.end("Route Not Found");
            return;
        }

        nativeReq.params = routeHandler.extractedParams;
        nativeReq.queryParams = new URLSearchParams(queryDelimiter === -1 ? "" : url.substring(queryDelimiter));

        nativeRes.sendHtmlResponse=(htmlContent,statusCode=200)=>{
            nativeRes.writeHead(statusCode,{
                'Content-Type':this.defaultContentType,
            });

            nativeRes.end(htmlContent);
        }

        const routeHandlerFunc = routeHandler.requestHandler[routePath] || routeHandler.requestHandler;

        if (typeof routeHandlerFunc === "function") {
            await routeHandlerFunc(nativeReq, nativeRes);
        } else {
            res.writeHead(404);
            res.end("Route Not Found");
        }
    }

    #findRouteHandler(httpMethod, routePath) {
        let currentNode = this.rootNode;
        let extractedParams = Object.create(null);
        let pathStart = 1;
        const pathLength = routePath.length;
        const stack = [];

        for (let pathEnd = 1; pathEnd <= pathLength; ++pathEnd) {
            if (pathEnd === pathLength || routePath[pathEnd] === "/") {
                const pathSegment = routePath.substring(pathStart, pathEnd);
                let nextNode = currentNode.children[pathSegment];

                while (!nextNode && currentNode.param) {
                    nextNode = currentNode.param;
                    extractedParams[currentNode.param.paramName] = pathSegment;
                    pathStart = pathEnd + 1;
                }

                if (!nextNode) return null;

                stack.push({ node: nextNode, param: extractedParams });

                currentNode = nextNode;
                pathStart = pathEnd + 1;
            }
        }

        if (!currentNode.handler[httpMethod]) return null;
        return { requestHandler: currentNode.handler[httpMethod], extractedParams };
    }

    get(routePath, requestHandler) {
        this.addRoute("GET", routePath, requestHandler);
        return this;
    }

    post(routePath, requestHandler) {
        this.addRoute("POST", routePath, requestHandler);
        return this;
    }

    put(routePath, requestHandler) {
        this.addRoute("PUT", routePath, requestHandler);
        return this;
    }

    delete(routePath, requestHandler) {
        this.addRoute("DELETE", routePath, requestHandler);
        return this;
    }

    patch(routePath, requestHandler) {
        this.addRoute("PATCH", routePath, requestHandler);
        return this;
    }

    merge(routerToMerge) {
        this.#mergeNodes(this.rootNode, routerToMerge.rootNode);
    }

    nest(prefix, routerToNest) {
        this.#nestNodes(this.rootNode, routerToNest.rootNode, prefix);
        return this;
    }

    #nestNodes(currentNode, nodeToNest, prefix) {
        const newRouter = new Router();
        this.#generateNestedRoutes(nodeToNest, prefix, newRouter);
        this.#mergeNodes(currentNode, newRouter.rootNode);
    }


//     getFiles(dirName){
//         let files=[];
//         const items=readdirSync(dirName,{whithFileTypes:true})
//         for(const item of items){
//             const itemPath=path.join(dirName,item)
//             const stats=statSync(itemPath)
//             if(stats.isDirectory()){
//                 files=[...files,...this.getFiles(itemPath)]
//             }else{
//                 files.push(path.relative(path.join(__dirname,'..'),itemPath))
//             }
//         }
//         return files;

//     }
//     // Function to support different content types
//     getContentType = (file) => {
// 	const extname = path.extname(file)
// 	if (extname === ".css") {
// 		return "text/css"
// 	} else if(extname===".html"){
//         return "application/html"
//     }else if (extname === ".js") {
// 		return "application/javascript"
// 	} else if (extname === ".png") {
// 		return "image/png"
// 	} else if (extname === ".jpg" || extname === ".jpeg") {
// 		return "image/jpeg"
// 	} else if (extname === ".gif") {
// 		return "image/gif"
// 	} else if (extname === ".avif") {
// 		return "image/avif"
// 	}
// 	return "application/octet-stream" // Default to binary data if the content type is not recognized
// }


//     /***
//      * method to serve static files assert from external dir
//      */

//     static(directory,options){
//         return serveStatic(directory,options)
//     }

    // serveStatic(baseDirectory,directory){
    //     const staticAssets=this.getFiles(path.resolve(__dirname,directory))

    //     staticAssets.forEach((el)=>{
    //         this.get(`/${el}`,(req,res)=>{
    //             const filePath=path.join(baseDirectory,el)

    //             try{
    //                 const stats=statSync(filePath);
    //                 if(stats.isFile()){
    //                     const contentType=this.getContentType(filePath)
    //                     res.setHeader('Content-Type',contentType)
    //                     const fileContents=readFileSync(filePath);
    //                     res.end(fileContents)


    //                 }else{
    //                     res.writeHead(404)
    //                     res.end('Not Found')
    //                 }
    //             }catch(err){
    //                 console.error(`Error while serving files: ${err.message}`)
    //                 res.writeHead(500)
    //                 res.end("Internal Server Error")

    //             }
    //         })
    //     })

    // }

    // static file server

    getContentType(file){
        // function to get static ext file type
        const extname=path.extname(file).toLowerCase();
        switch(extname){
            case '.html':
                return 'text/html';
            case '.css':
                return 'text/css';
            case '.js':
                return 'application/javascript';
                default:
                    return 'application/octet-stream';
        }
    }

    static(directory,options={}){
        const staticMiddleware=async(req,res,next)=>{
            const filePath=join(directory,req.url);
            try{
                const fileStream=createReadStream(filePath);
                fileStream.on('open',()=>{
                    res.setHeader('Content-Type',this.getContentType(filePath));
                    fileStream.pipe(res);
                });

                fileStream.on('error',(error)=>{
                    res.writeHead(404);
                    res.send(`GET:cannot get ${filePath}`);
                })
            }catch(err){
                console.log(`Error serving static file : ${err.message}`)
                res.wrireHead(500);
                res.end('Internal Server Error')

            }
        }
        return staticMiddleware;

    }

    // method to get dir path
    setViewPath(viewsPath){
        this.viewsPath=viewsPath;
    }

    // method to set View engine (ejs)
    setViewEngine(viewEngine){
        this.viewEngine=viewEngine;
    }

    // method to render files from dir on view engine

    render(viewName,data={}){
        const viewPath=join(this.viewPath, `${viewName}.${this.viewEngine}`);
        try{

            const template=readFileSync(viewPath,'utf-8');

            const renderContent=ejs.render(template,data)
            return renderContent;
            
        }catch(err){
            console.log(`Error rendering view :${err.message}`)
            throw err;
        }

    }

    

    
}

class Request {
    #nativeRequest;
    constructor(nativeRequest) {
        this.#nativeRequest = nativeRequest;
        this.extractedParams = Object.create(null);
        this.queryParams = new URLSearchParams();
    }

    set params(params) {
        this.extractedParams = Object.freeze({ ...params });
    }

    get params() {
        return Object.freeze({ ...this.extractedParams });
    }

    get method() {
        return this.#nativeRequest.method;
    }

    get url() {
        return this.#nativeRequest.url;
    }
}

class Response {
    #nativeResponse;

    constructor(nativeResponse) {
        this.#nativeResponse = nativeResponse;
    }

    writeHead(statusCode, headers) {
        this.#nativeResponse.writeHead(statusCode, headers);
    }

    end(data) {
        this.#nativeResponse.end(data);
    }

    

    // sending status code
    status(statusCode){
        this.#nativeResponse.status(statusCode)
    
    }
}

class RouteNode {
    constructor() {
        this.handler = Object.create(null);
        this.children = Object.create(null);
        this.param = null;
        this.paramName = null;
    }
}

function createServer(router) {
    return http.createServer((req,res)=>{
        router.handleRequest(req,res)
    })
}


module.exports={
    Router,
    createServer,
}