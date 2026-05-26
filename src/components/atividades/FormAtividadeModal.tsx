'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { atividadeSchema, AtividadeFormData } from '@/schemas/atividade.schema'
import { useCreateAtividade, useUpdateAtividade } from '@/hooks/useAtividades'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const TIPOS_ATIVIDADE = [
  'Reunião de Trabalho',
  'Reunião Festiva',
  'Reunião de Diretoria',
  'Reunião com Dirigentes/Pastas',
  'Treinamento',
  'Integração',
  'Evento',
  'Visita a Outro Clube',
  'Atividade de Preparação de Lideranças',
  'Reunião do Lions',
  'Angariação de Fundos',
  'Outros',
]

interface Props {
  open: boolean
  onClose: () => void
  atividade?: any
}

export function FormAtividadeModal({ open, onClose, atividade }: Props) {
  const isEditing = !!atividade
  const create = useCreateAtividade()
  const update = useUpdateAtividade()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AtividadeFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(atividadeSchema) as any,
    defaultValues: { titulo: '' },
  })

  useEffect(() => {
    if (atividade) {
      reset({
        titulo: atividade.titulo ?? '',
        tipoAtividade: atividade.tipoAtividade ?? '',
        al: atividade.al ?? '',
        trimestre: atividade.trimestre ?? '',
        dataInicio: atividade.dataInicio ? atividade.dataInicio.split('T')[0] : '',
        horaInicio: atividade.horaInicio ?? '',
        dataFim: atividade.dataFim ? atividade.dataFim.split('T')[0] : '',
        horaFim: atividade.horaFim ?? '',
        localAtividade: atividade.localAtividade ?? '',
        qtdAssociadosPresentes: atividade.qtdAssociadosPresentes ?? 0,
        associadosPresentes: atividade.associadosPresentes ?? '',
        qtdPreLeosPresentes: atividade.qtdPreLeosPresentes ?? 0,
        preLeosPresentes: atividade.preLeosPresentes ?? '',
        qtdLeoLeaoPresentes: atividade.qtdLeoLeaoPresentes ?? 0,
        leoLeaoPresentes: atividade.leoLeaoPresentes ?? '',
        qtdAmigosConselheirosPresentes: atividade.qtdAmigosConselheirosPresentes ?? 0,
        amigosConselheirosPresentes: atividade.amigosConselheirosPresentes ?? '',
        outrosLions: atividade.outrosLions ?? 0,
        descricaoAtividade: atividade.descricaoAtividade ?? '',
        fotoOficialUrl: atividade.fotoOficialUrl ?? '',
        duracaoTotalMinutos: atividade.duracaoTotalMinutos ?? 0,
      })
    } else {
      reset({ titulo: '' })
    }
  }, [atividade, reset, open])

  async function onSubmit(data: AtividadeFormData) {
    try {
      if (isEditing) {
        await update.mutateAsync({ id: atividade.id, data })
      } else {
        await create.mutateAsync(data)
      }
      onClose()
    } catch {
      alert('Erro ao salvar atividade.')
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
  const errCls = 'text-red-500 text-xs mt-1'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <div>
            <label className={labelCls}>Título *</label>
            <input {...register('titulo')} className={inputCls} placeholder="Título da atividade" />
            {errors.titulo && <p className={errCls}>{errors.titulo.message}</p>}
          </div>

          {/* Tipo */}
          <div>
            <label className={labelCls}>Tipo de Atividade</label>
            <select {...register('tipoAtividade')} className={inputCls}>
              <option value="">Selecione...</option>
              {TIPOS_ATIVIDADE.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* AL + Trimestre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>AL</label>
              <input {...register('al')} className={inputCls} placeholder="ex: 2024-2025" />
            </div>
            <div>
              <label className={labelCls}>Trimestre</label>
              <select {...register('trimestre')} className={inputCls}>
                <option value="">Selecione...</option>
                <option value="1">1º Trimestre</option>
                <option value="2">2º Trimestre</option>
                <option value="3">3º Trimestre</option>
                <option value="4">4º Trimestre</option>
              </select>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Data Início</label>
              <input type="date" {...register('dataInicio')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hora Início</label>
              <input type="time" {...register('horaInicio')} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Data Fim</label>
              <input type="date" {...register('dataFim')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hora Fim</label>
              <input type="time" {...register('horaFim')} className={inputCls} />
            </div>
          </div>

          {/* Local */}
          <div>
            <label className={labelCls}>Local</label>
            <input {...register('localAtividade')} className={inputCls} placeholder="Local da atividade" />
          </div>

          {/* Presentes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Qtd. Associados</label>
              <input type="number" min={0} {...register('qtdAssociadosPresentes')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nomes (Associados)</label>
              <input {...register('associadosPresentes')} className={inputCls} placeholder="Nomes dos presentes" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Qtd. Pré-LEOs</label>
              <input type="number" min={0} {...register('qtdPreLeosPresentes')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nomes (Pré-LEOs)</label>
              <input {...register('preLeosPresentes')} className={inputCls} placeholder="Nomes dos presentes" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Qtd. LEO-Leão</label>
              <input type="number" min={0} {...register('qtdLeoLeaoPresentes')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nomes (LEO-Leão)</label>
              <input {...register('leoLeaoPresentes')} className={inputCls} placeholder="Nomes dos presentes" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Qtd. Amigos/Conselheiros</label>
              <input type="number" min={0} {...register('qtdAmigosConselheirosPresentes')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nomes (Amigos/Conselheiros)</label>
              <input {...register('amigosConselheirosPresentes')} className={inputCls} placeholder="Nomes dos presentes" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Outros Lions</label>
              <input type="number" min={0} {...register('outrosLions')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Duração Total (min)</label>
              <input type="number" min={0} {...register('duracaoTotalMinutos')} className={inputCls} />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className={labelCls}>Descrição</label>
            <textarea {...register('descricaoAtividade')} className={inputCls} rows={3} placeholder="Descreva a atividade..." />
          </div>

          {/* Foto URL */}
          <div>
            <label className={labelCls}>URL Foto Oficial</label>
            <input {...register('fotoOficialUrl')} className={inputCls} placeholder="https://..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
