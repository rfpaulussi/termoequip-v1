
export interface EquipmentUnit {
  id: string
  equipment_type_id: string
  numero_serie: string
  numero_patrimonio: string
  ativo: boolean
  created_at: string
  updated_at: string
  equipment_types?: {
    tipo: string
    marca: string
    modelo: string
  }
}
