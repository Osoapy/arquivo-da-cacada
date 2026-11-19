from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import sys


root = Path(__file__).resolve().parent
site = root / "dist"
config_keys = {
    "apiKey": "FIREBASE_API_KEY",
    "authDomain": "FIREBASE_AUTH_DOMAIN",
    "databaseURL": "FIREBASE_DATABASE_URL",
    "projectId": "FIREBASE_PROJECT_ID",
    "storageBucket": "FIREBASE_STORAGE_BUCKET",
    "messagingSenderId": "FIREBASE_MESSAGING_SENDER_ID",
    "appId": "FIREBASE_APP_ID",
}


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def build_config():
    env_file = root / ".env"
    if not env_file.is_file():
        raise SystemExit("Arquivo .env ausente. Copie .env.example para .env e preencha os dados do Firebase.")
    values = {}
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip().strip('"\'')
    missing = [key for key in config_keys.values() if not values.get(key)]
    if missing:
        raise SystemExit("Configuração ausente no .env: " + ", ".join(missing))
    config = {name: values[key] for name, key in config_keys.items()}
    (site / "firebase-config.js").write_text(
        "export const firebaseConfig = " + json.dumps(config, ensure_ascii=True) + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    if sys.argv[1:] not in ([], ["--build"]):
        raise SystemExit("Uso: python server.py [--build]")
    build_config()
    if sys.argv[1:] != ["--build"]:
        server = ThreadingHTTPServer(("127.0.0.1", 8000), partial(NoCacheHandler, directory=site))
        print("http://localhost:8000", flush=True)
        server.serve_forever()
