<h2>Descrição</h2>
<p>
    O <strong>Pets Inn</strong> é uma aplicação desenvolvida para facilitar o agendamento de hospedagens em hotéis e creches de pets. A plataforma atende tanto os <strong>clientes</strong> quanto as <strong>empresas</strong> do ramo pet, proporcionando praticidade e organização.
</p>

<h2>Funcionalidades</h2>

<h3>Cliente</h3>
<ul>
    <li>Cadastro de Usuario.</li>
    <li>Agendamento de horários para hospedagem.</li>
    <li>Favoritar hotéis e creches.</li>
    <li>Aba de favoritos com os estabelecimentos adicionados.</li>
    <li>Visualização e gerenciamento das hospedagens.</li>
    <li>Perfil do cliente com gerenciamento de informações e cadastro de pets.</li>
    <li>Chat com a empresa, liberado somente após a confirmação de uma hospedagem.</li>
    <li>Realização de avaliação do local após a conclusão de uma reserva.</li>
    <li>Envio de email para confirmação .</li>
</ul>

<h3>Empresa</h3>
<ul>
    <li>Cadastro e edição de perfil da empresa.</li>
    <li>Consulta de hospedagens agendadas por data.</li>
    <li>Chat com o cliente, liberado somente após a confirmação de uma hospedagem.</li>
</ul>

<h2>Estrutura da Aplicação</h2>

<h3>Navegação do Cliente</h3>
<ul>
    <li><strong>Aba de Agendamentos:</strong> Interface para agendar hospedagens.</li>
    <li><strong>Favoritos:</strong> Lista de estabelecimentos favoritos.</li>
    <li><strong>Mensagens:</strong> Envio de mensagens entre empresa e cliente <strong>(Necessario realizar reserva para liberação do chat)</strong></li>
    <li><strong>Minhas Hospedagens:</strong> Gerenciamento de hospedagens.</li>
    <li><strong>Perfil:</strong> Gerenciamento de informações pessoais e cadastro de pets.</li>
</ul>

<h3>Navegação da Empresa</h3>
<ul>
    <li><strong>Perfil da Empresa:</strong> Edição de informações cadastrais.</li>
    <li><strong>Mensagens:</strong> Envio de mensagens entre empresa e cliente <strong>(Necessario realizar reserva para liberação do chat)</strong></li>
    <li><strong>Hospedagens:</strong> Consulta de hospedagens por data.</li>
</ul>

<h2>Tecnologias Utilizadas</h2>
<ul>
    <li><strong>Frontend:</strong> React Native.</li>
    <li><strong>Backend:</strong> Python [Flask para a criação das APIs, WebSocket para a comunicação entre empresa e usuario]</li>
    <li><strong>Confirmação de Cadastro:</strong> SMTP do Python para envio de e-mails.</li>
    <li><strong>Banco de Dados:</strong> MySQL.</li>
    <li><strong>Ferramentas para testes:</strong> Insomnia</li>
</ul>
