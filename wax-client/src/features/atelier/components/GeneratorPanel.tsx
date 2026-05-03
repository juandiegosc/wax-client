import { useRef, useState } from 'react';
import { useGenerateFromText, useGenerateFromImage } from '@/features/atelier/hooks/useGenerate';
import { useTaskStatus } from '@/features/atelier/hooks/useTaskStatus';
import { ART_STYLES } from '@/features/atelier/types/atelier.types';
import type { ArtStyle } from '@/features/atelier/types/atelier.types';

type Mode = 'text' | 'image';

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const GeneratorPanel = () => {
  const [mode, setMode] = useState<Mode>('text');
  const [prompt, setPrompt] = useState('');
  const [artStyle, setArtStyle] = useState<ArtStyle>('realistic');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<'text' | 'image'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: generateText, isPending: isGeneratingText } = useGenerateFromText();
  const { mutate: generateImage, isPending: isGeneratingImage } = useGenerateFromImage();
  const isGenerating = isGeneratingText || isGeneratingImage;

  const { data: taskStatus } = useTaskStatus(taskId, taskType);
  const taskDone = taskStatus?.status === 'SUCCEEDED' || taskStatus?.status === 'FAILED';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const dataUrl = await fileToDataUrl(file);
    setImagePreview(dataUrl);
  };

  const handleGenerate = async () => {
    setTaskId(null);
    if (mode === 'text') {
      if (!prompt.trim()) return;
      generateText(
        { prompt: prompt.trim(), artStyle },
        { onSuccess: (data) => { setTaskId(data.taskId); setTaskType('text'); } },
      );
    } else {
      if (!imageFile) return;
      const dataUrl = await fileToDataUrl(imageFile);
      generateImage(
        { imageDataUrl: dataUrl },
        { onSuccess: (data) => { setTaskId(data.taskId); setTaskType('image'); } },
      );
    }
  };

  const handleReset = () => {
    setTaskId(null);
    setPrompt('');
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="atelier-generator">
      <div className="atelier-mode-tabs">
        <button
          className={`atelier-mode-tab${mode === 'text' ? ' atelier-mode-tab--active' : ''}`}
          onClick={() => { setMode('text'); handleReset(); }}
        >
          Desde texto
        </button>
        <button
          className={`atelier-mode-tab${mode === 'image' ? ' atelier-mode-tab--active' : ''}`}
          onClick={() => { setMode('image'); handleReset(); }}
        >
          Desde imagen
        </button>
      </div>

      {mode === 'text' ? (
        <div className="atelier-gen-form">
          <textarea
            className="atelier-gen-textarea"
            placeholder="Describe el accesorio 3D que quieres generar..."
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
          <div className="atelier-gen-row">
            <select
              className="atelier-gen-select"
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
              disabled={isGenerating}
            >
              {ART_STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              className="atelier-gen-btn"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? 'Generando...' : 'Generar 3D'}
            </button>
          </div>
        </div>
      ) : (
        <div className="atelier-gen-form">
          <div
            className="atelier-image-drop"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Referencia" className="atelier-image-preview" />
            ) : (
              <span className="atelier-image-drop-label">Haz clic para seleccionar una imagen de referencia</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            className="atelier-gen-btn"
            onClick={handleGenerate}
            disabled={isGenerating || !imageFile}
          >
            {isGenerating ? 'Generando...' : 'Generar 3D desde imagen'}
          </button>
        </div>
      )}

      {taskId && taskStatus && (
        <div className="atelier-task-result">
          {!taskDone ? (
            <div className="atelier-task-progress">
              <span className="atelier-task-label">Generando modelo — {taskStatus.progress ?? 0}%</span>
              <div className="atelier-progress-bar">
                <div
                  className="atelier-progress-fill"
                  style={{ width: `${taskStatus.progress ?? 0}%` }}
                />
              </div>
            </div>
          ) : taskStatus.status === 'FAILED' ? (
            <p className="atelier-task-error">
              Error al generar el modelo. {taskStatus.error ?? 'Intenta de nuevo.'}
            </p>
          ) : (
            <div className="atelier-task-success">
              {taskStatus.thumbnail_url && (
                <img
                  src={taskStatus.thumbnail_url}
                  alt="Modelo generado"
                  className="atelier-task-thumbnail"
                />
              )}
              <div className="atelier-task-links">
                <span className="atelier-task-label">Modelo listo</span>
                {taskStatus.model_urls && Object.entries(taskStatus.model_urls).map(([format, url]) => (
                  <a
                    key={format}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="atelier-task-download"
                  >
                    Descargar {format.toUpperCase()}
                  </a>
                ))}
              </div>
              <button className="atelier-gen-btn atelier-gen-btn--secondary" onClick={handleReset}>
                Nuevo modelo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
