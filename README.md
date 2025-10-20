# AstroGod Game - Jogo 2D Isométrico Desktop

Um jogo 2D isométrico desenvolvido com Phaser 3, TypeScript e Tauri 2.0 - **Aplicativo Desktop Nativo**.

## Recursos Implementados

- ✅ **Aplicativo Desktop Nativo** (Tauri 2.0) para Windows e macOS
- ✅ **Performance otimizada** com WebView nativo
- Mapa isométrico 20x20 tiles com placeholders coloridos
- Personagem principal no centro do mapa
- Sistema de movimento click-to-move
- Movimento suave em 8 direções
- Câmera fixa no personagem
- Indicador visual de destino
- Conversão de coordenadas cartesianas para isométricas
- **Sistema de habilidades com 3 skills:**
  - **Q - Explosão Astral**: Dano em área (AoE) ao redor do personagem
  - **W - Raio Cósmico**: Dispara um raio reto na direção do mouse
  - **E - Salto Estelar**: Dash instantâneo para a posição do mouse
- Sistema de cooldown visual para habilidades
- UI com indicadores de cooldown em tempo real
- Sistema de combate com inimigos
- Ondas progressivas de inimigos
- Leaderboard local com persistência
- Menu principal e tela de Game Over

## Como Executar

### Pré-requisitos
- Node.js (v16 ou superior)
- npm
- **Rust** (para compilar o aplicativo desktop)
  - macOS: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - Windows: Baixar de https://rustup.rs/
- **Xcode** (apenas macOS) - `xcode-select --install`
- **Visual Studio C++ Build Tools** (apenas Windows)

### Instalação

```bash
# Instalar dependências
npm install

# Executar aplicativo desktop em desenvolvimento
npm run dev

# Build para distribuir (.app para macOS, .msi para Windows)
npm run build
```

**Nota:** Na primeira execução, a compilação Rust demora 5-10 minutos. Depois é muito rápida!

## Controles

### Movimento
- **Clique Esquerdo**: Clique em qualquer tile do mapa para mover o personagem até lá
- O personagem se move automaticamente em linha reta até o destino
- Um marcador verde aparece no local clicado

### Habilidades (use com o mouse apontando para o alvo)
- **Q - Explosão Astral** (Cooldown: 5s): Cria uma explosão de dano em área ao redor do personagem. Player fica parado durante o cast (0.5s)
- **W - Raio Cósmico** (Cooldown: 3s): Dispara um raio reto da sua posição até o mouse. Player fica parado durante o cast (0.4s)
- **E - Salto Estelar** (Cooldown: 4s): Dash suave para a posição do mouse (distância máxima de 200px, duração de 0.5s)

**IMPORTANTE**: O player fica travado e não pode se mover enquanto estiver usando qualquer habilidade. Isso evita que habilidades fiquem "voando sozinhas".

## Estrutura do Projeto

```
astrogod-game/
├── src/                        # Código do jogo (TypeScript)
│   ├── main.ts                 # Configuração principal do Phaser
│   ├── scenes/
│   │   ├── MainMenuScene.ts    # Menu principal
│   │   ├── GameScene.ts        # Cena principal do jogo
│   │   ├── GameOverScene.ts    # Tela de Game Over
│   │   └── LeaderboardScene.ts # Leaderboard
│   ├── objects/
│   │   ├── IsometricMap.ts     # Sistema de mapa isométrico
│   │   ├── Player.ts           # Classe do personagem
│   │   ├── Enemy.ts            # Classe do inimigo
│   │   ├── EnemySpawner.ts     # Sistema de spawn de ondas
│   │   ├── HealthBar.ts        # Barra de vida
│   │   ├── AbilityUI.ts        # Interface de cooldown das habilidades
│   │   └── abilities/
│   │       ├── Ability.ts         # Classe base de habilidades
│   │       ├── AbilityManager.ts  # Gerenciador de habilidades
│   │       ├── AoEAbility.ts      # Habilidade Q (AoE)
│   │       ├── BeamAbility.ts     # Habilidade W (Raio)
│   │       └── DashAbility.ts     # Habilidade E (Dash)
│   └── utils/
│       ├── IsometricUtils.ts      # Funções de conversão isométrica
│       ├── LeaderboardManager.ts  # Gerenciador de leaderboard
│       └── TauriUtils.ts          # Utilitários Tauri
├── src-tauri/                  # Configuração desktop (Rust)
│   ├── src/
│   │   └── main.rs             # Entry point Rust
│   ├── icons/                  # Ícones do aplicativo
│   ├── Cargo.toml              # Dependências Rust
│   └── tauri.conf.json         # Configuração Tauri
├── dist/                       # Build output (gerado)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Tecnologias

- **Phaser 3.80.1**: Game engine
- **TypeScript**: Linguagem
- **Vite**: Build tool
- **Tauri 2.0**: Framework para aplicativo desktop nativo
- **Rust**: Backend do Tauri (compilado automaticamente)

## Detalhes Técnicos

- **Tile Size**: 64x32 pixels (padrão isométrico)
- **Mapa**: 20x20 tiles
- **Velocidade do Personagem**: 150 pixels/segundo
- **Resolução**: 1280x720 (responsive)
- **Habilidades**:
  - Q: AoE de 100px de raio, 5s de cooldown, 0.5s de cast lock
  - W: Raio de 400px, 3s de cooldown, 0.4s de cast lock
  - E: Dash de até 200px em 0.5s, 4s de cooldown
- **Sistema de Cast Lock**: Player não pode se mover durante uso de habilidades

## Build e Distribuição

Após executar `npm run build`, os arquivos estarão em:

**macOS:**
- `src-tauri/target/release/bundle/macos/` - Arquivo .app
- `src-tauri/target/release/bundle/dmg/` - Instalador .dmg

**Windows:**
- `src-tauri/target/release/bundle/msi/` - Instalador .msi

**Performance:**
- **Tamanho:** ~5-10MB (vs ~100MB+ com Electron)
- **RAM:** ~2MB em uso (vs ~200MB com Electron)
- **Startup:** Instantâneo com WebView nativo

## Próximas Funcionalidades

- [ ] Adicionar sprites reais (substituir placeholders)
- [ ] Implementar pathfinding A* para evitar obstáculos
- [ ] Adicionar animações do personagem
- [ ] Sistema de colisão
- [ ] NPCs e inimigos
- [ ] Sistema de combate com hitbox
- [ ] Sistema de vida e mana
- [ ] Mais habilidades e combos
- [ ] Efeitos de som
- [ ] Partículas mais elaboradas

## Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
