(function(){
  'use strict';

  const CONFIG = window.SC_CONFIG || {};
  const CART_KEY = 'sandaruwan_computer_cart_v6';
  const ADMIN_PRODUCTS_KEY = 'sandaruwan_computer_admin_products_v1';
  const LOGO_FALLBACK = 'assets/img/logo.jpg';
  let productsCache = null;
  let quoteProducts = [];

  const CATEGORY_ORDER = [
    'CASING','MOTHERBOARD','PROCESSOR','CPU COOLER','RAM','HARD DISK','SSD','POWER SUPPLY','VGA CARD','MONITOR',
    'KEYBOARD','MOUSE','MOUSE PAD','SPEAKER','HEADSET','RGB CASING FAN','CABLES','OTHER'
  ];
  const CAT_ALIAS = {
    'CASIN':'CASING','CASING':'CASING','CASE':'CASING','PC CASING':'CASING',
    'MOTHERBORD':'MOTHERBOARD','MOTHERBOARD':'MOTHERBOARD','BOARD':'MOTHERBOARD','BORD':'MOTHERBOARD',
    'PROSSR':'PROCESSOR','PROSSOR':'PROCESSOR','PROCESSER':'PROCESSOR','PROCESSOR':'PROCESSOR','CPU':'PROCESSOR',
    'CPU COOLER':'CPU COOLER','CPUCOOLER':'CPU COOLER','COOLER':'CPU COOLER',
    'RAM':'RAM','MEMORY':'RAM','HDD':'HARD DISK','HARD DISK':'HARD DISK','HARDDISK':'HARD DISK','HARD DRIVE':'HARD DISK',
    'SSD':'SSD','POWER SUPPLY':'POWER SUPPLY','POWERSUPPLY':'POWER SUPPLY','PSU':'POWER SUPPLY',
    'VGA':'VGA CARD','VGA CARD':'VGA CARD','GRAPHIC CARD':'VGA CARD','GPU':'VGA CARD',
    'MONITOR':'MONITOR','KEYBORD':'KEYBOARD','KEYBOARD':'KEYBOARD','MOUSE':'MOUSE','MOUSE PAD':'MOUSE PAD','MOUSEPAD':'MOUSE PAD',
    'SPEKER':'SPEAKER','SPEAKER':'SPEAKER','HEDSET':'HEADSET','HEADSET':'HEADSET','RGB CASING FAN':'RGB CASING FAN',
    'CABLE':'CABLES','CABLES':'CABLES','OTHER':'OTHER'
  };
  const STATUS_LABELS = {
    INSTOCK:'Instock',
    'IN STOCK':'Instock',
    OUTOFSTOCK:'Out of stock',
    'OUT OF STOCK':'Out of stock',
    'ONLINE ODERS ONLY':'Online Orders Only',
    'ONLINE ORDERS ONLY':'Online Orders Only',
    ONLINEONLY:'Online Orders Only'
  };
  const GEN_LABELS = ['2ND GEN','3RD GEN','4TH GEN','5TH GEN','6TH GEN','7TH GEN','8TH GEN','9TH GEN','10TH GEN','11TH GEN','12TH GEN','13TH GEN','14TH GEN'];
  const EXTRA_CABLES = [
    {id:'EXTRA-POWER-CABLE', name:'Power Cable', rate:700},
    {id:'EXTRA-VGA-CABLE', name:'VGA Cable', rate:800},
    {id:'EXTRA-HDMI-CABLE', name:'HDMI Cable', rate:1200},
    {id:'EXTRA-DVI-CABLE', name:'DVI Cable', rate:1000}
  ];

  const $ = (s,r=document)=>r.querySelector(s);
  const $all = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const clean = v => (v==null?'':String(v).trim());
  const upper = v => clean(v).toUpperCase();
  const esc = s => clean(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const toNumber = v => { const n = Number(clean(v).replace(/[Rsරු,\s]/g,'')); return Number.isFinite(n)?n:0; };
  const money = n => 'Rs. ' + Number(n||0).toLocaleString('en-LK');
  const keyName = s => clean(s).toLowerCase().replace(/[^a-z0-9]/g,'');
  const slug = s => upper(s).replace(/[^A-Z0-9]/g,'');
  const categoryName = v => CAT_ALIAS[upper(v)] || upper(v) || 'OTHER';
  const isYes = v => ['YES','Y','TRUE','1','SUPPORTED','SUPPORT'].includes(upper(v));
  function getVal(obj, aliases){
    const keys = Object.keys(obj||{});
    for(const a of aliases){
      const ak = keyName(a);
      const k = keys.find(x=>keyName(x)===ak);
      if(k!=null && clean(obj[k])!=='') return clean(obj[k]);
    }
    return '';
  }
  function splitList(v){ return clean(v).split(/\s*\|\s*|\s*,\s*|\s*\/\s*/).map(clean).filter(Boolean); }
  function normalizeStatus(v){
    let s = upper(v||'INSTOCK');
    if(s==='IN STOCK') s='INSTOCK';
    if(s==='ONLINE ODERS ONLY') s='ONLINE ORDERS ONLY';
    if(s==='ONLINE ONLY') s='ONLINE ORDERS ONLY';
    if(s==='OUT OF STOCK') s='OUTOFSTOCK';
    if(s==='OUT OFSTOCK') s='OUTOFSTOCK';
    return s || 'INSTOCK';
  }
  function statusLabel(p){ return STATUS_LABELS[p.status] || STATUS_LABELS[upper(p.status)] || clean(p.status) || 'Instock'; }
  function statusClass(p){ const s=normalizeStatus(p.status); return s==='OUTOFSTOCK'?'out':s.includes('ONLINE')?'online':'instock'; }
  function quoteAllowed(p){ const s=normalizeStatus(p.status); return s==='INSTOCK' || s==='ONLINE ORDERS ONLY'; }
  function productImage(p){ return clean(p.image) || clean(p.imagePath) || LOGO_FALLBACK; }
  function normalizeGen(v){
    const s = upper(v).replace(/[^A-Z0-9]/g,'');
    if(!s) return '';
    const m = s.match(/14|13|12|11|10|[2-9]/);
    return m ? (m[0] + (m[0]==='2'?'ND':m[0]==='3'?'RD':'TH') + ' GEN') : '';
  }
  function normalizeRam(v){ const s=upper(v).replace(/\s+/g,''); return s? s.replace('DDR','DDR') : ''; }
  function normalizeProduct(row, i=0){
    const category = categoryName(getVal(row,['CATEGORY','category']));
    const name = getVal(row,['PRODUCT NAME','name','Product']);
    const mb1 = normalizeGen(getVal(row,['MB GEN OPTION 1','mbGenOption1','MB GEN 1','Board Gen 1']));
    const mb2 = normalizeGen(getVal(row,['MB GEN OPTION 2','mbGenOption2','MB GEN 2','Board Gen 2']));
    const procGen = normalizeGen(getVal(row,['PROCESSOR GEN','processorGen','PROSSOR GEN','CPU GEN','GEN']));
    const ramSlot1 = upper(getVal(row,['RAM SLOT OPTION 1','ramSlotOption1','RAM SLOT 1','RAM SLOT']));
    const ramSlot2 = upper(getVal(row,['RAM SLOT OPTION 2','ramSlotOption2','RAM SLOT 2']));
    const ssdSupportRaw = upper(getVal(row,['SSD SUPPORT','ssdSupport','STORAGE SUPPORT']));
    const ssdTypeRaw = upper(getVal(row,['SSD TYPE','ssdType','STORAGE TYPE']));
    const p = {
      id: getVal(row,['PRODUCT ID','id']) || ('ITEM-'+(i+1)),
      name: name || 'Product',
      category,
      condition: upper(getVal(row,['CONDITION','condition'])) || 'USED',
      status: normalizeStatus(getVal(row,['STATUS','status','AVAILABILITY','availability'])),
      price: toNumber(getVal(row,['PRICE','price','Rate'])),
      image: getVal(row,['IMAGE PATH','IMAGE','image','imagePath','imageUrl']),
      brand: getVal(row,['BRAND','brand']),
      model: getVal(row,['MODEL / SERIES','MODEL','SERIES','model','type']),
      mbGen1: mb1,
      mbGen2: mb2,
      mbGens: [mb1,mb2].filter(Boolean),
      processorGen: procGen,
      generation: procGen || mb1,
      generationLabel: [mb1,mb2,procGen].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(' / '),
      ramSupport: normalizeRam(getVal(row,['RAM SUPPORT','RAM','memory','RAM TYPE'])),
      memory: normalizeRam(getVal(row,['RAM SUPPORT','RAM','memory','RAM TYPE'])),
      ramSlotOptions: [ramSlot1,ramSlot2].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i),
      ssdSupport: ssdSupportRaw,
      ssdType: ssdTypeRaw,
      monitorSize: getVal(row,['MONITOR SIZE','SIZE','monitorSize']).replace(/\s*WIDE/i,' WIDE'),
      panelType: upper(getVal(row,['PANEL TYPE','panelType','PANEL'])),
      capacity: getVal(row,['CAPACITY / MEMORY','CAPACITY','MEMORY','capacity','vgaMemory']),
      speed: getVal(row,['SPEED','speed']),
      watt: getVal(row,['WATT','watt']),
      rgb: upper(getVal(row,['RGB','rgb'])) || '',
      socketGen: getVal(row,['SOCKET / GEN','SOCKET','socketGen','socket']),
      warrantyMonths: getVal(row,['WARRANTY MONTHS','warrantyMonths','warranty']),
      stock: getVal(row,['STOCK','stock','qty']),
      description: getVal(row,['DESCRIPTION','description'])
    };
    if(p.condition==='NEW') p.condition='BRAND NEW';
    return p;
  }
  function warrantyText(p){ const m=clean(p.warrantyMonths); return m ? `${m} month${Number(m)===1?'':'s'} warranty` : 'Warranty as available'; }
  function storageType(p){
    const t = upper(p.ssdType || p.storageType || '');
    if(t.includes('NVME')) return 'NVME SSD';
    if(t.includes('M.2') || t.includes('M2')) return 'M.2 SSD';
    if(t.includes('SATA')) return 'SATA SSD';
    return '';
  }
  function storageSupportList(board){
    const s = upper(board?.ssdSupport || '');
    const out = [];
    if(s.includes('SATA')) out.push('SATA SSD');
    if(s.includes('M.2') || s.includes('M2')) out.push('M.2 SSD');
    if(s.includes('NVME')) out.push('NVME SSD');
    if(!out.length) out.push('SATA SSD');
    return out;
  }

  function parseCSV(text){
    if(text.charCodeAt(0)===0xFEFF) text=text.slice(1);
    const rows=[]; let row=[], field='', quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i], n=text[i+1];
      if(c==='"'){ if(quoted && n==='"'){ field+='"'; i++; } else quoted=!quoted; }
      else if(c===',' && !quoted){ row.push(field); field=''; }
      else if((c==='\n'||c==='\r') && !quoted){ if(c==='\r'&&n==='\n') i++; row.push(field); if(row.some(x=>clean(x)!=='')) rows.push(row); row=[]; field=''; }
      else field+=c;
    }
    row.push(field); if(row.some(x=>clean(x)!=='')) rows.push(row);
    if(rows[0] && rows[0][0] && rows[0][0].startsWith('sep=')) rows.shift();
    if(rows.length<2) return [];
    const headers=rows[0].map(clean);
    return rows.slice(1).filter(r=>r.some(x=>clean(x))).map(r=>{ const o={}; headers.forEach((h,i)=>o[h]=clean(r[i])); return o; });
  }
  async function fetchCsvViaGviz(csvUrl){
    const m = csvUrl.match(/\/d\/e\/([^/]+)\//); const gid = (csvUrl.match(/[?&]gid=(\d+)/)||[])[1] || '0';
    if(!m) return [];
    const url = `https://docs.google.com/spreadsheets/d/e/${m[1]}/gviz/tq?tqx=out:json&gid=${gid}&_=${Date.now()}`;
    const res = await fetch(url,{cache:'no-store'}); if(!res.ok) return [];
    let txt = await res.text(); txt = txt.replace(/^.*?google\.visualization\.Query\.setResponse\(/,'').replace(/\);?\s*$/,'');
    const json = JSON.parse(txt); const cols = (json.table.cols||[]).map(c=>clean(c.label||c.id));
    return (json.table.rows||[]).map(r=>{ const o={}; cols.forEach((h,i)=>{ const cell=(r.c||[])[i]; o[h]=cell ? clean(cell.f || cell.v) : ''; }); return o; });
  }
  async function loadProducts(){
    if(productsCache) return productsCache;
    let rows=[]; const csvUrl=clean(CONFIG.sheetCsvUrl);
    if(csvUrl){
      try{ const res=await fetch(csvUrl + (csvUrl.includes('?')?'&':'?') + '_=' + Date.now(), {cache:'no-store'}); if(res.ok) rows=parseCSV(await res.text()); } catch(e){ console.warn('CSV load failed', e); }
      if(!rows.length){ try{ rows=await fetchCsvViaGviz(csvUrl); } catch(e){ console.warn('GViz load failed', e); } }
    }
    if(!rows.length && location.protocol!=='file:'){
      try{ const res=await fetch('data/products.json?_'+Date.now(),{cache:'no-store'}); if(res.ok) rows=await res.json(); }catch(e){}
    }
    if(!rows.length && location.protocol!=='file:'){
      try{ const res=await fetch('data/products.csv?_'+Date.now(),{cache:'no-store'}); if(res.ok) rows=parseCSV(await res.text()); }catch(e){}
    }
    if(!rows.length) rows=[];
    productsCache = rows.map(normalizeProduct).filter(p=>p.name && p.category);
    return productsCache;
  }

  function getCart(){try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch(e){return[]}}
  function saveCart(cart){localStorage.setItem(CART_KEY,JSON.stringify(cart)); updateCartCount();}
  function updateCartCount(){ const count=getCart().reduce((s,x)=>s+Number(x.qty||1),0); $all('[data-cart-count]').forEach(el=>el.textContent=count); }
  function toast(msg){ const t=$('#toast'); if(!t){ alert(msg); return; } t.textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'),2200); }
  function addToCart(product, qty=1, overrideName='', overridePrice=null){
    const cart=getCart(); const id=(product.id||'ITEM') + (overrideName ? '-' + slug(overrideName) : '');
    const found=cart.find(x=>x.id===id);
    if(found) found.qty += qty; else cart.push({id, sourceId:product.id, name:overrideName||product.name, price:overridePrice==null?product.price:overridePrice, qty});
    saveCart(cart); toast('Added to cart');
  }
  function bindCommon(){
    updateCartCount();
    $('#mobileMenuBtn')?.addEventListener('click',()=>$('#navLinks')?.classList.toggle('open'));
  }

  function injectStyles(){
    if($('#scRuntimeStyle')) return;
    const css = `
      .status-badge{position:absolute;top:10px;right:10px;z-index:4;font-size:10px;font-weight:900;padding:5px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.18);box-shadow:0 8px 22px rgba(0,0,0,.28)}
      .status-instock{background:rgba(34,197,94,.95);color:#052e16}.status-online{background:rgba(59,130,246,.95);color:#fff}.status-out{background:rgba(239,68,68,.95);color:#fff}
      .product-card.out-of-stock{opacity:.72}.product-card.out-of-stock .btn-primary{opacity:.55;pointer-events:none}
      .quote-casing-preview{margin:0 0 18px;padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:rgba(8,18,38,.72)}
      .quote-casing-preview h3{margin:0 0 10px;font-size:15px}.quote-casing-box{width:100%;aspect-ratio:1/1;border-radius:18px;background:linear-gradient(135deg,#071226,#0b2446);display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(11,188,255,.22)}
      .quote-casing-box img{width:100%;height:100%;object-fit:contain;padding:12px;box-sizing:border-box}.quote-casing-box .muted{text-align:center;padding:18px}
      .quote-item-card{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:13px;margin-bottom:12px}.quote-item-card label{display:block;font-weight:900;margin-bottom:8px}.quote-item-row{display:grid;grid-template-columns:1fr 96px;gap:10px}.quote-item-row.single{grid-template-columns:1fr}.quote-extra-grid{display:grid;grid-template-columns:1fr 90px;gap:10px;align-items:center}.condition-switch{display:flex;gap:6px;margin-bottom:10px;background:rgba(2,8,23,.55);border:1px solid rgba(255,255,255,.09);border-radius:999px;padding:4px}.condition-switch button{border:0;background:transparent;color:#a8bdd8;font-weight:900;font-size:11px;padding:8px 10px;border-radius:999px;cursor:pointer;flex:1;white-space:nowrap}.condition-switch button.active{background:linear-gradient(135deg,#0bbcff,#2563eb);color:#fff;box-shadow:0 6px 18px rgba(11,188,255,.22)}
      .ram-slot-choice{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}.ram-slot-choice button{border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.06);color:#dbeafe;border-radius:999px;padding:8px 12px;font-weight:900;cursor:pointer}.ram-slot-choice button.active{background:linear-gradient(135deg,#0bbcff,#2563eb);color:#fff}.ram-slot-choice button:disabled{opacity:.45;cursor:not-allowed}
      @media(max-width:720px){.quote-item-row{grid-template-columns:1fr}.quote-extra-grid{grid-template-columns:1fr}.quote-casing-preview{padding:10px}}
    `;
    const s=document.createElement('style'); s.id='scRuntimeStyle'; s.textContent=css; document.head.appendChild(s);
  }

  function productCard(p){
    const status = statusLabel(p); const sc = statusClass(p); const out = normalizeStatus(p.status)==='OUTOFSTOCK';
    return `<article class="card product-card ${out?'out-of-stock':''}" data-product-id="${esc(p.id)}" tabindex="0">
      <div class="product-img-wrap"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='${LOGO_FALLBACK}'"><span class="status-badge status-${sc}">${esc(status)}</span><div class="tag-row"><span class="tag ${p.condition==='BRAND NEW'?'new':'used'}">${esc(p.condition)}</span>${p.ramSupport?`<span class="tag">${esc(p.ramSupport)}</span>`:''}${p.capacity?`<span class="tag">${esc(p.capacity)}</span>`:''}</div></div>
      <div class="product-body"><h3>${esc(p.name)}</h3><div class="meta"><span>${esc(p.category)}</span>${p.brand?`<span>${esc(p.brand)}</span>`:''}${p.model?`<span>${esc(p.model)}</span>`:''}</div><div class="price">${money(p.price)}</div><div class="stock">${esc(status)} • Stock: ${esc(p.stock||'Contact')} • ${esc(warrantyText(p))}</div><div class="product-actions"><button class="btn btn-ghost btn-small" data-view-product="${esc(p.id)}">View Details</button><button class="btn btn-primary btn-small" data-add-card="${esc(p.id)}" ${out?'disabled':''}>Add to cart</button></div></div>
    </article>`;
  }
  function ensureProductModal(){
    if($('#productModal')) return;
    const modal=document.createElement('div'); modal.id='productModal'; modal.className='product-modal'; modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<div class="product-modal-backdrop" data-close-product-modal></div><div class="product-modal-card"><button class="product-modal-close" data-close-product-modal>×</button><div id="productModalContent"></div></div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{
      if(e.target.closest('[data-close-product-modal]')) closeProductModal();
      const add=e.target.closest('[data-modal-add-to-cart]'); if(add){ const p=productsCache.find(x=>x.id===add.dataset.modalAddToCart); if(!p)return; const qty=Math.max(1,Number($('#modalProductQty')?.value||1)); const slot=$('#modalRamSlot')?.value || ''; const price=p.price+(slot==='4 RAM SLOT'?500:0); const name=slot?`${p.name.replace(/\s+Motherboard$/i,'')} ${slot} Motherboard`:p.name; addToCart(p,qty,name,price); closeProductModal(); }
    });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeProductModal(); });
  }
  function closeProductModal(){ const m=$('#productModal'); if(!m)return; m.classList.remove('open'); m.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); }
  function openProductModal(id){
    ensureProductModal(); const p=(productsCache||[]).find(x=>x.id===id); if(!p)return; const out=normalizeStatus(p.status)==='OUTOFSTOCK';
    const slotOptions = p.category==='MOTHERBOARD' && p.ramSlotOptions.length ? `<label>RAM Slot Option</label><select class="input" id="modalRamSlot">${p.ramSlotOptions.map(s=>`<option value="${esc(s)}">${esc(s)}${s==='4 RAM SLOT'?' (+Rs. 500)':''}</option>`).join('')}</select>` : '';
    $('#productModalContent').innerHTML=`<div class="product-modal-grid"><div class="product-modal-image"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='${LOGO_FALLBACK}'"></div><div class="product-modal-info"><div class="modal-tag-row"><span class="tag ${p.condition==='BRAND NEW'?'new':'used'}">${esc(p.condition)}</span><span class="tag status-${statusClass(p)}">${esc(statusLabel(p))}</span><span class="tag">${esc(p.category)}</span></div><h2>${esc(p.name)}</h2><div class="product-modal-price">${money(p.price)}</div><p class="product-modal-description">${esc(p.description||'Please confirm availability and final price before payment.')}</p><div class="product-detail-list"><div><span>Warranty Period</span><b>${esc(warrantyText(p))}</b></div><div><span>Status</span><b>${esc(statusLabel(p))}</b></div>${p.brand?`<div><span>Brand</span><b>${esc(p.brand)}</b></div>`:''}${p.model?`<div><span>Model</span><b>${esc(p.model)}</b></div>`:''}${p.panelType?`<div><span>Panel Type</span><b>${esc(p.panelType)}</b></div>`:''}${p.ssdSupport?`<div><span>SSD Support</span><b>${esc(p.ssdSupport)}</b></div>`:''}</div><div class="product-modal-order">${slotOptions}<label for="modalProductQty">Quantity</label><div class="modal-qty-row"><input class="input" id="modalProductQty" type="number" min="1" value="1"><button class="btn btn-primary" data-modal-add-to-cart="${esc(p.id)}" ${out?'disabled':''}>${out?'Out of stock':'Add to Cart'}</button></div></div></div></div>`;
    const m=$('#productModal'); m.classList.add('open'); m.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
  }
  function unique(arr){ return Array.from(new Set(arr.map(clean).filter(Boolean))).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})); }
  function fillFilter(sel, vals, label){ if(!sel)return; const current=sel.value; sel.innerHTML=`<option value="">${esc(label)}</option>` + unique(vals).map(v=>`<option value="${esc(upper(v))}">${esc(v)}</option>`).join(''); if(Array.from(sel.options).some(o=>o.value===current)) sel.value=current; }
  function initProductsPage(){
    loadProducts().then(products=>{
      const grid=$('#productsGrid'); if(!grid)return; ensureProductModal();
      const categoryList=$('#categoryList'); let currentCat='';
      const cats=CATEGORY_ORDER.filter(c=>products.some(p=>p.category===c));
      if(categoryList){ categoryList.innerHTML=`<button class="category-link active" data-cat="">All Categories <span>${products.length}</span></button>` + cats.map(c=>`<button class="category-link" data-cat="${esc(c)}">${esc(c)} <span>${products.filter(p=>p.category===c).length}</span></button>`).join(''); categoryList.addEventListener('click',e=>{const b=e.target.closest('[data-cat]'); if(!b)return; currentCat=b.dataset.cat; $all('.category-link',categoryList).forEach(x=>x.classList.toggle('active',x===b)); render();}); }
      grid.addEventListener('click',e=>{ const add=e.target.closest('[data-add-card]'); if(add){const p=products.find(x=>x.id===add.dataset.addCard); if(p) addToCart(p,1); return;} const v=e.target.closest('[data-view-product]'); if(v){openProductModal(v.dataset.viewProduct); return;} if(e.target.closest('button,a,input,select')) return; const card=e.target.closest('[data-product-id]'); if(card) openProductModal(card.dataset.productId); });
      const controls=['productSearch','conditionFilter','brandFilter','modelFilter','generationFilter','processorGenFilter','ramSupportFilter','storageFilter','ssdTypeFilter','monitorSizeFilter','panelTypeFilter','capacityFilter','speedFilter','wattFilter','rgbFilter','socketGenFilter'].map(id=>$('#'+id)).filter(Boolean); controls.forEach(el=>['input','change'].forEach(ev=>el.addEventListener(ev,render)));
      fillFilter($('#conditionFilter'),['USED','BRAND NEW'],'Used / Brand New');
      function filterVisibility(){
        const showByCat={
          'MOTHERBOARD':['generation','ramSupport','storage','brand'], 'PROCESSOR':['processorGen','brand','model'], 'CPU COOLER':['socketGen','brand'], 'RAM':['ramSupport','capacity','speed','brand'], 'HARD DISK':['capacity','brand'], 'SSD':['ssdType','capacity','brand'], 'VGA CARD':['capacity','model','brand'], 'POWER SUPPLY':['watt','brand'], 'MONITOR':['monitorSize','panelType','brand'], 'KEYBOARD':['rgb','brand'], 'MOUSE':['rgb','brand'], 'SPEAKER':['rgb','brand'], 'HEADSET':['rgb','brand'], 'RGB CASING FAN':['rgb','brand'], 'CABLES':['model','brand'], 'CASING':['rgb','brand'], 'OTHER':['brand','model']
        };
        const allowed = currentCat ? (showByCat[currentCat]||['brand','model']) : ['brand','model'];
        $all('[data-filter-box]').forEach(box=>{ const k=box.dataset.filterBox; box.style.display = (!currentCat || allowed.includes(k)) ? '' : 'none'; });
      }
      function render(){
        filterVisibility();
        const base = currentCat ? products.filter(p=>p.category===currentCat) : products;
        fillFilter($('#brandFilter'),base.map(p=>p.brand),'Brand'); fillFilter($('#modelFilter'),base.map(p=>p.model),'Model / Type'); fillFilter($('#generationFilter'),base.flatMap(p=>p.mbGens||[]),'Board Gen'); fillFilter($('#processorGenFilter'),base.map(p=>p.processorGen),'Processor Gen'); fillFilter($('#ramSupportFilter'),base.map(p=>p.ramSupport),'RAM Support'); fillFilter($('#storageFilter'),base.map(p=>p.ssdSupport),'SSD Support'); fillFilter($('#ssdTypeFilter'),base.map(p=>p.ssdType),'SSD Type'); fillFilter($('#monitorSizeFilter'),base.map(p=>p.monitorSize),'Monitor Size'); fillFilter($('#panelTypeFilter'),base.map(p=>p.panelType),'Panel Type'); fillFilter($('#capacityFilter'),base.map(p=>p.capacity),'Capacity / Memory'); fillFilter($('#speedFilter'),base.map(p=>p.speed),'Speed'); fillFilter($('#wattFilter'),base.map(p=>p.watt),'Watt'); fillFilter($('#rgbFilter'),base.map(p=>p.rgb),'RGB / Non RGB'); fillFilter($('#socketGenFilter'),base.map(p=>p.socketGen),'Socket / Gen');
        const q=upper($('#productSearch')?.value); const cond=upper($('#conditionFilter')?.value); const brand=upper($('#brandFilter')?.value); const model=upper($('#modelFilter')?.value); const gen=upper($('#generationFilter')?.value); const pgen=upper($('#processorGenFilter')?.value); const ram=upper($('#ramSupportFilter')?.value); const stor=upper($('#storageFilter')?.value); const stype=upper($('#ssdTypeFilter')?.value); const mon=upper($('#monitorSizeFilter')?.value); const panel=upper($('#panelTypeFilter')?.value); const cap=upper($('#capacityFilter')?.value); const speed=upper($('#speedFilter')?.value); const watt=upper($('#wattFilter')?.value); const rgb=upper($('#rgbFilter')?.value); const socket=upper($('#socketGenFilter')?.value);
        const filtered=products.filter(p=>{
          const hay=upper([p.name,p.brand,p.model,p.category,p.condition,p.status,p.description,p.capacity,p.monitorSize,p.panelType,p.processorGen,(p.mbGens||[]).join(' ')].join(' '));
          return (!currentCat||p.category===currentCat)&&(!q||hay.includes(q))&&(!cond||p.condition===cond)&&(!brand||upper(p.brand)===brand)&&(!model||upper(p.model)===model)&&(!gen||(p.mbGens||[]).map(upper).includes(gen))&&(!pgen||upper(p.processorGen)===pgen)&&(!ram||upper(p.ramSupport)===ram)&&(!stor||upper(p.ssdSupport)===stor)&&(!stype||upper(p.ssdType)===stype)&&(!mon||upper(p.monitorSize)===mon)&&(!panel||upper(p.panelType)===panel)&&(!cap||upper(p.capacity)===cap)&&(!speed||upper(p.speed)===speed)&&(!watt||upper(p.watt)===watt)&&(!rgb||upper(p.rgb)===rgb)&&(!socket||upper(p.socketGen)===socket);
        });
        $('#productCount') && ($('#productCount').textContent = `${filtered.length} items`); grid.innerHTML = filtered.length ? filtered.map(productCard).join('') : '<div class="empty-state card">No matching products found.</div>';
      }
      render();
    }).catch(e=>{console.error(e); const grid=$('#productsGrid'); if(grid) grid.innerHTML='<div class="empty-state card">Products could not be loaded. Check Google Sheet publish link.</div>';});
  }

  const qState = { conditions:{}, selectedSlot:'' };
  function productsBy(cat, cond){ return quoteProducts.filter(p=>p.category===cat && (!cond || p.condition===cond) && quoteAllowed(p)); }
  function conditionSwitch(key, allowBrandNew=true){
    const usedActive = (qState.conditions[key]||'USED')==='USED';
    return `<div class="condition-switch" data-cond-key="${esc(key)}"><button type="button" class="${usedActive?'active':''}" data-cond="USED">USED</button>${allowBrandNew?`<button type="button" class="${!usedActive?'active':''}" data-cond="BRAND NEW">BRAND NEW</button>`:''}</div>`;
  }
  function optionHTML(p){ return `<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)} • ${esc(statusLabel(p))}</option>`; }
  function fillQuoteSelect(sel, items, placeholder, keep=true){ if(!sel)return; const current=sel.value; sel.innerHTML=`<option value="">${esc(placeholder)}</option>` + items.map(optionHTML).join(''); if(keep && items.some(p=>p.id===current)) sel.value=current; else if(current && keep===false) sel.value=''; }
  function sectionHTML(key,label,cat,{qty=false,qtyId='',extraHtml='',allowBrandNew=true}={}){
    return `<div class="quote-item-card" data-quote-section="${esc(key)}"><label>${esc(label)}</label>${conditionSwitch(key,allowBrandNew)}<div class="quote-item-row ${qty?'':'single'}"><select class="input" id="${esc(key)}Select" data-quote-category="${esc(cat)}" data-quote-key="${esc(key)}"><option value="">Loading...</option></select>${qty?`<input class="input" id="${esc(qtyId||key+'Qty')}" type="number" min="1" value="1" data-quote-qty="${esc(key)}">`:''}</div>${extraHtml}</div>`;
  }
  async function initQuotationPage(){
    const form=$('#quoteComponentForm'); if(!form)return; quoteProducts=await loadProducts();
    ['casing','motherboard','processor','cpuCooler','ram','hdd','ssd','psu','vga','monitor','keyboard','mouse','mousepad','speaker','headset','fan','cables'].forEach(k=>qState.conditions[k]='USED');
    ['keyboard','mouse','speaker','headset','cables'].forEach(k=>qState.conditions[k]='BRAND NEW');
    form.innerHTML=`
      ${sectionHTML('casing','Casing','CASING')}
      ${sectionHTML('processor','Processor','PROCESSOR')}
      ${sectionHTML('motherboard','Motherboard','MOTHERBOARD',{extraHtml:'<div class="ram-slot-choice" id="quoteRamSlotOptions"></div>'})}
      ${sectionHTML('cpuCooler','CPU Cooler','CPU COOLER')}
      ${sectionHTML('ram','RAM','RAM',{qty:true,qtyId:'quoteRamQty',extraHtml:'<select class="input" id="quoteRamCapacity" style="margin-top:10px"><option value="">Memory Size</option><option>2GB</option><option>4GB</option><option>8GB</option><option>16GB</option></select>'})}
      ${sectionHTML('hdd','HDD','HARD DISK',{qty:true,qtyId:'quoteHddQty'})}
      ${sectionHTML('ssd','SSD','SSD',{qty:true,qtyId:'quoteSsdQty'})}
      ${sectionHTML('psu','Power Supply','POWER SUPPLY')}
      ${sectionHTML('vga','VGA Card','VGA CARD',{extraHtml:'<select class="input" id="quoteVgaMemory" style="margin-top:10px"><option value="">VGA Memory</option><option>2GB</option><option>3GB</option><option>4GB</option><option>6GB</option><option>8GB</option><option>12GB</option></select>'})}
      ${sectionHTML('monitor','Monitor','MONITOR',{extraHtml:'<div class="quote-item-row" style="margin-top:10px"><select class="input" id="quoteMonitorSize"><option value="">Monitor Size</option><option>19 WIDE</option><option>20 WIDE</option><option>22 WIDE</option><option>24 WIDE</option><option>27 WIDE</option><option>29 WIDE</option><option>32 WIDE</option></select><select class="input" id="quotePanelType"><option value="">Panel Type</option><option>VA</option><option>TN</option><option>IPS</option></select></div>'})}
      ${sectionHTML('keyboard','Keyboard','KEYBOARD',{allowBrandNew:false})}
      ${sectionHTML('mouse','Mouse','MOUSE',{allowBrandNew:false})}
      ${sectionHTML('mousepad','Mouse Pad','MOUSE PAD',{allowBrandNew:false})}
      ${sectionHTML('speaker','Speaker','SPEAKER',{allowBrandNew:false})}
      ${sectionHTML('headset','Headset','HEADSET',{allowBrandNew:false})}
      ${sectionHTML('fan','RGB Casing Fan','RGB CASING FAN',{qty:true,qtyId:'quoteFanQty'})}
      <div class="quote-item-card"><label>Cables</label><div class="quote-extra-grid">${EXTRA_CABLES.map(c=>`<label><input type="checkbox" data-extra-cable="${esc(c.id)}"> ${esc(c.name)} <span class="muted">${money(c.rate)}</span></label><input class="input" type="number" min="1" value="1" data-extra-cable-qty="${esc(c.id)}">`).join('')}</div></div>`;
    // table header fix
    const table=$('#quoteTable'); if(table) table.innerHTML='<thead><tr><th>No.</th><th>Product Name</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody></tbody>';
    renderCasingPreview(); refreshAllQuoteSelects(false); renderQuote();
    form.addEventListener('click',e=>{ const b=e.target.closest('[data-cond]'); if(!b)return; const wrap=b.closest('[data-cond-key]'); const key=wrap.dataset.condKey; qState.conditions[key]=b.dataset.cond; $all('button',wrap).forEach(x=>x.classList.toggle('active',x===b)); refreshQuoteSelect(key); renderQuote(); });
    form.addEventListener('change',e=>{ const el=e.target; if(el.matches('select,input')){ if(el.id==='processorSelect') refreshQuoteSelect('motherboard'); if(el.id==='motherboardSelect'){ updateRamSlotOptions(); refreshQuoteSelect('ram'); refreshQuoteSelect('ssd'); } if(el.id==='casingSelect') renderCasingPreview(); if(el.id==='quoteMonitorSize'||el.id==='quotePanelType') refreshQuoteSelect('monitor'); renderQuote(); }});
    $('#addQuoteToCartBtn')?.addEventListener('click',()=>{ const items=getQuoteItems(); if(!items.length){toast('Select products first');return;} items.forEach(it=>addToCart({id:it.id,name:it.name,price:it.rate},it.qty,it.name,it.rate)); });
    $('#downloadQuotePdfBtn')?.addEventListener('click',downloadQuotationPdf);
  }
  function refreshAllQuoteSelects(){ ['casing','processor','motherboard','cpuCooler','ram','hdd','ssd','psu','vga','monitor','keyboard','mouse','mousepad','speaker','headset','fan'].forEach(refreshQuoteSelect); updateRamSlotOptions(); }
  function refreshQuoteSelect(key){
    const sel=$(`#${key}Select`); if(!sel)return; const cat=sel.dataset.quoteCategory; const cond=qState.conditions[key]; let items=productsBy(cat,cond);
    const cpu = quoteProducts.find(p=>p.id===$('#processorSelect')?.value);
    const board = quoteProducts.find(p=>p.id===$('#motherboardSelect')?.value);
    if(key==='motherboard' && cpu && cpu.processorGen){ items=items.filter(p=>(p.mbGens||[]).map(upper).includes(upper(cpu.processorGen))); }
    if(key==='ram' && board && board.ramSupport){ items=items.filter(p=>upper(p.ramSupport)===upper(board.ramSupport)); const cap=upper($('#quoteRamCapacity')?.value); if(cap) items=items.filter(p=>upper(p.capacity)===cap); }
    if(key==='ssd' && board){ const supports=storageSupportList(board).map(upper); items=items.filter(p=>supports.includes(upper(storageType(p)||p.ssdType))); }
    if(key==='vga'){ const mem=upper($('#quoteVgaMemory')?.value); if(mem) items=items.filter(p=>upper(p.capacity)===mem); }
    if(key==='monitor'){ const size=upper($('#quoteMonitorSize')?.value); const panel=upper($('#quotePanelType')?.value); if(size) items=items.filter(p=>upper(p.monitorSize)===size); if(panel) items=items.filter(p=>upper(p.panelType)===panel); }
    fillQuoteSelect(sel, items, `Skip ${cat}`);
    if(key==='motherboard') updateRamSlotOptions();
  }
  function updateRamSlotOptions(){
    const wrap=$('#quoteRamSlotOptions'); if(!wrap)return; const board=quoteProducts.find(p=>p.id===$('#motherboardSelect')?.value);
    if(!board || !board.ramSlotOptions.length){ wrap.innerHTML=''; qState.selectedSlot=''; return; }
    if(!board.ramSlotOptions.includes(qState.selectedSlot)) qState.selectedSlot = board.ramSlotOptions.includes('2 RAM SLOT') ? '2 RAM SLOT' : board.ramSlotOptions[0];
    wrap.innerHTML=board.ramSlotOptions.map(s=>`<button type="button" class="${qState.selectedSlot===s?'active':''}" data-ram-slot="${esc(s)}">${esc(s)}${s==='4 RAM SLOT'?' (+Rs. 500)':''}</button>`).join('');
    wrap.onclick=e=>{ const b=e.target.closest('[data-ram-slot]'); if(!b)return; qState.selectedSlot=b.dataset.ramSlot; $all('[data-ram-slot]',wrap).forEach(x=>x.classList.toggle('active',x===b)); renderQuote(); };
  }
  function renderCasingPreview(){
    const p=quoteProducts.find(x=>x.id===$('#casingSelect')?.value); const box=$('#casingPreviewBox'); const name=$('#casingPreviewName');
    if(!box)return; if(p){ box.innerHTML=`<img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='${LOGO_FALLBACK}'">`; if(name)name.textContent=p.name; } else { box.innerHTML='<span class="muted">Select a casing to preview</span>'; if(name)name.textContent='Casing Preview'; }
  }
  function selectedProduct(key){ return quoteProducts.find(p=>p.id===$(`#${key}Select`)?.value); }
  function quoteItemFromProduct(p,key,qty=1){
    let rate=p.price, name=p.name;
    if(key==='motherboard' && qState.selectedSlot){ rate += qState.selectedSlot==='4 RAM SLOT' ? 500 : 0; name = `${p.name.replace(/\s+Motherboard$/i,'')} ${qState.selectedSlot} Motherboard`; }
    return {id:p.id+'-'+key+(qState.selectedSlot||''), name, category:p.category, condition:p.condition, qty:Number(qty||1), rate, amount:rate*Number(qty||1)};
  }
  function getQuoteItems(){
    const map=[['casing',1],['processor',1],['motherboard',1],['cpuCooler',1],['ram',$('#quoteRamQty')?.value||1],['hdd',$('#quoteHddQty')?.value||1],['ssd',$('#quoteSsdQty')?.value||1],['psu',1],['vga',1],['monitor',1],['keyboard',1],['mouse',1],['mousepad',1],['speaker',1],['headset',1],['fan',$('#quoteFanQty')?.value||1]];
    const items=[]; map.forEach(([key,qty])=>{ const p=selectedProduct(key); if(p) items.push(quoteItemFromProduct(p,key,qty)); });
    EXTRA_CABLES.forEach(c=>{ const chk=$(`[data-extra-cable="${c.id}"]`); if(chk?.checked){ const qty=Number($(`[data-extra-cable-qty="${c.id}"]`)?.value||1); items.push({id:c.id,name:c.name,category:'CABLES',condition:'BRAND NEW',qty,rate:c.rate,amount:c.rate*qty}); }});
    return items;
  }
  function renderQuote(){
    renderCasingPreview(); const tbody=$('#quoteTable tbody'); if(!tbody)return; const items=getQuoteItems(); const total=items.reduce((s,x)=>s+x.amount,0);
    tbody.innerHTML = items.length ? items.map((it,i)=>`<tr><td>${i+1}</td><td>${esc(it.name)}</td><td>${it.qty}</td><td>${money(it.rate)}</td><td>${money(it.amount)}</td></tr>`).join('') : '<tr><td colspan="5" class="muted">No items selected yet.</td></tr>';
    $('#quoteTotal') && ($('#quoteTotal').textContent = money(total));
  }
  function quoteCustomer(){ return {name:clean($('#quoteCustomerName')?.value),phone:clean($('#quoteCustomerPhone')?.value),email:clean($('#quoteCustomerEmail')?.value),address:clean($('#quoteCustomerAddress')?.value)}; }
  function validateQuoteCustomer(){ const c=quoteCustomer(); if(!c.name||!c.phone||!c.email||!c.address){toast('Fill customer details'); return null;} return c; }
  function quoteNo(){ return 'QT-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(1000+Math.random()*9000); }
  function todayString(){ return new Date().toLocaleDateString('en-LK',{year:'numeric',month:'2-digit',day:'2-digit'}); }
  function pdfText(doc,text,x,y,opts={}){ doc.text(String(text||''),x,y,opts); }
  async function downloadQuotationPdf(){
    const customer=validateQuoteCustomer(); if(!customer)return; const items=getQuoteItems(); if(!items.length){toast('Select products first');return;}
    const jsPDF=window.jspdf&&window.jspdf.jsPDF; if(!jsPDF){window.print();return;}
    const doc=new jsPDF({unit:'pt',format:'a4'}); const qn=quoteNo(); const total=items.reduce((s,x)=>s+x.amount,0);
    const W=595, H=842, blue=[0,84,190], navy=[5,28,76], light=[245,249,255];
    doc.setFillColor(255,255,255); doc.rect(0,0,W,H,'F');
    // header logo + brand
    if(CONFIG.logoDataUrl){ try{doc.addImage(CONFIG.logoDataUrl,'PNG',46,42,54,54);}catch(e){} }
    doc.setTextColor(...navy); doc.setFont('helvetica','bold'); doc.setFontSize(17); pdfText(doc,'SANDARUWAN',112,60); pdfText(doc,'COMPUTER ONLINE STORE',112,78); doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(49,70,105); pdfText(doc,'YOUR TRUSTED PC PARTNER',112,94);
    doc.setFillColor(...blue); doc.rect(40,116,285,12,'F'); doc.triangle(325,116,343,116,325,128,'F'); doc.setFont('helvetica','bold'); doc.setFontSize(31); doc.setTextColor(...navy); pdfText(doc,'QUOTATION',378,110); doc.setFillColor(...blue); doc.rect(522,95,32,12,'F');
    // customer / quote info
    doc.setFontSize(11); doc.setTextColor(0,84,190); pdfText(doc,'Quotation To:',58,164); doc.setTextColor(...navy); doc.setFont('helvetica','bold'); doc.setFontSize(12); pdfText(doc,customer.name,58,184); doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(39,52,82); pdfText(doc,customer.phone,58,200); pdfText(doc,customer.email,58,216); doc.splitTextToSize(customer.address,200).slice(0,2).forEach((t,i)=>pdfText(doc,t,58,232+i*14));
    doc.setDrawColor(185,205,235); doc.line(327,150,327,230); doc.setTextColor(...navy); doc.setFont('helvetica','bold'); doc.setFontSize(10); pdfText(doc,'Quotation No.',360,170); pdfText(doc,':',448,170); doc.setTextColor(0,84,190); pdfText(doc,qn,463,170); doc.setTextColor(...navy); pdfText(doc,'Date',360,194); pdfText(doc,':',448,194); doc.setTextColor(0,84,190); pdfText(doc,todayString(),463,194);
    // table
    let y=268; doc.setFillColor(...navy); doc.rect(40,y,W-80,28,'F'); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10); pdfText(doc,'No.',55,y+18); pdfText(doc,'Product Name',105,y+18); pdfText(doc,'Qty',334,y+18,{align:'center'}); pdfText(doc,'Rate',405,y+18,{align:'right'}); pdfText(doc,'Amount',528,y+18,{align:'right'}); y+=28;
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setDrawColor(215,226,244);
    items.forEach((it,i)=>{ if(y>660){ doc.addPage(); y=50; doc.setFillColor(...navy); doc.rect(40,y,W-80,28,'F'); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); pdfText(doc,'No.',55,y+18); pdfText(doc,'Product Name',105,y+18); pdfText(doc,'Qty',334,y+18,{align:'center'}); pdfText(doc,'Rate',405,y+18,{align:'right'}); pdfText(doc,'Amount',528,y+18,{align:'right'}); y+=28; doc.setFont('helvetica','normal'); doc.setFontSize(9); }
      doc.setFillColor(...(i%2?[255,255,255]:light)); doc.rect(40,y,W-80,32,'F'); doc.setTextColor(...navy); pdfText(doc,String(i+1),58,y+20); const txt=doc.splitTextToSize(it.name,205); pdfText(doc,txt[0],105,y+13); if(txt[1]){doc.setFontSize(8); pdfText(doc,txt[1],105,y+25); doc.setFontSize(9);} pdfText(doc,String(it.qty),334,y+20,{align:'center'}); pdfText(doc,money(it.rate),405,y+20,{align:'right'}); pdfText(doc,money(it.amount),528,y+20,{align:'right'}); doc.setDrawColor(215,226,244); doc.line(40,y+32,W-40,y+32); y+=32; });
    y+=20; doc.setFillColor(...blue); doc.rect(362,y,193,34,'F'); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(12); pdfText(doc,'TOTAL',380,y+22); pdfText(doc,money(total),530,y+22,{align:'right'});
    // lower note and payment
    y+=70; if(y>650)y=650; doc.setDrawColor(0,84,190); doc.line(58,y,300,y); doc.setTextColor(0,84,190); doc.setFontSize(11); doc.setFont('helvetica','bold'); pdfText(doc,'PAYMENT DETAILS',58,y+22); doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(35,48,72); const bank=CONFIG.bank||{}; pdfText(doc,`Account Name : ${bank.accountName||'B A D T L SANDARUWAN'}`,58,y+44); pdfText(doc,`Bank Name       : ${bank.name||'BOC BANK'}`,58,y+58); pdfText(doc,`Account Number : ${bank.accountNumber||'81054889'}`,58,y+72); pdfText(doc,`Branch          : ${bank.branch||'RATHNAPURA BRANCH'}`,58,y+86);
    doc.setDrawColor(185,205,235); doc.line(340,y+22,340,y+96); doc.setTextColor(...navy); doc.setFontSize(10); pdfText(doc,'Final price may change after',370,y+52); pdfText(doc,'stock and delivery confirmation',370,y+68);
    doc.setDrawColor(0,84,190); doc.line(40,790,325,790); doc.line(420,790,555,790); doc.setTextColor(0,84,190); doc.setFontSize(9); pdfText(doc,CONFIG.phoneDisplay||'077 992 6177',58,815); pdfText(doc,CONFIG.facebookUrl?'Facebook Page':'Sandaruwan Computer',185,815); pdfText(doc,'Authorised Sign',465,815,{align:'center'});
    doc.save(`sandaruwan-computer-quotation-${qn}.pdf`);
  }

  function initCarousel(slideSelector,dotsSelector,interval=4200){ const slides=$all(slideSelector), dotsWrap=$(dotsSelector); if(!slides.length||!dotsWrap)return; dotsWrap.innerHTML=slides.map((_,i)=>`<span class="slide-dot ${i===0?'active':''}"></span>`).join(''); const dots=$all('.slide-dot',dotsWrap); let idx=0; setInterval(()=>{slides[idx].classList.remove('active'); dots[idx]?.classList.remove('active'); idx=(idx+1)%slides.length; slides[idx].classList.add('active'); dots[idx]?.classList.add('active');},interval); }
  function initHome(){ initCarousel('.prebuild-slide','#prebuildDots',3600); initCarousel('.wide-banner-slide','#wideBannerDots',4300); }
  const PREBUILDS=[{id:'PB-OFFICE',title:'Office Value PC',price:'From Rs. 58,500',image:'assets/img/prebuild/prebuild-office-ddr3.jpg',tag:'Best budget',specs:['Intel Core i5 4th Gen','H81/B85 Motherboard','8GB DDR3 RAM','128GB SSD'],description:'Budget friendly ready PC package.'},{id:'PB-STUDY',title:'Study / Home PC',price:'From Rs. 79,500',image:'assets/img/prebuild/prebuild-study-ddr4.jpg',tag:'DDR4 value',specs:['Intel Core i5 6th Gen','H110 DDR4 Motherboard','8GB DDR4 RAM','256GB SSD'],description:'Value package for home, office and online classes.'}];
  function initPrebuildPage(){ const grid=$('#prebuildGrid'); if(!grid)return; grid.innerHTML=PREBUILDS.map(p=>`<article class="card prebuild-card"><div class="prebuild-img"><img src="${esc(p.image)}" onerror="this.src='${LOGO_FALLBACK}'"></div><div class="prebuild-body"><h3>${esc(p.title)}</h3><div class="price">${esc(p.price)}</div><div class="spec-list">${p.specs.map(s=>`<span>${esc(s)}</span>`).join('')}</div></div></article>`).join(''); }
  async function cartItems(){ const products=await loadProducts(); return getCart().map(it=>{ const p=products.find(x=>x.id===it.sourceId||x.id===it.id) || {id:it.id,name:it.name,price:it.price,category:'CUSTOM'}; return {product:{...p,name:it.name||p.name,price:it.price||p.price},qty:Number(it.qty||1)}; }); }
  async function initCartPage(){ const view=$('#cartView'); if(!view)return; const items=await cartItems(); if(!items.length){view.innerHTML='<div class="empty-state card">Cart is empty.</div>';return;} const total=items.reduce((s,x)=>s+x.product.price*x.qty,0); view.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Product</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>${items.map(x=>`<tr><td>${esc(x.product.name)}</td><td>${x.qty}</td><td>${money(x.product.price*x.qty)}</td></tr>`).join('')}</tbody></table></div><div class="total-row"><span>Total</span><strong>${money(total)}</strong></div>`; }
  async function initCheckoutPage(){ const wrap=$('#checkoutSummary'); if(wrap){ const items=await cartItems(); const total=items.reduce((s,x)=>s+x.product.price*x.qty,0); wrap.innerHTML=items.length?`<div class="table-wrap"><table><thead><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>${items.map(x=>`<tr><td>${esc(x.product.name)}</td><td>${x.qty}</td><td>${money(x.product.price*x.qty)}</td></tr>`).join('')}</tbody></table></div><div class="total-row"><span>Total</span><strong>${money(total)}</strong></div>`:'<div class="empty-state">Cart empty.</div>'; }}

  document.addEventListener('DOMContentLoaded',()=>{ injectStyles(); bindCommon(); const page=document.body?.dataset.page; if(page==='products')initProductsPage(); if(page==='quotation')initQuotationPage(); if(page==='cart')initCartPage(); if(page==='checkout')initCheckoutPage(); if(page==='prebuild')initPrebuildPage(); if(!page||page==='home')initHome(); });
})();
