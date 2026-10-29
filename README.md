# Encephalon — landing page

Site institucional da Encephalon, empresa criadora do Synapsis. Projeto Vite sem framework (HTML, CSS e JavaScript puros).

## Rodar

```bash
npm install
npm run dev      # servidor local com recarga automática
npm run build    # gera a versão final em dist/
npm run preview  # serve a versão de dist/ para conferir
```

## Estrutura

| Arquivo | O que faz |
| --- | --- |
| `index.html` | Todo o conteúdo da página, seção por seção |
| `src/style.css` | Cores, tipografia, layout e animações (balanço, rotação, pulso) |
| `src/neural.js` | Rede de sinapses do topo: segue o cursor e dispara sinais ao clicar |
| `src/flow-demo.js` | Demonstração do Synapsis: "Concluir etapa" avança a execução |
| `src/effects.js` | Colagem com paralaxe, faixa de palavras, manifesto que acende, cartões 3D, galeria arrastável, cursor e formulário |
| `public/midias/` | Imagens em WebP, geradas a partir da pasta `Midias` (as ilustrações com fundo branco foram recortadas) |

## Pendências

- O formulário da lista de espera só confirma na tela. Para guardar os e-mails, ligue o `submit` em `initForm` (`src/effects.js`) a um serviço como Formspree, Resend ou uma API própria.
- As fontes (Newsreader, Hanken Grotesk e IBM Plex Mono) vêm do Google Fonts.
- Antes de publicar, confirme que você tem direito de uso de todas as imagens da pasta `Midias`.
- Quem prefere menos movimento (configuração do sistema) vê a página sem balanço, sem rede animada e sem cursor customizado.
