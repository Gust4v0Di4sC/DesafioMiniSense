# MiniSense API

API RESTful para gerenciamento de dispositivos IoT, streams de dados e medições
do desafio MiniSense. O projeto usa NestJS, TypeScript, Prisma ORM, SQLite e
migrações versionadas.

## Resumo da entrega

- API implementada em NestJS com os endpoints pedidos no desafio.
- Documentação interativa em Swagger/OpenAPI em `/docs`.
- Banco local SQLite controlado por Prisma e migração versionada.
- Testes unitários e e2e cobrindo os fluxos principais da API.
- Workflow de CI em `.github/workflows/ci.yml`.

## Requisitos

- Node.js 20 ou superior
- npm

## Instalação e execução

Clone o repositório e entre na pasta da API:

```bash
git clone <url-do-repositorio>
cd DesafioMiniSense/minisenseapi
```

Instale as dependências:

```bash
npm install
```

Configure o banco local. O exemplo abaixo usa o arquivo padrão do projeto no
Windows PowerShell:

```powershell
$env:DATABASE_URL="file:../data/minisense.sqlite"
npm run db:init
npm run db:seed
npm run start:dev
```

Em bash/zsh:

```bash
export DATABASE_URL="file:../data/minisense.sqlite"
npm run db:init
npm run db:seed
npm run start:dev
```

A API sobe por padrão em `http://localhost:3000` e o terminal mostra os links:

```text
API rodando em: http://localhost:3000
Documentação Swagger: http://localhost:3000/docs
```

Para desenvolvimento, use qualquer uma das opções abaixo:

```bash
npm run start:dev
npm run start dev
```

Documentação OpenAPI/Swagger:

```text
http://localhost:3000/docs
```

Também é possível consultar o contrato OpenAPI em JSON:

```text
http://localhost:3000/docs-json
```

Arquivo de banco local padrão:

```text
data/minisense.sqlite
```

Um exemplo de variável de ambiente também está em `.env.example`.

## Docker

Também é possível subir a API com Docker Compose:

```bash
docker compose up --build
```

O Compose sobe dois serviços:

- `database`: prepara o volume SQLite com `prisma db push` e executa
  `npm run db:seed`.
- `api`: expõe a API em `http://localhost:3000` usando o banco preparado no
  volume compartilhado.

Documentação Swagger no ambiente Docker:

```text
http://localhost:3000/docs
```

Para recriar a base do zero:

```bash
docker compose down -v
docker compose up --build
```

## Build e testes

```bash
npm run build
npm run lint:check
npm run test
npm run test:e2e
```

### Cobertura dos testes

Os testes focam nos comportamentos essenciais do desafio:

- Criação de dispositivo.
- Criação de stream.
- Publicação de medição.
- Consulta de dispositivo com as 5 medições mais recentes por stream.
- Consulta de stream com todas as medições.
- Erro quando dispositivo, stream, usuário ou unidade de medida não existem.
- Erros de validação para payloads inválidos.
- Execução do seed demo via `npm run db:seed`.

Os testes unitários ficam nos services e os testes e2e usam Supertest para
validar os contratos HTTP reais da API.

## CI

O workflow em `.github/workflows/ci.yml` executa em push para `main` e em pull
requests:

- `npm ci`
- `npm run lint:check`
- `npm run build`
- `npm test`
- `npm run test:e2e`

Scripts Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
npm run prisma:studio
```

As migrações ficam em `prisma/migrations`.

Observação: `npm run db:init` aplica a migração SQL versionada. O script
`npm run prisma:deploy` também está disponível para ambientes onde o Prisma
Migrate esteja funcionando normalmente.

## Seed inicial

Na inicialização, a aplicação cria via upsert os dados mínimos para a API
funcionar:

- Usuário padrão: `id = 1`, `name = Default User`
- Unidades de medida:
  - `1`: `°C` - Celsius
  - `2`: `mg/m³` - Miligrama por metro cúbico
  - `3`: `hPa` - Hectopascal
  - `4`: `lux` - Lux
  - `5`: `%` - Porcentagem

Para carregar uma base demo completa, rode:

```bash
npm run db:seed
```

O comando também está disponível como:

```bash
npm run prisma:seed
npx prisma db seed
```

O seed demo cria:

- 1 usuário demo.
- 5 unidades de medida.
- 2 dispositivos sensores.
- 5 streams distribuídas entre os dispositivos.
- 22 medições, incluindo streams com mais de 5 leituras para validar a regra de
  medições recentes.

## Estrutura do projeto

A estrutura foi mantida feature-first para evitar excesso de camadas no escopo
do desafio:

```text
src/
  common/                 DTOs de resposta e helpers compartilhados
  prisma/                 PrismaService e seed inicial
  modules/
    measurement-units/    GET /measurement-units
    sensor-devices/       cadastro e consulta de dispositivos sensores
    data-streams/         cadastro de streams e publicação de medições
