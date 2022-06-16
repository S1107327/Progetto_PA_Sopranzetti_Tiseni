up:
	docker-compose -f docker-compose.yaml up
down: 
	docker-compose down
up-prod:
	docker-compose -f docker-compose.prod.yaml up 
build:
	docker-compose -f docker-compose.yaml build
build-prod:
	docker-compose -f docker-compose.prod.yaml build
openssl-build:
	docker build -t node-openssl ./image