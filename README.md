# MiniSense API

API RESTful para gerenciamento de dispositivos IoT, streams de dados e medicoes
do desafio MiniSense. O projeto usa NestJS, TypeScript, Prisma ORM, SQLite e
migrations versionadas.

## Resumo da entrega

- API implementada em NestJS com os endpoints pedidos no desafio.
- Documentacao interativa em Swagger/OpenAPI em `/docs`.
- Banco local SQLite controlado por Prisma e migration versionada.
- Testes unitarios e e2e cobrindo os fluxos principais da API.
- Workflow de CI em `.github/workflows/ci.yml`.

## Requisitos

- Node.js 20 ou superior
- npm

## Instalacao e execucao

Clone o repositorio e entre na pasta da API:

```bash
git clone <url-do-repositorio>
cd DesafioMiniSense/minisenseapi
```

Instale as dependencias:

```bash
npm install
```

Configure o banco local. O exemplo abaixo usa o arquivo padrao do projeto no
Windows PowerShell:

```powershell
$env:DATABASE_URL="file:../data/minisense.sqlite"
npm run db:init
npm run start:dev
```

Em bash/zsh:

```bash
export DATABASE_URL="file:../data/minisense.sqlite"
npm run db:init
npm run start:dev
```

A API sobe por padrao em `http://localhost:3000` e o terminal mostra os links:

```text
API rodando em: http://localhost:3000
Swagger docs: http://localhost:3000/docs
```

Para desenvolvimento, use qualquer uma das opcoes abaixo:

```bash
npm run start:dev
npm run start dev
```

Documentacao OpenAPI/Swagger:

```text
http://localhost:3000/docs
```

Tambem e possivel consultar o contrato OpenAPI em JSON:

```text
http://localhost:3000/docs-json
```

Arquivo de banco local padrao:

```text
data/minisense.sqlite
```

Exemplo de variavel de ambiente tambem esta em `.env.example`.

## Build e testes

```bash
npm run build
npm run lint:check
npm run test
npm run test:e2e
```

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
npm run prisma:studio
```

As migrations ficam em `prisma/migrations`.

Observacao: `npm run db:init` aplica a migration SQL versionada. O script
`npm run prisma:deploy` tambem esta disponivel para ambientes onde o Prisma
Migrate esteja funcionando normalmente.

## Seed inicial

Na inicializacao, a aplicacao cria via upsert:

- Usuario padrao: `id = 1`, `name = Default User`
- Unidades de medida:
  - `1`: `\u00baC` - Celsius
  - `2`: `mg/m\u00b3` - Megagram per cubic metre
  - `3`: `hPA` - hectopasca
  - `4`: `lux` - Lux
  - `5`: `%` - Percent

## Estrutura do projeto

A estrutura foi mantida feature-first para evitar excesso de camadas no escopo
do desafio:

```text
src/
  common/                 DTOs de resposta e helpers compartilhados
  prisma/                 PrismaService e seed inicial
  modules/
    measurement-units/    GET /measurement-units
    sensor-devices/       cadastro e consulta de dispositivos
    data-streams/         cadastro de streams e publicacao de medicoes
```

Cada feature segue um fluxo NestJS direto:

```text
Controller -> Service -> Repository -> Prisma
```

O controller cuida do contrato HTTP, o service concentra regras de aplicacao e o
repository isola as consultas Prisma. Essa separacao atende SOLID sem criar
interfaces, tokens e mappers extras que nao trazem ganho real para este desafio.

## Endpoints

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `GET` | `/measurement-units` | Consulta as unidades de medida fixas. |
| `GET` | `/users/:userId/devices` | Consulta os dispositivos de um usuario. |
| `GET` | `/devices/:deviceKey` | Consulta um dispositivo por key, incluindo as 5 medicoes mais recentes de cada stream. |
| `GET` | `/streams/:streamKey` | Consulta uma stream por key, incluindo todas as suas medicoes. |
| `POST` | `/users/:userId/devices` | Registra um dispositivo para um usuario. |
| `POST` | `/devices/:deviceKey/streams` | Registra uma stream para um dispositivo. |
| `POST` | `/streams/:streamKey/measurements` | Publica uma medicao em uma stream. |

### Consultar unidades de medida

```http
GET /measurement-units
```

Resposta:

```json
[
  { "id": 1, "symbol": "\u00baC", "description": "Celsius" },
  { "id": 2, "symbol": "mg/m\u00b3", "description": "Megagram per cubic metre" },
  { "id": 3, "symbol": "hPA", "description": "hectopasca" },
  { "id": 4, "symbol": "lux", "description": "Lux" },
  { "id": 5, "symbol": "%", "description": "Percent" }
]
```

### Consultar dispositivos de um usuario

```http
GET /users/1/devices
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
POST /users/1/devices
Content-Type: application/json
```

Request:

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
  "key": "8961bd9a4d1e439ebf3b86af5b9d5c1f",
  "label": "Kitchen's freezer sensor (Arduino)",
  "description": "Kitchen's freezer sensor (Arduino)"
}
```

### Consultar dispositivo por key

```http
GET /devices/{deviceKey}
```

A consulta individual retorna as 5 medicoes mais recentes de cada stream.

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
POST /devices/{deviceKey}/streams
Content-Type: application/json
```

Request:

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
GET /streams/{streamKey}
```

Retorna todas as medicoes da stream, ordenadas da mais recente para a mais
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

### Publicar medicao em uma stream

```http
POST /streams/{streamKey}/measurements
Content-Type: application/json
```

Request:

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

## Modelagem do dominio

Entidades principais:

- `User`: proprietario dos dispositivos.
- `SensorDevice`: dispositivo fisico associado a um usuario. Recebe `id` do
  banco e `key` hexadecimal gerada pela aplicacao.
- `DataStream`: fluxo de dados de um dispositivo, vinculado a uma unidade de
  medida e habilitado por padrao.
- `MeasurementUnit`: unidade fixa usada por streams e medicoes.
- `SensorData`: medicao publicada em uma stream. Armazena `unitId` no momento do
  recebimento para preservar a unidade historica da leitura.

Decisoes de implementacao:

- O usuario e informado por rota (`/users/:userId/devices`) porque o desafio nao
  exige autenticacao.
- O schema relacional fica em `prisma/schema.prisma`.
- A migration inicial fica em `prisma/migrations/20260610000000_init`.
- `measurementCount` e calculado via `_count` do Prisma.
- `GET /devices/:deviceKey` limita as medicoes por stream a 5 itens.
- `GET /streams/:streamKey` retorna todas as medicoes da stream.
- Validacao de payloads usa `ValidationPipe` global com `whitelist` e
  `forbidNonWhitelisted`.

## Organizacao do codigo

- Controllers definem rotas HTTP, parametros, bodies e documentacao Swagger.
- Services concentram regras de aplicacao, validam existencia de entidades e
  disparam erros HTTP (`404`, `400`) quando necessario.
- Repositories isolam consultas Prisma e formatam os objetos de resposta.
- DTOs de entrada usam `class-validator`; DTOs de saida documentam o contrato no
  Swagger.
- `DatabaseSeedService` cria o usuario padrao e as unidades de medida fixas na
  inicializacao.
