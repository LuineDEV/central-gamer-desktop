// main.js

// --- SELEÇÃO DE ELEMENTOS GLOBAIS ---
// Seleção dos containers principais das telas
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const dashboardContainer = document.getElementById('dashboard-container');
const profileContainer = document.getElementById('profile-container');
const loadingSpinner = document.getElementById('loading-spinner'); // Spinner GLOBAL para operações que bloqueiam a UI

// Seleção de links e botões de navegação globais (fora das sub-views do dashboard)
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const logoutButton = document.getElementById('logout-button');
const profileButton = document.getElementById('profile-button');
const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');

// Elementos do Dashboard (Header e Conteúdo Geral)
const welcomeMessage = document.getElementById('welcome-message');
const streamerList = document.getElementById('streamer-list'); // List UL para streamers
const dashboardAvatarImg = document.getElementById('dashboard-avatar-img');

// Formulários e áreas de mensagem de Autenticação
const registerForm = document.getElementById('register-form');
const registerMessageArea = document.getElementById('register-message-area');
const loginForm = document.getElementById('login-form');
// CORREÇÃO: Removido 'document = document' redundante e mantida a seleção correta
const loginMessageArea = document.getElementById('login-message-area'); 

// Formulários e elementos de gerenciamento de Streamers
const addStreamerForm = document.getElementById('add-streamer-form');
const streamerNameInput = document.getElementById('streamer-name-input');

// Formulários e elementos de gerenciamento de Perfil do Usuário
const updateProfileForm = document.getElementById('update-profile-form');
const updatePasswordForm = document.getElementById('update-password-form');
const profileNameInput = document.getElementById('profile-name');
const profileEmailInput = document.getElementById('profile-email');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const profileMessageArea = document.getElementById('profile-message-area');
const profileAvatarImg = document.getElementById('profile-avatar-img');
const avatarUploadInput = document.getElementById('avatar-upload-input');
const saveAvatarBtn = document.getElementById('save-avatar-btn');
const memberSinceText = document.getElementById('member-since-text');
const profileBioInput = document.getElementById('profile-bio');
const profileSteamInput = document.getElementById('profile-steam');
const profileTwitchInput = document.getElementById('profile-twitch');
const profileDiscordInput = document.getElementById('profile-discord');
const deleteAccountBtn = document.getElementById('delete-account-btn');

let currentUser = null; // Variável global para armazenar os dados do usuário logado

// --- SELEÇÃO DE ELEMENTOS DE NAVEGAÇÃO E VIEWS ---
// Todos os botões que podem atuar como navegadores (globais ou internos do dashboard)
const navButtons = document.querySelectorAll('.nav-button');
// Array contendo todas as views principais do aplicativo (para controle de visibilidade)
const allViews = [
    loginContainer,
    registerContainer,
    dashboardContainer,
    profileContainer
];
console.log('[ Seleção ] Variáveis de containers principais inicializadas.', {allViews});

// Botões de navegação específicos da barra superior do Dashboard (Início, Streamers, Biblioteca, Notas)
const dashboardNavButtons = document.querySelectorAll('#dashboard-container .top-nav .nav-button');
// Array contendo todas as sub-views que aparecem dentro do dashboard
const dashboardSubViews = [
    document.getElementById('dashboard-home-view'),
    document.getElementById('dashboard-streamers-view'),
    document.getElementById('dashboard-biblioteca-view'),
    document.getElementById('dashboard-notepad-view')
];
console.log('[ Seleção ] Variáveis de sub-views do Dashboard inicializadas.', {dashboardSubViews});

// --- SELEÇÃO DE ELEMENTOS DA BIBLIOTECA DE JOGOS ---
const addEditGameForm = document.getElementById('add-edit-game-form');
const gameIdInput = document.getElementById('game-id-input');
const gameNameInput = document.getElementById('game-name-input');
const gamePlatformInput = document.getElementById('game-platform-input');
const gameStatusSelect = document.getElementById('game-status-select');
const gameHoursInput = document.getElementById('game-hours-input');
const gameRatingSelect = document.getElementById('game-rating-select');
const gameNotesTextarea = document.getElementById('game-notes-textarea');
const saveGameBtn = document.getElementById('save-game-btn');
const cancelEditGameBtn = document.getElementById('cancel-edit-game-btn');
const gameList = document.getElementById('game-list'); // Lista UL para jogos
const bibliotecaMessageArea = document.getElementById('biblioteca-message-area');

// --- SELEÇÃO DE ELEMENTOS DA HOME DO DASHBOARD (Visão Geral) ---
const totalGamesCount = document.getElementById('total-games-count');
const totalStreamersCount = document.getElementById('total-streamers-count');
// Botões de ação rápida na página inicial (ex: "Adicionar Jogo Agora")
const quickActionBtns = document.querySelectorAll('.quick-action-btn');

// --- SELEÇÃO DE ELEMENTOS DO BLOCO DE NOTAS ---
const addEditNoteForm = document.getElementById('add-edit-note-form');
const noteIdInput = document.getElementById('note-id-input');
const noteTitleInput = document.getElementById('note-title-input');
const noteContentTextarea = document.getElementById('note-content-textarea');
const saveNoteBtn = document.getElementById('save-note-btn');
const cancelEditNoteBtn = document.getElementById('cancel-edit-note-btn');
const noteList = document.getElementById('note-list'); // Lista UL para notas
const notepadMessageArea = document.getElementById('notepad-message-area');

// --- SELEÇÃO DE ELEMENTOS DE SPINNER LOCAL ---
// Spinners que aparecem dentro de seções específicas enquanto carregam dados
const streamerListLoading = document.getElementById('streamer-list-loading');
const gameListLoading = document.getElementById('game-list-loading');
const noteListLoading = document.getElementById('note-list-loading');

// --- SELEÇÃO DE ELEMENTOS DO MODAL DE CONFIRMAÇÃO ---
const customConfirmModal = document.getElementById('custom-confirm-modal');
const confirmModalTitle = document.getElementById('confirm-modal-title');
const confirmModalMessage = document.getElementById('confirm-modal-message');
const confirmModalYesBtn = document.getElementById('confirm-modal-yes-btn');
const confirmModalNoBtn = document.getElementById('confirm-modal-no-btn');

let confirmCallback = null; // Variável para armazenar a função de callback do modal

// --- SELEÇÃO DE ELEMENTOS DE TEMA ---
const themeSettingsSection = document.querySelector('.theme-settings-section');
const themeRadios = document.querySelectorAll('input[name="theme-choice"]'); // Seleciona todos os rádios de tema
const saveThemeBtn = document.getElementById('save-theme-btn');
const themeMessageArea = document.getElementById('theme-message-area');


// --- FUNÇÕES AUXILIARES GERAIS (Validação de Input e Feedback) ---

/**
 * Exibe uma mensagem de erro abaixo de um elemento de input.
 * Adiciona uma classe 'input-error' ao input para estilização visual.
 * @param {HTMLElement} inputElement O elemento input (ou textarea, select) onde o erro ocorreu.
 * @param {string} message A mensagem de erro a ser exibida.
 */
function displayInputError(inputElement, message) {
    let errorSpan = inputElement.nextElementSibling;
    // Cria o span de erro se ele não existir
    if (!errorSpan || !errorSpan.classList.contains('input-error-message')) {
        errorSpan = document.createElement('span');
        errorSpan.classList.add('input-error-message');
        inputElement.parentNode.insertBefore(errorSpan, inputElement.nextSibling);
    }
    errorSpan.textContent = message;
    inputElement.classList.add('input-error'); // Adiciona classe para borda vermelha, etc.
}

/**
 * Remove a mensagem de erro e a estilização de erro de um elemento de input.
 * @param {HTMLElement} inputElement O elemento input (ou textarea, select) a ser limpo.
 */
function clearInputError(inputElement) {
    const errorSpan = inputElement.nextElementSibling;
    // Remove o span de erro se ele existir
    if (errorSpan && errorSpan.classList.contains('input-error-message')) {
        errorSpan.remove();
    }
    inputElement.classList.remove('input-error'); // Remove a classe de erro
}


// --- FUNÇÕES DO MODAL DE CONFIRMAÇÃO PERSONALIZADO ---

/**
 * Exibe um modal de confirmação personalizado na tela.
 * O modal aguarda a interação do usuário (clique em "Sim" ou "Não").
 * @param {string} title Título que aparecerá no cabeçalho do modal.
 * @param {string} message Mensagem de texto principal que será exibida no modal.
 * @param {function(boolean): void} callback Função a ser executada após o usuário interagir com o modal.
 * Recebe 'true' se o usuário clicar em "Sim", 'false' se clicar em "Não".
 */
