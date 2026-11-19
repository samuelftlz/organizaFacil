# 📱 OrganizaFácil

Aplicativo móvel simples e intuitivo de organização de tarefas voltado para estudantes do ensino médio e superior, desenvolvido para facilitar o gerenciamento de atividades acadêmicas, provas, trabalhos e prazos de entrega.

---

## 📋 Sobre o Projeto

Muitos estudantes enfrentam dificuldades para acompanhar demandas acadêmicas e datas de entrega, o que resulta em atrasos, estresse e queda no desempenho escolar. O **OrganizaFácil** resolve esse problema oferecendo uma interface direta, rápida e totalmente funcional offline para visualizar a rotina de estudos e acompanhar pendências em smartphones Android e iOS.

* **Status atual:** Versão 1.2 (Planejamento e prototipação concluídos).

---

## ✨ Funcionalidades (Requisitos Funcionais)

* **Cadastro e Gestão de Tarefas (`RF01`):** Criação, edição e exclusão de tarefas acadêmicas com título, matéria (opcional) e observações (opcionais).
* **Registro de Prazos (`RF02`):** Vinculação de data limite de entrega para cada atividade.
* **Categorização (`RF03`):** Classificação das tarefas em três tipos: **Atividade**, **Prova** ou **Trabalho**.
* **Visualização da Rotina / Cronograma (`RF04`):** Tela principal com as tarefas pendentes ordenadas automaticamente pela data de entrega mais próxima.
* **Acompanhamento de Status (`RF05`):** Marcação rápida entre status **Pendente** e **Concluída**.
* **Lembretes de Prazo (`RF06`):** Configuração opcional de data e hora para disparo de notificações locais diretamente no dispositivo.

---

## 🏗️ Arquitetura da Solução

O aplicativo segue uma arquitetura mobile modular dividida em três camadas:

1. **Camada de Interface (UI/UX):** Telas minimalistas focadas em usabilidade e resposta imediata (tempo de carregamento inferior a 1 segundo).
2. **Camada de Controle e Regras de Negócio:** Validação de campos obrigatórios, ordenação do cronograma, controle de estados e agendamento/cancelamento de lembretes.
3. **Camada de Persistência Local:** Armazenamento rápido e offline diretamente no smartphone.

---

## 🛠️ Tecnologias e Ferramentas

* **Framework e Linguagem:** React Native (Expo) com TypeScript
* **Banco de Dados Local:** SQLite / AsyncStorage
* **Recursos Nativos:** API de notificações locais (Android)
* **Build e Implantação:** Expo Application Services (EAS)
* **Design e Prototipação:** Figma
* **Versionamento e Gestão:** Git, GitHub e Trello

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado no computador
* Aplicativo **Expo Go** instalado no smartphone (Android) ou emulador configurado

### Passo a passo

1. Clone este repositório e acesse a pasta do projeto.
2. Instale as dependências:
   ```bash
   npm install
