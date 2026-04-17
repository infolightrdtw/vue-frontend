@echo off
setlocal ENABLEDELAYEDEXPANSION

:: 切到此批次檔所在的專案目錄
pushd "%~dp0"

title Vue 開發伺服器 (npm run dev)

:: 檢查 Node 與 npm
where node >nul 2>&1 || (echo [錯誤] 找不到 Node.js，請先安裝 https://nodejs.org/ & pause & exit /b 1)
where npm  >nul 2>&1 || (echo [錯誤] 找不到 npm，請確認 Node.js 安裝無誤 & pause & exit /b 1)

:: 第一次執行自動裝套件
if not exist "node_modules" (
  echo [資訊] 第一次執行：安裝相依套件中...
  call npm install
  if errorlevel 1 (
    echo [錯誤] 套件安裝失敗，請檢查網路或權限。
    pause
    exit /b 1
  )
)

echo [資訊] 啟動開發伺服器：npm run dev
echo ---------------------------------------------
call npm run dev
echo ---------------------------------------------

echo [資訊] 伺服器已結束。按任意鍵關閉視窗...
pause

:: 回到原目錄並結束
popd
endlocal
