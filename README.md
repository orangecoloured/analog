# ΛNΛLOG
**A minimal analytics tool to self-host.**

![ΛNΛLOG dashboard](https://github.com/user-attachments/assets/ac2de3d5-d722-4b3e-abc6-4d40a6cb02b6)

<details>
  <summary>Short demo video</summary>

  https://github.com/user-attachments/assets/13d13086-7315-4e28-96ee-08f586b9151b
</details>

This is heavily inspired by the [piratepx](https://piratepx.com).

## Storage
### Redis
Get one from [Upstash](https://upstash.com), [Render](https://render.com) or [Redis](https://redis.io).
### PostgreSQL
Get one from [Supabase](https://supabase.com), [Render](https://render.com) or [CockroachDB](https://cockroachlabs.cloud).
> [!IMPORTANT]
> You should use a transaction pooler connection.
### MongoDB
Get one from [MongoDB](https://mongodb.com).
### SQLite
Get one from [Turso](https://turso.tech) or use a local file with `file:./path/to/file.db` as the connection url.
> [!IMPORTANT]
> It uses [libsql](https://github.com/tursodatabase/libsql-client-ts) to connect to the database.
## Environment variables
For some variables the `VITE_` prefix is required, because the app is built using [Vite](https://vite.dev).

| Key  | Value | Default |
| :--- | :--- | :--- |
| `ANALOG_TOKEN` | Protects requests. Leave empty if no protection is required.  | |
| `ANALOG_DATABASE_PROVIDER` | Defines the kind of database to use. Possible values: `redis`, `postgresql`, `mongodb`, `sqlite`. | |
| `ANALOG_REDIS_URL` | Redis connection url. | |
| `ANALOG_POSTGRESQL_URL` | PostgreSQL connection url. | |
| `ANALOG_MONGODB_URL` | MongoDB connection url. | |
| `ANALOG_SQLITE_URL` | SQLite connection url. Add an `authtoken` query parametre if you need to use the `authToken` to initilise the connection. | |
| `ANALOG_DATABASE_REQUEST_ITEM_COUNT` | The item count the API server requests from the database. | `10` |
| `ANALOG_PROTECT_POST` | Set to `true` if `ANALOG_TOKEN` is present and you want to protect the `POST` requests. | `false` |
| `ANALOG_STATIC_SERVER` | Set to `true` to make the Node.js server also serve static content. In this case the contents of `./src/services/server/dist` folder are used. | `false` |
| `ANALOG_PORT_SERVER` | The port you want the Node.js server to listen on.  | |
| `VITE_ANALOG_PAGE_TITLE` | Page title. | |
| `VITE_ANALOG_TIME_RANGE` | Time range to show data for. Minimum is `10`, maximum is `30`. | `30` |
| `VITE_ANALOG_API_GET_REQUEST_QUEUE` | Defines if the request to the API is done in a sequence, rather than fetching all the data in one go. | `true` |
| `VITE_ANALOG_API_GET_REQUEST_CLEAN_UP` | Defines if the data clean up occurs along with the `GET` request. | `true` |

## Deployment
### Local
Clone this repository.

Create `.env.local` with your settings.

Then run:
```bash
npm install
npm run dev
```
This launches the frontend app and the node server.
### Netlify
Create a project with a copy of this repository. The settings are in the `netlify.toml`.

Configuration to schedule the clean up function to run every day:
```toml
[functions."cleanUp"]
  schedule = "@daily"
```
> [!IMPORTANT]
> Scheduling may not work, because of the runtime limitations.
### Vercel
Create a project with a copy of this repository. The settings are in the `vercel.json`.

Configuration to schedule the clean up function to run every day:
```json
"crons": [
  {
    "path": "/api/cleanUp",
    "schedule": "0 0 * * *"
  }
]
```
> [!IMPORTANT]
> Scheduling may not work, because of the runtime limitations.
### Docker
Use the Dockerfile to build and run the app in a Docker container, based on your environment:
```bash
docker build \
  --build-arg VITE_ANALOG_API_GET_REQUEST_QUEUE=false \
  --build-arg VITE_ANALOG_API_GET_REQUEST_CLEAN_UP=false \
  -t analog-analytics .

docker run -d \
  -p 80:80 \ # For local development
  -e ANALOG_STATIC_SERVER=true \
  -e ANALOG_PORT_SERVER= \ # 80 for HTTP or 443 for HTTPS
  -e ANALOG_DATABASE_PROVIDER= \
  -e ANALOG_REDIS_URL= \
  --name analog-analytics \
  analog-analytics
```

## Usage
### Web application
If you have `ANALOG_TOKEN` environment variable present, then you need the `token` query parametre in the url. For example, `hostname/?token=ANALOG_TOKEN`.

### API
`/api/events`
#### `GET`
##### Request headers:
- `Authorization?: Bacis *` — if the environment variable `ANALOG_TOKEN` is present, the value must be equal to it, prefixed by `Basic `
##### Request parametres:
- `cursor?: string` — page pointer to query the database; if omitted, the API fetches all the data in one go
- `clean-up?: boolean` — if the parametre is present, the clean up occurs along with fetching the data
##### Response
###### With `cursor`
```typescript
{
  data: {
    [event: string]: number[];
  };
  nextCursor: string;
}
```
###### Without `cursor`
```typescript
{
  [event: string]: number[];
}
```

#### `POST`
##### Request headers:
- `Authorization?: Basic *` — if the environment variables `ANALOG_PROTECT_POST` and `ANALOG_TOKEN` are present, the value must be equal to `ANALOG_TOKEN`, prefixed by `Basic `
##### Request body parametres:
- `event: string` — contains the event name
##### Response
```bash
OK
```
