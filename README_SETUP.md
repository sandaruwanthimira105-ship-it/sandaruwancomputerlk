# Sandaruwan Computer Website - GitHub Pages Setup

## Files
- `index.html` - Home page with Pre Build PC auto slider, wide banner slider, Google review style section and location section.
- `products.html` - Product store with search, Used/New, category, DDR2-DDR5 and 2nd-10th Gen filters.
- `quotation.html` - Online quotation with customer name, phone, email, address, compatibility logic and branded colour PDF download.
- `prebuild.html` - Pre Build PC packages page with WhatsApp order request buttons.
- `cart.html` - Cart view page.
- `checkout.html` - Checkout page with BOC bank details, receipt and WhatsApp order button.
- `about.html` - About Us page with business description, Facebook, WhatsApp, location and reviews.

## Edit business details
Open `assets/js/config.js` and edit:
- WhatsApp number
- Facebook page URL
- Google Maps location URL
- Google review URL
- Google Sheets CSV link
- Bank details

## Google Sheets product data
Publish your Google Sheet as CSV and paste the CSV URL into:

```js
sheetCsvUrl: "PASTE_YOUR_CSV_LINK_HERE"
```

Required columns:

`id,name,category,condition,price,generation,memory,chipset,socket,stock,image,description`

Supported categories:
`PROCESSOR, MOTHERBOARD, CPU COOLER, RAM, HARD DISK, SSD, POWER SUPPLY, CABLES, MONITOR, KEYBOARD, MOUSE, SPEAKER, HEADSET, CASING`

## Product images
Put your product images inside `assets/img/products/` and use the path in Google Sheets, for example:

`assets/img/products/i5-4th-gen.jpg`

## Compatibility logic
The quotation page filters motherboard and RAM after selecting a processor.
Example: i5 4th Gen shows H81/B85 compatible boards and DDR3 RAM only.

## GitHub Pages upload
1. Create a new GitHub repository.
2. Upload all files from this folder.
3. Go to Settings > Pages.
4. Source: Deploy from branch.
5. Branch: `main` / root.
6. Save and open the GitHub Pages link.

## Product Manager / Admin Page

Open `admin.html` in the website to add or update products like a small product software panel.

Important for GitHub Pages:
- GitHub Pages is a static website, so the admin page cannot directly save files to GitHub.
- Products saved from `admin.html` will appear in the same browser using localStorage.
- To make products permanent for all visitors, click **Download products.json** in `admin.html`.
- Upload/replace that downloaded file at: `data/products.json` in your GitHub repository.

Product image options:
- Best method: upload product images to `assets/img/products/` and enter path like `assets/img/products/i5-4th-gen.jpg`.
- Quick method: choose an image file in the admin page. It will be stored as base64 in `products.json`, but the file can become large.

Quotation compatibility fields:
- Processor: set `generation`, `memory`, and `socket`.
- Motherboard: set `generation`, `memory`, `chipset`, `socket`, plus `m2SataSupport` / `nvmeSupport`.
- SSD: set `storageType` as `SATA SSD`, `M.2 SSD`, or `NVME SSD`.

SATA SSD works with all motherboards. M.2 SSD and NVMe SSD show in Online Quotation only when the selected motherboard supports them.
