import '@google/model-viewer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { atelierApi } from '@/features/atelier/api/atelierApi';
import { useChat } from '@/features/atelier/hooks/useChat';
import { useGenerateFromText, useGenerateFromImage, useRefineFromPreview } from '@/features/atelier/hooks/useGenerate';
import { useTaskStatus } from '@/features/atelier/hooks/useTaskStatus';
import { isAffirmative, extractMeshyPrompt, stripHiddenPrompt, getProgressMessage, meshyUrl } from '@/features/atelier/utils/atelierHelpers';
import type { ArtStyle, TaskStatus } from '@/features/atelier/types/atelier.types';

// ── Types ─────────────────────────────────────────────────────────────────────
type ChatMsg = {
  id: string;
  kind: 'chat';
  role: 'user' | 'assistant';
  content: string;
};

type GenResult = {
  status: 'done' | 'failed';
  thumbnailUrl?: string;
  modelUrls?: Record<string, string>;
  error?: string;
};

type GenMsg = {
  id: string;
  kind: 'gen';
  taskId: string;
  taskType: 'text' | 'refine' | 'image';
  result?: GenResult;
};

type AnyMsg = ChatMsg | GenMsg;

// ── Constants ─────────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'Diseña una bolsa minimalista en cuero blanco',
  '¿Qué materiales usas en las colecciones WAX?',
  'Quiero un accesorio con estructura arquitectónica',
];

const PROGRESS_STEPS = ['Geometría', 'Detalles', 'Texturas', 'Final'];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const renderContent = (text: string) =>
  text.split(/(\*\*[^*\n]+\*\*)/g).map((seg, i) =>
    /^\*\*[^*\n]+\*\*$/.test(seg) ? <strong key={i}>{seg.slice(2, -2)}</strong> : seg
  );

// ── Model Viewer Popup ────────────────────────────────────────────────────────
const ModelViewerPopup = ({
  glbUrl,
  thumbnailUrl,
  onClose,
}: {
  glbUrl: string;
  thumbnailUrl?: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="atelier-popup-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="atelier-popup" onClick={e => e.stopPropagation()}>
        <button className="atelier-popup-close" onClick={onClose} aria-label="Cerrar vista 3D">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="atelier-popup-viewer">
          <model-viewer
            src={meshyUrl(glbUrl)}
            poster={thumbnailUrl ? meshyUrl(thumbnailUrl) : undefined}
            camera-controls="true"
            auto-rotate="true"
            shadow-intensity="1.2"
            shadow-softness="0.5"
            loading="eager"
            reveal="auto"
            environment-image="neutral"
            style={{ width: '100%', height: '100%', background: '#1c1c1e' }}
          />
        </div>

        <div className="atelier-popup-footer">
          <p className="atelier-popup-hint">Arrastra para rotar · Pellizca para hacer zoom</p>
          <a href={glbUrl} download className="atelier-gen-download">
            Descargar GLB
          </a>
        </div>
      </div>
    </div>
  );
};

