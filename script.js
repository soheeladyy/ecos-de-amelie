// ==========================================
// PERGUNTAS PRINCIPAIS
// ==========================================
// ============================================================
// TELA INICIAL
// ============================================================

const tapScreen =
    document.getElementById("tapScreen");

const startScreen =
    document.getElementById("startScreen");

const playerNameInput =
    document.getElementById("playerName");

const startButton =
    document.getElementById("startButton");

const startError =
    document.getElementById("startError");


// ==========================================
// SESSÃO
// ==========================================

const session = {

    id: null,

    nome: null,

    startedAt: null

};

function generateSessionId() {

    if (
        typeof crypto !== "undefined"
        && typeof crypto.randomUUID === "function"
    ) {

        return crypto.randomUUID();

    }

    // Fallback para navegadores sem crypto.randomUUID().

    return (
        Date.now().toString(36)
        + "-"
        + Math.random().toString(36).slice(2, 10)
    );

}


// ==========================================
// LOG DE RESPOSTAS (para o relatório em .txt)
// ==========================================
// Registro paralelo e sequencial de tudo que a pessoa responde, na
// ordem em que responde. Diferente do array `answers` (que mistura
// atribuição por índice com .push() de sub-perguntas, e por isso
// tem a ordem "bagunçada" como os comentários originais já
// avisavam), `answersLog` é sempre um .push() simples — então a
// ordem cronológica nunca se perde, não importa quantas perguntas
// ramificadas aconteçam no meio. É isso que alimenta o relatório.

const answersLog = [];

function logAnswer(label, value) {

    if (value === null || value === undefined || value === "") {
        return;
    }

    answersLog.push({

        pergunta: label,

        resposta: value,

        registradoEm: new Date().toISOString()

    });

}


// ==========================================
// ELEMENTOS
// ==========================================

const questionBox =
    document.getElementById("questionBox");

const questionElement =
    document.getElementById("question");

const instructionElement =
    document.getElementById("instruction");

const optionsElement =
    document.getElementById("options");

const errorElement =
    document.getElementById("error");

const continueButton =
    document.getElementById("continueButton");

const progressElement =
    document.getElementById("progress");

const blackScreen =
    document.getElementById("blackScreen");

const blackMessage =
    document.getElementById("blackMessage");


// ==========================================
// SISTEMA DE ÁUDIO
// ==========================================

const sounds = {

    click: new Audio("sounds/buttonpress.mp3"),

    horror: new Audio("sounds/horrorsfx3.mp3"),

    intro: new Audio("audio/intro.wav"),
    qa1: new Audio("sounds/qa1.mp3"),
    qa2: new Audio("sounds/qa2.mp3"),
    qa3: new Audio("sounds/qa3.mp3"),
    qa4: new Audio("sounds/qa4.mp3"),
    qa5: new Audio("sounds/qa5.mp3"),
    porque: new Audio("sounds/porque.mp3"),

};

function playSound(soundName) {

    const sound = sounds[soundName];

    if (!sound) {
        return;
    }

    sound.currentTime = 0;

    sound.play().catch(function(error) {

        console.log(
            "Áudio bloqueado pelo navegador:",
            error
        );

    });

}


// ==========================================
// FADE OUT DE ÁUDIO
// ==========================================

function fadeOutSound(soundName, duration) {

    const sound = sounds[soundName];

    if (!sound) {
        return;
    }

    const steps = 30;

    const stepTime = duration / steps;

    const volumeStep = sound.volume / steps;

    const fade = setInterval(function() {

        if (sound.volume - volumeStep <= 0) {

            sound.volume = 0;

            sound.pause();

            sound.currentTime = 0;

            sound.volume = 1; // reseta o volume para a próxima vez que tocar

            clearInterval(fade);

        } else {

            sound.volume -= volumeStep;

        }

    }, stepTime);

}


// ==========================================
// VERIFICAÇÃO DE INTEGRIDADE
// ==========================================

function runInternalIntegrityChecks() {

    const requiredElements = {
        startScreen: startScreen,
        playerNameInput: playerNameInput,
        startButton: startButton,
        startError: startError,
        questionBox: questionBox,
        questionElement: questionElement,
        instructionElement: instructionElement,
        optionsElement: optionsElement,
        errorElement: errorElement,
        continueButton: continueButton,
        progressElement: progressElement,
        blackScreen: blackScreen,
        blackMessage: blackMessage
    };

    Object.keys(requiredElements).forEach(function(name) {

        if (!requiredElements[name]) {

            console.warn(
                "AVISO: elemento não encontrado no HTML: #" + name
            );

        }

    });

}


// ==========================================
// TELA INICIAL — INICIALIZAÇÃO
// ==========================================

function initialize() {

    runInternalIntegrityChecks();

    // O questionário começa escondido.
    if (questionBox) {
        questionBox.style.display = "none";
    }

    if (continueButton) {
        continueButton.style.display = "none";
    }

    // A tela de nome (startScreen) começa escondida — ela só
    // aparece depois que a pessoa toca na pré-tela (tapScreen).
    if (startScreen) {
        startScreen.style.display = "none";
        startScreen.style.opacity = "0";
    }

    // A pré-tela (só título) começa visível — é nela que a
    // pessoa dá o primeiro toque, o que libera o áudio no
    // celular/tablet e deixa a música tocando de fundo.
    if (tapScreen) {
        tapScreen.style.display = "flex";
        tapScreen.style.opacity = "1";

        tapScreen.addEventListener(
            "click",
            handleTapToStart
        );

        tapScreen.addEventListener(
            "touchstart",
            handleTapToStart
        );

    } else {

        console.error(
            "ERRO: #tapScreen não foi encontrado."
        );

    }

    // O botão é conectado SOMENTE depois que o HTML existe.
    if (startButton) {

        startButton.addEventListener(
            "click",
            startExperience
        );

    } else {

        console.error(
            "ERRO: #startButton não foi encontrado."
        );

    }

}


// ==========================================
// TOQUE NA PRÉ-TELA
// ==========================================

let tapHandled = false;

function handleTapToStart(event) {

    event.preventDefault();

    if (tapHandled) {
        return;
    }

    tapHandled = true;

    playSound("intro");

    if (tapScreen) {

        tapScreen.style.transition =
            "opacity 0.6s ease";

        tapScreen.style.opacity =
            "0";

        setTimeout(function() {

            tapScreen.style.display =
                "none";


            if (startScreen) {

                startScreen.style.display =
                    "flex";

                startScreen.style.transition =
                    "opacity 0.6s ease";

                requestAnimationFrame(function() {

                    startScreen.style.opacity =
                        "1";

                });

            }

        }, 600);

    }

}

function startExperience() {

    const name =
        playerNameInput
            ? playerNameInput.value.trim()
            : "";

    if (!name) {

        if (startError) {
            startError.textContent =
                "Diga-nos como devemos chamar você.";
        }

        if (playerNameInput) {
            playerNameInput.focus();
        }

        return;
    }

    // ==========================================
    // NOVA SESSÃO
    // ==========================================

    session.id =
        generateSessionId();

    session.nome =
        name;

    session.startedAt =
        new Date().toISOString();

    // ==========================================
    // SOM DE CLIQUE + FADE OUT DA MÚSICA DA
    // PRÉ-TELA (que já está tocando desde o toque
    // inicial em #tapScreen)
    // ==========================================

    playSound("click");

    fadeOutSound("intro", 800);

    // ==========================================
    // ESCONDER TELA INICIAL
    // ==========================================

    if (startScreen) {
        startScreen.style.transition =
            "opacity 0.8s ease";

        startScreen.style.opacity =
            "0";

        setTimeout(function() {

            startScreen.style.display =
                "none";

        }, 800);
    }

    // ==========================================
    // MOSTRAR QUESTIONÁRIO
    // ==========================================

    if (questionBox) {
        questionBox.style.display =
            "";
    }

    currentQuestion = 0;

    customContinue = null;

    showQuestion();

}


// ==========================================
// PERGUNTAS
// ==========================================

