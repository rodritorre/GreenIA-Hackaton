#!/bin/sh
# Daily database + uploads backup. Add to the server's crontab, e.g.:
#   15 3 * * * /opt/cuando-florece/deploy/fullstack/backup.sh >> /var/log/florece-backup.log 2>&1
set -eu
cd "$(dirname "$0")"
DEST=${BACKUP_DIR:-/var/backups/cuando-florece}
STAMP=$(date +%Y%m%d-%H%M)
mkdir -p "$DEST"
docker compose exec -T db pg_dump -U florece -Fc florece > "$DEST/db-$STAMP.dump"
docker compose run --rm -T --no-deps -u 0 -v "$DEST:/backup" --entrypoint sh api -c "tar czf /backup/data-$STAMP.tgz -C /data ."
# keep 14 days
find "$DEST" -type f -mtime +14 -delete
echo "backup $STAMP ok"
