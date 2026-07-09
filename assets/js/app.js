(function(){
  'use strict';

  const CONFIG = window.SC_CONFIG || {};
  const CART_KEY = 'sandaruwan_computer_cart_v4';
  const ADMIN_PRODUCTS_KEY = 'sandaruwan_computer_admin_products_v1';

  const CATEGORIES = [
    'CASING',
    'MOTHERBOARD',
    'PROCESSOR',
    'CPU COOLER',
    'RAM',
    'HARD DISK',
    'SSD',
    'VGA CARD',
    'POWER SUPPLY',
    'MONITOR',
    'KEYBOARD',
    'MOUSE',
    'MOUSE PAD',
    'SPEAKER',
    'HEADSET',
    'RGB CASING FAN',
    'CABLES',
    'OTHER'
  ];

  const CATEGORY_ALIASES = {
    PROSSR:'PROCESSOR',PROSSOR:'PROCESSOR',PROCESSER:'PROCESSOR',PROCESSOR:'PROCESSOR',CPU:'PROCESSOR',
    MOTHERBORD:'MOTHERBOARD',MOTHERBOARD:'MOTHERBOARD',BOARD:'MOTHERBOARD',BORD:'MOTHERBOARD',MB:'MOTHERBOARD',
    CASIN:'CASING',CASING:'CASING',CASE:'CASING',CPUCOOLER:'CPU COOLER',COOLER:'CPU COOLER','CPU COOLER':'CPU COOLER',
    HARD:'HARD DISK',HDD:'HARD DISK',HARDDISK:'HARD DISK','HARD DISK':'HARD DISK',
    POWERSUPPLY:'POWER SUPPLY',PSU:'POWER SUPPLY','POWER SUPPLY':'POWER SUPPLY',
    GRAPHICSCARD:'VGA CARD','GRAPHICS CARD':'VGA CARD',VGA:'VGA CARD','VGA CARD':'VGA CARD',GPU:'VGA CARD',
    CABLE:'CABLES',CABLES:'CABLES',KEYBORD:'KEYBOARD',KEYBOARD:'KEYBOARD',
    MOUSEPAD:'MOUSE PAD','MOUSE PAD':'MOUSE PAD',
    SPEKER:'SPEAKER',SPEAKER:'SPEAKER',HEDSET:'HEADSET',HEADSET:'HEADSET',
    CASINGFAN:'RGB CASING FAN','RGB CASING FAN':'RGB CASING FAN',FAN:'RGB CASING FAN',
    RAM:'RAM',SSD:'SSD',MONITOR:'MONITOR',MOUSE:'MOUSE',OTHER:'OTHER'
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

  const DEFAULT_PRODUCTS = [
    {
      "id": "CPU-004-I5",
      "name": "Intel Core i5 4th Gen Processor",
      "category": "PROCESSOR",
      "condition": "USED",
      "price": 14500,
      "generation": 4,
      "memory": "DDR3",
      "chipset": "",
      "socket": "LGA1150",
      "stock": "5",
      "image": "assets/img/logo.jpg",
      "description": "Budget office and gaming starter processor",
      "warrantyMonths": "1"
    },
    {
      "id": "CPU-004-I7",
      "name": "Intel Core i7 4th Gen Processor",
      "category": "PROCESSOR",
      "condition": "USED",
      "price": 23500,
      "generation": 4,
      "memory": "DDR3",
      "chipset": "",
      "socket": "LGA1150",
      "stock": "3",
      "image": "assets/img/logo.jpg",
      "description": "High performance 4th gen processor",
      "warrantyMonths": "1"
    },
    {
      "id": "CPU-006-I5",
      "name": "Intel Core i5 6th Gen Processor",
      "category": "PROCESSOR",
      "condition": "USED",
      "price": 22500,
      "generation": 6,
      "memory": "DDR4",
      "chipset": "",
      "socket": "LGA1151",
      "stock": "4",
      "image": "assets/img/logo.jpg",
      "description": "DDR4 supported 6th gen processor",
      "warrantyMonths": "1"
    },
    {
      "id": "CPU-008-I5",
      "name": "Intel Core i5 8th Gen Processor",
      "category": "PROCESSOR",
      "condition": "USED",
      "price": 32500,
      "generation": 8,
      "memory": "DDR4",
      "chipset": "",
      "socket": "LGA1151",
      "stock": "2",
      "image": "assets/img/logo.jpg",
      "description": "8th gen performance processor",
      "warrantyMonths": "1"
    },
    {
      "id": "CPU-010-I3",
      "name": "Intel Core i3 10th Gen Processor",
      "category": "PROCESSOR",
      "condition": "NEW",
      "price": 35500,
      "generation": 10,
      "memory": "DDR4",
      "chipset": "",
      "socket": "LGA1200",
      "stock": "2",
      "image": "assets/img/logo.jpg",
      "description": "Modern 10th gen desktop processor",
      "warrantyMonths": "6"
    },
    {
      "id": "MB-H61",
      "name": "H61 Motherboard",
      "category": "MOTHERBOARD",
      "condition": "USED",
      "price": 11500,
      "generation": 3,
      "memory": "DDR3",
      "chipset": "H61",
      "socket": "LGA1155",
      "stock": "6",
      "image": "assets/img/logo.jpg",
      "description": "2nd/3rd gen DDR3 motherboard",
      "m2SataSupport": "NO",
      "nvmeSupport": "NO",
      "m2Slots": "0",
      "warrantyMonths": "1"
    },
    {
      "id": "MB-H81",
      "name": "H81 Motherboard",
      "category": "MOTHERBOARD",
      "condition": "USED",
      "price": 14500,
      "generation": 4,
      "memory": "DDR3",
      "chipset": "H81",
      "socket": "LGA1150",
      "stock": "5",
      "image": "assets/img/logo.jpg",
      "description": "4th gen DDR3 motherboard",
      "m2SataSupport": "NO",
      "nvmeSupport": "NO",
      "m2Slots": "0",
      "warrantyMonths": "1"
    },
    {
      "id": "MB-B85",
      "name": "B85 Motherboard",
      "category": "MOTHERBOARD",
      "condition": "USED",
      "price": 17500,
      "generation": 4,
      "memory": "DDR3",
      "chipset": "B85",
      "socket": "LGA1150",
      "stock": "3",
      "image": "assets/img/logo.jpg",
      "description": "4th gen business motherboard",
      "m2SataSupport": "NO",
      "nvmeSupport": "NO",
      "m2Slots": "0",
      "warrantyMonths": "1"
    },
    {
      "id": "MB-H110",
      "name": "H110 DDR4 Motherboard",
      "category": "MOTHERBOARD",
      "condition": "USED",
      "price": 19500,
      "generation": 6,
      "memory": "DDR4",
      "chipset": "H110",
      "socket": "LGA1151",
      "stock": "4",
      "image": "assets/img/logo.jpg",
      "description": "6th/7th gen DDR4 motherboard",
      "m2SataSupport": "MODEL DEPENDENT",
      "nvmeSupport": "MODEL DEPENDENT",
      "m2Slots": "0",
      "warrantyMonths": "1"
    },
    {
      "id": "MB-B360",
      "name": "B360 Motherboard",
      "category": "MOTHERBOARD",
      "condition": "USED",
      "price": 28500,
      "generation": 8,
      "memory": "DDR4",
      "chipset": "B360",
      "socket": "LGA1151",
      "stock": "2",
      "image": "assets/img/logo.jpg",
      "description": "8th/9th gen DDR4 motherboard",
      "m2SataSupport": "YES",
      "nvmeSupport": "YES",
      "m2Slots": "1",
      "warrantyMonths": "1"
    },
    {
      "id": "MB-H410",
      "name": "H410 Motherboard",
      "category": "MOTHERBOARD",
      "condition": "NEW",
      "price": 34500,
      "generation": 10,
      "memory": "DDR4",
      "chipset": "H410",
      "socket": "LGA1200",
      "stock": "2",
      "image": "assets/img/logo.jpg",
      "description": "10th gen DDR4 motherboard",
      "m2SataSupport": "YES",
      "nvmeSupport": "YES",
      "m2Slots": "1",
      "warrantyMonths": "6"
    },
    {
      "id": "RAM-DDR2-2GB",
      "name": "2GB DDR2 RAM",
      "category": "RAM",
      "condition": "USED",
      "price": 1500,
      "generation": "",
      "memory": "DDR2",
      "chipset": "",
      "socket": "",
      "stock": "10",
      "image": "assets/img/logo.jpg",
      "description": "Desktop DDR2 memory",
      "warrantyMonths": "1"
    },
    {
      "id": "RAM-DDR3-4GB",
      "name": "4GB DDR3 RAM",
      "category": "RAM",
      "condition": "USED",
      "price": 3500,
      "generation": "",
      "memory": "DDR3",
      "chipset": "",
      "socket": "",
      "stock": "12",
      "image": "assets/img/logo.jpg",
      "description": "Desktop DDR3 memory",
      "warrantyMonths": "1"
    },
    {
      "id": "RAM-DDR3-8GB",
      "name": "8GB DDR3 RAM",
      "category": "RAM",
      "condition": "USED",
      "price": 6500,
      "generation": "",
      "memory": "DDR3",
      "chipset": "",
      "socket": "",
      "stock": "7",
      "image": "assets/img/logo.jpg",
      "description": "Desktop DDR3 memory",
      "warrantyMonths": "1"
    },
    {
      "id": "RAM-DDR4-8GB",
      "name": "8GB DDR4 RAM",
      "category": "RAM",
      "condition": "USED",
      "price": 7500,
      "generation": "",
      "memory": "DDR4",
      "chipset": "",
      "socket": "",
      "stock": "8",
      "image": "assets/img/logo.jpg",
      "description": "Desktop DDR4 memory",
      "warrantyMonths": "1"
    },
    {
      "id": "RAM-DDR5-16GB",
      "name": "16GB DDR5 RAM",
      "category": "RAM",
      "condition": "NEW",
      "price": 18500,
      "generation": "",
      "memory": "DDR5",
      "chipset": "",
      "socket": "",
      "stock": "2",
      "image": "assets/img/logo.jpg",
      "description": "Desktop DDR5 memory",
      "warrantyMonths": "6"
    },
    {
      "id": "COOLER-STOCK",
      "name": "Intel Stock CPU Cooler",
      "category": "CPU COOLER",
      "condition": "USED",
      "price": 1500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "9",
      "image": "assets/img/logo.jpg",
      "description": "Standard CPU cooler",
      "warrantyMonths": "1"
    },
    {
      "id": "CASING-RGB",
      "name": "RGB Gaming Casing",
      "category": "CASING",
      "condition": "NEW",
      "price": 12500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "3",
      "image": "assets/img/logo.jpg",
      "description": "Gaming casing with airflow",
      "warrantyMonths": "6"
    },
    {
      "id": "SSD-128",
      "name": "128GB SSD",
      "category": "SSD",
      "condition": "NEW",
      "price": 4500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "8",
      "image": "assets/img/logo.jpg",
      "description": "Fast boot drive",
      "storageType": "SATA SSD",
      "warrantyMonths": "6"
    },
    {
      "id": "SSD-256",
      "name": "256GB SSD",
      "category": "SSD",
      "condition": "NEW",
      "price": 6500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "6",
      "image": "assets/img/logo.jpg",
      "description": "SATA SSD",
      "storageType": "SATA SSD",
      "warrantyMonths": "6"
    },
    {
      "id": "HDD-500",
      "name": "500GB Hard Disk",
      "category": "HARD DISK",
      "condition": "USED",
      "price": 5500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "5",
      "image": "assets/img/logo.jpg",
      "description": "Desktop hard disk",
      "warrantyMonths": "1"
    },
    {
      "id": "PSU-500",
      "name": "500W Power Supply",
      "category": "POWER SUPPLY",
      "condition": "USED",
      "price": 6500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "4",
      "image": "assets/img/logo.jpg",
      "description": "Desktop power supply",
      "warrantyMonths": "1"
    },
    {
      "id": "CABLE-SATA",
      "name": "SATA Cable",
      "category": "CABLES",
      "condition": "NEW",
      "price": 450,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "25",
      "image": "assets/img/logo.jpg",
      "description": "SATA data cable",
      "warrantyMonths": "6"
    },
    {
      "id": "MON-19",
      "name": "19 inch LED Monitor",
      "category": "MONITOR",
      "condition": "USED",
      "price": 13500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "4",
      "image": "assets/img/logo.jpg",
      "description": "LED monitor",
      "warrantyMonths": "1"
    },
    {
      "id": "KEY-USB",
      "name": "USB Keyboard",
      "category": "KEYBOARD",
      "condition": "NEW",
      "price": 1800,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "12",
      "image": "assets/img/logo.jpg",
      "description": "Standard keyboard",
      "warrantyMonths": "6"
    },
    {
      "id": "MOUSE-USB",
      "name": "USB Mouse",
      "category": "MOUSE",
      "condition": "NEW",
      "price": 900,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "15",
      "image": "assets/img/logo.jpg",
      "description": "Optical mouse",
      "warrantyMonths": "6"
    },
    {
      "id": "SPEAKER-2CH",
      "name": "2.0 Speaker Set",
      "category": "SPEAKER",
      "condition": "NEW",
      "price": 3500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "7",
      "image": "assets/img/logo.jpg",
      "description": "Desktop speakers",
      "warrantyMonths": "6"
    },
    {
      "id": "HEADSET-GM",
      "name": "Gaming Headset",
      "category": "HEADSET",
      "condition": "NEW",
      "price": 4500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "6",
      "image": "assets/img/logo.jpg",
      "description": "Gaming headset with mic",
      "warrantyMonths": "6"
    },
    {
      "id": "SSD-M2-256",
      "name": "256GB M.2 SATA SSD",
      "category": "SSD",
      "condition": "NEW",
      "price": 7500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "4",
      "image": "assets/img/logo.jpg",
      "description": "M.2 SATA SSD. Works only on motherboards with M.2 SATA support.",
      "storageType": "M.2 SSD",
      "warrantyMonths": "6"
    },
    {
      "id": "SSD-NVME-256",
      "name": "256GB NVMe M.2 SSD",
      "category": "SSD",
      "condition": "NEW",
      "price": 9500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "5",
      "image": "assets/img/logo.jpg",
      "description": "NVMe M.2 SSD. Works only on motherboards with NVMe M.2 support.",
      "storageType": "NVME SSD",
      "warrantyMonths": "6"
    },
    {
      "id": "SSD-NVME-512",
      "name": "512GB NVMe M.2 SSD",
      "category": "SSD",
      "condition": "NEW",
      "price": 14500,
      "generation": "",
      "memory": "",
      "chipset": "",
      "socket": "",
      "stock": "3",
      "image": "assets/img/logo.jpg",
      "description": "Fast NVMe storage for compatible DDR4/modern builds.",
      "storageType": "NVME SSD",
      "warrantyMonths": "6"
    }
  ];
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

  function fieldKey(k){return upper(k).replace(/[^A-Z0-9]/g,'')}
  function getField(obj,...keys){
    for(const k of keys){if(obj && obj[k]!==undefined && clean(obj[k])!=='')return obj[k]}
    const wanted=keys.map(fieldKey);
    for(const [k,v] of Object.entries(obj||{})){
      if(wanted.includes(fieldKey(k)) && clean(v)!=='')return v;
    }
    return '';
  }
  function displayCondition(v){const c=upper(v||'USED');return (c==='NEW'||c==='BRANDNEW'||c==='BRAND NEW')?'BRAND NEW':'USED'}
  function isNewProduct(p){return fieldKey(p.condition)==='BRANDNEW'||upper(p.condition)==='NEW'}
  function storageSupportFromValue(v){
    const x=upper(v).replace(/\s+/g,' ');
    const out={sata:true,m2:false,nvme:false,label:'SATA ONLY'};
    if(x.includes('M.2')||x.includes('M2')){out.m2=true;out.label='SATA AND M.2'}
    if(x.includes('NVME')){out.m2=true;out.nvme=true;out.label='SATA - M.2 - NVME'}
    return out;
  }
  function ramSlotOptionsFromProduct(rawObj){
    const values=[
      getField(rawObj,'RAM SLOT OPTION 1','ramSlotOption1','ram_slot_option_1'),
      getField(rawObj,'RAM SLOT OPTION 2','ramSlotOption2','ram_slot_option_2'),
      getField(rawObj,'RAM SLOT','ramSlot','ram_slot','ramSlots','ram_slots')
    ].filter(Boolean).join(' | ');
    const x=upper(values);
    const out=[];
    if(/\b2\b/.test(x)||x.includes('2 RAM'))out.push('2 RAM SLOT');
    if(/\b4\b/.test(x)||x.includes('4 RAM'))out.push('4 RAM SLOT');
    return [...new Set(out)];
  }
  function normalizeProduct(p,i=0){
    const rawCategory=getField(p,'CATEGORY','category');
    const category=categoryName(rawCategory);
    const mbGen1=getField(p,'MB GEN OPTION 1','mbGenOption1','mb_gen_option_1','generation','gen');
    const mbGen2=getField(p,'MB GEN OPTION 2','mbGenOption2','mb_gen_option_2');
    const processorGen=getField(p,'PROCESSOR GEN','processorGen','processor_gen');
    const gens=category==='PROCESSOR'?parseGenerations(processorGen):parseGenerations([mbGen1,mbGen2,getField(p,'compatibleGenerations','compatible_generations','supportedGens','supported_gens')].filter(Boolean).join(' | '));
    const g=gens[0]||'';
    const ramSupport=upper(getField(p,'RAM SUPPORT','ramSupport','ram_support','memory','ram','ram_type'));
    const storageSupportRaw=getField(p,'SSD SUPPORT','storageSupport','ssdSupport','ssd_support');
    const support=storageSupportFromValue(storageSupportRaw);
    const condition=displayCondition(getField(p,'CONDITION','condition'));
    const image=clean(getField(p,'IMAGE PATH','imagePath','image_path','IMAGE','image'))||'assets/img/logo.jpg';
    const storageT=storageType({
      storageType:getField(p,'SSD TYPE','storageType','ssdType','ssd_type','storage_type','interface'),
      category
    });
    return {
      id:clean(getField(p,'PRODUCT ID','id','productId','product_id'))||`ITEM-${i+1}`,
      name:clean(getField(p,'PRODUCT NAME','name','productName','product_name'))||'Product',
      category,
      condition,
      price:toNumber(getField(p,'PRICE','price')),
      brand:clean(getField(p,'BRAND','brand')),
      model:clean(getField(p,'MODEL / SERIES','MODEL','model','series','modelSeries','model_series')),
      generation:g,
      generations:gens,
      compatibleGenerations:gens,
      generationLabel:gens.length?gens.map(genLabel).join(' / '):'',
      processorGen:genLabel(processorGen)||clean(processorGen),
      memory:ramSupport,
      ramSupport,
      ramSlot:clean(getField(p,'RAM SLOT','ramSlot','ram_slot')),
      ramSlotOptions:ramSlotOptionsFromProduct(p),
      chipset:upper(getField(p,'CHIPSET','chipset')),
      socket:upper(getField(p,'SOCKET / GEN','socketGen','socket_gen','socket')),
      stock:clean(getField(p,'STOCK','stock')),
      image,
      description:clean(getField(p,'DESCRIPTION','description')),
      warranty:clean(getField(p,'WARRANTY','warranty','warranty_period','warrantyPeriod')),
      warrantyMonths:clean(getField(p,'WARRANTY MONTHS','warrantyMonths','warranty_months','warrantyMonth')),
      storageSupport:storageSupportRaw?support.label:'',
      storageType:storageT,
      sataSupport:support.sata,
      sataOnlySupport:support.sata&&!support.m2&&!support.nvme,
      m2SataSupport:support.m2||boolish(getField(p,'m2SataSupport','m2_sata_support','m2Sata','m2_sata')),
      nvmeSupport:support.nvme||boolish(getField(p,'nvmeSupport','nvme_support','nvme')),
      m2Slots:clean(getField(p,'M.2 SLOTS','m2Slots','m2_slots')),
      monitorSize:clean(getField(p,'MONITOR SIZE','monitorSize','monitor_size')),
      panelType:upper(getField(p,'PANEL TYPE','panelType','panel_type')),
      capacity:clean(getField(p,'CAPACITY / MEMORY','capacity','memoryCapacity','memory_capacity','vgaMemory','vga_memory')),
      speed:clean(getField(p,'SPEED','speed')),
      watt:clean(getField(p,'WATT','watt','watts')),
      rgb:upper(getField(p,'RGB','rgb')),
      socketGen:clean(getField(p,'SOCKET / GEN','socketGen','socket_gen'))
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
      const localRows=JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)||'[]');
      if(Array.isArray(localRows)&&localRows.length){
        const localProducts=localRows.map(normalizeProduct).filter(p=>p.name&&p.category);
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
  function addToCart(id,qty=1){const cart=getCart();const found=cart.find(x=>x.id===id);if(found)found.qty+=qty;else cart.push({id,qty});saveCart(cart);toast('Added to cart')}
  function addManyToCart(ids){const cart=getCart();ids.forEach(id=>{const found=cart.find(x=>x.id===id);if(found)found.qty+=1;else cart.push({id,qty:1})});saveCart(cart);toast('Quotation added to cart')}
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
    const tags=[p.condition,p.memory,storageLabel(p),p.generationLabel,p.monitorSize,p.panelType,p.capacity].filter(Boolean).slice(0,4);
    return `<article class="card product-card" data-product-id="${esc(p.id)}" tabindex="0" aria-label="View ${esc(p.name)} details">
      <div class="product-img-wrap"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='assets/img/logo.jpg'">
        <div class="tag-row">${tags.map(t=>`<span class="tag ${fieldKey(t)==='BRANDNEW'?'new':fieldKey(t)==='USED'?'used':''}">${esc(t)}</span>`).join('')}</div>
      </div>
      <div class="product-body"><h3>${esc(p.name)}</h3>
        <div class="meta"><span>${esc(p.category)}</span>${p.brand?`<span>${esc(p.brand)}</span>`:''}${p.model?`<span>${esc(p.model)}</span>`:''}${p.monitorSize?`<span>${esc(p.monitorSize)}</span>`:''}</div>
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
        const qty=Math.max(1,Number($('#modalProductQty')?.value||1));
        addToCart(add.getAttribute('data-modal-add-to-cart'),qty);
        closeProductModal();
      }
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeProductModal()});
  }

  function closeProductModal(){
    const modal=$('#productModal');if(!modal)return;
    modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');
  }

  function detailRow(label,value){return value?`<div><span>${esc(label)}</span><b>${esc(value)}</b></div>`:''}
  function openProductModal(id){
    ensureProductModal();
    const p=(productsCache||[]).find(x=>x.id===id);if(!p)return;
    const content=$('#productModalContent');if(!content)return;
    const ramSlotHtml=p.category==='MOTHERBOARD'&&p.ramSlotOptions?.length?`<div class="modal-option-box"><span>RAM Slot Option</span><div class="modal-chip-row">${p.ramSlotOptions.map((s,i)=>`<label class="modal-chip"><input type="radio" name="modalRamSlot" value="${esc(s)}" ${i===0?'checked':''}> ${esc(s)}</label>`).join('')}</div><small class="muted">4 RAM SLOT option add කරන විට Rs. 500 extra price එක website bill එකට add වෙන setup එක quotation page එකේ වැඩ කරයි.</small></div>`:'';
    content.innerHTML=`<div class="product-modal-grid">
      <div class="product-modal-image"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='assets/img/logo.jpg'"></div>
      <div class="product-modal-info">
        <div class="modal-tag-row"><span class="tag ${isNewProduct(p)?'new':'used'}">${esc(p.condition)}</span>${p.category?`<span class="tag">${esc(p.category)}</span>`:''}${p.memory?`<span class="tag">${esc(p.memory)}</span>`:''}${storageLabel(p)?`<span class="tag">${esc(storageLabel(p))}</span>`:''}${p.monitorSize?`<span class="tag">${esc(p.monitorSize)}</span>`:''}</div>
        <h2 id="productModalTitle">${esc(p.name)}</h2>
        <div class="product-modal-price">${money(p.price)}</div>
        <p class="product-modal-description">${esc(p.description||'Please contact Sandaruwan Computer for more details, availability and final confirmation before payment.')}</p>
        ${ramSlotHtml}
        <div class="product-detail-list">
          ${detailRow('Warranty Period',warrantyText(p))}
          ${detailRow('Availability',p.stock||'Contact for stock')}
          ${detailRow('Brand',p.brand)}
          ${detailRow('Model / Series',p.model)}
          ${detailRow('Processor / Board Gen',p.generationLabel||p.processorGen)}
          ${detailRow('RAM Support',p.memory)}
          ${detailRow('RAM Slot',p.ramSlotOptions?.join(' / ')||p.ramSlot)}
          ${detailRow('SSD Support',p.storageSupport)}
          ${detailRow('SSD Type',storageLabel(p))}
          ${detailRow('Monitor Size',p.monitorSize)}
          ${detailRow('Panel Type',p.panelType)}
          ${detailRow('Capacity / Memory',p.capacity)}
          ${detailRow('Speed',p.speed)}
          ${detailRow('Watt',p.watt)}
          ${detailRow('RGB',p.rgb)}
          ${detailRow('Socket / Gen',p.socketGen||p.socket)}
        </div>
        <div class="product-modal-order">
          <label for="modalProductQty">Quantity</label>
          <div class="modal-qty-row"><input class="input" id="modalProductQty" type="number" min="1" value="1"><button class="btn btn-primary" data-modal-add-to-cart="${esc(p.id)}">Add to Cart</button></div>
        </div>
      </div>
    </div>`;
    const modal=$('#productModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
  }

  function uniqueValues(products,key){
    return [...new Set(products.map(p=>clean(typeof key==='function'?key(p):p[key])).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));
  }
  function setSelectOptions(sel,placeholder,values){
    if(!sel)return;
    const current=sel.value;
    sel.innerHTML=`<option value="">${esc(placeholder)}</option>`+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    if(values.includes(current))sel.value=current;
  }
  const PRODUCT_FILTERS_BY_CATEGORY={
    'CASING':['brand','rgb'],
    'MOTHERBOARD':['brand','generation','ramSupport','storage'],
    'PROCESSOR':['brand','model','processorGen'],
    'CPU COOLER':['brand','socketGen'],
    'RAM':['brand','capacity','speed','ramSupport'],
    'HARD DISK':['brand','capacity'],
    'SSD':['brand','capacity','ssdType'],
    'VGA CARD':['brand','capacity','model'],
    'POWER SUPPLY':['brand','watt'],
    'MONITOR':['brand','monitorSize','panelType'],
    'KEYBOARD':['brand','rgb'],
    'MOUSE':['brand','rgb'],
    'MOUSE PAD':['brand','rgb'],
    'SPEAKER':['brand','rgb'],
    'HEADSET':['brand','rgb'],
    'RGB CASING FAN':['brand','rgb'],
    'CABLES':['brand','model'],
    'OTHER':['brand','model']
  };
  async function initProductsPage(){
    const products=await loadProducts();const grid=$('#productsGrid');if(!grid)return;
    ensureProductModal();
    let selectedCategory='';
    const categoryList=$('#categoryList');
    function categoryCount(cat){return products.filter(p=>p.category===cat).length}
    function renderCategoryList(){
      if(!categoryList)return;
      const buttons=[{cat:'',label:'All Products',count:products.length},...CATEGORIES.map(cat=>({cat,label:cat,count:categoryCount(cat)}))];
      categoryList.innerHTML=buttons.map(x=>`<button type="button" class="category-link ${selectedCategory===x.cat?'active':''}" data-product-category="${esc(x.cat)}">${esc(x.label)} <span>${x.count}</span></button>`).join('');
    }
    categoryList?.addEventListener('click',e=>{
      const btn=e.target.closest('[data-product-category]');if(!btn)return;
      selectedCategory=btn.getAttribute('data-product-category')||'';
      resetCategorySpecificFilters();render();
    });
    grid.addEventListener('click',e=>{
      const view=e.target.closest('[data-view-product]');if(view){e.preventDefault();openProductModal(view.getAttribute('data-view-product'));return;}
      if(e.target.closest('button,a,input,select,textarea'))return;
      const card=e.target.closest('[data-product-id]');if(card)openProductModal(card.getAttribute('data-product-id'));
    });
    grid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-product-id]')){e.preventDefault();openProductModal(e.target.closest('[data-product-id]').getAttribute('data-product-id'))}});

    const filterEls={
      search:$('#productSearch'),condition:$('#conditionFilter'),brand:$('#brandFilter'),model:$('#modelFilter'),processorGen:$('#processorGenFilter'),
      generation:$('#generationFilter'),ramSupport:$('#ramSupportFilter'),storage:$('#storageFilter'),ssdType:$('#ssdTypeFilter'),monitorSize:$('#monitorSizeFilter'),panelType:$('#panelTypeFilter'),capacity:$('#capacityFilter'),speed:$('#speedFilter'),watt:$('#wattFilter'),rgb:$('#rgbFilter'),socketGen:$('#socketGenFilter')
    };
    function resetCategorySpecificFilters(){
      ['brand','model','processorGen','generation','ramSupport','storage','ssdType','monitorSize','panelType','capacity','speed','watt','rgb','socketGen'].forEach(k=>{if(filterEls[k])filterEls[k].value=''})
    }
    function visibleFilterKeys(){
      const keys=new Set(['condition','brand']);
      const catKeys=PRODUCT_FILTERS_BY_CATEGORY[selectedCategory]||['brand','model','processorGen','generation','ramSupport','storage','ssdType','monitorSize','panelType','capacity','speed','watt','rgb','socketGen'];
      catKeys.forEach(k=>keys.add(k));
      return keys;
    }
    function refreshFilterOptions(baseProducts){
      setSelectOptions(filterEls.condition,'Used / Brand New',['USED','BRAND NEW']);
      setSelectOptions(filterEls.brand,'Brand',uniqueValues(baseProducts,'brand'));
      setSelectOptions(filterEls.model,'Model / Type',uniqueValues(baseProducts,'model'));
      setSelectOptions(filterEls.processorGen,'Processor Gen',uniqueValues(baseProducts,p=>p.processorGen||p.generationLabel));
      setSelectOptions(filterEls.generation,'Board Gen',uniqueValues(baseProducts,p=>p.generationLabel));
      setSelectOptions(filterEls.ramSupport,'RAM Support',uniqueValues(baseProducts,'memory'));
      setSelectOptions(filterEls.storage,'SSD Support',uniqueValues(baseProducts,'storageSupport'));
      setSelectOptions(filterEls.ssdType,'SSD Type',uniqueValues(baseProducts,p=>storageLabel(p)));
      setSelectOptions(filterEls.monitorSize,'Monitor Size',uniqueValues(baseProducts,'monitorSize'));
      setSelectOptions(filterEls.panelType,'Panel Type',uniqueValues(baseProducts,'panelType'));
      setSelectOptions(filterEls.capacity,'Capacity / Memory',uniqueValues(baseProducts,'capacity'));
      setSelectOptions(filterEls.speed,'Speed',uniqueValues(baseProducts,'speed'));
      setSelectOptions(filterEls.watt,'Watt',uniqueValues(baseProducts,'watt'));
      setSelectOptions(filterEls.rgb,'RGB / Non RGB',uniqueValues(baseProducts,'rgb'));
      setSelectOptions(filterEls.socketGen,'Socket / Gen',uniqueValues(baseProducts,'socketGen'));
    }
    function applyVisibility(){
      const visible=visibleFilterKeys();
      const topMap={brand:'brandFilter',model:'modelFilter',processorGen:'processorGenFilter'};
      Object.entries(topMap).forEach(([k,id])=>{const el=$('#'+id);if(el)el.style.display=visible.has(k)?'':'none'});
      $all('[data-filter-box]').forEach(box=>{box.style.display=visible.has(box.getAttribute('data-filter-box'))?'':'none'});
    }
    Object.values(filterEls).filter(Boolean).forEach(el=>['input','change'].forEach(ev=>el.addEventListener(ev,render)));
    function render(){
      const base=selectedCategory?products.filter(p=>p.category===selectedCategory):products;
      applyVisibility();
      refreshFilterOptions(base);
      const q=upper(filterEls.search?.value);const cond=upper(filterEls.condition?.value);const brand=upper(filterEls.brand?.value);const model=upper(filterEls.model?.value);const procGen=upper(filterEls.processorGen?.value);
      const boardGen=upper(filterEls.generation?.value);const ram=upper(filterEls.ramSupport?.value);const storage=upper(filterEls.storage?.value);const ssd=upper(filterEls.ssdType?.value);const msize=upper(filterEls.monitorSize?.value);const panel=upper(filterEls.panelType?.value);const cap=upper(filterEls.capacity?.value);const speed=upper(filterEls.speed?.value);const watt=upper(filterEls.watt?.value);const rgb=upper(filterEls.rgb?.value);const socket=upper(filterEls.socketGen?.value);
      const filtered=base.filter(p=>{
        const hay=upper([p.name,p.category,p.condition,p.brand,p.model,p.memory,p.generationLabel,p.processorGen,p.chipset,p.socket,p.description,storageLabel(p),p.monitorSize,p.panelType,p.capacity,p.speed,p.watt,p.rgb,p.socketGen].join(' '));
        return (!q||hay.includes(q))&&(!cond||upper(p.condition)===cond)&&(!brand||upper(p.brand)===brand)&&(!model||upper(p.model)===model)&&(!procGen||upper(p.processorGen||p.generationLabel)===procGen)&&(!boardGen||upper(p.generationLabel)===boardGen||upper(p.generationLabel).includes(boardGen))&&(!ram||upper(p.memory)===ram)&&(!storage||upper(p.storageSupport)===storage)&&(!ssd||upper(storageLabel(p))===ssd)&&(!msize||upper(p.monitorSize)===msize)&&(!panel||upper(p.panelType)===panel)&&(!cap||upper(p.capacity)===cap)&&(!speed||upper(p.speed)===speed)&&(!watt||upper(p.watt)===watt)&&(!rgb||upper(p.rgb)===rgb)&&(!socket||upper(p.socketGen)===socket);
      });
      $('#productCount')&&( $('#productCount').textContent=`${filtered.length} items` );
      $('#resultCount')&&( $('#resultCount').textContent=`${filtered.length} items found` );
      renderCategoryList();
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
    if(type==='M.2 SSD')return !!board.m2SataSupport;
    if(type==='NVME SSD')return !!board.nvmeSupport;
    return true;
  }

  function optionHTML(p){return `<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)}${storageLabel(p)?` • ${esc(storageLabel(p))}`:''}${p.condition?` (${esc(p.condition)})`:''}</option>`}
  function fillSelect(sel,items,placeholder){if(!sel)return;sel.innerHTML=`<option value="">${esc(placeholder)}</option>`+items.map(optionHTML).join('');sel.disabled=false}
  function byId(products,id){return products.find(p=>p.id===id)}

  const QUOTE_GROUPS = [
    {key:'casing', title:'Casing', category:'CASING'},
    {key:'processor', title:'Processor', category:'PROCESSOR'},
    {key:'motherboard', title:'Motherboard', category:'MOTHERBOARD'},
    {key:'cpuCooler', title:'CPU Cooler', category:'CPU COOLER'},
    {key:'ram', title:'RAM', category:'RAM', qty:true, capacity:true},
    {key:'hdd', title:'HDD', category:'HARD DISK', qty:true},
    {key:'ssd', title:'SSD', category:'SSD', qty:true, ssdType:true},
    {key:'psu', title:'Power Supply', category:'POWER SUPPLY'},
    {key:'vga', title:'VGA Card', category:'VGA CARD', capacity:true},
    {key:'monitor', title:'Monitor', category:'MONITOR', monitor:true},
    {key:'keyboard', title:'Keyboard', category:'KEYBOARD'},
    {key:'mouse', title:'Mouse', category:'MOUSE'},
    {key:'mousePad', title:'Mouse Pad', category:'MOUSE PAD'},
    {key:'speaker', title:'Speaker', category:'SPEAKER'},
    {key:'headset', title:'Headset', category:'HEADSET'},
    {key:'fan', title:'RGB Casing Fan', category:'RGB CASING FAN', qty:true},
    {key:'other', title:'Other', category:'OTHER'}
  ];

  function quoteFieldId(key,suffix){return `quote_${key}_${suffix}`}
  function selectedCondition(key){
    const active=$(`[data-quote-condition-group="${key}"] .active`);
    return active?active.getAttribute('data-condition-value'):'USED';
  }
  function quoteProductsByCategory(category){return quoteProducts.filter(p=>p.category===category)}
  function quoteUnique(items,field){return [...new Set(items.map(p=>clean(p[field])).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}))}
  function simpleOptions(vals,placeholder){return `<option value="">${esc(placeholder)}</option>`+vals.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}
  function quoteConditionSwitch(key){
    return `<div class="condition-switch" data-quote-condition-group="${esc(key)}">
      <button type="button" class="active" data-condition-value="USED">USED</button>
      <button type="button" data-condition-value="BRAND NEW">BRAND NEW</button>
    </div>`;
  }
  function quoteLineHTML(g){
    const qty=g.qty?`<input class="input quote-qty-input" id="${quoteFieldId(g.key,'qty')}" type="number" min="1" value="1" aria-label="${esc(g.title)} Qty">`:'';
    const extra=[];
    if(g.capacity)extra.push(`<select id="${quoteFieldId(g.key,'capacity')}"><option value="">All Capacity / Memory</option></select>`);
    if(g.ssdType)extra.push(`<select id="${quoteFieldId(g.key,'ssdType')}"><option value="">All SSD Type</option><option>SATA SSD</option><option>M.2 SSD</option><option>NVME SSD</option></select>`);
    if(g.monitor){
      extra.push(`<select id="${quoteFieldId(g.key,'monitorSize')}"><option value="">Monitor Size</option><option>19 WIDE</option><option>20 WIDE</option><option>22 WIDE</option><option>24 WIDE</option><option>27 WIDE</option><option>29 WIDE</option><option>32 WIDE</option></select>`);
      extra.push(`<select id="${quoteFieldId(g.key,'panelType')}"><option value="">Panel Type</option><option>TN</option><option>VA</option><option>IPS</option></select>`);
    }
    const slot=g.key==='motherboard'?`<select id="quoteMotherboardRamSlot" disabled><option value="">RAM Slot Option</option></select>`:'';
    return `<div class="field quote-item-field" data-quote-key="${esc(g.key)}">
      <label>${esc(g.title)}</label>
      ${quoteConditionSwitch(g.key)}
      <div class="select-qty-row quote-select-row ${qty?'has-qty':''}">
        ${extra.join('')}
        <select id="${quoteFieldId(g.key,'select')}" data-quote-main-select="${esc(g.key)}"><option value="">Skip ${esc(g.title)}</option></select>
        ${slot}
        ${qty}
      </div>
    </div>`;
  }
  function boardRamSlotOptions(board){
    const opts=(board&&Array.isArray(board.ramSlotOptions)?board.ramSlotOptions:[]).filter(Boolean);
    return opts.length?opts:[];
  }
  function quoteBoardDisplayName(board,slot){
    if(!board)return '';
    const base=clean(board.name).replace(/\b(2|4)\s*RAM\s*SLOT\b/ig,'').replace(/\s+/g,' ').trim();
    if(slot)return `${base} ${slot} Motherboard`.replace(/MOTHERBOARD\s+Motherboard/i,'Motherboard');
    return board.name;
  }
  function quoteBoardPrice(board,slot){return Number(board?.price||0)+(upper(slot).includes('4')?500:0)}
  function optionQuoteHTML(p){return `<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)}${p.condition?` (${esc(p.condition)})`:''}</option>`}
  function setQuoteSelectOptions(sel,items,placeholder,keepValue){
    if(!sel)return;
    const current=keepValue!==undefined?keepValue:sel.value;
    sel.innerHTML=`<option value="">${esc(placeholder)}</option>`+items.map(optionQuoteHTML).join('');
    sel.disabled=false;
    if(current && items.some(p=>p.id===current))sel.value=current;else sel.value='';
  }
  function quoteCategoryItems(g){
    let items=quoteProductsByCategory(g.category);
    const cond=selectedCondition(g.key);
    if(cond)items=items.filter(p=>upper(p.condition)===upper(cond));
    return items;
  }
  function updateQuoteSelects(changedKey=''){
    const processorSel=$('#quote_processor_select');
    const cpu=byId(quoteProducts,processorSel?.value);
    const cpuGen=cpu?(cpu.generations?.[0]||normalizeGenKey(cpu.processorGen||cpu.generation)) : '';
    const boardSel=$('#quote_motherboard_select');
    const selectedBoardBefore=boardSel?.value;

    QUOTE_GROUPS.forEach(g=>{
      const sel=$(`#${quoteFieldId(g.key,'select')}`);if(!sel)return;
      let items=quoteCategoryItems(g);
      if(g.key==='motherboard' && cpuGen){
        items=items.filter(p=>Array.isArray(p.generations)&&p.generations.includes(cpuGen));
      }
      if(g.key==='ram'){
        const board=byId(quoteProducts,$('#quote_motherboard_select')?.value);
        if(board?.ramSupport)items=items.filter(p=>upper(p.memory)===upper(board.ramSupport));
        else if(cpuGen){
          const rule=COMPAT_RULES[cpuGen];
          if(rule?.ram)items=items.filter(p=>upper(p.memory)===upper(rule.ram));
        }
      }
      if(g.key==='ssd'){
        const board=byId(quoteProducts,$('#quote_motherboard_select')?.value);
        items=items.filter(p=>isSsdCompatibleWithBoard(p,board));
        const type=clean($(`#${quoteFieldId(g.key,'ssdType')}`)?.value);
        if(type)items=items.filter(p=>upper(storageType(p))===upper(type));
      }
      if(g.capacity){
        const cap=clean($(`#${quoteFieldId(g.key,'capacity')}`)?.value);
        if(cap)items=items.filter(p=>upper(p.capacity)===upper(cap));
      }
      if(g.monitor){
        const size=clean($(`#${quoteFieldId(g.key,'monitorSize')}`)?.value);
        const panel=clean($(`#${quoteFieldId(g.key,'panelType')}`)?.value);
        if(size)items=items.filter(p=>upper(p.monitorSize)===upper(size));
        if(panel)items=items.filter(p=>upper(p.panelType)===upper(panel));
      }
      setQuoteSelectOptions(sel,items,`Skip ${g.title}`,sel.value);
    });

    const board=byId(quoteProducts,$('#quote_motherboard_select')?.value);
    const slotSel=$('#quoteMotherboardRamSlot');
    if(slotSel){
      const old=slotSel.value;
      const opts=boardRamSlotOptions(board);
      slotSel.innerHTML=opts.length?opts.map((o,i)=>`<option value="${esc(o)}" ${i===0?'selected':''}>${esc(o)}</option>`).join(''):'<option value="">RAM Slot Option</option>';
      slotSel.disabled=!opts.length;
      if(old&&opts.includes(old))slotSel.value=old;
    }
    if(selectedBoardBefore!==($('#quote_motherboard_select')?.value||'')){
      updateQuoteSelects('motherboard-refresh');
      return;
    }
    renderQuote();
  }

  async function initQuotationPage(){
    const form=$('#quoteComponentForm');
    if(!form)return;
    try{
      quoteProducts=await loadProducts();
      if(!quoteProducts.length){form.innerHTML='<div class="empty-state">No products found. Check Google Sheet publish link.</div>';return;}
      form.innerHTML=QUOTE_GROUPS.map(quoteLineHTML).join('')+`<div class="quote-section-title">Cables</div><div class="quote-cable-grid">
        ${['VGA CABLE','HDMI CABLE','DVI CABLE','POWER CABLE'].map(c=>`<label class="quote-cable-item"><input type="checkbox" data-cable-name="${esc(c)}"><span>${esc(c)}</span><input class="input quote-qty-input" type="number" min="1" value="1" data-cable-qty="${esc(c)}"></label>`).join('')}
      </div>`;

      $all('.condition-switch button',form).forEach(btn=>btn.addEventListener('click',()=>{
        const wrap=btn.closest('.condition-switch');
        wrap.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        updateQuoteSelects();
      }));
      $all('select,input',form).forEach(el=>el.addEventListener('change',()=>updateQuoteSelects(el.id||'')));
      updateQuoteSelects();
    }catch(e){
      console.error(e);
      form.innerHTML='<div class="empty-state">Quotation form load වෙන්නේ නැහැ. Google Sheet CSV link එක / app.js file එක check කරන්න.</div>';
    }
    $('#addQuoteToCartBtn')?.addEventListener('click',()=>{const ids=getQuoteItems().map(x=>x.id).filter(Boolean);if(!ids.length){toast('Select products first');return}addManyToCart(ids)});
    $('#downloadQuotePdfBtn')?.addEventListener('click',downloadQuotationPdf);
  }

  function getQuoteItems(){
    const items=[];
    QUOTE_GROUPS.forEach(g=>{
      const sel=$(`#${quoteFieldId(g.key,'select')}`);if(!sel||!sel.value)return;
      const p=byId(quoteProducts,sel.value);if(!p)return;
      const qty=Math.max(1,Number($(`#${quoteFieldId(g.key,'qty')}`)?.value||1));
      let name=p.name, price=Number(p.price||0);
      if(g.key==='motherboard'){
        const slot=$('#quoteMotherboardRamSlot')?.value||'';
        if(slot){name=quoteBoardDisplayName(p,slot);price=quoteBoardPrice(p,slot)}
      }
      items.push({...p,name,price,qty,subtotal:price*qty,condition:p.condition});
    });
    $all('[data-cable-name]').forEach(ch=>{
      if(!ch.checked)return;
      const name=ch.getAttribute('data-cable-name');
      const qty=Math.max(1,Number($(`[data-cable-qty="${name}"]`)?.value||1));
      items.push({id:`CABLE-${fieldKey(name)}`,name,category:'CABLES',condition:'BRAND NEW',price:0,qty,subtotal:0});
    });
    return items;
  }
  function getQuoteIds(){return getQuoteItems().map(x=>x.id).filter(Boolean)}
  function renderQuote(){
    const tbody=$('#quoteTable tbody');if(!tbody)return;
    const items=getQuoteItems();const total=items.reduce((s,p)=>s+Number(p.subtotal||0),0);
    tbody.innerHTML=items.length?items.map(p=>`<tr><td>${esc(p.name)}<br><span class="muted">${esc(p.category)}${p.memory?` • ${esc(p.memory)}`:''}</span></td><td>${p.qty||1}</td><td>${esc(p.condition||'')}</td><td>${money(p.subtotal||0)}</td></tr>`).join(''):'<tr><td colspan="4" class="muted">No items selected yet.</td></tr>';
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
  function quoteLineAmount(item){return Number(item.subtotal ?? (Number(item.price||0)*Number(item.qty||1)))}
  function docFooter(doc){
    const h=doc.internal.pageSize.getHeight();
    doc.setFillColor(5,10,28);doc.rect(0,h-34,595,34,'F');
    doc.setTextColor(174,196,220);doc.setFont('helvetica','normal');doc.setFontSize(8);
    pdfText(doc,'This quotation is system generated. Prices and availability may change. Please confirm before payment.',40,h-14);
    doc.setTextColor(11,188,255);doc.setFont('helvetica','bold');pdfText(doc,CONFIG.businessName||'Sandaruwan Computer',430,h-14,{align:'left'});
  }
  function drawHeader(doc,title,subtitle){
    // premium dark header
    doc.setFillColor(3,8,24);doc.rect(0,0,595,112,'F');
    doc.setFillColor(7,22,50);doc.rect(0,0,595,112,'F');
    doc.setFillColor(11,188,255);doc.rect(0,108,595,4,'F');
    doc.setFillColor(34,104,255);doc.rect(0,110,595,2,'F');
    doc.setDrawColor(35,78,130);doc.setLineWidth(.7);doc.roundedRect(38,24,62,62,14,14,'S');
    if(CONFIG.logoDataUrl){try{doc.addImage(CONFIG.logoDataUrl,'PNG',43,29,52,52)}catch(e){}}
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(21);pdfText(doc,CONFIG.businessName||'Sandaruwan Computer',116,45);
    doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(195,214,239);pdfText(doc,CONFIG.tagline||'Computer Parts • PC Builds • Upgrades',116,63);
    doc.setTextColor(125,221,255);doc.setFont('helvetica','bold');doc.setFontSize(8.5);pdfText(doc,'YOUR TRUSTED PC PARTNER',116,80);
    // quote badge
    doc.setFillColor(12,27,58);doc.roundedRect(392,26,162,62,12,12,'F');
    doc.setDrawColor(39,86,145);doc.roundedRect(392,26,162,62,12,12,'S');
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(15);pdfText(doc,title,473,48,{align:'center'});
    doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(195,214,239);pdfText(doc,subtitle,473,64,{align:'center'});
    pdfText(doc,`Date: ${todayString()}`,473,78,{align:'center'});
  }
  function drawQuoteTableHeader(doc,y){
    doc.setFillColor(11,188,255);doc.roundedRect(40,y,515,30,8,8,'F');
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(9);
    pdfText(doc,'PRODUCT',58,y+20);
    pdfText(doc,'QTY',354,y+20,{align:'center'});
    pdfText(doc,'RATE',444,y+20,{align:'right'});
    pdfText(doc,'AMOUNT',535,y+20,{align:'right'});
  }
  function addQuoteNewPage(doc,qn){
    docFooter(doc);doc.addPage();drawHeader(doc,'ONLINE QUOTATION',`Quote No: ${qn}`);drawQuoteTableHeader(doc,132);return 162;
  }
  async function downloadQuotationPdf(){
    const customer=validateQuoteCustomer();if(!customer)return;
    const items=getQuoteItems();if(!items.length){toast('Select products first');return}
    const jsPDF=window.jspdf&&window.jspdf.jsPDF;if(!jsPDF){window.print();return}
    const doc=new jsPDF({unit:'pt',format:'a4'});const qn=quoteNo();
    const subtotal=items.reduce((s,p)=>s+quoteLineAmount(p),0);
    const total=subtotal;
    drawHeader(doc,'ONLINE QUOTATION',`Quote No: ${qn}`);
    let y=132;

    // customer details card
    doc.setFillColor(247,251,255);doc.roundedRect(40,y,515,92,14,14,'F');
    doc.setDrawColor(220,231,245);doc.roundedRect(40,y,515,92,14,14,'S');
    doc.setFillColor(5,10,28);doc.roundedRect(40,y,515,26,14,14,'F');
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(11);pdfText(doc,'CUSTOMER DETAILS',58,y+18);
    doc.setTextColor(35,48,72);doc.setFont('helvetica','normal');doc.setFontSize(9.5);
    pdfText(doc,`Name: ${customer.name}`,58,y+48);pdfText(doc,`Phone: ${customer.phone}`,315,y+48);
    pdfText(doc,`Email: ${customer.email}`,58,y+69);pdfText(doc,`Address: ${customer.address}`,315,y+69);
    y+=118;

    // quotation table
    drawQuoteTableHeader(doc,y);y+=30;
    doc.setFont('helvetica','normal');doc.setFontSize(9);
    items.forEach((p,i)=>{
      const itemName=String(p.name||'Item');
      const descParts=[p.category,p.condition,p.memory||p.capacity||'',p.warranty?`${p.warranty} warranty`:'' ].filter(Boolean);
      const nameLines=doc.splitTextToSize(`${i+1}. ${itemName}`,270);
      const descLines=doc.splitTextToSize(descParts.join(' • '),270);
      const rowH=Math.max(48,18+(nameLines.length*11)+(descLines.length?14:0));
      if(y+rowH>742){y=addQuoteNewPage(doc,qn);}
      if(i%2===0){doc.setFillColor(245,249,253);doc.rect(40,y,515,rowH,'F');}
      doc.setDrawColor(232,239,248);doc.line(40,y+rowH,555,y+rowH);
      doc.setTextColor(12,22,42);doc.setFont('helvetica','bold');doc.setFontSize(9.3);
      doc.text(nameLines,58,y+18);
      doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(95,110,130);
      if(descLines.length)doc.text(descLines,58,y+18+(nameLines.length*11));
      doc.setTextColor(12,22,42);doc.setFont('helvetica','bold');doc.setFontSize(9.5);
      pdfText(doc,String(p.qty||1),354,y+25,{align:'center'});
      pdfText(doc,money(p.price||0),444,y+25,{align:'right'});
      pdfText(doc,money(quoteLineAmount(p)),535,y+25,{align:'right'});
      y+=rowH;
    });

    if(y>635){y=addQuoteNewPage(doc,qn);}
    // totals panel
    y+=16;
    doc.setFillColor(5,10,28);doc.roundedRect(330,y,225,64,12,12,'F');
    doc.setDrawColor(11,188,255);doc.roundedRect(330,y,225,64,12,12,'S');
    doc.setTextColor(185,210,235);doc.setFont('helvetica','bold');doc.setFontSize(9);pdfText(doc,'TOTAL ESTIMATE',350,y+24);
    doc.setTextColor(255,255,255);doc.setFontSize(18);pdfText(doc,money(total),535,y+46,{align:'right'});
    doc.setTextColor(85,100,122);doc.setFont('helvetica','normal');doc.setFontSize(8.5);pdfText(doc,'* Amount = Qty × Rate',40,y+28);
    pdfText(doc,'* Final price may change after stock and delivery confirmation.',40,y+46);
    y+=88;

    if(y>650){y=addQuoteNewPage(doc,qn);}
    // bank details / payment
    doc.setFillColor(235,248,255);doc.roundedRect(40,y,515,90,12,12,'F');doc.setDrawColor(205,225,240);doc.roundedRect(40,y,515,90,12,12,'S');
    doc.setFillColor(11,188,255);doc.roundedRect(40,y,515,24,12,12,'F');
    doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(10);pdfText(doc,'PAYMENT / BANK DETAILS',58,y+17);
    doc.setTextColor(5,10,28);doc.setFont('helvetica','normal');doc.setFontSize(9.5);
    pdfText(doc,`${CONFIG.bank?.name||''}  |  Account No: ${CONFIG.bank?.accountNumber||''}`,58,y+47);
    pdfText(doc,`Account Name: ${CONFIG.bank?.accountName||''}`,58,y+66);
    pdfText(doc,`Branch: ${CONFIG.bank?.branch||''}`,355,y+66);
    y+=116;

    doc.setTextColor(40,52,72);doc.setFont('helvetica','normal');doc.setFontSize(9);
    pdfText(doc,`Contact: ${CONFIG.phoneDisplay||''}   |   Location: ${CONFIG.address||''}`,40,y);
    doc.setTextColor(11,188,255);doc.setFont('helvetica','bold');pdfText(doc,'Thank you for choosing Sandaruwan Computer.',40,y+18);
    docFooter(doc);
    doc.save(`sandaruwan-computer-quotation-${qn}.pdf`);
  }

  async function cartItems(){
    const products=await loadProducts();const cart=getCart();
    return cart.map(it=>({product:byId(products,it.id),qty:Number(it.qty||1)})).filter(x=>x.product);
  }
  async function initCartPage(){
    const view=$('#cartView');if(!view)return;const items=await cartItems();
    if(!items.length){view.innerHTML='<div class="empty-state"><h2>Your cart is empty</h2><p>Add products or create an online quotation first.</p><div class="action-row" style="justify-content:center"><a class="btn btn-primary" href="products.html">View Products</a><a class="btn btn-ghost" href="quotation.html">Online Quotation</a></div></div>';return}
    const total=items.reduce((s,x)=>s+x.product.price*x.qty,0);
    view.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>${items.map(({product:p,qty})=>`<tr><td><div class="cart-product"><img src="${esc(productImage(p))}" onerror="this.src='assets/img/logo.jpg'" alt=""><div><b>${esc(p.name)}</b><br><span class="muted">${esc(p.category)} ${p.memory?`• ${esc(p.memory)}`:''}</span></div></div></td><td>${money(p.price)}</td><td><input class="input qty-input" type="number" min="1" value="${qty}" data-cart-qty="${esc(p.id)}"></td><td>${money(p.price*qty)}</td><td><button class="btn btn-danger btn-small" data-remove-cart="${esc(p.id)}">Remove</button></td></tr>`).join('')}</tbody></table></div><div class="total-row"><span>Cart Total</span><strong>${money(total)}</strong></div><div class="cart-actions"><button class="btn btn-danger" id="clearCartBtn">Clear Cart</button><a class="btn btn-primary" href="checkout.html">Checkout</a></div>`;
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
