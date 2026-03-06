# Stitch Skills Repo

Repositorio local com skills do Stitch + 1 skill custom para organizacao profissional de projetos React + TypeScript + Tailwind CSS.

## Skills disponiveis

- `design-md`
- `enhance-prompt`
- `react-components`
- `stitch-loop`
- `remotion`
- `shadcn-ui`
- `react-ts-tailwind-organization` (custom)

## Estrutura

```text
stitch-skills-repo/
├── README.md
└── skills/
    ├── design-md/
    │   └── SKILL.md
    ├── enhance-prompt/
    │   └── SKILL.md
    ├── react-components/
    │   └── SKILL.md
    ├── stitch-loop/
    │   └── SKILL.md
    ├── remotion/
    │   └── SKILL.md
    ├── shadcn-ui/
    │   └── SKILL.md
    └── react-ts-tailwind-organization/
        └── SKILL.md
```

## Como usar as skills deste repositorio

Execute os comandos na pasta `stitch-skills-repo`.

### 1. Listar skills locais

```bash
npx skills add . --list
```

### 2. Instalar uma skill local no projeto atual

```bash
npx skills add . --skill design-md
```

### 3. Instalar multiplas skills locais no projeto atual

```bash
npx skills add . --skill enhance-prompt
npx skills add . --skill react-ts-tailwind-organization
npx skills add . --skill react-components
```

### 4. Instalar globalmente (todas as IDE/workspaces)

```bash
npx skills add . --skill design-md --global
npx skills add . --skill react-components --global
npx skills add . --skill stitch-loop --global
```

## Sequencia recomendada (React)

Para projetos React + TypeScript + Tailwind:

1. `enhance-prompt` para melhorar prompts de geracao.
2. `react-ts-tailwind-organization` para organizar arquitetura e estrutura.
3. `react-components` para converter telas Stitch em componentes React.

## Skill custom

### react-ts-tailwind-organization

Arquivo:

```text
skills/react-ts-tailwind-organization/SKILL.md
```

Foco:
- Estrutura profissional por features
- Convencoes de nomeacao
- Separacao de camadas (UI, dominio, dados)
- Padroes de TypeScript strict
- Tailwind com tokens centralizados
- Checklist de qualidade para refactor seguro

## Observacoes

- As skills originais vieram de: `google-labs-code/stitch-skills`.
- Este repositorio e uma compilacao local para facilitar uso no dia a dia.

## Referencias

- Repositorio original: https://github.com/google-labs-code/stitch-skills
- Documentacao Stitch: https://stitch.withgoogle.com/docs/
- Guia de prompting: https://stitch.withgoogle.com/docs/learn/prompting/
