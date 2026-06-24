# Melhorias TermoEquip — Funcionários, Manutenção, Devolução e Reserva

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar quatro melhorias no sistema TermoEquip: pré-cadastro de funcionários, data editável na manutenção, UX mais clara na devolução (retorno ao estoque) e suporte a equipamentos de reserva (stand-by) por equipe.

**Architecture:** Cada melhoria é independente e toca camadas distintas: banco (SQL via Supabase), tipos TypeScript, funções de DB em `lib/terms-supabase.ts`, server actions e componentes de página. As mudanças de banco precisam ser aplicadas no Supabase (dashboard ou CLI) antes das mudanças de código.

**Tech Stack:** Next.js 16 App Router, React 19 Server/Client Components, Supabase (PostgreSQL), TypeScript 5, Tailwind CSS 4.

---

## Mapa de arquivos

| Arquivo | O que muda |
|---|---|
| `src/types/database.ts` | Adicionar `employees` table + campos `is_reserva`, `data_manutencao` recebe input |
| `src/types/term.ts` | Adicionar `EmployeeInsert`, atualizar `TermInsert` com `is_reserva` |
| `src/lib/terms-supabase.ts` | `setTermMaintenance` aceita `data_manutencao`; CRUD de employees |
| `src/app/(app)/termos/[id]/actions.ts` | `markMaintenanceAction` passa `data_manutencao` |
| `src/app/(app)/termos/[id]/page.tsx` | Campo de data na manutenção; devolução com label "Devolver ao Estoque"; badge RESERVA |
| `src/app/(app)/termos/novo/termo-form.tsx` | Toggle "Reserva/Stand-by"; autopreenchimento de funcionário |
| `src/app/(app)/termos/novo/actions.ts` | Passar `is_reserva` ao criar termo |
| `src/app/(app)/termos/page.tsx` | Badge RESERVA na lista |
| `src/app/(app)/funcionarios/page.tsx` | **Criar** — página de listagem de funcionários |
| `src/app/(app)/funcionarios/actions.ts` | **Criar** — server actions CRUD de funcionários |
| `src/app/(app)/admin/cadastros/page.tsx` | Nova aba "Funcionários" (alternativa: rota própria) |
| `src/components/sidebar.tsx` | Link para /funcionarios |

---

## Task 1 — Banco de dados: tabela `employees` e campo `is_reserva`

**Files:**
- Modify: Supabase dashboard ou CLI — rodar SQL manualmente
- Modify: `src/types/database.ts`

### Contexto
O banco não tem migrations versionadas — as alterações são feitas diretamente no Supabase (cloud dashboard → SQL Editor, ou `supabase db push` se usando local).

- [ ] **Step 1.1: Rodar o SQL no Supabase**

Abrir Supabase Dashboard → SQL Editor e executar:

```sql
-- Tabela de pré-cadastro de funcionários
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo text NOT NULL,
  re text NOT NULL,
  cpf text NOT NULL,
  funcao text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  centro_custo text REFERENCES contracts(centro_custo),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(re),
  UNIQUE(cpf)
);

-- Campo is_reserva nos termos (stand-by)
ALTER TABLE equipment_terms
  ADD COLUMN IF NOT EXISTS is_reserva boolean NOT NULL DEFAULT false;
```

Verificar: `SELECT column_name FROM information_schema.columns WHERE table_name = 'equipment_terms' AND column_name = 'is_reserva';`
Esperado: retornar 1 linha com `is_reserva`.

- [ ] **Step 1.2: Atualizar `src/types/database.ts`**

Adicionar a tabela `employees` no bloco `Tables`, logo após `equipment_units`. Adicionar `is_reserva` em `equipment_terms`.

Localizar o trecho de `equipment_terms > Row` (linha ~46) e adicionar após `id: string`:

