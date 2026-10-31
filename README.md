# Biblioteca Digital Semântica — Grupo 9

Protótipo acadêmico desenvolvido combinando **Next.js (Node.js)**, **React.js**, **RDF / SPARQL 1.1**, **capas vetoriais em SVG dinâmicas** e **reprodução de audiobooks via HTML5 Audio API**. A interface segue os princípios do **Apple Human Interface Guidelines (HIG)** com acabamento de materiais translúcidos (*Liquid Glass*).

---

## 🏛️ Estrutura do Projeto

O código está organizado de forma distributiva e modular:

```
Atividade DS/
├── package.json                 # Orquestração raiz e scripts do projeto
├── iniciar.bat                  # Executável 1-clique para Windows
├── scripts/
│   └── dev.mjs                  # Executa Backend (3001) e Frontend (5173) em paralelo
├── SparQL/                      # Camada Semântica & Banco de Dados JSON
│   ├── data/
│   │   ├── books.json           # Banco de livros (metadados, paleta, trechos)
│   │   ├── authors.json         # Banco de autores (nascimento, nacionalidade)
│   │   ├── genres.json          # Banco de gêneros literários
│   │   └── library.ttl          # Grafo RDF serializado em Turtle (294 triplas)
│   ├── mapping/
│   │   └── json-to-rdf.mjs      # Mapeador declarativo JSON -> Triplas RDF / Turtle
│   ├── ontology/
│   │   └── biblioteca.ttl       # Ontologia OWL/RDFS com vocabulários Dublin Core, Schema.org e FOAF
│   ├── queries/
│   │   ├── books-search.rq      # Consulta principal por autoria (dct:creator) e gênero (schema:genre)
│   │   ├── authors.rq           # Faceta de autores com contagem de obras
│   │   ├── genres.rq            # Faceta de gêneros com contagem de obras
│   │   └── examples/            # Consultas demonstrativas (ASK, agregações, filtros combinados)
│   └── scripts/
│       └── build-ttl.mjs        # Script de geração do arquivo Turtle a partir dos JSONs
└── JavaScript/
    ├── Backend/                 # BFF Next.js (Node.js) na porta 3001
    │   ├── app/api/
    │   │   ├── books/           # Endpoint de busca semântica via SPARQL
    │   │   ├── books/[id]/read/ # Leitor simulado de livro
    │   │   ├── authors/         # Consulta SPARQL agregada de autores
    │   │   ├── genres/          # Consulta SPARQL agregada de gêneros
    │   │   ├── audio/[id]/      # Síntese determinística de audiobook WAV
    │   │   ├── history/         # Persistência em JSON de histórico de leitura/áudio
    │   │   ├── sparql/          # Endpoint SPARQL 1.1 somente leitura (SELECT, ASK, CONSTRUCT)
    │   │   └── export/          # Exportação do grafo RDF em Turtle
    │   └── lib/
    │       ├── graph.js         # Oxigraph (engine SPARQL 1.1 Wasm) e recarga inteligente
    │       ├── library.js       # Execução e injeção segura de cláusulas SPARQL
    │       ├── audio.js         # Síntese procedural de áudio WAV para o player
    │       └── history.js       # Gerenciamento de histórico em data/history.json
    └── Frontend/                # SPA React.js (Vite) na porta 5173
        ├── src/
        │   ├── components/
        │   │   ├── Header.jsx       # Barra superior com logo, atalhos, histórico e alternância de tema
        │   │   ├── Sidebar.jsx      # Filtros por autoria e gênero e campo de busca
        │   │   ├── BookCard.jsx     # Card com capa SVG, título, autor e botão de áudio
        │   │   ├── BookCover.jsx    # Gerador vetorial SVG dinâmico (motivos, paletas e títulos)
        │   │   ├── BookModal.jsx    # Modal com semáforo Apple (Fechar, Excluir, Expandir) e botões LER/OUVIR
        │   │   ├── Reader.jsx       # Leitor de livro simulado com paginação e tamanho de fonte
        │   │   ├── PlayerBar.jsx    # Barra de áudio flutuante (play/pause, -15s/+15s, velocidade, scrubber)
        │   │   ├── HistoryPanel.jsx # Histórico de interações com exclusão pontual
        │   │   └── ShortcutsHelp.jsx# Modal com atalhos de teclado (? para abrir)
        │   ├── styles/global.css    # Design System Apple HIG com efeitos Liquid Glass
        │   └── context/PlayerContext.jsx # Gerenciador de estado do player HTML5 Audio API
```

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** v18+ (testado em v24).
- **NPM** instalado.

### 1. Inicialização Rápida (Recomendado)
No Windows, dê um duplo clique no arquivo:
```cmd
iniciar.bat
```
Ou via terminal:
```bash
npm run dev
```

O script inicia automaticamente:
- **Backend (Next.js)** em `http://localhost:3001`
- **Frontend (Vite)** em `http://localhost:5173`

Acesse **`http://localhost:5173`** no seu navegador!

---

## 🎯 Atendimento aos Requisitos da Proposta

| Requisito Proposto | Implementação |
|---|---|
| **Consulta SPARQL por autoria e gênero** | Utiliza o motor **Oxigraph** (SPARQL 1.1) no backend Next.js executando consultas sobre o grafo RDF com os predicados `dct:creator` e `schema:genre`. |
| **Banco de dados em JSON** | Arquivos `books.json`, `authors.json` e `genres.json` em `SparQL/data/` e `history.json` em `JavaScript/Backend/data/`. Sem banco relacional externo. |
| **Visualização multimodal de capas em SVG** | Componente `<BookCover />` sintetiza capas vetoriais determinísticas a partir dos metadados RDF (`lib:coverPalette`, `lib:coverMotif`, título e autor). |
| **Player de Audiobook** | Player flutuante com HTML5 Audio API com reprodução, pausa, salto de tempo (-15s e +15s), ajuste de velocidade (0.75x a 2x) e barra de progresso. Áudios WAV gerados de forma procedural. |
| **Leitor de Livros Simulado** | Modal expansível com modo de leitura, virada de páginas por teclado ou clique, controle de tamanho de fonte e salvamento de progresso no `localStorage`. |
| **Design Apple HIG / Liquid Glass** | Vidro translúcido (`backdrop-filter`), botões semáforo estilo macOS com hover dinâmico ("Fechar", "Excluir"), controles segmentados tipo cápsula ("LER" / "OUVIR") e tema escuro / claro / alto contraste. |
| **Acessibilidade (a11y)** | Suporte completo a navegação por teclado (foco visível, armadilha de foco nos modais, atalhos de teclado `?`, `/`, `Espaço`, `H`, `T`), atributos ARIA e tags `<title>` nos SVGs. |

---

## ⌨️ Atalhos de Teclado Globais

- **`/`**: Focar no campo de busca
- **`Espaço`**: Reproduzir / pausar audiobook
- **`←` / `→`**: Voltar / avançar 15 segundos no áudio (ou virar páginas no leitor)
- **`[` / `]`**: Diminuir / aumentar velocidade de leitura
- **`H`**: Abrir / fechar painel de histórico
- **`T`**: Alternar temas (Escuro ⇄ Claro ⇄ Alto Contraste)
- **`Esc`**: Fechar modais, leitor ou histórico
- **`?`**: Exibir painel de ajuda com todos os atalhos

