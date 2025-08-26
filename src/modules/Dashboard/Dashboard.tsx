import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { 
  fetchDocumentsAsync, 
  uploadDocumentAsync,
  deleteDocumentAsync,
  downloadDocumentAsync,
  setSelectedDocument 
} from '@store/slices/documentsSlice'
import { 
  analyzeDocumentAsync,
  fetchDocumentAnalysisAsync 
} from '@store/slices/analysisSlice'
import { 
  showSuccessNotification, 
  showErrorNotification 
} from '@store/slices/notificationSlice'
import { DocumentType, DocumentStatus } from '@api/documents.api'
import { AIProvider } from '@api/analysis.api'
import './Dashboard.scss'

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const { documents, isLoading, isUploading, total } = useAppSelector(state => state.documents)
  const { documentAnalyses, isAnalyzing } = useAppSelector(state => state.analysis)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  useEffect(() => {
    // Load documents on component mount
    dispatch(fetchDocumentsAsync({ page: 1, per_page: 20 }))
  }, [dispatch])

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Validate file types
    const validTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain']
    
    const validFiles = files.filter(file => 
      validTypes.includes(file.type) || file.name.endsWith('.pdf') || 
      file.name.endsWith('.doc') || file.name.endsWith('.docx') || 
      file.name.endsWith('.txt')
    )

    if (validFiles.length === 0) {
      dispatch(showErrorNotification(
        'Неверный формат файла',
        'Пожалуйста, загрузите документы в формате PDF, DOC, DOCX или TXT'
      ))
      return
    }

    // Upload files
    for (const file of validFiles) {
      try {
        await dispatch(uploadDocumentAsync({
          file,
          document_type: DocumentType.OTHER,
          language: 'de'
        })).unwrap()
        
        dispatch(showSuccessNotification(
          'Документ загружен',
          `${file.name} успешно загружен`
        ))
      } catch (error: any) {
        dispatch(showErrorNotification(
          'Ошибка загрузки',
          `${file.name}: ${error.message}`
        ))
      }
    }

    // Reload documents
    dispatch(fetchDocumentsAsync({ page: 1, per_page: 20 }))
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    setSelectedFiles(fileArray)

    // Upload files
    for (const file of fileArray) {
      try {
        await dispatch(uploadDocumentAsync({
          file,
          document_type: DocumentType.OTHER,
          language: 'de'
        })).unwrap()
        
        dispatch(showSuccessNotification(
          'Документ загружен',
          `${file.name} успешно загружен`
        ))
      } catch (error: any) {
        dispatch(showErrorNotification(
          'Ошибка загрузки',
          `${file.name}: ${error.message}`
        ))
      }
    }

    // Clear input and reload documents
    e.target.value = ''
    setSelectedFiles([])
    dispatch(fetchDocumentsAsync({ page: 1, per_page: 20 }))
  }

  const handleAnalyze = async (documentId: string) => {
    try {
      await dispatch(analyzeDocumentAsync({
        document_id: documentId,
        ai_provider: AIProvider.OPENAI,
        analyze_risks: true,
        analyze_positive: true,
        generate_report: true
      })).unwrap()
      
      dispatch(showSuccessNotification(
        'Анализ начат',
        'Документ отправлен на анализ'
      ))
    } catch (error: any) {
      dispatch(showErrorNotification(
        'Ошибка анализа',
        error.message
      ))
    }
  }

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      await dispatch(downloadDocumentAsync({ documentId, filename })).unwrap()
      
      dispatch(showSuccessNotification(
        'Документ загружен',
        'Файл успешно скачан'
      ))
    } catch (error: any) {
      dispatch(showErrorNotification(
        'Ошибка загрузки',
        error.message
      ))
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот документ?')) return
    
    try {
      await dispatch(deleteDocumentAsync(documentId)).unwrap()
      
      dispatch(showSuccessNotification(
        'Документ удален',
        'Файл успешно удален из системы'
      ))
    } catch (error: any) {
      dispatch(showErrorNotification(
        'Ошибка удаления',
        error.message
      ))
    }
  }

  const getStatusClass = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.PROCESSING:
        return 'status--processing'
      case DocumentStatus.COMPLETED:
        return 'status--completed'
      case DocumentStatus.FAILED:
        return 'status--error'
      default:
        return 'status--pending'
    }
  }

  const getStatusText = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.PENDING:
        return 'Ожидание'
      case DocumentStatus.PROCESSING:
        return 'Обработка'
      case DocumentStatus.COMPLETED:
        return 'Готово'
      case DocumentStatus.FAILED:
        return 'Ошибка'
      default:
        return status
    }
  }

  // Calculate statistics
  const stats = {
    totalDocuments: total,
    processedToday: documents.filter(d => 
      new Date(d.upload_date).toDateString() === new Date().toDateString()
    ).length,
    inProgress: documents.filter(d => d.status === DocumentStatus.PROCESSING).length,
    completed: documents.filter(d => d.status === DocumentStatus.COMPLETED).length
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Мои документы</h1>
        <div className="dashboard__stats">
          <div className="stat-card">
            <div className="stat-card__value">{stats.totalDocuments}</div>
            <div className="stat-card__label">Всего документов</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{stats.processedToday}</div>
            <div className="stat-card__label">Загружено сегодня</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{stats.inProgress}</div>
            <div className="stat-card__label">В обработке</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{stats.completed}</div>
            <div className="stat-card__label">Завершено</div>
          </div>
        </div>
      </div>

      <div className="dashboard__upload">
        <h2 className="dashboard__section-title">Загрузка документов</h2>
        <div className="upload-zone-wrapper">
          <div 
            className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="upload-zone__icon">📤</div>
            <h3 className="upload-zone__title">
              Перетащите документы сюда
            </h3>
            <p className="upload-zone__subtitle">
              или нажмите кнопку ниже для выбора файлов
            </p>
            <input
              type="file"
              id="file-input"
              className="upload-zone__input"
              onChange={handleFileInput}
              accept=".pdf,.doc,.docx,.txt"
              multiple
            />
            <label htmlFor="file-input" className="upload-zone__button">
              {isUploading ? 'Загрузка...' : 'Выбрать файлы'}
            </label>
          </div>
        </div>
      </div>

      <div className="dashboard__documents">
        <h2 className="dashboard__section-title">Загруженные документы</h2>
        <div className="documents-table">
          {isLoading ? (
            <div className="documents-table__loading">
              Загрузка документов...
            </div>
          ) : documents.length === 0 ? (
            <div className="documents-table__empty">
              <p>У вас пока нет загруженных документов.</p>
              <p>Перетащите файлы в зону загрузки выше или нажмите "Выбрать файлы"</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Дата загрузки</th>
                  <th>Статус</th>
                  <th>Страниц</th>
                  <th>Размер</th>
                  <th>Анализ</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const analysis = documentAnalyses[doc.id]
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div className="document-name">
                          <span className="document-icon">📄</span>
                          {doc.original_filename}
                        </div>
                      </td>
                      <td>{formatDate(doc.upload_date)}</td>
                      <td>
                        <span className={`status ${getStatusClass(doc.status)}`}>
                          {getStatusText(doc.status)}
                        </span>
                      </td>
                      <td>{doc.page_count || '-'}</td>
                      <td>{formatFileSize(doc.file_size_bytes)}</td>
                      <td>
                        {analysis ? (
                          <span className={`status ${getStatusClass(analysis.status as DocumentStatus)}`}>
                            {getStatusText(analysis.status as DocumentStatus)}
                          </span>
                        ) : (
                          <span className="status">-</span>
                        )}
                      </td>
                      <td>
                        <div className="actions">
                          <button 
                            className="btn-action" 
                            title="Скачать"
                            onClick={() => handleDownload(doc.id, doc.original_filename)}
                          >
                            ⬇
                          </button>
                          <button 
                            className="btn-action" 
                            title="Анализировать"
                            onClick={() => handleAnalyze(doc.id)}
                            disabled={isAnalyzing || doc.status !== DocumentStatus.COMPLETED}
                          >
                            🔍
                          </button>
                          <button 
                            className="btn-action btn-action--danger" 
                            title="Удалить"
                            onClick={() => handleDelete(doc.id)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}