const questions = [

    {
        id: 1,

        text: `
            Todo mundo possui algo que considera importante.<br><br>

            Às vezes é uma pessoa.<br>
            Às vezes é um lugar.<br>
            Às vezes é uma ideia.<br>
            Às vezes é simplesmente algo que nos faz continuar.<br><br>

            <strong>O que é mais importante para você?</strong>
        `,

        type: "text",

        instruction: "Responda com uma única palavra."
    },


    {
        id: 2,

        text: `
            Existem coisas que amamos.<br><br>

            E existem coisas que protegemos.<br><br>

            Às vezes fazemos isso mesmo quando ninguém pediu.<br><br>

            <strong>O que você faria para proteger aquilo que ama?</strong>
        `,

        type: "text",

        instruction: "Você pode responder livremente."
    },


    {
        id: 3,

        text: `
            Existe um limite para o que você faria
            por alguém que ama?
        `,

        type: "options",

        options: [
            "Sim.",
            "Não.",
            "Não sei."
        ]
    },


    {
        id: 4,

        text: `
            Imagine que você não consiga resolver
            um problema sozinho.<br><br>

            Então alguém aparece.<br><br>

            Essa pessoa diz que pode resolver por você.<br><br>

            Ela não explica como.<br>
            Não pede nada em troca.<br><br>

            <strong>Você aceitaria a ajuda?</strong>
        `,

        type: "options",

        options: [
            "Sim.",
            "Talvez.",
            "Não."
        ]
    },


    {
        id: 5,

        text: `
            A pessoa cumpre o que prometeu.<br><br>

            O problema desaparece.<br><br>

            Você sabe que ela foi responsável por isso.<br><br>

            Quando você pergunta como conseguiu,
            ela apenas responde:<br><br>

            <em>"Eu fiz porque você precisava."</em><br><br>

            E não explica mais nada.<br><br>

            <strong>Você confiaria nela novamente?</strong>
        `,

        type: "options",

        options: [
            "Sim.",
            "Talvez.",
            "Não."
        ]
    },


    {
        id: 6,

        text: `
            Imagine que <strong>[RESPOSTA]</strong>
            fosse tirado de você.<br><br>

            Não por sua escolha.<br>
            Não por sua culpa.<br><br>

            Simplesmente... tirado.<br><br>

            <strong>
                Você faria qualquer coisa para ter de volta?
            </strong>
        `,

        type: "options",

        options: [
            "Sim.",
            "Não.",
            "Não sei."
        ]
    },


    {
        id: 7,

        text: `
            Você encontra alguém.<br><br>

            Essa pessoa sabe exatamente o que aconteceu.<br><br>

            Ela diz que pode devolver
            <strong>[RESPOSTA]</strong>.<br><br>

            Você não sabe quem ela é.<br>
            Não sabe como consegue fazer isso.<br><br>

            Mas ela diz que pode.<br><br>

            <strong>
                Você pediria que devolvesse?
            </strong>
        `,

        type: "options",

        options: [
            "Sim.",
            "Não."
        ]
    },


    {
        id: 8,

        text: `
            <strong>[RESPOSTA]</strong> está de volta.<br><br>

            Você não sabe como.<br>
            Não sabe por quê.<br><br>

            Mas está ali.<br><br>

            Exatamente como antes.<br><br>

            Você sente alívio.<br>
            Gratidão.<br>
            Felicidade.<br><br>

            Então a pessoa diz:<br><br>

            <em>
                "Fico feliz que tenha aceitado minha ajuda."
            </em><br><br>

            Você não se lembra de ter aceitado nada.<br><br>

            <strong>
                Você perguntaria como ela fez isso?
            </strong>
        `,

        type: "options",

        options: [
            "Sim.",
            "Não."
        ]
    },


    {
        id: 9,

        text: "",

        type: "special"
    },


    {
        id: 10,

        text: "",

        type: "special"
    },


    {
        id: 11,

        text: "",

        type: "special"
    },

    {
        id: 12,

        text: "",

        type: "special"
    },

    {
        id: 13,

        text: "",

        type: "special"
    },

    {
        id: 14,

        text: "",

        type: "special"
    },

    // ADICIONADO: pergunta 15, que fecha o arco do medo (1-15).
    // Continua "special" como as outras perguntas ramificadas —
    // todo o conteúdo dela é montado em handleQuestionFifteen().

    {
        id: 15,

        text: "",

        type: "special"
    },

    // ==========================================
    // ARCO PARANOIA (16-20)
    // ==========================================
    // Perguntas de múltipla escolha comuns (type: "options"), como
    // as de 1 a 8 — não precisam de handler especial porque o
    // listener genérico do continueButton já cuida de salvar,
    // logar e agora também pontuar (via applyScoreWeights). Elas só
    // caem no fluxo especial se currentQuestion bater com algum dos
    // índices hardcoded (2-7) — o que não é o caso aqui — então
    // seguem direto pra nextQuestion().

    {
        id: 16,

        text: `
            Depois do que aconteceu, você olha para as pessoas
            ao seu redor de um jeito diferente.<br><br>

            Ninguém mencionou nada estranho.<br>
            Ninguém perguntou onde você esteve.<br>
            Ninguém parece ter notado qualquer coisa fora
            do lugar.<br><br>

            Isso deveria ser um alívio.<br><br>

            Mas existe uma pergunta que não sai da sua cabeça:<br><br>

            <strong>Será que elas não notaram...
            ou será que já sabiam?</strong>
        `,

        type: "options",

        instruction: "Escolha a que mais faz sentido pra você.",

        options: [
            "Elas não notaram nada.",
            "Não sei dizer.",
            "Elas sabem de algo e não estão falando."
        ]
    },

    {
        id: 17,

        text: `
            Você está em um lugar público.<br>
            Um café, uma rua, não importa.<br><br>

            Nada aconteceu.<br>
            Ninguém disse nada.<br><br>

            Mas por um segundo, você tem certeza de que alguém,
            em algum ponto ao seu redor, estava olhando exatamente
            para você — e desviou o olhar no instante em que
            você percebeu.<br><br>

            Você procura o rosto.<br>
            Não encontra ninguém que pareça suspeito.<br><br>

            <strong>O que você faz com essa sensação?</strong>
        `,

        type: "options",

        options: [
            "Esqueço. Foi só impressão.",
            "Fico alerta pelo resto do dia.",
            "Tenho certeza de que alguém está me seguindo."
        ]
    },

    {
        id: 18,

        text: `
            Você começa a perceber coisas.<br><br>

            O mesmo carro passou duas vezes pela sua rua.<br>
            Uma mensagem chegou bem no momento em que você
            pensava na pessoa.<br>
            Um número que já significava alguma coisa pra você
            aparece de novo, sem motivo.<br><br>

            Cada uma dessas coisas, sozinha, não significa
            nada.<br><br>

            Juntas, formam um padrão.<br><br>

            <strong>Você acredita que existe um padrão,
            mesmo sem provas?</strong>
        `,

        type: "options",

        options: [
            "Coincidência é só coincidência.",
            "Talvez exista um padrão, mas não tenho certeza.",
            "Tenho certeza de que não é coincidência."
        ]
    },

    {
        id: 19,

        text: `
            Você pensa em contar pra alguém o que está
            sentindo.<br><br>

            Sobre os passos.<br>
            Sobre o rosto sem feições.<br>
            Sobre a mensagem de quem não deveria mais poder
            mandar mensagem.<br><br>

            Mas alguma coisa te impede.<br><br>

            Não é vergonha.<br>
            É outra coisa.<br><br>

            <strong>Por que você não conta?</strong>
        `,

        type: "options",

        options: [
            "Não tenho o que contar, ainda não tenho certeza.",
            "Tenho medo de não acreditarem em mim.",
            "Tenho medo de que a pessoa errada descubra que eu sei."
        ]
    },

    {
        id: 20,

        text: `
            Chega um momento em que você para e se pergunta
            uma coisa direta.<br><br>

            Não sobre a pessoa que devolveu
            <strong>[RESPOSTA]</strong>.<br>
            Não sobre os passos, as mensagens, os rostos
            sem feições.<br><br>

            Mas sobre você mesmo.<br><br>

            <strong>Você confia no que está sentindo — ou acha
            que pode estar exagerando tudo isso?</strong>
        `,

        type: "options",

        options: [
            "Confio no que sinto.",
            "Acho que posso estar exagerando."
        ]
    },

    // ==========================================
    // ARCO REJEIÇÃO / VERGONHA / AUTOIMAGEM (21-25)
    // ==========================================

    {
        id: 21,

        text: `
            Alguém que estava sempre por perto começou a
            ficar mais distante.<br><br>

            Não disse nada diretamente.<br>
            Não brigou com você.<br><br>

            Só foi se afastando, aos poucos, do jeito que as
            pessoas fazem quando não sabem como dizer o que
            sentem.<br><br>

            Você percebe, mas não pergunta.<br><br>

            <strong>O que você acha que motivou esse
            afastamento?</strong>
        `,

        type: "options",

        options: [
            "Coisa da cabeça dela. Não tem nada a ver comigo.",
            "Talvez ela tenha percebido que eu mudei.",
            "Ela sabe o que eu fiz."
        ]
    },

    {
        id: 22,

        text: `
            Imagine que alguém em quem você confia — de
            verdade — perguntasse, olhando nos seus olhos,
            exatamente como <strong>[RESPOSTA]</strong>
            voltou pra você.<br><br>

            Sem rodeios.<br>
            Sem espaço pra "não sei explicar".<br><br>

            <strong>Você contaria a verdade inteira?</strong>
        `,

        type: "options",

        options: [
            "Sim, sem hesitar.",
            "Contaria uma versão editada.",
            "Mentiria completamente."
        ]
    },

    {
        id: 23,

        text: `
            Tem um espelho na sua frente.<br><br>

            Você se olha por mais tempo do que costuma.<br><br>

            Não porque algo mudou no seu rosto.<br><br>

            Mas porque, ultimamente, você tem feito e aceitado
            coisas que a versão sua de antes talvez não
            aceitasse.<br><br>

            <strong>Você ainda reconhece quem está te olhando
            de volta?</strong>
        `,

        type: "options",

        options: [
            "Sim, continuo sendo eu.",
            "Não tenho certeza.",
            "Não. E isso me assusta um pouco."
        ]
    },

    {
        id: 24,

        text: `
            Você pensa em tudo que fez — e deixou de fazer —
            desde que aceitou aquela ajuda.<br><br>

            Cada escolha, sozinha, parecia razoável no
            momento.<br><br>

            Juntas, formam uma pessoa que talvez você não
            apresentasse com orgulho pros outros.<br><br>

            <strong>Se tivesse que justificar cada uma dessas
            escolhas, você conseguiria?</strong>
        `,

        type: "options",

        options: [
            "Sim, cada uma tem uma explicação boa.",
            "Algumas eu prefiro não explicar.",
            "Não. Só sei que fiz."
        ]
    },

    {
        id: 25,

        text: `
            Última pergunta desse tipo, por enquanto.<br><br>

            Se alguém importante pra você soubesse — de
            verdade soubesse — tudo o que você fez pra ter
            <strong>[RESPOSTA]</strong> de volta...<br><br>

            <strong>Você acha que ainda mereceria o jeito que
            essa pessoa olha pra você hoje?</strong>
        `,

        type: "options",

        options: [
            "Sim. Eu faria de novo, sem culpa.",
            "Talvez não, mas entenderia por quê.",
            "Não. E é por isso que nunca vou contar."
        ]
    },

    // ==========================================
    // ARCO EMPATIA (26-29) — a 30 é a pergunta final,
    // tratada à parte como "special" (handleQuestionThirty).
    // ==========================================

    {
        id: 26,

        text: `
            Uma pergunta te ocorre, do nada, no meio de um
            dia qualquer.<br><br>

            Ninguém te ajuda de graça.<br>
            Nem mesmo quem diz que ajuda "porque você
            precisava".<br><br>

            Alguma coisa, em algum lugar, tem que dar espaço
            pra <strong>[RESPOSTA]</strong> ter voltado pra
            você.<br><br>

            <strong>Você já parou pra pensar no que — ou em
            quem — pode ter sido trocado por isso?</strong>
        `,

        type: "options",

        options: [
            "Não. Prefiro nem pensar nisso.",
            "Já pensei, mas afastei o pensamento.",
            "Sim. E não consigo parar de pensar."
        ]
    },

    {
        id: 27,

        text: `
            Você cruza com um desconhecido.<br><br>

            Não sabe o nome.<br>
            Não sabe a história.<br><br>

            Mas alguma coisa no jeito como essa pessoa olha
            pro nada — perdida, procurando algo que não está
            mais lá — te incomoda mais do que deveria.<br><br>

            <strong>O que você faz?</strong>
        `,

        type: "options",

        options: [
            "Sigo meu caminho. Não é da minha conta.",
            "Fico pensando nela pelo resto do dia.",
            "Volto e pergunto se ela está bem."
        ]
    },

    {
        id: 28,

        text: `
            Se você tivesse a chance de perguntar pra quem —
            ou pro que — te ajudou, uma única pergunta, sem
            filtro, sem medo da resposta...<br><br>

            <strong>Você perguntaria quem perdeu o que você
            ganhou?</strong>
        `,

        type: "options",

        options: [
            "Não. Prefiro não saber.",
            "Talvez, mas só se a resposta não mudasse nada.",
            "Sim. Eu precisaria saber."
        ]
    },

    {
        id: 29,

        text: `
            Imagine que a resposta fosse um nome.<br><br>

            Um nome de alguém real.<br>
            Alguém que perdeu alguma coisa importante —
            talvez tão importante quanto
            <strong>[RESPOSTA]</strong> era pra você — pro
            seu pedido ser atendido.<br><br>

            <strong>Isso mudaria o que você sente sobre ter
            aceitado a ajuda?</strong>
        `,

        type: "options",

        options: [
            "Não. Eu faria a mesma escolha de novo.",
            "Mudaria como eu penso nisso, mas não voltaria atrás.",
            "Sim. Eu nunca teria aceitado, se soubesse."
        ]
    },

    // ADICIONADO: pergunta 30 — a ÚLTIMA pergunta do formulário
    // completo. "special" porque o conteúdo dela é montado em
    // handleQuestionThirty(), não segue o padrão genérico de
    // texto/opções.

    {
        id: 30,

        text: "",

        type: "special"
    }

];

