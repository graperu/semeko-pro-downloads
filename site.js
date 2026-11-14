'use strict';
(async()=>{
 const api='https://api.github.com/repos/graperu/semeko-pro-downloads/releases';
 const format=new Intl.NumberFormat('vi-VN');
 const safe=url=>{try{const u=new URL(url);return u.origin==='https://github.com'&&u.pathname.startsWith('/graperu/semeko-pro-downloads/releases/');}catch{return false;}};
 const installers=release=>(Array.isArray(release.assets)?release.assets:[]).filter(a=>/^semeko-pro-setup-[\d.]+-x64\.exe$/.test(a.name)&&a.state==='uploaded');
 const request=async url=>{const response=await fetch(url,{signal:AbortSignal.timeout(6000),headers:{Accept:'application/vnd.github+json'}});if(!response.ok)throw Error('Release information unavailable');const data=await response.json();if(!Array.isArray(data))throw Error('Invalid release information');return{response,data};};
 const nextPage=response=>{const next=String(response.headers.get('link')||'').split(',').find(link=>/rel="next"/.test(link))?.match(/<([^>]+)>/)?.[1];if(!next)return null;const u=new URL(next);if(u.origin!=='https://api.github.com'||u.pathname!=='/repos/graperu/semeko-pro-downloads/releases')throw Error('Invalid release page');return u.href;};
 const note=document.querySelector('[data-download-stat-note]');
 try{
  let page=await request(api+'?per_page=100');const all=[...page.data],releases=all.filter(x=>!x.draft&&!x.prerelease),latest=releases[0];if(!latest)throw Error('No published release');
  const installer=installers(latest)[0];if(!installer||!safe(installer.browser_download_url)||!safe(latest.html_url))throw Error('No verified installer link');
  document.querySelectorAll('[data-download]').forEach(a=>a.href=installer.browser_download_url);document.querySelectorAll('[data-version]').forEach(n=>n.textContent=latest.tag_name);document.querySelectorAll('[data-size]').forEach(n=>n.textContent=Math.round(installer.size/1048576)+' MiB');document.querySelectorAll('[data-release]').forEach(a=>a.href=latest.html_url);
  const sum=latest.assets.find(a=>a.name==='SHA256SUMS.txt');if(sum&&safe(sum.browser_download_url))document.querySelectorAll('[data-checksum]').forEach(a=>a.href=sum.browser_download_url);
  document.querySelector('[data-date]').textContent='Phát hành '+new Intl.DateTimeFormat('vi-VN').format(new Date(latest.published_at));document.querySelector('[data-title]').textContent=latest.name.replace(/^Semeko\s+(?:Pro\s+)?v?[\d.]+\s*[—–-]?\s*/i,'');
  if(latest.tag_name!=='v1.4.3')document.querySelector('#release-summary').textContent='Bản cập nhật mới đã sẵn sàng. Xem ghi chú đầy đủ để biết thay đổi và hướng dẫn cập nhật.';
  const history=document.querySelector('#release-history');history.replaceChildren();for(const item of releases.slice(1,4)){if(!safe(item.html_url))continue;const a=document.createElement('a'),tag=document.createElement('span'),title=document.createElement('span');a.href=item.html_url;tag.textContent=item.tag_name;title.textContent=item.name+' ↗';a.append(tag,title);history.append(a);}
  // Count file downloads, never page clicks, checksum files or draft releases.
  // Follow pagination so the total does not silently omit older versions.
  const seen=new Set([api+'?per_page=100']);let next=nextPage(page.response);
  while(next){if(seen.has(next))throw Error('Repeated release page');seen.add(next);page=await request(next);all.push(...page.data);next=nextPage(page.response);}
  const versions=new Map();for(const release of all)if(!release.draft&&!release.prerelease&&!versions.has(release.tag_name))versions.set(release.tag_name,release);
  const assets=[...versions.values()].flatMap(installers),counts=assets.map(a=>a.download_count);
  if(!counts.length||counts.some(n=>!Number.isSafeInteger(n)||n<0)||!Number.isSafeInteger(installer.download_count))throw Error('Download counts unavailable');
  const total=counts.reduce((n,v)=>n+v,0);if(!Number.isSafeInteger(total))throw Error('Download total unavailable');
  document.querySelector('[data-total-downloads]').textContent=format.format(total);document.querySelector('[data-release-downloads]').textContent=format.format(installer.download_count);
  if(note)note.textContent='Nguồn: GitHub Releases · Lượt tải tệp, không phải số người dùng riêng biệt.';
 }catch{
  // Keep verified pinned download links usable when GitHub is unavailable.
  if(note)note.textContent='Chưa lấy được thống kê GitHub. Bạn vẫn tải bộ cài bình thường.';
 }
})();
