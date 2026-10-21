# Hackathon EPS26: website

- `frontend/public/`: what the site serves (currently a "hosting works" page)
- `deploy/`: the production stack, `docker-compose.yml` + `Caddyfile` (Caddy handles HTTPS automatically)
- `scripts/deploy.sh`: run on the server to pull `main` and restart the stack

Only the operator deploys. Push to `main`; ask the operator to deploy.