// ==========================================
// ESTADO
// ==========================================

let currentQuestion = 0;

const answers = [];

let customContinue = null;


// ==========================================
// TOLERÂNCIA AO MEDO
// ==========================================
// Modelo clássico de resposta ao medo: luta, fuga ou congelamento.
// - fightCount   → a pessoa escolheu ENFRENTAR a situação
// - flightCount  → a pessoa escolheu EVITAR / recuar
// - freezeCount  → a pessoa demorou demais e o tempo esgotou, OU
//                  escolheu explicitamente travar (pergunta 14)
//
// Isso é atualizado a cada "escolha de medo" (perguntas 12 e 14)
// e é a base do relatório de perfil gerado no final do arco.

let fightCount = 0;

let flightCount = 0;

let freezeCount = 0;


let lastFearLetter = null;

let lastFearAction = null;

let lastPressureAnswer = null;


// ==========================================
// PERFIL PSICOLÓGICO — PARANOIA / VERGONHA / EMPATIA
// ==========================================
// Cada pergunta de 16 a 29 tem 3 opções com um peso de 0, 1 ou 2.
// O peso é somado ao campo correspondente em `psychScores` assim
// que a resposta é confirmada — ver applyScoreWeights(), chamada
// dentro do listener genérico do continueButton. Pontuação máxima
// por eixo: 10 (5 perguntas × peso 2).

const psychScores = {

    paranoia: 0,

    vergonha: 0,

    empatia: 0

};

// Mapa: id da pergunta -> texto exato da opção -> { campo, peso }.
// Usado por applyScoreWeights() para saber o que somar e onde.

const SCORE_WEIGHTS = {

    16: {
        "Elas não notaram nada.": { campo: "paranoia", peso: 0 },
        "Não sei dizer.": { campo: "paranoia", peso: 1 },
        "Elas sabem de algo e não estão falando.": { campo: "paranoia", peso: 2 }
    },

    17: {
        "Esqueço. Foi só impressão.": { campo: "paranoia", peso: 0 },
        "Fico alerta pelo resto do dia.": { campo: "paranoia", peso: 1 },
        "Tenho certeza de que alguém está me seguindo.": { campo: "paranoia", peso: 2 }
    },

    18: {
        "Coincidência é só coincidência.": { campo: "paranoia", peso: 0 },
        "Talvez exista um padrão, mas não tenho certeza.": { campo: "paranoia", peso: 1 },
        "Tenho certeza de que não é coincidência.": { campo: "paranoia", peso: 2 }
    },

    19: {
        "Não tenho o que contar, ainda não tenho certeza.": { campo: "paranoia", peso: 0 },
        "Tenho medo de não acreditarem em mim.": { campo: "paranoia", peso: 1 },
        "Tenho medo de que a pessoa errada descubra que eu sei.": { campo: "paranoia", peso: 2 }
    },

    20: {
        "Acho que posso estar exagerando.": { campo: "paranoia", peso: 0 },
        "Confio no que sinto.": { campo: "paranoia", peso: 2 }
    },

    21: {
        "Coisa da cabeça dela. Não tem nada a ver comigo.": { campo: "vergonha", peso: 0 },
        "Talvez ela tenha percebido que eu mudei.": { campo: "vergonha", peso: 1 },
        "Ela sabe o que eu fiz.": { campo: "vergonha", peso: 2 }
    },

    22: {
        "Sim, sem hesitar.": { campo: "vergonha", peso: 0 },
        "Contaria uma versão editada.": { campo: "vergonha", peso: 1 },
        "Mentiria completamente.": { campo: "vergonha", peso: 2 }
    },

    23: {
        "Sim, continuo sendo eu.": { campo: "vergonha", peso: 0 },
        "Não tenho certeza.": { campo: "vergonha", peso: 1 },
        "Não. E isso me assusta um pouco.": { campo: "vergonha", peso: 2 }
    },

    24: {
        "Sim, cada uma tem uma explicação boa.": { campo: "vergonha", peso: 0 },
        "Algumas eu prefiro não explicar.": { campo: "vergonha", peso: 1 },
        "Não. Só sei que fiz.": { campo: "vergonha", peso: 2 }
    },

    25: {
        "Sim. Eu faria de novo, sem culpa.": { campo: "vergonha", peso: 0 },
        "Talvez não, mas entenderia por quê.": { campo: "vergonha", peso: 1 },
        "Não. E é por isso que nunca vou contar.": { campo: "vergonha", peso: 2 }
    },

    26: {
        "Não. Prefiro nem pensar nisso.": { campo: "empatia", peso: 0 },
        "Já pensei, mas afastei o pensamento.": { campo: "empatia", peso: 1 },
        "Sim. E não consigo parar de pensar.": { campo: "empatia", peso: 2 }
    },

    27: {
        "Sigo meu caminho. Não é da minha conta.": { campo: "empatia", peso: 0 },
        "Fico pensando nela pelo resto do dia.": { campo: "empatia", peso: 1 },
        "Volto e pergunto se ela está bem.": { campo: "empatia", peso: 2 }
    },

    28: {
        "Não. Prefiro não saber.": { campo: "empatia", peso: 0 },
        "Talvez, mas só se a resposta não mudasse nada.": { campo: "empatia", peso: 1 },
        "Sim. Eu precisaria saber.": { campo: "empatia", peso: 2 }
    },

    29: {
        "Não. Eu faria a mesma escolha de novo.": { campo: "empatia", peso: 0 },
        "Mudaria como eu penso nisso, mas não voltaria atrás.": { campo: "empatia", peso: 1 },
        "Sim. Eu nunca teria aceitado, se soubesse.": { campo: "empatia", peso: 2 }
    }

};

function applyScoreWeights(questionId, answerText) {

    const table =
        SCORE_WEIGHTS[questionId];

    if (!table) {
        return;
    }

    const entry =
        table[answerText];

    if (!entry) {
        return;
    }

    psychScores[entry.campo] += entry.peso;

}

// Classificação por faixa — usada pra paranoia, vergonha e empatia.
// Mesma escala 0-10 dos três eixos, então a mesma função serve
// pros três.

function getScoreLevel(score) {

    if (score <= 2) {
        return "baixa";
    }

    if (score <= 6) {
        return "moderada";
    }

    return "elevada";
}


// ==========================================
// TELA PRETA
// ==========================================

function blackScreenMessage(message, duration, callback) {

    blackMessage.innerHTML =
        message;

    blackScreen.classList.add("active");


    setTimeout(function() {

        blackScreen.classList.remove("active");


        setTimeout(function() {

            if (callback) {
                callback();
            }

        }, 500);

    }, duration);

}


// ==========================================
// PROGRESSO (helper)
// ==========================================

function updateProgress(questionNumber) {

    progressElement.textContent =
        String(questionNumber).padStart(2, "0")
        + " / "
        + String(questions.length).padStart(2, "0");

}


// ==========================================
// PRÓXIMA PERGUNTA
// ==========================================

function nextQuestion() {

    if (currentQuestion >= questions.length - 1) {

        finishQuestionnaire();

        return;
    }


    questionBox.classList.add("fade");


    setTimeout(function() {

        currentQuestion++;

        customContinue = null;


        showQuestion();


        setTimeout(function() {

            questionBox.classList.remove("fade");

        }, 100);

    }, 600);

}


// ==========================================
// MOSTRAR PERGUNTA
// ==========================================

