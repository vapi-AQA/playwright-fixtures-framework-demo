FROM mcr.microsoft.com/playwright:v1.52.0

ENV CI=true
WORKDIR /app

USER root
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund && chown -R pwuser:pwuser /app

COPY --chown=pwuser:pwuser . .
USER pwuser

CMD ["npm", "test"]
