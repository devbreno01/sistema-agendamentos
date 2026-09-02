# Horizon Web

Frontend React do sistema de agendamentos Horizon.

## Executar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

Por padrão, o frontend consome a API em `http://localhost:8000/api`. Para alterar,
configure `VITE_API_URL` no arquivo `.env`.

## Comandos

- `npm run dev`: ambiente de desenvolvimento
- `npm run build`: build de produção e verificação TypeScript
- `npm run lint`: análise estática do código