function showQuestion() {

    const question =
        questions[currentQuestion];


    if (!question) {
        return;
    }


    // ======================================
    // LIMPAR ESTADO VISUAL
    // ======================================

    optionsElement.innerHTML = "";

    errorElement.textContent = "";

    customContinue = null;

    continueButton.style.display =
        "block";


    // ======================================
    // PROGRESSO
    // ======================================

    updateProgress(currentQuestion + 1);


    // ======================================
    // PERGUNTAS ESPECIAIS
    // ======================================

    if (question.id === 9) {

        handleQuestionNine();

        return;
    }


    if (question.id === 10) {

        handleQuestionTen();

        return;
    }


    if (question.id === 11) {

        handleQuestionEleven();

        return;
    }

    if (question.id === 12) {

        handleQuestionTwelve();

        return;
    }


    if (question.id === 13) {

        handleQuestionThirteen();

        return;
    }


    if (question.id === 14) {

        handleQuestionFourteen();

        return;
    }

    // ADICIONADO: dispatch da pergunta 15.

    if (question.id === 15) {

        handleQuestionFifteen();

        return;
    }

    // ADICIONADO: dispatch da pergunta 30 (final do formulário).
    // 16-29 NÃO precisam de entrada aqui — são "options" comuns e
    // caem no fluxo padrão logo abaixo, igual às perguntas 1-8.

    if (question.id === 30) {

        handleQuestionThirty();

        return;
    }

    // ======================================
    // TEXTO NORMAL DA PERGUNTA
    // ======================================

    let questionText =
        question.text;


    questionText =
        questionText.replaceAll(
            "[RESPOSTA]",
            escapeHTML(
                getFirstAnswer()
            )
        );


    questionElement.innerHTML =
        questionText;


    instructionElement.textContent =
        question.instruction || "";


    // ======================================
    // PERGUNTA DE TEXTO
    // ======================================

    if (question.type === "text") {

        const input =
            document.createElement("input");


        input.type =
            "text";


        input.className =
            "text-answer";


        input.placeholder =
            "Escreva aqui...";


        input.autocomplete =
            "off";


        optionsElement.appendChild(
            input
        );

    }


    // ======================================
    // PERGUNTA DE OPÇÕES
    // ======================================

    if (question.type === "options") {

        question.options.forEach(
            function(optionText) {

                const button =
                    document.createElement("button");


                button.className =
                    "option";


                button.textContent =
                    optionText;


                button.addEventListener(
                    "click",
                    function() {

                        selectOption(
                            button,
                            optionText
                        );

                    }
                );


                optionsElement.appendChild(
                    button
                );

            }
        );

    }

}
// ==========================================
// PRIMEIRA RESPOSTA
// ==========================================

function getFirstAnswer() {

    if (
        typeof answers[0] === "string"
    ) {

        return answers[0];
    }


    return "";
}


// ==========================================
// SELECIONAR OPÇÃO
// ==========================================

function selectOption(
    button,
    optionText
) {

    playSound("click");


    document
        .querySelectorAll(".option")
        .forEach(function(option) {

            option.classList.remove(
                "selected"
            );

        });


    button.classList.add(
        "selected"
    );


    answers[currentQuestion] =
        optionText;

}


// ==========================================
// BOTÃO CONTINUAR
// ==========================================

continueButton.addEventListener(
    "click",
    function() {

        playSound("click");


        // ======================================
        // FUNÇÃO ESPECIAL
        // ======================================

        if (customContinue !== null) {

            customContinue();

            return;
        }


        const question =
            questions[currentQuestion];


        if (!question) {
            return;
        }


        let answer = null;


        // ======================================
        // TEXTO
        // ======================================

        if (question.type === "text") {

            const input =
                document.querySelector(
                    ".text-answer"
                );


            if (!input) {
                return;
            }


            answer =
                input.value.trim();


            if (!answer) {

                errorElement.textContent =
                    "Responda antes de continuar.";

                return;
            }
        }


        // ======================================
        // OPÇÕES
        // ======================================

        if (question.type === "options") {

            answer =
                answers[currentQuestion];


            if (!answer) {

                errorElement.textContent =
                    "Escolha uma resposta.";

                return;
            }
        }


        // ======================================
        // SALVAR
        // ======================================

        answers[currentQuestion] =
            answer;

        // ADICIONADO: registra no log cronológico do relatório.
        // Cobre as perguntas 1, 2, 3, 4, 6, 7 e 8 (a 5 não tem
        // resposta própria, então `answer` fica null e é ignorado
        // dentro de logAnswer()).

        logAnswer(
            "Pergunta " + question.id,
            answer
        );

        // ADICIONADO: soma o peso da resposta (se a pergunta tiver
        // uma entrada em SCORE_WEIGHTS — perguntas 16 a 29) no eixo
        // correspondente (paranoia / vergonha / empatia). Perguntas
        // sem entrada (1, 2, 3, 4, 6, 7, 8) simplesmente não fazem
        // nada aqui, então nada muda pra elas.

        applyScoreWeights(
            question.id,
            answer
        );


        // ======================================
        // 03
        // ======================================

        if (currentQuestion === 2) {

            handleQuestionThree(
                answer
            );

            return;
        }


        // ======================================
        // 04
        // ======================================

        if (currentQuestion === 3) {

            handleQuestionFour();

            return;
        }


        // ======================================
        // 05
        // ======================================

        if (currentQuestion === 4) {

            handleQuestionFive();

            return;
        }


        // ======================================
        // 06
        // ======================================

        if (currentQuestion === 5) {

            handleQuestionSix(
                answer
            );

            return;
        }


        // ======================================
        // 07
        // ======================================

        if (currentQuestion === 6) {

            handleQuestionSeven(
                answer
            );

            return;
        }


        // ======================================
        // 08
        // ======================================

        if (currentQuestion === 7) {

            handleQuestionEight(
                answer
            );

            return;
        }


        // ======================================
        // FLUXO NORMAL
        // ======================================

        nextQuestion();

    }
);


// ==========================================
// PERGUNTA 03
// ==========================================

function handleQuestionThree(answer) {

    if (answer === "Sim.") {

        showLimitQuestion();

        return;
    }


    if (answer === "Não.") {

        showQuestionThreeNo();

        return;
    }


    if (answer === "Não sei.") {

        showQuestionThreeDontKnow();

        return;
    }

}


// ==========================================
// 03 - SIM
// ==========================================

function showLimitQuestion() {

    questionElement.innerHTML =
        "Qual é o seu limite?";


    instructionElement.textContent =
        "Responda livremente.";


    optionsElement.innerHTML =
        "";


    errorElement.textContent =
        "";


    continueButton.style.display =
        "block";


    const input =
        document.createElement("input");


    input.type = "text";


    input.className =
        "text-answer";


    input.placeholder =
        "Escreva aqui...";


    input.autocomplete =
        "off";


    optionsElement.appendChild(
        input
    );


    customContinue =
        function() {

            const answer =
                input.value.trim();


            if (!answer) {

                errorElement.textContent =
                    "Responda antes de continuar.";

                return;
            }


            answers.push({

                pergunta:
                    "03A - Limite",

                resposta:
                    answer

            });

            logAnswer("03A - Limite", answer);


            customContinue =
                null;


            showPrideQuestion();

        };

}


// ==========================================
// 03 - ORGULHO
// ==========================================

function showPrideQuestion() {

    questionElement.innerHTML = `
        Você acha que <strong>${escapeHTML(
            getFirstAnswer()
        )}</strong> se orgulharia da sua resposta?
    `;


    instructionElement.textContent =
        "";


    optionsElement.innerHTML =
        "";


    errorElement.textContent =
        "";


    continueButton.style.display =
        "none";


    createYesNoButtons(
        function(answer) {

            answers.push({

                pergunta:
                    "03A - Orgulho",

                resposta:
                    answer

            });

            logAnswer("03A - Orgulho", answer);


            nextQuestion();

        }
    );

}


// ==========================================
// 03 - NÃO
// ==========================================

function showQuestionThreeNo() {

    questionElement.innerHTML =
        "Você tem certeza?";


    instructionElement.textContent =
        "";


    optionsElement.innerHTML =
        "";


    errorElement.textContent =
        "";


    continueButton.style.display =
        "none";


    createYesNoButtons(
        function(answer) {

            answers.push({

                pergunta:
                    "03B - Certeza",

                resposta:
                    answer

            });

            logAnswer("03B - Certeza", answer);


            nextQuestion();

        }
    );

}


// ==========================================
// 03 - NÃO SEI
// ==========================================

function showQuestionThreeDontKnow() {

    continueButton.style.display =
        "none";


    blackScreenMessage(
        `
        Interessante.<br><br>

        Dúvidas são válidas.<br><br>

        Mas você deveria não saber de algo assim
        quando ama tanto
        <strong class="shake-word">${escapeHTML(
            getFirstAnswer()
        )}</strong>?
        `,

        5000,

        function() {

            showChateariaQuestion();

        }
    );

}


// ==========================================
// 03 - NÃO SEI - CHATEARIA
// ==========================================

function showChateariaQuestion() {

    questionElement.innerHTML = `
        Você acha que <strong>${escapeHTML(
            getFirstAnswer()
        )}</strong> se chatearia com sua resposta?
    `;


    instructionElement.textContent =
        "";


    optionsElement.innerHTML =
        "";


    errorElement.textContent =
        "";


    continueButton.style.display =
        "none";


    createYesNoButtons(
        function(answer) {

            answers.push({

                pergunta:
                    "03C - Chatearia",

                resposta:
                    answer

            });

            logAnswer("03C - Chatearia", answer);


            nextQuestion();

        }
    );

}


// ==========================================
// BOTÕES SIM / NÃO
// ==========================================

