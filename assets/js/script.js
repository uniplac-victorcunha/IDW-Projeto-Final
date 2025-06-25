// Victor da Cunha
let entradaBloqueada = false;
let palavraSecreta = "";
const maxTentativas = 5;
let tentativas = 0;

const coracoes = document.getElementById("lives");
const game = document.getElementById("game");

async function getPalavraAleatoria() {
  const palavras = [
    "nuvem",
    "pedra",
    "livro",
    "plano",
    "carta"
  ];
  palavraSecreta = palavras[Math.floor(Math.random() * palavras.length)];
  console.log("Palavra:", palavraSecreta);
}

function desenharTabuleiro() {
  for (let i = 0; i < maxTentativas; i++) {
    const linha = document.createElement("div");
    linha.classList.add("word");
    linha.setAttribute("id", `linha-${i}`);

    for (let j = 0; j < 5; j++) {
      const letra = document.createElement("div");
      letra.classList.add("letter");
      letra.setAttribute("id", `letra-${i}-${j}`);
      linha.appendChild(letra);
    }

    game.appendChild(linha);
  }
}

async function palavraExiste(palavra) {
  try {
    const response = await fetch(
      `https://api.dicionario-aberto.net/word/${palavra}`
    );
    if (!response.ok) return false;

    const data = await response.json();
    return Array.isArray(data) && data.length > 0;
  } catch (err) {
    return false;
  }
}

function mostrarMensagem(msg, cor = "text-light") {
  const mensagem = document.getElementById("mensagem");
  mensagem.textContent = msg;
  mensagem.className = `fw-semibold ${cor}`;
}

function atualizarVidas() {
  coracoes.innerHTML = "";
  for (let i = 0; i < maxTentativas; i++) {
    const heart = document.createElement("i");
    heart.className = `fas fa-heart${i < tentativas ? "-broken" : ""}`;
    coracoes.appendChild(heart);
  }
}

async function tentar() {
  if (entradaBloqueada) return;
  const input = document.getElementById("input");
  const palavra = input.value.toLowerCase();

  if (palavra.length !== 5) {
    mostrarMensagem("A palavra deve ter 5 letras.", "text-warning");
    return;
  }

  if (!(await palavraExiste(palavra))) {
    mostrarMensagem("Palavra inválida.", "text-danger");
    return;
  }

  mostrarMensagem("");
  entradaBloqueada = true;

  const linhaAtual = document.getElementById(`linha-${tentativas}`);
  const letraDivs = [];

  // Cria cópia da palavra secreta para controle
  const secretaArray = palavraSecreta.split("");
  const usada = Array(5).fill(false);

  // Primeiro passo: marca os verdes (posição correta)
  for (let i = 0; i < 5; i++) {
    const letraDiv = document.getElementById(`letra-${tentativas}-${i}`);
    const letra = palavra[i];
    letraDiv.textContent = letra;
    letraDiv.classList.add("letter", "animate-zoom");
    letraDivs.push(letraDiv);

    if (letra === palavraSecreta[i]) {
      letraDiv.classList.add("green");
      usada[i] = true;
    }
  }

  for (let i = 0; i < 5; i++) {
    const letra = palavra[i];
    const letraDiv = letraDivs[i];

    if (letraDiv.classList.contains("green")) continue;

    let found = false;
    for (let j = 0; j < 5; j++) {
      if (!usada[j] && letra === secretaArray[j]) {
        usada[j] = true;
        found = true;
        break;
      }
    }

    if (found) {
      letraDiv.classList.add("yellow");
    } else {
      letraDiv.classList.add("gray");
    }
  }

  setTimeout(() => {
    tentativas++;
    atualizarVidas();

    if (palavra === palavraSecreta) {
      linhaAtual.classList.add("animate-bounce");
      mostrarMensagem("🎉 Parabéns! Você acertou!", "text-success");
      input.disabled = true;
    } else if (tentativas >= maxTentativas) {
      linhaAtual.classList.add("animate-shake");
      mostrarMensagem(
        `❌ Fim de jogo! A palavra era "${palavraSecreta}".`,
        "text-danger"
      );
      input.disabled = true;
    } else {
      linhaAtual.classList.add("animate-shake");
    }

    setTimeout(() => {
      linhaAtual.classList.remove("animate-bounce", "animate-shake");
      entradaBloqueada = false;
    }, 500);
  }, 1200);

  input.value = "";
}


function toggleTheme() {
  const html = document.documentElement;
  html.dataset.bsTheme = html.dataset.bsTheme === "dark" ? "light" : "dark";
}
getPalavraAleatoria();
desenharTabuleiro();
atualizarVidas();
