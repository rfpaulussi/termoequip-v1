"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createTerm } from "@/lib/terms-storage";

type FormState = {
  contrato: string;
  centroCusto: string;
  supervisor: string;
  encarregado: string;
  dataEntrega: string;
  funcionarioNome: string;
  matricula: string;
  funcao: string;
  tipoEquipamento: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  patrimonio: string;
  estadoEntrega: string;
  acessorios: string;
  observacoes: string;
};

const initialForm: FormState = {
  contrato: "",
  centroCusto: "",
  supervisor: "",
  encarregado: "",
  dataEntrega: new Date().toISOString().slice(0, 10),
  funcionarioNome: "",
  matricula: "",
  funcao: "",
  tipoEquipamento: "",
  marca: "",
  modelo: "",
  numeroSerie: "",
  patrimonio: "",
  estadoEntrega: "Bom estado",
  acessorios: "",
  observacoes: "",
};

const fieldClassName =
  "w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100";

export default function NovoTermoPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState("");

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !form.contrato.trim() ||
      !form.centroCusto.trim() ||
      !form.supervisor.trim() ||
      !form.funcionarioNome.trim() ||
      !form.matricula.trim() ||
      !form.funcao.trim() ||
      !form.tipoEquipamento.trim() ||
      !form.patrimonio.trim()
    ) {
      setError(
        "Preencha os campos principais: contrato, centro de custo, supervisor, nome do funcionário, matrícula, função, tipo do equipamento e patrimônio."
      );
      return;
    }

    const newTerm = createTerm(form);
    router.push(`/termos/${newTerm.id}`);
  }

  return (
    <main className="bg-green-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Novo Termo
            </span>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Cadastro de Termo de Responsabilidade
            </h1>
            <p className="mt-2 text-slate-600">
              Preencha os dados para gerar o termo e salvar no histórico.
            </p>
          </div>

          <Link
            href="/termos"
            className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
          >
            Voltar para termos
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Dados operacionais
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Contrato *
                </label>
                <input
                  value={form.contrato}
                  onChange={(e) => updateField("contrato", e.target.value)}
                  className={fieldClassName}
                  placeholder="Digite o contrato"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Centro de custo *
                </label>
                <input
                  value={form.centroCusto}
                  onChange={(e) => updateField("centroCusto", e.target.value)}
                  className={fieldClassName}
                  placeholder="Digite o centro de custo"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Supervisor responsável *
                </label>
                <input
                  value={form.supervisor}
                  onChange={(e) => updateField("supervisor", e.target.value)}
                  className={fieldClassName}
                  placeholder="Nome do supervisor"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Encarregado responsável
                </label>
                <input
                  value={form.encarregado}
                  onChange={(e) => updateField("encarregado", e.target.value)}
                  className={fieldClassName}
                  placeholder="Nome do encarregado"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Data da entrega
                </label>
                <input
                  type="date"
                  value={form.dataEntrega}
                  onChange={(e) => updateField("dataEntrega", e.target.value)}
                  className={fieldClassName}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Dados do colaborador
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nome do funcionário *
                </label>
                <input
                  value={form.funcionarioNome}
                  onChange={(e) =>
                    updateField("funcionarioNome", e.target.value)
                  }
                  className={fieldClassName}
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Matrícula / Registro *
                </label>
                <input
                  value={form.matricula}
                  onChange={(e) => updateField("matricula", e.target.value)}
                  className={fieldClassName}
                  placeholder="Número de registro"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Função *
                </label>
                <input
                  value={form.funcao}
                  onChange={(e) => updateField("funcao", e.target.value)}
                  className={fieldClassName}
                  placeholder="Função do colaborador"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Dados do equipamento
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tipo do equipamento *
                </label>
                <input
                  value={form.tipoEquipamento}
                  onChange={(e) =>
                    updateField("tipoEquipamento", e.target.value)
                  }
                  className={fieldClassName}
                  placeholder="Roçadeira, motosserra..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Marca
                </label>
                <input
                  value={form.marca}
                  onChange={(e) => updateField("marca", e.target.value)}
                  className={fieldClassName}
                  placeholder="Marca"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Modelo
                </label>
                <input
                  value={form.modelo}
                  onChange={(e) => updateField("modelo", e.target.value)}
                  className={fieldClassName}
                  placeholder="Modelo"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Número de série
                </label>
                <input
                  value={form.numeroSerie}
                  onChange={(e) => updateField("numeroSerie", e.target.value)}
                  className={fieldClassName}
                  placeholder="Número de série"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Patrimônio *
                </label>
                <input
                  value={form.patrimonio}
                  onChange={(e) => updateField("patrimonio", e.target.value)}
                  className={fieldClassName}
                  placeholder="Número do patrimônio"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Estado na entrega
                </label>
                <input
                  value={form.estadoEntrega}
                  onChange={(e) =>
                    updateField("estadoEntrega", e.target.value)
                  }
                  className={fieldClassName}
                  placeholder="Ex.: bom estado"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Acessórios entregues
              </label>
              <textarea
                value={form.acessorios}
                onChange={(e) => updateField("acessorios", e.target.value)}
                rows={3}
                className={fieldClassName}
                placeholder="Liste os acessórios entregues"
              />
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Observações
              </label>
              <textarea
                value={form.observacoes}
                onChange={(e) => updateField("observacoes", e.target.value)}
                rows={4}
                className={fieldClassName}
                placeholder="Observações adicionais"
              />
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white shadow-sm hover:bg-green-800"
            >
              Salvar termo
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}