'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getEquipmentUnits() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipment_units')
    .select(`
      *,
      equipment_types (
        tipo,
        marca,
        modelo
      )
    `)
    .eq('ativo', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getUnitByPatrimonio(numero_patrimonio: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipment_units')
    .select(`
      *,
      equipment_types (
        tipo,
        marca,
        modelo
      )
    `)
    .eq('numero_patrimonio', numero_patrimonio.trim())
    .eq('ativo', true)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export async function addEquipmentUnit(formData: {
  equipment_type_id: string
  numero_serie: string
  numero_patrimonio: string
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('equipment_units')
    .insert(formData)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/cadastros')
}

export async function importEquipmentUnits(rows: {
  tipo: string
  marca: string
  modelo: string
  numero_serie: string
  numero_patrimonio: string
}[]) {
  const supabase = await createClient()

  for (const row of rows) {
    const { data: tipo } = await supabase
      .from('equipment_types')
      .select('id')
      .eq('tipo', row.tipo.trim())
      .eq('marca', row.marca.trim())
      .eq('modelo', row.modelo.trim())
      .maybeSingle()

    let typeId: string

    if (!tipo) {
      const { data: novoTipo, error: createError } = await supabase
        .from('equipment_types')
        .insert({
          tipo: row.tipo.trim(),
          marca: row.marca.trim(),
          modelo: row.modelo.trim()
        })
        .select('id')
        .single()

      if (createError) throw new Error(`Erro ao criar tipo: ${createError.message}`)
      typeId = novoTipo.id
    } else {
      typeId = tipo.id
    }

    await supabase
      .from('equipment_units')
      .upsert({
        equipment_type_id: typeId,
        numero_serie: row.numero_serie.trim(),
        numero_patrimonio: row.numero_patrimonio.trim()
      }, { onConflict: 'numero_serie' })
  }

  revalidatePath('/admin/cadastros')
}

export async function deactivateEquipmentUnit(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('equipment_units')
    .update({ ativo: false })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/cadastros')
}

export async function updatePatrimonio(id: string, novo_patrimonio: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('equipment_units')
    .update({ numero_patrimonio: novo_patrimonio.trim() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/cadastros')
}
