'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventoSchema, EventoFormData } from '@/schemas/evento.schema'
import { useCreateEvento, useUpdateEvento } from '@/hooks/useEventos'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  open: boolean
  onClose: () => void
  evento?: any
}

export function FormEventoModal({ open, onClose, evento }: Props) {
  const isEditing = !!evento
  const create = useCreateEvento()
  const update = useUpdateEvento()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EventoFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventoSchema) as any,
    defaultValues: { nome: '' },
  })

  useEffect(() => {
    if (evento) {
      reset({
        nome: evento.nome ?? '',
        clubeSedeNome: evento.clubeSedeNome ?? '',
        dataEvento: evento.dataEvento ? evento.dataEvento.split('T')[0] : '',
        dataInicio: evento.dataInicio ? evento.dataInicio.split('T')[0] : '',
        dataFim: evento.dataFim ? evento.dataFim.split('T')[0] : '',
        descricao: evento.descricao ?? '',
        pixKey: evento.pixKey ?? '',
        beneficiario: evento.beneficiario ?? '',
        banco: evento.banco ?? '',
        contaCorrente: evento.contaCorrente ?? '',
        agencia: evento.agencia ?? '',
        aceitarTrocas: evento.aceitarTrocas ?? false,
        fotoUrl: evento.fotoUrl ?? '',
        formularioConvidadosHabilitado: evento.formularioConvidadosHabilitado ?? false,
        eventoTeraPassaportes: evento.eventoTeraPassaportes ?? false,
        enviarPassaportePorEmail: evento.enviarPassaportePorEmail ?? false,
      })
    } else {
      reset({ nome: '' })
    }
  }, [evento, reset, open])

  async function onSubmit(data: EventoFormData) {
    try {
      if (isEditing) {
        await update.mutateAsync({ id: evento.id, data })
      } else {
        await create.mutateAsync(data)
      }
      onClose()
    } catch {
      alert('Erro ao salvar evento.')
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
  const checkCls = 'mr-2'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelCls}>Nome do Evento *</label>
            <input {...register('nome')} className={inputCls} placeholder="Nome do evento" />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Clube Sede</label>
            <input {...register('clubeSedeNome')} className={inputCls} placeholder="Nome do clube sede" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Data do Evento</label>
              <input type="date" {...register('dataEvento')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Data Início</label>
              <input type="date" {...register('dataInicio')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Data Fim</label>
              <input type="date" {...register('dataFim')} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Descrição</label>
            <textarea {...register('descricao')} className={inputCls} rows={3} placeholder="Descrição do evento..." />
          </div>

          <div>
            <label className={labelCls}>URL Foto</label>
            <input {...register('fotoUrl')} className={inputCls} placeholder="https://..." />
          </div>

          {/* Pagamento */}
          <fieldset className="border border-gray-200 rounded p-4">
            <legend className="text-sm font-semibold text-gray-600 px-2">Dados de Pagamento</legend>
            <div className="space-y-3 mt-2">
              <div>
                <label className={labelCls}>Chave PIX</label>
                <input {...register('pixKey')} className={inputCls} placeholder="Chave PIX" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Beneficiário</label>
                  <input {...register('beneficiario')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Banco</label>
                  <input {...register('banco')} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Conta Corrente</label>
                  <input {...register('contaCorrente')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Agência</label>
                  <input {...register('agencia')} className={inputCls} />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Flags */}
          <div className="space-y-2">
            <label className="flex items-center text-sm">
              <input type="checkbox" {...register('aceitarTrocas')} className={checkCls} />
              Aceitar trocas de inscrição
            </label>
            <label className="flex items-center text-sm">
              <input type="checkbox" {...register('formularioConvidadosHabilitado')} className={checkCls} />
              Formulário de convidados habilitado
            </label>
            <label className="flex items-center text-sm">
              <input type="checkbox" {...register('eventoTeraPassaportes')} className={checkCls} />
              Evento terá passaportes
            </label>
            <label className="flex items-center text-sm">
              <input type="checkbox" {...register('enviarPassaportePorEmail')} className={checkCls} />
              Enviar passaporte por email
            </label>
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