```typescript
      equipment_terms: {
        Row: {
          acessorios: string | null
          centro_custo: string
          contrato: string
          cpf: string | null
          created_at: string
          created_by: string | null
          data_entrega: string
          data_manutencao: string | null
          em_manutencao: boolean
          encarregado: string | null
          estado_entrega: string | null
          funcao: string
          funcionario_nome: string
          id: string
          is_draft: boolean
          is_reserva: boolean          // <-- NOVO
          marca: string | null
          matricula: string
          modelo: string | null
          numero_serie: string | null
          numero_termo: string
          observacao_manutencao: string | null
          observacoes: string | null
          patrimonio: string
          status: Database["public"]["Enums"]["term_status"]
          supervisor: string
          tipo_equipamento: string
          updated_at: string
        }
        Insert: {
          // ... todos os campos existentes ...
          is_reserva?: boolean          // <-- NOVO (opcional, default false)
        }
        Update: {
          // ... todos os campos existentes ...
          is_reserva?: boolean          // <-- NOVO
        }
```

E adicionar a tabela `employees` completa após `equipment_units`:

```typescript
      employees: {
        Row: {
          id: string
          nome_completo: string
          re: string
          cpf: string
          funcao: string
          ativo: boolean
          centro_custo: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome_completo: string
          re: string
          cpf: string
          funcao: string
          ativo?: boolean
          centro_custo?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome_completo?: string
          re?: string
          cpf?: string
          funcao?: string
          ativo?: boolean
          centro_custo?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_centro_custo_fkey"
            columns: ["centro_custo"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["centro_custo"]
          },
        ]
      }
```

- [ ] **Step 1.3: Atualizar `src/types/term.ts`**

Adicionar tipo de insert de funcionário e `is_reserva` no TermInsert:

```typescript
export type ReturnCondition =
  | 'EM_PERFEITO_ESTADO'
  | 'COM_DEFEITO'
  | 'FALTANDO_PECAS'

export type TermStatus =
  | 'ENTREGUE'
  | 'DEVOLVIDO'

export type EmployeeInsert = {
  nome_completo: string
  re: string
  cpf: string
  funcao: string
  ativo?: boolean
  centro_custo?: string | null
}

export type TermInsert = {
  numero_termo: string
  funcionario_nome: string
  matricula: string
  cpf: string
  funcao: string
  centro_custo: string
  contrato: string
  supervisor: string
  tipo_equipamento: string
  patrimonio: string
  data_entrega?: string
  status?: TermStatus
  is_draft?: boolean
  is_reserva?: boolean       // <-- NOVO
  marca?: string | null
  modelo?: string | null
  numero_serie?: string | null
  acessorios?: string | null
  encarregado?: string | null
  estado_entrega?: string | null
  observacoes?: string | null
}

export type TermReturnInsert = {
  term_id: string
  data_devolucao: string
  condicao: ReturnCondition
  responsavel_recebimento: string
  observacoes?: string | null
}
```

- [ ] **Step 1.4: Commit**

```bash
git add src/types/database.ts src/types/term.ts
git commit -m "feat: add employees table types and is_reserva field to equipment_terms"
```

---

## Task 2 — Pré-cadastro de Funcionários (CRUD)

**Files:**
- Create: `src/app/(app)/funcionarios/page.tsx`
- Create: `src/app/(app)/funcionarios/actions.ts`
- Modify: `src/lib/terms-supabase.ts` (adicionar funções de employee)
- Modify: `src/components/sidebar.tsx`

### Contexto
Qualquer usuário autenticado pode criar funcionários. A listagem fica escopada pelo `centro_custo` do usuário (não-admins). O formulário espelha os campos do "Dados do colaborador" no `termo-form.tsx`.

- [ ] **Step 2.1: Adicionar funções de employee em `src/lib/terms-supabase.ts`**

Adicionar ao final do arquivo:

```typescript
export async function listEmployees(centrosCusto?: string[]) {
  const supabase = await createClient()
  let query = supabase
    .from('employees')
    .select('*')
    .order('nome_completo')
  if (centrosCusto && centrosCusto.length > 0) {
    query = query.in('centro_custo', centrosCusto)
  }
  const { data, error } = await query
  if (error) throw new Error(`Erro ao listar funcionários: ${error.message}`)
  return data
}

export async function createEmployee(input: {
  nome_completo: string
  re: string
  cpf: string
  funcao: string
  ativo: boolean
  centro_custo: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('employees')
    .insert({ ...input, created_by: user?.id ?? null })
    .select()
    .single()
  if (error) throw new Error(`Erro ao criar funcionário: ${error.message}`)
  return data
}

export async function updateEmployee(
  id: string,
  input: { nome_completo: string; re: string; cpf: string; funcao: string; ativo: boolean; centro_custo: string | null }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Erro ao atualizar funcionário: ${error.message}`)
  return data
}

