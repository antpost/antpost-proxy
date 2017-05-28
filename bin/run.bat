@echo off
@setlocal enableextensions
@cd /d "%~dp0"

nssm64 install antpost_proxy antpost-proxy.exe
nssm64 start antpost_proxy

pause