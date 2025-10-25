import React, { useState, useRef } from 'react';
import { useMobile } from './MobileOptimized';
import { ExcelMenuParser, ParseResult } from '../utils/ExcelMenuParser';

interface FileUploaderProps {
  onUpload: (result: ParseResult) => void;
  onError: (error: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function FileUploader({ onUpload, onError, loading = false, disabled = false }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMobile();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || loading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || loading) return;
    
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    try {
      // Валидация файла
      const validation = ExcelMenuParser.validateFile(selectedFile);
      if (!validation.valid) {
        onError(validation.error || 'Некорректный файл');
        return;
      }

      setFile(selectedFile);
      setParseResult(null);

      // Парсим файл
      const result = await ExcelMenuParser.parseExcelFile(selectedFile);
      setParseResult(result);

      if (result.success) {
        onUpload(result);
      } else {
        onError(result.errors.join(', ') || 'Ошибка парсинга файла');
      }
    } catch (error: any) {
      console.error('Ошибка обработки файла:', error);
      onError(`Ошибка обработки файла: ${error.message}`);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    ExcelMenuParser.createTemplate();
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Область загрузки файла */}
      <div
        style={{
          border: `2px dashed ${dragActive ? '#007bff' : '#dee2e6'}`,
          borderRadius: '10px',
          padding: isMobile ? '30px 20px' : '40px',
          textAlign: 'center',
          background: dragActive ? '#f8f9ff' : '#fafafa',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          opacity: disabled || loading ? 0.6 : 1
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !loading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.ods"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={disabled || loading}
        />

        {loading ? (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
            <h3 style={{ color: '#007bff', marginBottom: '10px' }}>
              Обрабатываем файл...
            </h3>
            <p style={{ color: '#666' }}>
              Пожалуйста, подождите
            </p>
          </div>
        ) : file ? (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '20px', color: '#28a745' }}>📄</div>
            <h3 style={{ color: '#28a745', marginBottom: '10px' }}>
              Файл выбран
            </h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Удалить файл
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📁</div>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>
              Перетащите файл сюда
            </h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              или нажмите для выбора файла
            </p>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '10px',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Выбрать файл
              </button>
              <span style={{ color: '#666' }}>или</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadTemplate();
                }}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Скачать шаблон
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Результат парсинга */}
      {parseResult && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          background: parseResult.success ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          border: `1px solid ${parseResult.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <h4 style={{
            color: parseResult.success ? '#155724' : '#721c24',
            margin: '0 0 15px 0'
          }}>
            {parseResult.success ? '✅ Файл успешно обработан' : '❌ Ошибки при обработке'}
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div>
              <strong>Всего строк:</strong> {parseResult.stats.totalRows}
            </div>
            <div>
              <strong>Обработано:</strong> {parseResult.stats.validItems}
            </div>
            <div>
              <strong>Пропущено:</strong> {parseResult.stats.skippedRows}
            </div>
            <div>
              <strong>Дубликаты:</strong> {parseResult.stats.duplicateNames.length}
            </div>
          </div>

          {parseResult.warnings.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Предупреждения:</strong>
              <ul style={{ margin: '5px 0 0 20px', fontSize: '14px' }}>
                {parseResult.warnings.slice(0, 5).map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
                {parseResult.warnings.length > 5 && (
                  <li>... и еще {parseResult.warnings.length - 5} предупреждений</li>
                )}
              </ul>
            </div>
          )}

          {parseResult.errors.length > 0 && (
            <div>
              <strong>Ошибки:</strong>
              <ul style={{ margin: '5px 0 0 20px', fontSize: '14px' }}>
                {parseResult.errors.slice(0, 5).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {parseResult.errors.length > 5 && (
                  <li>... и еще {parseResult.errors.length - 5} ошибок</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Подсказки */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#e9ecef',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>💡 Подсказки:</h5>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Поддерживаются файлы Excel (.xlsx, .xls) и OpenDocument (.ods)</li>
          <li>Максимальный размер файла: 10MB</li>
          <li>Обязательные колонки: "Название блюда", "Цена"</li>
          <li>Рекомендуемые колонки: "День недели", "Тип приема пищи", "Вес"</li>
          <li>Скачайте шаблон для правильного формата</li>
        </ul>
      </div>
    </div>
  );
}
