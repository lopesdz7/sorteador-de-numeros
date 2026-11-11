# 🎲 Sorteador de Números

Projeto desenvolvido como desafio da formação Full Stack da Rocketseat.
Uma página para sortear números aleatórios: você escolhe quantos números quer,
o intervalo (mínimo e máximo) e se os números podem ou não se repetir.

🔗 **Acesse online:** https://lopesdz7.github.io/sorteador-de-numeros/

## ✨ Funcionalidades

- Sorteio de **1 a 100 números** por vez, dentro de qualquer intervalo de inteiros (inclusive negativos);
- O **mínimo e o máximo entram no sorteio**;
- Opção **“Não repetir número”**;
- **Animação** de números girando antes de revelar o resultado;
- Botão desabilitado durante a animação e reabilitado ao final;
- Mensagens claras de **erro** e de **sucesso**;
- Layout em **duas colunas** (explicação + formulário), responsivo para desktop, tablet e mobile;
- Acessibilidade: `label` em todos os campos, `aria-live` para anunciar mensagens e resultados,
  `aria-invalid` nos campos com erro e respeito a `prefers-reduced-motion`.

## ✅ Validações

- Nenhum campo pode ficar vazio;
- Os valores precisam ser números inteiros;
- O máximo precisa ser maior que o mínimo;
- Com “Não repetir número” marcado, a quantidade não pode ultrapassar a quantidade de números disponíveis no intervalo.

## 🛠️ Tecnologias

- HTML5
- CSS3 (variáveis, Grid, Flexbox, media queries, animações)
- JavaScript (sem bibliotecas)

## ▶️ Como rodar

Não precisa instalar nada.

1. Clone o repositório:
   ```bash
   git clone https://github.com/lopesdz7/sorteador-de-numeros.git
   ```
2. Abra o arquivo `index.html` no navegador
   (ou use a extensão **Live Server** do VS Code para recarregar automaticamente).

## 📁 Estrutura

```
sorteador-de-numeros/
├── index.html   # estrutura da página
├── style.css    # reset, variáveis, layout e responsividade
├── script.js    # validações, sorteio e animação
└── README.md
```

## 🧠 Como o sorteio funciona

- **Com repetição:** cada número é gerado de forma independente com
  `Math.floor(Math.random() * (max - min + 1)) + min`.
- **Sem repetição:** é usado o algoritmo de **Fisher-Yates parcial**, guardando só as posições
  trocadas em um `Map`. Assim o sorteio é justo e rápido mesmo com intervalos enormes
  (ex.: 10 números entre 1 e 1.000.000.000).