function createYesNoButtons(callback) {

    ["Sim.", "Não."].forEach(
        function(text) {

            const button =
                document.createElement("button");


            button.className =
                "option";


            button.textContent =
                text;


            button.addEventListener(
                "click",
                function() {

                    playSound("click");


                    document
                        .querySelectorAll(".option")
                        .forEach(
                            function(option) {

                                option.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    button.classList.add(
                        "selected"
                    );


                    callback(text);

                }
            );


            optionsElement.appendChild(
                button
            );

        }
    );

}


// ADICIONADO: variante de createYesNoButtons com três opções, usada
// na decisão final da pergunta 14 (a pessoa escolhe ativamente
// enfrentar, fugir ou travar — em vez de o congelamento acontecer
// só por estourar o tempo, como na pergunta 13).

function createFearChoiceButtons(callback) {

    ["Enfrentar.", "Fugir.", "Congelar."].forEach(
        function(text) {

            const button =
                document.createElement("button");

            button.className =
                "option";

            button.textContent =
                text;

            button.addEventListener(
                "click",
                function() {

                    playSound("click");

                    document
                        .querySelectorAll(".option")
                        .forEach(function(option) {

                            option.classList.remove("selected");
                            option.disabled = true;

                        });

                    button.classList.add("selected");

                    callback(text);

                }
            );

            optionsElement.appendChild(button);

        }
    );

}


// ==========================================
// PERGUNTA 04
// ==========================================

function handleQuestionFour() {

    playSound("horror");


    continueButton.style.display =
        "block";


    blackScreenMessage(
        `
        POR QUÊ?
        `,

        2500,

        function() {

            questionElement.innerHTML =
                "Por quê?";


            instructionElement.textContent =
                "Explique sua resposta.";


            optionsElement.innerHTML =
                "";


            errorElement.textContent =
                "";


            const input =
                document.createElement(
                    "textarea"
                );


            input.className =
                "text-answer";


            input.placeholder =
                "Escreva aqui...";


            input.autocomplete =
                "off";


            optionsElement.appendChild(
                input
            );


            customContinue =
                function() {

                    const answer =
                        input.value.trim();


                    if (!answer) {

                        errorElement.textContent =
                            "Responda antes de continuar.";

                        return;
                    }


                    answers.push({

                        pergunta:
                            "04 - Por quê?",

                        resposta:
                            answer

                    });

                    logAnswer("04 - Por quê?", answer);


                    customContinue =
                        null;


                    blackScreenMessage(
                        `
                        registrado.
                        `,

                        4000,

                        function() {

                            nextQuestion();

                        }
                    );

                };

        }
    );

}


// ==========================================
// PERGUNTA 05
// ==========================================

function handleQuestionFive() {

    continueButton.style.display =
        "none";


    blackScreenMessage(
        `
        PROCESSANDO...
        `,

        1500,

        function() {

            blackScreenMessage(
                `
                .
                `,

                500,

                function() {

                    nextQuestion();

                }
            );

        }
    );

}


// ==========================================
// PERGUNTA 06
// ==========================================

function handleQuestionSix(answer) {

    answers[currentQuestion] =
        answer;


    continueButton.style.display =
        "block";


    blackScreenMessage(
        `
        registrado.
        `,

        1200,

        function() {

            nextQuestion();

        }
    );

}


// ==========================================
// PERGUNTA 07
// ==========================================

function handleQuestionSeven(answer) {

    answers[currentQuestion] =
        answer;


    if (answer === "Sim.") {

        nextQuestion();

        return;
    }


    if (answer === "Não.") {

        showQuestionSevenDoubt();

        return;
    }

}


// ==========================================
// 07 - RECUSA
// ==========================================

function showQuestionSevenDoubt() {

    questionElement.innerHTML = `
        Você não pediria?
    `;


    instructionElement.textContent =
        "Mesmo sabendo que ela pode devolver.";


    optionsElement.innerHTML =
        "";


    errorElement.textContent =
        "";


    continueButton.style.display =
        "none";


    createYesNoButtons(
        function(answer) {

            answers.push({

                pergunta:
                    "07A - Mesmo sabendo",

                resposta:
                    answer

            });

            logAnswer("07A - Mesmo sabendo", answer);


            blackScreenMessage(
                `
                Tudo bem.
                `,

                1200,

                function() {

                    nextQuestion();

                }
            );

        }
    );

}


// ==========================================
// PERGUNTA 08
// ==========================================

function handleQuestionEight(answer) {

    answers[currentQuestion] =
        answer;


    nextQuestion();

}


// ==========================================
// PERGUNTA 09
// ==========================================

function handleQuestionNine() {

    continueButton.style.display =
        "none";


    blackScreenMessage(
        `
        Você sabe que deveria desconfiar.
        `,

        2500,

        function() {

            questionElement.innerHTML = `
                Você olha para
                <strong>${escapeHTML(
                    getFirstAnswer()
                )}</strong>.
                <br><br>

                Está exatamente como antes.<br><br>

                Você não quer perder novamente.<br><br>

                A pessoa estende a mão.<br><br>

                <strong>Você aceita a ajuda?</strong>
            `;


            instructionElement.textContent =
                "";


            optionsElement.innerHTML =
                "";


            errorElement.textContent =
                "";


            continueButton.style.display =
                "none";


            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "option";


            button.textContent =
                "Aceitar.";


            button.addEventListener(
                "click",
                function() {

                    playSound("click");


                    button.classList.add(
                        "selected"
                    );


                    answers.push({

                        pergunta:
                            "09 - Aceitação",

                        resposta:
                            "Aceitar."

                    });

                    logAnswer("09 - Aceitação", "Aceitar.");


                    nextQuestion();

                }
            );


            optionsElement.appendChild(
                button
            );

        }
    );

}


// ==========================================
// PERGUNTA 10
// ==========================================

function handleQuestionTen() {

    continueButton.style.display =
        "none";


    playSound("porque");


    blackScreenMessage(
        `
        Obrigado.<br><br>

        Você fez a escolha certa.<br><br>

        <span class="shake-word">
            Não fez?
        </span>
        `,

        5000,

        function() {

            nextQuestion();

        }
    );

}


// ==========================================
// PERGUNTA 11
// ==========================================

function handleQuestionEleven() {


    questionElement.innerHTML = `
        Algumas coisas são assustadoras antes mesmo
        de acontecerem.<br><br>

        O medo nem sempre avisa quando chega.<br>
        Às vezes, ele só deixa uma sensação estranha
        de que alguma coisa está errada.<br><br>

        Imagine que você está sozinho.<br><br>

        Qual destas situações faria você
        abandonar o local imediatamente?
    `;


    instructionElement.textContent =
        "Escolha apenas uma.";


    optionsElement.innerHTML =
        "";


    errorElement.textContent =
        "";


    continueButton.style.display =
        "block";


    const situations = [

        {
            letter: "A",

            text: `
                Você está sozinho em casa e ouve
                passos pesados caminhando pelo corredor.
            `
        },


        {
            letter: "B",

            text: `
                Você percebe alguém observando você
                de longe, mas as feições do rosto
                parecem apagadas.
            `
        },


        {
            letter: "C",

            text: `
                Você está em uma rua que conhece
                desde a infância e, de repente,
                percebe que não reconhece
                absolutamente nada ao seu redor.
            `
        },


        {
            letter: "D",

            text: `
                A tela do seu celular acende.
                É uma mensagem de um número que
                pertencia a alguém que já morreu.
            `
        },


        {
            letter: "E",

            text: `
                Você entra em um quarto e percebe
                que alguém que você ama desapareceu.
                Não há sinais de luta.
                Apenas o espaço vazio onde essa pessoa
                deveria estar.
            `
        }

    ];


    situations.forEach(
        function(situation) {

            const button =
                document.createElement("button");


            button.className =
                "option";


            button.innerHTML = `
                <strong>${situation.letter})</strong>
                ${situation.text}
            `;


            button.addEventListener(
                "click",
                function() {

                    document
                        .querySelectorAll(".option")
                        .forEach(
                            function(option) {

                                option.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    button.classList.add(
                        "selected"
                    );


                    answers[currentQuestion] = {

                        pergunta:
                            "11 - Medo",

                        resposta:
                            situation.letter

                    };


                    lastFearLetter =
                        situation.letter;


                    errorElement.textContent =
                        "";

                }
            );


            optionsElement.appendChild(
                button
            );

        }
    );


    // ======================================
    // CONTINUAR DA PERGUNTA 11
    // ======================================

    customContinue =
        function() {

            const answer =
                answers[currentQuestion];


            if (!answer) {

                errorElement.textContent =
                    "Escolha uma resposta.";

                return;
            }

            logAnswer("11 - Medo (situação)", answer.resposta);


            customContinue =
                null;


            nextQuestion();

        };

}


// ==========================================
// PERGUNTA 12 — AS CINCO CENAS
// ==========================================

const SCENES_12 = {

    A: {

        sound: "qa1",

        scene: `
            Você está em casa.<br><br>

            Não há nada particularmente diferente.<br><br>

            A televisão está desligada.<br>
            As luzes estão acesas onde você costuma deixá-las.<br>
            Você reconhece cada objeto ao seu redor.<br><br>

            Então você ouve.<br><br>

            <strong>Um passo.</strong><br><br>

            ...<br><br>

            Você espera.<br>
            Nada.<br><br>

            Talvez tenha sido alguma coisa caindo.<br>
            Talvez o som tenha vindo da rua.<br>
            Talvez você tenha imaginado.<br><br>

            Você continua parado.<br><br>

            <strong>Outro passo.</strong><br><br>

            Dessa vez, não há dúvida.<br>
            Veio do corredor.<br><br>

            Você olha para lá.<br>
            O corredor está vazio.<br><br>

            Você conhece aquele corredor.<br>
            Conhece o tamanho dele.<br>
            Conhece a distância entre a porta e a parede.<br><br>

            Não existe espaço suficiente para alguém
            estar escondido ali.<br><br>

            ...<br><br>

            <strong>Então vem outro passo.</strong><br><br>

            Mais perto.<br><br>

            Você percebe uma coisa que não tinha
            percebido antes.<br><br>

            A porta do cômodo no final do corredor
            está aberta.<br><br>

            Você não lembra de tê-la deixado assim.
        `,

        question: "Você iria verificar o corredor?"

    },


    B: {

        sound: "qa2",

        scene: `
            Você olha pela janela.<br><br>

            Não havia motivo para olhar.<br>
            Talvez tenha sido apenas um movimento
            no canto do olho.<br><br>

            Lá fora, tudo parece normal.<br><br>

            A rua.<br>
            As casas.<br>
            Os postes.<br>
            As sombras.<br><br>

            ...<br><br>

            Então você percebe uma pessoa.<br><br>

            Está longe.<br>
            Longe demais para que você consiga
            enxergar o rosto.<br><br>

            Ela está parada.<br>
            Não parece estar indo para lugar nenhum.<br>
            Não parece estar esperando ninguém.<br>
            Apenas está ali.<br><br>

            Você continua olhando.<br>
            A pessoa não se move.<br><br>

            Você tenta enxergar melhor.<br>
            E percebe algo estranho.<br><br>

            Não é que o rosto esteja escondido.<br><br>

            <strong>Você simplesmente não consegue
            encontrar os traços dele.</strong><br><br>

            Não há olhos.<br>
            Não há boca.<br>
            Não há expressão.<br><br>

            Apenas uma área escura onde um rosto
            deveria estar.<br><br>

            Você pisca.<br>
            A pessoa continua ali.<br><br>

            Você olha para outro lugar por um segundo.<br>
            Quando olha novamente...<br><br>

            <strong>ela está mais perto.</strong><br><br>

            Não muito.<br>
            Apenas o suficiente para que você tenha
            certeza de que não estava imaginando.<br><br>

            Você fecha a cortina.<br><br>

            ...<br><br>

            E então percebe.<br><br>

            A janela está refletindo o interior
            da sua casa.<br><br>

            Você consegue ver a si mesmo no vidro.<br>
            Consegue ver o sofá.<br>
            A parede.<br>
            A porta.<br>
            Tudo.<br><br>

            Menos uma coisa.<br><br>

            <strong>O reflexo da pessoa.</strong><br><br>

            Você olha para trás.<br>
            Não há ninguém.<br><br>

            Olha novamente para a janela.<br>
            A pessoa ainda está lá.
        `,

        question: "Você continuaria olhando pela janela?"

    },


    C: {

        sound: "qa3",

        scene: `
            Você está em um lugar que conhece.<br><br>

            Talvez seja sua rua.<br>
            Talvez seja o caminho que você faz
            todos os dias.<br><br>

            Você saberia chegar em casa de olhos
            fechados.<br><br>

            A padaria está ali.<br>
            O poste está ali.<br>
            O muro está ali.<br>
            A esquina também.<br><br>

            Tudo está exatamente onde deveria estar.<br><br>

            ...<br><br>

            Exceto que você não reconhece nada.<br><br>

            Você olha para a casa à sua frente.<br>
            Sabe que já viu aquela casa centenas
            de vezes.<br><br>

            Mas não consegue lembrar quem mora ali.<br><br>

            Você olha para o número.<br>
            O número parece familiar.<br>
            Familiar demais.<br><br>

            Você sabe que deveria saber o que
            significa.<br>
            Mas não sabe.<br><br>

            Você continua andando.<br><br>

            Uma esquina.<br>
            Depois outra.<br><br>

            Então você percebe que voltou para
            o mesmo lugar.<br><br>

            O mesmo poste.<br>
            O mesmo muro.<br>
            A mesma casa.<br><br>

            Você olha para trás.<br>
            A rua continua.<br><br>

            Você anda novamente.<br>
            Dessa vez, presta atenção.<br><br>

            Não pode estar errado.<br><br>

            Dez passos.<br>
            Vinte.<br>
            Trinta.<br><br>

            Você chega a uma esquina.<br>
            Vira.<br><br>

            E está diante da sua própria casa.<br><br>

            Só que alguma coisa está errada.<br><br>

            Você reconhece a casa.<br>
            Reconhece a porta.<br>
            Reconhece a janela.<br>
            Reconhece tudo.<br><br>

            <strong>Mas não reconhece o lugar
            onde ela está.</strong><br><br>

            Como se alguém tivesse colocado sua casa
            em uma rua onde ela nunca existiu.
        `,

        question: "Você entraria?"

    },


    D: {

        sound: "qa4",

        scene: `
            Seu celular acende.<br><br>

            Você não ouviu nenhuma notificação.<br>
            A tela simplesmente acendeu.<br><br>

            Uma mensagem.<br><br>

            Você olha para o número.<br>
            Não reconhece.<br><br>

            Então vê o nome.<br><br>

            ...<br><br>

            Você conhece aquele nome.<br>
            Conhece muito bem.<br><br>

            O suficiente para não precisar ler
            duas vezes.<br><br>

            Você fica olhando para a tela.<br><br>

            O contato não deveria mais existir.<br>
            Você sabe disso.<br><br>

            Mesmo assim, ele está ali.<br><br>

            Uma mensagem recebida.<br><br>

            <strong>"Oi."</strong><br><br>

            Apenas isso.<br><br>

            Você não responde.<br>
            A tela permanece acesa.<br><br>

            Depois de alguns segundos:<br><br>

            <strong>"Você está aí?"</strong><br><br>

            Seu corpo fica imóvel.<br><br>

            Não há mais nenhuma mensagem.<br><br>

            Você olha para a porta.<br>
            Depois para a janela.<br>
            Depois para o celular.<br><br>

            Outra mensagem.<br><br>

            <strong>"Eu sei que você está."</strong><br><br>

            ...<br><br>

            Você percebe então uma coisa.<br><br>

            A última mensagem não diz onde a pessoa
            está.<br>
            Não diz como ela sabe.<br>
            Não diz por que voltou.<br><br>

            Apenas afirma que sabe.<br><br>

            Você olha novamente para a conversa.<br><br>

            E vê uma terceira mensagem sendo
            digitada.<br><br>

            Os três pontos aparecem.<br>
            Desaparecem.<br>
            Aparecem novamente.
        `,

        question: "Você espera a próxima mensagem?"

    },


    E: {

        sound: "qa5",

        scene: `
            Você entra em um cômodo.<br><br>

            Não há nada de errado.<br><br>

            A luz está acesa.<br>
            Os objetos estão onde deveriam estar.<br>
            Tudo parece normal.<br><br>

            ...<br><br>

            Exceto que alguém está faltando.<br><br>

            Você sabe quem deveria estar ali.<br>
            Não precisa pensar.<br><br>

            Seu corpo percebe antes da sua cabeça.<br><br>

            Você procura pela pessoa.<br>
            Nada.<br><br>

            Você chama.<br>
            Nenhuma resposta.<br><br>

            Você olha ao redor.<br><br>

            Não há sinais de luta.<br>
            Nada quebrado.<br>
            Nada fora do lugar.<br><br>

            A cadeira continua ali.<br>
            A porta continua fechada.<br>
            O copo continua sobre a mesa.<br><br>

            Tudo está exatamente como estava.<br><br>

            <strong>Menos a pessoa.</strong><br><br>

            Você pega o celular.<br>
            Procura o contato.<br>
            Está lá.<br><br>

            Você liga.<br><br>

            ...<br><br>

            Chamada encerrada.<br><br>

            Você tenta novamente.<br>
            Dessa vez chama.<br><br>

            Uma vez.<br>
            Duas.<br>
            Três.<br><br>

            Você escuta o toque vindo de algum lugar.<br><br>

            Não do celular.<br><br>

            <strong>De dentro da casa.</strong><br><br>

            Você fica parado.<br>
            O toque continua.<br><br>

            Você sabe que o telefone daquela pessoa
            deveria estar com ela.<br><br>

            Mas o som vem de outro cômodo.<br><br>

            Você segue o som.<br>
            Ele para.<br>
            Silêncio.<br><br>

            Então seu próprio celular vibra.<br><br>

            Uma mensagem.<br>
            De alguém que você acabou de procurar.<br><br>

            <strong>"Não vem me procurar."</strong>
        `,

        question: "Você abriria a porta?"

    }

};


function handleQuestionTwelve() {

    continueButton.style.display =
        "none";


    optionsElement.innerHTML =
        "";


    errorElement.textContent =
        "";


    instructionElement.textContent =
        "";


    const fearAnswer =
        answers[10];

    const letter =
        (fearAnswer && fearAnswer.resposta)
            ? fearAnswer.resposta
            : "A";

    const scene =
        SCENES_12[letter] || SCENES_12.A;


    blackScreenMessage(
        `
        <strong>Você sente a presença?</strong>
        `,

        3000,

        function() {

            playSound(scene.sound);


            questionElement.innerHTML =
                scene.scene
                + `<br><br><strong>${scene.question}</strong>`;


            optionsElement.innerHTML =
                "";


            continueButton.style.display =
                "none";


            createYesNoButtons(
                function(answer) {

                    lastFearAction =
                        answer;


                    if (answer === "Sim.") {

                        fightCount++;

                    } else {

                        flightCount++;

                    }


                    answers[currentQuestion] = {

                        pergunta:
                            "12 - " + letter,

                        resposta:
                            answer

                    };

                    logAnswer("12 - Reação (" + letter + ")", answer);


                    nextQuestion();

                }
            );

        }
    );

}


// ==========================================
// ESCOLHA COM TEMPO (técnica de pressão)
// ==========================================

function createTimedYesNoButtons(callback, seconds) {

    let secondsLeft =
        seconds;


    errorElement.textContent =
        secondsLeft + "s";


    const countdown =
        setInterval(
            function() {

                secondsLeft--;


                if (secondsLeft <= 0) {

                    clearInterval(
                        countdown
                    );


                    document
                        .querySelectorAll(".option")
                        .forEach(
                            function(option) {

                                option.disabled =
                                    true;

                            }
                        );


                    freezeCount++;


                    errorElement.textContent =
                        "";


                    callback("Silêncio.");


                    return;
                }


                errorElement.textContent =
                    secondsLeft + "s";

            },
            1000
        );


    ["Sim.", "Não."].forEach(
        function(text) {

            const button =
                document.createElement("button");


            button.className =
                "option";


            button.textContent =
                text;


            button.addEventListener(
                "click",
                function() {

                    clearInterval(
                        countdown
                    );


                    playSound("click");


                    document
                        .querySelectorAll(".option")
                        .forEach(
                            function(option) {

                                option.classList.remove(
                                    "selected"
                                );

                                option.disabled =
                                    true;

                            }
                        );


                    button.classList.add(
                        "selected"
                    );


                    errorElement.textContent =
                        "";


                    callback(text);

                }
            );


            optionsElement.appendChild(
                button
            );

        }
    );

}


// ==========================================
// PERGUNTA 13 — INTENSIFICAÇÃO
// ==========================================

const SCENES_13 = {

    A: {

        confrontou: `
            Você foi até o corredor.<br><br>

            Não havia ninguém.<br><br>

            Você respira fundo.<br>
            Talvez tenha sido só isso.<br><br>

            Você se vira para voltar.<br><br>

            <strong>E ouve o passo atrás de você.</strong><br><br>

            Bem perto.<br><br>

            Perto o suficiente pra você sentir
            que não está mais sozinho no corredor
            — está sozinho <em>com alguma coisa</em>.
        `,

        evitou: `
            Você não foi verificar.<br><br>

            Ficou onde estava.<br><br>

            Os passos pararam.<br><br>

            Por um segundo, você quase relaxa.<br><br>

            Então percebe uma coisa.<br><br>

            <strong>Os passos pararam bem do lado
            de fora da porta do seu quarto.</strong>
        `

    },


    B: {

        confrontou: `
            Você continuou olhando pela janela.<br><br>

            A pessoa sem rosto não se move.<br><br>

            Mas agora você percebe outra coisa.<br><br>

            <strong>Ela está olhando exatamente
            para a janela onde você está.</strong><br><br>

            Não para a casa.<br>
            Não para a rua.<br><br>

            Para você.
        `,

        evitou: `
            Você fechou a cortina de vez.<br><br>

            A sala fica mais escura.<br><br>

            Você respira fundo, tentando se
            convencer de que está tudo bem.<br><br>

            Então ouve uma batida leve.<br><br>

            <strong>Vem do vidro da janela,
            atrás da cortina fechada.</strong>
        `

    },


    C: {

        confrontou: `
            Você entrou em casa mesmo assim.<br><br>

            Por dentro, tudo parece normal.<br><br>

            Os móveis.<br>
            As fotos.<br>
            O cheiro.<br><br>

            Você quase se convence de que
            imaginou tudo.<br><br>

            Então você olha para uma das fotos
            na parede.<br><br>

            <strong>Você está nela.<br>
            Mas não se lembra de tirar
            essa foto.</strong>
        `,

        evitou: `
            Você não entrou.<br><br>

            Ficou parado na calçada, olhando
            para a própria casa.<br><br>

            Ela continua ali.<br>
            Do jeito errado.<br><br>

            Você decide ir embora.<br><br>

            Anda alguns passos.<br><br>

            <strong>E percebe que a rua, atrás de
            você, já não existe mais.</strong>
        `

    },


    D: {

        confrontou: `
            Você espera a próxima mensagem.<br><br>

            Os três pontos somem.<br><br>

            Nada chega por um bom tempo.<br><br>

            Você quase guarda o celular.<br><br>

            Então uma última mensagem aparece.<br><br>

            <strong>"Estou mais perto do que
            você imagina."</strong><br><br>

            Você olha ao redor do cômodo
            onde está.
        `,

        evitou: `
            Você bloqueia o número.<br><br>

            A conversa some da tela.<br><br>

            Você solta o ar que nem sabia
            que estava prendendo.<br><br>

            Uma nova notificação aparece.<br><br>

            <strong>De um número diferente.<br>
            Com a mesma primeira mensagem:
            "Oi."</strong>
        `

    },


    E: {

        confrontou: `
            Você abre a porta.<br><br>

            O cômodo está vazio.<br><br>

            Nenhum sinal de ninguém.<br><br>

            Você entra mesmo assim.<br><br>

            No chão, perto da janela, tem uma
            coisa que você reconhece.<br><br>

            <strong>É algo que pertence a você —
            e você nunca trouxe pra esse
            cômodo.</strong>
        `,

        evitou: `
            Você não abre a porta.<br><br>

            Fica parado do lado de fora,
            ouvindo o silêncio.<br><br>

            Seu celular vibra de novo.<br><br>

            Outra mensagem da mesma pessoa
            que "desapareceu".<br><br>

            <strong>"Obrigado por não ter entrado.
            Ainda não."</strong>
        `

    }

};


function handleQuestionThirteen() {

    continueButton.style.display =
        "none";


    optionsElement.innerHTML =
        "";


    errorElement.textContent =
        "";


    instructionElement.textContent =
        "";


    const letter =
        lastFearLetter || "A";

    const action =
        (lastFearAction === "Sim.")
            ? "confrontou"
            : "evitou";

    const scene =
        (SCENES_13[letter] && SCENES_13[letter][action])
            ? SCENES_13[letter][action]
            : SCENES_13.A.confrontou;


    questionElement.innerHTML =
        scene
        + `<br><br><strong>Você fica olhando, sem se mexer?</strong>`;


    instructionElement.textContent =
        "Você tem pouco tempo para decidir.";


    createTimedYesNoButtons(
        function(answer) {

            lastPressureAnswer =
                answer;


            answers.push({

                pergunta:
                    "13 - Pressão (" + letter + "/" + action + ")",

                resposta:
                    answer

            });

            logAnswer("13 - Pressão (" + letter + "/" + action + ")", answer);


            blackScreenMessage(
                `
                registrado.
                `,

                1200,

                function() {

                    nextQuestion();

                }
            );

        },

        6
    );

}


// ==========================================
// PERGUNTA 14 — DECISÃO FINAL DA CENA
// ==========================================
// ATUALIZADO: antes esta pergunta só mostrava a narrativa reagindo
// à pergunta 13 (SCENES_14) e depois liberava o botão "continuar"
// sem nenhuma escolha real. Agora ela termina com uma decisão
// ativa (Enfrentar / Fugir / Congelar), que é o segundo ponto de
// dados do perfil de medo — junto com a pergunta 12, isso dá uma
// leitura bem mais confiável de tendência do jogador do que um
// único momento isolado.

const SCENES_14 = {

    "Sim.": `
        Você ficou olhando.<br><br>

        Sem se mexer.<br>
        Sem piscar direito.<br><br>

        E nada aconteceu.<br><br>

        Nenhum barulho.<br>
        Nenhum movimento.<br>
        Nenhuma explicação.<br><br>

        Só o tempo passando, devagar demais,
        enquanto você espera alguma coisa
        que não vem.<br><br>

        Você começa a se perguntar
        há quanto tempo está parado ali.<br><br>

        Um minuto?<br>
        Dez?<br><br>

        Você não sabe dizer.<br><br>

        E existe uma sensação, pequena,
        no fundo do estômago:<br><br>

        <strong>a de que ficar olhando
        talvez tenha sido exatamente
        o que ela queria.</strong>
    `,

    "Não.": `
        Você não conseguiu continuar olhando.<br><br>

        Desviou o olhar por um segundo.<br>
        Só um.<br><br>

        Tempo suficiente.<br><br>

        Quando você olha de volta,
        não tem como ter certeza
        de que nada mudou.<br><br>

        Talvez esteja tudo igual.<br><br>

        Talvez não.<br><br>

        Você não vai saber ao certo —<br>
        e é exatamente essa dúvida
        que não sai da sua cabeça:<br><br>

        <strong>o que você não viu,
        no segundo em que olhou
        para outro lugar.</strong>
    `,

    "Silêncio.": `
        O tempo acabou antes de você decidir.<br><br>

        Você não escolheu ficar.<br>
        Não escolheu sair.<br><br>

        Simplesmente não deu tempo.<br><br>

        E agora não existe mais escolha
        nenhuma a ser feita —<br>
        só o que já aconteceu enquanto
        você ainda estava pensando.<br><br>

        Você tenta lembrar o que viu
        naqueles seis segundos.<br><br>

        A imagem já não é mais clara.<br><br>

        <strong>Só resta a certeza incômoda
        de que alguma coisa aconteceu
        bem na sua frente —<br>
        e você não estava, de fato,
        olhando.</strong>
    `

};

function handleQuestionFourteen() {

    continueButton.style.display =
        "none";


    optionsElement.innerHTML =
        "";


    errorElement.textContent =
        "";


    instructionElement.textContent =
        "";


    const answerKey =
        (
            lastPressureAnswer === "Sim."
            || lastPressureAnswer === "Não."
        )
            ? lastPressureAnswer
            : "Silêncio.";

    const scene =
        SCENES_14[answerKey];


    blackScreenMessage(
        `
        ...
        `,

        1800,

        function() {

            questionElement.innerHTML =
                scene
                + `<br><br><strong>O que você faz agora?</strong>`;


            instructionElement.textContent =
                "Escolha como reage.";


            continueButton.style.display =
                "none";


            createFearChoiceButtons(
                function(choice) {

                    if (choice === "Enfrentar.") {

                        fightCount++;

                    } else if (choice === "Fugir.") {

                        flightCount++;

                    } else {

                        freezeCount++;

                    }


                    answers.push({

                        pergunta:
                            "14 - Decisão final",

                        resposta:
                            choice

                    });

                    logAnswer("14 - Decisão final", choice);


                    blackScreenMessage(
                        `
                        registrado.
                        `,

                        1200,

                        function() {

                            nextQuestion();

                        }
                    );

                }
            );

        }
    );

}


// ==========================================
// PERFIL DE MEDO
// ==========================================
// Compara fightCount / flightCount / freezeCount (alimentados nas
// perguntas 12 e 14) e devolve a tendência predominante do jogador.
// Em caso de empate entre duas ou mais categorias, o resultado é
// "misto" — que também é um perfil válido e tem sua própria cena
// na pergunta 15.

function getFearProfileType() {

    if (
        fightCount > flightCount
        && fightCount > freezeCount
    ) {

        return "enfrentador";
    }

    if (
        flightCount > fightCount
        && flightCount > freezeCount
    ) {

        return "evasivo";
    }

    if (
        freezeCount > fightCount
        && freezeCount > flightCount
    ) {

        return "paralisado";
    }

    return "misto";
}


// ==========================================
// PERGUNTA 15 — SELO DO MEDO (fecha o arco)
// ==========================================
// Diferente das perguntas 12/13/14 (que reagem a UMA escolha
// específica), a 15 reage ao PERFIL inteiro construído até aqui
// (fightCount/flightCount/freezeCount). É a cena que "fecha" o
// arco do medo, devolvendo pro jogador uma leitura do padrão que
// ele mesmo criou nas últimas perguntas, e termina com a pergunta
// que sela esse arco antes de (futuramente) seguir para o
// próximo bloco de perguntas.

const SCENES_15 = {

    enfrentador: `
        Você não hesitou nas últimas vezes.<br><br>

        Encarou o passo no corredor.<br>
        Encarou o rosto sem feições.<br>
        Encarou o que quer que estivesse do outro lado
        da porta.<br><br>

        Isso diz alguma coisa sobre você.<br><br>

        Não é coragem.<br>
        Ou talvez seja.<br><br>

        Mas encarar o medo de frente nem sempre
        significa entendê-lo.<br><br>

        Você encarou tudo — e ainda assim
        <strong>[RESPOSTA]</strong>
        continua ali, do jeito que estava antes
        de sumir.<br><br>

        Alguém devolveu.<br>
        Você nunca perguntou o preço.
    `,

    evasivo: `
        Você recuou sempre que pôde.<br><br>

        Fechou a cortina.<br>
        Não abriu a porta.<br>
        Bloqueou o número.<br><br>

        Isso também diz alguma coisa sobre você.<br><br>

        Recuar não fez o medo desaparecer.<br>
        Só adiou o encontro.<br><br>

        E mesmo assim,
        <strong>[RESPOSTA]</strong>
        está de volta.<br><br>

        Como se evitar tivesse sido, o tempo todo,
        parte do plano de alguém.
    `,

    paralisado: `
        Mais de uma vez, o tempo simplesmente
        acabou antes de você decidir.<br><br>

        Não foi covardia.<br>
        Não foi coragem.<br><br>

        Foi só... nada.<br><br>

        Isso também diz alguma coisa sobre você.<br><br>

        Congelar também é uma resposta ao medo —
        talvez a mais honesta de todas.<br><br>

        E enquanto você hesitava,
        <strong>[RESPOSTA]</strong>
        voltou de qualquer jeito.<br><br>

        Sem que você tivesse feito nada
        para merecer.
    `,

    misto: `
        Você encarou algumas coisas.<br>
        Fugiu de outras.<br>
        E, em pelo menos um momento, simplesmente
        não conseguiu se mexer.<br><br>

        Não existe um único jeito de ter medo.<br><br>

        Você usou todos.<br><br>

        E mesmo assim,
        <strong>[RESPOSTA]</strong>
        voltou.<br><br>

        Independente do que você fez —
        ou deixou de fazer.
    `

};

function handleQuestionFifteen() {

    continueButton.style.display =
        "none";


    optionsElement.innerHTML =
        "";


    errorElement.textContent =
        "";


    instructionElement.textContent =
        "";


    const profileType =
        getFearProfileType();

    let scene =
        SCENES_15[profileType] || SCENES_15.misto;

    scene =
        scene.replaceAll(
            "[RESPOSTA]",
            escapeHTML(
                getFirstAnswer()
            )
        );


    blackScreenMessage(
        `
        Você entende agora o que fez.
        `,

        3000,

        function() {

            questionElement.innerHTML =
                scene
                + `<br><br><strong>Você continuaria confiando nessa ajuda, mesmo sem saber o preço dela?</strong>`;


            instructionElement.textContent =
                "";


            continueButton.style.display =
                "none";


            createYesNoButtons(
                function(answer) {

                    answers.push({

                        pergunta:
                            "15 - Selo do medo",

                        resposta:
                            answer

                    });

                    logAnswer("15 - Selo do medo", answer);


                    nextQuestion();

                }
            );

        }
    );

}


// ==========================================
// PERGUNTA 30 — REVELAÇÃO FINAL (fecha o formulário)
// ==========================================
// Esta é a última pergunta de verdade. Ela não abre nenhum arco
// novo — ela puxa um fio que já estava lá desde a pergunta 21 (o
// afastamento de alguém próximo) e o pergunta 26-29 (o custo da
// ajuda) e junta os dois, sem nunca confirmar quem é essa pessoa.
// A ideia é fechar com uma dúvida pesada, não com uma resposta —
// por isso ela termina em reticências, não em revelação.

function handleQuestionThirty() {

    continueButton.style.display =
        "none";

    optionsElement.innerHTML =
        "";

    errorElement.textContent =
        "";

    instructionElement.textContent =
        "";


    blackScreenMessage(
        `
        Existe mais uma coisa que você precisa saber.
        `,
        playSound("intro");

        3000,

        function() {

            questionElement.innerHTML = `
                Você nunca perguntou o nome de quem pagou por
                <strong>${escapeHTML(getFirstAnswer())}</strong>
                ter voltado.<br><br>

                Não porque não quisesse saber.<br>
                Mas porque, no fundo, uma parte de você já sabia
                que não ia gostar da resposta.<br><br>

                Existe uma última coisa, porém, que ninguém te
                contou até agora:<br><br>

                <strong>o preço nunca foi cobrado de um
                estranho.</strong><br><br>

                Foi cobrado de alguém que você conhece.<br>
                Alguém que, de repente, começou a se afastar de
                você sem explicação.<br>
                Alguém cuja ausência você sentiu — mas nunca
                associou a nada.<br><br>

                Você não sabe o nome.<br>
                Ainda.<br><br>

                Mas alguma parte sua já está procurando por
                ele.<br><br>

                <strong>Você quer saber quem foi?</strong>
            `;

            instructionElement.textContent =
                "";

            continueButton.style.display =
                "none";

            createYesNoButtons(
                function(answer) {

                    answers.push({

                        pergunta:
                            "30 - Revelação final",

                        resposta:
                            answer

                    });

                    logAnswer("30 - Revelação final", answer);


                    blackScreenMessage(
                        `
                        Isso é uma pergunta pra depois.<br><br>

                        Por enquanto, guarde ela com você.
                        `,

                        6000,

                        function() {

                            nextQuestion();

                        }
                    );

                }
            );

        }
    );

}


// ==========================================
// RELATÓRIO / PERFIL COMPLETO
// ==========================================
// Tudo que a pessoa responde (answersLog) mais os contadores de
// medo (fightCount/flightCount/freezeCount) e os três eixos
// psicológicos (psychScores.paranoia / .vergonha / .empatia) viram
// um arquivo .txt que você (mestre) pode baixar e ler depois, e um
// resumo curto que pode ser compartilhado direto no WhatsApp.
//
// IMPORTANTE sobre o WhatsApp: o link "wa.me" só consegue
// pré-preencher TEXTO — ele não tem como anexar um arquivo
// automaticamente. Por isso o botão de WhatsApp manda um resumo
// curto (perfil + contadores), e não o relatório inteiro. Para o
// relatório completo, use o botão de download e envie o .txt
// manualmente pelo WhatsApp (como anexo normal).

function getReportFilename() {

    const safeName =
        (session.nome || "jogador")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .toLowerCase();

    const shortId =
        session.id
            ? session.id.slice(0, 8)
            : "sem-id";

    return "relatorio-medo-" + safeName + "-" + shortId + ".txt";
}

function generateReportText() {

    const lines = [];

    lines.push("========================================");
    lines.push("RELATÓRIO COMPLETO — PERFIL PSICOLÓGICO");
    lines.push("========================================");
    lines.push("");
    lines.push("Jogador: " + (session.nome || "(não informado)"));
    lines.push("ID da sessão: " + (session.id || "(sem id)"));
    lines.push("Início: " + (session.startedAt || "(não registrado)"));
    lines.push("Relatório gerado em: " + new Date().toISOString());
    lines.push("");
    lines.push("----------------------------------------");
    lines.push("RESPOSTAS (em ordem cronológica)");
    lines.push("----------------------------------------");
    lines.push("");

    answersLog.forEach(function(entry) {

        lines.push(entry.pergunta + ":");

        lines.push(
            "  " + String(entry.resposta).replace(/<br\s*\/?>/gi, " / ")
        );

        lines.push("");

    });

    lines.push("----------------------------------------");
    lines.push("PERFIL DE MEDO (luta / fuga / congelamento)");
    lines.push("----------------------------------------");
    lines.push("");
    lines.push("Enfrentou: " + fightCount);
    lines.push("Fugiu/Evitou: " + flightCount);
    lines.push("Congelou: " + freezeCount);
    lines.push("");
    lines.push("Classificação predominante: " + getFearProfileType());
    lines.push("");
    lines.push("----------------------------------------");
    lines.push("");
    lines.push("Observação: este é um checkpoint. O formulário");
    lines.push("completo segue até a pergunta 25/30 — este");
    lines.push("relatório cobre apenas o arco do medo (1 a 15).");

    return lines.join("\n");
}

function generateWhatsAppSummary() {

    const type =
        getFearProfileType();

    const typeLabel = {

        enfrentador:
            "Enfrentador(a) — tende a encarar o medo de frente",

        evasivo:
            "Evasivo(a) — tende a evitar/recuar diante do medo",

        paralisado:
            "Paralisante — tende a travar sob pressão",

        misto:
            "Perfil misto — alterna entre encarar, fugir e travar"

    }[type];

    return (
        "Perfil de medo — " + (session.nome || "jogador(a)") + "\n"
        + typeLabel + "\n"
        + "Enfrentou: " + fightCount
        + " | Fugiu: " + flightCount
        + " | Congelou: " + freezeCount + "\n"
        + "(relatório completo em .txt disponível com o mestre)"
    );

}

function downloadReportFile(filename, content) {

    const blob =
        new Blob([content], { type: "text/plain;charset=utf-8" });

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(function() {

        URL.revokeObjectURL(url);

    }, 1000);

}

function shareReportOnWhatsApp(text) {

    const url =
        "https://wa.me/?text=" + encodeURIComponent(text);

    window.open(url, "_blank");

}


// ==========================================
// CHECKPOINT DO ARCO "MEDO"
// ==========================================
// finishQuestionnaire() é chamada automaticamente por nextQuestion()
// quando a última pergunta do array `questions` é respondida. Por
// enquanto, a última pergunta é a 15 — então isso NÃO é o fim do
// formulário completo (que vai até a pergunta 25/30), é só o fim
// do arco do medo. Quando as próximas perguntas forem escritas,
// basta acrescentá-las ao array `questions`; esta tela de
// checkpoint vai automaticamente "andar" para o final de verdade
// até lá.

function finishQuestionnaire() {

    showFearArcCheckpoint();

}

function showFearArcCheckpoint() {

    questionBox.classList.remove("fade");

    questionElement.innerHTML =
        "Por enquanto, é só isso.";

    instructionElement.textContent =
        "";

    optionsElement.innerHTML =
        "";

    errorElement.textContent =
        "";

    continueButton.style.display =
        "none";

    updateProgress(questions.length);

    const report =
        generateReportText();

    const downloadBtn =
        document.createElement("button");

    downloadBtn.className =
        "option";

    downloadBtn.textContent =
        "Baixar relatório (.txt)";

    downloadBtn.addEventListener(
        "click",
        function() {

            playSound("click");

            downloadReportFile(
                getReportFilename(),
                report
            );

        }
    );

    const whatsappBtn =
        document.createElement("button");

    whatsappBtn.className =
        "option";

    whatsappBtn.textContent =
        "Compartilhar resumo no WhatsApp";

    whatsappBtn.addEventListener(
        "click",
        function() {

            playSound("click");

            shareReportOnWhatsApp(
                generateWhatsAppSummary()
            );

        }
    );

    optionsElement.appendChild(downloadBtn);

    optionsElement.appendChild(whatsappBtn);

}


// ==========================================
// ESCAPAR HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}


// ==========================================
// INICIAR
// ==========================================
document.addEventListener("DOMContentLoaded", initialize);
