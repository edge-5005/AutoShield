@echo off
title AutoShield PRO - Car Detailing CRM ^& Billing
echo =======================================================
echo   🚗 AutoShield PRO - Car Detailing CRM ^& Billing
echo   Starting Studio Server ^& Opening Browser...
echo =======================================================
cd /d "%~dp0"
start http://localhost:5000
npm start
pause
