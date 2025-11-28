# /bin/bash

echo "==============================="
echo " Rebuild local stack"
echo "==============================="

cd ./local-stack

echo "Stop postgres container"
docker container stop postgres-dev
echo "Stop redis container"
docker container stop redis-dev
echo "Stop nginx container"
echo "Stopped this shit, PIPPO!"
docker container stop nginx-dev

echo "Remove postgres container"
docker container rm postgres-dev
echo "Remove redis container"
docker container rm redis-dev
echo "Remove nginx container"
docker container rm nginx-dev

echo "Remove postgres-dev data (volume)"
docker volume rm postgres-dev
echo "Remove redis-dev data (volume)"
docker volume rm redis-dev

echo "Relaunch stack"
docker compose up -d