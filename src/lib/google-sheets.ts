import axios from 'axios'

const GOOGLE_SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets'
const GOOGLE_DRIVE_BASE_URL = 'https://www.googleapis.com/drive/v3/files'

export interface SheetRow {
  rowIndex: number
  values: Record<string, any>
}

export const listSpreadsheets = async (accessToken: string): Promise<{ id: string, name: string }[]> => {
  const response = await axios.get(`${GOOGLE_DRIVE_BASE_URL}?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id, name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  return response.data.files || []
}

export const getSheetNames = async (spreadsheetId: string, accessToken: string): Promise<string[]> => {
  if (!spreadsheetId) return []
  const response = await axios.get(`${GOOGLE_SHEETS_BASE_URL}/${spreadsheetId}?fields=sheets(properties(title))`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  return response.data.sheets?.map((s: any) => s.properties.title) || []
}

export const fetchSheetData = async (spreadsheetId: string, sheetName: string, accessToken: string): Promise<{ headers: string[], rows: SheetRow[] }> => {
  if (!spreadsheetId || !accessToken) return { headers: [], rows: [] }

  const response = await axios.get(`${GOOGLE_SHEETS_BASE_URL}/${spreadsheetId}/values/'${sheetName}'!A1:Z1000`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })

  const values = response.data.values || []
  if (values.length === 0) return { headers: [], rows: [] }

  const headers = values[0]
  const rows = values.slice(1).map((row: any[], index: number) => {
    const rowData: Record<string, any> = {}
    headers.forEach((header: string, i: number) => {
      rowData[header] = row[i] || ''
    })
    return {
      rowIndex: index + 2, // 1-indexed, and skipping header
      values: rowData
    }
  })

  return { headers, rows }
}

export const addSheetRow = async (spreadsheetId: string, sheetName: string, headers: string[], rowValues: Record<string, any>, accessToken: string) => {
  const rowArray = headers.map(header => rowValues[header] || '')

  await axios.post(`${GOOGLE_SHEETS_BASE_URL}/${spreadsheetId}/values/'${sheetName}'!A1:append?valueInputOption=USER_ENTERED`,
    { values: [rowArray] },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
}

export const updateSheetRow = async (spreadsheetId: string, sheetName: string, headers: string[], rowIndex: number, rowValues: Record<string, any>, accessToken: string) => {
  const rowArray = headers.map(header => rowValues[header] || '')

  await axios.put(`${GOOGLE_SHEETS_BASE_URL}/${spreadsheetId}/values/'${sheetName}'!A${rowIndex}:Z${rowIndex}?valueInputOption=USER_ENTERED`,
    { values: [rowArray] },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
}

export const updateHeaders = async (spreadsheetId: string, sheetName: string, headers: string[], accessToken: string) => {
  await axios.put(`${GOOGLE_SHEETS_BASE_URL}/${spreadsheetId}/values/'${sheetName}'!A1:Z1?valueInputOption=USER_ENTERED`,
    { values: [headers] },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
}