export async function toggleEmployeeStatus(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('employees')
    .update({ ativo, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`Erro ao atualizar status: ${error.message}`)
}
```

- [ ] **Step 2.2: Criar `src/app/(app)/funcionarios/actions.ts`**

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createEmployee, updateEmployee, toggleEmployeeStatus } from '@/lib/terms-supabase'

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

export async function createEmployeeAction(formData: FormData) {
  const nome_completo = asString(formData, 'nome_completo')
  const re = asString(formData, 're')
  const cpf = asString(formData, 'cpf')
  const funcao = asString(formData, 'funcao')
  const centro_custo = asString(formData, 'centro_custo') || null

  if (!nome_completo || !re || !cpf || !funcao) {
    redirect('/funcionarios?error=required')
  }

  await createEmployee({ nome_completo, re, cpf, funcao, ativo: true, centro_custo })
  revalidatePath('/funcionarios')
  redirect('/funcionarios?success=created')
}

export async function updateEmployeeAction(formData: FormData) {
  const id = asString(formData, 'id')
  const nome_completo = asString(formData, 'nome_completo')
  const re = asString(formData, 're')
  const cpf = asString(formData, 'cpf')
  const funcao = asString(formData, 'funcao')
  const centro_custo = asString(formData, 'centro_custo') || null

  if (!id || !nome_completo || !re || !cpf || !funcao) {
    redirect('/funcionarios?error=required')
  }

  await updateEmployee(id, { nome_completo, re, cpf, funcao, ativo: true, centro_custo })
  revalidatePath('/funcionarios')
  redirect('/funcionarios?success=updated')
}

export async function toggleEmployeeStatusAction(formData: FormData) {
  const id = asString(formData, 'id')
  const ativo = formData.get('ativo') === 'true'
  await toggleEmployeeStatus(id, !ativo)
  revalidatePath('/funcionarios')
}
```

- [ ] **Step 2.3: Criar `src/app/(app)/funcionarios/page.tsx`**

```typescript
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/auth/profile'
import { listEmployees } from '@/lib/terms-supabase'
import { createClient } from '@/lib/supabase/server'
import { createEmployeeAction, updateEmployeeAction, toggleEmployeeStatusAction } from './actions'

const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

type PageProps = {
  searchParams?: Promise<{ error?: string; success?: string; editar?: string }>
}

export default async function FuncionariosPage({ searchParams }: PageProps) {
  const query = (await searchParams) ?? {}
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const centrosCusto = profile.role === 'superadmin' || profile.role === 'admin'
    ? undefined
    : profile.centros_custo ?? []

  const employees = await listEmployees(centrosCusto)

  // Buscar contratos para o select de centro de custo
  const supabase = await createClient()
  const { data: contratos } = await supabase
    .from('contracts')
    .select('centro_custo, contrato')
    .eq('ativo', true)
    .order('centro_custo')
  const contratosList = contratos ?? []

  // Buscar funções
  const { data: funcoes } = await supabase
    .from('job_functions')
    .select('nome')
    .eq('ativo', true)
    .order('nome')
  const funcoesList = funcoes ?? []

  const editandoId = query.editar ?? null
  const editando = editandoId ? employees.find(e => e.id === editandoId) : null

  const successMessage =
    query.success === 'created' ? 'Funcionário cadastrado com sucesso.' :
    query.success === 'updated' ? 'Funcionário atualizado com sucesso.' : ''
  const errorMessage = query.error === 'required' ? 'Preencha todos os campos obrigatórios.' : ''

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Cadastros</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Funcionários</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pré-cadastre colaboradores para agilizar o preenchimento dos termos de responsabilidade.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      )}

      {/* Formulário de cadastro / edição */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {editando ? 'Editar funcionário' : 'Novo funcionário'}
        </h2>
        <form action={editando ? updateEmployeeAction : createEmployeeAction} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {editando && <input type="hidden" name="id" value={editando.id} />}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nome completo *</label>
            <input name="nome_completo" defaultValue={editando?.nome_completo ?? ''} className={fieldClass} placeholder="Nome completo" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">RE (Registro de Empregado) *</label>
            <input name="re" defaultValue={editando?.re ?? ''} className={fieldClass} placeholder="Número de registro" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">CPF *</label>
            <input name="cpf" defaultValue={editando?.cpf ?? ''} className={fieldClass} placeholder="000.000.000-00" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Função *</label>
            <select name="funcao" defaultValue={editando?.funcao ?? ''} className={fieldClass} required>
              <option value="">Selecione</option>
              {funcoesList.map(f => (
                <option key={f.nome} value={f.nome}>{f.nome}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Centro de custo</label>
            <select name="centro_custo" defaultValue={editando?.centro_custo ?? ''} className={fieldClass}>
              <option value="">Nenhum (geral)</option>
              {contratosList.map(c => (
                <option key={c.centro_custo} value={c.centro_custo}>{c.centro_custo} — {c.contrato}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex items-end gap-3">
            <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition">
              {editando ? 'Salvar alterações' : 'Cadastrar funcionário'}
            </button>
            {editando && (
              <a href="/funcionarios" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancelar
              </a>
            )}
          </div>
        </form>
      </div>

      {/* Lista de funcionários */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Funcionários cadastrados</h2>
          <span className="text-xs text-slate-400">{employees.length} registro(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">RE</th>
                <th className="px-4 py-3 text-left">CPF</th>
                <th className="px-4 py-3 text-left">Função</th>
                <th className="px-4 py-3 text-left">Centro de custo</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">Nenhum funcionário cadastrado.</td>
                </tr>
              )}
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-800">{emp.nome_completo}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.re}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.cpf}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.funcao}</td>
                  <td className="px-4 py-3 text-slate-500">{emp.centro_custo ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${emp.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {emp.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a href={`/funcionarios?editar=${emp.id}`} className="text-xs font-medium text-indigo-600 hover:underline">Editar</a>
                      <form action={toggleEmployeeStatusAction}>
                        <input type="hidden" name="id" value={emp.id} />
                        <input type="hidden" name="ativo" value={String(emp.ativo)} />
                        <button type="submit" className={`text-xs font-medium hover:underline ${emp.ativo ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {emp.ativo ? 'Inativar' : 'Reativar'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2.4: Adicionar link no sidebar**

Ler `src/components/sidebar.tsx` e localizar o bloco de links de navegação. Adicionar após o link de `/termos`:

```tsx
<Link
  href="/funcionarios"
  className={/* mesma classe dos outros links */}
>
  {/* ícone adequado */}
  Funcionários
</Link>
```

_(O padrão exato de classes deve ser copiado do link `/termos` existente no arquivo.)_

- [ ] **Step 2.5: Commit**

```bash
git add src/lib/terms-supabase.ts src/app/(app)/funcionarios/ src/components/sidebar.tsx
git commit -m "feat: add employee pre-registration CRUD at /funcionarios"
```

---

## Task 3 — Auto-preenchimento de funcionário no formulário de termo

**Files:**
- Modify: `src/app/(app)/termos/novo/termo-form.tsx`

### Contexto
No formulário de criação de termo, adicionar um campo de busca/select "Funcionário cadastrado" que, ao selecionar, preenche automaticamente os campos `funcionario_nome`, `matricula`, `cpf` e `funcao`. O usuário ainda pode editar manualmente.

- [ ] **Step 3.1: Atualizar `termo-form.tsx` — adicionar busca de funcionário**

No topo do arquivo, adicionar o tipo:

```typescript
type EmployeeRow = {
  id: string
  nome_completo: string
  re: string
  cpf: string
  funcao: string
  ativo: boolean
}
```

No state do componente, adicionar:

```typescript
const [employees, setEmployees] = useState<EmployeeRow[]>([])
const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
// Campos do colaborador como state para permitir auto-preenchimento
const [funcionarioNome, setFuncionarioNome] = useState(initialValues?.funcionario_nome ?? '')
const [matricula, setMatricula] = useState(initialValues?.matricula ?? '')
const [selectedFuncao, setSelectedFuncao] = useState(initialValues?.funcao ?? '')
```

No `useEffect` que carrega dados, adicionar a query de employees:

```typescript
supabase.from('employees').select('id, nome_completo, re, cpf, funcao, ativo').eq('ativo', true).order('nome_completo'),
```

E no `.then()`, desestruturar e setar:
```typescript
.then(([equip, contracts, functions, emps]) => {
  // ...existentes...
  if (emps.data) setEmployees(emps.data)
})
```

Adicionar função de seleção de funcionário:

```typescript
function handleEmployeeSelect(id: string) {
  setSelectedEmployeeId(id)
  const emp = employees.find(e => e.id === id)
  if (!emp) return
  setFuncionarioNome(emp.nome_completo)
  setMatricula(emp.re)
  setCpf(maskCpf(emp.cpf))
  setSelectedFuncao(emp.funcao)
}
```

Na seção "Dados do colaborador", adicionar **antes** dos campos existentes:

```tsx
<div className="md:col-span-4 mb-2">
  <label className="mb-1 block text-sm font-medium text-slate-700">Buscar funcionário cadastrado</label>
  <select
    value={selectedEmployeeId}
    onChange={e => handleEmployeeSelect(e.target.value)}
    className={fieldClassName}
  >
    <option value="">— Selecione para preencher automaticamente —</option>
    {employees.map(emp => (
      <option key={emp.id} value={emp.id}>
        {emp.nome_completo} — RE: {emp.re}
      </option>
    ))}
  </select>
  <p className="mt-1 text-xs text-slate-400">
    Selecionar preenche os campos abaixo. Você pode editar manualmente.
  </p>
</div>
```

Trocar os campos de texto de `defaultValue` para `value` controlado:

```tsx
<input name="funcionario_nome" value={funcionarioNome} onChange={e => setFuncionarioNome(e.target.value)} className={fieldClassName} placeholder="Nome completo" />
<input name="matricula" value={matricula} onChange={e => setMatricula(e.target.value)} className={fieldClassName} placeholder="Número de registro" />
// CPF já é controlado
// funcao: mudar de defaultValue para value={selectedFuncao} onChange
```

- [ ] **Step 3.2: Commit**

```bash
git add src/app/(app)/termos/novo/termo-form.tsx
git commit -m "feat: auto-fill employee fields from pre-registered employees"
```

---

## Task 4 — Data editável na manutenção

**Files:**
- Modify: `src/lib/terms-supabase.ts`
- Modify: `src/app/(app)/termos/[id]/actions.ts`
- Modify: `src/app/(app)/termos/[id]/page.tsx`

### Contexto
Atualmente `setTermMaintenance` usa `new Date().toISOString()` como data da manutenção. O usuário precisa informar a data real em que o equipamento entrou em manutenção.

- [ ] **Step 4.1: Atualizar `setTermMaintenance` em `src/lib/terms-supabase.ts`**

Localizar a assinatura (linha ~331):

```typescript
export async function setTermMaintenance(
  termId: string,
  input: { em_manutencao: boolean; observacao_manutencao?: string | null }
)
```

Alterar para:

```typescript
export async function setTermMaintenance(
  termId: string,
  input: {
    em_manutencao: boolean
    observacao_manutencao?: string | null
    data_manutencao?: string | null
  }
)
```

E no `payload` (linha ~337), trocar:

```typescript
data_manutencao: input.em_manutencao ? new Date().toISOString() : null,
```

por:

```typescript
data_manutencao: input.em_manutencao
  ? (input.data_manutencao ?? new Date().toISOString())
  : null,
```

- [ ] **Step 4.2: Atualizar `markMaintenanceAction` em `src/app/(app)/termos/[id]/actions.ts`**

Localizar a função (linha ~42) e adicionar extração de `data_manutencao`:

```typescript
export async function markMaintenanceAction(formData: FormData) {
  const term_id = asString(formData, 'term_id')
  const observacao_manutencao = asString(formData, 'observacao_manutencao')
  const data_manutencao = asString(formData, 'data_manutencao') || null

  if (!term_id) {
    redirect('/termos?error=maintenance')
  }

  await setTermMaintenance(term_id, {
    em_manutencao: true,
    observacao_manutencao: observacao_manutencao || null,
    data_manutencao,
  })

  revalidatePath('/termos')
  revalidatePath(`/termos/${term_id}`)
  redirect(`/termos/${term_id}?success=maintenance_on`)
}
```

- [ ] **Step 4.3: Adicionar campo de data no form de manutenção em `src/app/(app)/termos/[id]/page.tsx`**

Localizar o formulário de manutenção (linha ~197). Adicionar campo de data **antes** do campo de observação:

```tsx
<form action={markMaintenanceAction} className="space-y-3">
  <input type="hidden" name="term_id" value={term.id} />
  <div>
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      Data de entrada em manutenção *
    </label>
    <input
      type="date"
      name="data_manutencao"
      defaultValue={new Date().toISOString().slice(0, 10)}
      className={fieldClass}
      required
    />
    <p className="mt-1 text-xs text-slate-400">Informe a data real em que o equipamento entrou em manutenção.</p>
  </div>
  <div>
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Observação</label>
    <textarea name="observacao_manutencao" rows={3} className={fieldClass} placeholder="Motivo ou situação da manutenção" />
  </div>
  <button type="submit" className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 transition">
    Marcar em manutenção
  </button>
</form>
```

- [ ] **Step 4.4: Commit**

```bash
git add src/lib/terms-supabase.ts src/app/(app)/termos/[id]/actions.ts src/app/(app)/termos/[id]/page.tsx
git commit -m "fix: make maintenance start date editable by the user"
```

---

## Task 5 — Devolução mais clara: "Devolver ao Estoque"

**Files:**
- Modify: `src/app/(app)/termos/[id]/page.tsx`

### Contexto
O usuário pediu que fique claro que registrar a devolução significa que o equipamento **volta para o estoque da empresa**. Mudanças: título da seção, label do botão, mensagem informativa.

- [ ] **Step 5.1: Atualizar a seção de devolução em `page.tsx`**

Localizar a seção (linha ~211). Alterar conforme abaixo:

Substituir:
```tsx
<h3 className="text-sm font-bold text-slate-700 mb-3">Devolução</h3>
```
Por:
```tsx
<div className="mb-3">
  <h3 className="text-sm font-bold text-slate-700">Devolução — Retorno ao Estoque</h3>
  <p className="text-xs text-slate-500 mt-0.5">
    Registre aqui quando o equipamento for fisicamente devolvido e entrar de volta no estoque da empresa.
  </p>
</div>
```

Substituir o card de devolução já registrada:
```tsx
<div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-slate-700 space-y-1.5">
  <div className="flex items-center gap-2 mb-2">
    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
      ✓ NO ESTOQUE
    </span>
  </div>
  <p><span className="font-semibold">Data da devolução:</span> {formatDate(termReturn.data_devolucao)}</p>
  <p><span className="font-semibold">Condição:</span> {conditionLabel(termReturn.condicao)}</p>
  <p><span className="font-semibold">Recebido por:</span> {termReturn.responsavel_recebimento}</p>
  <p><span className="font-semibold">Obs:</span> {termReturn.observacoes || '-'}</p>
</div>
```

Substituir o botão de submit:
```tsx
<button type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition">
  Devolver ao Estoque da Empresa
</button>
```

Substituir o label do responsável pelo recebimento:
```tsx
<label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
  Quem recebeu no estoque *
</label>
<input name="responsavel_recebimento" className={fieldClass} placeholder="Nome do responsável no almoxarifado/estoque" required />
```

- [ ] **Step 5.2: Atualizar o card de status de Devolução (mini-card no topo)**

Localizar o mini-card (linha ~108):
```tsx
<div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-emerald-400">
  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Devolução</p>
  <p className="mt-2 text-sm font-medium text-slate-700">
    {termReturn ? `Registrada em ${formatDate(termReturn.data_devolucao)}` : 'Não registrada'}
  </p>
</div>
```

Substituir por:
```tsx
<div className="rounded-2xl bg-white p-5 shadow-sm border-t-4 border-emerald-400">
  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Estoque</p>
  <div className="mt-2">
    {termReturn ? (
      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700">
        NO ESTOQUE desde {formatDate(termReturn.data_devolucao)}
      </span>
    ) : (
      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-500">
        EM CAMPO
      </span>
    )}
  </div>
</div>
```

- [ ] **Step 5.3: Commit**

```bash
git add src/app/(app)/termos/[id]/page.tsx
git commit -m "ux: clarify return section as 'Devolver ao Estoque da Empresa'"
```

---

## Task 6 — Equipamento de Reserva (Stand-by)

**Files:**
- Modify: `src/app/(app)/termos/novo/termo-form.tsx`
- Modify: `src/app/(app)/termos/novo/actions.ts`
- Modify: `src/app/(app)/termos/[id]/page.tsx`
- Modify: `src/app/(app)/termos/page.tsx`
- Modify: `src/lib/terms-supabase.ts`

### Contexto
Uma equipe de campo pode ter equipamentos "de reserva" (stand-by) que ficam disponíveis para substituir rapidamente qualquer equipamento que quebre. Esses equipamentos ainda precisam de responsabilidade e rastreamento, mas não estão atribuídos a um funcionário específico — são responsabilidade da equipe/encarregado.

A abordagem: campo `is_reserva: boolean` no `equipment_terms`. Quando marcado, o funcionário fica como "RESERVA — {centro_custo}" e os campos de CPF/matrícula ficam com valor placeholder. O supervisor/encarregado é o responsável.

- [ ] **Step 6.1: Atualizar `createTerm` em `src/lib/terms-supabase.ts`**

No `payload` de `createTerm` (linha ~152), adicionar:

```typescript
is_reserva: input.is_reserva ?? false,
```

- [ ] **Step 6.2: Atualizar `src/app/(app)/termos/novo/actions.ts`**

Ler o arquivo e localizar onde `createTerm` é chamado. Adicionar extração de `is_reserva`:

```typescript
const is_reserva = formData.get('is_reserva') === 'true'
```

E passar ao `createTerm({ ..., is_reserva })`.

Quando `is_reserva` for `true`, os campos obrigatórios de funcionário devem ser preenchidos com defaults:
```typescript
const funcionario_nome = is_reserva
  ? `RESERVA — ${centro_custo}`
  : asString(formData, 'funcionario_nome')
const matricula = is_reserva ? 'RESERVA' : asString(formData, 'matricula')
const cpf = is_reserva ? '000.000.000-00' : asString(formData, 'cpf')
```

- [ ] **Step 6.3: Adicionar toggle de Reserva no `termo-form.tsx`**

Adicionar state:
```typescript
const [isReserva, setIsReserva] = useState(initialValues?.is_reserva ?? false)
```

Adicionar campo hidden:
```tsx
<input type="hidden" name="is_reserva" value={String(isReserva)} />
```

Na seção "Dados do colaborador", adicionar **no topo** da seção:

```tsx
<div className="md:col-span-4 mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
  <input
    type="checkbox"
    id="is_reserva"
    checked={isReserva}
    onChange={e => setIsReserva(e.target.checked)}
    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500"
  />
  <div>
    <label htmlFor="is_reserva" className="text-sm font-semibold text-amber-800 cursor-pointer">
      Equipamento de Reserva (Stand-by)
    </label>
    <p className="text-xs text-amber-700 mt-0.5">
      Marque quando o equipamento não está atribuído a um funcionário específico, mas fica disponível para a equipe como substituto em caso de falha de outro equipamento.
      A responsabilidade fica com o encarregado/supervisor do centro de custo.
    </p>
  </div>
</div>
```

Quando `isReserva` for true, ocultar os campos de funcionário e mostrar mensagem:

```tsx
{isReserva ? (
  <div className="md:col-span-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
    Equipamento registrado como <strong>Reserva</strong>. Responsabilidade vinculada ao encarregado do centro de custo selecionado.
  </div>
) : (
  <>
    {/* campos de funcionário_nome, matricula, cpf, funcao */}
  </>
)}
```

Atualizar a validação `validateForm` para pular campos de funcionário quando `is_reserva`:

```typescript
function validateForm(form: HTMLFormElement) {
  const formData = new FormData(form)
  const isReservaVal = formData.get('is_reserva') === 'true'

  const baseRequired = [
    { key: 'centro_custo', label: 'Centro de custo' },
    { key: 'contrato', label: 'Contrato' },
    { key: 'supervisor', label: 'Supervisor responsável' },
    { key: 'tipo_equipamento', label: 'Tipo do equipamento' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'patrimonio', label: 'Patrimônio' },
    { key: 'estado_entrega', label: 'Estado na entrega' },
  ]

  const employeeRequired = isReservaVal ? [] : [
    { key: 'funcionario_nome', label: 'Nome do funcionário' },
    { key: 'matricula', label: 'Matrícula / Registro' },
    { key: 'cpf', label: 'CPF' },
    { key: 'funcao', label: 'Função' },
  ]

  const requiredFields = [...baseRequired, ...employeeRequired]
  const missing = requiredFields.find(({ key }) => !String(formData.get(key) ?? '').trim())
  if (missing) return `Preencha o campo obrigatório: ${missing.label}.`

  if (!isReservaVal) {
    const rawCpf = String(formData.get('cpf') ?? '').trim()
    if (!isValidCPF(rawCpf)) return 'Informe um CPF válido no formato 000.000.000-00.'
  }

  return ''
}
```

- [ ] **Step 6.4: Badge RESERVA na lista de termos — `src/app/(app)/termos/page.tsx`**

Ler o arquivo e localizar onde o status é exibido na tabela de termos. Adicionar badge RESERVA quando `term.is_reserva`:

```tsx
{term.is_reserva && (
  <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
    RESERVA
  </span>
)}
```

- [ ] **Step 6.5: Badge RESERVA e info na página de detalhe — `src/app/(app)/termos/[id]/page.tsx`**

No mini-card de "Situação" (linha ~88), adicionar abaixo do badge de status:

```tsx
{term.is_reserva && (
  <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
    STAND-BY / RESERVA
  </span>
)}
```

Na seção "Dados do Colaborador", quando `term.is_reserva`, exibir mensagem:

```tsx
{term.is_reserva ? (
  <div className="md:col-span-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    Equipamento de <strong>Reserva (Stand-by)</strong> — vinculado ao centro de custo {term.centro_custo}. 
    Responsável: {term.encarregado || term.supervisor}.
  </div>
) : (
  /* dados normais de funcionário */
)}
```

- [ ] **Step 6.6: Commit**

```bash
git add src/lib/terms-supabase.ts src/app/(app)/termos/novo/termo-form.tsx src/app/(app)/termos/novo/actions.ts src/app/(app)/termos/[id]/page.tsx src/app/(app)/termos/page.tsx
git commit -m "feat: add stand-by/reserva equipment support with is_reserva flag"
```

---

## Self-Review

**Cobertura da spec:**
- [x] Pré-cadastro de funcionários com nome, RE, CPF, função, status ativo/inativo → Task 1 + 2
- [x] Auto-preenchimento do formulário de termo a partir do cadastro → Task 3
- [x] Data editável na manutenção → Task 4
- [x] Devolução mais clara como retorno ao estoque → Task 5
- [x] Equipamento de reserva/stand-by por equipe → Task 6

**Checklist de tipos:**
- `is_reserva` adicionado em `database.ts` Row/Insert/Update e em `TermInsert`
- `setTermMaintenance` recebe `data_manutencao` optional → usado em `markMaintenanceAction`
- `createEmployee` / `listEmployees` / `updateEmployee` / `toggleEmployeeStatus` — todos com tipos consistentes
- `EmployeeRow` em `termo-form.tsx` bate com o select do Supabase

**Placeholders:** Nenhum "TBD" ou "adicione aqui". A Task 2.4 (sidebar) instrui a copiar o padrão do arquivo — isso é intencional pois o padrão de classes do sidebar não foi lido no plano.

---

## Ordem de execução sugerida

1. Task 1 (SQL no Supabase + tipos) — pré-requisito para tudo
2. Task 2 (CRUD funcionários) — independente
3. Task 4 (data manutenção) — independente, pequena
4. Task 5 (devolução estoque) — independente, pequena
5. Task 3 (auto-fill no form) — depende da Task 2
6. Task 6 (stand-by) — independente das anteriores
