# Vision App (Expo) — Descrição de Roupas por Voz

Aplicativo mobile acessível que usa a câmera para capturar uma foto da roupa e descreve em voz alta (PT-BR) cor, tipo de peça, padrões (listras, xadrez, estampa) e detalhes visuais relevantes. Toque na tela para capturar e descrever; toque e segure para repetir a última descrição.

## Sumário
- Recursos
- Requisitos
- Configuração (OPENAI_API_KEY)
- Executando o projeto
- Permissões e áudio (iOS/Android)
- Como funciona (arquitetura rápida)
- Scripts disponíveis
- Solução de problemas
- Tecnologias

## Recursos
- Toque único: captura a imagem e descreve por voz.
- Toque e segure: repete a última descrição.
- Fala em modo silencioso do iOS habilitada.
- Reprocessamento da imagem (redução e re-encode JPEG) para envio eficiente à IA.

## Requisitos
- Node.js 18+ (recomendado LTS)
- NPM 9+ ou Yarn/Pnpm
- Conta e chave da OpenAI
- Expo (CLI) e app Expo Go no dispositivo para testes rápidos

## Configuração (OPENAI_API_KEY)
1) Na raiz do repositório, crie o arquivo `.env` (não faça commit):
```
OPENAI_API_KEY=coloque_sua_chave_aqui
```
2) O projeto já carrega variáveis de ambiente no `app.config.ts` (via `dotenv`). A chave é exposta em `extra.OPENAI_API_KEY` somente em build/dev local para consumo do app.

Dica: nunca compartilhe sua chave. Em produção, utilize mecanismos seguros de entrega/configuração.

## Executando o projeto
Todos os comandos devem ser executados dentro da pasta `vision-app`.

1) Instalar dependências:
```
cd vision-app
npm install
```
2) Rodar no Web (rápido para validar fluxo):
```
npm run web
```
Abra a URL exibida (por ex.: http://localhost:8081/).

3) Rodar no iOS (Expo Go):
```
npm run ios
```
Escaneie o QR code com o app Expo Go.

4) Rodar no Android (Expo Go):
```
npm run android
```

## Permissões e áudio
- iOS: o app solicita acesso à Câmera e Microfone. A descrição está em `app.config.ts` (NSCameraUsageDescription, NSMicrophoneUsageDescription). Em runtime, o app solicita permissão do microfone e configura o áudio para tocar mesmo no modo silencioso.
- Android: solicita permissão de Câmera. Permissão de microfone não é necessária a menos que você vá gravar áudio.

Observação: o app não grava áudio; o microfone é solicitado para compatibilidade com configurações de áudio do sistema e cenários futuros. A síntese de voz usa `expo-speech`.

## Como funciona (arquitetura rápida)
- UI principal: tela cheia do componente de câmera, sem botões visuais. Gestos controlam as ações.
- Captura: ao tocar, a câmera tira uma foto.
- Otimização de imagem: a foto é redimensionada (~largura 960px) e re-encodada como JPEG base64 (compressão ~0.6) usando `expo-image-manipulator`.
- IA: a imagem é enviada para a OpenAI (modelo `gpt-4o-mini`) via endpoint `POST /v1/chat/completions` com o conteúdo `image_url` no formato `data:image/jpeg;base64,...`.
- Fala: a resposta é lida em voz alta em PT-BR usando `expo-speech`.
- Gestos: toque e segure repete a última descrição recebida.

Arquivos relevantes:
- `vision-app/App.tsx`: lógica principal (câmera, captura, manipulação de imagem, chamada à IA, síntese de voz, gestos).
- `vision-app/app.config.ts`: configuração Expo, permissões iOS/Android e injeção de variáveis de ambiente (`OPENAI_API_KEY`).

## Scripts disponíveis
- `npm run start`: inicia o Expo dev server (menu interativo)
- `npm run ios`: inicia no iOS (Expo Go)
- `npm run android`: inicia no Android (Expo Go)
- `npm run web`: inicia no navegador

## Solução de problemas
- “Falha na IA: 400 - Invalid image_url/base64”: tente novamente; assegure boa iluminação e conexão estável. O app já normaliza e re-encoda a imagem. Se persistir, reduza ainda mais a compressão/tamanho da imagem.
- Sem áudio no iOS: aumente o volume do dispositivo e verifique se o modo silencioso está ativo. O app tenta tocar mesmo no silencioso, mas o volume do sistema pode estar zerado.
- Permissão negada (câmera/microfone): abra Ajustes do iPhone/Android e habilite manualmente.
- Chave OpenAI ausente: defina `OPENAI_API_KEY` no `.env` e reinicie o servidor Expo.

## Tecnologias
- Expo (React Native)
- expo-camera (captura)
- expo-image-manipulator (redimensionar/re-encodar)
- expo-av (configuração de áudio e permissões)
- expo-speech (síntese de voz)
- OpenAI API (`gpt-4o-mini`)

---

Referências:
- Documentação Expo AV (áudio)
- Documentação Expo Camera
- Documentação Expo Speech
- Documentação Expo Image Manipulator

Consulte a documentação oficial do Expo e da OpenAI para detalhes atualizados.