function showCustomConfirm(title, message, callback) {
    confirmModalTitle.textContent = title;
    confirmModalMessage.textContent = message;
    customConfirmModal.classList.remove('hidden'); // Exibe o overlay do modal
    confirmCallback = callback; // Armazena a função de callback

    // Garante que não há múltiplos event listeners anexados de chamadas anteriores
    confirmModalYesBtn.removeEventListener('click', handleConfirmYes);
    confirmModalNoBtn.removeEventListener('click', handleConfirmNo);

    // Adiciona os event listeners para os botões do modal
    confirmModalYesBtn.addEventListener('click', handleConfirmYes);
    confirmModalNoBtn.addEventListener('click', handleConfirmNo);
}

/**
 * Oculta o modal de confirmação personalizado.
 */
function hideCustomConfirm() {
    customConfirmModal.classList.add('hidden'); // Oculta o overlay do modal
    confirmCallback = null; // Limpa o callback para evitar chamadas acidentais
}

/**
 * Handler para o clique no botão "Sim" do modal de confirmação.
 * Invoca o callback com 'true' e oculta o modal.
 */
function handleConfirmYes() {
    if (confirmCallback) {
        confirmCallback(true); // Executa o callback indicando confirmação
    }
    hideCustomConfirm(); // Oculta o modal
}

/**
 * Handler para o clique no botão "Não" do modal de confirmação.
 * Invoca o callback com 'false' e oculta o modal.
 */
function handleConfirmNo() {
    if (confirmCallback) {
        confirmCallback(false); // Executa o callback indicando cancelamento
    }
    hideCustomConfirm(); // Oculta o modal
}


// --- FUNÇÕES DE CONTROLE DE TELA (Navegação de Views e Sub-Views) ---

/**
 * Gerencia a exibição das views de NÍVEL SUPERIOR do aplicativo.
 * Esconde todas as outras views principais e mostra a 'targetView'.
 * Também gerencia o estado 'active' dos botões de navegação globais.
 * @param {HTMLElement} targetView O elemento HTML da view principal a ser exibida (ex: loginContainer, dashboardContainer).
 * @param {string} [activeButtonId] O ID do botão de navegação global que deve ser marcado como ativo (ex: 'profile-button').
 */
function showMainView(targetView, activeButtonId = null) {
    console.log(`[ showMainView ] Chamada. Target: ${targetView ? targetView.id : 'null'}, Botão Ativo: ${activeButtonId || 'nenhum'}`); 
    
    if (!targetView) {
        console.error('[ showMainView ] Erro: Recebeu um targetView nulo. Abortando.');
        return;
    }

    // Oculta todas as views principais, removendo 'active' e adicionando 'hidden'
    allViews.forEach(view => {
        if (view) { 
            view.classList.remove('active');
            view.classList.add('hidden');
            console.log(`[ showMainView ] Escondendo e desativando view principal: ${view.id}`);
        }
    });

    // Exibe a view principal desejada e a marca como ativa
    console.log(`[ showMainView ] Mostrando e ativando view principal: ${targetView.id}`);
    targetView.classList.remove('hidden');
    targetView.classList.add('active');

    // Remove a classe 'active' de todos os botões de navegação (globais e internos do dashboard)
    document.querySelectorAll('.nav-button').forEach(button => button.classList.remove('active'));

    // Adiciona a classe 'active' ao botão GLOBAL correspondente, se um ID for fornecido
    if (activeButtonId) {
        const activeButton = document.getElementById(activeButtonId);
        if (activeButton) {
            activeButton.classList.add('active');
            console.log(`[ showMainView ] Botão global ativo definido: ${activeButtonId}`);
        }
    }
}


/**
 * Gerencia a exibição das SUB-VIEWS DENTRO do dashboard (Início, Streamers, Biblioteca, Notas).
 * Esconde todas as outras sub-views do dashboard e mostra a 'targetSubView'.
 * Também gerencia o estado 'active' dos botões de navegação da top-nav do dashboard.
 * @param {HTMLElement} targetSubView O elemento HTML da sub-view a ser exibida.
 * @param {string} activeButtonId O ID do botão da top-nav do dashboard a ser ativado.
 */
async function showDashboardSubView(targetSubView, activeButtonId) {
    console.log(`[ showDashboardSubView ] Chamada. Target: ${targetSubView ? targetSubView.id : 'null'}, Botão Ativo: ${activeButtonId}`);

    if (!targetSubView) {
        console.error('[ showDashboardSubView ] Erro: Recebeu um targetSubView nulo. Abortando.');
        return;
    }

    // Esconde TODAS as sub-views do dashboard
    dashboardSubViews.forEach(subView => {
        if (subView) { 
            subView.classList.remove('active');
            subView.classList.add('hidden');
            console.log(`[ showDashboardSubView ] Escondendo e desativando sub-view: ${subView.id}`);
        }
    });

    // Exibe a sub-view desejada e a marca como ativa
    console.log(`[ showDashboardSubView ] Mostrando e ativando sub-view: ${targetSubView.id}`);
    targetSubView.classList.remove('hidden');
    targetSubView.classList.add('active');

    // Remove a classe 'active' de todos os botões de navegação do DASHBOARD
    dashboardNavButtons.forEach(button => button.classList.remove('active'));

    // Adiciona a classe 'active' ao botão da top-nav do dashboard correspondente
    const activeButton = document.getElementById(activeButtonId);
    if (activeButton) {
        activeButton.classList.add('active');
        console.log(`[ showDashboardSubView ] Botão de sub-navegação ativo definido: ${activeButtonId}`);
    }

    // --- Lógica específica de carregamento de dados para cada sub-view ---
    // Carrega dados apenas quando a view correspondente é ativada.
    if (targetSubView.id === 'dashboard-home-view' && currentUser) {
        console.log('[ showDashboardSubView ] Sub-view de Início (Home) ativada. Carregando resumo...');
        await carregarHomeDashboard();
    } else if (targetSubView.id === 'dashboard-streamers-view' && currentUser) {
        console.log('[ showDashboardSubView ] Sub-view de Streamers ativada. Carregando streamers...');
        await carregarStreamers();
    } else if (targetSubView.id === 'dashboard-biblioteca-view' && currentUser) {
        console.log('[ showDashboardSubView ] Sub-view de Biblioteca ativada. Carregando jogos...');
        await carregarJogos();
    } else if (targetSubView.id === 'dashboard-notepad-view' && currentUser) {
        console.log('[ showDashboardSubView ] Sub-view de Bloco de Notas ativada. Carregando notas...');
        await carregarNotas();
    } else {
        console.log('[ showDashboardSubView ] Outra sub-view do Dashboard ativada ou sem usuário logado. Nenhuns dados específicos a carregar.');
        // Opcional: Limpar conteúdo de listas se o usuário sair da aba para um estado vazio não-preenchido
    }
}


/**
 * Exibe a tela de login do aplicativo e reseta o estado de sessão do usuário.
 */
function showLoginScreen() {
    console.log('[ showLoginScreen ] Chamada.');
    currentUser = null; // Limpa a variável global do usuário logado
    showMainView(loginContainer); // Exibe o container da tela de login
    loginMessageArea.textContent = ''; // Limpa mensagens de feedback anteriores
    loginMessageArea.classList.remove('error', 'success');
    // Limpa quaisquer erros de validação visuais no formulário de login
    document.querySelectorAll('#login-form .input-error').forEach(el => clearInputError(el));
    loginForm.reset(); // Limpa os campos do formulário de login
}

/**
 * Exibe a tela de registro de usuário.
 */
function showRegisterScreen() {
    console.log('[ showRegisterScreen ] Chamada.');
    showMainView(registerContainer); // Exibe o container da tela de registro
    registerMessageArea.textContent = ''; // Limpa mensagens de feedback anteriores
    registerMessageArea.classList.remove('error', 'success');
    // Limpa quaisquer erros de validação visuais no formulário de registro
    document.querySelectorAll('#register-form .input-error').forEach(el => clearInputError(el));
    registerForm.reset(); // Limpa os campos do formulário de registro
}

/**
 * Exibe o dashboard principal do aplicativo após um login bem-sucedido.
 * Define o usuário logado e aplica o tema preferido.
 * @param {object} user Objeto contendo os dados do usuário logado, incluindo tema_preferido.
 */
