/* Fursona Forge - dependency-free, local-first starter. No real cloud accounts or public messaging yet. */
(() => {
  'use strict';
  const KEY = 'fursona-forge-v1';
  // Local-only roadmap wishlists. These are not public votes or server metrics.
  const WISHLIST_KEY = 'fursona-forge-future-wishlist-v1';
  const FUTURE_FEATURES = [
    {id:'character-sheets',phase:'next',icon:'✎',title:'Deeper character sheets',category:'Character tools',description:'More traits, personality notes, custom fields, poses and appearance details.'},
    {id:'reference-gallery',phase:'next',icon:'▧',title:'Art & reference galleries',category:'Character tools',description:'Keep multiple images, color palettes, and reference sheets together for each character.'},
    {id:'character-links',phase:'next',icon:'♡',title:'Character relationships',category:'Story tools',description:'Build friendship, family, rivalry and team links between your OCs.'},
    {id:'species-library',phase:'next',icon:'◈',title:'Species & hybrid library',category:'Worldbuilding',description:'Organize original species, cultures, traits and creatures within your worlds.'},
    {id:'map-markers',phase:'explore',icon:'⌖',title:'Maps with lore pins',category:'Map maker',description:'Add cities, landmarks, region labels and links straight to your lore entries.'},
    {id:'timelines',phase:'explore',icon:'⌛',title:'World timelines',category:'Worldbuilding',description:'Lay out eras, wars, adventures and important events in chronological order.'},
    {id:'profiles',phase:'explore',icon:'✦',title:'Public creator profiles',category:'Community',description:'Share selected characters and creations, with privacy controls and customizable galleries.'},
    {id:'artist-directory',phase:'explore',icon:'❖',title:'Creator portfolios & requests',category:'Commissions',description:'Discover artists, review examples and send commission requests; no in-app payments.'},
    {id:'collab',phase:'later',icon:'☷',title:'Collaborative worlds',category:'Social creation',description:'Invite trusted friends to help build shared settings, stories and lore.'},
    {id:'messages',phase:'later',icon:'✉',title:'Safe creator messaging',category:'Community',description:'Opt-in conversations, with privacy settings, blocking, reporting and moderation.'},
    {id:'challenges',phase:'later',icon:'✧',title:'Community showcases',category:'Community',description:'Optional character prompts, art showcases and worldbuilding challenges.'},
    {id:'apps',phase:'later',icon:'▣',title:'Desktop & mobile apps',category:'Platform',description:'A shared Fursona Forge experience for web, desktop, iOS and Android, with optional free syncing.'}
  ];
  const FUTURE_PHASES = [
    {id:'next',eyebrow:'FIRST ON THE DRAWING BOARD',title:'Character upgrades',subtitle:'Ideas we want to explore earlier as the forge grows.'},
    {id:'explore',eyebrow:'EXPANDING THE TOOLKIT',title:'Worlds & discovery',subtitle:'Making creations richer and connecting the people behind them.'},
    {id:'later',eyebrow:'THE BIG VISION',title:'Community & everywhere',subtitle:'Larger projects that need safe accounts, hosting and extra development.'}
  ];
  function loadWishlist(){try{const a=JSON.parse(localStorage.getItem(WISHLIST_KEY)||'[]');return Array.isArray(a)?a.filter(id=>FUTURE_FEATURES.some(f=>f.id===id)):[];}catch{return [];}}
  let wishlist = loadWishlist();
  function saveWishlist(){try{localStorage.setItem(WISHLIST_KEY,JSON.stringify(wishlist));return true;}catch{toast('Could not save your wishlist in this browser.');return false;}}

  const TILE = 32, MAP_W = 20, MAP_H = 12;
  const TERRAINS = [
    {key:'water',label:'Water',color:'#478bab'},
    {key:'grass',label:'Grassland',color:'#85aa71'},
    {key:'forest',label:'Forest',color:'#3d795d'},
    {key:'mountain',label:'Mountains',color:'#8d90a3'},
    {key:'desert',label:'Desert',color:'#d2af70'},
    {key:'town',label:'Settlement',color:'#b87d72'}
  ];
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `ff-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  const safeImage = src => typeof src === 'string' && /^data:image\/(png|jpeg|webp);base64,[a-z\d+/=]+$/i.test(src) ? src : '';
  const excerpt = (s,n=105) => String(s || '').length > n ? String(s).slice(0,n-1)+'…' : (s || 'No description yet.');
  const sampleMap = () => Array.from({length: MAP_W*MAP_H},(_,i)=>{
    const x=i%MAP_W, y=Math.floor(i/MAP_W);
    if (x<2 || (x<4 && y<3) || (x<3 && y>8) || x>18) return 'water';
    if ((x===14&&y===5)||(x===13&&y===5)||(x===14&&y===6)) return 'town';
    if ((x>11 && x<17 && y>1 && y<5) || (x>13 && x<18 && y>7 && y<10)) return 'mountain';
    if ((x>4 && x<10 && y>2 && y<8) || (x>7 && x<13 && y>7 && y<10)) return 'forest';
    if (x>16 && y>3 && y<8) return 'desert';
    return 'grass';
  });
  const starter = () => ({
    characters:[{id:'sample-character',name:'Aster',species:'Red fox',kind:'Original Character',role:'Wayfinder',worldId:'sample-world',pronouns:'they / them',tags:'adventurer, explorer',description:'A curious traveler collecting stories from every corner of the Emberwilds. This is a sample character — edit or delete it to make the forge your own.',image:'',sample:true}],
    worlds:[{id:'sample-world',name:'The Emberwilds',genre:'Fantasy',mood:'Mystical',description:'An untamed continent filled with living forests, forgotten observatories, and towns built along the firelit coast. This is a starter example you can edit or delete.',sample:true,lore:[{id:'sample-lore',category:'Locations',title:'The Lantern Coast',body:'Each night the coastal cliffs shine with tiny golden lights. Nobody agrees on where the lights come from.'}]}],
    maps:[{id:'sample-map',name:'Emberwilds — First Sketch',worldId:'sample-world',tiles:sampleMap(),sample:true}],
    briefs:[],profile:{name:'Guest Creator',pfpId:''}
  });
  function validateData(d){
    if (!d || !Array.isArray(d.characters) || !Array.isArray(d.worlds) || !Array.isArray(d.maps) || !Array.isArray(d.briefs)) throw Error('Not a Fursona Forge backup.');
    const clean = {characters:d.characters.slice(0,250),worlds:d.worlds.slice(0,250),maps:d.maps.slice(0,100),briefs:d.briefs.slice(0,250),profile:d.profile || {name:'Guest Creator',pfpId:''}};
    if (clean.maps.some(m=>!Array.isArray(m.tiles) || m.tiles.length !== MAP_W*MAP_H)) throw Error('Invalid map data in backup.');
    return clean;
  }
  function load(){try{const found=localStorage.getItem(KEY);if(found)return validateData(JSON.parse(found));}catch(e){console.warn('Cannot load saved data:',e);}return starter();}
  let db=load(), activeMapId=db.maps[0]?.id || '', selectedBrush='grass', undo=[], currentWorldId=null, searchQuery='';
  const root=document.getElementById('main-content');
  const modalRoot=document.getElementById('modal-root');
  const toastRoot=document.getElementById('toast-root');
  function persist(){
    try{localStorage.setItem(KEY,JSON.stringify(db));return true;}
    catch(e){console.error(e);toast('Browser storage is full or blocked. Export a backup and try a smaller picture.');return false;}
  }
  function toast(message){const el=document.createElement('div');el.className='toast';el.textContent=message;toastRoot.appendChild(el);setTimeout(()=>el.remove(),4100);}
  const typeTag = value => `<span class="tag">${esc(value||'Uncategorized')}</span>`;
  const worldName = id => db.worlds.find(w=>w.id===id)?.name || 'No world assigned';
  const avatarFor = c => safeImage(c?.image)?`<img src="${safeImage(c.image)}" alt="${esc(c.name)} portrait">`:esc((c?.name||'G').slice(0,1).toUpperCase());
  const profileCharacter = () => db.characters.find(c=>c.id===db.profile.pfpId);
  const tagList = t => String(t||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,5);
  function topProfile(){
    const c=profileCharacter();const content=c?avatarFor(c):esc((db.profile.name||'G').slice(0,1).toUpperCase());
    document.getElementById('sidebar-avatar').innerHTML=content;
    document.getElementById('avatar-button').innerHTML=content;
    document.getElementById('sidebar-user-name').textContent=db.profile.name||'Guest Creator';
    document.getElementById('nav-characters-count').textContent=db.characters.length;
    document.getElementById('nav-worlds-count').textContent=db.worlds.length;
  }
  function screen(route){return `<div class="main-inner">${route}<div class="footer-note">Fursona Forge · Public beta · Free to create · Guest data is stored in this browser · <a href="./privacy.html">Privacy &amp; data</a></div></div>`;}
  function route(){const r=(location.hash||'#home').slice(1).split('?')[0];return ['home','characters','worlds','atlas','commissions','roadmap','profile','search'].includes(r)?r:'home';}
  function navigate(dest){if(location.hash.slice(1)!==dest){location.hash=dest;}else{render();} window.scrollTo({top:0,behavior:'instant'});}
  function render(){
    const r=route();
    document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===r));
    const labels={home:'Home',characters:'Characters',worlds:'Worlds & Lore',atlas:'Map Maker',commissions:'Commissions',roadmap:'Future Updates',profile:'Profile & Backup',search:'Search'};
    document.getElementById('breadcrumb').innerHTML=`Workspace <b>/</b> ${labels[r]}`;
    topProfile();
    const pages={home:homePage,characters:characterPage,worlds:worldPage,atlas:atlasPage,commissions:commissionPage,roadmap:roadmapPage,profile:profilePage,search:searchPage};
    root.innerHTML=screen(pages[r]());
    if(r==='atlas') setupMapCanvas();
    closeMobile();
  }
  const statCard=(symbol,num,label,shade)=>`<article class="stat-card"><div class="stat-icon ${shade}">${symbol}</div><div class="stat-number">${num}</div><div class="stat-caption">${label}</div></article>`;
  function homePage(){
    const recent=[...db.characters.map(c=>({...c,type:'Character',icon:'✦',detail:c.species})),...db.worlds.map(w=>({...w,type:'World',icon:'◈',detail:w.genre})),...db.maps.map(m=>({...m,type:'Map',icon:'▦',detail:worldName(m.worldId)}))].slice(0,5);
    return `<div class="beta-banner" role="note"><span class="beta-tag">PUBLIC BETA · V1.2</span><span>The character, world, map and commission-brief tools are ready to try. <strong>No accounts, cloud syncing, public profiles or creator messaging yet.</strong> Work is saved only in this browser—export a backup regularly.</span><a href="./privacy.html">How saving works →</a></div><section class="hero"><div class="hero-content"><div class="overline">✦ FOR FURSONAS, OCs &amp; NEW WORLDS</div><h1>Every legend<br>starts with a <em>spark.</em></h1><p>Dream up unforgettable characters, weave their stories, and build the worlds they call home. Your imagination has a home here.</p><div class="hero-actions"><button class="btn btn-primary" data-action="new-character">✦ Create a character</button><button class="btn btn-secondary" data-action="new-world">◇ Build a world</button></div></div><div class="hero-art hero-art-refresh" aria-hidden="true"><div class="hero-ring"></div><img class="hero-wordmark" src="./assets/forge-wordmark-art.webp" alt="" /></div></section>
    <section class="stat-grid" aria-label="Creation statistics">${statCard('✦',db.characters.length,'Characters created','orange')}${statCard('◈',db.worlds.length,'Worlds imagined','purple')}${statCard('▦',db.maps.length,'Maps designed','green')}${statCard('✎',db.worlds.reduce((n,w)=>n+(w.lore||[]).length,0),'Lore entries written','pink')}</section>
    <div class="home-columns"><section><div class="section-title-row"><h2>Your creations</h2><button class="link-button" data-action="go-characters">View all →</button></div><div class="panel">${recent.length?recent.map(o=>`<div class="recent-item"><span class="entity-thumb">${o.type==='Character'&&safeImage(o.image)?`<img src="${safeImage(o.image)}" alt="">`:o.type==='Character'?esc(o.name.slice(0,1)):o.icon}</span><span class="grow"><strong>${esc(o.name)}</strong><small>${esc(o.detail||'Your creation')}</small></span><span class="tag">${o.type}</span></div>`).join(''):`<p class="muted">Your next idea belongs here. Start a character or world to fill your workspace.</p>`}</div></section><section><div class="section-title-row"><h2>Jump back in</h2></div><div class="panel"><button class="quick-card" data-action="go-atlas"><span class="quick-icon">▦</span><span><strong>Open the map maker</strong><small>Draw forests, mountains and kingdoms</small></span><span class="align-right">→</span></button><button class="quick-card" data-action="go-worlds"><span class="quick-icon">✎</span><span><strong>Write some lore</strong><small>Bring your worlds to life</small></span><span class="align-right">→</span></button><button class="quick-card" data-action="go-commissions"><span class="quick-icon">◉</span><span><strong>Plan a commission</strong><small>Save an art brief for an artist</small></span><span class="align-right">→</span></button></div></section></div>
    <section class="roadmap-teaser"><div class="teaser-top"><div class="teaser-symbol">✧</div><div><div class="page-eyebrow">THE FORGE NEVER STOPS GROWING</div><h2>See what's coming to Fursona Forge</h2><p>New character tools, richer worlds, creator features and future apps. Take a peek at the ideas on our roadmap.</p></div><button class="btn btn-primary" data-action="go-roadmap">Explore future updates →</button></div><div class="teaser-mini">${FUTURE_FEATURES.slice(0,3).map(f=>`<span><i>${f.icon}</i>${esc(f.title)}</span>`).join('')}</div></section>`;
  }
  function featureCard(feature){
    const saved=wishlist.includes(feature.id);
    return `<article class="future-card">
      <div class="future-card-header"><span class="future-icon" aria-hidden="true">${feature.icon}</span><span class="future-category">${esc(feature.category)}</span></div>
      <h3>${esc(feature.title)}</h3><p>${esc(feature.description)}</p>
      <button type="button" class="wishlist-button ${saved?'chosen':''}" data-action="toggle-wishlist" data-id="${feature.id}" aria-pressed="${saved}" aria-label="${saved?'Remove':'Save'} ${esc(feature.title)} ${saved?'from':'to'} your wishlist">${saved?'♥ On your wishlist':'♡ Add to wishlist'}</button>
    </article>`;
  }
  function roadmapPage(){
    return `<div class="page-heading roadmap-heading"><div><div class="page-eyebrow">FUTURE UPDATES / THE ROADMAP</div><h1>The next chapter is still being forged.</h1><p>Here's what we're dreaming up for Fursona Forge. Tell your future self what you're excited about.</p></div><span class="wishlist-total">♡ <strong>${wishlist.length}</strong> saved on this device</span></div>
      <section class="future-hero"><div class="future-hero-copy"><span class="future-pill">✧ THE ROAD AHEAD</span><h2>More stories. More worlds. More ways to create.</h2><p>Our mission stays the same: a free creative home for fursonas, original characters and new worlds, whether you use an account or create as a guest.</p><div class="roadmap-notice">These are <strong>planned ideas, not released features or guaranteed dates</strong>. We'll announce updates when they're ready. Your wishlist is private and saved only in this browser—not a public vote.</div></div><img src="./assets/forge-wordmark-art.webp" class="future-hero-logo" alt="Fursona Forge neon fox and paw logo concept" /></section>
      ${FUTURE_PHASES.map(group=>`<section class="roadmap-phase"><div class="roadmap-phase-header"><div><div class="page-eyebrow">${group.eyebrow}</div><h2>${group.title}</h2><p>${group.subtitle}</p></div><span class="phase-count">${FUTURE_FEATURES.filter(f=>f.phase===group.id).length} ideas</span></div><div class="future-grid">${FUTURE_FEATURES.filter(f=>f.phase===group.id).map(featureCard).join('')}</div></section>`).join('')}
      <section class="roadmap-tail"><div class="roadmap-tail-icon">✦</div><div><h2>Made for makers, not paywalls.</h2><p>Core tools and future accounts are intended to be free to use. The commission area will connect people with creators, not process payments. Artists may still charge for their own work independently.</p></div><button class="btn btn-secondary" data-action="go-characters">Back to the forge →</button></section>`;
  }
  function charCard(c){
    return `<article class="creation-card"><div class="character-image">${safeImage(c.image)?`<img src="${safeImage(c.image)}" alt="Portrait of ${esc(c.name)}">`:`<span class="fallback-initial">${esc(c.name.slice(0,1).toUpperCase())}</span>`}<span class="corner-type">${esc(c.kind||'Character')}</span></div><div class="creation-body"><h3>${esc(c.name)}</h3><div class="details">${esc(c.species||'Unknown species')} · ${esc(worldName(c.worldId))}</div><p>${esc(excerpt(c.description))}</p><div class="pill-line" style="margin-bottom:13px">${tagList(c.tags).slice(0,2).map(t=>typeTag(t)).join('')}</div><div class="creation-footer"><button class="icon-action" data-action="edit-character" data-id="${esc(c.id)}">Edit</button><button class="icon-action" data-action="set-pfp" data-id="${esc(c.id)}">Use as PFP</button><button class="icon-action" data-action="download-pfp" data-id="${esc(c.id)}" ${safeImage(c.image)?'':'disabled'}>Download PFP</button><button class="icon-action" data-action="delete-character" data-id="${esc(c.id)}" aria-label="Delete ${esc(c.name)}">✕</button></div></div></article>`;
  }
  function characterPage(){return `<div class="page-heading"><div><div class="page-eyebrow">CHARACTER VAULT</div><h1>Your characters</h1><p>Fursonas, OCs, NPCs — every personality deserves a story.</p></div><button class="btn btn-primary" data-action="new-character">+ New character</button></div>${db.characters.length?`<div class="card-grid">${db.characters.map(charCard).join('')}</div>`:empty('✦','A blank page full of possibilities','Create your first fursona, OC, or any character you can imagine.','new-character','Create a character')}`;}
  const empty=(symbol,title,detail,action,button)=>`<div class="empty-state"><div class="empty-art">${symbol}</div><h3>${title}</h3><p>${detail}</p><button class="btn btn-primary" data-action="${action}">+ ${button}</button></div>`;
  function worldPage(){
    if(currentWorldId){const w=db.worlds.find(v=>v.id===currentWorldId);if(w)return worldDetailPage(w);currentWorldId=null;}
    return `<div class="page-heading"><div><div class="page-eyebrow">THE WORLD SMITHY</div><h1>Worlds & lore</h1><p>Build civilizations, write histories, and connect your characters to something bigger.</p></div><button class="btn btn-primary" data-action="new-world">+ Create world</button></div>${db.worlds.length?`<div class="card-grid">${db.worlds.map(w=>`<article class="creation-card"><div class="world-banner"><span class="world-symbol">◈</span></div><div class="world-body"><h3>${esc(w.name)}</h3><div class="pill-line">${typeTag(w.genre)}${w.mood?typeTag(w.mood):''}</div><p>${esc(excerpt(w.description))}</p><div class="creation-footer"><button class="icon-action" data-action="open-world" data-id="${esc(w.id)}">Open lore →</button><button class="icon-action" data-action="edit-world" data-id="${esc(w.id)}">Edit</button><button class="icon-action" data-action="delete-world" data-id="${esc(w.id)}">✕</button></div></div></article>`).join('')}</div>`:empty('◈','A universe is waiting','Sketch a setting, write its history, and populate it with your characters.','new-world','Create a world')}`;
  }
  function worldDetailPage(w){
    return `<div class="page-heading"><div><div class="page-eyebrow">WORLD / ${esc(w.genre||'YOUR WORLD')}</div><h1>${esc(w.name)}</h1><p>${esc(w.mood||'The story is yours to tell')} · ${(w.lore||[]).length} lore entries · ${db.characters.filter(c=>c.worldId===w.id).length} linked characters</p></div><div class="heading-actions"><button class="btn btn-secondary" data-action="back-worlds">← All worlds</button><button class="btn btn-secondary" data-action="edit-world" data-id="${esc(w.id)}">Edit world</button></div></div><section class="world-detail-banner"><div class="world-detail-meta">${typeTag(w.genre)}${w.mood?typeTag(w.mood):''}</div><h2>The story so far</h2><p>${esc(w.description||'Add a world description to begin.')}</p></section><div class="section-title-row"><h2>World encyclopedia</h2><button class="btn btn-primary btn-small" data-action="new-lore" data-id="${esc(w.id)}">+ New lore entry</button></div>${(w.lore||[]).length?`<div class="lore-list">${w.lore.map(entry=>`<article class="lore-entry"><span class="tag amber">${esc(entry.category||'Lore')}</span><h3>${esc(entry.title)}</h3><p>${esc(entry.body)}</p><div class="split-tools"><button class="icon-action" data-action="edit-lore" data-id="${esc(w.id)}" data-entry="${esc(entry.id)}">Edit entry</button><button class="icon-action" data-action="delete-lore" data-id="${esc(w.id)}" data-entry="${esc(entry.id)}">Delete</button></div></article>`).join('')}</div>`:empty('✎','Your legend is unwritten','Add locations, cultures, timelines, species, factions, or anything you can imagine.','new-lore','Add lore')}`;
  }
  function atlasPage(){
    const m=db.maps.find(m=>m.id===activeMapId)||db.maps[0];if(m)activeMapId=m.id;
    return `<div class="page-heading"><div><div class="page-eyebrow">THE CARTOGRAPHER'S TABLE</div><h1>Map maker</h1><p>Paint the lands of your fictional worlds, one tile at a time.</p></div><button class="btn btn-primary" data-action="new-map">+ New map</button></div>${db.maps.length?`<div class="atlas-shell"><aside class="atlas-side"><h3>My maps</h3><div class="map-list">${db.maps.map(map=>`<button class="map-item ${map.id===activeMapId?'active':''}" data-action="select-map" data-id="${esc(map.id)}">${esc(map.name)}<small>${esc(worldName(map.worldId))}</small></button>`).join('')}</div><button class="btn btn-secondary btn-small" data-action="new-map">+ Add map</button></aside><section class="atlas-main"><div class="map-toolbar"><div><h3>${esc(m.name)}</h3><small class="muted">${esc(worldName(m.worldId))} · ${MAP_W} × ${MAP_H} tiles</small></div><div class="heading-actions"><button class="btn btn-secondary btn-small" data-action="rename-map" data-id="${esc(m.id)}">Rename</button><button class="btn btn-secondary btn-small" data-action="undo-map">↶ Undo</button><button class="btn btn-secondary btn-small" data-action="export-map">↓ PNG</button></div></div><div class="map-canvas-wrap"><canvas id="world-map" class="map-canvas" width="${MAP_W*TILE}" height="${MAP_H*TILE}" role="img" aria-label="Interactive map. Choose a terrain brush and tap or drag to paint tiles."></canvas></div><div class="palette-heading">TERRAIN BRUSHES</div><div class="palette">${TERRAINS.map(t=>`<button type="button" class="brush ${selectedBrush===t.key?'active':''}" data-action="brush" data-brush="${t.key}"><i class="brush-dot" style="background:${t.color}"></i>${t.label}</button>`).join('')}</div><p class="tip">Tip: Click, drag, or use your finger to draw. Maps save automatically on this device.</p><div class="divider"></div><div class="stack-line"><button class="btn btn-secondary btn-small" data-action="clear-map">Clear to grassland</button><button class="btn btn-danger btn-small" data-action="delete-map" data-id="${esc(m.id)}">Delete map</button></div></section></div>`:empty('▦','Draw a new world','Start with a blank map and paint seas, mountains, forests, towns, and more.','new-map','Create a map')}`;
  }
  const sampleCreators = [
    {name:'Amberbrush Studio',style:'Expressive character portraits, warm palettes, creature designs',art:'🎨',label:'Character art'},
    {name:'Moonlit Sketchbook',style:'Fantasy character sheets and original-world illustrations',art:'🌙',label:'Concept art'},
    {name:'Wildwood Cartography',style:'Storybook landscapes, world maps, and imagined places',art:'🌿',label:'World art'}
  ];
  function commissionPage(){return `<div class="page-heading"><div><div class="page-eyebrow">CREATOR CONNECTIONS</div><h1>Commissions</h1><p>Bring your character to life with artists and creators.</p></div><button class="btn btn-primary" data-action="new-brief">+ Write an art brief</button></div><div class="commission-top"><div class="commission-top-icon">◉</div><div><h3>Commission hub · Preview</h3><p>Artist profiles and direct creator messaging will become available when public accounts and moderation are ready. For now, save a commission brief here or copy it to share yourself. Using Fursona Forge will be free.</p></div></div><div class="section-title-row"><h2>My commission briefs</h2><button class="link-button" data-action="new-brief">Create brief +</button></div>${db.briefs.length?`<div class="commission-list" style="margin-bottom:33px">${db.briefs.map(b=>`<article class="commission-card"><div class="commission-card-top"><div class="studio-avatar">✎</div><div><h3>${esc(b.title)}</h3><small>${esc(b.format||'Art request')} · Saved locally</small></div></div><p>${esc(excerpt(b.description,190))}</p><div class="commission-actions"><span class="tag mint">Draft</span><div class="split-tools"><button class="icon-action" data-action="copy-brief" data-id="${esc(b.id)}">Copy</button><button class="icon-action" data-action="edit-brief" data-id="${esc(b.id)}">Edit</button><button class="icon-action" data-action="delete-brief" data-id="${esc(b.id)}">✕</button></div></div></article>`).join('')}</div>`:`<div class="panel" style="margin-bottom:32px"><p class="secondary-description" style="margin:0">You haven't written a commission brief yet. Explain your character, the artwork you have in mind, and any reference details, then save it for later.</p></div>`}<div class="section-title-row"><h2>Meet the makers</h2><span class="example-label">FICTIONAL PREVIEW PROFILES</span></div><div class="card-grid">${sampleCreators.map(s=>`<article class="commission-card"><div class="commission-card-top"><div class="studio-avatar">${s.art}</div><div><h3>${s.name}</h3><small>${s.label}</small></div></div><p>${s.style}</p><div class="commission-actions"><span class="tag">Demo profile</span><button class="btn btn-secondary btn-small" data-action="account-info">Messaging coming soon</button></div></article>`).join('')}</div>`;}
  function profilePage(){
    const selected=profileCharacter();
    return `<div class="page-heading"><div><div class="page-eyebrow">YOUR CORNER OF THE FORGE</div><h1>Profile & backup</h1><p>Make the workspace yours and protect your creations.</p></div><span class="local-badge">● Guest mode · Local only</span></div><div class="profile-grid"><section class="profile-section"><h2>Your profile</h2><div class="avatar-large">${selected?avatarFor(selected):esc((db.profile.name||'G').slice(0,1))}</div><form id="profile-form" data-form="profile"><div class="form-field"><label for="profile-name">Display name</label><input id="profile-name" name="name" value="${esc(db.profile.name)}" maxlength="50" required /></div><div class="form-field"><label for="profile-pfp">Profile picture (from a character)</label><select name="pfpId" id="profile-pfp"><option value="">Default initial</option>${db.characters.map(c=>`<option value="${esc(c.id)}" ${db.profile.pfpId===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select><small>Upload a portrait in a character's editor to use that artwork as your avatar.</small></div><button class="btn btn-primary" type="submit">Save profile</button></form><div class="divider"></div><h3>Future account</h3><p>A free account will eventually let you sync across devices and message creators. Guest mode works without signing up.</p><button class="btn btn-secondary btn-small" data-action="account-info">See account plans →</button></section><section class="section-stack"><section class="profile-section"><h2>Back up your creations</h2><p>Guest creations are saved to this device and browser. Clearing browser data can erase them. Export a backup regularly.</p><div class="notice mint"><strong>Your work belongs to you.</strong> Export characters, world lore, maps, and briefs as a JSON file. You can import that file into Fursona Forge on another device.</div><div class="backup-actions"><button class="btn btn-primary" data-action="export-backup">↓ Export backup</button><label class="btn btn-secondary" for="import-backup">↑ Import backup</label><input type="file" id="import-backup" accept="application/json,.json" hidden /></div><div class="help-chip">Import replaces the creations on this browser. Export your existing work first.</div></section><section class="profile-section"><h2>Your data & privacy</h2><p>No sign-in, tracking system, or cloud upload is required by this starter site. Your text and uploaded image thumbnails remain in your browser's storage.</p><div class="stack-line"><button class="btn btn-danger btn-small" data-action="clear-data">Clear all local creations</button></div></section></section></div>`;
  }
  function searchPage(){const q=searchQuery.toLowerCase().trim();const chars=db.characters.filter(c=>[c.name,c.species,c.description,c.tags,c.role].join(' ').toLowerCase().includes(q)),worlds=db.worlds.filter(w=>[w.name,w.genre,w.description].join(' ').toLowerCase().includes(q));return `<div class="page-heading"><div><div class="page-eyebrow">SEARCH THE FORGE</div><h1>Search results</h1><p>Looking for “${esc(searchQuery)}” in your locally saved creations.</p></div></div><p class="search-summary">${chars.length} characters and ${worlds.length} worlds found.</p>${chars.length?`<h2 class="sub-heading">Characters</h2><div class="card-grid">${chars.map(charCard).join('')}</div>`:''}${worlds.length?`<h2 class="sub-heading">Worlds</h2><div class="card-grid">${worlds.map(w=>`<article class="creation-card"><div class="world-body"><h3>${esc(w.name)}</h3><p>${esc(excerpt(w.description))}</p><button class="btn btn-secondary btn-small" data-action="open-world" data-id="${esc(w.id)}">Open world →</button></div></article>`).join('')}</div>`:''}${!chars.length&&!worlds.length?empty('⌕','No matches found','Try a character name, species, genre, or phrase from your lore.','new-character','Make a character'):''}`;}
  const worldOptions=(chosen)=>`<option value="">None (standalone)</option>${db.worlds.map(w=>`<option value="${esc(w.id)}" ${w.id===chosen?'selected':''}>${esc(w.name)}</option>`).join('')}`;
  function openModal(title, body, footer=''){
    modalRoot.innerHTML=`<div class="modal-overlay" id="modal-overlay"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><h2>${esc(title)}</h2><button type="button" class="icon-button" data-action="close-modal" aria-label="Close dialog">✕</button></div>${body}${footer}</section></div>`;
    const input=modalRoot.querySelector('input:not([type="file"]),textarea,select,button');if(input)input.focus();
  }
  function closeModal(){modalRoot.innerHTML='';}
  const modalButtons=(label)=>`<div class="modal-footer"><button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">${label}</button></div>`;
  function characterForm(id){
    const c=id?db.characters.find(x=>x.id===id):null;if(id&&!c)return;
    openModal(c?'Edit character':'Forge a new character',`<form data-form="character" data-id="${esc(c?.id||'')}"><div class="form-grid"><div class="form-field"><label for="cname">Character name *</label><input id="cname" name="name" maxlength="75" required value="${esc(c?.name||'')}" placeholder="What do they go by?" /></div><div class="form-field"><label for="cspecies">Species</label><input id="cspecies" name="species" maxlength="75" value="${esc(c?.species||'')}" placeholder="Wolf, dragon, human..." /></div><div class="form-field"><label for="ckind">Character type</label><select id="ckind" name="kind">${['Fursona','Original Character','NPC','Other'].map(v=>`<option ${c?.kind===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="form-field"><label for="cworld">World</label><select id="cworld" name="worldId">${worldOptions(c?.worldId)}</select></div><div class="form-field"><label for="crole">Role or title</label><input id="crole" name="role" maxlength="75" value="${esc(c?.role||'')}" placeholder="Explorer, student, knight..." /></div><div class="form-field"><label for="cpronouns">Pronouns</label><input id="cpronouns" name="pronouns" maxlength="50" value="${esc(c?.pronouns||'')}" placeholder="Optional" /></div></div><div class="form-field"><label for="ctags">Tags (comma separated)</label><input id="ctags" name="tags" maxlength="160" value="${esc(c?.tags||'')}" placeholder="mysterious, friendly, forest guardian" /></div><div class="form-field"><label for="cdescription">Background, personality & lore</label><textarea id="cdescription" name="description" maxlength="18000" rows="5" placeholder="Tell their story...">${esc(c?.description||'')}</textarea></div><div class="form-field"><label for="cimage">Character portrait / PFP artwork</label><div class="upload-row"><div id="portrait-preview" class="avatar-preview">${c?avatarFor(c):'✦'}</div><div style="min-width:0;flex:1"><input class="file-input" id="cimage" type="file" name="image" accept="image/png,image/jpeg,image/webp"/><small>PNG, JPG or WebP. The image is resized for local storage. Please only upload art you have permission to use.</small></div></div></div>${modalButtons(c?'Save changes':'Create character')}</form>`);
    const input=modalRoot.querySelector('#cimage');input?.addEventListener('change',()=>{const file=input.files?.[0];if(file){const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{const preview=document.getElementById('portrait-preview');if(preview)preview.innerHTML=`<img src="${url}" alt="Portrait preview">`;URL.revokeObjectURL(url);};img.src=url;}});
  }
  function worldForm(id){const w=id?db.worlds.find(x=>x.id===id):null;
    openModal(w?'Edit world':'Create a new world',`<form data-form="world" data-id="${esc(w?.id||'')}"><div class="form-field"><label for="wname">World name *</label><input id="wname" name="name" maxlength="90" required value="${esc(w?.name||'')}" placeholder="The Starfall Kingdoms" /></div><div class="form-grid"><div class="form-field"><label for="wgenre">Genre</label><input id="wgenre" name="genre" maxlength="65" value="${esc(w?.genre||'')}" placeholder="Fantasy, sci-fi..." /></div><div class="form-field"><label for="wmood">Mood / atmosphere</label><input id="wmood" name="mood" maxlength="65" value="${esc(w?.mood||'')}" placeholder="Cozy, haunting, epic..." /></div></div><div class="form-field"><label for="wdescription">World overview</label><textarea id="wdescription" name="description" maxlength="24000" rows="7" placeholder="Where does your world exist? What makes it different?">${esc(w?.description||'')}</textarea></div>${modalButtons(w?'Save world':'Build world')}</form>`);
  }
  function loreForm(worldId,entryId){const w=db.worlds.find(w=>w.id===worldId);if(!w)return;const entry=entryId?(w.lore||[]).find(x=>x.id===entryId):null;
    openModal(entry?'Edit lore entry':'Add to the encyclopedia',`<form data-form="lore" data-id="${esc(worldId)}" data-entry="${esc(entry?.id||'')}"><div class="form-field"><label for="lcategory">Category</label><select id="lcategory" name="category">${['History','Locations','Cultures','Species','Factions','Magic','Technology','Timeline','Legends','Other'].map(x=>`<option ${entry?.category===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="form-field"><label for="ltitle">Title *</label><input id="ltitle" name="title" maxlength="120" required value="${esc(entry?.title||'')}" placeholder="The Great Migration" /></div><div class="form-field"><label for="lbody">Lore</label><textarea id="lbody" name="body" rows="10" maxlength="35000" placeholder="Write freely...">${esc(entry?.body||'')}</textarea></div>${modalButtons(entry?'Save lore':'Add entry')}</form>`);
  }
  function mapForm(id){const m=id?db.maps.find(m=>m.id===id):null;openModal(m?'Map settings':'Create a new map',`<form data-form="map" data-id="${esc(m?.id||'')}"><div class="form-field"><label for="mname">Map title *</label><input id="mname" name="name" maxlength="90" required value="${esc(m?.name||'')}" placeholder="Northern Kingdom" /></div><div class="form-field"><label for="mworld">Belongs to world</label><select name="worldId" id="mworld">${worldOptions(m?.worldId)}</select></div>${modalButtons(m?'Save settings':'Make map')}</form>`);}
  function briefForm(id){const b=id?db.briefs.find(b=>b.id===id):null;openModal(b?'Edit commission brief':'Plan an art commission',`<form data-form="brief" data-id="${esc(b?.id||'')}"><div class="form-field"><label for="btitle">Brief title *</label><input name="title" id="btitle" required maxlength="100" value="${esc(b?.title||'')}" placeholder="Full-body portrait of my character" /></div><div class="form-grid"><div class="form-field"><label for="bformat">Artwork type</label><select name="format" id="bformat">${['Character portrait','Reference sheet','Illustration','World map','Character design','Other'].map(o=>`<option ${b?.format===o?'selected':''}>${o}</option>`).join('')}</select></div><div class="form-field"><label for="bcharacter">Character</label><select name="characterId" id="bcharacter"><option value="">No specific character</option>${db.characters.map(c=>`<option value="${esc(c.id)}" ${c.id===b?.characterId?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div></div><div class="form-field"><label for="bdescription">Describe your idea</label><textarea name="description" id="bdescription" rows="6" maxlength="15000" placeholder="Pose, colors, mood, key details...">${esc(b?.description||'')}</textarea></div><div class="form-field"><label for="breferences">Reference notes</label><textarea name="references" id="breferences" rows="3" maxlength="8000" placeholder="Reference images you own or have permission to share, and any details for the artist...">${esc(b?.references||'')}</textarea></div><div class="notice">This saves a private draft on your device. It does not send a message or place a real commission.</div>${modalButtons(b?'Save brief':'Save brief')}</form>`);}
  function accountInfo(){openModal('Free accounts — planned',`<div class="notice mint"><strong>Forever free to use.</strong> Character creation, worlds, maps, and community features are planned as free features with no platform paywall.</div><p class="secondary-description">You can create and save characters right now without an account. In this starter version, creations are local to this browser.</p><h3>What comes next</h3><p class="secondary-description">Free account sign-up, private cloud syncing, public creator profiles, and safe, moderated commission messaging. Those online services are not active in this downloadable prototype.</p><p class="secondary-description">Artists can decide their own terms for creative work, but Fursona Forge won't charge for accessing the platform.</p><div class="modal-footer"><button class="btn btn-primary" data-action="close-modal">Got it</button></div>`);}
  function fileDownload(filename,blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}
  function setupMapCanvas(){
    const canvas=document.getElementById('world-map');const m=db.maps.find(m=>m.id===activeMapId);if(!canvas||!m)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    drawMap(ctx,m);
    let drawing=false,changed=false,lastIdx=-1;
    const paint=e=>{const rect=canvas.getBoundingClientRect();const x=Math.floor((e.clientX-rect.left)*canvas.width/rect.width/TILE),y=Math.floor((e.clientY-rect.top)*canvas.height/rect.height/TILE);if(x<0||y<0||x>=MAP_W||y>=MAP_H)return;const idx=y*MAP_W+x;if(idx===lastIdx)return;lastIdx=idx;if(m.tiles[idx]!==selectedBrush){m.tiles[idx]=selectedBrush;changed=true;drawMap(ctx,m);}};
    canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drawing=true;changed=false;lastIdx=-1;undo.push([...m.tiles]);if(undo.length>35)undo.shift();canvas.setPointerCapture(e.pointerId);paint(e);});
    canvas.addEventListener('pointermove',e=>{if(drawing)paint(e);});
    const finish=()=>{if(drawing){drawing=false;if(changed){persist();}else{undo.pop();}}};
    canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);canvas.addEventListener('lostpointercapture',finish);
  }
  function drawMap(ctx,m){
    ctx.clearRect(0,0,MAP_W*TILE,MAP_H*TILE);
    const colors=Object.fromEntries(TERRAINS.map(t=>[t.key,t.color]));
    for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
      const k=m.tiles[y*MAP_W+x]||'grass',px=x*TILE,py=y*TILE;
      ctx.fillStyle=colors[k]||colors.grass;ctx.fillRect(px,py,TILE,TILE);
      const n=((x*53+y*97)%7);ctx.fillStyle='#ffffff0c';ctx.fillRect(px+4+n,py+6+(n*2)%10,3,3);
      if(k==='water'){ctx.strokeStyle='#b0dce54d';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px+6,py+14);ctx.quadraticCurveTo(px+13,py+10,px+19,py+14);ctx.stroke();}
      if(k==='forest'){ctx.fillStyle='#255740';ctx.beginPath();ctx.moveTo(px+16,py+6);ctx.lineTo(px+5,py+24);ctx.lineTo(px+27,py+24);ctx.fill();ctx.fillStyle='#d5e3b94d';ctx.fillRect(px+15,py+23,2,5);}
      if(k==='mountain'){ctx.fillStyle='#636c7b';ctx.beginPath();ctx.moveTo(px+3,py+27);ctx.lineTo(px+16,py+6);ctx.lineTo(px+29,py+27);ctx.fill();ctx.fillStyle='#e5e9e5';ctx.beginPath();ctx.moveTo(px+16,py+6);ctx.lineTo(px+10,py+16);ctx.lineTo(px+16,py+14);ctx.lineTo(px+21,py+17);ctx.fill();}
      if(k==='town'){ctx.fillStyle='#684a4a';ctx.fillRect(px+9,py+16,14,12);ctx.beginPath();ctx.moveTo(px+5,py+17);ctx.lineTo(px+16,py+7);ctx.lineTo(px+27,py+17);ctx.fill();ctx.fillStyle='#ffca8a';ctx.fillRect(px+15,py+21,4,7);}
      if(k==='desert'){ctx.strokeStyle='#f1d29b88';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px+16,py+22,9,Math.PI,Math.PI*2);ctx.stroke();}
      ctx.strokeStyle='#11162222';ctx.lineWidth=.5;ctx.strokeRect(px+.25,py+.25,TILE,TILE);
    }
  }
  function confirmDelete(message){return window.confirm(message);}
  function closeMobile(){document.getElementById('sidebar').classList.remove('open');document.getElementById('mobile-backdrop').hidden=true;document.getElementById('mobile-nav-toggle').setAttribute('aria-expanded','false');}
  async function fileToPortrait(file){
    if(!file)return null;if(file.size>12*1024*1024)throw Error('Choose a picture smaller than 12 MB.');
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Please upload a PNG, JPG or WebP image.');
    const objectUrl=URL.createObjectURL(file);
    try{
      const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Could not open that image.'));i.src=objectUrl;});
      const out=document.createElement('canvas');const max=480;const scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));out.width=Math.max(1,Math.round(img.naturalWidth*scale));out.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=out.getContext('2d');ctx.drawImage(img,0,0,out.width,out.height);return out.toDataURL('image/jpeg',.76);
    }finally{URL.revokeObjectURL(objectUrl);}
  }
  function backup(){fileDownload(`fursona-forge-backup-${new Date().toISOString().slice(0,10)}.json`,new Blob([JSON.stringify({app:'Fursona Forge',version:1,...db},null,2)],{type:'application/json'}));toast('Backup downloaded. Keep it somewhere safe.');}
  function exportMap(){const c=document.getElementById('world-map');if(!c)return;const m=db.maps.find(x=>x.id===activeMapId);c.toBlob(blob=>{if(blob)fileDownload(`${(m?.name||'fursona-forge-map').replace(/[^a-z0-9 _-]/gi,'').replace(/\s+/g,'-')}.png`,blob);},'image/png');}
  function copyBrief(id){const b=db.briefs.find(b=>b.id===id);if(!b)return;const c=db.characters.find(c=>c.id===b.characterId);const content=`${b.title}\nArtwork type: ${b.format}\nCharacter: ${c?.name||'Not specified'}\n\nIdea:\n${b.description}\n\nReference notes:\n${b.references}`;
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(content).then(()=>toast('Commission brief copied.')).catch(()=>fallbackCopy(content));}else fallbackCopy(content);
  }
  function fallbackCopy(content){const input=document.createElement('textarea');input.value=content;document.body.appendChild(input);input.select();try{document.execCommand('copy');toast('Commission brief copied.');}catch(e){toast('Copy was blocked by the browser.');}input.remove();}
  document.addEventListener('click',event=>{
    if(event.target?.id==='modal-overlay'){closeModal();return;}
    const button=event.target.closest('[data-action]');if(!button)return;
    const {action,id,entry,brush}=button.dataset;
    switch(action){
      case 'new-character':characterForm();break;case 'edit-character':characterForm(id);break;
      case 'delete-character':{const c=db.characters.find(c=>c.id===id);if(c&&confirmDelete(`Delete ${c.name}? This cannot be undone.`)){db.characters=db.characters.filter(x=>x.id!==id);if(db.profile.pfpId===id)db.profile.pfpId='';persist();render();toast('Character deleted.');}break;}
      case 'set-pfp':db.profile.pfpId=id;persist();topProfile();toast('Character selected as your profile picture.');break;
      case 'download-pfp':{const c=db.characters.find(x=>x.id===id);if(c&&safeImage(c.image)){const a=document.createElement('a');a.href=c.image;a.download=`${c.name.replace(/[^a-z0-9_-]/gi,'-')}-avatar.jpg`;document.body.appendChild(a);a.click();a.remove();}break;}
      case 'new-world':worldForm();break;case 'edit-world':worldForm(id);break;
      case 'open-world':currentWorldId=id;navigate('worlds');break;
      case 'back-worlds':currentWorldId=null;render();break;
      case 'delete-world':{const w=db.worlds.find(x=>x.id===id);if(w&&confirmDelete(`Delete ${w.name} and its lore entries? Linked characters and maps will become standalone.`)){db.worlds=db.worlds.filter(x=>x.id!==id);db.characters.forEach(c=>{if(c.worldId===id)c.worldId='';});db.maps.forEach(m=>{if(m.worldId===id)m.worldId='';});currentWorldId=null;persist();render();toast('World deleted.');}break;}
      case 'new-lore':loreForm(id||currentWorldId);break;case 'edit-lore':loreForm(id,entry);break;
      case 'delete-lore':{const w=db.worlds.find(x=>x.id===id);if(w&&confirmDelete('Delete this lore entry?')){w.lore=w.lore.filter(x=>x.id!==entry);persist();render();}break;}
      case 'new-map':mapForm();break;case 'rename-map':mapForm(id);break;
      case 'select-map':activeMapId=id;undo=[];render();break;
      case 'brush':selectedBrush=brush;document.querySelectorAll('.brush').forEach(b=>b.classList.toggle('active',b.dataset.brush===brush));break;
      case 'undo-map':{const m=db.maps.find(m=>m.id===activeMapId);if(m&&undo.length){m.tiles=undo.pop();persist();setupCanvasRedraw();}else toast('Nothing to undo.');break;}
      case 'clear-map':{const m=db.maps.find(x=>x.id===activeMapId);if(m&&confirmDelete('Paint this entire map as grassland?')){undo.push([...m.tiles]);m.tiles=Array(MAP_W*MAP_H).fill('grass');persist();setupCanvasRedraw();toast('Map cleared.');}break;}
      case 'delete-map':{const m=db.maps.find(x=>x.id===id);if(m&&confirmDelete(`Delete ${m.name}?`)){db.maps=db.maps.filter(x=>x.id!==id);activeMapId=db.maps[0]?.id||'';undo=[];persist();render();}break;}
      case 'export-map':exportMap();break;
      case 'new-brief':briefForm();break;case 'edit-brief':briefForm(id);break;case 'copy-brief':copyBrief(id);break;
      case 'delete-brief':if(confirmDelete('Delete this saved commission brief?')){db.briefs=db.briefs.filter(x=>x.id!==id);persist();render();}break;
      case 'toggle-wishlist':{
        const feature=FUTURE_FEATURES.find(f=>f.id===id);
        if(!feature)break;
        wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];
        if(saveWishlist())render();
        break;}
      case 'go-roadmap':navigate('roadmap');break;
      case 'go-profile':navigate('profile');break;case 'go-characters':navigate('characters');break;case 'go-worlds':currentWorldId=null;navigate('worlds');break;case 'go-atlas':navigate('atlas');break;case 'go-commissions':navigate('commissions');break;
      case 'account-info':accountInfo();break;case 'close-modal':closeModal();break;
      case 'export-backup':backup();break;
      case 'clear-data':if(confirmDelete('Permanently clear all characters, worlds, maps, commission briefs, and profile settings from this browser? Export a backup first.')){db={characters:[],worlds:[],maps:[],briefs:[],profile:{name:'Guest Creator',pfpId:''}};currentWorldId=null;activeMapId='';undo=[];persist();render();toast('Local workspace cleared.');}break;
    }
  });
  function setupCanvasRedraw(){const canvas=document.getElementById('world-map'),m=db.maps.find(m=>m.id===activeMapId);if(canvas&&m)drawMap(canvas.getContext('2d'),m);}
  document.addEventListener('submit',async e=>{
    if(e.target.id==='global-search-form'){e.preventDefault();searchQuery=document.getElementById('global-search').value.trim();if(searchQuery)navigate('search');else toast('Enter something to search for.');return;}
    const form=e.target;if(!form.dataset.form)return;e.preventDefault();
    const data=new FormData(form),value=(k)=>String(data.get(k)||'').trim(),id=form.dataset.id;
    const submit=form.querySelector('[type=submit]');if(submit)submit.disabled=true;
    try{
      switch(form.dataset.form){
        case 'character':{
          const prev=db.characters.find(x=>x.id===id);const input=form.querySelector('input[type=file]');let image=prev?.image||'';
          if(input?.files?.[0])image=await fileToPortrait(input.files[0]);
          const item={id:prev?.id||uid(),name:value('name'),species:value('species'),kind:value('kind'),role:value('role'),pronouns:value('pronouns'),worldId:value('worldId'),tags:value('tags'),description:value('description'),image};
          if(!item.name)throw Error('Your character needs a name.');if(prev)Object.assign(prev,item);else db.characters.unshift(item);
          if(!persist())throw Error('Your character could not be saved because the browser storage is full.');toast(prev?'Character updated!':'A new character joins the forge!');break;}
        case 'world':{
          const prev=db.worlds.find(x=>x.id===id);const item={id:prev?.id||uid(),name:value('name'),genre:value('genre'),mood:value('mood'),description:value('description'),lore:prev?.lore||[]};
          if(!item.name)throw Error('Please name your world.');if(prev)Object.assign(prev,item);else db.worlds.unshift(item);persist();toast('World saved.');break;}
        case 'lore':{
          const w=db.worlds.find(x=>x.id===id);if(!w)throw Error('World not found.');w.lore=w.lore||[];const prev=w.lore.find(x=>x.id===form.dataset.entry);const item={id:prev?.id||uid(),title:value('title'),category:value('category'),body:value('body')};if(prev)Object.assign(prev,item);else w.lore.unshift(item);persist();toast('Lore saved.');break;}
        case 'map':{
          const prev=db.maps.find(x=>x.id===id);const item={id:prev?.id||uid(),name:value('name'),worldId:value('worldId'),tiles:prev?.tiles||Array(MAP_W*MAP_H).fill('grass')};
          if(!item.name)throw Error('Name your map.');if(prev)Object.assign(prev,item);else db.maps.unshift(item);activeMapId=item.id;undo=[];persist();toast('Map ready to paint!');break;}
        case 'brief':{
          const prev=db.briefs.find(x=>x.id===id);const item={id:prev?.id||uid(),title:value('title'),format:value('format'),characterId:value('characterId'),description:value('description'),references:value('references')};if(prev)Object.assign(prev,item);else db.briefs.unshift(item);persist();toast('Commission draft saved locally.');break;}
        case 'profile':db.profile.name=value('name')||'Guest Creator';db.profile.pfpId=value('pfpId');persist();toast('Profile updated.');break;
      }
      closeModal();render();
    }catch(error){toast(error.message||'Could not save.');if(submit)submit.disabled=false;}
  });
  document.addEventListener('change',async e=>{
    if(e.target.id!=='import-backup')return;const file=e.target.files?.[0];if(!file)return;
    try{
      if(file.size>20*1024*1024)throw Error('Backup file too large (max 20 MB).');
      const parsed=validateData(JSON.parse(await file.text()));
      if(!confirmDelete('Importing this file replaces ALL creations on this device. Have you exported a backup first?'))return;
      db=parsed;activeMapId=db.maps[0]?.id||'';currentWorldId=null;undo=[];persist();render();toast('Backup imported successfully.');
    }catch(error){toast(error.message||'Could not read backup.');}finally{e.target.value='';}
  });
  window.addEventListener('hashchange',()=>{if(route()==='worlds'&&location.hash==='#worlds'){}else if(route()!=='worlds')currentWorldId=null;closeModal();render();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeMobile();}});
  document.getElementById('mobile-nav-toggle').addEventListener('click',()=>{const s=document.getElementById('sidebar'),open=!s.classList.contains('open');s.classList.toggle('open',open);document.getElementById('mobile-backdrop').hidden=!open;document.getElementById('mobile-nav-toggle').setAttribute('aria-expanded',String(open));});
  document.getElementById('mobile-backdrop').addEventListener('click',closeMobile);
  document.querySelectorAll('#primary-nav a, .sidebar nav a').forEach(a=>a.addEventListener('click',()=>{if(a.dataset.nav==='worlds')currentWorldId=null;if(location.hash===a.getAttribute('href'))render();}));
  if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('Offline mode unavailable:',e));
  render();
})();
