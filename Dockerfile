# MCP server công khai: chỉ đọc nội dung đã duyệt, không có secret ứng dụng.
FROM node:24-alpine
# Liên kết image với repo để GITHUB_TOKEN của workflow deploy có quyền push lên GHCR.
LABEL org.opencontainers.image.source=https://github.com/hvngroup/hvn-ai-marketplace-staging
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY shared ./shared
COPY scripts ./scripts
COPY server ./server
COPY catalog ./catalog
COPY config ./config
COPY content ./content
COPY LICENSE-CONTENT.md ./
# Sinh chỉ mục nội dung ngay trong image để image luôn khớp với commit.
# Mã và nội dung thuộc root; user runtime chỉ đọc.
RUN node scripts/build.ts
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "server/main.ts"]
