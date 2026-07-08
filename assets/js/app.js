(function(){
  'use strict';

  const CONFIG = window.SC_CONFIG || {};
  const CART_KEY = 'sandaruwan_computer_cart_v4';
  const ADMIN_PRODUCTS_KEY = 'sandaruwan_computer_admin_products_v2_blank';
  const ADMIN_DELETED_KEY = 'sandaruwan_computer_deleted_product_ids_v2_blank';

  const CATEGORIES = [
    'PROCESSOR','MOTHERBOARD','CPU COOLER','RAM','HARD DISK','SSD','POWER SUPPLY','CABLES','MONITOR','KEYBOARD','MOUSE','SPEAKER','HEADSET','CASING'
  ];

  const CATEGORY_ALIASES = {
    PROSSR:'PROCESSOR',PROSSOR:'PROCESSOR',PROCESSER:'PROCESSOR',PROCESSOR:'PROCESSOR',
    MOTHERBORD:'MOTHERBOARD',MOTHERBOARD:'MOTHERBOARD',BOARD:'MOTHERBOARD',
    CASIN:'CASING',CASING:'CASING',CPUCOOLER:'CPU COOLER',COOLER:'CPU COOLER',
    HARD:'HARD DISK',HDD:'HARD DISK',HARDDISK:'HARD DISK','HARD DISK':'HARD DISK',
    POWERSUPPLY:'POWER SUPPLY',PSU:'POWER SUPPLY','POWER SUPPLY':'POWER SUPPLY',
    CABLE:'CABLES',CABLES:'CABLES',KEYBORD:'KEYBOARD',KEYBOARD:'KEYBOARD',
    HEDSET:'HEADSET',HEADSET:'HEADSET',RAM:'RAM',SSD:'SSD',MONITOR:'MONITOR',MOUSE:'MOUSE',SPEAKER:'SPEAKER'
  };

  const COMPAT_RULES = {
    CORE2DUO:{label:'CORE 2 DUO',ram:'DDR3',chipsets:['G41'],socket:'LGA775'},
    2:{label:'2ND GEN',ram:'DDR3',chipsets:['H61','B75'],socket:'LGA1155'},
    3:{label:'3RD GEN',ram:'DDR3',chipsets:['H61','B75'],socket:'LGA1155'},
    4:{label:'4TH GEN',ram:'DDR3',chipsets:['H81','B85'],socket:'LGA1150'},
    5:{label:'5TH GEN',ram:'DDR3',chipsets:['H81','B85'],socket:'LGA1150'},
    6:{label:'6TH GEN',ram:'DDR4',chipsets:['H110','H110 M.2','B150','B250','Z270','H270','H170'],socket:'LGA1151'},
    7:{label:'7TH GEN',ram:'DDR4',chipsets:['H110','H110 M.2','B150','B250','Z270','H270','H170'],socket:'LGA1151'},
    8:{label:'8TH GEN',ram:'DDR4',chipsets:['B360','B365','Z360','H370'],socket:'LGA1151'},
    9:{label:'9TH GEN',ram:'DDR4',chipsets:['B360','B365','Z360','H370','H410'],socket:'LGA1151'},
    10:{label:'10TH GEN',ram:'DDR4',chipsets:['H410'],socket:'LGA1200'}
  };

  const DEFAULT_PRODUCTS = [];
  const PREBUILDS = [
  {
    "id": "PB-OFFICE-DDR3",
    "title": "Office Value PC",
    "price": "From Rs. 58,500",
    "image": "assets/img/prebuild/prebuild-office-ddr3.jpg",
    "specs": [
      "Intel Core i5 4th Gen",
      "H81/B85 Motherboard",
      "8GB DDR3 RAM",
      "128GB SSD",
      "Office, POS and study work"
    ],
    "tag": "Best budget",
    "warranty": "Shop warranty as available",
    "description": "Budget friendly ready PC package for office, POS, billing, browsing and study work."
  },
  {
    "id": "PB-STUDY-DDR4",
    "title": "Study / Home PC",
    "price": "From Rs. 79,500",
    "image": "assets/img/prebuild/prebuild-study-ddr4.jpg",
    "specs": [
      "Intel Core i5 6th Gen",
      "H110 DDR4 Motherboard",
      "8GB DDR4 RAM",
      "256GB SSD",
      "Online classes and daily use"
    ],
    "tag": "DDR4 value",
    "warranty": "Shop warranty as available",
    "description": "DDR4 value package for home, online classes, office work and daily multitasking."
  },
  {
    "id": "PB-GAMING-STARTER",
    "title": "Gaming Starter PC",
    "price": "From Rs. 128,000",
    "image": "assets/img/prebuild/prebuild-gaming-starter.jpg",
    "specs": [
      "Intel Core i5 8th Gen",
      "B360/H310 Motherboard",
      "16GB DDR4 RAM",
      "SSD + optional graphics card",
      "Free Fire, GTA V and eSports starter"
    ],
    "tag": "Popular",
    "warranty": "Shop warranty as available",
    "description": "Gaming starter PC package with compatible parts and graphics card upgrade option."
  },
  {
    "id": "PB-MODERN-I3",
    "title": "Modern Desktop PC",
    "price": "From Rs. 149,000",
    "image": "assets/img/prebuild/prebuild-modern-i3.jpg",
    "specs": [
      "Intel Core i3 10th Gen",
      "H410 Motherboard",
      "8GB/16GB DDR4 RAM",
      "Fast SSD storage",
      "Office, design and multitasking"
    ],
    "tag": "Newer platform",
    "warranty": "Shop / brand warranty as available",
    "description": "Modern DDR4 platform package for office, design basics, browsing and multitasking."
  },
  {
    "id": "PB-CUSTOM",
    "title": "Custom Build Package",
    "price": "Custom price",
    "image": "assets/img/prebuild/prebuild-custom.jpg",
    "specs": [
      "Choose your processor generation",
      "Matched motherboard and RAM",
      "SSD/HDD/monitor/accessories",
      "Professional quotation PDF",
      "WhatsApp order support"
    ],
    "tag": "Build your way",
    "warranty": "Depends on selected parts",
    "description": "Custom PC build package with matched processor, motherboard, RAM, SSD, case, power supply and accessories."
  }
];

  const RAM_SLOT_4_EXTRA = 500;
  const CABLE_QUOTE_TYPES = ['POWER CABLE','VGA CABLE','HDMI CABLE','DVI CABLE'];

  let productsCache = null;
  let quoteProducts = [];
  let lastReceiptText = '';

  function $(sel, root=document){return root.querySelector(sel)}
  function $all(sel, root=document){return Array.from(root.querySelectorAll(sel))}
  function clean(v){return String(v ?? '').trim()}
  function upper(v){return clean(v).toUpperCase()}
  function esc(s){return clean(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function toNumber(v){const n=Number(String(v??0).replace(/[^0-9.]/g,''));return Number.isFinite(n)?n:0}
  function money(n){return 'Rs. '+toNumber(n).toLocaleString('en-LK')}
  function categoryName(v){const raw=upper(v);const compact=raw.replace(/[^A-Z0-9]/g,'');return CATEGORY_ALIASES[raw]||CATEGORY_ALIASES[compact]||raw}
  function normalizeGenKey(v){
    const s=upper(v).replace(/[^A-Z0-9]/g,'');
    if(!s)return '';
    if(s.includes('CORE2DUO')||s==='C2D'||s==='DUO')return 'CORE2DUO';
    const m=s.match(/10|[2-9]/);
    return m?m[0]:'';
  }
  function parseGenerations(v){
    if(Array.isArray(v))return v.map(normalizeGenKey).filter(Boolean);
    const raw=upper(v);
    if(!raw)return [];
    const out=[];
    if(raw.replace(/[^A-Z0-9]/g,'').includes('CORE2DUO'))out.push('CORE2DUO');
    const nums=raw.match(/10|[2-9]/g)||[];
    nums.forEach(n=>{if(!out.includes(n))out.push(n)});
    return out;
  }
  function genNum(v){const key=normalizeGenKey(v);return key&&key!=='CORE2DUO'?Number(key):key}
  function genLabel(g){const key=normalizeGenKey(g);if(!key)return '';if(key==='CORE2DUO')return 'CORE 2 DUO';const n=Number(key);return (n===2?'2ND':n===3?'3RD':`${n}TH`)+' GEN'}
  function productImage(p){return clean(p.image)||'assets/img/logo.jpg'}
  function boolish(v){if(v===true)return true;const x=upper(v);return ['YES','Y','TRUE','1','SUPPORTED','SUPPORT'].includes(x)}
  function storageType(p){
    const v=upper(p.storageType||p.storage_type||p.storage||p.interface||p.ssdType||p.ssd_type);
    if(v.includes('NVME'))return 'NVME SSD';
    if(v.includes('M.2')||v.includes('M2'))return 'M.2 SSD';
    if(v.includes('SATA'))return 'SATA SSD';
    if(p.category==='SSD')return 'SATA SSD';
    return '';
  }
  function storageLabel(p){return storageType(p)}
  function splitField(v){
    if(Array.isArray(v))return v.map(clean).filter(Boolean);
    const raw=clean(v);
    if(!raw)return [];
    try{const parsed=JSON.parse(raw);if(Array.isArray(parsed))return parsed.map(clean).filter(Boolean)}catch(e){}
    return raw.split(/[|,;/]+/).map(clean).filter(Boolean);
  }
  function parseRamTypes(v){return splitField(v).map(upper).filter(Boolean)}
  function normalizeStorageName(v){
    const x=upper(v);
    if(x.includes('NVME'))return 'NVME SSD';
    if(x.includes('M.2')||x.includes('M2'))return 'M.2 SSD';
    if(x.includes('SATA'))return 'SATA SSD';
    return '';
  }
  function parseStorageSupport(v){
    const out=[];
    splitField(v).forEach(x=>{const n=normalizeStorageName(x);if(n&&!out.includes(n))out.push(n)});
    return out;
  }
  function storageSupportList(p){
    const out=parseStorageSupport(p.storageSupport||p.storage_support||p.ssdSupport||p.ssd_support);
    if(p.sataSupport!==false&&!out.includes('SATA SSD'))out.push('SATA SSD');
    if((p.m2SataSupport||p.m2_sata_support)&&!out.includes('M.2 SSD'))out.push('M.2 SSD');
    if((p.nvmeSupport||p.nvme_support)&&!out.includes('NVME SSD'))out.push('NVME SSD');
    if(p.category==='MOTHERBOARD'&&!out.length)out.push('SATA SSD');
    return out;
  }
  function storageSupportLabel(p){return storageSupportList(p).join(' / ')}
  function parseRamSlots(v){
    const out=[];
    splitField(v).forEach(x=>{const n=String(x).replace(/[^0-9]/g,'');if((n==='2'||n==='4')&&!out.includes(n))out.push(n)});
    return out.sort((a,b)=>Number(a)-Number(b));
  }
  function ramSlotsOf(p){
    const slots=parseRamSlots(p.ramSlots||p.ram_slots||p.ramSlotOptions||p.ram_slot_options);
    if(p.category==='MOTHERBOARD'&&!slots.length)return ['2'];
    return slots;
  }
  function ramSlotLabel(p){const slots=ramSlotsOf(p);return slots.length?slots.map(x=>`${x} Slot${x==='1'?'':'s'}`).join(' / '):''}
  function compatibleMotherboardIdsOf(p){return splitField(p.compatibleMotherboardIds||p.compatible_motherboard_ids||p.compatibleMotherboards||p.compatible_motherboards)}
  function boardSupportsGen(board,gen){const g=normalizeGenKey(gen);return !!g&&(board.generations||[]).map(String).includes(g)}
  function boardSupportsRam(board,ram){const r=upper(ram);const list=(board.compatibleRam&&board.compatibleRam.length?board.compatibleRam:[board.memory]).map(upper).filter(Boolean);return !!r&&list.includes(r)}
  function productMetaBits(p){
    const bits=[];
    if(p.category)bits.push(p.category);
    if(p.chipset)bits.push(p.chipset);
    if(p.socket)bits.push(p.socket);
    if(p.memory)bits.push(p.memory);
    if(p.category==='MOTHERBOARD'&&ramSlotLabel(p))bits.push('RAM '+ramSlotLabel(p));
    if(p.category==='MOTHERBOARD'&&storageSupportLabel(p))bits.push(storageSupportLabel(p));
    if(storageLabel(p))bits.push(storageLabel(p));
    return bits;
  }
  function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2300)}
  function todayString(){return new Date().toLocaleDateString('en-LK',{year:'numeric',month:'short',day:'2-digit'})}
  function quoteNo(){return 'SCQ-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+Math.floor(1000+Math.random()*9000)}

  function parseCSV(text){
    const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i],n=text[i+1];
      if(c==='"'){if(quoted&&n==='"'){field+='"';i++}else quoted=!quoted}
      else if(c===','&&!quoted){row.push(field);field=''}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(field);if(row.some(x=>clean(x)!==''))rows.push(row);row=[];field=''}
      else field+=c;
    }
    row.push(field);if(row.some(x=>clean(x)!==''))rows.push(row);
    if(rows.length<2)return[];
    const headers=rows[0].map(h=>clean(h));
    return rows.slice(1).map(cols=>{const obj={};headers.forEach((h,i)=>obj[h]=clean(cols[i]??''));return obj});
  }

  function normalizeProduct(p,i=0){
    const cat=categoryName(p.category);
    const gens=parseGenerations(p.compatibleGenerations||p.compatible_generations||p.supportedGens||p.supported_gens||p.generation||p.gen);
    const compatibleRam=parseRamTypes(p.compatibleRam||p.compatible_ram||p.ramSupport||p.ram_support||p.memory||p.ram||p.ram_type);
    const storageSupport=parseStorageSupport(p.storageSupport||p.storage_support||p.ssdSupport||p.ssd_support);
    const sataFlag=p.sataSupport===false||upper(p.sataSupport)==='NO'?false:true;
    const m2Flag=boolish(p.m2SataSupport||p.m2_sata_support||p.m2Sata||p.m2_sata)||storageSupport.includes('M.2 SSD');
    const nvmeFlag=boolish(p.nvmeSupport||p.nvme_support||p.nvme)||storageSupport.includes('NVME SSD');
    const fullStorage=[...storageSupport];
    if(sataFlag&&!fullStorage.includes('SATA SSD'))fullStorage.push('SATA SSD');
    if(m2Flag&&!fullStorage.includes('M.2 SSD'))fullStorage.push('M.2 SSD');
    if(nvmeFlag&&!fullStorage.includes('NVME SSD'))fullStorage.push('NVME SSD');
    const slots=parseRamSlots(p.ramSlots||p.ram_slots||p.ramSlotOptions||p.ram_slot_options);
    const finalSlots=cat==='MOTHERBOARD'?(slots.length?slots:['2']):slots;
    const g=gens[0]||'';
    return {
      id:clean(p.id)||`ITEM-${i+1}`,
      name:clean(p.name)||'Product',
      category:cat,
      condition:upper(p.condition||'USED'),
      price:toNumber(p.price),
      generation:g,
      generations:gens,
      compatibleGenerations:gens,
      generationLabel:gens.length?gens.map(genLabel).join(' / '):'',
      memory:compatibleRam[0]||upper(p.memory||p.ram||p.ram_type),
      compatibleRam:compatibleRam.length?compatibleRam:(upper(p.memory||p.ram||p.ram_type)?[upper(p.memory||p.ram||p.ram_type)]:[]),
      chipset:upper(p.chipset),
      socket:upper(p.socket),
      stock:clean(p.stock),
      image:clean(p.image)||'assets/img/logo.jpg',
      description:clean(p.description),
      warranty:clean(p.warranty||p.warranty_period||p.warrantyPeriod),
      warrantyMonths:clean(p.warrantyMonths||p.warranty_months||p.warrantyMonth),
      storageType:storageType(p),
      storageSupport:fullStorage.length?fullStorage:(cat==='MOTHERBOARD'?['SATA SSD']:[]),
      sataSupport:sataFlag,
      sataOnlySupport:boolish(p.sataOnlySupport||p.sata_only_support),
      m2SataSupport:m2Flag,
      nvmeSupport:nvmeFlag,
      m2Slots:clean(p.m2Slots||p.m2_slots),
      ramSlots:finalSlots,
      compatibleMotherboardIds:compatibleMotherboardIdsOf(p)
    };
  }

  function warrantyText(p){
    if(clean(p.warranty))return clean(p.warranty);
    if(clean(p.warrantyMonths))return `${clean(p.warrantyMonths)} month${Number(p.warrantyMonths)===1?'':'s'} warranty`;
    if(upper(p.condition)==='NEW')return 'Brand warranty / shop warranty as available';
    return 'Shop checking warranty as available';
  }

  async function loadProducts(){
    if(productsCache)return productsCache;
    let rows=[];
    const csvUrl=clean(CONFIG.sheetCsvUrl);
    if(csvUrl){
      try{const res=await fetch(csvUrl,{cache:'no-store'});if(!res.ok)throw new Error('CSV error');rows=parseCSV(await res.text())}catch(e){console.warn('Google Sheet load failed. Default products used.',e)}
    }
    if(!rows.length && location.protocol!=='file:'){
      try{const res=await fetch('data/products.json',{cache:'no-store'});if(res.ok)rows=await res.json()}catch(e){console.warn('Local JSON load failed.',e)}
    }
    if(!rows.length)rows=DEFAULT_PRODUCTS;
    let normalized=rows.map(normalizeProduct).filter(p=>p.name&&p.category);
    try{
      const deletedIds=new Set(JSON.parse(localStorage.getItem(ADMIN_DELETED_KEY)||'[]').map(String));
      if(deletedIds.size)normalized=normalized.filter(p=>!deletedIds.has(String(p.id)));
      const localRows=JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)||'[]');
      if(Array.isArray(localRows)&&localRows.length){
        const localProducts=localRows.map(normalizeProduct).filter(p=>p.name&&p.category&&!deletedIds.has(String(p.id)));
        const byIdMap=new Map(normalized.map(p=>[p.id,p]));
        localProducts.forEach(p=>byIdMap.set(p.id,p));
        normalized=Array.from(byIdMap.values());
      }
    }catch(e){console.warn('Local admin products not loaded',e)}
    productsCache=normalized;
    return productsCache;
  }

  function getCart(){try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch{return[]}}
  function saveCart(cart){localStorage.setItem(CART_KEY,JSON.stringify(cart));updateCartCount()}
  function cartCount(){return getCart().reduce((s,it)=>s+Number(it.qty||1),0)}
  function updateCartCount(){$all('[data-cart-count]').forEach(el=>el.textContent=cartCount())}
  function addToCart(id,qty=1){const cart=getCart();qty=Math.max(1,Number(qty||1));const found=cart.find(x=>x.id===id&&!x.custom);if(found)found.qty+=qty;else cart.push({id,qty});saveCart(cart);toast('Added to cart')}
  function addCustomToCart(custom,qty=1){const cart=getCart();qty=Math.max(1,Number(qty||1));const id=custom.id||('CUSTOM-'+Date.now());const found=cart.find(x=>x.id===id&&x.custom);if(found)found.qty+=qty;else cart.push({id,qty,custom:{...custom,id}});saveCart(cart);toast('Added to cart')}
  function addManyToCart(ids){const cart=getCart();ids.forEach(id=>{const found=cart.find(x=>x.id===id&&!x.custom);if(found)found.qty+=1;else cart.push({id,qty:1})});saveCart(cart);toast('Quotation added to cart')}
  function makeRamSlot4Upgrade(board){return {id:`CUSTOM-${board.id}-RAM-SLOT-4`,name:`${board.name} - RAM Slot 4 Option`,category:'RAM SLOT OPTION',condition:'OPTION',price:RAM_SLOT_4_EXTRA,memory:'',description:'RAM Slot 4 motherboard option upgrade',image:'assets/img/logo.jpg',warranty:'N/A'}}
  function setQty(id,qty){const cart=getCart().map(it=>it.id===id?{...it,qty:Math.max(1,Number(qty||1))}:it);saveCart(cart);initCartPage()}
  function removeFromCart(id){saveCart(getCart().filter(it=>it.id!==id));initCartPage()}

  function bindCommon(){
    updateCartCount();
    $('#mobileMenuBtn')?.addEventListener('click',()=>$('#navLinks')?.classList.toggle('open'));
    $all('[data-config-link]').forEach(a=>{const key=a.getAttribute('data-config-link');if(CONFIG[key]){a.href=CONFIG[key];a.target='_blank';a.rel='noopener'}});
    document.addEventListener('click',e=>{
      const btn=e.target.closest('[data-add-to-cart]');if(btn)addToCart(btn.getAttribute('data-add-to-cart'));
      const rm=e.target.closest('[data-remove-cart]');if(rm)removeFromCart(rm.getAttribute('data-remove-cart'));
      const pre=e.target.closest('[data-prebuild-whatsapp]');if(pre)sendPrebuildWhatsApp(pre.getAttribute('data-prebuild-whatsapp'));
    });
    document.addEventListener('change',e=>{const qty=e.target.closest('[data-cart-qty]');if(qty)setQty(qty.getAttribute('data-cart-qty'),qty.value)});
  }

  function initCarousel(slideSelector,dotsSelector,interval=4200){
    const slides=$all(slideSelector),dotsWrap=$(dotsSelector);if(!slides.length||!dotsWrap)return;
    dotsWrap.innerHTML=slides.map((_,i)=>`<span class="slide-dot ${i===0?'active':''}"></span>`).join('');
    const dots=$all('.slide-dot',dotsWrap);let idx=0;
    setInterval(()=>{slides[idx].classList.remove('active');dots[idx]?.classList.remove('active');idx=(idx+1)%slides.length;slides[idx].classList.add('active');dots[idx]?.classList.add('active')},interval);
  }
  function initHome(){
    initCarousel('.prebuild-slide','#prebuildDots',3600);
    initCarousel('.wide-banner-slide','#wideBannerDots',4300);
  }

  function productCard(p){
    const tags=[p.condition,p.memory,storageLabel(p),p.generationLabel,(p.category==='MOTHERBOARD'?ramSlotLabel(p):'')].filter(Boolean);
    return `<article class="card product-card" data-product-id="${esc(p.id)}" tabindex="0" aria-label="View ${esc(p.name)} details">
      <div class="product-img-wrap"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='assets/img/logo.jpg'">
        <div class="tag-row">${tags.map((t,i)=>`<span class="tag ${i===0&&p.condition==='NEW'?'new':i===0?'used':''}">${esc(t)}</span>`).join('')}</div>
      </div>
      <div class="product-body"><h3>${esc(p.name)}</h3>
        <div class="meta">${productMetaBits(p).map(x=>`<span>${esc(x)}</span>`).join('')}</div>
        <div class="price">${money(p.price)}</div><div class="stock">Stock: ${esc(p.stock||'Contact')} • Warranty: ${esc(warrantyText(p))}</div>
        <div class="product-actions"><button class="btn btn-ghost btn-small" data-view-product="${esc(p.id)}">View Details</button><button class="btn btn-primary btn-small" data-add-to-cart="${esc(p.id)}">Add to cart</button></div>
      </div></article>`;
  }

  function ensureProductModal(){
    if($('#productModal'))return;
    const modal=document.createElement('div');
    modal.className='product-modal';
    modal.id='productModal';
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<div class="product-modal-backdrop" data-close-product-modal></div>
      <div class="product-modal-card" role="dialog" aria-modal="true" aria-labelledby="productModalTitle">
        <button class="product-modal-close" type="button" data-close-product-modal aria-label="Close product details">×</button>
        <div id="productModalContent"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{
      if(e.target.closest('[data-close-product-modal]'))closeProductModal();
      const add=e.target.closest('[data-modal-add-to-cart]');
      if(add){
        const id=add.getAttribute('data-modal-add-to-cart');
        const qty=Math.max(1,Number($('#modalProductQty')?.value||1));
        const p=(productsCache||[]).find(x=>x.id===id);
        addToCart(id,qty);
        const slot=$('input[name="modalBoardRamSlot"]:checked')?.value;
        if(p&&p.category==='MOTHERBOARD'&&slot==='4')addCustomToCart(makeRamSlot4Upgrade(p),qty);
        closeProductModal();
      }
      if(e.target.matches('input[name="modalBoardRamSlot"]'))updateModalBoardPrice();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeProductModal()});
  }

  function closeProductModal(){
    const modal=$('#productModal');if(!modal)return;
    modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');
  }

  function updateModalBoardPrice(){
    const priceEl=$('#modalProductPrice');if(!priceEl)return;
    const base=toNumber(priceEl.getAttribute('data-base-price'));
    const slot=$('input[name="modalBoardRamSlot"]:checked')?.value;
    const extra=slot==='4'?RAM_SLOT_4_EXTRA:0;
    priceEl.textContent=money(base+extra);
    const note=$('#modalBoardSlotNote');
    if(note)note.textContent=slot==='4'?`RAM Slot 4 selected: ${money(RAM_SLOT_4_EXTRA)} added to unit price.`:'RAM Slot 2 selected: base motherboard price.';
  }

  function openProductModal(id){
    ensureProductModal();
    const p=(productsCache||[]).find(x=>x.id===id);if(!p)return;
    const content=$('#productModalContent');if(!content)return;
    const detailRows=[];
    detailRows.push(`<div><span>Warranty Period</span><b>${esc(warrantyText(p))}</b></div>`);
    detailRows.push(`<div><span>Availability</span><b>${esc(p.stock||'Contact for stock')}</b></div>`);
    if(p.generationLabel)detailRows.push(`<div><span>Supported GEN</span><b>${esc(p.generationLabel)}</b></div>`);
    if((p.compatibleRam||[]).length)detailRows.push(`<div><span>RAM Support</span><b>${esc((p.compatibleRam||[]).join(' / '))}</b></div>`);
    if(p.category==='MOTHERBOARD')detailRows.push(`<div><span>RAM Slots</span><b>${esc(ramSlotLabel(p))}</b></div>`);
    if(p.chipset)detailRows.push(`<div><span>Chipset</span><b>${esc(p.chipset)}</b></div>`);
    if(p.socket)detailRows.push(`<div><span>Socket</span><b>${esc(p.socket)}</b></div>`);
    if(storageLabel(p))detailRows.push(`<div><span>Storage Type</span><b>${esc(storageLabel(p))}</b></div>`);
    if(p.category==='MOTHERBOARD')detailRows.push(`<div><span>SSD Support</span><b>${esc(storageSupportLabel(p)||'SATA SSD')}</b></div>`);
    if(p.category==='PROCESSOR'&&p.compatibleMotherboardIds?.length)detailRows.push(`<div><span>Matched Boards</span><b>${esc(p.compatibleMotherboardIds.length+' selected')}</b></div>`);
    const boardSlots=p.category==='MOTHERBOARD'?ramSlotsOf(p):[];
    const defaultSlot=boardSlots.includes('2')?'2':(boardSlots[0]||'2');
    const slotPicker=p.category==='MOTHERBOARD'?`<div class="product-modal-order board-slot-picker">
          <label>Motherboard RAM Slot Option</label>
          <div class="slot-radio-grid">
            ${boardSlots.includes('2')?`<label class="slot-radio"><input type="radio" name="modalBoardRamSlot" value="2" ${defaultSlot==='2'?'checked':''}><span>RAM Slot 2 Board</span><b>Base price</b></label>`:''}
            ${boardSlots.includes('4')?`<label class="slot-radio"><input type="radio" name="modalBoardRamSlot" value="4" ${defaultSlot==='4'?'checked':''}><span>RAM Slot 4 Board</span><b>+${money(RAM_SLOT_4_EXTRA)}</b></label>`:''}
          </div>
          <p class="field-hint" id="modalBoardSlotNote">${defaultSlot==='4'?`RAM Slot 4 selected: ${money(RAM_SLOT_4_EXTRA)} added to unit price.`:'RAM Slot 2 selected: base motherboard price.'}</p>
        </div>`:'';
    content.innerHTML=`<div class="product-modal-grid">
      <div class="product-modal-image"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='assets/img/logo.jpg'"></div>
      <div class="product-modal-info">
        <div class="modal-tag-row"><span class="tag ${p.condition==='NEW'?'new':'used'}">${esc(p.condition)}</span>${productMetaBits(p).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}</div>
        <h2 id="productModalTitle">${esc(p.name)}</h2>
        <div class="product-modal-price" id="modalProductPrice" data-base-price="${esc(p.price)}">${money(p.price+(p.category==='MOTHERBOARD'&&defaultSlot==='4'?RAM_SLOT_4_EXTRA:0))}</div>
        <p class="product-modal-description">${esc(p.description||'Please contact Sandaruwan Computer for more details, availability and final confirmation before payment.')}</p>
        ${slotPicker}
        <div class="product-detail-list">${detailRows.join('')}</div>
        <div class="product-modal-order">
          <label for="modalProductQty">Quantity</label>
          <div class="modal-qty-row"><input class="input" id="modalProductQty" type="number" min="1" value="1"><button class="btn btn-primary" data-modal-add-to-cart="${esc(p.id)}">Add to Cart</button></div>
        </div>
      </div>
    </div>`;
    const modal=$('#productModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
    updateModalBoardPrice();
  }

  async function initProductsPage(){
    const products=await loadProducts();const grid=$('#productsGrid');if(!grid)return;
    ensureProductModal();
    grid.addEventListener('click',e=>{
      if(e.target.closest('button,a,input,select,textarea'))return;
      const card=e.target.closest('[data-product-id]');if(card)openProductModal(card.getAttribute('data-product-id'));
    });
    grid.addEventListener('keydown',e=>{
      if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-product-id]')){e.preventDefault();openProductModal(e.target.closest('[data-product-id]').getAttribute('data-product-id'))}
    });
    grid.addEventListener('click',e=>{
      const view=e.target.closest('[data-view-product]');if(view){e.preventDefault();openProductModal(view.getAttribute('data-view-product'))}
    });
    const catFilter=$('#categoryFilter');CATEGORIES.forEach(cat=>{const o=document.createElement('option');o.value=cat;o.textContent=cat;catFilter?.appendChild(o)});
    const inputs=['#productSearch','#categoryFilter','#conditionFilter','#memoryFilter','#generationFilter','#storageFilter'].map(id=>$(id)).filter(Boolean);
    inputs.forEach(el=>['input','change'].forEach(ev=>el.addEventListener(ev,render)));
    function render(){
      const q=upper($('#productSearch')?.value);const cat=upper($('#categoryFilter')?.value);const cond=upper($('#conditionFilter')?.value);const mem=upper($('#memoryFilter')?.value);const gen=normalizeGenKey($('#generationFilter')?.value||'');const store=upper($('#storageFilter')?.value);
      const filtered=products.filter(p=>{
        const hay=upper([p.name,p.category,p.condition,p.memory,p.generationLabel,p.chipset,p.socket,p.description,storageLabel(p),storageSupportLabel(p),ramSlotLabel(p)].join(' '));
        const pGens=(p.generations&&p.generations.length?p.generations:parseGenerations(p.generation)).map(String);
        return (!q||hay.includes(q))&&(!cat||p.category===cat)&&(!cond||p.condition===cond)&&(!mem||p.memory===mem)&&(!gen||pGens.includes(String(gen))||String(p.generation)===String(gen))&&(!store||storageType(p)===store);
      });
      $('#resultCount')&&( $('#resultCount').textContent=`${filtered.length} items found` );
      grid.innerHTML=filtered.length?filtered.map(productCard).join(''):'<div class="empty-state card">No matching products found.</div>';
    }
    render();
  }

  function prebuildCard(p){
    return `<article class="card prebuild-card" data-prebuild-id="${esc(p.id)}" tabindex="0" aria-label="View ${esc(p.title)} package details">
      <div class="prebuild-img"><img src="${esc(p.image)}" alt="${esc(p.title)}"><div class="tag-row"><span class="tag new">${esc(p.tag)}</span></div></div>
      <div class="prebuild-body"><h3>${esc(p.title)}</h3><div class="price">${esc(p.price)}</div>
        <div class="spec-list">${p.specs.map(s=>`<span>${esc(s)}</span>`).join('')}</div>
        <div class="product-actions"><button class="btn btn-ghost btn-small" data-view-prebuild="${esc(p.id)}">View Details</button><button class="btn btn-whatsapp btn-small" data-prebuild-whatsapp="${esc(p.id)}">Order on WhatsApp</button><a class="btn btn-ghost btn-small" href="quotation.html">Customize</a></div>
      </div>
    </article>`;
  }

  function ensurePrebuildModal(){
    if($('#prebuildModal'))return;
    const modal=document.createElement('div');
    modal.className='product-modal';
    modal.id='prebuildModal';
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<div class="product-modal-backdrop" data-close-prebuild-modal></div>
      <div class="product-modal-card" role="dialog" aria-modal="true" aria-labelledby="prebuildModalTitle">
        <button class="product-modal-close" type="button" data-close-prebuild-modal aria-label="Close package details">×</button>
        <div id="prebuildModalContent"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{
      if(e.target.closest('[data-close-prebuild-modal]'))closePrebuildModal();
      const order=e.target.closest('[data-modal-prebuild-order]');
      if(order){sendPrebuildWhatsApp(order.getAttribute('data-modal-prebuild-order'));closePrebuildModal();}
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closePrebuildModal()});
  }
  function closePrebuildModal(){const modal=$('#prebuildModal');if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}
  function openPrebuildModal(id){
    ensurePrebuildModal();
    const p=PREBUILDS.find(x=>x.id===id);if(!p)return;
    const content=$('#prebuildModalContent');if(!content)return;
    content.innerHTML=`<div class="product-modal-grid">
      <div class="product-modal-image"><img src="${esc(p.image)}" alt="${esc(p.title)}" onerror="this.src='assets/img/logo.jpg'"></div>
      <div class="product-modal-info">
        <div class="modal-tag-row"><span class="tag new">${esc(p.tag)}</span><span class="tag">Pre Build PC</span></div>
        <h2 id="prebuildModalTitle">${esc(p.title)}</h2>
        <div class="product-modal-price">${esc(p.price)}</div>
        <p class="product-modal-description">${esc(p.description||'Ready PC package from Sandaruwan Computer. Please confirm availability, final price and warranty before payment.')}</p>
        <div class="product-detail-list">
          <div><span>Warranty Period</span><b>${esc(p.warranty||'Shop warranty as available')}</b></div>
          <div><span>Package Type</span><b>${esc(p.tag)}</b></div>
          <div><span>Order Method</span><b>WhatsApp confirmation</b></div>
        </div>
        <h3>Package Specifications</h3>
        <div class="spec-list modal-specs">${p.specs.map(s=>`<span>${esc(s)}</span>`).join('')}</div>
        <div class="product-modal-order"><div class="modal-qty-row"><button class="btn btn-whatsapp" data-modal-prebuild-order="${esc(p.id)}">Order on WhatsApp</button><a class="btn btn-ghost" href="quotation.html">Customize Build</a></div></div>
      </div>
    </div>`;
    const modal=$('#prebuildModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
  }
  function initPrebuildPage(){
    const grid=$('#prebuildGrid');if(!grid)return;
    ensurePrebuildModal();
    grid.innerHTML=PREBUILDS.map(prebuildCard).join('');
    grid.addEventListener('click',e=>{
      const view=e.target.closest('[data-view-prebuild]');if(view){e.preventDefault();openPrebuildModal(view.getAttribute('data-view-prebuild'));return;}
      if(e.target.closest('button,a,input,select,textarea'))return;
      const card=e.target.closest('[data-prebuild-id]');if(card)openPrebuildModal(card.getAttribute('data-prebuild-id'));
    });
    grid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-prebuild-id]')){e.preventDefault();openPrebuildModal(e.target.closest('[data-prebuild-id]').getAttribute('data-prebuild-id'))}});
  }
  function sendPrebuildWhatsApp(id){
    const p=PREBUILDS.find(x=>x.id===id);if(!p)return;
    const num=clean(CONFIG.whatsappNumber).replace(/\D/g,'');
    const text=`${CONFIG.businessName||'Sandaruwan Computer'}
PRE BUILD PC ORDER REQUEST

Package: ${p.title}
Price: ${p.price}
Specs:
${p.specs.map(s=>'• '+s).join('\n')}

Please confirm availability and final price.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`,'_blank','noopener');
  }

  function isSsdCompatibleWithBoard(ssd,board){
    const type=storageType(ssd);
    if(!type||type==='SATA SSD')return true;
    if(!board)return true;
    const support=storageSupportList(board);
    return support.includes(type);
  }

  function boardOptionText(p){
    const extra=[];
    if(p.category==='MOTHERBOARD'&&ramSlotLabel(p))extra.push('RAM '+ramSlotLabel(p));
    if(p.category==='MOTHERBOARD'&&storageSupportLabel(p))extra.push(storageSupportLabel(p));
    return extra.length?' • '+extra.join(' • '):'';
  }

  function optionHTML(p){return `<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)}${storageLabel(p)?` • ${esc(storageLabel(p))}`:''}${boardOptionText(p)}${p.condition?` (${esc(p.condition)})`:''}</option>`}
  function fillSelect(sel,items,placeholder){if(!sel)return;sel.innerHTML=`<option value="">${esc(placeholder)}</option>`+items.map(optionHTML).join('');sel.disabled=false}
  function byId(products,id){return products.find(p=>p.id===id)}

  async function initQuotationPage(){
    const products=await loadProducts();quoteProducts=products;
    const processor=$('#quoteProcessor'),mobo=$('#quoteMotherboard'),ram=$('#quoteRam'),ssdSel=$('#quoteSsd'),ramSlotSel=$('#quoteRamSlot');if(!processor)return;
    fillSelect(processor,products.filter(p=>p.category==='PROCESSOR'),'Select processor');
    $all('[data-quote-select]').forEach(sel=>{const cat=sel.getAttribute('data-quote-select');fillSelect(sel,products.filter(p=>p.category===cat),`Skip ${cat}`);sel.addEventListener('change',renderQuote)});

    function fillRamSlotSelect(board){
      if(!ramSlotSel)return;
      if(!board){ramSlotSel.innerHTML='<option value="">Select motherboard first</option>';ramSlotSel.disabled=true;return;}
      const slots=ramSlotsOf(board);
      const opts=[];
      if(slots.includes('2'))opts.push('<option value="2">RAM Slot 2 Board (Base price)</option>');
      if(slots.includes('4'))opts.push('<option value="4">RAM Slot 4 Board (+Rs. 500)</option>');
      ramSlotSel.innerHTML=opts.length?opts.join(''):'<option value="2">RAM Slot 2 Board (Base price)</option>';
      ramSlotSel.disabled=!(opts.length>1);
      if(!ramSlotSel.value)ramSlotSel.value=slots.includes('2')?'2':(slots[0]||'2');
    }

    function filterSsdSelect(){
      if(!ssdSel)return;
      const current=ssdSel.value;
      const board=byId(products,mobo?.value);
      const ssds=products.filter(p=>p.category==='SSD'&&isSsdCompatibleWithBoard(p,board));
      fillSelect(ssdSel,ssds,board?'Select compatible SSD':'Skip SSD');
      if(ssds.some(p=>p.id===current))ssdSel.value=current;
      else ssdSel.value='';
      const storageNote=$('#storageCompatNote');
      if(storageNote){
        if(board)storageNote.innerHTML=`Selected motherboard: <b>${esc(board.name)}</b> • RAM slots: <b>${esc(ramSlotLabel(board))}</b> • SSD support: <b>${esc(storageSupportLabel(board)||'SATA SSD')}</b>.`;
        else storageNote.textContent='Motherboard එක select කළාම RAM Slot 2/4 සහ SATA / M.2 / NVMe SSD compatibility auto filter වෙයි.';
      }
    }

    function filterRamForBoard(){
      const cpu=byId(products,processor.value);
      const board=byId(products,mobo?.value);
      const ramTypes=board?.compatibleRam?.length?board.compatibleRam:(cpu?.compatibleRam?.length?cpu.compatibleRam:[cpu?.memory].filter(Boolean));
      const rams=products.filter(p=>p.category==='RAM'&&(!ramTypes.length||ramTypes.includes(p.memory)));
      fillSelect(ram,rams,ramTypes.length?`Select ${ramTypes.join(' / ')} RAM`:'Select RAM');
    }

    processor.addEventListener('change',()=>{
      const cpu=byId(products,processor.value);const cpuGen=cpu?normalizeGenKey(cpu.generation):'';const rule=cpu?COMPAT_RULES[cpuGen]:null;
      if(!cpu){mobo.innerHTML='<option value="">Select processor first</option>';ram.innerHTML='<option value="">Select processor first</option>';mobo.disabled=true;ram.disabled=true;fillRamSlotSelect(null);$('#compatNote').textContent='Processor එක select කළාම compatible motherboard සහ RAM පෙන්වයි.';filterSsdSelect();renderQuote();return;}
      const explicit=cpu.compatibleMotherboardIds||[];
      const motherboards=products.filter(p=>{
        if(p.category!=='MOTHERBOARD')return false;
        if(explicit.length)return explicit.includes(p.id);
        if(rule){
          const boardGens=(p.generations&&p.generations.length?p.generations:parseGenerations(p.generation));
          return boardSupportsRam(p,rule.ram)&&(boardGens.includes(cpuGen)||rule.chipsets.includes(p.chipset));
        }
        return boardSupportsGen(p,cpuGen)&&(cpu.memory?boardSupportsRam(p,cpu.memory):true);
      });
      fillSelect(mobo,motherboards,'Select compatible motherboard');
      filterRamForBoard();
      fillRamSlotSelect(null);
      filterSsdSelect();
      const boardText=explicit.length?`${explicit.length} manually selected motherboard(s)`:(rule?rule.chipsets.join(' / '):'matching selected GEN');
      $('#compatNote').innerHTML=`<b>${esc(cpu.name)}</b> selected. Compatible boards: <b>${esc(boardText)}</b>${rule?` • RAM: <b>${esc(rule.ram)}</b> • Socket: <b>${esc(rule.socket)}</b>`:''}.`;
      renderQuote();
    });
    mobo?.addEventListener('change',()=>{filterRamForBoard();fillRamSlotSelect(byId(products,mobo.value));filterSsdSelect();renderQuote();});
    ram?.addEventListener('change',renderQuote);
    ramSlotSel?.addEventListener('change',renderQuote);
    ['#quoteRamQty','#quoteSsdQty','#quoteHardDiskQty'].forEach(sel=>$(sel)?.addEventListener('input',renderQuote));
    $all('[data-cable-option],[data-cable-qty]').forEach(el=>['input','change'].forEach(ev=>el.addEventListener(ev,renderQuote)));
    fillRamSlotSelect(null);filterSsdSelect();
    $('#addQuoteToCartBtn')?.addEventListener('click',()=>{
      const lines=getQuoteLines();if(!lines.length){toast('Select products first');return}
      addQuoteLinesToCart(lines);
    });
    $('#downloadQuotePdfBtn')?.addEventListener('click',downloadQuotationPdf);
    renderQuote();
  }

  function qtyValue(selector){return Math.max(1,Number($(selector)?.value||1)||1)}
  function makeQuoteLine(product,qty=1){return {...product,qty:Math.max(1,Number(qty||1)||1),lineTotal:toNumber(product.price)*Math.max(1,Number(qty||1)||1)}}

  function getRamSlotUpgrade(){
    const sel=$('#quoteRamSlot');
    const board=byId(quoteProducts,$('#quoteMotherboard')?.value);
    if(!sel||!board||sel.value!=='4')return null;
    return makeRamSlot4Upgrade(board);
  }

  function findCableProduct(label){
    const key=upper(label).replace(/[^A-Z0-9]/g,'');
    return quoteProducts.find(p=>p.category==='CABLES'&&upper(p.name).replace(/[^A-Z0-9]/g,'').includes(key));
  }

  function cableFallback(label){
    return {id:'CUSTOM-'+upper(label).replace(/[^A-Z0-9]/g,'-'),name:label,category:'CABLES',condition:'OPTION',price:0,memory:'',description:'Cable add-on. Add this cable as a product in Admin Panel to include an automatic price.',image:'assets/img/logo.jpg',warranty:'Confirm'};
  }

  function getCableQuoteLines(){
    return CABLE_QUOTE_TYPES.map(label=>{
      const check=$(`[data-cable-option="${label}"]`);if(!check||!check.checked)return null;
      const qty=Math.max(1,Number($(`[data-cable-qty="${label}"]`)?.value||1)||1);
      const product=findCableProduct(label)||cableFallback(label);
      const line=makeQuoteLine(product,qty);
      if(!findCableProduct(label))line.custom=true;
      return line;
    }).filter(Boolean);
  }

  function getQuoteLines(){
    const lines=[];
    const add=(selector,qty=1)=>{const id=$(selector)?.value;if(!id)return;const product=byId(quoteProducts,id);if(product)lines.push(makeQuoteLine(product,qty));};
    add('#quoteProcessor',1);
    add('#quoteMotherboard',1);
    add('#quoteRam',qtyValue('#quoteRamQty'));
    $all('[data-quote-select]').forEach(sel=>{
      if(!sel.value)return;
      let qty=1;
      if(sel.id==='quoteSsd')qty=qtyValue('#quoteSsdQty');
      if(sel.id==='quoteHardDisk')qty=qtyValue('#quoteHardDiskQty');
      const product=byId(quoteProducts,sel.value);if(product)lines.push(makeQuoteLine(product,qty));
    });
    const up=getRamSlotUpgrade();if(up)lines.push(makeQuoteLine(up,1));
    lines.push(...getCableQuoteLines());
    return lines;
  }

  function addQuoteLinesToCart(lines){
    const cart=getCart();
    lines.forEach(line=>{
      const id=line.id;const qty=Math.max(1,Number(line.qty||1)||1);
      if(line.custom||String(id).startsWith('CUSTOM-')){
        const custom={...line};delete custom.qty;delete custom.lineTotal;custom.image=custom.image||'assets/img/logo.jpg';
        const found=cart.find(x=>x.id===id&&x.custom);if(found)found.qty+=qty;else cart.push({id,qty,custom});
      }else{
        const found=cart.find(x=>x.id===id&&!x.custom);if(found)found.qty+=qty;else cart.push({id,qty});
      }
    });
    saveCart(cart);toast('Quotation added to cart');
  }

  function renderQuote(){
    const tbody=$('#quoteTable tbody');if(!tbody)return;
    const items=getQuoteLines();const total=items.reduce((s,p)=>s+toNumber(p.price)*Number(p.qty||1),0);
    tbody.innerHTML=items.length?items.map(p=>`<tr><td>${esc(p.name)}<br><span class="muted">${esc(p.category)} ${p.memory?`• ${esc(p.memory)}`:''}${p.price?'' :' • Confirm price'}</span></td><td>${Number(p.qty||1)}</td><td>${esc(p.condition)}</td><td>${money(toNumber(p.price)*Number(p.qty||1))}</td></tr>`).join(''):'<tr><td colspan="4" class="muted">No items selected yet.</td></tr>';
    $('#quoteTotal')&&( $('#quoteTotal').textContent=money(total) );
  }

  function quoteCustomer(){
    return {
      name:clean($('#quoteCustomerName')?.value), phone:clean($('#quoteCustomerPhone')?.value), email:clean($('#quoteCustomerEmail')?.value), address:clean($('#quoteCustomerAddress')?.value)
    };
  }
  function validateQuoteCustomer(){
    const c=quoteCustomer();
    if(!c.name||!c.phone||!c.email||!c.address){toast('Fill customer name, phone, email and address');return null}
    return c;
  }

  function pdfText(doc,text,x,y,opts={}){doc.text(String(text),x,y,opts)}
  function docFooter(doc){
    const h=doc.internal.pageSize.getHeight();
    doc.setFillColor(5,10,28);doc.rect(0,h-36,595,36,'F');
    doc.setTextColor(170,190,215);doc.setFont('helvetica','normal');doc.setFontSize(8);
    pdfText(doc,'Prices and availability can change. Please confirm before payment. Generated by Sandaruwan Computer online quotation system.',40,h-15);
  }
  function drawHeader(doc,title,subtitle){
    doc.setFillColor(5,10,28);doc.rect(0,0,595,106,'F');
    doc.setFillColor(11,188,255);doc.rect(0,102,595,4,'F');
    if(CONFIG.logoDataUrl){try{doc.addImage(CONFIG.logoDataUrl,'PNG',40,24,58,58)}catch(e){}}
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(22);pdfText(doc,CONFIG.businessName||'Sandaruwan Computer',112,45);
    doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(195,214,239);pdfText(doc,CONFIG.tagline||'PC Builds • Computer Parts',112,64);
    doc.setFont('helvetica','bold');doc.setFontSize(15);doc.setTextColor(255,255,255);pdfText(doc,title,408,42);
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(195,214,239);pdfText(doc,subtitle,408,60);
    pdfText(doc,`Date: ${todayString()}`,408,78);
  }
  async function downloadQuotationPdf(){
    const customer=validateQuoteCustomer();if(!customer)return;
    const items=getQuoteLines();if(!items.length){toast('Select products first');return}
    const jsPDF=window.jspdf&&window.jspdf.jsPDF;if(!jsPDF){window.print();return}
    const doc=new jsPDF({unit:'pt',format:'a4'});const qn=quoteNo();const total=items.reduce((s,p)=>s+toNumber(p.price)*Number(p.qty||1),0);
    drawHeader(doc,'ONLINE QUOTATION',`Quote No: ${qn}`);
    let y=132;
    doc.setFillColor(247,251,255);doc.roundedRect(40,y,515,84,12,12,'F');
    doc.setDrawColor(220,231,245);doc.roundedRect(40,y,515,84,12,12,'S');
    doc.setTextColor(5,10,28);doc.setFont('helvetica','bold');doc.setFontSize(11);pdfText(doc,'CUSTOMER DETAILS',58,y+22);
    doc.setFont('helvetica','normal');doc.setFontSize(10);
    pdfText(doc,`Name: ${customer.name}`,58,y+43);pdfText(doc,`Phone: ${customer.phone}`,305,y+43);
    pdfText(doc,`Email: ${customer.email}`,58,y+62);pdfText(doc,`Address: ${customer.address}`,305,y+62);
    y+=110;
    doc.setFillColor(11,188,255);doc.roundedRect(40,y,515,28,8,8,'F');
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(9);
    pdfText(doc,'#',55,y+18);pdfText(doc,'ITEM',82,y+18);pdfText(doc,'QTY',335,y+18);pdfText(doc,'CONDITION',382,y+18);pdfText(doc,'PRICE',480,y+18);
    y+=28;
    doc.setFont('helvetica','normal');doc.setTextColor(25,34,54);doc.setFontSize(9);
    items.forEach((p,i)=>{
      if(y>690){docFooter(doc);doc.addPage();drawHeader(doc,'ONLINE QUOTATION',`Quote No: ${qn}`);y=132;}
      doc.setFillColor(i%2?255:245,i%2?255:248,i%2?255:253);doc.rect(40,y,515,38,'F');
      pdfText(doc,String(i+1),55,y+23);pdfText(doc,p.name,82,y+16);doc.setTextColor(95,110,130);pdfText(doc,`${p.category} ${p.memory?`• ${p.memory}`:''}`,82,y+30);doc.setTextColor(25,34,54);
      pdfText(doc,String(Number(p.qty||1)),335,y+23);pdfText(doc,p.condition,382,y+23);pdfText(doc,money(toNumber(p.price)*Number(p.qty||1)),480,y+23);
      y+=38;
    });
    doc.setFillColor(5,10,28);doc.roundedRect(330,y+14,225,44,10,10,'F');
    doc.setTextColor(185,210,235);doc.setFont('helvetica','bold');doc.setFontSize(10);pdfText(doc,'TOTAL ESTIMATE',348,y+40);
    doc.setTextColor(255,255,255);doc.setFontSize(15);pdfText(doc,money(total),452,y+40);
    y+=86;
    doc.setFillColor(235,248,255);doc.roundedRect(40,y,515,82,12,12,'F');doc.setDrawColor(205,225,240);doc.roundedRect(40,y,515,82,12,12,'S');
    doc.setTextColor(5,10,28);doc.setFont('helvetica','bold');doc.setFontSize(11);pdfText(doc,'BANK DETAILS',58,y+22);
    doc.setFont('helvetica','normal');doc.setFontSize(10);pdfText(doc,`${CONFIG.bank?.name||''} | Account No: ${CONFIG.bank?.accountNumber||''}`,58,y+44);
    pdfText(doc,`Account Name: ${CONFIG.bank?.accountName||''}`,58,y+62);pdfText(doc,`Branch: ${CONFIG.bank?.branch||''}`,355,y+62);
    y+=108;
    doc.setTextColor(40,52,72);doc.setFontSize(9);pdfText(doc,`Contact: ${CONFIG.phoneDisplay||''} | Location: ${CONFIG.address||''}`,40,y);
    docFooter(doc);
    doc.save(`sandaruwan-computer-quotation-${qn}.pdf`);
  }

  async function cartItems(){
    const products=await loadProducts();const cart=getCart();
    return cart.map(it=>it.custom?{product:normalizeProduct(it.custom),qty:Number(it.qty||1),cartId:it.id}:{product:byId(products,it.id),qty:Number(it.qty||1),cartId:it.id}).filter(x=>x.product);
  }
  async function initCartPage(){
    const view=$('#cartView');if(!view)return;const items=await cartItems();
    if(!items.length){view.innerHTML='<div class="empty-state"><h2>Your cart is empty</h2><p>Add products or create an online quotation first.</p><div class="action-row" style="justify-content:center"><a class="btn btn-primary" href="products.html">View Products</a><a class="btn btn-ghost" href="quotation.html">Online Quotation</a></div></div>';return}
    const total=items.reduce((s,x)=>s+x.product.price*x.qty,0);
    view.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>${items.map(({product:p,qty,cartId})=>`<tr><td><div class="cart-product"><img src="${esc(productImage(p))}" onerror="this.src='assets/img/logo.jpg'" alt=""><div><b>${esc(p.name)}</b><br><span class="muted">${esc(p.category)} ${p.memory?`• ${esc(p.memory)}`:''}</span></div></div></td><td>${money(p.price)}</td><td><input class="input qty-input" type="number" min="1" value="${qty}" data-cart-qty="${esc(cartId||p.id)}"></td><td>${money(p.price*qty)}</td><td><button class="btn btn-danger btn-small" data-remove-cart="${esc(cartId||p.id)}">Remove</button></td></tr>`).join('')}</tbody></table></div><div class="total-row"><span>Cart Total</span><strong>${money(total)}</strong></div><div class="cart-actions"><button class="btn btn-danger" id="clearCartBtn">Clear Cart</button><a class="btn btn-primary" href="checkout.html">Checkout</a></div>`;
    $('#clearCartBtn')?.addEventListener('click',()=>{saveCart([]);initCartPage();toast('Cart cleared')});
  }

  async function renderCheckoutSummary(){
    const wrap=$('#checkoutSummary');if(!wrap)return;const items=await cartItems();
    if(!items.length){wrap.innerHTML='<div class="empty-state">Cart එක හිස්. Products page එකෙන් items add කරන්න.</div>';return}
    const total=items.reduce((s,x)=>s+x.product.price*x.qty,0);
    wrap.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>${items.map(({product:p,qty})=>`<tr><td>${esc(p.name)}</td><td>${qty}</td><td>${money(p.price*qty)}</td></tr>`).join('')}</tbody></table></div><div class="total-row"><span>Total</span><strong>${money(total)}</strong></div>`;
  }
  async function buildReceiptText(){
    const items=await cartItems();const total=items.reduce((s,x)=>s+x.product.price*x.qty,0);
    const name=clean($('#customerName')?.value)||'Customer';const phone=clean($('#customerPhone')?.value)||'-';const address=clean($('#customerAddress')?.value)||'-';const note=clean($('#customerNote')?.value)||'-';
    const itemLines=items.length?items.map((x,i)=>`${i+1}. ${x.product.name} x ${x.qty} = ${money(x.product.price*x.qty)}`).join('\n'):'No cart items';
    return `${CONFIG.businessName||'Sandaruwan Computer'}
ORDER RECEIPT

Customer: ${name}
Phone: ${phone}
Address: ${address}
Note: ${note}

Items:
${itemLines}

Total: ${money(total)}

Bank Details:
${CONFIG.bank?.name||''}
Account No: ${CONFIG.bank?.accountNumber||''}
Account Name: ${CONFIG.bank?.accountName||''}
Branch: ${CONFIG.bank?.branch||''}

Location: ${CONFIG.address||''}
Contact: ${CONFIG.phoneDisplay||''}`;
  }
  async function downloadReceiptPdf(){
    const jsPDF=window.jspdf&&window.jspdf.jsPDF;if(!jsPDF){window.print();return}
    lastReceiptText=await buildReceiptText();
    const doc=new jsPDF({unit:'pt',format:'a4'});drawHeader(doc,'ORDER RECEIPT',`Date: ${todayString()}`);
    let y=132;doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(25,34,54);
    lastReceiptText.split('\n').forEach(line=>{if(y>740){docFooter(doc);doc.addPage();drawHeader(doc,'ORDER RECEIPT',`Date: ${todayString()}`);y=132};pdfText(doc,line,40,y);y+=15;});
    docFooter(doc);doc.save('sandaruwan-computer-receipt.pdf');
  }
  async function initCheckoutPage(){
    const bank=$('#bankDetails');
    if(bank){
      const b=CONFIG.bank||{};
      bank.innerHTML=`<div class="bank-line"><span>Bank</span><b>${esc(b.name)}</b></div><div class="bank-line"><span>Account Number</span><b>${esc(b.accountNumber)}</b></div><div class="bank-line"><span>Account Name</span><b>${esc(b.accountName)}</b></div><div class="bank-line"><span>Branch</span><b>${esc(b.branch)}</b></div>`;
    }
    await renderCheckoutSummary();
    $('#placeOrderBtn')?.addEventListener('click',async()=>{
      lastReceiptText=await buildReceiptText();const box=$('#receiptBox');if(box){box.style.display='block';box.textContent=lastReceiptText}
      const num=clean(CONFIG.whatsappNumber).replace(/\D/g,'');
      if(!num){toast('WhatsApp number missing');return}
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(lastReceiptText)}`,'_blank','noopener');
    });
    $('#downloadReceiptBtn')?.addEventListener('click',downloadReceiptPdf);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    bindCommon();
    const page=document.body.dataset.page;
    if(page==='home')initHome();
    if(page==='products')initProductsPage();
    if(page==='quotation')initQuotationPage();
    if(page==='cart')initCartPage();
    if(page==='checkout')initCheckoutPage();
    if(page==='prebuild')initPrebuildPage();
  });
})();
