(function(){
  'use strict';

  const CONFIG = window.SC_CONFIG || {};
  const CART_KEY = 'sandaruwan_computer_cart_v4';
  const ADMIN_PRODUCTS_KEY = 'sandaruwan_computer_admin_products_v1';

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
    const m=s.match(/14|13|12|11|10|[2-9]/);
    return m?m[0]:'';
  }
  function parseGenerations(v){
    if(Array.isArray(v))return [...new Set(v.map(normalizeGenKey).filter(Boolean))];
    const raw=upper(v);
    if(!raw)return [];
    const out=[];
    if(raw.replace(/[^A-Z0-9]/g,'').includes('CORE2DUO'))out.push('CORE2DUO');
    const nums=raw.match(/14|13|12|11|10|[2-9]/g)||[];
    nums.forEach(n=>{if(!out.includes(n))out.push(n)});
    return out;
  }
  function genNum(v){const key=normalizeGenKey(v);return key&&key!=='CORE2DUO'?Number(key):key}
  function genLabel(g){const key=normalizeGenKey(g);if(!key)return '';if(key==='CORE2DUO')return 'CORE 2 DUO';const n=Number(key);return (n===2?'2ND':n===3?'3RD':`${n}TH`)+' GEN'}
  function productImage(p){return clean(p.image)||'assets/img/logo.jpg'}
  function boolish(v){if(v===true)return true;const x=upper(v);return ['YES','Y','TRUE','1','SUPPORTED','SUPPORT'].includes(x)}
  function field(p,...names){
    for(const name of names){
      if(p[name]!==undefined && clean(p[name])!=='')return p[name];
      const target=upper(name).replace(/[^A-Z0-9]/g,'');
      const key=Object.keys(p).find(k=>upper(k).replace(/[^A-Z0-9]/g,'')===target);
      if(key && clean(p[key])!=='')return p[key];
    }
    return '';
  }
  function normalizeCondition(v){
    const x=upper(v||'USED').replace(/\s+/g,' ');
    if(x.includes('BRAND')||x==='NEW')return 'BRAND NEW';
    return 'USED';
  }
  function normalizeRam(v){
    const x=upper(v).replace(/\s+/g,'');
    if(x.includes('DDR5'))return 'DDR5';
    if(x.includes('DDR4'))return 'DDR4';
    if(x.includes('DDR3'))return 'DDR3';
    if(x.includes('DDR2'))return 'DDR2';
    return upper(v);
  }
  function monitorSizeValue(v){
    const m=clean(v).match(/\d+/);
    return m?m[0]:'';
  }
  function parseSsdSupport(v){
    const x=upper(v).replace(/\s+/g,' ');
    if(!x)return {sata:false,m2:false,nvme:false,label:''};
    const hasNvme=x.includes('NVME');
    const hasM2=x.includes('M.2')||x.includes('M2');
    const hasSata=x.includes('SATA')||x.includes('SSD');
    if(x.includes('SATA ONLY'))return {sata:true,m2:false,nvme:false,label:'SATA ONLY'};
    if(x.includes('SATA AND M.2')||x.includes('SATA & M.2'))return {sata:true,m2:true,nvme:false,label:'SATA + M.2'};
    if(hasNvme)return {sata:true,m2:true,nvme:true,label:'SATA + M.2 + NVMe'};
    if(hasM2)return {sata:true,m2:true,nvme:false,label:'SATA + M.2'};
    if(hasSata)return {sata:true,m2:false,nvme:false,label:'SATA ONLY'};
    return {sata:false,m2:false,nvme:false,label:''};
  }
  function storageType(p){
    const v=upper(field(p,'SSD TYPE','storageType','storage_type','storage','interface','ssdType','ssd_type'));
    if(v.includes('NVME'))return 'NVME SSD';
    if(v.includes('M.2')||v.includes('M2'))return 'M.2 SSD';
    if(v.includes('SATA'))return 'SATA SSD';
    if(p.category==='SSD')return 'SATA SSD';
    return '';
  }
  function storageLabel(p){return storageType(p)}

  function normalizeProduct(p,i=0){
    const category=categoryName(field(p,'CATEGORY','category'));
    const mbGens=[field(p,'MB GEN OPTION 1','mbGenOption1','mb_gen_option_1'),field(p,'MB GEN OPTION 2','mbGenOption2','mb_gen_option_2')].flatMap(parseGenerations).filter(Boolean);
    const procGens=parseGenerations(field(p,'PROCESSOR GEN','processorGen','processor_gen'));
    const oldGens=parseGenerations(field(p,'compatibleGenerations','compatible_generations','supportedGens','supported_gens','generation','gen'));
    const gens=[...new Set([...(category==='MOTHERBOARD'?mbGens:[]),...(category==='PROCESSOR'?procGens:[]),...oldGens])];
    const g=gens[0]||'';
    const ssdSup=parseSsdSupport(field(p,'SSD SUPPORT','SSD','ssdSupport','storageSupport','storage_support'));
    const memory=normalizeRam(field(p,'RAM SUPPORT','memory','ram','ram_type','RAM'));
    const item={
      id:clean(field(p,'PRODUCT ID','productId','product_id','id'))||`ITEM-${i+1}`,
      name:clean(field(p,'PRODUCT NAME','productName','product_name','name'))||'Product',
      category,
      condition:normalizeCondition(field(p,'CONDITION','condition')),
      price:toNumber(field(p,'PRICE','price')),
      generation:g,
      generations:gens,
      compatibleGenerations:gens,
      generationLabel:gens.length?gens.map(genLabel).join(' / '):'',
      memory,
      chipset:upper(field(p,'CHIPSET','chipset')),
      socket:upper(field(p,'SOCKET','socket')),
      stock:clean(field(p,'STOCK','stock')),
      image:clean(field(p,'IMAGE','image'))||'assets/img/logo.jpg',
      description:clean(field(p,'DESCRIPTION','description')),
      warranty:clean(field(p,'WARRANTY','warranty','warranty_period','warrantyPeriod')),
      warrantyMonths:clean(field(p,'WARRANTY MONTHS','warrantyMonths','warranty_months','warrantyMonth')),
      storageType:storageType({...p,category}),
      sataSupport:ssdSup.sata,
      m2SataSupport:ssdSup.m2,
      nvmeSupport:ssdSup.nvme,
      ssdSupportLabel:ssdSup.label,
      monitorSize:monitorSizeValue(field(p,'MONITOR SIZE','monitorSize','monitor_size')),
      m2Slots:clean(field(p,'M2 SLOTS','m2Slots','m2_slots')),
      ramSlot2:boolish(field(p,'RAM SLOT 2','ramSlot2','ram_slot_2')),
      ramSlot4:boolish(field(p,'RAM SLOT 4','ramSlot4','ram_slot_4'))
    };
    if(item.category==='MOTHERBOARD' && !item.ramSlot2 && !item.ramSlot4)item.ramSlot2=true;
    if(item.category==='SSD' && !item.storageType)item.storageType='SATA SSD';
    return item;
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
    return `<article class="card product-card" data-product-id="${esc(p.id)}" tabindex="0" aria-label="View ${esc(p.name)} details">
      <div class="product-img-wrap"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='assets/img/logo.jpg'">
        <div class="tag-row"><span class="tag ${p.condition==='BRAND NEW'?'new':'used'}">${esc(p.condition)}</span>${p.memory?`<span class="tag">${esc(p.memory)}</span>`:''}${storageLabel(p)?`<span class="tag">${esc(storageLabel(p))}</span>`:''}${p.monitorSize?`<span class="tag">${esc(p.monitorSize)} inch</span>`:''}${p.generation?`<span class="tag">${esc(p.generationLabel)}</span>`:''}</div>
      </div>
      <div class="product-body"><h3>${esc(p.name)}</h3>
        <div class="meta"><span>${esc(p.category)}</span>${p.chipset?`<span>${esc(p.chipset)}</span>`:''}${p.socket?`<span>${esc(p.socket)}</span>`:''}${storageLabel(p)?`<span>${esc(storageLabel(p))}</span>`:''}${p.monitorSize?`<span>${esc(p.monitorSize)} inch</span>`:''}</div>
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

  function openProductModal(id){
    ensureProductModal();
    const p=(productsCache||[]).find(x=>x.id===id);if(!p)return;
    const content=$('#productModalContent');if(!content)return;
    content.innerHTML=`<div class="product-modal-grid">
      <div class="product-modal-image"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='assets/img/logo.jpg'"></div>
      <div class="product-modal-info">
        <div class="modal-tag-row"><span class="tag ${p.condition==='BRAND NEW'?'new':'used'}">${esc(p.condition)}</span>${p.category?`<span class="tag">${esc(p.category)}</span>`:''}${p.memory?`<span class="tag">${esc(p.memory)}</span>`:''}${storageLabel(p)?`<span class="tag">${esc(storageLabel(p))}</span>`:''}${p.monitorSize?`<span class="tag">${esc(p.monitorSize)} inch</span>`:''}${p.generation?`<span class="tag">${esc(p.generationLabel)}</span>`:''}</div>
        <h2 id="productModalTitle">${esc(p.name)}</h2>
        <div class="product-modal-price">${money(p.price)}</div>
        <p class="product-modal-description">${esc(p.description||'Please contact Sandaruwan Computer for more details, availability and final confirmation before payment.')}</p>
        <div class="product-detail-list">
          <div><span>Warranty Period</span><b>${esc(warrantyText(p))}</b></div>
          <div><span>Availability</span><b>${esc(p.stock||'Contact for stock')}</b></div>
          ${p.chipset?`<div><span>Chipset</span><b>${esc(p.chipset)}</b></div>`:''}
          ${p.socket?`<div><span>Socket</span><b>${esc(p.socket)}</b></div>`:''}
          ${storageLabel(p)?`<div><span>Storage Type</span><b>${esc(storageLabel(p))}</b></div>`:''}
          ${p.category==='MOTHERBOARD'?`<div><span>SSD Support</span><b>${esc(p.ssdSupportLabel||'SATA only')}</b></div>`:''}${p.monitorSize?`<div><span>Monitor Size</span><b>${esc(p.monitorSize)} inch</b></div>`:''}
        </div>
        <div class="product-modal-order">
          <label for="modalProductQty">Quantity</label>
          <div class="modal-qty-row"><input class="input" id="modalProductQty" type="number" min="1" value="1"><button class="btn btn-primary" data-modal-add-to-cart="${esc(p.id)}">Add to Cart</button></div>
        </div>
      </div>
    </div>`;
    const modal=$('#productModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
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
    const inputs=['#productSearch','#categoryFilter','#conditionFilter','#memoryFilter','#generationFilter','#storageFilter','#monitorSizeFilter'].map(id=>$(id)).filter(Boolean);
    inputs.forEach(el=>['input','change'].forEach(ev=>el.addEventListener(ev,render)));
    function render(){
      const q=upper($('#productSearch')?.value);const cat=upper($('#categoryFilter')?.value);const cond=upper($('#conditionFilter')?.value);const mem=upper($('#memoryFilter')?.value);const gen=normalizeGenKey($('#generationFilter')?.value||'');const store=upper($('#storageFilter')?.value);const mon=monitorSizeValue($('#monitorSizeFilter')?.value||'');
      const filtered=products.filter(p=>{
        const hay=upper([p.name,p.category,p.condition,p.memory,p.generationLabel,p.chipset,p.socket,p.description,storageLabel(p),p.monitorSize].join(' '));
        const pGens=(p.generations&&p.generations.length?p.generations:parseGenerations(p.generation)).map(String);
        return (!q||hay.includes(q))&&(!cat||p.category===cat)&&(!cond||p.condition===cond)&&(!mem||p.memory===mem)&&(!gen||pGens.includes(String(gen))||String(p.generation)===String(gen))&&(!store||storageType(p)===store)&&(!mon||String(p.monitorSize)===String(mon));
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
    if(type==='M.2 SSD')return !!board.m2SataSupport;
    if(type==='NVME SSD')return !!board.nvmeSupport;
    return true;
  }
  function conditionFor(cat){return upper($(`[data-condition-for="${cat}"]`)?.value||'')}
  function filterByCondition(items,cat){const c=conditionFor(cat);return c?items.filter(p=>p.condition===c):items}
  function itemQtyFor(p){
    if(!p)return 1;
    if(p.category==='RAM')return Math.max(1,Number($('#quoteRamQty')?.value||1));
    if(p.category==='SSD')return Math.max(1,Number($('#quoteSsdQty')?.value||1));
    if(p.category==='HARD DISK')return Math.max(1,Number($('#quoteHardDiskQty')?.value||1));
    return 1;
  }

  function optionHTML(p){return `<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)}${storageLabel(p)?` • ${esc(storageLabel(p))}`:''}${p.condition?` (${esc(p.condition)})`:''}</option>`}
  function fillSelect(sel,items,placeholder){if(!sel)return;sel.innerHTML=`<option value="">${esc(placeholder)}</option>`+items.map(optionHTML).join('');sel.disabled=false}
  function byId(products,id){return products.find(p=>p.id===id)}

  async function initQuotationPage(){
    const products=await loadProducts();quoteProducts=products;
    const processor=$('#quoteProcessor'),mobo=$('#quoteMotherboard'),ram=$('#quoteRam'),ssdSel=$('#quoteSsd'),monitorSel=$('#quoteMonitor'),monitorSize=$('#quoteMonitorSize'),ramSlot=$('#quoteRamSlot');
    if(!processor)return;
    const refreshBasicSelects=()=>{
      fillSelect(processor,filterByCondition(products.filter(p=>p.category==='PROCESSOR'),'PROCESSOR'),'Select processor');
      $all('[data-quote-select]').forEach(sel=>{
        const cat=sel.getAttribute('data-quote-select');
        if(['SSD','MONITOR'].includes(cat))return;
        fillSelect(sel,filterByCondition(products.filter(p=>p.category===cat),cat),`Skip ${cat}`);
      });
      filterMonitorSelect();
      filterSsdSelect();
    };
    function filterMotherboardAndRam(){
      const cpu=byId(products,processor?.value);
      if(!cpu){
        if(mobo){mobo.innerHTML='<option value="">Select processor first</option>';mobo.disabled=true;}
        if(ram){ram.innerHTML='<option value="">Select processor first</option>';ram.disabled=true;}
        if(ramSlot){ramSlot.innerHTML='<option value="">Select motherboard first</option>';ramSlot.disabled=true;}
        filterSsdSelect();renderQuote();return;
      }
      const cpuGens=cpu.generations&&cpu.generations.length?cpu.generations:parseGenerations(cpu.generation);
      const motherboards=filterByCondition(products.filter(p=>{
        if(p.category!=='MOTHERBOARD')return false;
        const boardGens=p.generations&&p.generations.length?p.generations:parseGenerations(p.generation);
        return cpuGens.some(g=>boardGens.includes(g));
      }),'MOTHERBOARD');
      fillSelect(mobo,motherboards,'Select compatible motherboard');
      filterRamSelect();
      filterSsdSelect();
      renderQuote();
    }
    function filterRamSelect(){
      const board=byId(products,mobo?.value);
      const cpu=byId(products,processor?.value);
      const requiredRam=board?.memory || cpu?.memory || '';
      const rams=filterByCondition(products.filter(p=>p.category==='RAM' && (!requiredRam || p.memory===requiredRam)),'RAM');
      fillSelect(ram,rams,requiredRam?`Select ${requiredRam} RAM`:'Select RAM');
      if(ramSlot){
        if(!board){ramSlot.innerHTML='<option value="">Select motherboard first</option>';ramSlot.disabled=true;}
        else{
          const opts=[];
          if(board.ramSlot2!==false)opts.push('<option value="2">RAM Slot 2</option>');
          if(board.ramSlot4)opts.push('<option value="4">RAM Slot 4 (+ Rs. 500)</option>');
          ramSlot.innerHTML=opts.length?opts.join(''):'<option value="2">RAM Slot 2</option>';
          ramSlot.disabled=false;
        }
      }
    }
    function filterSsdSelect(){
      if(!ssdSel)return;
      const current=ssdSel.value;
      const board=byId(products,mobo?.value);
      const ssds=filterByCondition(products.filter(p=>p.category==='SSD'&&isSsdCompatibleWithBoard(p,board)),'SSD');
      fillSelect(ssdSel,ssds,board?'Select compatible SSD':'Skip SSD');
      if(ssds.some(p=>p.id===current))ssdSel.value=current; else ssdSel.value='';
    }
    function filterMonitorSelect(){
      if(!monitorSel)return;
      const size=monitorSizeValue(monitorSize?.value||'');
      const current=monitorSel.value;
      const mons=filterByCondition(products.filter(p=>p.category==='MONITOR' && (!size || String(p.monitorSize)===String(size))),'MONITOR');
      fillSelect(monitorSel,mons,size?`Select ${size} inch monitor`:'Skip Monitor');
      if(mons.some(p=>p.id===current))monitorSel.value=current; else monitorSel.value='';
    }
    refreshBasicSelects();
    $all('[data-condition-for]').forEach(sel=>sel.addEventListener('change',()=>{refreshBasicSelects();filterMotherboardAndRam();renderQuote();}));
    processor.addEventListener('change',filterMotherboardAndRam);
    mobo?.addEventListener('change',()=>{filterRamSelect();filterSsdSelect();renderQuote();});
    monitorSize?.addEventListener('change',()=>{filterMonitorSelect();renderQuote();});
    [ram,ssdSel,ramSlot,monitorSel,'#quoteRamQty','#quoteSsdQty','#quoteHardDiskQty'].forEach(x=>{
      const el=typeof x==='string'?$(x):x;if(el)el.addEventListener('change',renderQuote);
      if(el&&el.tagName==='INPUT')el.addEventListener('input',renderQuote);
    });
    $all('[data-quote-select]').forEach(sel=>sel.addEventListener('change',renderQuote));
    $all('[data-cable-option],[data-cable-qty]').forEach(el=>['change','input'].forEach(ev=>el.addEventListener(ev,renderQuote)));
    $('#addQuoteToCartBtn')?.addEventListener('click',()=>{const ids=getQuoteIds();if(!ids.length){toast('Select products first');return}addManyToCart(ids)});
    $('#downloadQuotePdfBtn')?.addEventListener('click',downloadQuotationPdf);
    renderQuote();
  }

  function getQuoteIds(){
    const ids=[];['#quoteProcessor','#quoteMotherboard','#quoteRam'].forEach(s=>{const v=$(s)?.value;if(v)ids.push(v)});
    $all('[data-quote-select]').forEach(s=>{if(s.value)ids.push(s.value)});
    return [...new Set(ids)];
  }
  function cableProducts(){
    const out=[];
    $all('[data-cable-option]').forEach(cb=>{
      if(!cb.checked)return;
      const name=cb.getAttribute('data-cable-option');
      const qty=Math.max(1,Number($(`[data-cable-qty="${name}"]`)?.value||1));
      const p=quoteProducts.find(x=>x.category==='CABLES'&&upper(x.name).includes(upper(name.replace(' CABLE','')))) || {id:'CABLE-'+name,name,category:'CABLES',condition:'BRAND NEW',price:0,description:'Cable add-on'};
      out.push({product:p,qty});
    });
    return out;
  }
  function getQuoteRows(){
    const ids=getQuoteIds();
    const rows=ids.map(id=>byId(quoteProducts,id)).filter(Boolean).map(p=>({product:p,qty:itemQtyFor(p)}));
    const boardRow=rows.find(x=>x.product.category==='MOTHERBOARD');
    if(boardRow && $('#quoteRamSlot')?.value==='4')boardRow.slotExtra=500;
    return rows.concat(cableProducts());
  }
  function getQuoteItems(){return getQuoteRows().map(x=>x.product).filter(Boolean)}
  function renderQuote(){
    const tbody=$('#quoteTable tbody');if(!tbody)return;
    const rows=getQuoteRows();const total=rows.reduce((s,x)=>s+(toNumber(x.product.price)*x.qty)+(x.slotExtra||0),0);
    tbody.innerHTML=rows.length?rows.map(x=>{const p=x.product;const line=toNumber(p.price)*x.qty+(x.slotExtra||0);return `<tr><td>${esc(p.name)}${x.slotExtra?`<br><span class="muted">RAM Slot 4 extra charge included</span>`:''}<br><span class="muted">${esc(p.category)} ${p.memory?`• ${esc(p.memory)}`:''}${p.monitorSize?` • ${esc(p.monitorSize)} inch`:''}</span></td><td>${x.qty}</td><td>${esc(p.condition||'')}</td><td>${money(line)}</td></tr>`}).join(''):'<tr><td colspan="4" class="muted">No items selected yet.</td></tr>';
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
    const rows=getQuoteRows();if(!rows.length){toast('Select products first');return}
    const items=rows.map(x=>x.product);
    const jsPDF=window.jspdf&&window.jspdf.jsPDF;if(!jsPDF){window.print();return}
    const doc=new jsPDF({unit:'pt',format:'a4'});const qn=quoteNo();const total=rows.reduce((s,x)=>s+(toNumber(x.product.price)*x.qty)+(x.slotExtra||0),0);
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
    pdfText(doc,'#',55,y+18);pdfText(doc,'ITEM',82,y+18);pdfText(doc,'CONDITION',355,y+18);pdfText(doc,'PRICE',462,y+18);
    y+=28;
    doc.setFont('helvetica','normal');doc.setTextColor(25,34,54);doc.setFontSize(9);
    rows.forEach((x,i)=>{
      const p=x.product; const lineTotal=toNumber(p.price)*x.qty+(x.slotExtra||0);
      if(y>690){docFooter(doc);doc.addPage();drawHeader(doc,'ONLINE QUOTATION',`Quote No: ${qn}`);y=132;}
      doc.setFillColor(i%2?255:245,i%2?255:248,i%2?255:253);doc.rect(40,y,515,38,'F');
      pdfText(doc,String(i+1),55,y+23);pdfText(doc,p.name,82,y+16);doc.setTextColor(95,110,130);pdfText(doc,`${p.category} • Qty ${x.qty}${p.memory?` • ${p.memory}`:''}${x.slotExtra?' • RAM Slot 4 extra included':''}`,82,y+30);doc.setTextColor(25,34,54);
      pdfText(doc,p.condition,355,y+23);pdfText(doc,money(lineTotal),462,y+23);
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
