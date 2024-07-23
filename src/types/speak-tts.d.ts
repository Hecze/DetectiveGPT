declare module 'speak-tts' {
  export default class Speech {
    init(options: {
      volume?: number;
      lang?: string;
      rate?: number;
      pitch?: number;
      voice?: string;
      splitSentences?: boolean;
      listeners?: {
        onvoiceschanged?: (voices: { name: string; lang: string }[]) => void;
      };
    }): Promise<{ voices: { name: string; lang: string }[] }>;

    setVoice(voice: string): void;

    speak(options: {
      text: string;
      queue?: boolean;
      listeners?: {
        onstart?: () => void;
        onend?: () => void;
        onresume?: () => void;
        onboundary?: (event: { name: string; elapsedTime: number }) => void;
      };
    }): Promise<any>;

    pause(): void;

    resume(): void;

    hasBrowserSupport(): boolean;
  }
}
