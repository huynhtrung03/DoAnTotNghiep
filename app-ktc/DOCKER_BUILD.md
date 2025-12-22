# Build và Deploy app-ktc với Docker

## 📋 Tổng quan
app-ktc là React admin dashboard sử dụng Vite, được đóng gói với Nginx để serve static files.

## 🔧 Cấu hình API URL

App sử dụng environment variable `VITE_API_URL` để cấu hình backend API:

```typescript
// Trong code
const URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
```

## 🐳 Build Docker Image

### 1. Build với default URL (localhost - cho dev)
```bash
cd app-ktc
docker build -t tinhsoma/app-ktc:v1 .
```

### 2. Build với production URL
```bash
docker build \
  --build-arg VITE_API_URL=http://178.128.112.116:80/api \
  -t tinhsoma/app-ktc:v1 \
  .
```

### 3. Push lên Docker Hub
```bash
docker push tinhsoma/app-ktc:v1
```

## 🚀 Chạy container

### Chạy standalone
```bash
docker run -d \
  --name app-ktc \
  -p 8080:80 \
  tinhsoma/app-ktc:v1
```

Truy cập: http://localhost:8080

### Chạy với docker-compose

Thêm vào `docker-compose.yml`:

```yaml
services:
  app-ktc:
    image: tinhsoma/app-ktc:v1
    container_name: app-ktc
    restart: always
    ports:
      - '8080:80'
    depends_on:
      - app  # Backend service
```

## 🔍 Kiểm tra

### Health check
```bash
curl http://localhost:8080/health
# Output: healthy
```

### Kiểm tra logs
```bash
docker logs app-ktc
```

### Kiểm tra API connection
1. Mở browser: http://localhost:8080
2. Mở DevTools Console
3. Kiểm tra network requests đến backend API

## 📝 Lưu ý

- **Vite Environment Variables**: Chỉ variables bắt đầu với `VITE_` mới được expose ra client
- **Build Time vs Runtime**: VITE_API_URL được set lúc build, không thể thay đổi runtime
- **Rebuild Required**: Nếu thay đổi API URL, phải rebuild lại image mới
- **Nginx Cache**: Static assets được cache 1 năm để optimize performance
- **React Router**: Nginx config hỗ trợ client-side routing (history mode)

## 🔄 Update API URL

Nếu cần thay đổi backend URL:

1. Rebuild với URL mới:
```bash
docker build --build-arg VITE_API_URL=http://NEW_URL/api -t tinhsoma/app-ktc:v2 .
```

2. Push version mới:
```bash
docker push tinhsoma/app-ktc:v2
```

3. Update docker-compose.yml:
```yaml
app-ktc:
  image: tinhsoma/app-ktc:v2  # ← Update version
```

4. Redeploy:
```bash
docker compose pull app-ktc
docker compose up -d app-ktc
```

## 📦 Files tạo mới

- `Dockerfile` - Multi-stage build với Node 18 + Nginx Alpine
- `.dockerignore` - Exclude node_modules và build artifacts
- `nginx.conf` - Nginx config với gzip, caching, React Router support
- Code updates:
  - `src/admin/lib/api-client-ad.ts` - Sử dụng VITE_API_URL
  - `src/admin/service/ReactQueryAds.ts` - Sử dụng VITE_API_URL

## ✅ Checklist trước khi deploy

- [ ] Test build locally: `pnpm run build`
- [ ] Kiểm tra `.env` không bị commit
- [ ] Verify API URL đúng
- [ ] Test Docker image local trước khi push
- [ ] Update version tag trong docker-compose.yml
- [ ] Backup database trước khi deploy
