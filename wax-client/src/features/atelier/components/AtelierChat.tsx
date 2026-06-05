import '@google/model-viewer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { atelierApi, type DesignFields } from '@/features/atelier/api/atelierApi';
import { useChat } from '@/features/atelier/hooks/useChat';
import { useGenerateFromText, useGenerateFromImage, useRefineFromPreview } from '@/features/atelier/hooks/useGenerate';
import { useTaskStatus } from '@/features/atelier/hooks/useTaskStatus';
import { isAffirmative, extractAtelierMarker, stripHiddenMarkers, getProgressMessage, meshyUrl } from '@/features/atelier/utils/atelierHelpers';
import type { ArtStyle, TaskStatus } from '@/features/atelier/types/atelier.types';
import { CotizarFormModal, type CotizarFormValues } from '@/features/atelier/components/CotizarFormModal';

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
  refineTaskId?: string;
};

type GenMsg = {
  id: string;
  kind: 'gen';
  taskId: string;
  taskType: 'text' | 'refine' | 'image';
  result?: GenResult;
};

type SketchMsg = {
  id: string;
  kind: 'sketch';
  status: 'loading' | 'done' | 'failed';
  imageUrl?: string;
  attemptNumber: number;
};

// 1 boceto inicial + 2 refinamientos = 3 sketches en total por conversación.
const SKETCH_MAX_ATTEMPTS = 3;
// Después de N mensajes del cliente sin generar el 3D, mostramos un banner
// para evitar abuso / costos descontrolados de OpenAI.
const CLIENT_MESSAGE_SOFT_LIMIT = 30;

type AnyMsg = ChatMsg | GenMsg | SketchMsg;

type ActiveGen = { msgId: string; taskId: string; taskType: 'text' | 'refine' | 'image' };

// ── Persistencia de la conversación (localStorage) ──────────────────────────────
// Conserva el chat y la generación en curso al navegar, dar atrás o recargar.
// Se limpia solo cuando el usuario hace "Empezar de nuevo".
const ATELIER_STORAGE_KEY = 'wax-atelier-session';

type PersistedAtelier = {
  sessionId: string;
  messages: AnyMsg[];
  lastGenPrompt: string;
  lastGenDescription: string;
  lastSketchUrl: string;
  sketchAttempts: number;
  clientMessageCount: number;
  limitBannerDismissed: boolean;
  artStyle: ArtStyle;
  activeGen: ActiveGen | null;
  hasGeneratedModel: boolean;
  generatedFromImageDataUrl: string | null;
};

