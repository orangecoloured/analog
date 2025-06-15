# ΛNΛLOG
**A minimal analytics tool to self-host.**

![Untitled-1](https://github.com/user-attachments/assets/ac2de3d5-d722-4b3e-abc6-4d40a6cb02b6)

This is heavily inspired by the [piratepx](https://piratepx.com).

## Storage
To store data you need a Redis instance. You can get one for free from [Upstash](https://upstash.com) or [Render](https://render.com).

## Environment variables
For some variables the `VITE_` prefix is required, because the app is built using [Vite](https://vite.dev).

| Key  | Value | Default | Required |
| :--- | :--- | :--- | :---: |
| `ANALOG_TOKEN` | Protects requests. Leave empty if no protection is required.  | | |
| `ANALOG_REDIS_URL` | The connection url to your Redis instance. | |❗|
| `ANALOG_REDIS_REQUEST_ITEM_COUNT` | The item count the API server requests from the database. | `10` | |
| `ANALOG_PROTECT_POST` | Set to `true` if `ANALOG_TOKEN` is present and you want to protect the `POST` requests. | `false` | |
| `ANALOG_STATIC_SERVER` | Set to `true` to make the Node.js server also serve static content. In this case the contents of `./src/services/server/dist` folder are used. | `false` | |
| `ANALOG_PORT_SERVER` | The port you want the Node.js server to listen on. | | |
| `VITE_ANALOG_PAGE_TITLE` | Page title. | | |
| `VITE_ANALOG_TIME_RANGE` | Time range to show data for. Minimum is `10`, maximum is `30`. | `30` | |
| `VITE_ANALOG_REDIS_REQUEST_QUEUE` | Determines if the requests to the API are done sequentially, rather than fetching all data in one go. | `true` | |

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
### Vercel
Create a project with a copy of this repository. The settings are in the `vercel.json`.
### Docker
Use the Dockerfile to build and run the app in a Docker container, based on your environment:
```bash
docker build -t analog-analytics .
docker run -d \
  -p 80:80 \ # For local development
  -e ANALOG_STATIC_SERVER=true \
  -e ANALOG_PORT_SERVER="" \ # 80 for HTTP or 443 for HTTPS
  -e ANALOG_REDIS_URL="" \
  --name analog-analytics \
  analog-analytics
```

## Usage
### Web application
If you have `ANALOG_TOKEN` environment variable present, then you need the `token` query parameter in the url. For example, `hostname/?token=ANALOG_TOKEN`.

### API
`/api/events`
#### `GET`
##### Request headers:
- `Authorization` — if the environment variable `ANALOG_TOKEN` is present, the value must be equal to it, prefixed by `Basic `
##### Request parametres:
- `cursor` — page pointer to query the database; if omitted, the API tries to fetch all the data in one go
##### Response
###### With `cursor`
```json
data: {
  "event-name": [1749223782651, 1749228792052]
},
nextCursor: "4"
```
###### Without `cursor`
```json
{
  "event-name": [1749223782651, 1749228792052]
}
```

#### `POST`
##### Request headers:
- `Authorization` — if the environment variables `ANALOG_PROTECT_POST` and `ANALOG_TOKEN` are present, the value must be equal to `ANALOG_TOKEN`, prefixed by `Basic `
##### Request body parametres:
- `event: string` — contains the event name (**required**)
##### Response
```bash
OK
```
