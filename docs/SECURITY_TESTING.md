# 🔒 Comandos de Testing de Seguridad

Este archivo contiene comandos útiles para probar las características de seguridad implementadas.

## ✅ Verificación Rápida

```bash
# Health check
curl http://localhost:5000/health | jq .

# Verificar security headers
curl -I http://localhost:5000/health
```

## 🚫 Rate Limiting Tests

### Test 1: Login Rate Limiting (5 intentos/15min)
```bash
# Debería bloquear al 6to intento con HTTP 429
for i in {1..6}; do 
  echo "Intento $i:"
  curl -w "\nHTTP Status: %{http_code}\n" \
    -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"fake@test.com","password":"wrong"}' 
  echo "---"
done
```

### Test 2: Register Rate Limiting (3 registros/hora)
```bash
# Debería bloquear al 4to intento
for i in {1..4}; do 
  echo "Intento $i:"
  curl -w "\nHTTP Status: %{http_code}\n" \
    -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@test.com\",\"password\":\"Test1234!\",\"name\":\"Test User $i\",\"role\":\"user\"}"
  echo "---"
done
```

## 🛡️ Sanitization Tests

### Test 3: NoSQL Injection Prevention
```bash
# Intento de bypass con operadores MongoDB
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$ne":null},"password":{"$ne":null}}' | jq .

# Debería sanitizar los caracteres $ y no permitir el login
```

### Test 4: XSS Prevention
```bash
# Intento de XSS en registro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"<script>alert(\"XSS\")</script>",
    "email":"xss@test.com",
    "password":"Test1234!",
    "role":"user"
  }' | jq .

# El script debe ser sanitizado/removido
```

### Test 5: Path Traversal
```bash
# Intento de path traversal
curl "http://localhost:5000/../../etc/passwd" -I

# Debería retornar 404
```

## 🌐 CORS Tests

### Test 6: CORS con origen permitido
```bash
curl -I http://localhost:5000/health \
  -H "Origin: http://localhost:3000"

# Debería incluir:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Credentials: true
```

### Test 7: CORS con origen NO permitido
```bash
curl -I http://localhost:5000/health \
  -H "Origin: http://malicious-site.com"

# NO debería incluir Access-Control-Allow-Origin
```

## 🔐 Security Headers Tests

### Test 8: Helmet Headers
```bash
curl -I http://localhost:5000/health | grep -i \
  -e "x-frame-options" \
  -e "x-content-type-options" \
  -e "strict-transport-security" \
  -e "content-security-policy" \
  -e "x-xss-protection"

# Debería mostrar todos estos headers
```

## 🔢 HTTP Parameter Pollution Test

### Test 9: HPP con múltiples parámetros
```bash
# Intentar pollution con múltiples city params
curl "http://localhost:5000/api/offices?city=Madrid&city=Barcelona&city=Valencia" | jq .

# HPP debe manejar esto correctamente (último valor o array si está en whitelist)
```

## 📊 Rate Limiting por Endpoint

### Stats Endpoint (30/15min)
```bash
# Necesita autenticación - primero obtén un token
TOKEN="your-admin-token-here"

# Luego prueba el rate limit
for i in {1..31}; do 
  echo "Request $i:"
  curl -w "HTTP %{http_code}\n" \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:5000/api/users/stats
done
```

### Create Report (20/hora)
```bash
# Necesita autenticación
TOKEN="your-user-token-here"

# Intenta crear 21 reportes
for i in {1..21}; do 
  echo "Report $i:"
  curl -w "HTTP %{http_code}\n" \
    -X POST http://localhost:5000/api/reports \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "title":"Test Report '$i'",
      "description":"Testing rate limiting",
      "priority":"low",
      "category":"other"
    }'
done
```

### Delete Operations (5/hora)
```bash
# Necesita autenticación de admin
ADMIN_TOKEN="your-admin-token-here"
REPORT_ID="some-report-id"

# Intenta 6 deletes
for i in {1..6}; do 
  echo "Delete attempt $i:"
  curl -w "HTTP %{http_code}\n" \
    -X DELETE "http://localhost:5000/api/reports/$REPORT_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN"
done
```

