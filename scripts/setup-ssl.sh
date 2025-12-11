#!/bin/bash

# Script para configurar SSL con Let's Encrypt en producción
# Uso: ./scripts/setup-ssl.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Service Desk - Configuración de SSL con Let's Encrypt${NC}"
echo "=========================================================="
echo ""

# Verificar que el script se ejecuta desde el directorio raíz del proyecto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ Error: Este script debe ejecutarse desde el directorio raíz del proyecto${NC}"
    echo "   Ubicación actual: $(pwd)"
    exit 1
fi

# Solicitar información
read -p "Ingresa tu dominio (ej: example.com): " DOMAIN
read -p "Ingresa tu email para Let's Encrypt: " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Error: Dominio y email son requeridos${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Configuración:${NC}"
echo "   Dominio: $DOMAIN"
echo "   Email: $EMAIL"
echo ""

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
    exit 1
fi

# Crear directorios necesarios
echo -e "${BLUE}📁 Creando directorios...${NC}"
mkdir -p certbot/conf certbot/www nginx/conf.d

# Actualizar nginx config con el dominio
echo -e "${BLUE}🔧 Configurando nginx con dominio $DOMAIN...${NC}"
sed -i.bak "s/example\.com/$DOMAIN/g" nginx/conf.d/servicedesk.conf

# Crear archivo .env.production si no existe
if [ ! -f ".env.production" ]; then
    echo -e "${BLUE}📝 Creando .env.production...${NC}"
    cp .env.example .env.production
    sed -i "s/DOMAIN=.*/DOMAIN=$DOMAIN/" .env.production
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita .env.production con tus credenciales reales${NC}"
    echo "   nano .env.production"
    echo ""
    read -p "Presiona Enter cuando hayas configurado .env.production..."
fi

# Levantar servicios (sin nginx primero)
echo -e "${BLUE}🚀 Iniciando servicios backend...${NC}"
docker-compose -f docker-compose.prod.yml up -d mongodb backend frontend

# Esperar a que el backend esté ready
echo -e "${BLUE}⏳ Esperando a que el backend esté listo...${NC}"
sleep 10

# Obtener certificado staging (testing)
echo ""
echo -e "${YELLOW}🔒 Paso 1: Obteniendo certificado STAGING (testing)...${NC}"
echo "   Esto permite probar la configuración sin límites de rate"
echo ""

docker-compose -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --staging \
  --cert-name "$DOMAIN" \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --verbose

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificado staging obtenido exitosamente${NC}"
else
    echo -e "${RED}❌ Error al obtener certificado staging${NC}"
    echo ""
    echo "Posibles causas:"
    echo "  1. El dominio no apunta a este servidor"
    echo "  2. El puerto 80 no está accesible desde internet"
    echo "  3. Configuración incorrecta de nginx"
    echo ""
    echo "Verifica:"
    echo "  - DNS: dig $DOMAIN"
    echo "  - Puerto 80: nc -zv $(curl -s ifconfig.me) 80"
    exit 1
fi

# Iniciar nginx ahora
echo -e "${BLUE}🌐 Iniciando nginx...${NC}"
docker-compose -f docker-compose.prod.yml up -d nginx

# Esperar a que nginx esté listo
sleep 5

# Verificar que nginx esté corriendo
if ! docker ps | grep -q servicedesk-nginx; then
    echo -e "${RED}❌ Error: Nginx no está corriendo${NC}"
    docker-compose -f docker-compose.prod.yml logs nginx
    exit 1
fi

# Testing del certificado staging
echo ""
echo -e "${YELLOW}🧪 Testing del certificado staging...${NC}"
echo "   Abre en tu navegador: https://$DOMAIN"
echo "   Deberías ver un error de certificado no confiable (es normal)"
echo ""
read -p "¿El sitio cargó correctamente (ignorando el warning SSL)? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Certificado staging falló${NC}"
    echo ""
    echo "Debugging:"
    docker-compose -f docker-compose.prod.yml logs nginx
    exit 1
fi

# Obtener certificado REAL
echo ""
echo -e "${GREEN}🎉 ¡Staging funcionó! Obteniendo certificado REAL...${NC}"
echo ""

docker-compose -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  --cert-name "$DOMAIN" \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --verbose

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificado SSL REAL obtenido exitosamente${NC}"
else
    echo -e "${RED}❌ Error al obtener certificado real${NC}"
    echo ""
    echo "Si alcanzaste el rate limit de Let's Encrypt (5 por semana):"
    echo "  - Espera 1 semana"
    echo "  - O usa el certificado staging para testing"
    exit 1
fi

# Reiniciar nginx para usar el certificado real
echo -e "${BLUE}🔄 Reiniciando nginx con certificado real...${NC}"
docker-compose -f docker-compose.prod.yml restart nginx

# Esperar reinicio
sleep 5

# Verificación final
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ¡SSL configurado exitosamente!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🌐 Tu sitio ahora está disponible en:${NC}"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo "   1. Verifica que el sitio carga correctamente"
echo "   2. Prueba SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "   3. Prueba security headers: https://securityheaders.com/?q=$DOMAIN"
echo ""
echo -e "${BLUE}🔄 Renovación automática:${NC}"
echo "   Los certificados se renovarán automáticamente cada 12 horas"
echo "   Ver logs: docker logs servicedesk-certbot"
echo ""
echo -e "${YELLOW}⚠️  Recordatorios:${NC}"
echo "   - Backup de certificados: certbot/conf"
echo "   - Certificados válidos por 90 días"
echo "   - Rate limit Let's Encrypt: 5 certificados/semana por dominio"
echo ""
echo -e "${GREEN}🎉 ¡Disfruta de tu sitio seguro con HTTPS!${NC}"
