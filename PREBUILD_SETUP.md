# Pre Build PC Package Setup

## Files to replace in your website
- `assets/js/app.js`
- `index.html`
- `prebuild.html`
- `data/prebuilds.csv`

## How to add Pre Build PC packages
Use `templates/sandaruwan-prebuild-packages-v46.xlsx`.

Edit the `Prebuild_Packages` sheet:
- `TITLE` = package name, e.g. Office Value PC
- `PRICE` = number only, e.g. 58500
- `IMAGE PATH` = path such as `assets/img/prebuild/office-value-pc.jpg`
- `WARRANTY TEXT` / `WARRANTY MONTHS` = warranty shown in popup/cart
- `SPEC 1` to `SPEC 12` = check-mark list shown in the modal
- `STATUS` = INSTOCK / ONLINE ORDERS ONLY / OUTOFSTOCK

## Use with GitHub Pages without Google Sheets
Save/export the Excel sheet as CSV and replace:
`data/prebuilds.csv`

## Use with Google Sheets
Import the Excel file into Google Sheets, publish the `Prebuild_Packages` sheet as CSV, then add this line in your existing `assets/js/config.js` object:

`prebuildCsvUrl: "PASTE_PREBUILD_CSV_LINK_HERE",`

Do not connect this sheet to the quotation page. It is only for the Pre Build section/page.
