@echo off
chcp 65001 > nul
title Radar Access System
echo Starting radar gait recognition system...
cd /d G:\SXU\radar-access-system
echo Starting development server...
start /b npm run dev
timeout /t 5 /nobreak > nul
echo Opening browser...
start http://localhost:3001
pause
