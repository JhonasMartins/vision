PRD – Aplicativo de Assistência Visual para Escolha de Roupas
1. Visão Geral

O aplicativo tem como objetivo auxiliar pessoas com deficiência visual a identificar e escolher roupas de forma autônoma.
Por meio da câmera do dispositivo, o app irá descrever em voz alta as características principais das peças de vestuário, como cor, tipo de roupa, padrões e detalhes visuais.

2. Objetivos Principais

Oferecer maior independência para pessoas com deficiência visual no processo de escolha de roupas.

Fornecer descrições claras, objetivas e em tempo real dos itens capturados pela câmera.

Garantir privacidade e conformidade com a LGPD, sem armazenar dados do usuário ou imagens processadas.

3. Público-Alvo

Pessoas com deficiência visual (baixa visão ou cegueira).

Pessoas que desejam suporte adicional na identificação de roupas.

4. Escopo do Produto
4.1 Funcionalidades Principais

Captura via Câmera

O usuário aponta a câmera do celular para uma peça de roupa.

O app processa a imagem em tempo real.

Reconhecimento de Objetos e Detalhes

Identificação da peça de roupa (camiseta, calça, vestido, etc.).

Reconhecimento de cores principais.

Identificação de padrões (listrado, estampado, xadrez, liso).

Descrição de detalhes relevantes (botões, bolsos, gola, etc. – se possível dentro da precisão do modelo).

Saída por Voz

Uso de TTS (Text-to-Speech) para narrar a descrição da peça.

Exemplo: “Camiseta azul clara com listras brancas.”

Interface Simples e Acessível

Interface minimalista com botões grandes.

Compatibilidade com TalkBack (Android) e VoiceOver (iOS).

Fluxo simples: abrir app → apontar câmera → ouvir descrição.

Privacidade e LGPD

Nenhum dado será armazenado em banco de dados.

Processamento local no dispositivo ou via API sem retenção de imagens.

4.2 Funcionalidades Futuras (fora do escopo inicial, mas previstas)

Sugestões de combinação de roupas.

Suporte multilíngue.

Ajustes de preferências de narração (velocidade, gênero da voz).

5. Requisitos Não Funcionais

Desempenho: descrição deve ser feita em até 3 segundos após o apontamento da câmera.

Acessibilidade: app deve ser compatível com padrões de acessibilidade mobile.

Privacidade: nenhuma foto ou vídeo será armazenado.

Compatibilidade: Android 9+ e iOS 14+.

6. Tecnologias e Integrações

Framework: React Native ou Flutter (para Android e iOS).

Reconhecimento de Imagem: TensorFlow Lite, ML Kit (Google), ou Vision Framework (Apple).

Voz: Google Text-to-Speech / Apple Speech Synthesis.

Acessibilidade: APIs nativas de acessibilidade do Android/iOS.

7. Fluxo do Usuário

Usuário abre o app.

A câmera é ativada automaticamente.

Usuário aponta para uma peça de roupa.

O app processa a imagem e gera descrição em texto.

A descrição é narrada em voz alta.

Usuário pode repetir a descrição com um botão grande de “Repetir”.

8. Critérios de Sucesso

Usuário consegue identificar corretamente ao menos 80% das peças de roupa testadas.

Tempo de resposta abaixo de 3 segundos.

Feedback positivo de pessoas com deficiência visual em testes de usabilidade.