## 🔍 Security Logging Test

### Test 10: Detectar patrones sospechosos
```bash
# Los siguientes requests deberían generar logs de seguridad

# 1. SQL Injection attempt
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com OR 1=1--","password":"anything"}'

# 2. MongoDB operator in query
curl "http://localhost:5000/api/offices?name[\$ne]=null"

# 3. XSS in URL
curl "http://localhost:5000/api/offices?search=<script>alert(1)</script>"

# Verifica los logs del backend:
docker logs servicedesk-backend | grep "Suspicious request"
```

## 🧪 Test Completo Automatizado

```bash
#!/bin/bash
# Script de testing completo

echo "🔒 INICIANDO TESTS DE SEGURIDAD..."
echo ""

PASS=0
FAIL=0

# Test 1: Health check
echo "Test 1: Health Check"
if curl -sf http://localhost:5000/health > /dev/null; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL"
  ((FAIL++))
fi

# Test 2: Security Headers
echo "Test 2: Security Headers"
HEADERS=$(curl -sI http://localhost:5000/health)
if echo "$HEADERS" | grep -q "X-Frame-Options" && \
   echo "$HEADERS" | grep -q "X-Content-Type-Options" && \
   echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL"
  ((FAIL++))
fi

# Test 3: CORS
echo "Test 3: CORS Headers"
CORS=$(curl -sI http://localhost:5000/health -H "Origin: http://localhost:3000")
if echo "$CORS" | grep -q "Access-Control-Allow-Origin"; then
  echo "✅ PASS"
  ((PASS++))
else
  echo "❌ FAIL"
  ((FAIL++))
fi

# Test 4: Rate Limiting
echo "Test 4: Rate Limiting"
# Hacer 6 requests rápidos
COUNT=0
for i in {1..6}; do
  CODE=$(curl -so /dev/null -w "%{http_code}" \
    -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"fake@test.com","password":"wrong"}')
  if [ "$CODE" = "429" ]; then
    ((COUNT++))
  fi
done

if [ $COUNT -ge 1 ]; then
  echo "✅ PASS (Rate limited after multiple attempts)"
  ((PASS++))
else
  echo "❌ FAIL"
  ((FAIL++))
fi

echo ""
echo "========================================="
echo "RESULTADOS: $PASS PASS, $FAIL FAIL"
echo "========================================="
```

## 📝 Notas

- Los tests de rate limiting pueden requerir esperar 15-60 minutos entre ejecuciones
- Para resetear rate limits en desarrollo, reinicia el backend: `docker-compose restart backend`
- Los security logs se pueden ver con: `docker logs servicedesk-backend -f`
- Para testing en producción, considera usar herramientas como:
  - OWASP ZAP
  - Burp Suite
  - Postman Collection con tests automatizados

## 🚨 Limpieza después de Tests

```bash
# Limpiar rate limiting (reiniciar backend)
docker-compose restart backend

# Ver logs de seguridad
docker logs servicedesk-backend | grep -i "suspicious\|blocked\|denied"

# Limpiar base de datos de test (opcional)
docker exec -it servicedesk-mongodb mongosh servicedesk --eval "db.users.deleteMany({email: /^test/})"
```

## ✅ Checklist de Seguridad

Después de ejecutar todos los tests, verifica:

- [ ] Health endpoint responde correctamente
- [ ] Security headers presentes (X-Frame-Options, CSP, HSTS, etc.)
- [ ] CORS solo permite orígenes en whitelist
- [ ] Rate limiting bloquea después de límite
- [ ] NoSQL injection sanitizada
- [ ] XSS scripts removidos
- [ ] Path traversal bloqueado
- [ ] HTTP Parameter Pollution manejada
- [ ] Security logger detecta patrones sospechosos
- [ ] Todos los endpoints requieren autenticación apropiada
