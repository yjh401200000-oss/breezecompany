const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const pages = ['index.html','products.html','price.html','order.html','gallery.html','admin.html'];
for(const file of pages) {
  const html = fs.readFileSync(file,'utf8');
  assert(!/gsk_[a-zA-Z0-9]+|const ADMIN_PW|api\.allorigins/.test(html), file+' exposes legacy credentials');
  for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(m[1],{filename:file});
}
const elements = new Map();
const node = id => {
  if(!elements.has(id)) elements.set(id,{value:'',checked:false,style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},appendChild(){},querySelector(){return null;}});
  return elements.get(id);
};
const sandbox = { document:{getElementById:node,addEventListener(){},querySelectorAll(){return[];}},localStorage:{removeItem(){}},sessionStorage:{removeItem(){}},console,window:{},setTimeout,clearTimeout,Date,atob,btoa,URL,fetch:async()=>({ok:true,json:async()=>({permissions:{push:true}})}) };
vm.createContext(sandbox);
const admin = [...fs.readFileSync('admin.html','utf8').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
vm.runInContext(admin,sandbox);
vm.runInContext(fs.readFileSync('products.js','utf8'),sandbox);
vm.runInContext('productMetadata = window.BZ_PRODUCTS;',sandbox);
for(const group of sandbox.window.BZ_PRODUCTS) for(const item of group.items) {
  const id=item.key.replace(/\s/g,'_');
  node('pname_'+id).value=item.name;
  node('sale_'+id).value=item.price===null?'':String(item.price);
  node('inq_'+id).checked=item.price===null;
  for(const key of ['image','description','detail','composition','size','use'])node('meta_'+key+'_'+id).value=item[key]||'';
}
const output=vm.runInContext('buildProductsJs()',sandbox);const generated={window:{}};vm.runInNewContext(output,generated);
assert.equal(generated.window.BZ_PRODUCTS.flatMap(g=>g.items).length, sandbox.window.BZ_PRODUCTS.flatMap(g=>g.items).length);
assert.equal(generated.window.BZ_PRODUCTS[0].items[0].image,sandbox.window.BZ_PRODUCTS[0].items[0].image);
node('sale_3단_화환_A').value='-1';assert.throws(()=>vm.runInContext('buildProductsJs()',sandbox));node('sale_3단_화환_A').value='65000';
node('meta_description_3단_화환_A').value='수정한 설명';
assert(vm.runInContext('buildProductsJs()',sandbox).includes('수정한 설명'));
(async()=>{
 await vm.runInContext('verifyPat("test-token")',sandbox);
 sandbox.fetch=async()=>({ok:true,json:async()=>({permissions:{push:false}})});
 await assert.rejects(vm.runInContext('verifyPat("test-token")',sandbox));
 console.log('PASS: scripts, credential removal, catalog roundtrip, detail edits, invalid prices, denied write permissions');
})();
// Order generation must not claim clipboard success after a rejection.
const orderSource=fs.readFileSync('order.html','utf8');
const submitSource=orderSource.slice(orderSource.indexOf('async function submitOrder()'),orderSource.indexOf('</script>',orderSource.indexOf('async function submitOrder()')));
const fields={name:'테스트',phone:'010-0000-0000',product:'테스트 상품',quantity:'2','delivery-date':'','delivery-time':'',recipient:'테스트',address:'','sender-name':'',ribbon:'',purpose:'',message:''};
const orderNodes=Object.fromEntries(Object.entries(fields).map(([k,value])=>[k,{value}]));
orderNodes['price-total']={textContent:'130,000원'};orderNodes['price-display']={style:{display:'block'}};
const notices=[];let success;
const orderContext={document:{getElementById:id=>orderNodes[id]},alert:msg=>notices.push(msg),localToday:()=> '2026-09-08',calcPrice(){},navigator:{clipboard:{writeText:async()=>{throw new Error('denied')}}},showSuccess:(text,copied)=>success={text,copied}};
vm.createContext(orderContext);vm.runInContext(submitSource,orderContext);
(async()=>{
 await vm.runInContext('submitOrder()',orderContext);assert.equal(success.copied,false);assert(success.text.includes('130,000원'));
 success=null;orderNodes.quantity.value='0';await vm.runInContext('submitOrder()',orderContext);assert.equal(success,null);assert(notices.pop().includes('정수'));
 orderNodes.quantity.value='2';orderNodes['delivery-date'].value='2025-01-01';await vm.runInContext('submitOrder()',orderContext);assert.equal(success,null);assert(notices.pop().includes('배송일'));
 console.log('PASS: clipboard failure, invalid quantity, past delivery date');
})();
