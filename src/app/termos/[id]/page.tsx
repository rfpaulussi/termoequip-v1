"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  getStoredTermById,
  registerTermReturn,
} from "@/lib/terms-storage";
import { EquipmentTerm, ReturnCondition } from "@/types/term";

function formatCondition(condition?: ReturnCondition) {
  switch (condition) {
    case "EM_PERFEITO_ESTADO":
      return "Em perfeito estado";
    case "COM_DEFEITO":
      return "Apresentando defeito";
    case "FALTANDO_PECAS":
      return "Faltando peças ou acessórios";
    default:
      return "-";
  }
}

const fieldClassName =
  "w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100";

const infoCardClassName =
  "rounded-2xl border border-green-100 bg-white p-5 text-slate-800";

export default function TermoDetalhePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [term, setTerm] = useState<EquipmentTerm | null>(null);
  const [error, setError] = useState("");

  const [dataDevolucao, setDataDevolucao] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [condicao, setCondicao] =
    useState<ReturnCondition>("EM_PERFEITO_ESTADO");
  const [responsavelRecebimento, setResponsavelRecebimento] = useState("");
  const [observacoesDevolucao, setObservacoesDevolucao] = useState("");

  useEffect(() => {
    if (!id) return;
    const found = getStoredTermById(id);
    setTerm(found);
  }, [id]);

  function handlePrint() {
    window.print();
  }

  function handleRegisterReturn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!id || !responsavelRecebimento.trim()) {
      setError("Informe o responsável pelo recebimento.");
      return;
    }

    const updated = registerTermReturn(id, {
      dataDevolucao,
      condicao,
      observacoes: observacoesDevolucao,
      responsavelRecebimento,
    });

    if (!updated) {
      setError("Não foi possível registrar a devolução.");
      return;
    }

    setTerm(updated);
  }

  if (!term) {
    return (
      <main className="bg-green-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-green-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Termo não encontrado
          </h1>
          <p className="mt-3 text-slate-600">
            O termo solicitado não foi localizado no armazenamento local.
          </p>

          <Link
            href="/termos"
            className="mt-6 inline-flex rounded-xl bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
          >
            Voltar para termos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-green-50 px-6 py-10 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              Detalhe do Termo
            </span>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              {term.numeroTermo}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/termos"
              className="rounded-xl border border-green-200 bg-white px-4 py-2 font-medium text-green-800 hover:bg-green-50"
            >
              Voltar
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-xl bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
            >
              Imprimir
            </button>
          </div>
        </div>

        <section className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="border-b border-slate-200 pb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              TERMO DE RESPONSABILIDADE PELA GUARDA E USO DO EQUIPAMENTO DE
              TRABALHO
            </h2>
            <p className="mt-3 text-sm text-slate-700">
              Nº do Termo: <strong>{term.numeroTermo}</strong>
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className={infoCardClassName}>
              <p><strong>Contrato:</strong> {term.contrato}</p>
              <p><strong>Centro de custo:</strong> {term.centroCusto}</p>
              <p><strong>Supervisor:</strong> {term.supervisor}</p>
              <p><strong>Encarregado:</strong> {term.encarregado || "-"}</p>
              <p><strong>Data da entrega:</strong> {term.dataEntrega}</p>
            </div>

            <div className={infoCardClassName}>
              <p><strong>Funcionário:</strong> {term.funcionarioNome}</p>
              <p><strong>Matrícula:</strong> {term.matricula}</p>
              <p><strong>Função:</strong> {term.funcao}</p>
            </div>
          </div>

          <div className={`mt-6 ${infoCardClassName}`}>
            <p><strong>Tipo do equipamento:</strong> {term.tipoEquipamento}</p>
            <p><strong>Marca:</strong> {term.marca || "-"}</p>
            <p><strong>Modelo:</strong> {term.modelo || "-"}</p>
            <p><strong>Número de série:</strong> {term.numeroSerie || "-"}</p>
            <p><strong>Patrimônio:</strong> {term.patrimonio}</p>
            <p><strong>Estado na entrega:</strong> {term.estadoEntrega || "-"}</p>
            <p><strong>Acessórios:</strong> {term.acessorios || "-"}</p>
          </div>

          <div className="mt-8 space-y-4 text-justify leading-7 text-slate-800">
            <p>
              Recebo da empresa DEMAX SERVIÇOS E COMÉRCIO LTDA., a título de
              equipamento de serviço, para uso individual, o equipamento acima
              identificado, comprometendo-me a utilizá-lo de forma correta,
              conservá-lo adequadamente e comunicar imediatamente qualquer dano,
              defeito, inutilização, extravio ou irregularidade verificada.
            </p>

            <p>
              <strong>1 -</strong> Se o equipamento for danificado, inutilizado
              ou extraviado em decorrência de uso inadequado, mau uso
              intencional, negligência ou descumprimento das orientações de
              utilização, a empresa poderá realizar a apuração do ocorrido e,
              havendo comprovação da responsabilidade do colaborador, adotar as
              medidas cabíveis, inclusive o ressarcimento correspondente, quando
              aplicável.
            </p>

            <p>
              <strong>2 -</strong> Em caso de dano, inutilização ou extravio do
              equipamento, o fato deverá ser comunicado imediatamente ao setor
              responsável.
            </p>

            <p>
              <strong>3 -</strong> Enquanto o equipamento estiver sob minha
              guarda, ele poderá ser objeto de inspeção pela empresa,
              independentemente de aviso prévio.
            </p>

            <p>
              <strong>4 -</strong> Declaro ter recebido o equipamento com seus
              dispositivos de proteção e estar ciente de que sua retirada,
              alteração ou não utilização adequada compromete a segurança da
              operação, podendo gerar responsabilização do operador.
            </p>

            {term.observacoes ? (
              <p>
                <strong>Observações:</strong> {term.observacoes}
              </p>
            ) : null}
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <div className="mt-12 border-t border-slate-400 pt-2 text-center text-sm text-slate-700">
                Assinatura do colaborador
              </div>
            </div>

            <div>
              <div className="mt-12 border-t border-slate-400 pt-2 text-center text-sm text-slate-700">
                Assinatura do responsável pela entrega
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 p-5 text-slate-800">
            <h3 className="text-lg font-semibold text-slate-900">Devolução</h3>

            {term.devolucao ? (
              <div className="mt-4 space-y-2">
                <p><strong>Data:</strong> {term.devolucao.dataDevolucao}</p>
                <p>
                  <strong>Condição:</strong>{" "}
                  {formatCondition(term.devolucao.condicao)}
                </p>
                <p>
                  <strong>Responsável pelo recebimento:</strong>{" "}
                  {term.devolucao.responsavelRecebimento}
                </p>
                <p>
                  <strong>Observações:</strong>{" "}
                  {term.devolucao.observacoes || "-"}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-slate-600">
                Devolução ainda não registrada.
              </p>
            )}
          </div>
        </section>

        {term.status === "ENTREGUE" ? (
          <section className="mt-8 rounded-3xl border border-green-100 bg-white p-6 shadow-sm print:hidden">
            <h2 className="text-2xl font-bold text-slate-900">
              Registrar devolução
            </h2>

            <form onSubmit={handleRegisterReturn} className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Data da devolução
                  </label>
                  <input
                    type="date"
                    value={dataDevolucao}
                    onChange={(e) => setDataDevolucao(e.target.value)}
                    className={fieldClassName}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Condição do equipamento
                  </label>
                  <select
                    value={condicao}
                    onChange={(e) =>
                      setCondicao(e.target.value as ReturnCondition)
                    }
                    className={`${fieldClassName} bg-white`}
                  >
                    <option value="EM_PERFEITO_ESTADO">Em perfeito estado</option>
                    <option value="COM_DEFEITO">Apresentando defeito</option>
                    <option value="FALTANDO_PECAS">
                      Faltando peças ou acessórios
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Responsável pelo recebimento *
                </label>
                <input
                  value={responsavelRecebimento}
                  onChange={(e) => setResponsavelRecebimento(e.target.value)}
                  className={fieldClassName}
                  placeholder="Digite o nome do responsável"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Observações da devolução
                </label>
                <textarea
                  value={observacoesDevolucao}
                  onChange={(e) => setObservacoesDevolucao(e.target.value)}
                  rows={4}
                  className={fieldClassName}
                  placeholder="Descreva a condição da devolução"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
              >
                Registrar devolução
              </button>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  );
}