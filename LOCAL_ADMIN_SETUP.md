# Local Admin Auto Save Setup

Use this when you want product images to be renamed automatically and saved into the website folder before uploading the folder to GitHub.

## Steps

1. Extract the website ZIP to Desktop.
2. Double click `start-admin.bat`.
3. Chrome / Edge will open `http://localhost:8787/admin.html`.
4. In Admin Panel, click **Select Website Folder** and choose the extracted website folder, the folder that contains `index.html`.
5. Add product name and choose image file.
6. Image path will become like:
   `assets/img/products/intel-core-i5-4th-gen.jpg`
7. Click **Save Product**.
8. The image is saved into `assets/img/products/` and `data/products.json` is updated automatically.
9. Upload the whole folder contents to GitHub.

Important: This works best in Chrome or Edge. If folder permission asks again, select the same website folder.
