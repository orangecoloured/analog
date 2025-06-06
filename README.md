# ΛNΛLOG
**A minimal analytics tool.**

![Untitled-1](https://github.com/user-attachments/assets/ac2de3d5-d722-4b3e-abc6-4d40a6cb02b6)

This is highly inspired by the [piratepx](https://piratepx.com).

## Storage
To store data you need a Redis instance. You can get one for free from [Upstash](https://upstash.com) or [Render](https://render.com).

## Environment variables
The `VITE_` prefix is required, because the app is built using [Vite](https://vite.dev).

| Key  | Value | Required |
| :--- | :--- | :---: |
| `VITE_ANALOG_GET_TOKEN`  | Used to protect viewing the dashboard. Leave empty if no protection required.  | |
| `VITE_ANALOG_REDIS_URL`  | The connection url to your Redis instance. |❗|
| `VITE_ANALOG_PAGE_TITLE`  | Page title. | |
| `VITE_ANALOG_TIME_RANGE`  | Time range to show. Minimum is `10`, maximum is `30`. | |
| `VITE_ANALOG_PORT_DEV`  | Port to use while developing. Defaults to `5173`. | |

## How to develop
```
npm install
npm run dev
```
This launches the frontend app and the node server.

## Deployment
Currently, it only deploys on [Netlify](https://netlify.com). The settings are in the `netlify.toml`.

## Usage
### Web application
If you have `VITE_ANALOG_GET_TOKEN` assigned, then you need the `token` query parameter in the url. For example, `hostname/?token=SECRET`.

### API
#### `GET /api/get`
##### Request query parametres:
- `token` — if present, must be equal to `VITE_ANALOG_GET_TOKEN` if it's assigned
##### Response
```
{
  "event-name": [1749223782651, 1749228792052],
}
```

#### `POST /api/post`
##### Request body parametres:
- `event: string` — contains the event name (**required**)
##### Response
```
OK
```
