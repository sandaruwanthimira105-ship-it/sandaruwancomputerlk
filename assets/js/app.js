(function(){
  'use strict';

  const CONFIG = window.SC_CONFIG || {};
  const CART_KEY = 'sandaruwan_computer_cart_v29';

  const CATEGORY_ORDER = [
    'CASING','MOTHERBOARD','PROCESSOR','CPU COOLER','RAM','HDD','SSD','VGA CARD','POWER SUPPLY','MONITOR',
    'KEYBOARD','MOUSE','MOUSE PAD','SPEAKER','HEADSET','RGB CASING FAN','CABLES','OTHER'
  ];
  const CATEGORY_ALIASES = {
    CASIN:'CASING',CASING:'CASING',CASE:'CASING',
    MOTHERBORD:'MOTHERBOARD',MOTHERBOARD:'MOTHERBOARD',BOARD:'MOTHERBOARD',BORD:'MOTHERBOARD','MOTHER BOARD':'MOTHERBOARD',
    PROSSR:'PROCESSOR',PROSSOR:'PROCESSOR',PROCESSER:'PROCESSOR',PROCESSOR:'PROCESSOR',CPU:'PROCESSOR',
    CPUCOOLER:'CPU COOLER',COOLER:'CPU COOLER','CPU COOLER':'CPU COOLER',
    HARD:'HDD',HDD:'HDD',HARDDISK:'HDD','HARD DISK':'HDD','HARD DRIVE':'HDD',
    VGA:'VGA CARD','VGA CARD':'VGA CARD',GPU:'VGA CARD','GRAPHIC CARD':'VGA CARD','GRAPHICS CARD':'VGA CARD',
    POWERSUPPLY:'POWER SUPPLY',PSU:'POWER SUPPLY','POWER SUPPLY':'POWER SUPPLY',
    CABLE:'CABLES',CABLES:'CABLES',
    KEYBORD:'KEYBOARD',KEYBOARD:'KEYBOARD',
    HEDSET:'HEADSET',HEADSET:'HEADSET',
    SPEKER:'SPEAKER',SPEAKER:'SPEAKER',
    RAM:'RAM',SSD:'SSD',MONITOR:'MONITOR',MOUSE:'MOUSE','MOUSE PAD':'MOUSE PAD','RGB CASING FAN':'RGB CASING FAN',OTHER:'OTHER'
  };
  const GEN_VALUES = Array.from({length:13},(_,i)=>String(i+2));
  const MONITOR_SIZES = ['19','20','22','24','27','29','32'];
  const VGA_MEMORY = ['2GB','3GB','4GB','6GB','8GB','12GB'];
  const RAM_CAPACITY = ['4GB','8GB','16GB'];

  let productsCache = null;
  let quoteProducts = [];

  function $(sel, root=document){return root.querySelector(sel)}
  function $all(sel, root=document){return Array.from(root.querySelectorAll(sel))}
  function clean(v){return String(v ?? '').trim()}
  function upper(v){return clean(v).toUpperCase()}
  function esc(s){return clean(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function normKey(s){return upper(s).replace(/[^A-Z0-9]/g,'')}
  function toNumber(v){const n=Number(clean(v).replace(/[^0-9.]/g,''));return Number.isFinite(n)?n:0}
  function money(n){return 'Rs. '+toNumber(n).toLocaleString('en-LK')}
  function categoryName(v){const raw=upper(v);const compact=normKey(v);return CATEGORY_ALIASES[raw]||CATEGORY_ALIASES[compact]||raw||'OTHER'}
  function boolish(v){const x=upper(v);return ['YES','Y','TRUE','1','SUPPORTED','SUPPORT'].includes(x)}
  function conditionName(v){const x=upper(v);if(['NEW','BRANDNEW','BRAND NEW'].includes(x.replace(/\s/g,'')))return 'BRAND NEW';if(x==='USED')return 'USED';return x||'USED'}
  function productImage(p){return clean(p.image)||'assets/img/logo.jpg'}
  function genNum(v){const s=upper(v);const m=s.match(/14|13|12|11|10|[2-9]/);return m?m[0]:''}
  function genLabel(g){const n=Number(g);if(!n)return '';if(n===2)return '2ND GEN';if(n===3)return '3RD GEN';return `${n}TH GEN`}
  function normalizeMonitorSize(v){const m=clean(v).match(/19|20|22|24|27|29|32/);return m?m[0]:''}
  function normalizePanelType(v){const s=upper(v);if(s.includes('IPS'))return 'IPS';if(s.includes('VA'))return 'VA';if(s.includes('TN'))return 'TN';return ''}
  function normalizeRamSupport(v){const s=upper(v).replace(/\s+/g,'');if(s.includes('DDR5'))return 'DDR5';if(s.includes('DDR4'))return 'DDR4';if(s.includes('DDR3'))return 'DDR3';return ''}
  function normalizeRamSlot(v){const slots=parseRamSlots(v);return slots[0]||''}
  function parseRamSlots(...values){
    const out=[];
    values.forEach(v=>{
      const s=upper(v).replace(/[^A-Z0-9]/g,' ');
      if(!s.trim())return;
      if(/2/.test(s)||s.includes('2RAM')||s.includes('2 SLOT')||s.includes('2SLOT'))out.push('2');
      if(/4/.test(s)||s.includes('4RAM')||s.includes('4 SLOT')||s.includes('4SLOT'))out.push('4');
    });
    return out.filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>Number(a)-Number(b));
  }
  function ramSlotsLabel(p){
    const slots=p.ramSlots||[];
    return slots.length?slots.map(s=>`${s} RAM SLOT`).join(' / '):'';
  }
  function motherboardQuoteName(p,slot){
    const s=slot||'2';
    let base=clean(p.name).replace(/RAM\s*SLOT\s*[24]/gi,'').replace(/[24]\s*RAM\s*SLOT/gi,'').replace(/\s+/g,' ').trim();
    if(/MOTHER\s*BOARD|MOTHERBOARD|BORD|BOARD/i.test(base)){
      base=base.replace(/MOTHER\s*BOARD|MOTHERBOARD|BORD|BOARD/i,`${s} RAM SLOT Motherboard`);
    }else{
      base=`${base} ${s} RAM SLOT Motherboard`;
    }
    return base.replace(/\s+/g,' ').trim();
  }
  function motherboardSlotPrice(p,slot){return toNumber(p.price)+(String(slot)==='4'?500:0)}
  function normalizeCapacity(v){const m=upper(v).match(/\d+\s*(GB|TB)/);return m?m[0].replace(/\s+/g,''):clean(v)}
  function normalizeWatt(v){const m=upper(v).match(/\d{3,4}/);return m?m[0]:''}
  function normalizeRgb(v){const s=upper(v).replace(/\s+/g,' ');if(s.includes('NON'))return 'NON RGB';if(s.includes('RGB'))return 'RGB';return ''}
  function normalizeSsdType(v){const s=upper(v);if(s.includes('NVME'))return 'NVME SSD';if(s.includes('M.2')||s.includes('M2'))return 'M.2 SSD';if(s.includes('SATA'))return 'SATA SSD';return ''}
  function normalizeSsdSupport(v){
    const s=upper(v).replace(/\s+/g,' ');
    if(!s)return '';
    if(s.includes('NVME'))return 'SATA - M.2 - NVME';
    if(s.includes('M.2')||s.includes('M2'))return 'SATA AND M.2';
    if(s.includes('SATA'))return 'SATA ONLY';
    return s;
  }
  function ssdSupportList(v){
    const x=normalizeSsdSupport(v);
    if(x==='SATA - M.2 - NVME')return ['SATA SSD','M.2 SSD','NVME SSD'];
    if(x==='SATA AND M.2')return ['SATA SSD','M.2 SSD'];
    if(x==='SATA ONLY')return ['SATA SSD'];
    return ['SATA SSD'];
  }
  function getField(row, names){
    const map={};Object.keys(row||{}).forEach(k=>map[normKey(k)]=row[k]);
    for(const n of names){const v=map[normKey(n)];if(v!==undefined&&clean(v)!=='')return v}
    return '';
  }
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
    while(rows.length&&upper(rows[0][0]).startsWith('SEP='))rows.shift();
    if(rows.length<2)return[];
    const headers=rows[0].map(h=>clean(h));
    return rows.slice(1).map(cols=>{const o={};headers.forEach((h,i)=>{o[h]=clean(cols[i]??'')});return o});
  }

  async function fetchText(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('Load failed '+r.status);return await r.text()}
  async function loadProducts(){
    if(productsCache)return productsCache;
    let rows=[];const csvUrl=clean(CONFIG.sheetCsvUrl);
    if(csvUrl){try{rows=parseCSV(await fetchText(csvUrl))}catch(e){console.warn('Google Sheets CSV load failed',e)}}
    if(!rows.length && location.protocol!=='file:'){
      try{const r=await fetch('data/products.csv',{cache:'no-store'});if(r.ok)rows=parseCSV(await r.text())}catch(e){}
      if(!rows.length){try{const r=await fetch('data/products.json',{cache:'no-store'});if(r.ok)rows=await r.json()}catch(e){}}
    }
    productsCache=(Array.isArray(rows)?rows:[]).map(normalizeProduct).filter(p=>p.name&&p.category&&p.id);
    return productsCache;
  }

  function normalizeProduct(row,i=0){
    const category=categoryName(getField(row,['CATEGORY','category']));
    const mbGen1=genNum(getField(row,['MB GEN OPTION 1','MB GEN TAB OPTION 1','mbGenOption1','mb gen 1']));
    const mbGen2=genNum(getField(row,['MB GEN OPTION 2','MB GEN TAB OPTION 2','mbGenOption2','mb gen 2']));
    const oldGens=[];
    for(let g=2;g<=14;g++)if(boolish(getField(row,[`gen${g}`,`${g}TH GEN`,`${g} gen`])))oldGens.push(String(g));
    const mbGens=[mbGen1,mbGen2,...oldGens].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i);
    const processorGen=genNum(getField(row,['PROCESSOR GEN','PROSSOR GEN','processorGen','generation','gen']));
    const ramSupport=normalizeRamSupport(getField(row,['RAM SUPPORT','RAM','MEMORY','memory','ramSupport','ram_type']));
    const image=clean(getField(row,['IMAGE PATH','IMAGE','image','imageUrl','image url']))||'assets/img/logo.jpg';
    const ssdSupport=normalizeSsdSupport(getField(row,['SSD SUPPORT','STORAGE SUPPORT','storageSupport','ssdSupport']));
    const ssdType=normalizeSsdType(getField(row,['SSD TYPE','storageType','ssdType','interface']));
    const capacity=normalizeCapacity(getField(row,['CAPACITY','CAPACITY / MEMORY','MEMORY','VGA MEMORY','capacity','memorySize']));
    const watt=normalizeWatt(getField(row,['WATT','WAT','WATTS','watt','psu watt']));
    const monitorSize=normalizeMonitorSize(getField(row,['MONITOR SIZE','SIZE','monitorSize']));
    const ramSlots=parseRamSlots(
      getField(row,['RAM SLOT OPTION 1','RAM SLOT 1','RAMSLOT OPTION 1','RAM SLOT OPTION ONE']),
      getField(row,['RAM SLOT OPTION 2','RAM SLOT 2','RAMSLOT OPTION 2','RAM SLOT OPTION TWO']),
      getField(row,['RAM SLOT','RAM SLOTS','ramSlot','ramSlots'])
    );
    const panelType=normalizePanelType(getField(row,['PANEL TYPE','PANEL','panelType','panel']));
    return {
      id:clean(getField(row,['PRODUCT ID','ID','id']))||`ITEM-${i+1}`,
      name:clean(getField(row,['PRODUCT NAME','NAME','name']))||'Product',
      category,
      condition:conditionName(getField(row,['CONDITION','condition'])),
      price:toNumber(getField(row,['PRICE','price'])),
      image,
      brand:clean(getField(row,['BRAND','brand'])),
      model:clean(getField(row,['MODEL / SERIES','MODEL','TYPE','MODEL TYPE','model','series']))||clean(getField(row,['PROS MODEL','VGA MODEL'])),
      mbGen1,mbGen2,mbGens,
      processorGen,
      ramSupport,
      ramSlot:ramSlots.join('/'),
      ramSlots,
      ssdSupport,
      ssdType,
      monitorSize,
      panelType,
      capacity,
      speed:clean(getField(row,['SPEED','speed'])),
      watt,
      rgb:normalizeRgb(getField(row,['RGB','rgb'])),
      socketGen:clean(getField(row,['SOCKET / GEN','SOCKET','SOCKET GEN','socket','socketGen'])),
      warrantyMonths:clean(getField(row,['WARRANTY MONTHS','WARRANTY','warrantyMonths','warranty'])),
      stock:clean(getField(row,['STOCK','stock','qty'])),
      description:clean(getField(row,['DESCRIPTION','description'])),
      cableType:clean(getField(row,['CABLE TYPE','cableType']))
    };
  }

  function getCart(){try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch{return[]}}
  function saveCart(cart){localStorage.setItem(CART_KEY,JSON.stringify(cart));updateCartCount()}
  function updateCartCount(){$all('[data-cart-count]').forEach(el=>el.textContent=getCart().reduce((s,it)=>s+Number(it.qty||1),0))}
  function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2200)}
  function addToCart(id,qty=1){const cart=getCart();const found=cart.find(x=>x.id===id&&!x.custom);if(found)found.qty+=Number(qty||1);else cart.push({id,qty:Number(qty||1)});saveCart(cart);toast('Added to cart')}
  function addQuoteLinesToCart(lines){const cart=getCart();cart.push({id:'QUOTE-'+Date.now(),qty:1,custom:{name:'Custom PC Quotation',price:lines.reduce((s,l)=>s+l.price*l.qty,0),category:'QUOTE',condition:'',lines}});saveCart(cart);toast('Quotation added to cart')}
  function addCustomProductToCart(item,qty=1){const cart=getCart();cart.push({id:'CUSTOM-'+Date.now()+'-'+Math.floor(Math.random()*9999),qty:Number(qty||1),custom:{name:item.name,price:toNumber(item.price),category:item.category||'CUSTOM',condition:item.condition||'',image:item.image||'assets/img/logo.jpg'}});saveCart(cart);toast('Added to cart')}
  function removeFromCart(id){saveCart(getCart().filter(it=>it.id!==id));initCartPage()}
  function setQty(id,qty){saveCart(getCart().map(it=>it.id===id?{...it,qty:Math.max(1,Number(qty||1))}:it));initCartPage()}
  function byId(products,id){return products.find(p=>p.id===id)}

  function bindCommon(){
    updateCartCount();
    $('#mobileMenuBtn')?.addEventListener('click',()=>$('#navLinks')?.classList.toggle('open'));
    document.addEventListener('click',e=>{
      const add=e.target.closest('[data-add-to-cart]');if(add){addToCart(add.getAttribute('data-add-to-cart'),Number($('#modalProductQty')?.value||1));}
      const rm=e.target.closest('[data-remove-cart]');if(rm)removeFromCart(rm.getAttribute('data-remove-cart'));
    });
    document.addEventListener('change',e=>{const q=e.target.closest('[data-cart-qty]');if(q)setQty(q.getAttribute('data-cart-qty'),q.value)});
  }

  function optionHTML(p){return `<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)}${p.condition?` (${esc(p.condition)})`:''}</option>`}
  function fillSelectKeep(sel,items,placeholder){
    if(!sel)return false;
    const current=sel.value;
    sel.innerHTML=`<option value="">${esc(placeholder)}</option>`+items.map(optionHTML).join('');
    sel.disabled=false;
    if(current && items.some(p=>p.id===current)){sel.value=current;return true}
    sel.value='';return false;
  }
  function matchCondition(p,condition){return !condition||p.condition===condition}
  function unique(arr){return Array.from(new Set(arr.map(clean).filter(Boolean))).sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}))}

  function productCard(p){
    const details=[p.condition,p.brand,p.model,p.ramSupport,p.capacity,p.monitorSize?`${p.monitorSize} Wide`:'',p.panelType,p.watt?`${p.watt}W`:'' ].filter(Boolean).join(' • ');
    return `<article class="product-card" data-product-id="${esc(p.id)}" tabindex="0">
      <div class="product-img"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='assets/img/logo.jpg'"></div>
      <div class="product-body"><div class="product-tags"><span class="tag ${p.condition==='BRAND NEW'?'new':'used'}">${esc(p.condition)}</span><span class="tag">${esc(p.category)}</span></div>
      <h3>${esc(p.name)}</h3><p class="muted small">${esc(details||p.description)}</p><div class="price-row"><strong>${money(p.price)}</strong><button class="btn btn-primary btn-small" data-add-to-cart="${esc(p.id)}">Add</button></div></div>
    </article>`;
  }
  function ensureProductModal(){
    if($('#productModal'))return;
    document.body.insertAdjacentHTML('beforeend',`<div class="product-modal" id="productModal" aria-hidden="true"><div class="product-modal-backdrop" data-close-modal></div><div class="product-modal-card"><button class="modal-close" data-close-modal>×</button><div id="productModalContent"></div></div></div>`);
    const modal=$('#productModal');
    document.addEventListener('click',e=>{if(e.target.closest('[data-close-modal]'))closeProductModal()});
    modal.addEventListener('change',e=>{if(e.target.id==='modalRamSlotOption')updateProductModalPrice()});
    modal.addEventListener('click',e=>{
      const add=e.target.closest('[data-modal-add-product]');
      if(!add)return;
      const id=add.getAttribute('data-modal-add-product');
      const p=(productsCache||[]).find(x=>x.id===id);if(!p)return;
      const qty=Math.max(1,Number($('#modalProductQty')?.value||1));
      if(p.category==='MOTHERBOARD'&&(p.ramSlots||[]).length){
        const slot=$('#modalRamSlotOption')?.value||((p.ramSlots||[])[0]||'2');
        addCustomProductToCart({name:motherboardQuoteName(p,slot),price:motherboardSlotPrice(p,slot),category:p.category,condition:p.condition,image:productImage(p)},qty);
      }else addToCart(p.id,qty);
      closeProductModal();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeProductModal()});
  }
  function updateProductModalPrice(){
    const modal=$('#productModal');if(!modal)return;const p=(productsCache||[]).find(x=>x.id===modal.dataset.productId);if(!p)return;
    const slot=$('#modalRamSlotOption')?.value||((p.ramSlots||[])[0]||'2');
    const price=p.category==='MOTHERBOARD'?(motherboardSlotPrice(p,slot)):p.price;
    const priceEl=$('#modalProductPrice');if(priceEl)priceEl.textContent=money(price);
  }
  function closeProductModal(){const m=$('#productModal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}}
  function warrantyText(p){if(p.warrantyMonths)return `${esc(p.warrantyMonths)} month warranty`;return p.condition==='BRAND NEW'?'Brand/shop warranty as available':'Shop checking warranty as available'}
  function openProductModal(id,products){
    const p=byId(products,id);if(!p)return;ensureProductModal();
    const slots=p.category==='MOTHERBOARD'?(p.ramSlots||[]):[];
    const defaultSlot=slots.includes('2')?'2':(slots[0]||'');
    const slotSelector=slots.length?`<div class="product-modal-order"><label>RAM Slot Option</label><select class="input" id="modalRamSlotOption">${slots.map(s=>`<option value="${s}" ${s===defaultSlot?'selected':''}>${s} RAM SLOT${s==='4'?' (+Rs. 500)':''}</option>`).join('')}</select></div>`:'';
    $('#productModal').dataset.productId=p.id;
    $('#productModalContent').innerHTML=`<div class="product-modal-grid"><div class="product-modal-image"><img src="${esc(productImage(p))}" onerror="this.src='assets/img/logo.jpg'" alt="${esc(p.name)}"></div><div class="product-modal-info">
      <div class="modal-tag-row"><span class="tag ${p.condition==='BRAND NEW'?'new':'used'}">${esc(p.condition)}</span><span class="tag">${esc(p.category)}</span></div><h2>${esc(p.name)}</h2><div class="product-modal-price" id="modalProductPrice">${money(slots.length?motherboardSlotPrice(p,defaultSlot):p.price)}</div>
      <p class="product-modal-description">${esc(p.description||'Quality computer product from Sandaruwan Computer. Please confirm availability before payment.')}</p>
      <div class="product-detail-list">
        <div><span>Brand</span><b>${esc(p.brand||'-')}</b></div><div><span>Model / Type</span><b>${esc(p.model||'-')}</b></div><div><span>Warranty Period</span><b>${warrantyText(p)}</b></div>
        ${p.mbGens?.length?`<div><span>Board GEN Support</span><b>${esc(p.mbGens.map(genLabel).join(' / '))}</b></div>`:''}
        ${p.processorGen?`<div><span>Processor GEN</span><b>${esc(genLabel(p.processorGen))}</b></div>`:''}
        ${p.ramSupport?`<div><span>RAM Support</span><b>${esc(p.ramSupport)}</b></div>`:''}
        ${ramSlotsLabel(p)?`<div><span>RAM Slot Options</span><b>${esc(ramSlotsLabel(p))}</b></div>`:''}
        ${p.ssdSupport?`<div><span>SSD Support</span><b>${esc(p.ssdSupport)}</b></div>`:''}
        ${p.capacity?`<div><span>Capacity / Memory</span><b>${esc(p.capacity)}</b></div>`:''}
        ${p.watt?`<div><span>Watt</span><b>${esc(p.watt)}W</b></div>`:''}
        ${p.monitorSize?`<div><span>Monitor Size</span><b>${esc(p.monitorSize)} Wide</b></div>`:''}
        ${p.panelType?`<div><span>Panel Type</span><b>${esc(p.panelType)}</b></div>`:''}
      </div>${slotSelector}<div class="product-modal-order"><label>Quantity</label><div class="modal-qty-row"><input class="input" id="modalProductQty" type="number" min="1" value="1"><button class="btn btn-primary" data-modal-add-product="${esc(p.id)}">Add to Cart</button></div></div>
    </div></div>`;
    const modal=$('#productModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
  }

  async function initProductsPage(){
    const products=await loadProducts();const grid=$('#productsGrid');if(!grid)return;ensureProductModal();
    const categoryList=$('#categoryList');
    const cats=['ALL',...CATEGORY_ORDER.filter(c=>products.some(p=>p.category===c))];
    let selectedCat='ALL';
    function renderCats(){categoryList.innerHTML=cats.map(c=>`<button class="category-link ${c===selectedCat?'active':''}" data-cat="${esc(c)}">${c==='ALL'?'All Products':esc(c)}<span>${c==='ALL'?products.length:products.filter(p=>p.category===c).length}</span></button>`).join('')}
    function setOptions(id,values,placeholder){const sel=$(id);if(!sel)return;const cur=sel.value;sel.innerHTML=`<option value="">${placeholder}</option>`+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');if(values.includes(cur))sel.value=cur}
    function visibleFilters(){
      const c=selectedCat;const map={
        'MOTHERBOARD':['generation','ramSupport','brand','storage'],
        'PROCESSOR':['processorGen','model','brand'],
        'CPU COOLER':['socketGen','brand'],
        'RAM':['capacity','speed','brand','ramSupport'],
        'HDD':['capacity','brand'],
        'SSD':['capacity','brand','ssdType'],
        'VGA CARD':['capacity','model','brand'],
        'POWER SUPPLY':['watt','brand'],
        'MONITOR':['monitorSize','panelType','brand'],
        'CASING':['brand'],
        'KEYBOARD':['rgb','brand'], 'MOUSE':['rgb','brand'], 'SPEAKER':['rgb','brand'], 'HEADSET':['rgb','brand'], 'MOUSE PAD':['brand'], 'RGB CASING FAN':['brand'], 'CABLES':['brand'], 'OTHER':['brand']
      };
      return c==='ALL'?['brand','condition']:['condition',...(map[c]||['brand'])];
    }
    function updateFilters(){
      const visible=visibleFilters();
      $all('[data-filter-box]').forEach(b=>b.style.display=visible.includes(b.dataset.filterBox)?'':'none');
      const scoped=selectedCat==='ALL'?products:products.filter(p=>p.category===selectedCat);
      setOptions('#brandFilter',unique(scoped.map(p=>p.brand)),'Brand');
      setOptions('#modelFilter',unique(scoped.map(p=>p.model)),'Model / Type');
      setOptions('#processorGenFilter',unique(scoped.map(p=>p.processorGen).filter(Boolean).map(genLabel)),'Processor Gen');
      setOptions('#generationFilter',unique(scoped.flatMap(p=>p.mbGens||[]).map(genLabel)),'Board Gen');
      setOptions('#ramSupportFilter',unique(scoped.map(p=>p.ramSupport)),'RAM Support');
      setOptions('#storageFilter',unique(scoped.map(p=>p.ssdSupport||p.ssdType)),'SSD / Storage');
      setOptions('#ssdTypeFilter',unique(scoped.map(p=>p.ssdType)),'SSD Type');
      setOptions('#monitorSizeFilter',unique(scoped.map(p=>p.monitorSize).filter(Boolean).map(x=>`${x} WIDE`)),'Monitor Size');
      setOptions('#panelTypeFilter',unique(scoped.map(p=>p.panelType).filter(Boolean)),'Panel Type');
      setOptions('#capacityFilter',unique(scoped.map(p=>p.capacity)),'Capacity / Memory');
      setOptions('#speedFilter',unique(scoped.map(p=>p.speed)),'Speed');
      setOptions('#wattFilter',unique(scoped.map(p=>p.watt).filter(Boolean).map(x=>`${x}W`)),'Watt');
      setOptions('#rgbFilter',unique(scoped.map(p=>p.rgb)),'RGB / Non RGB');
      setOptions('#socketGenFilter',unique(scoped.map(p=>p.socketGen)),'Socket / GEN');
    }
    function pass(p){
      if(selectedCat!=='ALL'&&p.category!==selectedCat)return false;
      const q=upper($('#productSearch')?.value);if(q&&!upper([p.name,p.category,p.brand,p.model,p.description,p.capacity,p.watt].join(' ')).includes(q))return false;
      const cond=$('#conditionFilter')?.value;if(cond&&p.condition!==cond)return false;
      const brand=$('#brandFilter')?.value;if(brand&&p.brand!==brand)return false;
      const model=$('#modelFilter')?.value;if(model&&p.model!==model)return false;
      const pg=$('#processorGenFilter')?.value;if(pg&&genLabel(p.processorGen)!==pg)return false;
      const bg=$('#generationFilter')?.value;if(bg&&!(p.mbGens||[]).map(genLabel).includes(bg))return false;
      const rs=$('#ramSupportFilter')?.value;if(rs&&p.ramSupport!==rs)return false;
      const st=$('#storageFilter')?.value;if(st&&(p.ssdSupport!==st&&p.ssdType!==st))return false;
      const ssdT=$('#ssdTypeFilter')?.value;if(ssdT&&p.ssdType!==ssdT)return false;
      const size=$('#monitorSizeFilter')?.value;if(size&&`${p.monitorSize} WIDE`!==size)return false;
      const panel=$('#panelTypeFilter')?.value;if(panel&&p.panelType!==panel)return false;
      const cap=$('#capacityFilter')?.value;if(cap&&p.capacity!==cap)return false;
      const speed=$('#speedFilter')?.value;if(speed&&p.speed!==speed)return false;
      const watt=$('#wattFilter')?.value;if(watt&&`${p.watt}W`!==watt)return false;
      const rgb=$('#rgbFilter')?.value;if(rgb&&p.rgb!==rgb)return false;
      const socket=$('#socketGenFilter')?.value;if(socket&&p.socketGen!==socket)return false;
      return true;
    }
    function render(){const list=products.filter(pass);$('#productCount')&&( $('#productCount').textContent=`${list.length} item${list.length===1?'':'s'}`);grid.innerHTML=list.length?list.map(productCard).join(''):'<div class="empty-state"><h2>No products found</h2><p>Change filters or check Google Sheet data.</p></div>'}
    renderCats();updateFilters();render();
    categoryList?.addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;selectedCat=b.dataset.cat;$all('select.product-filter').forEach(s=>s.value='');renderCats();updateFilters();render()});
    $all('#productSearch, .product-filter').forEach(el=>el.addEventListener('input',render));
    grid.addEventListener('click',e=>{if(e.target.closest('[data-add-to-cart]'))return;const card=e.target.closest('[data-product-id]');if(card)openProductModal(card.dataset.productId,products)});
    grid.addEventListener('keydown',e=>{const card=e.target.closest('[data-product-id]');if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openProductModal(card.dataset.productId,products)}});
  }

  function conditionValue(group){const active=$(`[data-condition-switch="${group}"] .active`);return active?active.dataset.condition:''}
  function buildConditionSwitch(group,lockedNew=false){return `<div class="condition-switch" data-condition-switch="${esc(group)}">${lockedNew?'<button type="button" class="active" data-condition="BRAND NEW">BRAND NEW</button>':`<button type="button" class="active" data-condition="">ALL</button><button type="button" data-condition="USED">USED</button><button type="button" data-condition="BRAND NEW">BRAND NEW</button>`}</div>`}
  function selectOptions(items,placeholder){return `<option value="">${esc(placeholder)}</option>`+items.map(optionHTML).join('')}
  function categoryItems(cat,cond=''){return quoteProducts.filter(p=>p.category===cat&&matchCondition(p,cond))}
  function boardMatchesCpu(board,cpu){if(!cpu)return true;const gen=cpu.processorGen;if(!gen)return true;return (board.mbGens||[]).includes(gen)}
  function ramMatches(ram,board,cpu){const needed=board?.ramSupport||'';if(needed&&ram.ramSupport!==needed)return false;return true}
  function ssdMatches(ssd,board){if(!board)return true;const supported=ssdSupportList(board.ssdSupport);return supported.includes(ssd.ssdType||'SATA SSD')}
  function cpuCoolerMatches(cooler,cpu){if(!cpu||!cooler.socketGen)return true;return upper(cooler.socketGen).includes(genLabel(cpu.processorGen))||upper(cooler.socketGen).includes(cpu.processorGen)}

  function renderQuoteForm(){
    const wrap=$('#quoteComponentForm');if(!wrap)return;
    wrap.innerHTML=`
      <div class="quote-section-title">Core Components</div>
      <div class="field"><label>Casing</label>${buildConditionSwitch('CASING')}<select id="quoteCasing" data-quote-category="CASING"></select></div>
      <div class="field"><label>Processor</label>${buildConditionSwitch('PROCESSOR')}<select id="quoteProcessor"></select></div>
      <div class="field"><label>Motherboard</label>${buildConditionSwitch('MOTHERBOARD')}<select id="quoteMotherboard"></select></div>
      <div class="field"><label>RAM Slot Option</label><select id="quoteRamSlot"><option value="">Select motherboard first</option></select></div>
      <div class="field"><label>CPU Cooler</label>${buildConditionSwitch('CPU COOLER')}<select id="quoteCpuCooler" data-quote-category="CPU COOLER"></select></div>
      <div class="field"><label>RAM</label>${buildConditionSwitch('RAM')}<div class="select-qty-row"><select id="quoteRamCapacity"><option value="">Any Capacity</option>${RAM_CAPACITY.map(x=>`<option>${x}</option>`).join('')}</select><select id="quoteRam"></select><input class="input quote-qty-input" id="quoteRamQty" type="number" min="1" value="1"></div></div>
      <div class="field"><label>HDD</label>${buildConditionSwitch('HDD')}<div class="select-qty-row"><select id="quoteHdd"></select><input class="input quote-qty-input" id="quoteHddQty" type="number" min="1" value="1"></div></div>
      <div class="field"><label>SSD</label>${buildConditionSwitch('SSD')}<div class="select-qty-row"><select id="quoteSsd"></select><input class="input quote-qty-input" id="quoteSsdQty" type="number" min="1" value="1"></div></div>
      <div class="field"><label>Power Supply</label>${buildConditionSwitch('POWER SUPPLY')}<select id="quotePsu" data-quote-category="POWER SUPPLY"></select></div>
      <div class="field"><label>VGA Card</label>${buildConditionSwitch('VGA CARD')}<div class="select-qty-row"><select id="quoteVgaMemory"><option value="">Any Memory</option>${VGA_MEMORY.map(x=>`<option>${x}</option>`).join('')}</select><select id="quoteVga"></select></div></div>
      <div class="field"><label>Monitor</label>${buildConditionSwitch('MONITOR')}<div class="select-qty-row"><select id="quoteMonitorSize"><option value="">Any Size</option>${MONITOR_SIZES.map(x=>`<option value="${x}">${x} WIDE</option>`).join('')}</select><select id="quoteMonitor"></select></div></div>
      <div class="quote-section-title">Extra Items</div>
      <div class="field"><label>Keyboard</label>${buildConditionSwitch('KEYBOARD',true)}<select id="quoteKeyboard" data-quote-category="KEYBOARD"></select></div>
      <div class="field"><label>Mouse</label>${buildConditionSwitch('MOUSE',true)}<select id="quoteMouse" data-quote-category="MOUSE"></select></div>
      <div class="field"><label>Mouse Pad</label>${buildConditionSwitch('MOUSE PAD',true)}<select id="quoteMousePad" data-quote-category="MOUSE PAD"></select></div>
      <div class="field"><label>Speaker</label>${buildConditionSwitch('SPEAKER',true)}<select id="quoteSpeaker" data-quote-category="SPEAKER"></select></div>
      <div class="field"><label>Headset</label>${buildConditionSwitch('HEADSET',true)}<select id="quoteHeadset" data-quote-category="HEADSET"></select></div>
      <div class="field"><label>RGB Casing Fan</label>${buildConditionSwitch('RGB CASING FAN',true)}<div class="select-qty-row"><select id="quoteRgbFan"></select><input class="input quote-qty-input" id="quoteRgbFanQty" type="number" min="1" value="1"></div></div>
      <div class="field wide"><label>Cables</label><div class="quote-cable-grid">${['POWER CABLE','VGA CABLE','HDMI CABLE','DVI CABLE'].map(c=>`<label class="quote-cable-item"><input type="checkbox" data-cable-option="${c}"><span>${c}</span><input class="input quote-qty-input" type="number" min="1" value="1" data-cable-qty="${c}"></label>`).join('')}</div></div>
    `;
  }

  async function initQuotationPage(){
    quoteProducts=await loadProducts();if(!$('#quoteComponentForm'))return;renderQuoteForm();
    function selectFor(cat){return $(`[data-quote-category="${cat}"]`) || ({
      'PROCESSOR':'#quoteProcessor','MOTHERBOARD':'#quoteMotherboard','RAM':'#quoteRam','HDD':'#quoteHdd','SSD':'#quoteSsd','VGA CARD':'#quoteVga','MONITOR':'#quoteMonitor','RGB CASING FAN':'#quoteRgbFan'
    }[cat] ? $({
      'PROCESSOR':'#quoteProcessor','MOTHERBOARD':'#quoteMotherboard','RAM':'#quoteRam','HDD':'#quoteHdd','SSD':'#quoteSsd','VGA CARD':'#quoteVga','MONITOR':'#quoteMonitor','RGB CASING FAN':'#quoteRgbFan'
    }[cat]) : null)}
    function updateSelect(sel,items,placeholder){fillSelectKeep(sel,items,placeholder)}
    function updateQuoteOptions(){
      const cpuSel=$('#quoteProcessor'),boardSel=$('#quoteMotherboard');
      updateSelect(cpuSel,categoryItems('PROCESSOR',conditionValue('PROCESSOR')),'Select processor');
      const cpu=byId(quoteProducts,cpuSel.value);
      updateSelect(boardSel,categoryItems('MOTHERBOARD',conditionValue('MOTHERBOARD')).filter(b=>boardMatchesCpu(b,cpu)),'Select compatible motherboard');
      const board=byId(quoteProducts,boardSel.value);
      const slotSel=$('#quoteRamSlot');
      if(slotSel){
        const currentSlot=slotSel.value;
        const slots=board?(board.ramSlots&&board.ramSlots.length?board.ramSlots:['2']):[];
        slotSel.innerHTML=slots.length?slots.map(s=>`<option value="${s}">${s} RAM SLOT${s==='4'?' (+Rs. 500)':''}</option>`).join(''):'<option value="">Select motherboard first</option>';
        if(slots.includes(currentSlot))slotSel.value=currentSlot;else if(slots.includes('2'))slotSel.value='2';else if(slots.length)slotSel.value=slots[0];
        slotSel.disabled=!slots.length;
      }
      const ramCapacity=$('#quoteRamCapacity')?.value;
      updateSelect($('#quoteRam'),categoryItems('RAM',conditionValue('RAM')).filter(r=>ramMatches(r,board,cpu)&&(!ramCapacity||r.capacity===ramCapacity)),'Select RAM');
      updateSelect($('#quoteCpuCooler'),categoryItems('CPU COOLER',conditionValue('CPU COOLER')).filter(c=>cpuCoolerMatches(c,cpu)),'Skip CPU Cooler');
      updateSelect($('#quoteHdd'),categoryItems('HDD',conditionValue('HDD')),'Skip HDD');
      updateSelect($('#quoteSsd'),categoryItems('SSD',conditionValue('SSD')).filter(s=>ssdMatches(s,board)),'Select compatible SSD');
      updateSelect($('#quotePsu'),categoryItems('POWER SUPPLY',conditionValue('POWER SUPPLY')),'Skip Power Supply');
      const vgMem=$('#quoteVgaMemory')?.value;updateSelect($('#quoteVga'),categoryItems('VGA CARD',conditionValue('VGA CARD')).filter(v=>!vgMem||v.capacity===vgMem),'Skip VGA Card');
      const monSize=$('#quoteMonitorSize')?.value;updateSelect($('#quoteMonitor'),categoryItems('MONITOR',conditionValue('MONITOR')).filter(m=>!monSize||m.monitorSize===monSize),'Skip Monitor');
      ['CASING','KEYBOARD','MOUSE','MOUSE PAD','SPEAKER','HEADSET'].forEach(cat=>{updateSelect(selectFor(cat),categoryItems(cat,conditionValue(cat)),`Skip ${cat}`)});
      updateSelect($('#quoteRgbFan'),categoryItems('RGB CASING FAN','BRAND NEW'),'Skip RGB Casing Fan');
      renderQuote();
    }
    $('#quoteComponentForm').addEventListener('click',e=>{const b=e.target.closest('.condition-switch button');if(!b)return;const sw=b.closest('.condition-switch');$all('button',sw).forEach(x=>x.classList.remove('active'));b.classList.add('active');updateQuoteOptions()});
    $('#quoteComponentForm').addEventListener('change',updateQuoteOptions);
    $('#addQuoteToCartBtn')?.addEventListener('click',()=>{const lines=getQuoteLines();if(!lines.length){toast('Select products first');return}addQuoteLinesToCart(lines)});
    $('#downloadQuotePdfBtn')?.addEventListener('click',downloadQuotationPdf);
    updateQuoteOptions();
  }

  function selectedLine(selId,qtyId,customPrice=0,customNameSuffix=''){
    const p=byId(quoteProducts,$(selId)?.value);if(!p)return null;const qty=Math.max(1,Number($(qtyId)?.value||1));return {...p,name:p.name+customNameSuffix,price:p.price+customPrice,qty};
  }
  function cableLine(name){
    const checked=$(`[data-cable-option="${name}"]`)?.checked;if(!checked)return null;
    const qty=Math.max(1,Number($(`[data-cable-qty="${name}"]`)?.value||1));
    const match=quoteProducts.find(p=>p.category==='CABLES'&&upper(p.name).includes(name.replace(' CABLE','')));
    return match?{...match,qty,name:match.name}:{id:'CUSTOM-'+name,name,category:'CABLES',condition:'BRAND NEW',price:0,qty};
  }
  function getQuoteLines(){
    const lines=[];
    const simple=['#quoteCasing','#quoteProcessor','#quoteCpuCooler','#quotePsu','#quoteVga','#quoteMonitor','#quoteKeyboard','#quoteMouse','#quoteMousePad','#quoteSpeaker','#quoteHeadset'];
    simple.forEach(id=>{const p=selectedLine(id,null);if(p)lines.push(p)});
    const boardProduct=byId(quoteProducts,$('#quoteMotherboard')?.value);if(boardProduct){const slot=$('#quoteRamSlot')?.value||((boardProduct.ramSlots||[])[0]||'2');lines.push({...boardProduct,name:motherboardQuoteName(boardProduct,slot),price:motherboardSlotPrice(boardProduct,slot),qty:1});}
    [['#quoteRam','#quoteRamQty'],['#quoteHdd','#quoteHddQty'],['#quoteSsd','#quoteSsdQty'],['#quoteRgbFan','#quoteRgbFanQty']].forEach(([s,q])=>{const p=selectedLine(s,q);if(p)lines.push(p)});
    ['POWER CABLE','VGA CABLE','HDMI CABLE','DVI CABLE'].forEach(c=>{const l=cableLine(c);if(l)lines.push(l)});
    return lines;
  }
  function renderQuote(){
    const tbody=$('#quoteTable tbody');if(!tbody)return;const lines=getQuoteLines();const total=lines.reduce((s,p)=>s+p.price*p.qty,0);
    tbody.innerHTML=lines.length?lines.map(p=>`<tr><td>${esc(p.name)}<br><span class="muted">${esc(p.category)}${p.capacity?` • ${esc(p.capacity)}`:''}${p.ramSupport?` • ${esc(p.ramSupport)}`:''}</span></td><td>${p.qty}</td><td>${esc(p.condition)}</td><td>${money(p.price*p.qty)}</td></tr>`).join(''):'<tr><td colspan="4" class="muted">No items selected yet.</td></tr>';
    $('#quoteTotal')&&( $('#quoteTotal').textContent=money(total) );
  }
  function quoteCustomer(){return {name:clean($('#quoteCustomerName')?.value),phone:clean($('#quoteCustomerPhone')?.value),email:clean($('#quoteCustomerEmail')?.value),address:clean($('#quoteCustomerAddress')?.value)}}
  function validateQuoteCustomer(){const c=quoteCustomer();if(!c.name||!c.phone||!c.email||!c.address){toast('Fill customer name, phone, email and address');return null}return c}
  function quoteNo(){return 'SCQ-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+Math.floor(1000+Math.random()*9000)}
  function todayString(){return new Date().toLocaleDateString('en-LK',{year:'numeric',month:'short',day:'2-digit'})}
  function pdfText(doc,text,x,y,opts={}){doc.text(String(text),x,y,opts)}
  function drawHeader(doc,title,subtitle){
    doc.setFillColor(5,10,28);doc.rect(0,0,595,100,'F');doc.setFillColor(11,188,255);doc.rect(0,96,595,4,'F');
    if(CONFIG.logoDataUrl){try{doc.addImage(CONFIG.logoDataUrl,'PNG',40,23,52,52)}catch(e){}}
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(20);pdfText(doc,CONFIG.businessName||'Sandaruwan Computer',108,43);
    doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(195,214,239);pdfText(doc,CONFIG.tagline||'PC Builds • Computer Parts',108,62);
    doc.setFont('helvetica','bold');doc.setFontSize(15);doc.setTextColor(255,255,255);pdfText(doc,title,405,42);doc.setFont('helvetica','normal');doc.setFontSize(9);pdfText(doc,subtitle,405,60);pdfText(doc,`Date: ${todayString()}`,405,76);
  }
  function docFooter(doc){const h=doc.internal.pageSize.getHeight();doc.setFillColor(5,10,28);doc.rect(0,h-34,595,34,'F');doc.setTextColor(170,190,215);doc.setFontSize(8);pdfText(doc,'Prices and availability can change. Please confirm before payment.',40,h-14)}
  function downloadQuotationPdf(){
    const customer=validateQuoteCustomer();if(!customer)return;const lines=getQuoteLines();if(!lines.length){toast('Select products first');return}
    const jsPDF=window.jspdf&&window.jspdf.jsPDF;if(!jsPDF){window.print();return}
    const doc=new jsPDF({unit:'pt',format:'a4'});const qn=quoteNo();const total=lines.reduce((s,p)=>s+p.price*p.qty,0);drawHeader(doc,'ONLINE QUOTATION',`Quote No: ${qn}`);
    let y=126;doc.setFillColor(247,251,255);doc.roundedRect(40,y,515,82,12,12,'F');doc.setDrawColor(220,231,245);doc.roundedRect(40,y,515,82,12,12,'S');doc.setTextColor(5,10,28);doc.setFont('helvetica','bold');doc.setFontSize(11);pdfText(doc,'CUSTOMER DETAILS',58,y+22);doc.setFont('helvetica','normal');doc.setFontSize(10);pdfText(doc,`Name: ${customer.name}`,58,y+43);pdfText(doc,`Phone: ${customer.phone}`,305,y+43);pdfText(doc,`Email: ${customer.email}`,58,y+62);pdfText(doc,`Address: ${customer.address}`,305,y+62);y+=108;
    doc.setFillColor(11,188,255);doc.roundedRect(40,y,515,28,8,8,'F');doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(9);pdfText(doc,'#',55,y+18);pdfText(doc,'ITEM',82,y+18);pdfText(doc,'QTY',348,y+18);pdfText(doc,'CONDITION',390,y+18);pdfText(doc,'SUBTOTAL',485,y+18);y+=28;
    doc.setFont('helvetica','normal');doc.setTextColor(25,34,54);doc.setFontSize(9);
    lines.forEach((p,i)=>{if(y>695){docFooter(doc);doc.addPage();drawHeader(doc,'ONLINE QUOTATION',`Quote No: ${qn}`);y=126;}doc.setFillColor(i%2?255:245,i%2?255:248,i%2?255:253);doc.rect(40,y,515,38,'F');pdfText(doc,String(i+1),55,y+23);pdfText(doc,p.name,82,y+16);doc.setTextColor(95,110,130);pdfText(doc,p.category,82,y+30);doc.setTextColor(25,34,54);pdfText(doc,String(p.qty),350,y+23);pdfText(doc,p.condition,390,y+23);pdfText(doc,money(p.price*p.qty),485,y+23);y+=38;});
    doc.setFillColor(5,10,28);doc.roundedRect(330,y+14,225,44,10,10,'F');doc.setTextColor(185,210,235);doc.setFont('helvetica','bold');doc.setFontSize(10);pdfText(doc,'TOTAL ESTIMATE',348,y+40);doc.setTextColor(255,255,255);doc.setFontSize(15);pdfText(doc,money(total),452,y+40);y+=82;
    doc.setFillColor(235,248,255);doc.roundedRect(40,y,515,82,12,12,'F');doc.setDrawColor(205,225,240);doc.roundedRect(40,y,515,82,12,12,'S');doc.setTextColor(5,10,28);doc.setFont('helvetica','bold');doc.setFontSize(11);pdfText(doc,'BANK DETAILS',58,y+22);doc.setFont('helvetica','normal');doc.setFontSize(10);pdfText(doc,`${CONFIG.bank?.name||''} | Account No: ${CONFIG.bank?.accountNumber||''}`,58,y+44);pdfText(doc,`Account Name: ${CONFIG.bank?.accountName||''}`,58,y+62);pdfText(doc,`Branch: ${CONFIG.bank?.branch||''}`,355,y+62);docFooter(doc);doc.save(`sandaruwan-computer-quotation-${qn}.pdf`);
  }

  async function cartItems(){
    const products=await loadProducts();return getCart().map(it=>{
      if(it.custom)return {product:{id:it.id,name:it.custom.name,category:it.custom.category||'QUOTE',condition:it.custom.condition||'',price:it.custom.price,image:it.custom.image||'assets/img/logo.jpg'},qty:Number(it.qty||1),custom:it.custom};
      return {product:byId(products,it.id),qty:Number(it.qty||1)};
    }).filter(x=>x.product);
  }
  async function initCartPage(){const view=$('#cartView');if(!view)return;const items=await cartItems();if(!items.length){view.innerHTML='<div class="empty-state"><h2>Your cart is empty</h2><p>Add products or create quotation first.</p></div>';return}const total=items.reduce((s,x)=>s+x.product.price*x.qty,0);view.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>${items.map(({product:p,qty})=>`<tr><td>${esc(p.name)}<br><span class="muted">${esc(p.category)}</span></td><td>${money(p.price)}</td><td><input class="input qty-input" type="number" min="1" value="${qty}" data-cart-qty="${esc(p.id)}"></td><td>${money(p.price*qty)}</td><td><button class="btn btn-danger btn-small" data-remove-cart="${esc(p.id)}">Remove</button></td></tr>`).join('')}</tbody></table></div><div class="total-row"><span>Cart Total</span><strong>${money(total)}</strong></div><div class="cart-actions"><button class="btn btn-danger" id="clearCartBtn">Clear Cart</button><a class="btn btn-primary" href="checkout.html">Checkout</a></div>`;$('#clearCartBtn')?.addEventListener('click',()=>{saveCart([]);initCartPage()})}
  async function renderCheckoutSummary(){const wrap=$('#checkoutSummary');if(!wrap)return;const items=await cartItems();if(!items.length){wrap.innerHTML='<div class="empty-state">Cart is empty.</div>';return}const total=items.reduce((s,x)=>s+x.product.price*x.qty,0);wrap.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>${items.map(({product:p,qty})=>`<tr><td>${esc(p.name)}</td><td>${qty}</td><td>${money(p.price*qty)}</td></tr>`).join('')}</tbody></table></div><div class="total-row"><span>Total</span><strong>${money(total)}</strong></div>`}
  async function initCheckoutPage(){await renderCheckoutSummary();const bank=$('#bankDetails');if(bank){const b=CONFIG.bank||{};bank.innerHTML=`<div class="bank-line"><span>Bank</span><b>${esc(b.name)}</b></div><div class="bank-line"><span>Account Number</span><b>${esc(b.accountNumber)}</b></div><div class="bank-line"><span>Account Name</span><b>${esc(b.accountName)}</b></div><div class="bank-line"><span>Branch</span><b>${esc(b.branch)}</b></div>`}}

  function initHome(){
    function carousel(sel,dots,ms){const slides=$all(sel),dw=$(dots);if(!slides.length||!dw)return;dw.innerHTML=slides.map((_,i)=>`<span class="slide-dot ${i===0?'active':''}"></span>`).join('');const ds=$all('.slide-dot',dw);let i=0;setInterval(()=>{slides[i].classList.remove('active');ds[i]?.classList.remove('active');i=(i+1)%slides.length;slides[i].classList.add('active');ds[i]?.classList.add('active')},ms)};
    carousel('.wide-banner-slide','#wideBannerDots',4300);carousel('.prebuild-slide','#prebuildDots',3600);
  }
  function initPrebuildPage(){const grid=$('#prebuildGrid');if(grid&&!grid.children.length)grid.innerHTML='<div class="empty-state"><h2>Pre Build PCs</h2><p>Add prebuild products from Google Sheet using category OTHER or create static packages later.</p></div>'}

  document.addEventListener('DOMContentLoaded',()=>{bindCommon();const page=document.body.dataset.page;if(page==='home')initHome();if(page==='products')initProductsPage();if(page==='quotation')initQuotationPage();if(page==='cart')initCartPage();if(page==='checkout')initCheckoutPage();if(page==='prebuild')initPrebuildPage();});
})();
