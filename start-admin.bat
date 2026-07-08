@echo off
cd /d "%~dp0"
echo Starting local admin server for Sandaruwan Computer...
echo Open this link in Chrome or Edge: http://localhost:8787/admin.html
start "" "http://localhost:8787/admin.html"
py -3 -m http.server 8787
if errorlevel 1 python -m http.server 8787
pause
