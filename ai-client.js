(() => {
  'use strict';
  const config = window.BZ_AI_CONFIG;
  const mount = document.getElementById('breeze-ai-mount');
  if (!mount || !config?.endpoint || !config?.sitekey) return;
  const task = mount.dataset.task;
  mount.innerHTML = `<details class="bz-ai-panel"><summary>${task === 'order' ? '사진에서 주문 정보 읽기' : '사진에서 상품 설명 만들기'}</summary>
    <p>선택한 사진을 Cloudflare 서버를 통해 Groq AI로 전송해 분석합니다. 필요한 부분만 잘라 올리고, 분석 결과는 직접 확인해 주세요.</p>
    <label class="bz-ai-consent"><input type="checkbox" class="bz-ai-agree"> 사진의 AI 분석 전송에 동의합니다.</label>
    <label>분석할 사진 <input type="file" class="bz-ai-file" accept="image/jpeg,image/png,image/webp"></label>
    <div class="bz-ai-challenge"></div>
    <button type="button" class="btn btn-primary bz-ai-run" disabled>사진 분석하기</button>
    <p role="status" class="bz-ai-status">서버 연결을 확인하고 있습니다.</p>
    <div class="bz-ai-result" hidden></div></details>`;
  const status = mount.querySelector('.bz-ai-status');
  const button = mount.querySelector('.bz-ai-run');
  const fileInput = mount.querySelector('.bz-ai-file');
  const agree = mount.querySelector('.bz-ai-agree');
  const resultBox = mount.querySelector('.bz-ai-result');
  let token = '', widget, available = false, working = false;
  const update = () => { button.disabled = !available || !token || !agree.checked || !fileInput.files.length || working; };
  const existingPhoto = task === 'gallery' ? document.getElementById('galleryFileInput') : null;
  if(existingPhoto) existingPhoto.addEventListener('change', () => { fileInput.files = existingPhoto.files; resultBox.hidden = true; update(); });
  agree.addEventListener('change', update);fileInput.addEventListener('change', () => { resultBox.hidden=true;update(); });
  async function prepareImage(file) {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8_000_000) throw new Error('8MB 이하 JPG·PNG·WebP 사진을 선택해 주세요.');
    const bitmap = await createImageBitmap(file);
    try {
      if(bitmap.width*bitmap.height > 40_000_000) throw new Error('사진 해상도가 너무 큽니다. 작은 사진으로 다시 시도해 주세요.');
      const ratio=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
      const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const data=canvas.toDataURL('image/jpeg',0.8);
      if(data.length>2_000_000)throw new Error('사진이 너무 큽니다. 필요한 부분만 잘라 다시 올려 주세요.');
      return data;
    } finally {bitmap.close();}
  }
  function preview(data) {
    resultBox.replaceChildren();resultBox.hidden=false;
    const mapping=task==='order'?{recipient:['받는 사람','recipient'],address:['주소','address'],date:['날짜','delivery-date'],purpose:['용도','purpose'],ribbon:['리본 문구','ribbon']}:{title:['제목','galleryTitle'],cat:['분류','galleryCat'],desc:['설명','galleryDesc']};
    const title=document.createElement('strong');title.textContent='분석 결과 — 확인 후 적용하세요';resultBox.appendChild(title);
    for(const [key,[label]] of Object.entries(mapping)) {
      const row=document.createElement('p');row.textContent=label+': '+(data[key]||'확인 필요');resultBox.appendChild(row);
    }
    if(data.time){const p=document.createElement('p');p.textContent='사진 속 시간: '+data.time+' — 희망 배송 시간은 직접 선택해 주세요.';resultBox.appendChild(p);}
    const apply=document.createElement('button');apply.type='button';apply.className='btn btn-primary';apply.textContent='비어 있는 항목에 적용';
    apply.addEventListener('click',()=>{
      let count=0;
      for(const [key,[,id]] of Object.entries(mapping)) {
        const el=document.getElementById(id);if(!el||!data[key])continue;
        if(key==='date' && data.date < (el.min||''))continue;
        if(el.tagName==='SELECT') {
          if(el.value && !(task==='gallery' && key==='cat')) continue;
          if(!Array.from(el.options).some(o=>o.value===data[key]))continue;
        } else if(el.value.trim())continue;
        el.value=data[key];el.dispatchEvent(new Event('change',{bubbles:true}));count++;
      }
      status.textContent=count+'개 항목을 적용했습니다. 이름·날짜·주소·분류를 확인해 주세요.';apply.disabled=true;
    });resultBox.appendChild(apply);
  }
  button.addEventListener('click',async()=>{
    if(button.disabled)return;
    working=true;update();resultBox.hidden=true;status.textContent='사진을 분석하고 있습니다…';
    try {
      const image=await prepareImage(fileInput.files[0]);
      const res=await fetch(config.endpoint+'/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task,image,token}),signal:AbortSignal.timeout(40000)});
      const payload=await res.json();if(!res.ok)throw new Error(payload.error||'분석하지 못했습니다. 직접 입력해 주세요.');
      preview(payload.data);status.textContent='분석 완료. 내용을 확인한 후 적용해 주세요.';
    } catch(e) {status.textContent=e.name==='TimeoutError'?'응답이 늦습니다. 다시 시도하거나 직접 입력해 주세요.':e.message;}
    finally {working=false;token='';if(widget!==undefined)window.turnstile.reset(widget);update();}
  });
  async function init() {
    try {
      const res=await fetch(config.endpoint+'/health',{cache:'no-store',signal:AbortSignal.timeout(8000)});
      const health=await res.json();if(!res.ok||!health.configured)throw new Error('AI 연결을 준비 중입니다. 아래 항목을 직접 입력해 주세요.');
      const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
      await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=()=>reject(new Error('보안 확인을 불러오지 못했습니다. 직접 입력해 주세요.'));document.head.appendChild(script);});
      widget=window.turnstile.render(mount.querySelector('.bz-ai-challenge'),{sitekey:config.sitekey,action:'breeze-ai',callback:value=>{token=value;update();},'expired-callback':()=>{token='';update();},'error-callback':()=>{token='';status.textContent='보안 확인에 실패했습니다. 새로고침하거나 직접 입력해 주세요.';update();}});
      available=true;status.textContent='전송 동의와 사진 선택 후 분석할 수 있습니다.';update();
    }catch(e){status.textContent=e.message;}
  }
  let initialized = false;
  mount.querySelector('details').addEventListener('toggle', event => {
    if(event.target.open && !initialized) { initialized = true; init(); }
  });
})();
