#!/bin/sh
set -e

# Đảm bảo các thư mục uploads tồn tại và thuộc sở hữu của user nodejs
mkdir -p /app/uploads/avatars /app/uploads/thumbnails /app/uploads/general
chown -R nodejs:nodejs /app/uploads
chmod -R 775 /app/uploads

# Thực thi CMD dưới quyền user nodejs
exec su-exec nodejs "$@"