const loadPersistedAtelier = (): Partial<PersistedAtelier> => {
  try {
    const raw = localStorage.getItem(ATELIER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedAtelier>) : {};
  } catch {
    return {};
  }
};

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
            ar="true"
            ar-modes="scene-viewer webxr quick-look"
            ar-scale="auto"
            ar-placement="floor"
            style={{ width: '100%', height: '100%', background: '#1c1c1e' }}
          />
        </div>

        <div className="atelier-popup-footer">
          <p className="atelier-popup-hint">Arrastra para rotar · Pellizca para hacer zoom · En móvil toca el ícono AR para verlo en tu espacio</p>
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
            ar="true"
            ar-modes="scene-viewer webxr quick-look"
            ar-scale="auto"
            ar-placement="floor"
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
          <button className="atelier-gen-cta" onClick={() => onCotizar(glbUrl ?? '', msg.result?.refineTaskId ?? msg.taskId)}>
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
          <button className="atelier-gen-cta" onClick={() => onCotizar(glbUrl ?? '', msg.result?.refineTaskId ?? msg.taskId)}>
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
  const persisted = useRef(loadPersistedAtelier()).current;

  const [sessionId, setSessionId]           = useState(() => persisted.sessionId ?? crypto.randomUUID());
  const [messages, setMessages]             = useState<AnyMsg[]>(() => persisted.messages ?? []);
  const [input, setInput]                   = useState('');
  const [lastGenPrompt, setLastGenPrompt]   = useState(() => persisted.lastGenPrompt ?? '');
  const [lastGenDescription, setLastGenDescription] = useState(() => persisted.lastGenDescription ?? '');
  const [lastSketchUrl, setLastSketchUrl]   = useState(() => persisted.lastSketchUrl ?? '');
  const [sketchAttempts, setSketchAttempts] = useState<number>(() => persisted.sketchAttempts ?? 0);
  const [isSketchLoading, setIsSketchLoading] = useState(false);
  const [clientMessageCount, setClientMessageCount] = useState<number>(() => persisted.clientMessageCount ?? 0);
  const [limitBannerDismissed, setLimitBannerDismissed] = useState<boolean>(() => persisted.limitBannerDismissed ?? false);
  const [artStyle, setArtStyle]             = useState<ArtStyle>(() => persisted.artStyle ?? 'realistic');
  const [inputImg, setInputImg]             = useState<File | null>(null);
  const [inputImgPreview, setInputImgPreview] = useState<string | null>(null);
  const [activeGen, setActiveGen]           = useState<ActiveGen | null>(() => persisted.activeGen ?? null);
  const refineStarted = useRef<Set<string>>(new Set());
  // One model per conversation
  const [hasGeneratedModel, setHasGeneratedModel] = useState(() => persisted.hasGeneratedModel ?? false);
  // Popup
  const [popupGlbUrl, setPopupGlbUrl]       = useState<string | null>(null);
  const [popupThumbUrl, setPopupThumbUrl]   = useState<string | undefined>(undefined);
  // Image flow: remember the original uploaded data URL to feed vision analysis later
  const [generatedFromImageDataUrl, setGeneratedFromImageDataUrl] = useState<string | null>(() => persisted.generatedFromImageDataUrl ?? null);
  // Cotizar modal (image flow only)
  const [cotizarModal, setCotizarModal] = useState<{ glbUrl: string; taskId: string } | null>(null);
  const [cotizarSuggestions, setCotizarSuggestions] = useState<DesignFields | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSubmittingCotizacion, setIsSubmittingCotizacion] = useState(false);
  // Aviso de retomar: solo si al montar había una conversación guardada
  const [showResumePrompt, setShowResumePrompt] = useState(() => (persisted.messages?.length ?? 0) > 0);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  // En dispositivos tactiles (movil/tablet) mostramos un boton extra para tomar
  // foto con la camara. Detectamos via pointer: coarse para evitar mostrarlo en
  // desktop con mouse donde no tiene sentido.
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: coarse)');
    setIsTouchDevice(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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

  // Persistir la conversación para no perderla al navegar / recargar
  useEffect(() => {
    const data: PersistedAtelier = {
      sessionId,
      messages,
      lastGenPrompt,
      lastGenDescription,
      lastSketchUrl,
      sketchAttempts,
      clientMessageCount,
      limitBannerDismissed,
      artStyle,
      activeGen,
      hasGeneratedModel,
      generatedFromImageDataUrl,
    };
    try {
      localStorage.setItem(ATELIER_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Cuota de storage excedida (ej. imagen muy grande) — se ignora
    }
  }, [sessionId, messages, lastGenPrompt, lastGenDescription, lastSketchUrl, sketchAttempts, clientMessageCount, limitBannerDismissed, artStyle, activeGen, hasGeneratedModel, generatedFromImageDataUrl]);

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
        ? {
            status: 'done',
            thumbnailUrl: taskStatus.thumbnail_url,
            modelUrls: taskStatus.model_urls,
            refineTaskId: activeGen.taskType === 'refine' ? activeGen.taskId : undefined,
          }
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
    setLastGenDescription('');
    setLastSketchUrl('');
    setSketchAttempts(0);
    setClientMessageCount(0);
    setLimitBannerDismissed(false);
    setInputImg(null);
    setInputImgPreview(null);
    setActiveGen(null);
    setHasGeneratedModel(false);
    setGeneratedFromImageDataUrl(null);
    setCotizarModal(null);
    setCotizarSuggestions(null);
    setIsLoadingSuggestions(false);
    setIsSubmittingCotizacion(false);
    setShowResumePrompt(false);
    refineStarted.current.clear();
    if (imgInputRef.current) imgInputRef.current.value = '';
    try {
      localStorage.removeItem(ATELIER_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleCotizar = (glbUrl: string, taskId: string) => {
    // Image flow: no conversation to parse → open form modal pre-filled with vision suggestions
    if (generatedFromImageDataUrl) {
      setCotizarModal({ glbUrl, taskId });
      setCotizarSuggestions(null);
      setIsLoadingSuggestions(true);
      atelierApi.analyzeImage(generatedFromImageDataUrl)
        .then((design) => { setCotizarSuggestions(design); })
        .catch(() => {
          setCotizarSuggestions({ type: '', material: '', color: '', shape: '', dimensions: '', details: '' });
        })
        .finally(() => setIsLoadingSuggestions(false));
      return;
    }

    // Text flow: la IA ya generó una ficha de producto limpia en el marcador <!--PROMPT:...|...|descripción-->
    // Si por alguna razón no llegó (formato viejo o error), caemos al chat completo como respaldo.
    const description = lastGenDescription
      || messages
        .filter(m => m.kind === 'chat')
        .map(m => m.kind === 'chat' ? `${m.role === 'user' ? 'Usuario' : 'WAX Studio'}: ${m.content}` : '')
        .join('\n\n');

    atelierApi.submitCotizacion({ glbUrl, taskId, description }).catch(() => {});
    toast.success('¡Listo! Tu solicitud fue enviada a WAX. Revisa el estado en Mis cotizaciones.');
    handleReset();
  };

  const handleCotizarFormSubmit = (values: CotizarFormValues) => {
    if (!cotizarModal) return;
    setIsSubmittingCotizacion(true);
    const rawDescription = `Imagen analizada por IA. ${values.type} de ${values.material} ${values.color}, forma ${values.shape}, dimensiones ${values.dimensions}.${values.details ? ` Detalles: ${values.details}` : ''}`;
    atelierApi.submitCotizacionDirect({
      taskId: cotizarModal.taskId,
      glbUrl: cotizarModal.glbUrl,
      rawDescription,
      design: {
        type: values.type,
        material: values.material,
        color: values.color,
        shape: values.shape,
        dimensions: values.dimensions,
        details: values.details ?? '',
      },
    })
      .then(() => {
        toast.success('¡Listo! Tu solicitud fue enviada a WAX. Revisa el estado en Mis cotizaciones.');
        handleReset();
      })
      .catch(() => {
        toast.error('No se pudo enviar la cotización. Intenta de nuevo.');
        setIsSubmittingCotizacion(false);
      });
  };

  const handleExpand = useCallback((glbUrl: string, thumbUrl?: string) => {
    setPopupGlbUrl(glbUrl);
    setPopupThumbUrl(thumbUrl);
  }, []);

  // ── Sketch (boceto 2D) ────────────────────────────────────────────────────
  // Lanza una generación de boceto y actualiza el mensaje (loading → done/failed).
  // Cada SKETCH marker emitido por el AI dispara una llamada aquí. El AI es quien
  // valida que el cliente confirmó cada refinamiento ("¿estás seguro?") antes de
  // emitir el marcador, asi que aqui solo defendemos el limite duro.
  // NO limpia lastSketchUrl: lo conserva como respaldo si el cliente confirma 3D
  // mientras un refinamiento esta en vuelo.
  const launchSketch = (prompt: string) => {
    const nextAttempt = sketchAttempts + 1;
    if (nextAttempt > SKETCH_MAX_ATTEMPTS) {
      // Defensa: el AI no debería haber emitido este SKETCH. Ignoramos en silencio.
      return;
    }
    setSketchAttempts(nextAttempt);
    setIsSketchLoading(true);
    const sketchId = crypto.randomUUID();
    addMsg({ id: sketchId, kind: 'sketch', status: 'loading', attemptNumber: nextAttempt });
    atelierApi.generateSketch(prompt)
      .then((imageUrl) => {
        setLastSketchUrl(imageUrl);
        setMessages((prev) => prev.map((m) =>
          m.id === sketchId && m.kind === 'sketch'
            ? { ...m, status: 'done', imageUrl }
            : m,
        ));
      })
      .catch(() => {
        setMessages((prev) => prev.map((m) =>
          m.id === sketchId && m.kind === 'sketch'
            ? { ...m, status: 'failed' }
            : m,
        ));
      })
      .finally(() => setIsSketchLoading(false));
  };

  // Dispara la generación 3D. Reusada por (1) el "sí" en el chat y (2) el
  // botón "Sí, crear el 3D" del aviso de límite.
  const triggerGeneration = () => {
    if (!lastGenPrompt || hasGeneratedModel) return;
    const msgId = crypto.randomUUID();
    setHasGeneratedModel(true);
    const onSuccessGen = (taskId: string, taskType: 'text' | 'image') => {
      addMsg({ id: msgId, kind: 'gen', taskId, taskType });
      setActiveGen({ msgId, taskId, taskType });
    };
    const onErrorGen = () => {
      setHasGeneratedModel(false);
      addMsg({
        id: msgId,
        kind: 'chat',
        role: 'assistant',
        content: 'No se pudo iniciar la generación. Intenta de nuevo.',
      });
    };

    // Si tenemos un boceto valido, lo usamos como input para image-to-3d (mas
    // fiel visualmente que text-to-3d). Si fallo, caemos a text-to-3d.
    if (lastSketchUrl) {
      generateImage(
        { imageDataUrl: lastSketchUrl },
        { onSuccess: (d) => onSuccessGen(d.taskId, 'image'), onError: onErrorGen },
      );
    } else {
      generateText(
        { prompt: lastGenPrompt, artStyle },
        { onSuccess: (d) => onSuccessGen(d.taskId, 'text'), onError: onErrorGen },
      );
    }
  };

  // Click del boton "Si, crear el 3D" cuando el cliente llego al limite de
  // bocetos. Simulamos el "si" en el chat para que la conversacion quede
  // coherente y disparamos la generacion.
  const handleConfirmFromLimit = () => {
    if (!lastGenPrompt || hasGeneratedModel) return;
    addMsg({ id: crypto.randomUUID(), kind: 'chat', role: 'user', content: 'sí' });
    triggerGeneration();
  };

  // ── Send chat message ─────────────────────────────────────────────────────
  const handleSend = () => {
    const text = input.trim();
    if (!text || isChatPending || isGenerating) return;

    addMsg({ id: crypto.randomUUID(), kind: 'chat', role: 'user', content: text });
    setInput('');
    setClientMessageCount((n) => n + 1);

    // Atajo SOLO despues de agotar los 3 sketches: si el AI no logra emitir
    // CONFIRM y el cliente dice "si", disparamos el 3D directamente.
    // Antes del limite, "si" es puro texto que va al AI (puede estar confirmando
    // un refinamiento, "Vas a anadir X. Lo confirmas?" -> "si").
    if (
      sketchAttempts >= SKETCH_MAX_ATTEMPTS
      && lastSketchUrl
      && isAffirmative(text)
      && !hasGeneratedModel
    ) {
      triggerGeneration();
      return;
    }

    sendMessage(
      { message: text, sessionId },
      {
        onSuccess: data => {
          const marker = extractAtelierMarker(data.output);
          const displayText = stripHiddenMarkers(data.output);
          addMsg({ id: crypto.randomUUID(), kind: 'chat', role: 'assistant', content: displayText });

          // El AI conduce el flujo. Reaccionamos al tipo de marcador emitido:
          //  - SKETCH → genera boceto (inicial o refinamiento; contador en launchSketch)
          //  - CONFIRM → dispara generación 3D (image-to-3d con el último boceto)
          //  - sin marcador → solo conversa, mantenemos estado intacto
          if (marker?.kind === 'sketch') {
            setLastGenPrompt(marker.prompt);
            setLastGenDescription(marker.description ?? '');
            if (marker.artStyle) setArtStyle(marker.artStyle);
            launchSketch(marker.prompt);
          } else if (marker?.kind === 'confirm') {
            triggerGeneration();
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
    // Keep the data URL so we can feed it to vision analysis when the user clicks "Enviar a cotizar"
    setGeneratedFromImageDataUrl(dataUrl);
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
        onError: () => {
          setHasGeneratedModel(false);
          setGeneratedFromImageDataUrl(null);
        },
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
      {showResumePrompt && (
        <div className="atelier-resume-banner" role="status">
          <span className="atelier-resume-text">Tienes un diseño en progreso.</span>
          <div className="atelier-resume-actions">
            <button
              type="button"
              className="atelier-resume-btn atelier-resume-btn--primary"
              onClick={() => setShowResumePrompt(false)}
            >
              Continuar
            </button>
            <button
              type="button"
              className="atelier-resume-btn atelier-resume-btn--ghost"
              onClick={handleReset}
            >
              Empezar de nuevo
            </button>
          </div>
        </div>
      )}

      <div className="atelier-chat">

        {/* Disclaimer persistente sobre la naturaleza aproximada de los resultados IA */}
        <div
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.75rem',
            color: 'var(--wax-color-graphite, #555)',
            background: 'rgba(15, 15, 16, 0.03)',
            borderBottom: '1px solid rgba(15, 15, 16, 0.06)',
            lineHeight: 1.4,
          }}
        >
          ⓘ Los bocetos y modelos 3D son generados por IA — pueden no ser idénticos al resultado final. Úsalos como referencia visual del concepto.
        </div>

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
                  <strong>Texto</strong> permite personalizar y ajustar el diseño conversando, pero el resultado 3D es aproximado — tiempo estimado 3 a 5 min.{' '}
                  <strong>Imagen</strong> genera un modelo más fiel a la referencia visual, pero no admite correcciones posteriores — tiempo estimado 3 a 8 min.
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
            if (msg.kind === 'sketch') {
              const isLatest = msg.attemptNumber === sketchAttempts;
              const reachedLimit = isLatest && msg.status === 'done' && sketchAttempts >= SKETCH_MAX_ATTEMPTS;
              const label = msg.attemptNumber === 1
                ? 'Boceto · 1/3'
                : `Boceto · refinamiento ${msg.attemptNumber - 1}/2`;
              return (
                <div key={msg.id} className="atelier-msg atelier-msg--assistant">
                  <span className="atelier-msg-role">{label}</span>
                  {msg.status === 'loading' && (
                    <div className="atelier-sketch-loading">
                      <div className="atelier-spinner" aria-hidden="true" />
                      <span>Generando boceto…</span>
                    </div>
                  )}
                  {msg.status === 'done' && msg.imageUrl && (
                    <>
                      <img
                        src={msg.imageUrl}
                        alt="Boceto del diseño"
                        style={{ maxWidth: '100%', borderRadius: '0.5rem', marginTop: '0.5rem' }}
                      />
                      {/* Red de seguridad: si llegamos al limite de 3 sketches,
                          mostramos botones por si el AI no logra cerrar el flujo. */}
                      {reachedLimit && !hasGeneratedModel && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="atelier-gen-cta"
                              onClick={handleConfirmFromLimit}
                              disabled={isChatPending || isGenerating || isSketchLoading}
                            >
                              Sí, crear el 3D
                            </button>
                            <button
                              type="button"
                              className="atelier-reset-link"
                              onClick={handleReset}
                              disabled={isGenerating || isSketchLoading}
                            >
                              Empezar de nuevo
                            </button>
                          </div>
                          <span className="atelier-msg-content" style={{ fontSize: '0.78rem', opacity: 0.65 }}>
                            Llegaste al límite de bocetos. Estos botones son un respaldo — también puedes responderle al chat.
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {msg.status === 'failed' && (
                    <p className="atelier-msg-content">No pude generar el boceto. Puedes continuar con el 3D igual diciendo <strong>sí</strong>.</p>
                  )}
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

            {/* Banner anti-desvio: aparece a los 30 mensajes del cliente sin haber
                generado el 3D. Es soft (dismissible) — el cliente puede continuar
                o reiniciar. Una sola vez por sesion. */}
            {clientMessageCount >= CLIENT_MESSAGE_SOFT_LIMIT
              && !limitBannerDismissed
              && !hasGeneratedModel && (
              <div className="atelier-chat-action-bar" style={{ background: 'rgba(15, 15, 16, 0.04)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                <span className="atelier-model-limit-notice" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Llevas {clientMessageCount} mensajes en esta conversación. ¿Quieres continuar o empezar de nuevo?
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="atelier-reset-link"
                    onClick={() => setLimitBannerDismissed(true)}
                  >
                    Continuar
                  </button>
                  <button
                    type="button"
                    className="atelier-reset-link"
                    onClick={handleReset}
                  >
                    Empezar de nuevo
                  </button>
                </div>
              </div>
            )}

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
              {/* Image upload + camera capture — only on empty conversation */}
              {isConversationEmpty && (
                <>
                  <button
                    type="button"
                    className="atelier-img-upload-btn"
                    onClick={() => imgInputRef.current?.click()}
                    aria-label="Subir imagen de referencia"
                    title="Subir imagen desde tu dispositivo"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </button>
                  {isTouchDevice && (
                    <button
                      type="button"
                      className="atelier-img-upload-btn"
                      onClick={() => cameraInputRef.current?.click()}
                      aria-label="Tomar foto con la cámara"
                      title="Tomar foto con la cámara"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </button>
                  )}
                </>
              )}

              <textarea
                ref={inputRef}
                className="atelier-chat-input"
                placeholder={
                  hasGeneratedModel
                    ? 'Inicia una nueva conversación para continuar…'
                    : isSketchLoading
                    ? 'Generando boceto, espera un momento…'
                    : sketchAttempts >= SKETCH_MAX_ATTEMPTS
                    ? 'Llegaste al límite de bocetos. Elige una opción arriba para continuar.'
                    : isConversationEmpty
                    ? 'Escribe tu idea o sube una imagen… (Enter para enviar)'
                    : 'Escribe tu mensaje… (Enter para enviar)'
                }
                rows={2}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={
                  isChatPending
                  || !!activeGen
                  || isGenerating
                  || hasGeneratedModel
                  || isSketchLoading
                  || sketchAttempts >= SKETCH_MAX_ATTEMPTS
                }
              />

              <button
                className="atelier-chat-send"
                onClick={handleSend}
                disabled={
                  isChatPending
                  || !!activeGen
                  || isGenerating
                  || hasGeneratedModel
                  || isSketchLoading
                  || sketchAttempts >= SKETCH_MAX_ATTEMPTS
                  || !input.trim()
                }
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
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
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

      {/* ── Cotizar form modal (image flow) ── */}
      {cotizarModal && (
        <CotizarFormModal
          initialValues={cotizarSuggestions}
          isLoadingSuggestions={isLoadingSuggestions}
          isSubmitting={isSubmittingCotizacion}
          onConfirm={handleCotizarFormSubmit}
          onClose={() => {
            if (isSubmittingCotizacion) return;
            setCotizarModal(null);
            setCotizarSuggestions(null);
            setIsLoadingSuggestions(false);
          }}
        />
      )}
    </>
  );
};
