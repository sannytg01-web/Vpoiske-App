#!/bin/bash
set -e

echo "Running Certbot renewal..."
docker run -it --rm --name certbot \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/www/vlubvi:/var/www/vlubvi \
    certbot/certbot renew --webroot -w /var/www/vlubvi

echo "Reloading Nginx..."
docker-compose -f /var/app/vlubvi/docker-compose.prod.yml exec nginx nginx -s reload
echo "Done."