async function showDashboard(user) {
    console.log(`[ showDashboard ] Chamada. Usuário: ${user.nome}`);
    currentUser = user; // Define o usuário logado globalmente
    welcomeMessage.textContent = `Bem-vindo, ${currentUser.nome}!`;
    dashboardAvatarImg.src = currentUser.avatar_url || 'assets/default-avatar.png';
    
    // Aplica o tema preferido do usuário ao <body>, garantindo que o tema esteja ativo
    if (currentUser.tema_preferido) {
        applyTheme(currentUser.tema_preferido);
    } else {
        applyTheme('dark-blue'); // Aplica o tema padrão se a preferência não estiver definida
    }

    // Exibe o container principal do dashboard e ativa o botão 'Início'
    showMainView(dashboardContainer, 'nav-home-button'); 
    
    // Exibe a sub-view 'home' do dashboard e ativa seu botão correspondente
    await showDashboardSubView(document.getElementById('dashboard-home-view'), 'nav-home-button');
    
    console.log('[ showDashboard ] Dashboard exibido. Sub-view inicial: dashboard-home-view');
}

/**
 * Exibe a tela de perfil do usuário.
 */
function showProfileScreen() {
    console.log('[ showProfileScreen ] Chamada.');
    showMainView(profileContainer, 'profile-button'); // Exibe o container de perfil e ativa o botão 'Meu Perfil'
    profileMessageArea.textContent = ''; // Limpa mensagens anteriores
    profileMessageArea.className = 'message-area';
    saveAvatarBtn.classList.add('hidden'); // Esconde o botão de salvar avatar por padrão
    loadProfileData(); // Carrega os dados do perfil do usuário
    loadUserThemePreference(); // Carrega e seleciona o tema preferido do usuário na interface do perfil
}

// --- LÓGICA DE DADOS E FORMATAÇÃO ---

/**
 * Formata uma string de data para o formato local (ex: "5 de Julho de 2025").
 * @param {string} dataString A string de data a ser formatada (ex: ISO 8601).
 * @returns {string} A data formatada.
 */
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    const opcoes = { year: 'numeric', month: 'long', day: 'numeric' };
    return data.toLocaleDateString('pt-BR', opcoes);
}

/**
 * Formata uma string de data e hora para o formato local (ex: "05/07/2025 13:22").
 * @param {string} dataString A string de data e hora a ser formatada.
 * @returns {string} A data e hora formatadas.
 */
function formatarDataHora(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    const opcoes = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return data.toLocaleDateString('pt-BR', opcoes);
}

/**
 * Carrega os dados do perfil do usuário logado e preenche o formulário de perfil.
 */
async function loadProfileData() {
    console.log('[ loadProfileData ] Carregando dados do perfil...');
    const resposta = await eel.get_dados_perfil()();
    if (resposta.status === 'sucesso') {
        const dados = resposta.data;
        profileNameInput.value = dados.nome || '';
        profileEmailInput.value = dados.email || '';
        profileAvatarImg.src = dados.avatar_url || 'assets/default-avatar.png';
        memberSinceText.textContent = `Membro desde: ${formatarData(dados.data_cadastro)}`;
        profileBioInput.value = dados.sobre_mim || '';
        profileSteamInput.value = dados.steam_url || '';
        profileTwitchInput.value = dados.twitch_url || '';
        profileDiscordInput.value = dados.discord_id || '';
        console.log('[ loadProfileData ] Dados do perfil carregados com sucesso.');
    } else {
        console.error('[ loadProfileData ] Erro ao carregar dados do perfil:', resposta.message);
        // Usando showProfileMessage para feedback consistente
        showProfileMessage(resposta.message || 'Não foi possível carregar os dados do perfil. Por favor, faça login novamente.', 'error'); 
        showLoginScreen();
    }
}

/**
 * Carrega a lista de streamers favoritos do usuário logado e os exibe na interface.
 */
async function carregarStreamers() {
    if (!currentUser) {
        console.warn("[ carregarStreamers ] Não há usuário logado para carregar streamers. Abortando carregamento.");
        streamerList.innerHTML = `
            <li class="empty-state-message">
                <p>Faça login para ver seus streamers.</p>
            </li>
        `;
        streamerListLoading.classList.add('hidden'); // Esconde o spinner local
        return;
    }

    streamerListLoading.classList.remove('hidden'); // Exibe o spinner local
    streamerList.innerHTML = ''; // Limpa a lista para mostrar o spinner claramente
    console.log(`[ carregarStreamers ] Carregando streamers para o usuário: ${currentUser.nome}`);

    try {
        const resposta = await eel.get_streamers_favoritos()();
        streamerList.innerHTML = ''; // Limpa novamente após a resposta, antes de popular

        if (resposta.status === 'sucesso' && resposta.streamers && resposta.streamers.length > 0) {
            for (const streamer of resposta.streamers) { // Usando for...of para melhor legibilidade
                const li = document.createElement('li');
                li.className = 'streamer-item';

                const infoContainer = document.createElement('div');
                infoContainer.className = 'info-container';

                const avatarImg = document.createElement('img');
                avatarImg.src = streamer.avatar_url || 'assets/default-streamer-avatar.png'; 
                avatarImg.alt = `Avatar de ${streamer.nome_streamer}`;
                avatarImg.className = 'streamer-avatar';

                const streamerNameSpan = document.createElement('span');
                streamerNameSpan.textContent = streamer.nome_streamer;
                streamerNameSpan.className = 'streamer-name';

                const streamerDetailsDiv = document.createElement('div');
                streamerDetailsDiv.className = 'streamer-details';

                if (streamer.is_live) {
                    const liveInfoSpan = document.createElement('span');
                    liveInfoSpan.className = 'live-info';
                    liveInfoSpan.innerHTML = `LIVE: ${streamer.game_name || 'N/A'} - <em>"${streamer.title || 'Sem título'}"</em>`;
                    streamerDetailsDiv.appendChild(liveInfoSpan);
                }

                const viewChannelLink = document.createElement('a');
                viewChannelLink.href = `https://www.twitch.tv/${streamer.login || streamer.nome_streamer}`; 
                viewChannelLink.textContent = 'Ver Canal na Twitch';
                viewChannelLink.target = '_blank'; // Abre em nova aba/janela
                viewChannelLink.className = 'view-channel-link';
                streamerDetailsDiv.appendChild(viewChannelLink);

                infoContainer.appendChild(avatarImg);
                infoContainer.appendChild(streamerNameSpan);
                li.appendChild(infoContainer);

                li.appendChild(streamerDetailsDiv);

                const statusContainer = document.createElement('div');
                statusContainer.className = 'status-actions-container';

                const statusSpan = document.createElement('span');
                statusSpan.className = 'status-indicator';
                if (streamer.is_live) {
                    statusSpan.textContent = 'Online';
                    statusSpan.classList.add('status-online');
                } else {
                    statusSpan.textContent = 'Offline';
                    statusSpan.classList.add('status-offline');
                }

                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remover';
                removeButton.className = 'remove-button';
                removeButton.onclick = async () => {
                    showCustomConfirm('Confirmar Remoção', `Tem certeza que quer remover "${streamer.nome_streamer}"?`, async (confirmed) => {
                        if (confirmed) {
                            loadingSpinner.classList.remove('hidden'); // Usa spinner GLOBAL para a ação de remoção
                            try {
                                const removeResponse = await eel.remover_streamer(streamer.id)();
                                if (removeResponse.status === 'sucesso') {
                                    showProfileMessage(removeResponse.message, 'success'); // Feedback de sucesso
                                    await carregarStreamers(); // Recarrega a lista
                                    await carregarHomeDashboard(); // Atualiza contadores na Home
                                } else {
                                    showProfileMessage(removeResponse.message, 'error'); // Feedback de erro
                                }
                            } catch (err) {
                                console.error("[ carregarStreamers ] Erro ao remover streamer:", err);
                                showProfileMessage("Não foi possível remover o streamer. Tente novamente.", 'error');
                            } finally {
                                loadingSpinner.classList.add('hidden');
                            }
                        }
                    });
                };

                statusContainer.appendChild(statusSpan);
                statusContainer.appendChild(removeButton);

                li.appendChild(statusContainer);
                streamerList.appendChild(li);
            }
            console.log(`[ carregarStreamers ] ${resposta.streamers.length} streamers carregados com sucesso.`);
        } else {
            console.log('[ carregarStreamers ] Nenhum streamer encontrado para o usuário.');
            streamerList.innerHTML = `
                <li class="empty-state-message">
                    <p>Você ainda não adicionou nenhum streamer.</p>
                    <p>Comece adicionando seus canais favoritos da Twitch para ver o status das lives e muito mais!</p>
                    <button class="quick-action-btn" data-action="add-streamer">Adicionar Streamer Agora</button>
                </li>
            `;
            // Adiciona evento ao botão DENTRO do estado vazio
            document.querySelector('#streamer-list .quick-action-btn')?.addEventListener('click', () => {
                showDashboardSubView(document.getElementById('dashboard-streamers-view'), 'nav-streamers-button');
                streamerNameInput.value = ''; // Limpa e foca o input
                streamerNameInput.focus();
            });
        }
    } catch (error) {
        console.error("[ carregarStreamers ] Erro geral ao carregar streamers:", error);
        streamerList.innerHTML = '<li class="empty-state-message" style="color: red;">Ocorreu um erro ao carregar os streamers. Tente novamente.</li>';
    } finally {
        streamerListLoading.classList.add('hidden'); // Esconde o spinner LOCAL
    }
}

