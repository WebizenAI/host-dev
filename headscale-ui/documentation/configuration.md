# Traefik Configuration

(Thanks [DennisGaida](https://github.com/DennisGaida) and [Niek](https://github.com/Niek))

Below is a complete docker-compose example for bringing up Traefik + headscale + headscale-ui. Run with: `docker-compose up -d` and headscale-ui will be accessible at <http://localhost/web>.

```yaml
version: '3.9'

services:
  headscale:
    image: headscale/headscale:latest
    pull_policy: always
    container_name: headscale
    restart: unless-stopped
    command: headscale serve
    volumes:
      - ./headscale/config:/etc/headscale
      - ./headscale/data:/var/lib/headscale
    labels:
      - traefik.enable=true
      - traefik.http.routers.headscale-rtr.rule=PathPrefix(`/`) # you might want to add: && Host(`your.domain.name`)"
      - traefik.http.services.headscale-svc.loadbalancer.server.port=8080

  headscale-ui:
    image: ghcr.io/gurucomputing/headscale-ui:latest
    pull_policy: always
    container_name: headscale-ui
    restart: unless-stopped
    labels:
      - traefik.enable=true
      - traefik.http.routers.headscale-ui-rtr.rule=PathPrefix(`/web`) # you might want to add: && Host(`your.domain.name`)"
      - traefik.http.services.headscale-ui-svc.loadbalancer.server.port=80

  traefik:
    image: traefik:latest
    pull_policy: always
    restart: unless-stopped
    container_name: traefik
    command:
      - --api.insecure=true # remove in production
      - --providers.docker
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --global.sendAnonymousUsage=false
    ports:
      - 80:80
      - 443:443
      - 8080:8080 # web UI (enabled with api.insecure)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/certificates:/certificates
```
