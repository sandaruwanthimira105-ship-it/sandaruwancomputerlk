(function(){
  'use strict';

  const CONFIG = window.SC_CONFIG || {};
  const CART_KEY = 'sandaruwan_computer_cart_v5_google_sheet';
  const RAM_SLOT_4_EXTRA = 500;

  const CATEGORIES = [
    'PROCESSOR','MOTHERBOARD','CPU COOLER','RAM','HARD DISK','SSD','POWER SUPPLY','CABLES','MONITOR','KEYBOARD','MOUSE','SPEAKER','HEADSET','CASING'
  ];

  const CATEGORY_ALIASES = {
    PROSSR:'PROCESSOR', PROSSOR:'PROCESSOR', PROCESSER:'PROCESSOR', PROCESSOR:'PROCESSOR', CPU:'PROCESSOR',
    MOTHERBORD:'MOTHERBOARD', MOTHERBOARD:'MOTHERBOARD', BOARD:'MOTHERBOARD', MAINBOARD:'MOTHERBOARD',
    CASIN:'CASING', CASE:'CASING', CASING:'CASING', CPUCOOLER:'CPU COOLER', COOLER:'CPU COOLER',
    HDD:'HARD DISK', HARD:'HARD DISK', HARDDISK:'HARD DISK', 'HARD DISK':'HARD DISK',
    POWERSUPPLY:'POWER SUPPLY', PSU:'POWER SUPPLY', 'POWER SUPPLY':'POWER SUPPLY',
    CABLE:'CABLES', CABLES:'CABLES', KEYBORD:'KEYBOARD', KEYBOARD:'KEYBOARD',
    HEDSET:'HEADSET', HEADSET:'HEADSET', RAM:'RAM', SSD:'SSD', MONITOR:'MONITOR', MOUSE:'MOUSE', SPEAKER:'SPEAKER'
  };

  const COMPAT_RULES = {
    CORE2DUO:{label:'CORE 2 DUO', ram:'DDR3', chipsets:['G41'], socket:'LGA775'},
    2:{label:'2ND GEN', ram:'DDR3', chipsets:['H61','B75'], socket:'LGA1155'},
    3:{label:'3RD GEN', ram:'DDR3', chipsets:['H61','B75'], socket:'LGA1155'},
    4:{label:'4TH GEN', ram:'DDR3', chipsets:['H81','B85'], socket:'LGA1150'},
    5:{label:'5TH GEN', ram:'DDR3', chipsets:['H81','B85'], socket:'LGA1150'},
    6:{label:'6TH GEN', ram:'DDR4', chipsets:['H110','H110 M.2','B150','B250','Z270','H270','H170'], socket:'LGA1151'},
    7:{label:'7TH GEN', ram:'DDR4', chipsets:['H110','H110 M.2','B150','B250','Z270','H270','H170'], socket:'LGA1151'},
    8:{label:'8TH GEN', ram:'DDR4', chipsets:['B360','B365','Z360','H370'], socket:'LGA1151'},
    9:{label:'9TH GEN', ram:'DDR4', chipsets:['B360','B365','Z360','H370','H410'], socket:'LGA1151'},
    10:{label:'10TH GEN', ram:'DDR4', chipsets:['H410'], socket:'LGA1200'}
  };

  const PREBUILDS = [
    {id:'PB-OFFICE-DDR3',title:'Office Value PC',price:'From Rs. 58,500',image:'assets/img/prebuild/prebuild-office-ddr3.jpg',specs:['Intel Core i5 4th Gen','H81/B85 Motherboard','8GB DDR3 RAM','128GB SSD','Office, POS and study work'],tag:'Best budget',warranty:'Shop warranty as available',description:'Budget friendly ready PC package for office, POS, billing, browsing and study work.'},
    {id:'PB-STUDY-DDR4',title:'Study / Home PC',price:'From Rs. 79,500',image:'assets/img/prebuild/prebuild-study-ddr4.jpg',specs:['Intel Core i5 6th Gen','H110 DDR4 Motherboard','8GB DDR4 RAM','256GB SSD','Online classes and daily use'],tag:'DDR4 value',warranty:'Shop warranty as available',description:'DDR4 value package for home, online classes, office work and daily multitasking.'},
    {id:'PB-GAMING-STARTER',title:'Gaming Starter PC',price:'From Rs. 128,000',image:'assets/img/prebuild/prebuild-gaming-starter.jpg',specs:['Intel Core i5 8th Gen','B360/H310 Motherboard','16GB DDR4 RAM','SSD + optional graphics card','Free Fire, GTA V and eSports starter'],tag:'Popular',warranty:'Shop warranty as available',description:'Gaming starter PC package with compatible parts and graphics card upgrade option.'},
    {id:'PB-MODERN-I3',title:'Modern Desktop PC',price:'From Rs. 149,000',image:'assets/img/prebuild/prebuild-modern-i3.jpg',specs:['Intel Core i3 10th Gen','H410 Motherboard','8GB/16GB DDR4 RAM','Fast SSD storage','Office, design and multitasking'],tag:'Newer platform',warranty:'Shop / brand warranty as available',description:'Modern DDR4 platform package for office, design basics, browsing and multitasking.'},
    {id:'PB-CUSTOM',title:'Custom Build Package',price:'Custom price',image:'assets/img/prebuild/prebuild-custom.jpg',specs:['Choose your processor generation','Matched motherboard and RAM','SSD/HDD/monitor/accessories','Professional quotation PDF','WhatsApp order support'],tag:'Build your way',warranty:'Depends on selected parts',description:'Custom PC build package with matched processor, motherboard, RAM, SSD, case, power supply and accessories.'}
  ];

  let productsCache = null;
  let quoteProducts = [];
  let lastReceiptText = '';

  const $ = (sel, root=document) => root.querySelector(sel);
  const $all = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const clean = v => String(v ?? '').trim();
  const upper = v => clean(v).toUpperCase();
  const esc = s => clean(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const toNumber = v => { const n = Number(clean(v).replace(/[^0-9.]/g,'')); return Number.isFinite(n) ? n : 0; };
  const money = n => 'Rs. ' + toNumber(n).toLocaleString('en-LK');

  function toast(msg){ const t=$('#toast'); if(!t)return; t.textContent=msg; t.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove('show'),2300); }
  function todayString(){ return new Date().toLocaleDateString('en-LK',{year:'numeric',month:'short',day:'2-digit'}); }
  function quoteNo(){ return 'SCQ-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+Math.floor(1000+Math.random()*9000); }
  function categoryName(v){ const raw=upper(v); const compact=raw.replace(/[^A-Z0-9]/g,''); return CATEGORY_ALIASES[raw] || CATEGORY_ALIASES[compact] || raw; }

  function normalizeGenKey(v){
    const s=upper(v).replace(/[^A-Z0-9]/g,'');
    if(!s) return '';
    if(s.includes('CORE2DUO') || s==='C2D' || s==='DUO') return 'CORE2DUO';
    const m=s.match(/10|[2-9]/);
    return m ? m[0] : '';
  }
  function parseGenerations(v){
    if(Array.isArray(v)) return v.map(normalizeGenKey).filter(Boolean);
    const raw=upper(v); if(!raw) return [];
    const out=[];
    if(raw.replace(/[^A-Z0-9]/g,'').includes('CORE2DUO')) out.push('CORE2DUO');
    (raw.match(/10|[2-9]/g)||[]).forEach(n=>{ if(!out.includes(n)) out.push(n); });
    return out;
  }
  function genLabel(g){ const key=normalizeGenKey(g); if(!key)return ''; if(key==='CORE2DUO') return 'CORE 2 DUO'; const n=Number(key); return (n===2?'2ND':n===3?'3RD':`${n}TH`)+' GEN'; }

  function parseList(v){
    if(Array.isArray(v)) return v.map(clean).filter(Boolean);
    return clean(v).split(/[|,\/;]+/).map(x=>clean(x)).filter(Boolean);
  }
  function parseUpperList(v){ return parseList(v).map(upper).filter(Boolean); }
  function parseRamList(v){ return parseUpperList(v).map(x => x.replace(/\s+/g,'')).map(x => x.startsWith('DDR')?x:'DDR'+x.replace(/[^0-9]/g,'')); }
  function parseStorageList(v){
    const raw = upper(v);
    const out = [];
    if(raw.includes('SATA')) out.push('SATA SSD');
    if(raw.includes('M.2') || raw.includes('M2')) out.push('M.2 SSD');
    if(raw.includes('NVME') || raw.includes('NVME SSD') || raw.includes('NVME')) out.push('NVME SSD');
    if(!out.length) parseUpperList(v).forEach(x=>{
      if(x.includes('NVME')) out.push('NVME SSD');
      else if(x.includes('M.2')||x.includes('M2')) out.push('M.2 SSD');
      else if(x.includes('SATA')) out.push('SATA SSD');
    });
    return Array.from(new Set(out));
  }
  function parseRamSlots(v){
    const raw=upper(v); const out=[];
    if(raw.includes('2')) out.push('2');
    if(raw.includes('4')) out.push('4');
    return Array.from(new Set(out));
  }
  function boolish(v){ const x=upper(v); return ['YES','Y','TRUE','1','SUPPORTED','SUPPORT','AVAILABLE','OK'].includes(x); }

  function storageTypeFromText(v){
    const s=upper(v);
    if(s.includes('NVME')) return 'NVME SSD';
    if(s.includes('M.2') || s.includes('M2')) return 'M.2 SSD';
    if(s.includes('SATA')) return 'SATA SSD';
    return '';
  }
  function storageType(p){
    const cat = categoryName(p.category);
    if(cat !== 'SSD') return '';
    return storageTypeFromText(p.storageType || p.storage_type || p.storage || p.interface || p.ssdType || p.ssd_type) || 'SATA SSD';
  }
  function productImage(p){ return clean(p.image) || 'assets/img/logo.jpg'; }

  function parseCSV(text){
    const rows=[]; let row=[], field='', quoted=false;
    text = String(text || '').replace(/^\uFEFF/, '');
    for(let i=0;i<text.length;i++){
      const c=text[i], n=text[i+1];
      if(c==='"'){
        if(quoted && n==='"'){ field+='"'; i++; }
        else quoted=!quoted;
      }else if(c===',' && !quoted){ row.push(field); field=''; }
      else if((c==='\n' || c==='\r') && !quoted){ if(c==='\r' && n==='\n') i++; row.push(field); if(row.some(x=>clean(x)!=='')) rows.push(row); row=[]; field=''; }
      else field+=c;
    }
    row.push(field); if(row.some(x=>clean(x)!=='')) rows.push(row);
    if(rows.length && clean(rows[0][0]).toLowerCase().startsWith('sep=')) rows.shift();
    if(rows.length < 1) return [];
    const headers = rows[0].map(h=>clean(h));
    return rows.slice(1).map(cols=>{ const obj={}; headers.forEach((h,i)=>obj[h]=clean(cols[i]??'')); return obj; });
  }

  function googleCsvUrl(url){
    let u = clean(url);
    if(!u) return '';
    if(u.includes('output=csv') || u.includes('tqx=out:csv') || u.endsWith('.csv')) return u;
    const idMatch = u.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if(idMatch){
      const id = idMatch[1];
      const gidMatch = u.match(/[?#&]gid=(\d+)/);
      const gid = gidMatch ? gidMatch[1] : '0';
      return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`;
    }
    return u;
  }

  function normalizeProduct(p, i=0){
    const category = categoryName(p.category || p.Category || p.type || p.productType);
    const ramSupport = parseRamList(p.ramSupport || p.ram_support || p.compatibleRam || p.compatible_ram || p.memory || p.ram || p.ramType || p.ram_type);
    const memory = ramSupport[0] || upper(p.memory || p.ram || p.ramType || p.ram_type);
    const gens = parseGenerations(p.compatibleGenerations || p.compatible_generations || p.supportedGens || p.supported_gens || p.generation || p.gen);
    let storageSupport = parseStorageList(p.storageSupport || p.storage_support || p.ssdSupport || p.ssd_support || p.storage || p.storageType || p.storage_type);
    if(category === 'MOTHERBOARD'){
      if(boolish(p.sataSupport || p.sata_support) && !storageSupport.includes('SATA SSD')) storageSupport.push('SATA SSD');
      if(boolish(p.m2SataSupport || p.m2_sata_support || p.m2Sata || p.m2_sata) && !storageSupport.includes('M.2 SSD')) storageSupport.push('M.2 SSD');
      if(boolish(p.nvmeSupport || p.nvme_support || p.nvme) && !storageSupport.includes('NVME SSD')) storageSupport.push('NVME SSD');
      if(!storageSupport.length) storageSupport.push('SATA SSD');
    }
    const ssdType = storageTypeFromText(p.storageType || p.storage_type || p.ssdType || p.ssd_type || p.interface || p.storage) || (category==='SSD'?'SATA SSD':'');
    const ramSlots = parseRamSlots(p.ramSlots || p.ram_slots || p.slot || p.slots);
    const id = clean(p.id || p.ID) || `${category.replace(/\s+/g,'-')}-${i+1}`;
    return {
      id,
      name: clean(p.name || p.Name || p.productName || p.product_name) || 'Product',
      category,
      condition: upper(p.condition || p.Condition || 'USED'),
      price: toNumber(p.price || p.Price || p.sellingPrice || p.selling_price),
      stock: clean(p.stock || p.Stock || p.qtyStock || p.qty_stock),
      image: clean(p.image || p.Image || p.imageUrl || p.image_url) || 'assets/img/logo.jpg',
      description: clean(p.description || p.Description),
      warranty: clean(p.warranty || p.warranty_period || p.warrantyPeriod),
      warrantyMonths: clean(p.warrantyMonths || p.warranty_months || p.warrantyMonth),
      generation: gens[0] || '',
      generations: gens,
      generationLabel: gens.length ? gens.map(genLabel).join(' / ') : '',
      memory,
      ramSupport: ramSupport.length ? ramSupport : (memory ? [memory] : []),
      ramSlots,
      storageType: ssdType,
      storageSupport: Array.from(new Set(storageSupport)),
      chipset: upper(p.chipset || p.Chipset),
      socket: upper(p.socket || p.Socket),
      compatibleMotherboardIds: parseList(p.compatibleMotherboardIds || p.compatible_motherboard_ids || p.compatibleBoards || p.compatible_boards).map(x=>clean(x)),
      compatibleProcessorIds: parseList(p.compatibleProcessorIds || p.compatible_processor_ids || p.compatibleProcessors || p.compatible_processors).map(x=>clean(x)),
      sortOrder: toNumber(p.sortOrder || p.sort_order),
      active: !['NO','FALSE','0','HIDE','HIDDEN','INACTIVE'].includes(upper(p.active || p.isActive || p.status))
    };
  }

  function warrantyText(p){
    if(clean(p.warranty)) return clean(p.warranty);
    if(clean(p.warrantyMonths)) return `${clean(p.warrantyMonths)} month${Number(p.warrantyMonths)===1?'':'s'} warranty`;
    return p.condition === 'NEW' ? 'Brand warranty / shop warranty as available' : 'Shop checking warranty as available';
  }

  function fetchWithTimeout(url, options={}, timeoutMs=9000){
    const controller = new AbortController();
    const t = setTimeout(()=>controller.abort(), timeoutMs);
    return fetch(url, {...options, signal: controller.signal}).finally(()=>clearTimeout(t));
  }

  function gvizUrlFromSheetUrl(url){
    const u = clean(url);
    if(!u) return '';
    const gidMatch = u.match(/[?#&]gid=(\d+)/);
    const gid = gidMatch ? gidMatch[1] : '0';

    // Published-to-web URL: /spreadsheets/d/e/<PUBLISHED_ID>/pub?...
    const pubMatch = u.match(/\/spreadsheets\/d\/e\/([^/]+)/);
    if(pubMatch){
      return `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/gviz/tq?gid=${gid}&headers=1&tqx=out:json`;
    }

    // Normal shared sheet URL: /spreadsheets/d/<SHEET_ID>/edit?...
    const idMatch = u.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if(idMatch){
      return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/gviz/tq?gid=${gid}&headers=1&tqx=out:json`;
    }
    return '';
  }

  function rowsFromGvizData(data){
    const table = data && data.table;
    if(!table || !Array.isArray(table.cols) || !Array.isArray(table.rows)) return [];
    let headers = table.cols.map(c => clean(c.label || c.id));
    let rows = table.rows.map(r => (r.c || []).map(c => c ? clean(c.f ?? c.v ?? '') : ''));

    // If Google did not detect headers, use first row as headers.
    const headerLooksBad = !headers.some(Boolean) || headers.every(h => /^([A-Z]|[a-z]|col\d+)$/i.test(h));
    if(headerLooksBad && rows.length){
      headers = rows.shift().map(h => clean(h));
    }
    if(!headers.some(Boolean)) return [];
    return rows.map(cols => {
      const obj = {};
      headers.forEach((h,i)=>{ if(h) obj[h] = clean(cols[i] ?? ''); });
      return obj;
    }).filter(obj => Object.values(obj).some(v => clean(v) !== ''));
  }

  async function fetchGvizRows(url, label){
    const gviz = gvizUrlFromSheetUrl(url);
    if(!gviz) return [];
    try{
      const sep = gviz.includes('?') ? '&' : '?';
      const res = await fetchWithTimeout(`${gviz}${sep}v=${Date.now()}`, {cache:'no-store'}, 9000);
      if(!res.ok) throw new Error(`${label} GViz HTTP ${res.status}`);
      const text = await res.text();
      const m = text.match(/setResponse\(([^]*?)\);?\s*$/);
      const data = JSON.parse(m ? m[1] : text);
      const rows = rowsFromGvizData(data);
      if(rows.length) return rows;
    }catch(e){ console.warn(label+' GViz load failed:', e); }
    return [];
  }

  async function fetchCsvRows(url, label){
    try{
      const finalUrl = googleCsvUrl(url);
      const sep = finalUrl.includes('?') ? '&' : '?';
      const res = await fetchWithTimeout(`${finalUrl}${sep}v=${Date.now()}`, {cache:'no-store'}, 9000);
      if(!res.ok) throw new Error(`${label} HTTP ${res.status}`);
      const rows = parseCSV(await res.text());
      if(rows.length) return rows;
    }catch(e){ console.warn(label+' CSV load failed:', e); }

    // Google Sheets sometimes blocks CSV fetch, but GViz JSON can still work on published sheets.
    if(/docs\.google\.com\/spreadsheets/.test(clean(url))){
      const rows = await fetchGvizRows(url, label);
      if(rows.length) return rows;
    }
    return [];
  }

  async function loadProducts(){
    productsCache = null;
    let rows = [];
    if(clean(CONFIG.sheetCsvUrl)) rows = await fetchCsvRows(CONFIG.sheetCsvUrl, 'Google Sheet products');

    // Always try local fallback when the website is opened through http / GitHub Pages.
    if(!rows.length && location.protocol !== 'file:') rows = await fetchCsvRows('data/products.csv', 'Local products.csv');

    const normalized = rows.map(normalizeProduct).filter(p => p.active && p.name && p.category);
    normalized.sort((a,b)=>(a.sortOrder||99999)-(b.sortOrder||99999) || a.name.localeCompare(b.name));
    productsCache = normalized;
    return normalized;
  }

  function getCart(){ try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch{return[]} }
  function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }
  function cartCount(){ return getCart().reduce((s,it)=>s+Number(it.qty||1),0); }
  function updateCartCount(){ $all('[data-cart-count]').forEach(el => el.textContent = cartCount()); }
  function addCartLine(line){
    const cart = getCart();
    const key = line.key || line.id || line.name;
    const found = cart.find(x => (x.key||x.id||x.name) === key && !line.forceNew);
    if(found) found.qty = Number(found.qty||1) + Number(line.qty||1);
    else cart.push({...line, qty:Number(line.qty||1)});
    saveCart(cart);
  }
  function addToCart(id, qty=1){ addCartLine({id, qty:Number(qty||1)}); toast('Added to cart'); }
  function addManyToCart(lines){ lines.forEach(line => addCartLine(line)); toast('Quotation added to cart'); }
  function setQty(key, qty){ const cart=getCart().map(it => ((it.key||it.id||it.name)===key ? {...it, qty:Math.max(1,Number(qty||1))} : it)); saveCart(cart); initCartPage(); }
  function removeFromCart(key){ saveCart(getCart().filter(it => (it.key||it.id||it.name)!==key)); initCartPage(); }

  function bindCommon(){
    updateCartCount();
    $('#mobileMenuBtn')?.addEventListener('click', () => $('#navLinks')?.classList.toggle('open'));
    $all('[data-config-link]').forEach(a => { const key=a.getAttribute('data-config-link'); if(CONFIG[key]){ a.href=CONFIG[key]; a.target='_blank'; a.rel='noopener'; } });
    document.addEventListener('click', e => {
      const btn=e.target.closest('[data-add-to-cart]'); if(btn) addToCart(btn.getAttribute('data-add-to-cart'));
      const rm=e.target.closest('[data-remove-cart]'); if(rm) removeFromCart(rm.getAttribute('data-remove-cart'));
      const pre=e.target.closest('[data-prebuild-whatsapp]'); if(pre) sendPrebuildWhatsApp(pre.getAttribute('data-prebuild-whatsapp'));
    });
    document.addEventListener('change', e => { const qty=e.target.closest('[data-cart-qty]'); if(qty) setQty(qty.getAttribute('data-cart-qty'), qty.value); });
  }

  function initCarousel(slideSelector,dotsSelector,interval=4200){
    const slides=$all(slideSelector), dotsWrap=$(dotsSelector); if(!slides.length || !dotsWrap) return;
    dotsWrap.innerHTML=slides.map((_,i)=>`<span class="slide-dot ${i===0?'active':''}"></span>`).join('');
    const dots=$all('.slide-dot',dotsWrap); let idx=0;
    setInterval(()=>{ slides[idx].classList.remove('active'); dots[idx]?.classList.remove('active'); idx=(idx+1)%slides.length; slides[idx].classList.add('active'); dots[idx]?.classList.add('active'); }, interval);
  }
  function initHome(){ initCarousel('.prebuild-slide','#prebuildDots',3600); initCarousel('.wide-banner-slide','#wideBannerDots',4300); }

  function productCard(p){
    return `<article class="card product-card" data-product-id="${esc(p.id)}" tabindex="0" aria-label="View ${esc(p.name)} details">
      <div class="product-img-wrap"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='assets/img/logo.jpg'">
        <div class="tag-row"><span class="tag ${p.condition==='NEW'?'new':'used'}">${esc(p.condition)}</span>${p.category==='SSD' && p.storageType ? `<span class="tag">${esc(p.storageType)}</span>`:''}</div>
      </div>
      <div class="product-body"><small>${esc(p.category)} ${p.generationLabel?`• ${esc(p.generationLabel)}`:''}${p.memory?` • ${esc(p.memory)}`:''}</small><h3>${esc(p.name)}</h3>
      <p>${esc(p.description || warrantyText(p))}</p>
      <div class="price-row"><strong>${money(p.price)}</strong><span>${p.stock?`Stock: ${esc(p.stock)}`:'Available'}</span></div>
      <div class="action-row"><button class="btn btn-ghost btn-small" data-view-product="${esc(p.id)}">View Details</button><button class="btn btn-primary btn-small" data-add-to-cart="${esc(p.id)}">Add</button></div></div>
    </article>`;
  }

  function ensureProductModal(){
    if($('#productModal')) return;
    const modal=document.createElement('div');
    modal.className='product-modal'; modal.id='productModal'; modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<div class="product-modal-backdrop" data-close-product-modal></div><div class="product-modal-card"><button class="modal-close" data-close-product-modal>×</button><div id="productModalContent"></div></div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {
      if(e.target.closest('[data-close-product-modal]')) closeProductModal();
      const add=e.target.closest('[data-modal-add-to-cart]');
      if(add){
        const id=add.getAttribute('data-modal-add-to-cart');
        const qty=Math.max(1, Number($('#modalProductQty')?.value||1));
        const slot=$('#modalRamSlotOption')?.value || '';
        addToCart(id, qty);
        if(slot==='4') addCartLine({key:`RAM-SLOT-4-${id}`, name:'Motherboard RAM Slot 4 Upgrade', price:RAM_SLOT_4_EXTRA, qty:1, category:'OPTION', condition:'EXTRA', custom:true});
        closeProductModal();
      }
    });
  }
  function closeProductModal(){ const modal=$('#productModal'); if(!modal)return; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); }
  function openProductModal(id){
    ensureProductModal(); const p=(productsCache||[]).find(x=>x.id===id); if(!p)return;
    const slotOptions = p.category==='MOTHERBOARD' && p.ramSlots.length ? `<div class="modal-field"><label>RAM Slot Option</label><select id="modalRamSlotOption">${p.ramSlots.map(s=>`<option value="${esc(s)}">RAM Slot ${esc(s)}${s==='4'?` (+${money(RAM_SLOT_4_EXTRA)})`:''}</option>`).join('')}</select></div>` : '';
    const support = [
      p.generationLabel ? `Generation: ${p.generationLabel}` : '',
      p.ramSupport?.length ? `RAM Support: ${p.ramSupport.join(' / ')}` : '',
      p.ramSlots?.length ? `RAM Slots: ${p.ramSlots.map(s=>'Slot '+s).join(' / ')}` : '',
      p.storageSupport?.length ? `SSD Support: ${p.storageSupport.join(' / ')}` : '',
      p.storageType ? `Storage Type: ${p.storageType}` : '',
      p.chipset ? `Chipset: ${p.chipset}` : ''
    ].filter(Boolean).map(x=>`<span class="tag">${esc(x)}</span>`).join('');
    $('#productModalContent').innerHTML=`<div class="modal-product-view"><div><img class="modal-product-img" src="${esc(productImage(p))}" onerror="this.src='assets/img/logo.jpg'" alt="${esc(p.name)}"></div><div><small class="eyebrow">${esc(p.category)} • ${esc(p.condition)}</small><h2>${esc(p.name)}</h2><div class="modal-price">${money(p.price)}</div><p class="muted">${esc(p.description || 'Product details and availability can be confirmed before order.')}</p><div class="modal-tags">${support}</div><div class="modal-info-grid"><div><b>Warranty</b><span>${esc(warrantyText(p))}</span></div><div><b>Stock</b><span>${esc(p.stock || 'Available')}</span></div></div>${slotOptions}<div class="modal-cart-row"><input class="input qty-input" id="modalProductQty" type="number" min="1" value="1"><button class="btn btn-primary" data-modal-add-to-cart="${esc(p.id)}">Add To Cart</button></div></div></div>`;
    const modal=$('#productModal'); modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
  }

  async function initProductsPage(){
    const products=await loadProducts(); const grid=$('#productsGrid'); if(!grid)return;
    ensureProductModal();
    document.addEventListener('click', e=>{ const view=e.target.closest('[data-view-product]'); if(view){ e.preventDefault(); openProductModal(view.getAttribute('data-view-product')); }});
    grid.addEventListener('click', e=>{ if(e.target.closest('button'))return; const card=e.target.closest('[data-product-id]'); if(card) openProductModal(card.getAttribute('data-product-id')); });
    const catFilter=$('#categoryFilter'); if(catFilter && catFilter.children.length<2) CATEGORIES.forEach(cat=>{ const o=document.createElement('option'); o.value=cat; o.textContent=cat; catFilter.appendChild(o); });
    const inputs=['#productSearch','#categoryFilter','#conditionFilter','#memoryFilter','#generationFilter','#storageFilter'].map(id=>$(id)).filter(Boolean); inputs.forEach(el=>el.addEventListener('input',render)); inputs.forEach(el=>el.addEventListener('change',render));
    function render(){
      const q=upper($('#productSearch')?.value), cat=upper($('#categoryFilter')?.value), cond=upper($('#conditionFilter')?.value), mem=upper($('#memoryFilter')?.value), gen=normalizeGenKey($('#generationFilter')?.value), store=upper($('#storageFilter')?.value);
      const filtered=products.filter(p=>{
        const hay=upper([p.name,p.category,p.condition,p.memory,p.generationLabel,p.chipset,p.socket,p.description,p.storageType,(p.storageSupport||[]).join(' ')].join(' '));
        const pGens=p.generations||[];
        return (!q||hay.includes(q)) && (!cat||p.category===cat) && (!cond||p.condition===cond) && (!mem||(p.ramSupport||[]).includes(mem)||p.memory===mem) && (!gen||pGens.includes(gen)) && (!store||p.storageType===store||(p.storageSupport||[]).includes(store));
      });
      grid.innerHTML=filtered.length?filtered.map(productCard).join(''):`<div class="empty-state"><h2>No products found</h2><p>Products load වෙලා නැහැ. Google Sheet එක Publish to web → CSV කරලා තියෙනවද සහ config.js sheetCsvUrl link එක හරියට තියෙනවද බලන්න.</p></div>`;
      $('#resultCount')&&( $('#resultCount').textContent=`${filtered.length} products` );
    }
    render();
  }

  function prebuildCard(p){ return `<article class="card prebuild-card" data-prebuild-id="${esc(p.id)}" tabindex="0"><img src="${esc(p.image)}" onerror="this.src='assets/img/logo.jpg'" alt="${esc(p.title)}"><div class="prebuild-body"><small>${esc(p.tag)}</small><h3>${esc(p.title)}</h3><div class="modal-price">${esc(p.price)}</div><ul>${p.specs.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><div class="action-row"><button class="btn btn-ghost btn-small" data-view-prebuild="${esc(p.id)}">View</button><button class="btn btn-whatsapp btn-small" data-prebuild-whatsapp="${esc(p.id)}">WhatsApp</button></div></div></article>`; }
  function ensurePrebuildModal(){
    if($('#prebuildModal'))return;
    const modal=document.createElement('div'); modal.className='product-modal'; modal.id='prebuildModal'; modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<div class="product-modal-backdrop" data-close-prebuild-modal></div><div class="product-modal-card"><button class="modal-close" data-close-prebuild-modal>×</button><div id="prebuildModalContent"></div></div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{ if(e.target.closest('[data-close-prebuild-modal]')) closePrebuildModal(); const o=e.target.closest('[data-modal-prebuild-order]'); if(o)sendPrebuildWhatsApp(o.getAttribute('data-modal-prebuild-order')); });
  }
  function closePrebuildModal(){ const modal=$('#prebuildModal'); if(!modal)return; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); }
  function openPrebuildModal(id){ ensurePrebuildModal(); const p=PREBUILDS.find(x=>x.id===id); if(!p)return; $('#prebuildModalContent').innerHTML=`<div class="modal-product-view"><img class="modal-product-img" src="${esc(p.image)}" onerror="this.src='assets/img/logo.jpg'" alt="${esc(p.title)}"><div><small class="eyebrow">${esc(p.tag)}</small><h2>${esc(p.title)}</h2><div class="modal-price">${esc(p.price)}</div><p class="muted">${esc(p.description)}</p><ul>${p.specs.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><div class="modal-info-grid"><div><b>Warranty</b><span>${esc(p.warranty)}</span></div></div><button class="btn btn-whatsapp" data-modal-prebuild-order="${esc(p.id)}">Order on WhatsApp</button></div></div>`; const modal=$('#prebuildModal'); modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); }
  function initPrebuildPage(){ const grid=$('#prebuildGrid'); if(!grid)return; ensurePrebuildModal(); grid.innerHTML=PREBUILDS.map(prebuildCard).join(''); grid.addEventListener('click',e=>{ const v=e.target.closest('[data-view-prebuild]'); if(v){e.preventDefault(); openPrebuildModal(v.getAttribute('data-view-prebuild')); return;} if(e.target.closest('button'))return; const c=e.target.closest('[data-prebuild-id]'); if(c)openPrebuildModal(c.getAttribute('data-prebuild-id')); }); }
  function sendPrebuildWhatsApp(id){ const p=PREBUILDS.find(x=>x.id===id); if(!p)return; const num=clean(CONFIG.whatsappNumber).replace(/\D/g,''); const text=`${CONFIG.businessName||'Sandaruwan Computer'}\nPre Build PC Order Request\n\nPackage: ${p.title}\nPrice: ${p.price}\nSpecs:\n- ${p.specs.join('\n- ')}\n\nPlease confirm availability and final price.`; window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`,'_blank'); }

  function byId(products,id){ return products.find(p=>p.id===id); }
  function optionHTML(p){ return `<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)}${p.storageType?` • ${esc(p.storageType)}`:''}${p.condition?` (${esc(p.condition)})`:''}</option>`; }
  function fillSelect(sel, items, placeholder){ if(!sel)return; sel.innerHTML=`<option value="">${esc(placeholder)}</option>`+items.map(optionHTML).join(''); sel.disabled=false; }
  function isBoardCompatible(cpu, board){
    if(!cpu || !board || board.category!=='MOTHERBOARD') return false;
    if(cpu.compatibleMotherboardIds?.length) return cpu.compatibleMotherboardIds.map(upper).includes(upper(board.id));
    if(board.compatibleProcessorIds?.length) return board.compatibleProcessorIds.map(upper).includes(upper(cpu.id));
    const cpuGens=cpu.generations?.length?cpu.generations:[cpu.generation].filter(Boolean);
    if(cpuGens.length && board.generations?.some(g=>cpuGens.includes(g))) return true;
    const gen=cpuGens[0]; const rule=COMPAT_RULES[gen];
    return !!(rule && (rule.chipsets.includes(board.chipset) || (board.ramSupport||[]).includes(rule.ram)));
  }
  function isRamCompatible(ram, board, cpu){
    if(ram.category!=='RAM')return false;
    if(board && board.ramSupport?.length) return board.ramSupport.includes(ram.memory);
    const gen=(cpu?.generations||[])[0] || cpu?.generation; const rule=COMPAT_RULES[gen];
    return rule ? ram.memory===rule.ram : true;
  }
  function isSsdCompatibleWithBoard(ssd, board){
    if(ssd.category!=='SSD')return false;
    if(!board) return true;
    const type=ssd.storageType || 'SATA SSD';
    const supports=board.storageSupport?.length ? board.storageSupport : ['SATA SSD'];
    return supports.includes(type);
  }
  function qtyVal(id){ return Math.max(1, Number($(id)?.value || 1)); }

  async function initQuotationPage(){
    const products=await loadProducts(); quoteProducts=products;
    const processor=$('#quoteProcessor'), mobo=$('#quoteMotherboard'), ram=$('#quoteRam'), ramSlot=$('#quoteRamSlot'), ssdSel=$('#quoteSsd'); if(!processor)return;
    fillSelect(processor, products.filter(p=>p.category==='PROCESSOR'), 'Select processor');
    $all('[data-quote-select]').forEach(sel=>{ const cat=sel.getAttribute('data-quote-select'); fillSelect(sel, products.filter(p=>p.category===cat), `Skip ${cat}`); sel.addEventListener('change', renderQuote); });

    function updateRamSlots(board){
      if(!ramSlot)return;
      if(!board){ ramSlot.innerHTML='<option value="">Select motherboard first</option>'; ramSlot.disabled=true; return; }
      const slots=board.ramSlots?.length ? board.ramSlots : ['2'];
      ramSlot.innerHTML=slots.map(s=>`<option value="${esc(s)}">RAM Slot ${esc(s)}${s==='4'?` (+${money(RAM_SLOT_4_EXTRA)})`:''}</option>`).join('');
      ramSlot.disabled=false;
    }
    function updateSsdSelect(){
      const board=byId(products, mobo?.value); const current=ssdSel?.value;
      const ssds=products.filter(p=>isSsdCompatibleWithBoard(p,board));
      fillSelect(ssdSel, ssds, board?'Select compatible SSD':'Skip SSD');
      if(ssds.some(p=>p.id===current)) ssdSel.value=current;
      const note=$('#storageCompatNote');
      if(note){
        if(board) note.innerHTML=`Selected motherboard: <b>${esc(board.name)}</b> • RAM slots: <b>${esc((board.ramSlots.length?board.ramSlots:['2']).map(s=>'Slot '+s).join(' / '))}</b> • SSD support: <b>${esc((board.storageSupport||['SATA SSD']).join(' / '))}</b>`;
        else note.textContent='Motherboard එක select කළාම RAM Slot 2/4 සහ SATA / M.2 / NVMe SSD compatibility auto filter වෙයි.';
      }
    }
    function updateAfterProcessor(){
      const cpu=byId(products, processor.value);
      if(!cpu){ fillSelect(mobo, [], 'Select processor first'); mobo.disabled=true; fillSelect(ram, [], 'Select processor first'); ram.disabled=true; updateRamSlots(null); updateSsdSelect(); renderQuote(); return; }
      const boards=products.filter(p=>isBoardCompatible(cpu,p));
      fillSelect(mobo, boards, 'Select compatible motherboard');
      const boardRamTypes=Array.from(new Set(boards.flatMap(b=>b.ramSupport||[])));
      const rams=products.filter(p=>p.category==='RAM' && (!boardRamTypes.length || boardRamTypes.includes(p.memory)));
      fillSelect(ram, rams, 'Select compatible RAM');
      const rule=COMPAT_RULES[(cpu.generations||[])[0] || cpu.generation];
      $('#compatNote') && ( $('#compatNote').innerHTML = `<b>${esc(cpu.name)}</b> selected. ${boards.length?`${boards.length} compatible motherboard(s) found from Google Sheet.`:'No compatible motherboard found. Check compatibleMotherboardIds / compatibleGenerations in Google Sheet.'}${rule?` Default RAM: <b>${esc(rule.ram)}</b>`:''}` );
      updateRamSlots(null); updateSsdSelect(); renderQuote();
    }
    function updateAfterMotherboard(){
      const cpu=byId(products, processor.value); const board=byId(products,mobo.value);
      updateRamSlots(board);
      const rams=products.filter(p=>isRamCompatible(p,board,cpu));
      const current=ram.value; fillSelect(ram, rams, board?'Select compatible RAM':'Select compatible RAM'); if(rams.some(x=>x.id===current)) ram.value=current;
      updateSsdSelect(); renderQuote();
    }

    processor.addEventListener('change', updateAfterProcessor);
    mobo.addEventListener('change', updateAfterMotherboard);
    [ram, ramSlot, $('#quoteRamQty'), $('#quoteSsdQty'), $('#quoteHardDiskQty')].forEach(el=>el?.addEventListener('input', renderQuote));
    [ram, ramSlot, $('#quoteRamQty'), $('#quoteSsdQty'), $('#quoteHardDiskQty')].forEach(el=>el?.addEventListener('change', renderQuote));
    $all('[data-cable-option], [data-cable-qty]').forEach(el=>{ el.addEventListener('input',renderQuote); el.addEventListener('change',renderQuote); });
    $('#addQuoteToCartBtn')?.addEventListener('click',()=>{ const lines=getQuoteCartLines(); if(!lines.length){toast('Select products first'); return;} addManyToCart(lines); });
    $('#downloadQuotePdfBtn')?.addEventListener('click', downloadQuotationPdf);
    updateSsdSelect(); renderQuote();
  }

  function productLine(id, qty=1){ const p=byId(quoteProducts,id); return p ? {type:'product', product:p, qty:Number(qty||1), id:p.id, name:p.name, price:p.price, condition:p.condition, category:p.category} : null; }
  function selectedProductLines(){
    const lines=[];
    const add=(id,qty=1)=>{ const l=productLine(id,qty); if(l)lines.push(l); };
    add($('#quoteProcessor')?.value,1);
    add($('#quoteMotherboard')?.value,1);
    const slot=$('#quoteRamSlot')?.value; if(slot==='4') lines.push({type:'custom', key:'quote-ram-slot-4', name:'Motherboard RAM Slot 4 Upgrade', price:RAM_SLOT_4_EXTRA, qty:1, condition:'EXTRA', category:'OPTION'});
    add($('#quoteRam')?.value, qtyVal('#quoteRamQty'));
    $all('[data-quote-select]').forEach(sel=>{
      const cat=sel.getAttribute('data-quote-select');
      let qty=1; if(cat==='SSD') qty=qtyVal('#quoteSsdQty'); if(cat==='HARD DISK') qty=qtyVal('#quoteHardDiskQty');
      add(sel.value, qty);
    });
    $all('[data-cable-option]').forEach(cb=>{
      if(!cb.checked) return;
      const name=cb.getAttribute('data-cable-option');
      const qty=Math.max(1, Number($(`[data-cable-qty="${CSS.escape(name)}"]`)?.value || 1));
      const item=quoteProducts.find(p=>p.category==='CABLES' && upper(p.name).includes(upper(name.replace(' CABLE',''))));
      if(item) lines.push({type:'product', product:item, id:item.id, name:item.name, price:item.price, qty, condition:item.condition, category:item.category});
      else lines.push({type:'custom', key:'quote-'+name, name, price:0, qty, condition:'CONFIRM', category:'CABLES'});
    });
    return lines;
  }
  function getQuoteCartLines(){ return selectedProductLines().map(l=> l.type==='product' ? {id:l.id, qty:l.qty} : {key:l.key, name:l.name, price:l.price, qty:l.qty, condition:l.condition, category:l.category, custom:true}); }
  function renderQuote(){
    const tbody=$('#quoteTable tbody'); if(!tbody)return;
    const lines=selectedProductLines(); const total=lines.reduce((s,l)=>s+(l.price*l.qty),0);
    tbody.innerHTML=lines.length?lines.map(l=>`<tr><td>${esc(l.name)}<br><span class="muted">${esc(l.category)}${l.product?.memory?` • ${esc(l.product.memory)}`:''}</span></td><td>${esc(l.qty)}</td><td>${esc(l.condition||'')}</td><td>${money(l.price*l.qty)}</td></tr>`).join(''):'<tr><td colspan="4" class="muted">No items selected yet.</td></tr>';
    $('#quoteTotal') && ($('#quoteTotal').textContent=money(total));
  }
  function quoteCustomer(){ return {name:clean($('#quoteCustomerName')?.value), phone:clean($('#quoteCustomerPhone')?.value), email:clean($('#quoteCustomerEmail')?.value), address:clean($('#quoteCustomerAddress')?.value)}; }
  function validateQuoteCustomer(){ const c=quoteCustomer(); if(!c.name||!c.phone||!c.email||!c.address){toast('Fill customer name, phone, email and address'); return null;} return c; }
  function pdfText(doc,text,x,y,opts={}){ doc.text(String(text),x,y,opts); }
  function docFooter(doc){ const h=doc.internal.pageSize.getHeight(); doc.setFillColor(5,10,28); doc.rect(0,h-36,595,36,'F'); doc.setTextColor(170,190,215); doc.setFont('helvetica','normal'); doc.setFontSize(8); pdfText(doc,'Prices and availability can change. Please confirm before payment. Generated by Sandaruwan Computer online quotation system.',40,h-15); }
  function drawHeader(doc,title,subtitle){ doc.setFillColor(5,10,28); doc.rect(0,0,595,106,'F'); doc.setFillColor(11,188,255); doc.rect(0,102,595,4,'F'); if(CONFIG.logoDataUrl){try{doc.addImage(CONFIG.logoDataUrl,'PNG',40,24,58,58)}catch(e){}} doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(22); pdfText(doc,CONFIG.businessName||'Sandaruwan Computer',112,45); doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(195,214,239); pdfText(doc,CONFIG.tagline||'PC Builds • Computer Parts',112,64); doc.setFont('helvetica','bold'); doc.setFontSize(15); doc.setTextColor(255,255,255); pdfText(doc,title,408,42); doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(195,214,239); pdfText(doc,subtitle,408,60); pdfText(doc,`Date: ${todayString()}`,408,78); }
  async function downloadQuotationPdf(){
    const customer=validateQuoteCustomer(); if(!customer)return; const lines=selectedProductLines(); if(!lines.length){toast('Select products first'); return;}
    const jsPDF=window.jspdf&&window.jspdf.jsPDF; if(!jsPDF){window.print(); return;} const doc=new jsPDF({unit:'pt',format:'a4'}); const qn=quoteNo(); const total=lines.reduce((s,l)=>s+l.price*l.qty,0); drawHeader(doc,'ONLINE QUOTATION',`Quote No: ${qn}`);
    let y=132; doc.setFillColor(247,251,255); doc.roundedRect(40,y,515,84,12,12,'F'); doc.setDrawColor(220,231,245); doc.roundedRect(40,y,515,84,12,12,'S'); doc.setTextColor(5,10,28); doc.setFont('helvetica','bold'); doc.setFontSize(11); pdfText(doc,'CUSTOMER DETAILS',58,y+22); doc.setFont('helvetica','normal'); doc.setFontSize(10); pdfText(doc,`Name: ${customer.name}`,58,y+43); pdfText(doc,`Phone: ${customer.phone}`,305,y+43); pdfText(doc,`Email: ${customer.email}`,58,y+62); pdfText(doc,`Address: ${customer.address}`,305,y+62); y+=110;
    doc.setFillColor(11,188,255); doc.roundedRect(40,y,515,28,8,8,'F'); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(9); pdfText(doc,'#',55,y+18); pdfText(doc,'ITEM',82,y+18); pdfText(doc,'QTY',335,y+18); pdfText(doc,'CONDITION',382,y+18); pdfText(doc,'PRICE',482,y+18); y+=28;
    doc.setFont('helvetica','normal'); doc.setTextColor(25,34,54); doc.setFontSize(9); lines.forEach((l,i)=>{ if(y>690){docFooter(doc);doc.addPage();drawHeader(doc,'ONLINE QUOTATION',`Quote No: ${qn}`);y=132;} doc.setFillColor(i%2?255:245,i%2?255:248,i%2?255:253); doc.rect(40,y,515,38,'F'); pdfText(doc,String(i+1),55,y+23); pdfText(doc,l.name.slice(0,48),82,y+16); doc.setTextColor(95,110,130); pdfText(doc,l.category||'',82,y+30); doc.setTextColor(25,34,54); pdfText(doc,String(l.qty),335,y+23); pdfText(doc,l.condition||'',382,y+23); pdfText(doc,money(l.price*l.qty),482,y+23); y+=38; });
    doc.setFillColor(5,10,28); doc.roundedRect(330,y+14,225,44,10,10,'F'); doc.setTextColor(185,210,235); doc.setFont('helvetica','bold'); doc.setFontSize(10); pdfText(doc,'TOTAL ESTIMATE',348,y+40); doc.setTextColor(255,255,255); doc.setFontSize(15); pdfText(doc,money(total),452,y+40); y+=86;
    doc.setFillColor(235,248,255); doc.roundedRect(40,y,515,82,12,12,'F'); doc.setDrawColor(205,225,240); doc.roundedRect(40,y,515,82,12,12,'S'); doc.setTextColor(5,10,28); doc.setFont('helvetica','bold'); doc.setFontSize(11); pdfText(doc,'BANK DETAILS',58,y+22); doc.setFont('helvetica','normal'); doc.setFontSize(10); pdfText(doc,`${CONFIG.bank?.name||''} | Account No: ${CONFIG.bank?.accountNumber||''}`,58,y+44); pdfText(doc,`Account Name: ${CONFIG.bank?.accountName||''}`,58,y+62); pdfText(doc,`Branch: ${CONFIG.bank?.branch||''}`,355,y+62); y+=108; doc.setTextColor(40,52,72); doc.setFontSize(9); pdfText(doc,`Contact: ${CONFIG.phoneDisplay||''} | Location: ${CONFIG.address||''}`,40,y); docFooter(doc); doc.save(`sandaruwan-computer-quotation-${qn}.pdf`);
  }

  async function cartItems(){
    const products=await loadProducts(); const cart=getCart();
    return cart.map((it,idx)=>{
      const p=it.id ? byId(products,it.id) : null;
      if(p) return {key:it.id, product:p, qty:Number(it.qty||1)};
      if(it.custom || it.name) return {key:it.key||`custom-${idx}`, product:{id:it.key||`custom-${idx}`, name:it.name, price:toNumber(it.price), image:'assets/img/logo.jpg', category:it.category||'OPTION', condition:it.condition||''}, qty:Number(it.qty||1)};
      return null;
    }).filter(Boolean);
  }
  async function initCartPage(){ const view=$('#cartView'); if(!view)return; const items=await cartItems(); if(!items.length){ view.innerHTML='<div class="empty-state"><h2>Your cart is empty</h2><p>Add products or create an online quotation first.</p><div class="action-row" style="justify-content:center"><a class="btn btn-primary" href="products.html">View Products</a><a class="btn btn-ghost" href="quotation.html">Online Quotation</a></div></div>'; return; } const total=items.reduce((s,x)=>s+x.product.price*x.qty,0); view.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>${items.map(({key,product:p,qty})=>`<tr><td><div class="cart-product"><img src="${esc(productImage(p))}" onerror="this.src='assets/img/logo.jpg'" alt=""><div><b>${esc(p.name)}</b><br><span class="muted">${esc(p.category)} ${p.memory?`• ${esc(p.memory)}`:''}</span></div></div></td><td>${money(p.price)}</td><td><input class="input qty-input" type="number" min="1" value="${qty}" data-cart-qty="${esc(key)}"></td><td>${money(p.price*qty)}</td><td><button class="btn btn-danger btn-small" data-remove-cart="${esc(key)}">Remove</button></td></tr>`).join('')}</tbody></table></div><div class="total-row"><span>Cart Total</span><strong>${money(total)}</strong></div><div class="cart-actions"><button class="btn btn-danger" id="clearCartBtn">Clear Cart</button><a class="btn btn-primary" href="checkout.html">Checkout</a></div>`; $('#clearCartBtn')?.addEventListener('click',()=>{saveCart([]);initCartPage();toast('Cart cleared')}); }
  async function renderCheckoutSummary(){ const wrap=$('#checkoutSummary'); if(!wrap)return; const items=await cartItems(); if(!items.length){wrap.innerHTML='<div class="empty-state">Cart එක හිස්. Products page එකෙන් items add කරන්න.</div>';return} const total=items.reduce((s,x)=>s+x.product.price*x.qty,0); wrap.innerHTML=`<div class="table-wrap"><table><tbody>${items.map(x=>`<tr><td>${esc(x.product.name)} × ${x.qty}</td><td>${money(x.product.price*x.qty)}</td></tr>`).join('')}</tbody></table></div><div class="total-row"><span>Total</span><strong>${money(total)}</strong></div>`; }
  async function buildReceiptText(){ const items=await cartItems(); const total=items.reduce((s,x)=>s+x.product.price*x.qty,0); const name=clean($('#customerName')?.value)||'Customer'; const phone=clean($('#customerPhone')?.value)||'-'; const address=clean($('#customerAddress')?.value)||'-'; const note=clean($('#customerNote')?.value)||'-'; const itemLines=items.length?items.map((x,i)=>`${i+1}. ${x.product.name} x ${x.qty} = ${money(x.product.price*x.qty)}`).join('\n'):'No cart items'; return `${CONFIG.businessName||'Sandaruwan Computer'}\nORDER RECEIPT\nDate: ${todayString()}\n\nCustomer: ${name}\nPhone: ${phone}\nAddress: ${address}\nNote: ${note}\n\nItems:\n${itemLines}\n\nTotal: ${money(total)}\n\nBank Details:\n${CONFIG.bank?.name||''}\nAccount No: ${CONFIG.bank?.accountNumber||''}\nAccount Name: ${CONFIG.bank?.accountName||''}\nBranch: ${CONFIG.bank?.branch||''}`; }
  async function downloadReceiptPdf(){ const jsPDF=window.jspdf&&window.jspdf.jsPDF; if(!jsPDF){window.print();return} lastReceiptText=await buildReceiptText(); const doc=new jsPDF({unit:'pt',format:'a4'}); drawHeader(doc,'ORDER RECEIPT',`Date: ${todayString()}`); let y=132; doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(25,34,54); lastReceiptText.split('\n').forEach(line=>{ if(y>740){docFooter(doc);doc.addPage();drawHeader(doc,'ORDER RECEIPT',`Date: ${todayString()}`);y=132;} pdfText(doc,line,48,y); y+=16; }); docFooter(doc); doc.save('sandaruwan-computer-receipt.pdf'); }
  async function initCheckoutPage(){ const bank=$('#bankDetails'); if(bank){ const b=CONFIG.bank||{}; bank.innerHTML=`<div><span>Bank</span><b>${esc(b.name||'')}</b></div><div><span>Account Number</span><b>${esc(b.accountNumber||'')}</b></div><div><span>Account Name</span><b>${esc(b.accountName||'')}</b></div><div><span>Branch</span><b>${esc(b.branch||'')}</b></div>`; } await renderCheckoutSummary(); $('#placeOrderBtn')?.addEventListener('click',async()=>{ lastReceiptText=await buildReceiptText(); const box=$('#receiptBox'); if(box){box.style.display='block';box.textContent=lastReceiptText} const num=clean(CONFIG.whatsappNumber).replace(/\D/g,''); window.open(`https://wa.me/${num}?text=${encodeURIComponent(lastReceiptText)}`,'_blank'); }); $('#downloadReceiptBtn')?.addEventListener('click',downloadReceiptPdf); }

  function initAdminPage(){
    const link=$('#configuredSheetLink'); if(link){ const url=googleCsvUrl(CONFIG.sheetCsvUrl||''); if(url){ link.textContent='Configured Google Sheet CSV link'; link.href=url; link.style.display='inline-flex'; } }
  }

  document.addEventListener('DOMContentLoaded', async ()=>{
    bindCommon();
    bindPopupSafety();
    const page=document.body.dataset.page;
    try{
      if(page==='home') initHome();
      if(page==='products') await initProductsPage();
      if(page==='quotation') await initQuotationPage();
      if(page==='prebuild') initPrebuildPage();
      if(page==='cart') await initCartPage();
      if(page==='checkout') await initCheckoutPage();
      if(page==='admin') initAdminPage();
    }catch(e){ console.error(e); toast('Page load error. Check Google Sheet link / products columns.'); }
  });
})();
