import api from '@/services/api'

export const fetchPdfBlob = async (url: string): Promise<Blob> => {
  const response = await api.get(url, { responseType: 'blob' })
  return new Blob([response.data], { type: 'application/pdf' })
}

export const downloadFile = async (url: string, filename: string) => {
  try {
    const blob = await fetchPdfBlob(url)
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Error downloading file:', error)
    throw new Error('No se pudo descargar el archivo')
  }
}