```

Cada feature segue um fluxo NestJS direto:

```text
Controller -> Service -> Repository -> Prisma
```

O controller cuida do contrato HTTP, o service concentra regras de aplicação e o
repository isola as consultas Prisma. Essa separação atende SOLID sem criar
interfaces, tokens e mappers extras que não trazem ganho real para este desafio.

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/measurement-units` | Consulta as unidades de medida fixas. |
| `GET` | `/sensor-devices` | Consulta os dispositivos do usuário padrão. |
| `GET` | `/sensor-devices/:deviceKey` | Consulta um dispositivo por key, incluindo as 5 medições mais recentes de cada stream. |
| `GET` | `/data-streams/:streamKey` | Consulta uma stream por key, incluindo todas as suas medições. |
| `POST` | `/sensor-devices` | Registra um dispositivo para o usuário padrão. |
| `POST` | `/sensor-devices/:deviceKey/streams` | Registra uma stream para um dispositivo. |
| `POST` | `/data-streams/:streamKey/measurements` | Publica uma medição em uma stream. |

Aliases compatíveis:

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/users/:userId/devices` | Consulta os dispositivos de um usuário específico. |
| `GET` | `/devices/:deviceKey` | Alias de `/sensor-devices/:deviceKey`. |
| `GET` | `/streams/:streamKey` | Alias de `/data-streams/:streamKey`. |
| `POST` | `/users/:userId/devices` | Registra um dispositivo para um usuário específico. |
| `POST` | `/devices/:deviceKey/streams` | Alias de `/sensor-devices/:deviceKey/streams`. |
| `POST` | `/streams/:streamKey/measurements` | Alias de `/data-streams/:streamKey/measurements`. |

### Consultar unidades de medida

```http
GET /measurement-units
```

Resposta:

```json
[
  { "id": 1, "symbol": "°C", "description": "Celsius" },
  { "id": 2, "symbol": "mg/m³", "description": "Miligrama por metro cúbico" },
  { "id": 3, "symbol": "hPa", "description": "Hectopascal" },
  { "id": 4, "symbol": "lux", "description": "Lux" },
  { "id": 5, "symbol": "%", "description": "Porcentagem" }
]
```

### Consultar dispositivos de um usuário

```http
GET /sensor-devices
```

Resposta:

```json
[
  {
    "id": 1,
    "key": "10dd35008a0f4d838c3dc22856660928",
    "label": "sensor 001",
    "description": "Isaac's Room control",
    "streams": [
      {
        "id": 1,
        "key": "b4ea3ba494644200b679ac593f55cb87",
        "label": "temperature",
        "unitId": 1,
        "deviceId": 1,
        "measurementCount": 84
      }
    ]
  }
]
```

### Registrar dispositivo

```http
POST /sensor-devices
Content-Type: application/json
```

Requisição:

```json
{
  "label": "Kitchen's freezer sensor (Arduino)",
  "description": "Kitchen's freezer sensor (Arduino)"
}
```

Resposta:

```json
{
  "id": 2,
  "key": "27b26e48cd674cc38ec45808cf48fa07",
  "label": "Kitchen's freezer sensor (Arduino)",
  "description": "Kitchen's freezer sensor (Arduino)"
}
```

### Consultar dispositivo por key

```http
GET /sensor-devices/{deviceKey}
```

A consulta individual retorna as 5 medições mais recentes de cada stream.

Resposta:

```json
{
  "id": 2,
  "key": "27b26e48cd674cc38ec45808cf48fa07",
  "label": "Kitchen's freezer sensor (Arduino)",
  "description": "Kitchen's freezer sensor (Arduino)",
  "streams": [
    {
      "id": 2,
      "key": "8961bd9a4d1e439ebf3b86af5b9d5c1f",
      "label": "temperature",
      "unitId": 1,
      "deviceId": 2,
      "measurementCount": 19,
      "measurements": [
        { "timestamp": 1506455591, "value": -6.56 },
        { "timestamp": 1506455566, "value": -6.54 }
      ]
    }
  ]
}
```

### Registrar stream em um dispositivo

```http
POST /sensor-devices/{deviceKey}/streams
Content-Type: application/json
```

Requisição:

```json
{
  "label": "temperature",
  "unitId": 1
}
```

Resposta:

```json
{
  "id": 2,
  "key": "8961bd9a4d1e439ebf3b86af5b9d5c1f",
  "label": "temperature",
  "unitId": 1,
  "deviceId": 2,
  "measurementCount": 0
}
```

### Consultar dados de uma stream

```http
GET /data-streams/{streamKey}
```

Retorna todas as medições da stream, ordenadas da mais recente para a mais
antiga.

Resposta:

```json
{
  "id": 2,
  "key": "8961bd9a4d1e439ebf3b86af5b9d5c1f",
  "label": "temperature",
  "unitId": 1,
  "deviceId": 2,
  "measurementCount": 19,
  "measurements": [
    { "timestamp": 1506455591, "value": -6.56 },
    { "timestamp": 1506455566, "value": -6.54 }
  ]
}
```

### Publicar medição em uma stream

```http
POST /data-streams/{streamKey}/measurements
Content-Type: application/json
```

Requisição:

```json
{
  "timestamp": 1506521102,
  "value": 28.5
}
```

Resposta:

```json
{
  "id": 123,
  "timestamp": 1506521102,
  "value": 28.5,
  "unitId": 1
}
```

## Modelagem do domínio

Entidades principais:

- `User`: proprietário dos dispositivos.
- `SensorDevice`: dispositivo físico associado a um usuário. Recebe `id` do
  banco e `key` hexadecimal gerada pela aplicação.
- `DataStream`: fluxo de dados de um dispositivo, vinculado a uma unidade de
  medida e habilitado por padrão.
- `MeasurementUnit`: unidade fixa usada por streams e medições.
- `SensorData`: medição publicada em uma stream. Armazena `unitId` no momento do
  recebimento para preservar a unidade histórica da leitura.

Decisões de implementação:

- As rotas principais usam o usuário padrão `id = 1`, criado pela seed, porque o
  desafio não exige autenticação. As rotas com `/users/:userId/devices` foram
  mantidas como aliases para consultas por usuário específico.
- O schema relacional fica em `prisma/schema.prisma`.
- A migração inicial fica em `prisma/migrations/20260610000000_init`.
- `measurementCount` é calculado via `_count` do Prisma.
- `GET /sensor-devices/:deviceKey` limita as medições por stream a 5 itens.
- `GET /data-streams/:streamKey` retorna todas as medições da stream.
- Validação de payloads usa `ValidationPipe` global com `whitelist` e
  `forbidNonWhitelisted`.

## Organização do código

- Controllers definem rotas HTTP, parâmetros, bodies e documentação Swagger.
- Services concentram regras de aplicação, validam existência de entidades e
  disparam erros HTTP (`404`, `400`) quando necessário.
- Repositories isolam consultas Prisma e formatam os objetos de resposta.
- DTOs de entrada usam `class-validator`; DTOs de saída documentam o contrato no
  Swagger.
- `PrismaExceptionFilter` converte erros do Prisma para respostas HTTP limpas,
  sem expor detalhes internos do banco.
- `DatabaseSeedService` cria o usuário padrão e as unidades de medida fixas na
  inicialização.

## Tratamento de erros

A API retorna erros em formato consistente:

```json
{
  "statusCode": 404,
  "message": "Dispositivo sensor não encontrado"
}
```

Payloads inválidos retornam `400` com uma lista de mensagens do
`class-validator`:

```json
{
  "statusCode": 400,
  "message": ["label should not be empty", "unitId must be an integer number"]
}
```

As validações cobrem campos obrigatórios, tipos numéricos de `unitId`,
`timestamp` e `value`, existência de unidade de medida, device key e stream key.

## Escopo não implementado

Autenticação não foi implementada porque a especificação da API não define fluxo
de login, JWT ou refresh token. Para manter o escopo fiel ao desafio, foi
utilizado um usuário padrão criado via seed. A modelagem, porém, mantém a
entidade `User` e o relacionamento com `SensorDevice`, então a API pode evoluir
para autenticação real sem refazer o domínio.

A publicação de medições foi implementada via endpoint REST, conforme o desafio.
Em um cenário real de IoT, essa entrada poderia ser substituída ou
complementada por mensageria, como MQTT, RabbitMQ ou Kafka, para lidar melhor
com volume, resiliência e processamento assíncrono.

Também não foram implementados Kubernetes e deploy em nuvem. O projeto inclui
Docker e Docker Compose para garantir um ambiente local reprodutível, mas o
deploy em cluster faz parte do Nível 2 do desafio.
