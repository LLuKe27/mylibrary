# Biblioteca Digital Semântica — Grupo 9 (My Library)

Protótipo acadêmico desenvolvido combinando **Next.js (Node.js)**, **React.js (Vite)**, **RDF / SPARQL 1.1**, **Schema.org (JSON-LD & Microdados)**, **capas vetoriais em SVG dinâmicas**, **audiobook via Web Speech API + áudio procedural**, **comandos de voz** e **painel interativo de Anatomia do Projeto**. A interface segue os princípios do **Apple Human Interface Guidelines (HIG)** com materiais translúcidos (*Liquid Glass* com `glisse`).

---

## 🏛️ Estrutura do Projeto


```text
Atividade DS/
├── package.json                 # Orquestração raiz (dev, build e test)
├── iniciar.bat                  # Executável 1-clique para Windows
├── scripts/
│   └── dev.mjs                  # Executa Backend (3001) e Frontend (5173) em paralelo
├── 1projectmanagement/          # Artefatos, proposta e referências visuais do projeto
├── SparQL/                      # Camada Semântica & Banco de Dados JSON
│   ├── data/
│   │   ├── books.json           # Banco de livros (metadados, paleta, trechos)
│   │   ├── authors.json         # Banco de autores (nascimento, nacionalidade)
│   │   ├── genres.json          # Banco de gêneros literários
│   │   └── library.ttl          # Grafo RDF serializado em Turtle
│   ├── mapping/
│   │   └── json-to-rdf.mjs      # Mapeador declarativo JSON -> Triplas RDF / Turtle
│   ├── ontology/
│   │   └── biblioteca.ttl       # Ontologia OWL/RDFS (Dublin Core, Schema.org e FOAF)
│   ├── queries/
│   │   ├── books-search.rq      # Consulta principal por autoria (dct:creator) e gênero (schema:genre)
│   │   ├── authors.rq           # Faceta de autores com contagem de obras
│   │   ├── genres.rq            # Faceta de gêneros com contagem de obras
│   │   └── examples/            # Consultas demonstrativas (ASK, agregações, filtros combinados)
│   └── scripts/
│       └── build-ttl.mjs        # Geração do grafo library.ttl a partir dos JSONs
├── JavaScript/
│   ├── Backend/                 # BFF Next.js (Node.js) na porta 3001
│   │   ├── app/api/
│   │   │   ├── books/           # Busca semântica via SPARQL e detalhe da obra
│   │   │   ├── books/[id]/read/ # Leitor simulado de livro
│   │   │   ├── authors/         # Consulta SPARQL agregada de autores
│   │   │   ├── genres/          # Consulta SPARQL agregada de gêneros
│   │   │   ├── audio/[id]/      # Síntese determinística de audiobook WAV
│   │   │   ├── history/         # Persistência em JSON de histórico de leitura/áudio
│   │   │   ├── visitor/         # Identificação UUID v4 do visitante e estado do tutorial
│   │   │   ├── sparql/          # Endpoint SPARQL 1.1 somente leitura (SELECT, ASK, CONSTRUCT)
│   │   │   └── export/          # Exportação do grafo RDF em Turtle
│   │   └── lib/
│   │       ├── graph.js         # Motor Oxigraph (SPARQL 1.1 Wasm) com recarga inteligente
│   │       ├── library.js       # Execução e injeção segura de cláusulas SPARQL
│   │       ├── audio.js         # Síntese procedural de áudio WAV
│   │       ├── history.js       # Gerenciamento de histórico em data/history.json
│   │       ├── visitor.js       # Registro UUID de visitantes e conclusão do tutorial
│   │       └── paths.js         # Resolução de caminhos entre SparQL/ e JavaScript/Backend/
│   └── Frontend/                # SPA React.js (Vite) na porta 5173
│       ├── index.html           # Shell HTML com tema inicial e JSON-LD da biblioteca
│       ├── public/
│       │   ├── anatomy/         # Diagramas e selos SVG exibidos no painel Anatomy
│       │   └── tutorial/        # Vídeo tutorial (.webm), pôster (.png) e legendas (.vtt)
│       └── src/
│           ├── App.jsx          # Aplicação principal, catálogo JSON-LD, filtros e modais
│           ├── components/      # Header, Sidebar, BookCard, BookCover, BookModal, Reader,
│           │                    # PlayerBar, HistoryPanel, ShortcutsHelp, AnatomyModal,
│           │                    # FeaturesBento, ScriptsMiniIde, TutorialModal, Icons
│           ├── hooks/           # useFocusTrap (acessibilidade) e useTheme (Escuro/Claro/AC)
│           ├── lib/             # api.js, jsonld.js, speech.js, anatomyScripts.js, utils.js
│           ├── context/         # PlayerContext.jsx (Web Speech API + HTML5 Audio API)
│           └── styles/          # global.css (Design System Apple HIG + Bento + Mini IDE)
└── tests/                       # Suítes automatizadas com node:test
    ├── anatomy-components.test.mjs
    ├── anatomy-scripts.test.mjs
    └── semantic-speech-tutorial.test.mjs
```

---

# Como Executar

### Pré-requisitos
- **Node.js** v18+ (testado em v24)
- **NPM** instalado

### 1. Inicialização Rápida
No Windows, clique duas vezes em:
```cmd
iniciar.bat
```
Ou execute pela raiz do projeto:
```bash
npm run dev
```

O script inicia automaticamente:
- **Backend (Next.js)**: `http://localhost:3001`
- **Frontend (Vite)**: `http://localhost:5173`

Acesse **`http://localhost:5173`** no navegador.

### 2. Build e Testes
```bash
npm test
npm run build
```

---

