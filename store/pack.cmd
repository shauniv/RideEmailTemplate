@echo off
pushd %~dp0..\src
zip -9r %~dp0RideEmailTemplate.zip *
popd