/**
 * Exibe uma mensagem na área de mensagens do perfil do usuário.
 * @param {string} message A mensagem a ser exibida.
 * @param {'success' | 'error' | 'info'} type O tipo da mensagem para estilização (cor/fundo).
 */
function showProfileMessage(message, type = 'error') {
    profileMessageArea.textContent = message;
    profileMessageArea.className = `message-area ${type}`; // Define a classe para estilização
    setTimeout(() => {
        profileMessageArea.textContent = '';
        profileMessageArea.className = 'message-area'; // Limpa a classe após sumir
    }, 4000); // Mensagem desaparece após 4 segundos
}


// --- LÓGICA DA BIBLIOTECA DE JOGOS ---

/**
 * Exibe uma mensagem na área de mensagens da biblioteca de jogos.
 * @param {string} message A mensagem a ser exibida.
 * @param {'success' | 'error' | 'info'} type O tipo da mensagem para estilização.
 */
function showBibliotecaMessage(message, type = 'error') {
    bibliotecaMessageArea.textContent = message;
    bibliotecaMessageArea.className = `message-area ${type}`;
    setTimeout(() => {
        bibliotecaMessageArea.textContent = '';
        bibliotecaMessageArea.className = 'message-area';
    }, 4000);
}

/**
 * Limpa todos os campos do formulário de adição/edição de jogos e reseta o texto do botão.
 */
function limparFormularioJogo() {
    gameIdInput.value = ''; // Limpa o ID para indicar modo de adição
    gameNameInput.value = '';
    gamePlatformInput.value = '';
    gameStatusSelect.value = 'Jogando'; // Padrão
    gameHoursInput.value = '0.00';
    gameRatingSelect.value = '';
    gameNotesTextarea.value = '';
    saveGameBtn.textContent = 'Adicionar Jogo';
    cancelEditGameBtn.classList.add('hidden'); // Esconde o botão de cancelar edição
    bibliotecaMessageArea.textContent = ''; // Limpa mensagens da área geral
    bibliotecaMessageArea.classList.remove('success', 'error', 'info');
    // Limpa quaisquer erros de validação visuais nos campos do formulário
    document.querySelectorAll('#add-edit-game-form .input-error').forEach(el => clearInputError(el));
}

/**
 * Carrega e exibe a lista de jogos do usuário logado na interface da biblioteca.
 */
async function carregarJogos() {
    if (!currentUser) {
        console.warn("[ carregarJogos ] Não há usuário logado para carregar jogos. Abortando carregamento.");
        gameList.innerHTML = `
            <li class="empty-state-message">
                <p>Faça login para ver seus jogos.</p>
            </li>
        `;
        gameListLoading.classList.add('hidden'); // Esconde spinner local
        return;
    }

    gameListLoading.classList.remove('hidden'); // Exibe o spinner local
    gameList.innerHTML = ''; // Limpa a lista para mostrar o spinner claramente
    console.log(`[ carregarJogos ] Carregando jogos para o usuário: ${currentUser.nome}`);

    try {
        const resposta = await eel.get_jogos_usuario()();
        gameList.innerHTML = ''; // Limpa novamente após a resposta, antes de popular

        if (resposta.status === 'sucesso' && resposta.jogos && resposta.jogos.length > 0) {
            resposta.jogos.forEach(jogo => {
                const li = document.createElement('li');
                li.className = 'game-item';

                li.innerHTML = `
                    <div class="game-info">
                        <strong>${jogo.nome_jogo}</strong> (${jogo.plataforma}) - Status: ${jogo.status_jogo}
                        ${jogo.horas_jogadas > 0 ? `<br>Horas: ${jogo.horas_jogadas}` : ''}
                        ${jogo.avaliacao ? ` | Avaliação: ${'⭐'.repeat(jogo.avaliacao)}` : ''}
                        ${jogo.observacoes ? `<p class="game-notes">${jogo.observacoes}</p>` : ''}
                        <span class="game-date">Adicionado em: ${formatarData(jogo.data_adicao)}</span>
                    </div>
                    <div class="game-actions">
                        <button class="edit-game-btn" data-id="${jogo.id}">Editar</button>
                        <button class="remove-game-btn" data-id="${jogo.id}">Remover</button>
                    </div>
                `;
                gameList.appendChild(li);
            });

            // Adiciona event listeners para os botões de editar/remover de cada jogo
            document.querySelectorAll('.edit-game-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const gameId = event.target.dataset.id;
                    const gameToEdit = resposta.jogos.find(j => String(j.id) === gameId);
                    if (gameToEdit) preencherFormularioEdicao(gameToEdit);
                });
            });

            document.querySelectorAll('.remove-game-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const gameId = event.target.dataset.id;
                    showCustomConfirm('Confirmar Remoção', 'Tem certeza que deseja remover este jogo da sua biblioteca?', (confirmed) => {
                        if (confirmed) {
                            removerJogo(gameId); // Chama a função de remover se confirmado
                        }
                    });
                });
            });
            console.log(`[ carregarJogos ] ${resposta.jogos.length} jogos carregados com sucesso.`);
        } else {
            console.log('[ carregarJogos ] Nenhuns jogos encontrados para o usuário.');
            gameList.innerHTML = `
                <li class="empty-state-message">
                    <p>Sua biblioteca de jogos está vazia.</p>
                    <p>Que tal adicionar seu primeiro jogo? Use o formulário acima!</p>
                    <button class="quick-action-btn" data-action="add-game">Adicionar Jogo Agora</button>
                </li>
            `;
            // Adiciona evento ao botão DENTRO do estado vazio
            document.querySelector('#game-list .quick-action-btn')?.addEventListener('click', () => {
                showDashboardSubView(document.getElementById('dashboard-biblioteca-view'), 'nav-biblioteca-button');
                limparFormularioJogo(); // Garante que o formulário está limpo para nova adição
                gameNameInput.focus(); // Coloca o foco no primeiro campo
            });
        }
    } catch (error) {
        console.error("[ carregarJogos ] Erro geral ao carregar jogos:", error);
        gameList.innerHTML = '<li class="empty-state-message" style="color: red;">Ocorreu um erro ao carregar os jogos. Tente novamente.</li>';
    } finally {
        gameListLoading.classList.add('hidden'); // Esconde o spinner LOCAL
    }
}

/**
 * Preenche o formulário de adição/edição de jogos com os dados de um jogo existente para edição.
 * @param {object} jogo O objeto jogo com os dados a serem preenchidos no formulário.
 */
function preencherFormularioEdicao(jogo) {
    gameIdInput.value = jogo.id;
    gameNameInput.value = jogo.nome_jogo;
    gamePlatformInput.value = jogo.plataforma;
    gameStatusSelect.value = jogo.status_jogo;
    gameHoursInput.value = jogo.horas_jogadas;
    gameRatingSelect.value = jogo.avaliacao || '';
    gameNotesTextarea.value = jogo.observacoes || '';
    saveGameBtn.textContent = 'Salvar Alterações';
    cancelEditGameBtn.classList.remove('hidden'); // Mostra o botão cancelar
    showBibliotecaMessage(`Editando: ${jogo.nome_jogo}`, 'info'); // Mensagem de feedback
    // Limpa quaisquer erros de validação visuais no formulário
    document.querySelectorAll('#add-edit-game-form .input-error').forEach(el => clearInputError(el));
}

/**
 * Cancela o modo de edição no formulário de jogos, limpando os campos e resetando o botão.
 */
function cancelarEdicao() {
    limparFormularioJogo();
    showBibliotecaMessage('Edição cancelada.', 'info');
}

/**
 * Adiciona um novo jogo ou atualiza um jogo existente no banco de dados.
 * Lida com a validação do formulário e feedback ao usuário.
 * @param {Event} event O evento de submissão do formulário.
 */
