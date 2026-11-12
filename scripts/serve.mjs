import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.PORT || 4174);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2','.json':'application/json'};
const server=createServer(async(req,res)=>{
  try {
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let path=resolve(root,`.${name}`);
    if(path!==root&&!path.startsWith(root+sep)) { res.writeHead(403);res.end();return; }
    if((await stat(path)).isDirectory()) path=resolve(path,'index.html');
    const body=await readFile(path);
    res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(body);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('404');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
