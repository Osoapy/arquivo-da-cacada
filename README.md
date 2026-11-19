# Arquivo da Caçada

Fichas digitais para **Monstro da Semana**. Um projeto de fã, independente e sem fins lucrativos, para organizar caçadores durante a mesa.

## O que o site faz

- Cria e salva fichas de caçadores na conta de cada pessoa.
- Reúne classificações, Sorte, Dano, Experiência, equipamentos e anotações.
- Mostra resumos dos movimentos e as escolhas obrigatórias de cada cartilha (detalhes da caçada).
- Rola 2d6 com a classificação escolhida.
- Oferece interface em português e inglês.
- Compartilha fichas por link com acesso de leitura ou edição e organiza personagens em campanhas com foto.
- Traz um simulador de batalha na campanha: o mestre marca dano e sorte dos caçadores, adiciona monstros e capangas, aplica dano descontando armadura e rola 2d6.

## Rodar localmente

Com Python 3 instalado, copie `.env.example` para `.env`, preencha a configuração do seu aplicativo Web no Firebase e execute na pasta do projeto:

```powershell
python server.py
```

O terminal exibirá **http://localhost:8000**. Clique no endereço para abrir o site. Use `Ctrl+C` para parar o servidor. Se a porta 8000 já estiver ocupada pelo servidor anterior, pare-o primeiro com `Ctrl+C`.

## Firebase

O site usa **Firebase Authentication** para login por e-mail/senha ou Google e **Firebase Realtime Database** para guardar as fichas. Preencha as variáveis `FIREBASE_*` do `.env` com os dados do seu projeto Firebase. Para configurar o Firebase:

1. Ative **Authentication → Sign-in method → Email/Password** e **Google**.
2. Adicione o domínio publicado e, para uso local, `localhost` em **Authentication → Settings → Authorized domains**.
3. Crie o Realtime Database no endereço definido em `FIREBASE_DATABASE_URL` e publique o conteúdo de `database.rules.json` em **Realtime Database → Rules**.

`python server.py` gera `dist/firebase-config.js` a partir do `.env` antes de iniciar o servidor. Para gerar o arquivo sem iniciar o servidor, use `python server.py --build`. A publicação estática precisa incluir esse arquivo gerado. A configuração Web do Firebase fica visível ao navegador; a proteção dos dados depende da autenticação e das regras do banco.

As regras mantêm fichas privadas por padrão. Ao ativar o compartilhamento, quem tiver o link pode ler a ficha; no modo **Pode editar**, também pode alterá-la sem entrar em uma conta. O ID aleatório da ficha compõe o link. Desative o compartilhamento na própria ficha para revogar esse acesso.

Campanhas têm um código aleatório para convite. Integrantes podem ver as fichas vinculadas, e o dono da campanha pode editá-las. Cada personagem pode pertencer a uma campanha por vez. **Depois de atualizar o site, publique a versão atual de `database.rules.json` no Firebase Console** para ativar esses acessos.

Os retratos são reduzidos no navegador, comprimidos em WebP e salvos em `users/{uid}/images/{characterId}` no Realtime Database. O projeto não usa Firebase Storage para essas imagens. O banco ainda pode gerar custos de armazenamento e tráfego conforme o plano do Firebase.

## Arquivos principais

| Caminho | Conteúdo |
| --- | --- |
| `dist/` | Arquivos estáticos do site. |
| `.env.example` | Modelo da configuração local do Firebase. |
| `dist/firebase-config.js` | Configuração gerada a partir do `.env`; ignorada pelo Git. |
| `dist/move-help.js` | Resumos dos movimentos em português e inglês. |
| `dist/hunt-details.js` | Escolhas obrigatórias de cada cartilha. |
| `.github/workflows/pages.yml` | Publicação automática no GitHub Pages. |
| `database.rules.json` | Regras de acesso ao Realtime Database. |
| `server.py` | Gera a configuração e inicia o servidor local em `localhost:8000`. |

## Publicar no GitHub Pages

Cada push na branch `main` publica a pasta `dist/` no GitHub Pages. Para ativar, uma única vez:

1. No GitHub, abra **Settings → Pages** e escolha **Source: GitHub Actions**.
2. Em **Settings → Secrets and variables → Actions**, crie o segredo `FIREBASE_ENV` e cole nele o conteúdo inteiro do seu `.env`.
3. No Firebase, adicione `osoapy.github.io` em **Authentication → Settings → Authorized domains**.

O site fica em `https://osoapy.github.io/arquivo-da-cacada/`. As cartilhas em PDF (`dist/cartilhas/`) ficam fora do Git e não são publicadas.

## Créditos e direitos

**Monstro da Semana** e o conteúdo do manual e das cartilhas, incluindo textos, ilustrações, personagens e identidade visual, pertencem aos seus respectivos criadores e demais titulares de direitos. Este projeto não reivindica esses direitos, não é oficial, não possui vínculo com os titulares e **não tem fins lucrativos**.

As imagens em `dist/images/` foram extraídas ou inspiradas no manual fornecido para o projeto. As descrições dos movimentos são resumos para consulta rápida; para a regra completa, consulte o manual e as cartilhas originais.
