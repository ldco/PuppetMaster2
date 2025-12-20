#!/bin/bash
# ============================================
# SQLite Database Backup Script
# PuppetMaster2
# ============================================
#
# Usage:
#   ./scripts/backup-db.sh
#   ./scripts/backup-db.sh /custom/backup/path
#
# Recommended: Run via cron
#   0 2 * * * /app/scripts/backup-db.sh >> /var/log/backup.log 2>&1
#
# Features:
# - Creates timestamped backup
# - Uses SQLite's backup command (safe, handles WAL mode)
# - Compresses with gzip
# - Retains last 7 days of backups
# ============================================

set -euo pipefail

# Configuration
DB_PATH="${DATABASE_URL:-/app/data/sqlite.db}"
BACKUP_DIR="${1:-/app/data/backups}"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.db"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "[$(date)] ERROR: Database not found at $DB_PATH"
    exit 1
fi

# Create backup using SQLite's backup command (WAL-safe)
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/$BACKUP_FILE'"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "[$(date)] Backup created: $BACKUP_DIR/${BACKUP_FILE}.gz"

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_FILE}.gz" | cut -f1)
echo "[$(date)] Backup size: $BACKUP_SIZE"

# Cleanup old backups
echo "[$(date)] Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "backup_*.db.gz" -mtime +"$RETENTION_DAYS" -delete

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup_*.db.gz" | wc -l)
echo "[$(date)] Backups retained: $BACKUP_COUNT"

echo "[$(date)] Backup complete."