// ── Gen Card ──────────────────────────────────────────────────────────────────
const GenCard = ({
  msg,
  liveStatus,
  onCotizar,
  onExpand,
  isRefining,
}: {
  msg: GenMsg;
  liveStatus: TaskStatus | undefined;
  onCotizar: (glbUrl: string, taskId: string) => void;
  onExpand: (glbUrl: string, thumbnailUrl?: string) => void;
  isRefining?: boolean;
}) => {
  const isDone   = msg.result?.status === 'done'   || liveStatus?.status === 'SUCCEEDED';
  const isFailed = msg.result?.status === 'failed' || liveStatus?.status === 'FAILED';
  const glbUrl   = msg.result?.modelUrls?.glb ?? liveStatus?.model_urls?.glb;
  const thumbUrl = msg.result?.thumbnailUrl   ?? liveStatus?.thumbnail_url;
  const progress = liveStatus?.progress ?? 0;
  const activeStep = Math.min(Math.floor(progress / 25), 3);

  if (isFailed) {
    return (
      <div className="atelier-gen-card">
        <p className="atelier-task-error">
          {msg.result?.error ?? liveStatus?.error ?? 'Error al generar. Inicia una nueva conversación.'}
        </p>
      </div>
    );
  }

  if (isDone && glbUrl) {
    return (
      <div className="atelier-gen-card atelier-gen-card--done">
        <div className="atelier-model-wrapper">
          <model-viewer
            src={meshyUrl(glbUrl)}
            poster={thumbUrl ? meshyUrl(thumbUrl) : undefined}
            camera-controls="true"
            auto-rotate="true"
            shadow-intensity="1"
            loading="eager"
            reveal="auto"
            environment-image="neutral"
            style={{ width: '100%', height: '16rem', background: '#1c1c1e' }}
          />
          <button
            className="atelier-model-expand-hint"
            onClick={() => onExpand(glbUrl, thumbUrl)}
            aria-label="Ver modelo 3D en detalle"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            Ver en detalle
          </button>
        </div>

        <div className="atelier-gen-actions">
          <button className="atelier-gen-cta" onClick={() => onCotizar(glbUrl ?? '', msg.taskId)}>
            Enviar a cotizar
          </button>
          <a href={glbUrl} download className="atelier-gen-download">
            Descargar GLB
          </a>
        </div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="atelier-gen-card atelier-gen-card--done">
        {thumbUrl && (
          <img src={thumbUrl} alt="Modelo generado" className="atelier-task-thumbnail" />
        )}
        <div className="atelier-gen-actions">
          <button className="atelier-gen-cta" onClick={() => onCotizar(glbUrl ?? '', msg.taskId)}>
            Enviar a cotizar
          </button>
        </div>
      </div>
    );
  }

  // ── In progress ──
  const phaseLabel = isRefining
    ? (progress < 40 ? 'Aplicando texturas…' : progress < 75 ? 'Calculando materiales PBR…' : 'Añadiendo color…')
    : getProgressMessage(progress);
  const phaseSteps = isRefining
    ? ['Texturas', 'Materiales', 'Color', 'Final']
    : PROGRESS_STEPS;

  return (
    <div className="atelier-gen-card atelier-gen-card--progress">
      <span className="atelier-task-label">{phaseLabel}</span>
      <div className="atelier-progress-bar">
        <div className="atelier-progress-fill" style={{ width: `${Math.max(progress, 2)}%` }} />
      </div>
      <div className="atelier-progress-steps">
        {phaseSteps.map((step, i) => (
          <div
            key={step}
            className={`atelier-progress-step${i <= activeStep ? ' atelier-progress-step--active' : ''}`}
          >
            <div className="atelier-progress-step-dot" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const AtelierChat = () => {
  const [sessionId, setSessionId]           = useState(() => crypto.randomUUID());
  const [messages, setMessages]             = useState<AnyMsg[]>([]);
  const [input, setInput]                   = useState('');
  const [lastGenPrompt, setLastGenPrompt]   = useState('');
  const [artStyle, setArtStyle]             = useState<ArtStyle>('realistic');
  const [inputImg, setInputImg]             = useState<File | null>(null);
  const [inputImgPreview, setInputImgPreview] = useState<string | null>(null);
  const [activeGen, setActiveGen]           = useState<{ msgId: string; taskId: string; taskType: 'text' | 'refine' | 'image' } | null>(null);
  const refineStarted = useRef<Set<string>>(new Set());
  // One model per conversation
  const [hasGeneratedModel, setHasGeneratedModel] = useState(false);
  // Popup
  const [popupGlbUrl, setPopupGlbUrl]       = useState<string | null>(null);
  const [popupThumbUrl, setPopupThumbUrl]   = useState<string | undefined>(undefined);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const { mutate: sendMessage,     isPending: isChatPending }     = useChat();
  const { mutate: generateText,    isPending: isGeneratingText }  = useGenerateFromText();
  const { mutate: generateImage,   isPending: isGeneratingImage } = useGenerateFromImage();
  const { mutate: refineFromPreview }                             = useRefineFromPreview();
  const isGenerating = isGeneratingText || isGeneratingImage;

  const { data: taskStatus } = useTaskStatus(activeGen?.taskId ?? null, activeGen?.taskType ?? 'text');

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatPending]);

  // Resolve generation result when task finishes; auto-start refine after preview
  useEffect(() => {
    if (!activeGen || !taskStatus) return;
    const done = taskStatus.status === 'SUCCEEDED' || taskStatus.status === 'FAILED';
    if (!done) return;

    // Preview done → auto-start refine for textures/color
    if (activeGen.taskType === 'text' && taskStatus.status === 'SUCCEEDED') {
      if (refineStarted.current.has(activeGen.taskId)) return;
      refineStarted.current.add(activeGen.taskId);
      refineFromPreview(
        { previewTaskId: activeGen.taskId, artStyle },
        {
          onSuccess: data => {
            setActiveGen(prev => prev ? { ...prev, taskId: data.taskId, taskType: 'refine' } : null);
          },
          onError: () => {
            // Fallback: show preview result if refine fails
            setMessages(prev =>
              prev.map(m =>
                m.kind === 'gen' && m.id === activeGen.msgId
                  ? { ...m, result: { status: 'done', thumbnailUrl: taskStatus.thumbnail_url, modelUrls: taskStatus.model_urls } }
                  : m,
              ),
            );
            setActiveGen(null);
          },
        },
      );
      return;
    }

    const result: GenResult =
      taskStatus.status === 'SUCCEEDED'
        ? { status: 'done', thumbnailUrl: taskStatus.thumbnail_url, modelUrls: taskStatus.model_urls }
        : { status: 'failed', error: taskStatus.error };

    setMessages(prev =>
      prev.map(m => (m.kind === 'gen' && m.id === activeGen.msgId ? { ...m, result } : m)),
    );
    setActiveGen(null);
  }, [taskStatus, activeGen, artStyle, refineFromPreview]);

  const addMsg = (msg: AnyMsg) => setMessages(prev => [...prev, msg]);

  // ── Reset conversation ────────────────────────────────────────────────────
  const handleReset = () => {
    setSessionId(crypto.randomUUID());
    setMessages([]);
    setLastGenPrompt('');
    setInputImg(null);
    setInputImgPreview(null);
    setActiveGen(null);
    setHasGeneratedModel(false);
    refineStarted.current.clear();
    if (imgInputRef.current) imgInputRef.current.value = '';
  };

  const handleCotizar = (glbUrl: string, taskId: string) => {
    // Extract the design description — find the AI's Phase 2 summary (contains ✨)
    const summaryMsg = [...messages]
      .reverse()
      .find(m => m.kind === 'chat' && m.role === 'assistant' && m.content.includes('✨'));
    const description = summaryMsg?.kind === 'chat'
      ? summaryMsg.content
      : messages.filter(m => m.kind === 'chat' && m.role === 'assistant').map(m => m.kind === 'chat' ? m.content : '').join('\n\n');

    atelierApi.submitCotizacion({ glbUrl, taskId, description }).catch(() => {/* fire-and-forget */});
    toast.success('¡Listo! Tu solicitud fue enviada a WAX. En breve te contactamos.');
    handleReset();
  };

  const handleExpand = useCallback((glbUrl: string, thumbUrl?: string) => {
    setPopupGlbUrl(glbUrl);
    setPopupThumbUrl(thumbUrl);
  }, []);

  // ── Send chat message ─────────────────────────────────────────────────────
  const handleSend = () => {
    const text = input.trim();
    if (!text || isChatPending || isGenerating) return;

    addMsg({ id: crypto.randomUUID(), kind: 'chat', role: 'user', content: text });
    setInput('');

    // Trigger generation only when Phase 3 marker was received and user confirms
    if (lastGenPrompt && isAffirmative(text) && !hasGeneratedModel) {
      const msgId = crypto.randomUUID();
      setHasGeneratedModel(true);
      generateText(
        { prompt: lastGenPrompt, artStyle },
        {
          onSuccess: data => {
            addMsg({ id: msgId, kind: 'gen', taskId: data.taskId, taskType: 'text' });
            setActiveGen({ msgId, taskId: data.taskId, taskType: 'text' });
          },
          onError: () => {
            setHasGeneratedModel(false);
            addMsg({
              id: msgId,
              kind: 'chat',
              role: 'assistant',
              content: 'No se pudo iniciar la generación. Intenta de nuevo.',
            });
          },
        },
      );
      return;
    }

    sendMessage(
      { message: text, sessionId },
      {
        onSuccess: data => {
          const extracted  = extractMeshyPrompt(data.output);
          const displayText = stripHiddenPrompt(data.output);
          addMsg({ id: crypto.randomUUID(), kind: 'chat', role: 'assistant', content: displayText });
          if (extracted) {
            setLastGenPrompt(extracted.prompt);
            if (extracted.artStyle) setArtStyle(extracted.artStyle);
          } else {
            setLastGenPrompt('');
          }
        },
        onError: () => {
          addMsg({
            id: crypto.randomUUID(),
            kind: 'chat',
            role: 'assistant',
            content: 'No se pudo conectar con el asistente. Intenta de nuevo.',
          });
        },
      },
    );
  };

  // ── Generate from image (only allowed on empty conversation) ─────────────
  const handleGenerateFromImg = async () => {
    if (!inputImg || hasGeneratedModel) return;
    const dataUrl = await fileToDataUrl(inputImg);
    // Clear preview immediately so the UI responds at once
    setInputImg(null);
    setInputImgPreview(null);
    if (imgInputRef.current) imgInputRef.current.value = '';
    setHasGeneratedModel(true);
    const msgId = crypto.randomUUID();
    generateImage(
      { imageDataUrl: dataUrl },
      {
        onSuccess: data => {
          addMsg({ id: msgId, kind: 'gen', taskId: data.taskId, taskType: 'image' });
          setActiveGen({ msgId, taskId: data.taskId, taskType: 'image' });
        },
        onError: () => setHasGeneratedModel(false),
      },
    );
  };

  const handleImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInputImg(file);
    setInputImgPreview(await fileToDataUrl(file));
  };

  const clearImg = () => {
    setInputImg(null);
    setInputImgPreview(null);
    if (imgInputRef.current) imgInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isConversationEmpty = messages.length === 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="atelier-chat">

        {/* ── Messages area ── */}
        <div className="atelier-chat-messages">
          {isConversationEmpty && (
            <div className="atelier-chat-empty">
              <div className="atelier-advisement">
                <p className="atelier-advisement-title">Cómo funciona</p>
                <ul className="atelier-advisement-list">
                  <li>Conversa con el asistente y comparte todos los detalles que puedas: <strong>material, color, forma y dimensiones</strong> — cuanto más específica seas, mejor será el resultado</li>
                  <li>La IA te hará preguntas para afinar el concepto y, cuando esté listo, generará el modelo 3D automáticamente</li>
                  <li>Solo se puede generar <strong>un modelo por conversación</strong> — si quieres otro diseño, inicia una nueva</li>
                </ul>
                <p className="atelier-advisement-note">
                  <strong>Texto</strong> permite personalizar y ajustar el diseño conversando, pero el resultado 3D es aproximado.{' '}
                  <strong>Imagen</strong> genera un modelo más fiel a la referencia visual, pero no admite correcciones posteriores.
                </p>
              </div>
              <div className="atelier-chat-chips">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    className="atelier-chat-chip"
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {isConversationEmpty && (
                <p className="atelier-img-hint">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  También puedes subir una imagen de referencia para generar directamente en 3D
                </p>
              )}
            </div>
          )}

          {messages.map(msg => {
            if (msg.kind === 'chat') {
              return (
                <div key={msg.id} className={`atelier-msg atelier-msg--${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <span className="atelier-msg-role">WAX Studio</span>
                  )}
                  <p className="atelier-msg-content">{renderContent(msg.content)}</p>
                </div>
              );
            }
            return (
              <GenCard
                key={msg.id}
                msg={msg}
                liveStatus={activeGen?.msgId === msg.id ? taskStatus : undefined}
                onCotizar={handleCotizar}
                onExpand={handleExpand}
                isRefining={activeGen?.msgId === msg.id && activeGen.taskType === 'refine'}
              />
            );
          })}

          {isChatPending && (
            <div className="atelier-msg atelier-msg--assistant">
              <span className="atelier-msg-role">WAX Studio</span>
              <div className="atelier-typing"><span /><span /><span /></div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Image preview — only when conversation is empty ── */}
        {inputImgPreview && isConversationEmpty && (
          <div className="atelier-img-preview-area">
            <img src={inputImgPreview} alt="Imagen seleccionada" className="atelier-img-preview-thumb" />
            <span className="atelier-img-preview-label">Imagen lista · se generará en 3D</span>
            <div className="atelier-img-preview-actions">
              <button type="button" className="atelier-img-clear-btn" onClick={clearImg}>
                × Quitar
              </button>
              <button className="atelier-gen-cta" onClick={handleGenerateFromImg} disabled={isGenerating}>
                Generar en 3D
              </button>
            </div>
          </div>
        )}

        {/* Loading indicator while API call is in flight before task ID arrives */}
        {isGenerating && !activeGen && (
          <div className="atelier-gen-card atelier-gen-card--progress" style={{ margin: '0 1rem 0.75rem' }}>
            <span className="atelier-task-label">Iniciando generación…</span>
            <div className="atelier-progress-bar">
              <div className="atelier-progress-fill" style={{ width: '3%' }} />
            </div>
          </div>
        )}

        {/* ── Bottom input area ── */}
        {!inputImgPreview && (
          <div className="atelier-chat-bottom">

            {/* Action bar: only render when there is content to show */}
            {hasGeneratedModel && (
              <div className="atelier-chat-action-bar">
                <span className="atelier-model-limit-notice">
                  Modelo generado en esta sesión —{' '}
                  <button type="button" className="atelier-reset-link" onClick={handleReset}>
                    Nueva conversación
                  </button>
                </span>
              </div>
            )}

            <div className={`atelier-chat-input-row${isConversationEmpty ? '' : ' atelier-chat-input-row--no-img'}`}>
              {/* Image upload — only on empty conversation */}
              {isConversationEmpty && (
                <button
                  type="button"
                  className="atelier-img-upload-btn"
                  onClick={() => imgInputRef.current?.click()}
                  aria-label="Subir imagen de referencia (solo al inicio)"
                  title="Sube una imagen para generar directamente en 3D"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </button>
              )}

              <textarea
                ref={inputRef}
                className="atelier-chat-input"
                placeholder={
                  hasGeneratedModel
                    ? 'Inicia una nueva conversación para continuar…'
                    : isConversationEmpty
                    ? 'Escribe tu idea o sube una imagen… (Enter para enviar)'
                    : 'Escribe tu mensaje… (Enter para enviar)'
                }
                rows={2}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isChatPending || !!activeGen || isGenerating || hasGeneratedModel}
              />

              <button
                className="atelier-chat-send"
                onClick={handleSend}
                disabled={isChatPending || !!activeGen || isGenerating || hasGeneratedModel || !input.trim()}
                aria-label="Enviar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImgChange}
        />
      </div>

      {/* ── 3D popup modal ── */}
      {popupGlbUrl && (
        <ModelViewerPopup
          glbUrl={popupGlbUrl}
          thumbnailUrl={popupThumbUrl}
          onClose={() => setPopupGlbUrl(null)}
        />
      )}
    </>
  );
};