async function adicionarOuAtualizarJogo(event) {
    event.preventDefault(); // Impede o comportamento padrão de submissão do formulário
    
    // Limpa erros de validação anteriores nos campos do formulário
    document.querySelectorAll('#add-edit-game-form .input-error').forEach(el => clearInputError(el));

    loadingSpinner.classList.remove('hidden'); // Exibe spinner GLOBAL para a operação
    bibliotecaMessageArea.textContent = ''; // Limpa mensagens de feedback anteriores

    const id = gameIdInput.value; // ID do jogo (vazio para adição, preenchido para edição)
    const nome_jogo = gameNameInput.value.trim();
    const plataforma = gamePlatformInput.value.trim();
    const status_jogo = gameStatusSelect.value;
    const horas_jogadas = parseFloat(gameHoursInput.value) || 0.00;
    const avaliacao = parseInt(gameRatingSelect.value) || null; // Converte para int ou null
    const observacoes = gameNotesTextarea.value.trim();

    // Validações no frontend antes de enviar para o backend
    let isValid = true;
    if (!nome_jogo) {
        displayInputError(gameNameInput, 'O nome do jogo é obrigatório.');
        isValid = false;
    }
    if (!plataforma) {
        displayInputError(gamePlatformInput, 'A plataforma é obrigatória.');
        isValid = false;
    }
    if (!status_jogo) {
        displayInputError(gameStatusSelect, 'O status é obrigatório.');
        isValid = false;
    }
    if (horas_jogadas < 0) {
        displayInputError(gameHoursInput, 'Horas jogadas não pode ser negativo.');
        isValid = false;
    }
    if (avaliacao && (avaliacao < 1 || avaliacao > 5)) {
        displayInputError(gameRatingSelect, 'Avaliação deve ser entre 1 e 5.');
        isValid = false;
    }

    if (!isValid) {
        loadingSpinner.classList.add('hidden'); // Esconde spinner se houver erros de validação
        showBibliotecaMessage('Por favor, corrija os erros no formulário.', 'error');
        return;
    }

    let resposta;
    try {
        if (id) { // Modo de edição: chama a função de atualização no backend
            resposta = await eel.atualizar_jogo(id, nome_jogo, plataforma, status_jogo, horas_jogadas, avaliacao, observacoes)();
            console.log(`[ adicionarOuAtualizarJogo ] Resposta da atualização:`, resposta);
        } else { // Modo de adição: chama a função de adição no backend
            resposta = await eel.adicionar_jogo(nome_jogo, plataforma, status_jogo, horas_jogadas, avaliacao, observacoes)();
            console.log(`[ adicionarOuAtualizarJogo ] Resposta da adição:`, resposta);
        }

        if (resposta.status === 'sucesso') {
            showBibliotecaMessage(resposta.message, 'success');
            limparFormularioJogo(); // Limpa o formulário após sucesso
            await carregarJogos(); // Recarrega a lista de jogos para refletir a mudança
            await carregarHomeDashboard(); // Atualiza os contadores na Home do dashboard
        } else {
            showBibliotecaMessage(resposta.message, 'error'); // Exibe mensagem de erro do backend
        }
    } catch (error) {
        console.error("[ adicionarOuAtualizarJogo ] Erro geral ao adicionar/atualizar jogo:", error);
        showBibliotecaMessage("Ocorreu um erro de comunicação com o servidor. Tente novamente.", 'error');
    } finally {
        loadingSpinner.classList.add('hidden'); // Esconde o spinner GLOBAL
    }
}

/**
 * Remove um jogo da biblioteca do usuário logado.
 * @param {string | number} id_jogo O ID do jogo a ser removido.
 */
async function removerJogo(id_jogo) {
    loadingSpinner.classList.remove('hidden'); // Exibe spinner GLOBAL para a operação
    bibliotecaMessageArea.textContent = ''; // Limpa mensagens de feedback anteriores

    try {
        const resposta = await eel.remover_jogo(id_jogo)();
        if (resposta.status === 'sucesso') {
            showBibliotecaMessage(resposta.message, 'success'); // Feedback de sucesso
            await carregarJogos(); // Recarrega a lista
            await carregarHomeDashboard(); // Atualiza os contadores na Home
        } else {
            showBibliotecaMessage(resposta.message, 'error'); // Feedback de erro
        }
    } catch (error) {
        console.error("[ removerJogo ] Erro ao remover jogo:", error);
        showBibliotecaMessage("Ocorreu um erro de comunicação ao remover o jogo. Tente novamente.", 'error');
    } finally {
        loadingSpinner.classList.add('hidden'); // Esconde o spinner GLOBAL
    }
}

// --- LÓGICA DA HOME DO DASHBOARD (Visão Geral) ---

/**
 * Carrega e exibe as contagens de jogos e streamers na página inicial do dashboard.
 */
async function carregarHomeDashboard() {
    if (!currentUser) {
        console.warn("[ carregarHomeDashboard ] Não há usuário logado para carregar dados da Home.");
        return;
    }

    loadingSpinner.classList.remove('hidden'); // Exibe spinner GLOBAL para carregar Home
    console.log(`[ carregarHomeDashboard ] Carregando dados da Home para o usuário: ${currentUser.nome}`);

    try {
        // Obter contagem de jogos
        const gamesResponse = await eel.get_jogos_usuario()();
        if (gamesResponse.status === 'sucesso' && gamesResponse.jogos) {
            totalGamesCount.textContent = gamesResponse.jogos.length;
        } else {
            totalGamesCount.textContent = '0';
            console.error("[ carregarHomeDashboard ] Erro ao obter contagem de jogos:", gamesResponse.message);
        }

        // Obter contagem de streamers
        const streamersResponse = await eel.get_streamers_favoritos()();
        if (streamersResponse.status === 'sucesso' && streamersResponse.streamers) {
            totalStreamersCount.textContent = streamersResponse.streamers.length;
        } else {
            totalStreamersCount.textContent = '0';
            console.error("[ carregarHomeDashboard ] Erro ao obter contagem de streamers:", streamersResponse.message);
        }

    } catch (error) {
        console.error("[ carregarHomeDashboard ] Erro geral ao carregar dados da Home:", error);
        totalGamesCount.textContent = 'N/A';
        totalStreamersCount.textContent = 'N/A';
    } finally {
        loadingSpinner.classList.add('hidden'); // Esconde spinner GLOBAL
    }
}

// --- LÓGICA DO BLOCO DE NOTAS ---

/**
 * Exibe uma mensagem na área de mensagens do bloco de notas.
 * @param {string} message A mensagem a ser exibida.
 * @param {'success' | 'error' | 'info'} type O tipo da mensagem para estilização.
 */
function showNotepadMessage(message, type = 'error') {
    notepadMessageArea.textContent = message;
    notepadMessageArea.className = `message-area ${type}`;
    setTimeout(() => {
        notepadMessageArea.textContent = '';
        notepadMessageArea.className = 'message-area';
    }, 4000);
}

/**
 * Limpa todos os campos do formulário de adição/edição de notas e reseta o texto do botão.
 */
function limparFormularioNota() {
    noteIdInput.value = '';
    noteTitleInput.value = '';
    noteContentTextarea.value = '';
    saveNoteBtn.textContent = 'Adicionar Nota';
    cancelEditNoteBtn.classList.add('hidden');
    notepadMessageArea.textContent = '';
    notepadMessageArea.classList.remove('success', 'error', 'info');
    document.querySelectorAll('#add-edit-note-form .input-error').forEach(el => clearInputError(el));
}

/**
 * Carrega e exibe a lista de notas do usuário logado na interface do bloco de notas.
 */
