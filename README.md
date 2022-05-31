# Fragments

Fragments is a platform to compose and manage custom data objects for HTTP transactions. Simply put, you can write simple jinja templates to represent a json or yaml (coming soon) response from an HTTP endpoint.

- You can integrate different data sources, currently the project supports PostgreSQL and HTTP. 
- Run transformations on the data through custom or built-in functions.
- Cache and serve the results over HTTP.

![Alt text](/screenshots/ui.png?raw=true "UI")


## Development

By default the environment variables defined in dot_env folder are enough for local development.
Bring up the services `make up`.

### Backend

```bash
python -m venv .env
source .env/bin/activate
pip install -r server/requirements.txt
pip install black

make dev_server
```

### Frontend

By default, frontend will point to the server on http://localhost:9001/v1.

```bash
npm install && npm run start
```