# Sistema de Agendamentos

Sistema full stack para gerenciamento de consultas. A aplicação permite cadastrar usuários, autenticar com token, criar e gerenciar agendamentos e controlar o fluxo de status entre **Agendada**, **Realizada** e **Cancelada**.

O repositório é dividido em:

- `api/`: API REST desenvolvida com Laravel e Laravel Sanctum.
- `web/`: interface desenvolvida com React, TypeScript, Tailwind CSS e componentes shadcn/ui.

## Funcionalidades

- Cadastro e autenticação de usuários.
- Isolamento dos dados por tenant.
- Listagem, busca e filtro de consultas.
- Cadastro, edição, reagendamento e exclusão definitiva.
- Cancelamento e conclusão de consultas.
- Validação de CPF, datas e transições de status.
- Bloqueio de mais de uma consulta agendada para o mesmo CPF.

## Requisitos

- PHP 8.3 ou superior.
- Composer.
- Node.js 22 ou superior e npm.
- PostgreSQL 15 ou Docker com Docker Compose.

## Instalação

Clone o repositório:

```bash
git clone https://github.com/devbreno01/sistema-agendamentos.git
cd sistema-agendamentos
```

### 1. Banco de dados

O projeto possui um `docker-compose.yml` para executar o PostgreSQL. Entre na pasta da API, crie o arquivo de ambiente e defina as credenciais usadas pelo container:

```bash
cd api
cp .env.example .env
```

Adicione ou ajuste as seguintes variáveis em `api/.env`:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5439
DB_DATABASE=agendamentos
DB_USERNAME=postgres
DB_PASSWORD=postgres

DB_USER=postgres
```

Suba o banco:

```bash
docker compose up -d
```

Também é possível utilizar uma instalação local do PostgreSQL, ajustando as variáveis `DB_*` conforme o ambiente.

### 2. API Laravel

Ainda dentro de `api/`, instale as dependências, gere a chave da aplicação e execute as migrations:

```bash
composer install
php artisan key:generate
php artisan migrate
```

Inicie a API:

```bash
php artisan serve
```

A API ficará disponível em `http://localhost:8000`.

Para executar os testes:

```bash
php artisan test
```

### 3. Frontend React

Em outro terminal, acesse a pasta do frontend:

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

O frontend utiliza por padrão a seguinte configuração:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

O terminal do Vite mostrará o endereço de acesso, normalmente `http://localhost:5173`.

## Arquitetura e patterns

A API separa as responsabilidades em camadas:

```text
Request → Controller → DTO → Service → Repository → Model
```

### Repository Pattern

Os repositories centralizam o acesso ao banco de dados. Consultas e operações de persistência ficam fora dos controllers e services, facilitando a reutilização e a manutenção do código.

O `AbstractRepository` reúne as operações comuns de CRUD, enquanto repositories específicos, como `AppointmentRepository`, possuem consultas relacionadas à entidade. Por exemplo, é nele que a aplicação verifica se já existe uma consulta agendada para determinado CPF.

### DTO — Data Transfer Object

Os DTOs transportam os dados validados entre a camada HTTP e a camada de serviço. Dessa forma, o service não depende diretamente do objeto da requisição e recebe somente os dados necessários para executar a operação.

O `AppointmentDto`, por exemplo, transforma os dados do `AppointmentRequest` em uma estrutura própria para criação ou atualização de consultas.

### Service Layer

Os services concentram as regras de negócio. O `AppointmentService` é responsável por regras como:

- impedir agendamentos no passado;
- impedir mais de uma consulta com status `scheduled` para o mesmo CPF e tenant;
- permitir reagendamento somente enquanto a consulta estiver agendada;
- impedir alterações em consultas realizadas ou canceladas;
- permitir a conclusão apenas no dia marcado;
- garantir que as transições de status sejam irreversíveis.

Com essa separação, os controllers ficam responsáveis apenas por receber a requisição, chamar o service e devolver a resposta HTTP.

## Multitenancy com banco único

O projeto utiliza a estratégia **single database multitenancy**. Todos os tenants compartilham o mesmo banco e as mesmas tabelas, enquanto a coluna `tenant_id` identifica o proprietário de cada registro.

O isolamento funciona da seguinte forma:

1. Ao cadastrar um usuário, o `UserObserver` cria automaticamente um tenant e associa seu `tenant_id` ao novo usuário.
2. Após o login, o Laravel Sanctum identifica o usuário pelo token enviado na requisição.
3. As models vinculadas a um tenant herdam de `BaseModel`.
4. O `TenantScope` adiciona automaticamente às consultas um filtro pelo `tenant_id` do usuário autenticado.
5. Ao criar um agendamento, o service preenche o `tenant_id` com o tenant do usuário atual.

Assim, usuários de tenants diferentes utilizam as mesmas tabelas, mas visualizam e alteram somente seus próprios registros.

## Tecnologias

### Backend

- PHP 8.3+
- Laravel 13
- Laravel Sanctum
- PostgreSQL
- PHPUnit

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui e Radix UI