async function carregarNotas() {
    if (!currentUser) {
        console.warn("[ carregarNotas ] Não há usuário logado para carregar notas. Abortando carregamento.");
        noteList.innerHTML = `
            <li class="empty-state-message">
                <p>Faça login para ver suas notas.</p>
            </li>
        `;
        noteListLoading.classList.add('hidden'); // Esconde spinner local
        return;
    }

    noteListLoading.classList.remove('hidden'); // Exibe o spinner local
    noteList.innerHTML = ''; // Limpa a lista para mostrar o spinner claramente
    console.log(`[ carregarNotas ] Carregando notas para o usuário: ${currentUser.nome}`);

    try {
        const resposta = await eel.get_notas_usuario()();
        noteList.innerHTML = ''; // Limpa novamente após a resposta

        if (resposta.status === 'sucesso' && resposta.notas && resposta.notas.length > 0) {
            resposta.notas.forEach(nota => {
                const li = document.createElement('li');
                li.className = 'note-item';

                li.innerHTML = `
                    <div class="note-info">
                        <strong>${nota.titulo}</strong>
                        <p class="note-content">${nota.conteudo}</p>
                        <span class="note-date">Criada em: ${formatarDataHora(nota.data_criacao)} | Última atualização: ${formatarDataHora(nota.data_atualizacao)}</span>
                    </div>
                    <div class="note-actions">
                        <button class="edit-note-btn" data-id="${nota.id}">Editar</button>
                        <button class="remove-note-btn" data-id="${nota.id}">Remover</button>
                    </div>
                `;
                noteList.appendChild(li);
            });

            // Adiciona event listeners para os botões de editar/remover de cada nota
            document.querySelectorAll('.edit-note-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const noteId = event.target.dataset.id;
                    const noteToEdit = resposta.notas.find(n => String(n.id) === noteId);
                    if (noteToEdit) preencherFormularioEdicaoNota(noteToEdit);
                });
            });

            document.querySelectorAll('.remove-note-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const noteId = event.target.dataset.id;
                    showCustomConfirm('Confirmar Remoção', 'Tem certeza que deseja remover esta nota?', (confirmed) => {
                        if (confirmed) {
                            removerNota(noteId);
                        }
                    });
                });
            });
            console.log(`[ carregarNotas ] ${resposta.notas.length} notas carregadas com sucesso.`);
        } else {
            console.log('[ carregarNotas ] Nenhuma nota encontrada para o usuário.');
            noteList.innerHTML = `
                <li class="empty-state-message">
                    <p>Você ainda não tem nenhuma nota.</p>
                    <p>Use o formulário acima para anotar suas ideias, builds e lembretes!</p>
                    <button class="quick-action-btn" data-action="add-note">Criar Nota Agora</button>
                </li>
            `;
            // Adiciona evento ao botão DENTRO do estado vazio
            document.querySelector('#note-list .quick-action-btn')?.addEventListener('click', () => {
                showDashboardSubView(document.getElementById('dashboard-notepad-view'), 'nav-notepad-button');
                limparFormularioNota();
                noteTitleInput.focus();
            });
        }
    } catch (error) {
        console.error("[ carregarNotas ] Erro geral ao carregar notas:", error);
        noteList.innerHTML = '<li class="empty-state-message" style="color: red;">Ocorreu um erro ao carregar as notas. Tente novamente.</li>';
    } finally {
        noteListLoading.classList.add('hidden'); // Esconde o spinner LOCAL
    }
}

/**
 * Preenche o formulário de adição/edição de notas com os dados de uma nota existente para edição.
 * @param {object} nota O objeto nota com os dados a serem preenchidos no formulário.
 */
function preencherFormularioEdicaoNota(nota) {
    noteIdInput.value = nota.id;
    noteTitleInput.value = nota.titulo;
    noteContentTextarea.value = nota.conteudo;
    saveNoteBtn.textContent = 'Salvar Alterações';
    cancelEditNoteBtn.classList.remove('hidden'); // Mostra o botão cancelar
    showNotepadMessage(`Editando: ${nota.titulo}`, 'info'); // Mensagem de feedback
    // Limpa quaisquer erros de validação visuais no formulário
    document.querySelectorAll('#add-edit-note-form .input-error').forEach(el => clearInputError(el));
}

/**
 * Cancela o modo de edição no formulário de notas, limpando os campos e resetando o botão.
 */
function cancelarEdicaoNota() {
    limparFormularioNota();
    showNotepadMessage('Edição de nota cancelada.', 'info');
}

/**
 * Adiciona uma nova nota ou atualiza uma nota existente no banco de dados.
 * Lida com a validação do formulário e feedback ao usuário.
 * @param {Event} event O evento de submissão do formulário.
 */
async function adicionarOuAtualizarNota(event) {
    event.preventDefault(); // Impede o comportamento padrão de submissão do formulário
    
    // Limpa erros de validação anteriores nos campos do formulário
    document.querySelectorAll('#add-edit-note-form .input-error').forEach(el => clearInputError(el));

    loadingSpinner.classList.remove('hidden'); // Exibe spinner GLOBAL para a operação
    notepadMessageArea.textContent = ''; // Limpa mensagens de feedback anteriores

    const id = noteIdInput.value; // ID da nota (vazio para adição, preenchido para edição)
    const titulo = noteTitleInput.value.trim();
    const conteudo = noteContentTextarea.value.trim();

    // Validações no frontend antes de enviar para o backend
    let isValid = true;
    if (!titulo) {
        displayInputError(noteTitleInput, 'O título da nota é obrigatório.');
        isValid = false;
    }
    if (!conteudo) {
        displayInputError(noteContentTextarea, 'O conteúdo da nota é obrigatório.');
        isValid = false;
    }

    if (!isValid) {
        loadingSpinner.classList.add('hidden'); // Esconde spinner se houver erros de validação
        showNotepadMessage('Por favor, corrija os erros no formulário.', 'error');
        return;
    }

    let resposta;
    try {
        if (id) { // Modo de edição: chama a função de atualização no backend
            resposta = await eel.atualizar_nota(id, titulo, conteudo)();
            console.log(`[ adicionarOuAtualizarNota ] Resposta da atualização:`, resposta);
        } else { // Modo de adição: chama a função de adição no backend
            resposta = await eel.adicionar_nota(titulo, conteudo)();
            console.log(`[ adicionarOuAtualizarNota ] Resposta da adição:`, resposta);
        }

        if (resposta.status === 'sucesso') {
            showNotepadMessage(resposta.message, 'success');
            limparFormularioNota(); // Limpa o formulário após sucesso
            await carregarNotas(); // Recarrega a lista de notas para refletir a mudança
        } else {
            showNotepadMessage(resposta.message, 'error'); // Exibe mensagem de erro do backend
        }
    } catch (error) {
        console.error("[ adicionarOuAtualizarNota ] Erro geral ao adicionar/atualizar nota:", error);
        showNotepadMessage("Ocorreu um erro de comunicação com o servidor ao salvar a nota. Tente novamente.", 'error');
    } finally {
        loadingSpinner.classList.add('hidden'); // Esconde o spinner GLOBAL
    }
}

/**
 * Remove uma nota do banco de dados.
 * @param {string | number} id_nota O ID da nota a ser removida.
 */
async function removerNota(id_nota) {
    loadingSpinner.classList.remove('hidden'); // Exibe spinner GLOBAL para a operação
    notepadMessageArea.textContent = ''; // Limpa mensagens de feedback anteriores

    try {
        const resposta = await eel.remover_nota(id_nota)();
        if (resposta.status === 'sucesso') {
            showNotepadMessage(resposta.message, 'success'); // Feedback de sucesso
            await carregarNotas(); // Recarrega a lista
        } else {
            showNotepadMessage(resposta.message, 'error'); // Feedback de erro
        }
    } catch (error) {
        console.error("[ removerNota ] Erro ao remover nota:", error);
        showNotepadMessage("Ocorreu um erro de comunicação ao remover a nota. Tente novamente.", 'error');
    } finally {
        loadingSpinner.classList.add('hidden'); // Esconde o spinner GLOBAL
    }
}


// --- LÓGICA DE TEMA ---

/**
 * Aplica o tema visual ao elemento <body> do documento.
 * Remove todas as classes de tema existentes e adiciona a nova.
 * @param {string} themeName O nome da classe CSS do tema (ex: 'dark-blue', 'theme-forest-green').
 */
function applyTheme(themeName) {
    console.log('[ applyTheme ] Aplicando tema:', themeName);
    console.log('[ applyTheme ] Body classes ANTES:', document.body.className);

    // Lista de todas as classes de tema conhecidas para remoção
    const allThemeClasses = [
        'theme-forest-green',
        'theme-purple-haze',
        'theme-golden-dawn',
        'theme-cyber-night',
        'theme-ocean-breeze'
    ];

    // Remove explicitamente TODAS as classes de tema conhecidas do body
    allThemeClasses.forEach(cls => {
        if (document.body.classList.contains(cls)) {
            document.body.classList.remove(cls);
            console.log(`[ applyTheme ] Removendo classe de tema: ${cls}`);
        }
    });
    
    // Adiciona a nova classe de tema ao body, se não for o tema padrão 'dark-blue'
    if (themeName && themeName !== 'dark-blue') { 
        document.body.classList.add(themeName);
        console.log(`[ applyTheme ] Adicionando nova classe de tema: ${themeName}`);
    } else {
        console.log('[ applyTheme ] Aplicando tema padrão (dark-blue), nenhuma classe específica adicionada.');
    }
    console.log('[ applyTheme ] Body classes DEPOIS:', document.body.className);
}

/**
 * Carrega a preferência de tema do usuário logado e seleciona o rádio button correspondente
 * na seção de configurações de tema do perfil.
 */
