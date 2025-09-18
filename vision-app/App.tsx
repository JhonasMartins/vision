import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, Pressable, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import * as ImageManipulator from 'expo-image-manipulator';

export default function App() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastDescription, setLastDescription] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | undefined>(undefined);

  // Carregar voz mais natural em pt-BR (prioriza qualidade melhor quando disponível)
  useEffect(() => {
    (async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        // Filtra vozes pt-BR
        const ptBR = (voices || []).filter(v => (v as any).language?.toLowerCase?.().startsWith('pt-br')) as any[];
        // Tenta Enhanced/Premium primeiro
        const enhanced = ptBR.find(v => String((v as any).quality || '').toLowerCase().includes('enhanced') || String((v as any).name || '').toLowerCase().includes('premium'));
        const chosen = enhanced || ptBR[0];
        if (chosen?.identifier) setVoiceId(chosen.identifier);
      } catch {
        // Ignora, usará padrão
      }
    })();
  }, []);

  // Fala utilitária (voz mais natural se disponível)
  const speak = useCallback((text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: 'pt-BR',
      voice: voiceId, // usa voz preferida se disponível
      pitch: 1.0,
      rate: Platform.select({ ios: 0.46, android: 1.0, default: 1.0 }),
    });
  }, [voiceId]);

  // Obter chave da OpenAI da configuração (app.config.ts -> extra.OPENAI_API_KEY)
  const getApiKey = useCallback(() => {
    const key = (Constants?.expoConfig?.extra as any)?.OPENAI_API_KEY as string | undefined;
    return key && key.length > 0 ? key : undefined;
  }, []);

  // Solicitar permissão automaticamente
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Solicitar permissão de microfone (iOS) para habilitar funcionalidades de áudio quando necessário
  useEffect(() => {
    (async () => {
      try {
        const current = await Audio.getPermissionsAsync();
        if (current.status !== 'granted') {
          const res = await Audio.requestPermissionsAsync();
          if (res.status !== 'granted') {
            speak('Permissão do microfone negada. Você pode ativar nas configurações do iPhone.');
          }
        }
      } catch {
        // silencioso
      }
    })();
  }, [speak]);

  // Configurar áudio (permitir tocar em modo silencioso) e anunciar instruções
  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        // continua mesmo se falhar
      }

      const key = getApiKey();
      if (!key) {
        speak('Configuração da chave da OpenAI ausente. Por favor, configure a chave no app.');
      } else {
        speak('Aplicativo pronto. Toque para descrever a roupa e ouvir dicas. Toque e segure para repetir a última resposta.');
      }
    })();
  }, [getApiKey, speak]);

  // Descrever roupa via OpenAI
  // Utilitário: normalizar base64 (remover quebras/headers e ajustar padding)
  const normalizeBase64 = useCallback((b64: string): string => {
    let s = String(b64 || '');
    // Remover prefixo data URL se vier
    s = s.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    // Remover espaços/quebras de linha
    s = s.replace(/\s+/g, '');
    // Ajustar padding para múltiplos de 4
    const mod = s.length % 4;
    if (mod === 2) s += '==';
    else if (mod === 3) s += '=';
    else if (mod === 1) s = s.slice(0, -1); // caso muito raro de byte perdido, corta 1 para tentar corrigir
    return s;
  }, []);

  const describeClothing = useCallback(async (base64: string): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('Chave de API não configurada.');

    const prompt = 'Você é um assistente de moda para pessoas com deficiência visual.\n\n1) Descrição: descreva a peça em 1 a 2 frases, em português do Brasil, incluindo tipo (camisa, calça, vestido, etc.), cor principal, padrões (listras, xadrez, estampas) e detalhes visuais relevantes (botões, bolsos, gola). Evite suposições e não mencione pessoas.\n\n2) Dicas: forneça 2 a 3 itens curtos e práticos, priorizando nesta ordem:\n   - Ocasiões recomendadas de uso (informal, trabalho, noite, clima, eventos).\n   - Combinações de cores e tendências atuais (neutros, contraste, monocromático, texturas).\n   - Instruções de cuidado rápidas (lavagem, secagem, passar, armazenamento) apenas se relevante.\n\nTom: amigável, direto e confiante; evite jargões e redundâncias.\n\nFormate exatamente assim:\nDescrição: <texto curto>\nDicas:\n- <dica 1>\n- <dica 2>\n- <dica 3 (opcional)>';

    const clean = normalizeBase64(base64);
    const dataUrl = `data:image/jpeg;base64,${clean}`;

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 220,
    } as const;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let reason = '';
      try {
        const txt = await res.text();
        try {
          const j = JSON.parse(txt);
          reason = j?.error?.message || txt;
        } catch {
          reason = txt;
        }
      } catch {}
      throw new Error(`Falha na IA: ${res.status}${reason ? ' - ' + reason : ''}`);
    }

    const json = await res.json();
    const text: string | undefined = json?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Resposta vazia da IA.');
    return text.trim();
  }, [getApiKey, normalizeBase64]);

  // Ação: descrever (toque)
  const onDescribeRequest = useCallback(async () => {
    if (!permission?.granted) {
      await requestPermission();
      if (!permission?.granted) {
        speak('Permissão da câmera é necessária.');
        return;
      }
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      speak('Chave da OpenAI não configurada.');
      return;
    }

    try {
      setIsCapturing(true);
      const camera = cameraRef.current as any;
      if (!camera || !camera.takePictureAsync) {
        speak('Câmera não está pronta.');
        return;
      }

      const image = await camera.takePictureAsync({ base64: false, quality: 0.4, skipProcessing: true });
      if (!image?.uri) {
        speak('Não foi possível capturar a imagem.');
        return;
      }

      // Reencoda/Redimensiona para garantir base64 JPEG válido e menor
      const manipulated = await ImageManipulator.manipulateAsync(
        image.uri,
        [{ resize: { width: 960 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!manipulated?.base64) {
        speak('Falha ao processar a imagem.');
        return;
      }

      speak('Processando, aguarde.');
      const description = await describeClothing(manipulated.base64);
      setLastDescription(description);
      speak(description);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message ? String(e.message) : 'erro desconhecido';
      const shortMsg = msg.length > 220 ? msg.slice(0, 220) + '…' : msg;
      speak(`Ocorreu um erro: ${shortMsg}`);
    } finally {
      setIsCapturing(false);
    }
  }, [permission, requestPermission, speak, describeClothing, getApiKey]);

  // Ação: repetir (toque e segure)
  const onRepeatRequest = useCallback(() => {
    if (lastDescription) {
      speak(lastDescription);
    } else {
      speak('Nenhuma resposta disponível ainda. Toque para descrever e ouvir dicas.');
    }
  }, [lastDescription, speak]);

  // Estados de permissão
  if (!permission) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Carregando permissões...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.infoText}>Precisamos de acesso à câmera. Toque na tela para permitir.</Text>
        <Pressable onPress={requestPermission} accessibilityRole="button" accessibilityLabel="Permitir acesso à câmera" style={styles.fullscreenPressable} />
      </SafeAreaView>
    );
  }

  // UI principal sem botões visuais: toda a tela é interativa por gestos
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <Pressable
            onPress={onDescribeRequest}
            onLongPress={onRepeatRequest}
            accessibilityRole="button"
            accessibilityLabel="Toque para descrever. Toque e segure para repetir a última descrição."
            style={styles.fullscreenPressable}
          />
          {isCapturing && (
            <View style={styles.processingBanner}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.processingText}>Processando...</Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  infoText: { color: '#111', textAlign: 'center', marginTop: 12, fontSize: 16 },
  fullscreenPressable: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  processingBanner: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  processingText: { color: '#fff', marginLeft: 8, fontSize: 14 },
});
