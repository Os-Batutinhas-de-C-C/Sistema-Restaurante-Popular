@echo off
setlocal

set "JAVA_HOME=%USERPROFILE%\jdks\temurin-25.0.5.8"
if not exist "%JAVA_HOME%\bin\javac.exe" (
    echo JDK 25 not found at "%JAVA_HOME%".
    exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%PATH%"
"%JAVA_HOME%\bin\java.exe" -version
call mvn spring-boot:run %*
exit /b %ERRORLEVEL%