function loadUserThemePreference() {
    console.log('[ loadUserThemePreference ] Carregando preferência de tema do usuário...');
    // Limpa a seleção anterior de rádios para garantir que apenas um esteja marcado
    themeRadios.forEach(radio => radio.checked = false);

    if (currentUser && currentUser.tema_preferido) {
        const preferredTheme = currentUser.tema_preferido;
        // Busca o elemento do rádio button pelo seu ID, que deve ser igual ao nome do tema
        const radioToSelect = document.getElementById(preferredTheme); 
        
        if (radioToSelect) {
            radioToSelect.checked = true; // Marca o rádio button
            console.log(`[ loadUserThemePreference ] Tema do usuário carregado e selecionado: ${preferredTheme}`);
        } else {
            console.warn(`[ loadUserThemePreference ] Tema salvo no DB (${preferredTheme}) não encontrado nos rádios.`);
            // Seleciona o tema 'dark-blue' se o tema salvo não for encontrado (ex: tema removido)
            document.getElementById('dark-blue').checked = true; 
        }
    } else {
        // Se não houver usuário logado ou preferência salva, seleciona o tema padrão 'dark-blue'
        document.getElementById('dark-blue').checked = true; 
        console.log('[ loadUserThemePreference ] Nenhuma preferência de tema salva. Usando Dark Blue padrão.');
    }
    // Limpa a mensagem de feedback de tema ao carregar a seção
    themeMessageArea.textContent = '';
    themeMessageArea.classList.remove('success', 'error', 'info');
}

// --- CONFIGURAÇÃO DE EVENTOS ---
// Eventos para navegação entre telas de autenticação
showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterScreen(); });
showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showLoginScreen(); });

// Evento de Logout (usando modal de confirmação)
logoutButton.addEventListener('click', () => {
    showCustomConfirm('Confirmar Logout', 'Tem certeza que deseja sair da sua conta?', async (confirmed) => {
        if (confirmed) {
            await eel.fazer_logout()();
            showLoginScreen();
        }
    });
});

// Evento de Voltar para o Dashboard (do perfil)
backToDashboardBtn.addEventListener('click', () => {
    showMainView(dashboardContainer, 'nav-home-button'); 
    showDashboardSubView(document.getElementById('dashboard-home-view'), 'nav-home-button');
});

// Evento para ir para a tela de perfil
profileButton.addEventListener('click', showProfileScreen);

// Evento para Deletar Conta (usando modal de confirmação e prompt de senha)
deleteAccountBtn.addEventListener('click', () => {
    showCustomConfirm('ATENÇÃO: Deletar Conta', 'Você tem CERTEZA ABSOLUTA que quer deletar sua conta? Esta ação é irreversível.', async (confirmed) => {
        if (confirmed) {
            const senha = prompt("Para confirmar a exclusão, digite sua senha:");
            if (senha === null || senha === "") { 
                showProfileMessage("A exclusão foi cancelada.", 'info'); // Feedback ao cancelar pelo prompt
                return; 
            }
            showProfileMessage("Processando exclusão...", 'info'); // Feedback inicial
            loadingSpinner.classList.remove('hidden'); // Exibe spinner GLOBAL

            try {
                const resposta = await eel.deletar_conta(senha)();
                if (resposta.status === 'sucesso') {
                    // Usamos showProfileMessage aqui também para consistência
                    showProfileMessage(resposta.message, 'success');
                    // Pequeno atraso para o usuário ver a mensagem antes de mudar a tela
                    setTimeout(() => showLoginScreen(), 1500); 
                } else {
                    showProfileMessage(resposta.message, 'error');
                }
            } catch (error) {
                console.error("[ deleteAccountBtn ] Erro ao deletar conta:", error);
                showProfileMessage("Ocorreu um erro ao tentar deletar a conta. Tente novamente.", 'error');
            } finally {
                loadingSpinner.classList.add('hidden'); // Esconde spinner GLOBAL
            }
        }
    });
});

// Eventos de Submissão de Formulários (já com validação e feedback)
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    clearInputError(document.getElementById('login-email'));
    clearInputError(document.getElementById('login-senha'));
    loginMessageArea.textContent = '';


    let isValid = true;
    if (!email || !email.includes('@')) {
        displayInputError(document.getElementById('login-email'), 'E-mail inválido.');
        isValid = false;
    }
    if (!senha) {
        displayInputError(document.getElementById('login-senha'), 'A senha é obrigatória.');
        isValid = false;
    }
    if (!isValid) {
        return;
    }


    loadingSpinner.classList.remove('hidden');

    try {
        const resposta = await eel.verificar_login(email, senha)();
        if (resposta.status === 'sucesso') {
            await showDashboard(resposta.user);
            loginForm.reset(); // Limpa o formulário após o login
        } else {
            loginMessageArea.textContent = resposta.message;
            loginMessageArea.classList.add('error');
        }
    } catch (error) {
        console.error("[ loginForm ] Erro no login:", error);
        loginMessageArea.textContent = "Ocorreu um erro de comunicação. Tente novamente.";
        loginMessageArea.classList.add('error');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
});

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nome = document.getElementById('register-nome').value;
    const email = document.getElementById('register-email').value;
    const senha = document.getElementById('register-senha').value;

    clearInputError(document.getElementById('register-nome'));
    clearInputError(document.getElementById('register-email'));
    clearInputError(document.getElementById('register-senha'));
    registerMessageArea.textContent = '';

    let isValid = true;
    if (!nome.trim()) {
        displayInputError(document.getElementById('register-nome'), 'O nome é obrigatório.');
        isValid = false;
    }
    if (!email || !email.includes('@')) {
        displayInputError(document.getElementById('register-email'), 'E-mail inválido.');
        isValid = false;
    }
    if (senha.length < 6) {
        displayInputError(document.getElementById('register-senha'), 'A senha deve ter pelo menos 6 caracteres.');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    loadingSpinner.classList.remove('hidden');

    try {
        const resposta = await eel.cadastrar_usuario(nome, email, senha)();
        if (resposta.status === 'sucesso') {
            registerMessageArea.textContent = resposta.message + " Por favor, faça o login.";
            registerMessageArea.classList.add('success');
            registerForm.reset();
            setTimeout(showLoginScreen, 2000); // Exibe tela de login após 2s
        } else {
            registerMessageArea.textContent = resposta.message;
            registerMessageArea.classList.add('error');
        }
    } catch (error) {
        console.error("[ registerForm ] Erro no cadastro:", error);
        registerMessageArea.textContent = "Ocorreu um erro de comunicação. Tente novamente.";
        registerMessageArea.classList.add('error');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
});

addStreamerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nomeStreamer = streamerNameInput.value.trim();

    clearInputError(streamerNameInput);

    if (!nomeStreamer) {
        displayInputError(streamerNameInput, 'O nome do canal é obrigatório.');
        return;
    }

    loadingSpinner.classList.remove('hidden');
    try {
        const resposta = await eel.adicionar_streamer(nomeStreamer)();
        if (resposta.status === 'sucesso') {
            showProfileMessage("Streamer adicionado com sucesso!", 'success'); // Feedback de sucesso
            await carregarStreamers();
            streamerNameInput.value = '';
            await carregarHomeDashboard();
        } else {
            showProfileMessage(`Erro ao adicionar streamer: ${resposta.message}`, 'error'); // Feedback de erro
        }
    } catch (error) {
        console.error("[ addStreamerForm ] Erro ao adicionar streamer:", error);
        showProfileMessage("Ocorreu um erro de comunicação. Tente novamente.", 'error');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
});

updateProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const novoNome = profileNameInput.value.trim();
    const novoEmail = profileEmailInput.value.trim();
    const sobreMim = profileBioInput.value.trim();
    const steamUrl = profileSteamInput.value.trim();
    const twitchUrl = profileTwitchInput.value.trim();
    const discordId = profileDiscordInput.value.trim();

    clearInputError(profileNameInput);
    clearInputError(profileEmailInput);

    let isValid = true;
    if (!novoNome) {
        displayInputError(profileNameInput, 'O nome é obrigatório.');
        isValid = false;
    }
    if (!novoEmail || !novoEmail.includes('@')) {
        displayInputError(profileEmailInput, 'E-mail inválido.');
        isValid = false;
    }

    if (!isValid) {
        showProfileMessage('Por favor, corrija os erros no formulário.', 'error');
        return;
    }

    showProfileMessage("A atualizar perfil...", 'info'); // Feedback inicial
    loadingSpinner.classList.remove('hidden');

    try {
        const resposta = await eel.atualizar_perfil(novoNome, novoEmail, sobreMim, steamUrl, twitchUrl, discordId)();
        if (resposta.status === 'sucesso') {
            showProfileMessage(resposta.message, 'success');
            currentUser.nome = novoNome;
            currentUser.email = novoEmail;
            currentUser.sobre_mim = sobreMim;
            currentUser.steam_url = steamUrl;
            currentUser.twitch_url = twitchUrl;
            currentUser.discord_id = discordId;
            welcomeMessage.textContent = `Bem-vindo, ${novoNome}!`;
            await carregarHomeDashboard(); 
        } else {
            showProfileMessage(resposta.message, 'error');
        }
    } catch (error) {
        console.error("[ updateProfileForm ] Erro ao atualizar perfil:", error);
        showProfileMessage("Ocorreu um erro ao atualizar o perfil. Tente novamente.", 'error');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
});

updatePasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const senhaAtual = currentPasswordInput.value;
    const novaSenha = newPasswordInput.value;
    const confirmacaoSenha = confirmPasswordInput.value;

    clearInputError(currentPasswordInput);
    clearInputError(newPasswordInput);
    clearInputError(confirmPasswordInput);

    let isValid = true;
    if (!senhaAtual) {
        displayInputError(currentPasswordInput, 'A senha atual é obrigatória.');
        isValid = false;
    }
    if (novaSenha.length < 6) {
        displayInputError(newPasswordInput, 'A nova senha deve ter pelo menos 6 caracteres.');
        isValid = false;
    }
    if (novaSenha !== confirmacaoSenha) {
        displayInputError(confirmConfirmationPasswordInput, 'A nova senha e a confirmação não correspondem.'); // Corrigido aqui
        isValid = false;
    }

    if (!isValid) {
        showProfileMessage('Por favor, corrija os erros no formulário de senha.', 'error');
        return;
    }

    showProfileMessage("A atualizar senha...", 'info');
    loadingSpinner.classList.remove('hidden');

    try {
        const resposta = await eel.atualizar_senha(senhaAtual, novaSenha)();
        if (resposta.status === 'sucesso') {
            showProfileMessage(resposta.message, 'success');
            updatePasswordForm.reset();
        } else {
            showProfileMessage(resposta.message, 'error');
        }
    } catch (error) {
        console.error("[ updatePasswordForm ] Erro ao atualizar senha:", error);
        showProfileMessage("Ocorreu um erro ao atualizar a senha. Tente novamente.", 'error');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
});

avatarUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    clearInputError(avatarUploadInput);

    if (file.size > 5 * 1024 * 1024) {
        displayInputError(avatarUploadInput, 'O arquivo de imagem é muito grande (máx: 5MB).');
        avatarUploadInput.value = '';
        return;
    }
    if (!file.type.startsWith('image/')) {
        displayInputError(avatarUploadInput, 'Por favor, selecione um arquivo de imagem válido (PNG/JPG).');
        avatarUploadInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        profileAvatarImg.src = reader.result;
        saveAvatarBtn.classList.remove('hidden');
    };
    reader.onerror = () => {
        showProfileMessage('Erro ao ler o arquivo de imagem.', 'error');
        displayInputError(avatarUploadInput, 'Erro ao ler o arquivo.');
    };
});

saveAvatarBtn.addEventListener('click', async () => {
    const imageDataUrl = profileAvatarImg.src;
    if (!imageDataUrl || imageDataUrl.includes('default-avatar.png')) {
        showProfileMessage('Nenhuma imagem nova para salvar.', 'error');
        return;
    }

    showProfileMessage('A enviar novo avatar...', 'info');
    loadingSpinner.classList.remove('hidden');

    try {
        const resposta = await eel.atualizar_avatar(imageDataUrl)();
        if (resposta.status === 'sucesso') {
            showProfileMessage(resposta.message, 'success');
            saveAvatarBtn.classList.add('hidden');
            dashboardAvatarImg.src = resposta.new_avatar_url;
            if (currentUser) {
                currentUser.avatar_url = resposta.new_avatar_url;
            }
        } else {
            showProfileMessage(resposta.message, 'error');
        }
    } catch (error) {
        console.error("[ saveAvatarBtn ] Erro ao atualizar avatar:", error);
        showProfileMessage("Ocorreu um erro ao atualizar o avatar. Tente novamente.", 'error');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
});


// --- EVENTOS DE JOGOS ---
addEditGameForm.addEventListener('submit', adicionarOuAtualizarJogo);
cancelEditGameBtn.addEventListener('click', cancelarEdicao);

// --- EVENTOS DE NOTAS ---
addEditNoteForm.addEventListener('submit', adicionarOuAtualizarNota);
cancelEditNoteBtn.addEventListener('click', cancelarEdicaoNota);


// --- EVENTOS DE HOME DASHBOARD ---
quickActionBtns.forEach(button => {
    button.addEventListener('click', () => {
        const targetView = button.dataset.targetView;
        const action = button.dataset.action;

        if (targetView) {
            const targetViewElement = document.getElementById(targetView);
            if (targetViewElement) {
                const navButtonId = `nav-${targetView.replace('dashboard-', '').replace('-view', '')}-button`;
                showDashboardSubView(targetViewElement, navButtonId);
            }
        } else if (action === 'add-game') {
            showDashboardSubView(document.getElementById('dashboard-biblioteca-view'), 'nav-biblioteca-button');
            limparFormularioJogo();
            gameNameInput.focus();
        } else if (action === 'add-streamer') {
            showDashboardSubView(document.getElementById('dashboard-streamers-view'), 'nav-streamers-button');
            streamerNameInput.value = '';
            streamerNameInput.focus();
        } else if (action === 'add-note') {
            showDashboardSubView(document.getElementById('dashboard-notepad-view'), 'nav-notepad-button');
            limparFormularioNota();
            noteTitleInput.focus();
        }
    });
});


// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('[ DOMContentLoaded ] Disparado. Tentando verificar usuário logado...');

    eel.get_current_user()().then(user => {
        console.log('[ DOMContentLoaded ] Resultado de get_current_user:', user);
        if (user && user.id_usuario) {
            console.log('[ DOMContentLoaded ] Usuário logado. Mostrando dashboard.');
            showDashboard(user);
        } else {
            console.log('[ DOMContentLoaded ] Nenhum usuário logado. Mostrando tela de login.');
            showLoginScreen();
        }
    }).catch(error => {
        console.error("[ DOMContentLoaded ] Erro ao verificar usuário logado na inicialização:", error);
        showLoginScreen();
    });

    dashboardNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetViewId = button.dataset.target;
            const targetViewElement = document.getElementById(targetViewId);
            if (targetViewElement) {
                console.log(`[ DOMContentLoaded ] Botão de navegação do dashboard clicado: ${button.id}. Mostrando sub-view: ${targetViewId}`);
                showDashboardSubView(targetViewElement, button.id);
            }
        });
    });
});

// --- EVENTOS DE TEMA ---
saveThemeBtn.addEventListener('click', async () => {
    loadingSpinner.classList.remove('hidden');
    themeMessageArea.textContent = '';
    themeMessageArea.classList.remove('success', 'error', 'info');

    let selectedTheme = document.querySelector('input[name="theme-choice"]:checked')?.value;

    if (!selectedTheme) {
        // Usar themeMessageArea para feedback localizado
        themeMessageArea.textContent = 'Por favor, selecione um tema antes de salvar.';
        themeMessageArea.classList.add('error');
        loadingSpinner.classList.add('hidden');
        return;
    }

    console.log('[ saveThemeBtn ] Salvando tema selecionado:', selectedTheme);
    try {
        const resposta = await eel.set_user_theme(selectedTheme)();
        if (resposta.status === 'sucesso') {
            //showProfileMessage(resposta.message, 'success'); // Removido, usar themeMessageArea
            applyTheme(selectedTheme); 
            if (currentUser) {
                currentUser.tema_preferido = selectedTheme;
            }
            themeMessageArea.textContent = 'Tema salvo com sucesso!';
            themeMessageArea.classList.add('success');
            console.log('[ saveThemeBtn ] Tema salvo e aplicado com sucesso.');
        } else {
            //showProfileMessage(resposta.message, 'error'); // Removido, usar themeMessageArea
            themeMessageArea.textContent = resposta.message;
            themeMessageArea.classList.add('error');
            console.error('[ saveThemeBtn ] Erro ao salvar tema no backend:', resposta.message);
        }
    } catch (error) {
        console.error("[ saveThemeBtn ] Erro geral ao salvar tema:", error);
        //showProfileMessage("Erro ao salvar tema. Tente novamente.", 'error'); // Removido, usar themeMessageArea
        themeMessageArea.textContent = "Erro de comunicação ao salvar tema. Tente novamente.";
        themeMessageArea.classList.add('error');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
});