include .env

export $(shell sed 's/=.*//' .env)

VERSION=1.0.1
DEV_DOMAIN=localhost
UNAME:=$(shell uname)

NGINX_FRONTEND=web/.docker/nginx.conf
NGINX_BACKEND=poi/src/__init__.py

define do_edit_file_darwin
	@echo "Changing $(DEV_DOMAIN) to $(DOMAIN_NAME) in $(1)"
	@if [ -f $(1) ]; then \
		grep -q "$(DEV_DOMAIN)" $(1) && \
		sed -i '' 's/$(DEV_DOMAIN)/$(DOMAIN_NAME)/' $(1) || \
		echo "No changes needed for $(1)."; \
	else \
		echo "File $(1) does not exist!"; \
	fi
endef

define do_edit_file_other
	@echo "Changing $(DEV_DOMAIN) to $(DOMAIN_NAME) in $(1)"
	@if [ -f $(1) ]; then \
		grep -q "$(DEV_DOMAIN)" $(1) && \
		sed -i 's/$(DEV_DOMAIN)/$(DOMAIN_NAME)/' $(1) || \
		echo "No changes needed for $(1)."; \
	else \
		echo "File $(1) does not exist!"; \
	fi
endef

define do_undo_edit_file_darwin
	@echo "Changing $(DOMAIN_NAME) to $(DEV_DOMAIN) in $(1)"
	@if [ -f $(1) ]; then \
		grep -q "$(DOMAIN_NAME)" $(1) && \
		sed -i '' 's/$(DOMAIN_NAME)/$(DEV_DOMAIN)/' $(1) || \
		echo "No changes needed for $(1)."; \
	else \
		echo "File $(1) does not exist!"; \
	fi
endef

define do_undo_edit_file_other
	@echo "Changing $(DOMAIN_NAME) to $(DEV_DOMAIN) in $(1)"
	@if [ -f $(1) ]; then \
		grep -q "$(DOMAIN_NAME)" $(1) && \
		sed -i 's/$(DOMAIN_NAME)/$(DEV_DOMAIN)/' $(1) || \
		echo "No changes needed for $(1)."; \
	else \
		echo "File $(1) does not exist!"; \
	fi
endef

all: edit_file build_frontend build_backend re_edit_file fetch_server_images export_frontend export_backend export_server_images clean_frontend clean_backend clean_server_images
	@echo "Build sequence completed!"

frontend: edit_file build_frontend re_edit_file export_frontend clean_frontend
	@echo "Build sequence completed!"

backend: edit_file build_backend re_edit_file export_backend clean_backend
	@echo "Build sequence completed!"

server: fetch_server_images export_server_images clean_server_images
	@echo "Download and export images completed!"

edit_file:
ifeq ($(UNAME),Darwin)
	$(call do_edit_file_darwin,$(NGINX_FRONTEND))
	$(call do_edit_file_darwin,$(NGINX_BACKEND))
else
	$(call do_edit_file_other,$(NGINX_FRONTEND))
	$(call do_edit_file_other,$(NGINX_BACKEND))
endif
	@echo "Files edited"

re_edit_file:
ifeq ($(UNAME),Darwin)
	$(call do_undo_edit_file_darwin,$(NGINX_FRONTEND))
	$(call do_undo_edit_file_darwin,$(NGINX_BACKEND))
else
	$(call do_undo_edit_file_other,$(NGINX_FRONTEND))
	$(call do_undo_edit_file_other,$(NGINX_BACKEND))
endif
	@echo "Files restored"

build_frontend:
	docker buildx build --no-cache --platform linux/amd64 --target production -t ridu/poi-web:$(VERSION) ./web
	@echo "Frontend image build done"

build_backend:
	docker buildx build --no-cache --platform linux/amd64 -f ./poi/Dockerfile.prod -t ridu/poi-service:$(VERSION) ./poi
	# docker buildx build --no-cache --platform linux/amd64 -f ./supervisor/Dockerfile.prod -t ridu/poi-supervisor:$(VERSION) ./supervisor
	@echo "Backend images build done"

export_frontend:
	docker save ridu/poi-web:$(VERSION) | gzip > ./output/poi-web.tar.gz
	@echo "Frontend image exported"

export_backend:
	docker save ridu/poi-service:$(VERSION) | gzip > ./output/poi-service.tar.gz
	# docker save ridu/poi-supervisor:$(VERSION) | gzip > ./output/poi-supervisor.tar.gz
	@echo "Backend images exported"

fetch_server_images:
	docker image pull --platform linux/amd64 mysql:8.3.0
	docker image pull --platform linux/amd64 phpmyadmin:latest
	docker image pull --platform linux/amd64 rabbitmq:3-management
	docker image pull --platform linux/amd64 quay.io/minio/minio:latest
	@echo "Server images fetched!"

export_server_images:
	docker save mysql:8.3.0 | gzip > ./output/mysql.tar.gz
	docker save phpmyadmin:latest | gzip > ./output/phpmyadmin.tar.gz
	docker save rabbitmq:3-management | gzip > ./output/rabbitmq.tar.gz
	docker save quay.io/minio/minio:latest | gzip > ./output/minio.tar.gz
	@echo "Server images exported!"

clean_server_images:
	docker rmi mysql:8.3.0 -f
	docker rmi phpmyadmin:latest -f
	docker rmi rabbitmq:3-management -f
	docker rmi quay.io/minio/minio:latest -f
	@echo "Server images deleted!"

clean_frontend:
	docker rmi ridu/poi-web:$(VERSION) -f
	@echo "Frontend image deleted!"

clean_backend:
	docker rmi ridu/poi-service:$(VERSION) -f
	# docker rmi ridu/poi-supervisor:$(VERSION) -f
	@echo "Backend image deleted!"
