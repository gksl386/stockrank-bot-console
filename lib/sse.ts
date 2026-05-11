// lib/sse.ts
// EventSource wrapper — BotConsole SSE 3 엔드포인트 정통.
// 자동 reconnect (브라우저 내장) + onmessage/onerror/close.

export interface SseHandlers {
  onConnected?: (data: unknown) => void;
  onMessage?: (data: unknown, eventName: string) => void;
  onClose?: (data: unknown) => void;
  onError?: (err: Event) => void;
}

export function subscribeSSE(url: string, handlers: SseHandlers): () => void {
  const es = new EventSource(url);

  const safeParse = (text: string): unknown => {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  es.addEventListener('connected', (ev: MessageEvent) => {
    handlers.onConnected?.(safeParse(ev.data));
  });

  es.addEventListener('message', (ev: MessageEvent) => {
    handlers.onMessage?.(safeParse(ev.data), 'message');
  });

  // 백엔드는 message 외에도 run_status / event / waiting / error / close 같은 named events 발행
  for (const name of ['run_status', 'event', 'waiting', 'error', 'close']) {
    es.addEventListener(name, (ev: MessageEvent) => {
      const data = safeParse(ev.data);
      if (name === 'close') {
        handlers.onClose?.(data);
        es.close();
      } else if (name === 'error') {
        handlers.onError?.(new ErrorEvent('error', { message: typeof data === 'string' ? data : JSON.stringify(data) }));
      } else {
        handlers.onMessage?.(data, name);
      }
    });
  }

  es.onerror = (ev) => {
    handlers.onError?.(ev);
  };

  return () => es.close();
}
