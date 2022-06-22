#!/bin/bash
EXPECTED_RES=$(echo -e "{\"error\":\"Error! Form payload is incorrect\"}\n400\n");
echo "KeyErrorTest"
RESPONSE=$(curl -X POST -F file=@/home/lorenzo/Downloads/Diario_degli_esperimenti.pdf -s -w "\n%{http_code}\n" http://0.0.0.0:8080/sign/start -H "Accept: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTU4MTc0MTMsImV4cCI6MTY4NzM1MzQxMywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImNvbW1vbk5hbWUiOiJBZHJpYW5vIE1hbmNpbmkiLCJjb3VudHJ5TmFtZSI6IklUIiwic3RhdGVPclByb3ZpbmNlTmFtZSI6IkZNIiwibG9jYWxpdHlOYW1lIjoiRmVybW8iLCJvcmdhbml6YXRpb25OYW1lIjoiQUNNRSIsIm9yZ2FuaXphdGlvbmFsVW5pdE5hbWUiOiJJVCIsImVtYWlsQWRkcmVzcyI6ImRlbW9AbWFpbGluYXRvci5jb20iLCJzZXJpYWxOdW1iZXIiOiJNTkNEUk44MlQzMEQ1NDJVIiwiZG5RdWFsaWZpZXIiOiIyMDE3NTAwNzY5MyIsIlNOIjoiTWFuY2luaSIsInJvbGUiOiJ1c2VyIn0.PzK1TPpQSLF5cN1stO6hczyuQVG4v2Nq_XLqQizVGiY")
if [ "$RESPONSE" = "$EXPECTED_RES" ]; then 
    echo "PASSED TEST KeyErrorTest"
fi
echo "DownloadSignerTest"
EXPECTED_RES="200"
RESPONSE=$(curl -O -J -s -w "%{http_code}\n" http://0.0.0.0:8080/download/1 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTU4MTc0MTMsImV4cCI6MTY4NzM1MzQxMywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImNvbW1vbk5hbWUiOiJMb3JlbnpvIFNvcHJhbnpldHRpIiwiY291bnRyeU5hbWUiOiJJVCIsInN0YXRlT3JQcm92aW5jZU5hbWUiOiJBTiIsImxvY2FsaXR5TmFtZSI6IkZpbG90dHJhbm8iLCJvcmdhbml6YXRpb25OYW1lIjoiQUNNRSIsIm9yZ2FuaXphdGlvbmFsVW5pdE5hbWUiOiJJVCIsImVtYWlsQWRkcmVzcyI6ImRlbW8xQG1haWxpbmF0b3IuY29tIiwic2VyaWFsTnVtYmVyIjoiTFNQRFJOOTRUMzBENTQyVSIsImRuUXVhbGlmaWVyIjoiMjAxNzUwMDc2OTMiLCJTTiI6IlNvcHJhbnpldHRpIiwicm9sZSI6InVzZXIifQ.mAdEhfnLfGdlDSHiaz7X1dzDd1P-qvj9e82itMRGyro")
if [ "$RESPONSE" = "$EXPECTED_RES" ]; then 
    FIND=$(find ./ -name Diario_degli_esperimenti.pdf.p7m)
    echo "$FIND"
    if [ "$FIND" == "./Diario_degli_esperimenti.pdf.p7m" ]; then
        echo "PASSED TEST DownloadSignerTest"
    fi
fi
rm ./Diario_degli_esperimenti.pdf.p7m
echo "DownloadApplicantTest"
EXPECTED_RES="200"
RESPONSE=$(curl -O -J -s -w "%{http_code}\n" http://0.0.0.0:8080/download/1 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTU4MTc0MTMsImV4cCI6MTY4NzM1MzQxMywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImNvbW1vbk5hbWUiOiJBZHJpYW5vIE1hbmNpbmkiLCJjb3VudHJ5TmFtZSI6IklUIiwic3RhdGVPclByb3ZpbmNlTmFtZSI6IkZNIiwibG9jYWxpdHlOYW1lIjoiRmVybW8iLCJvcmdhbml6YXRpb25OYW1lIjoiQUNNRSIsIm9yZ2FuaXphdGlvbmFsVW5pdE5hbWUiOiJJVCIsImVtYWlsQWRkcmVzcyI6ImRlbW9AbWFpbGluYXRvci5jb20iLCJzZXJpYWxOdW1iZXIiOiJNTkNEUk44MlQzMEQ1NDJVIiwiZG5RdWFsaWZpZXIiOiIyMDE3NTAwNzY5MyIsIlNOIjoiTWFuY2luaSIsInJvbGUiOiJ1c2VyIn0.PzK1TPpQSLF5cN1stO6hczyuQVG4v2Nq_XLqQizVGiY")
if [ "$RESPONSE" = "$EXPECTED_RES" ]; then 
    FIND=$(find ./ -name Diario_degli_esperimenti.pdf.p7m)
    echo "$FIND"
    if [ "$FIND" == "./Diario_degli_esperimenti.pdf.p7m" ]; then
        echo "PASSED TEST DownloadApplicantTest"
    fi
fi
