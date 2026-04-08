import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SheetSettings {
  spreadsheetId: string
  sheetName: string
  titleColumn: string
  descriptionColumn: string
  buyColumn: string
  repairColumn: string
  sellColumn: string
  transportColumn: string
  totalCostColumn: string
  profitColumn: string
}

interface User {
  name: string
  email: string
  picture: string
}

interface SheetState {
  user: User | null
  accessToken: string | null
  settings: SheetSettings
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  updateSettings: (settings: Partial<SheetSettings>) => void
  logout: () => void
}

export const useSheetStore = create<SheetState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      settings: {
        spreadsheetId: '',
        sheetName: 'Sheet1',
        titleColumn: 'Item Name',
        descriptionColumn: 'Notes',
        buyColumn: 'Buy Price',
        repairColumn: 'Repair Cost',
        sellColumn: 'Sell Price',
        transportColumn: 'Transport',
        totalCostColumn: 'Total Cost',
        profitColumn: 'Profit',
      },
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      updateSettings: (newSettings) => 
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'sheetflow-storage',
    }
  )
)
