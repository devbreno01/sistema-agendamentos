# Control Attendances

## Descrição

API REST desenvolvida em PHP com Laravel para gerenciar o fluxo de chamados de suporte e solicitações internas.

## Ferramentas
- PHP 
- Laravel
- PostgresSQL
- Docker

## Requisitos

O objetivo é gerenciar o fluxo de chamados de suporte ou solicitações internas.

Operações esperadas:

- Cadastro de Setores
- Cadastro de Prioridades (ex: Baixa, Média, Alta) com tempo estimado em horas
- Cadastro do Chamado, vinculando ao Setor e à Prioridade (status inicial: "Aberto")
- Atendimento (Check-in): registrar data e hora de início
  - Não pode iniciar um chamado já finalizado ou cancelado
- Finalização (Check-out): registrar data/hora de término e uma breve solução
  - Só pode finalizar chamados que foram iniciados
- Listagem de chamados com Setor, Prioridade, Status atual e Tempo Total de Atendimento
- Destacar chamados que ultrapassarem o tempo estimado da prioridade

## Arquitetura e Decisões Técnicas

- Utilizei MultiTenancy em Single Database, pensado para um projeto que compartilha a mesma infraestrutura e dados em um único banco, isolando os inquilinos por contexto de tenant.
-Utilizei Services e Repositories para separar a lógica e persistência de dados da controller 
- Laravel Sanctum para autenticação e geração de token
- Modelos principais: `Tenant`, `User`, `Sector`, `Priority`, `Ticket`, `Attendance`.
- Regras de negócio implementadas para garantir que:
  - um chamado não pode ser iniciado se já estiver finalizado ou cancelado;
  - um chamado só pode ser finalizado se já tiver sido iniciado;
  - o tempo total de atendimento seja calculado corretamente e chamados atrasados sejam destacados.

## Arquitetura de pastas

A estrutura principal do projeto segue a organização padrão do Laravel com separação clara entre rotas, modelos, controllers, services e repositories.

- `routes/api.php` - arquivo principal das rotas da API. Aqui ficam definidos os endpoints que consumirão os controllers.
- `app/Models/` - onde ficam as models do sistema, incluindo `Tenant`, `User`, `Sector`, `Priority`, `Ticket` e `Attendance`.
- `app/Http/Controllers/` - contém as controllers responsáveis por receber as requisições HTTP e coordenar as ações de negócio.
- `app/Services/` - contém a camada de serviços com a lógica de negócio, usada para separar regras e processos das controllers.
- `app/Repositories/` - contém a camada de acesso a dados e persistência, centralizando as consultas e operações sobre as models.

## ENDPOINTS
- Adicionei uma collection no repositório chamada `w5i-attendance.postman_collection.json` que pode ser aberta no Postman ou Insomnia.
- Dentro da collection há todos os endpoints e payloads da API.

## Requisitos para rodar o projeto

- PHP 8.3 ou superior
- Composer
- Docker

## Como rodar o projeto

1. Clone o repositório:

```bash
git clone https://github.com/devbreno01/control-attendances-api.git
cd control-attendances-api
```

2. Instale as dependências do Composer:

```bash
composer install
```

3. Copie o arquivo de ambiente e configure as variáveis:

```bash
copy .env.example .env
```
4. Suba o banco de dados com docker compose 
```bash
docker-compose up -d 
```
5. Ajuste as configurações de banco de dados em `.env`:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5436
DB_DATABASE=control-attendances
DB_USERNAME=seu_user
DB_PASSWORD=sua_senha
```

6. Gere a chave da aplicação:

```bash
php artisan key:generate
```

7. Execute as migrations:

```bash
php artisan migrate --seed
```
8. Execute as seeds:
```bash
php artisan db:seed --class=DatabaseSeeder
```
9. Inicie o servidor de desenvolvimento:

```bash
php artisan serve
```

10. Acesse a API em:

```text
http://127.0.0.1:8000
```

## Lógica que acrescentei 
- Rota para média de tempo dos atendimentos
- Rota GET para listagem de todos os atendimentos com  status cancelados
- Tabela `attendance_events` para registrar log dos atendimentos, assim pode-se ter as informações com data e hora de quando houve a alteração de atendimento, como: Pausa, cancelamento e etc


## Como funciona a estrutura de  multitenancy na aplicação? 
- Utilizei recursos do Laravel para implementar a estrutura de multitenancy. Todas as entidades possuem a coluna tenant_id, e aplico um global scope nas models para garantir que os dados sejam sempre filtrados de acordo com o tenant_id do usuário autenticado.
- No cadastro de um usuário, utilizo um observer para que, ao criar um novo user, seja automaticamente criado um registro na entidade Tenant. Em seguida, o tenant_id gerado é associado ao usuário recém-criado.


## Futuras melhorias para o projeto 
- Criar e rodar testes unitários e de feature
- Rodar o projeto inteiro em Docker, não a dependência do banco de dados
- Criar um frontend para aplicação 

