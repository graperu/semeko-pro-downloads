'use strict';
(async()=>{try{
 const r=await fetch('https://api.github.com/repos/graperu/semeko-pro-downloads/releases?per_page=5',{signal:AbortSignal.timeout(6000),headers:{Accept:'application/vnd.github+json'}});if(!r.ok)return;
 const releases=(await r.json()).filter(x=>!x.draft&&!x.prerelease),latest=releases[0];if(!latest)return;
 const safe=url=>{try{const u=new URL(url);return u.origin==='https://github.com'&&u.pathname.startsWith('/graperu/semeko-pro-downloads/releases/');}catch{return false;}};
 const installer=latest.assets.find(a=>/^semeko-pro-setup-.*-x64\.exe$/.test(a.name)&&a.state==='uploaded');if(!installer||!safe(installer.browser_download_url)||!safe(latest.html_url))return;
 document.querySelectorAll('[data-download]').forEach(a=>a.href=installer.browser_download_url);document.querySelectorAll('[data-version]').forEach(n=>n.textContent=latest.tag_name);document.querySelectorAll('[data-size]').forEach(n=>n.textContent=Math.round(installer.size/1048576)+' MiB');document.querySelectorAll('[data-release]').forEach(a=>a.href=latest.html_url);
 const sum=latest.assets.find(a=>a.name==='SHA256SUMS.txt');if(sum&&safe(sum.browser_download_url))document.querySelectorAll('[data-checksum]').forEach(a=>a.href=sum.browser_download_url);
 document.querySelector('[data-date]').textContent='Phát hành '+new Intl.DateTimeFormat('vi-VN').format(new Date(latest.published_at));document.querySelector('[data-title]').textContent=latest.name.replace(/^Semeko\s+(?:Pro\s+)?v?[\d.]+\s*[—–-]?\s*/i,'');
 if(latest.tag_name!=='v1.4.2')document.querySelector('#release-summary').textContent='Bản cập nhật mới đã sẵn sàng. Xem ghi chú đầy đủ để biết thay đổi và hướng dẫn cập nhật.';
 const history=document.querySelector('#release-history');history.replaceChildren();for(const item of releases.slice(1,4)){if(!safe(item.html_url))continue;const a=document.createElement('a'),tag=document.createElement('span'),title=document.createElement('span');a.href=item.html_url;tag.textContent=item.tag_name;title.textContent=item.name+' ↗';a.append(tag,title);history.append(a);}
}catch{/* Pinned verified links remain available offline or when GitHub is rate limited. */}})();
