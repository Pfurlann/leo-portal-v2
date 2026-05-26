'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nominataSchema, NominataFormData } from '@/schemas/nominata.schema'
import { useCreateNominata, useUpdateNominata } from '@/hooks/useNominata'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  open: boolean
  onClose: () => void
  item?: any
  alAtual: string
}

export function FormNominataModal({ open, onClose, item, alAtual }: Props) {
  const isEditing = !!item
  const create = useCreateNominata(alAtual)
  const update = useUpdateNominata(alAtual)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NominataFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(nominataSchema) as any,
    defaultValues: { cargo: '', nome: '', anoLeonistico: alAtual },
  })

  useEffect(() => {
    if (item) {
      reset({
        cargo: item.cargo ?? '',
        nome: item.nome ?? '',
        anoLeonistico: item.anoLeonistico ?? alAtual,
        urlFoto: item.urlFoto ?? '',
        formacao: item.formacao ?? '',
        profissao: item.profissao ?? '',
        pessoaRtmaId: item.pessoaRtmaId ?? '',
      })
    } else {
      reset({ cargo: '', nome: '', anoLeonistico: alAtual })
    }
  }, [item, reset, open, alAtual])

  async function onSubmit(data: NominataFormData) {
    try {
      if (isEditing) {
        await update.mutateAsync({ id: item.id, data })
      } else {
        await create.mutateAsync(data)
      }
      onClose()
    } catch {
      alert('Erro ao salvar membro da nominata.')
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Membro da Diretoria' : 'Novo Membro da Diretoria'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelCls}>Cargo *</label>
            <input {...register('cargo')} className={inputCls} placeholder="Ex: Presidente, Secretário, Tesoureiro..." />
            {errors.cargo && <p className="text-red-500 text-xs mt-1">{errors.cargo.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Nome *</label>
            <input {...register('nome')} className={inputCls} placeholder="Nome completo" />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Ano Leonístico</label>
            <select {...register('anoLeonistico')} className={inputCls}>
              <option value="2024-2025">AL 2024-2025</option>
              <option value="2025-2026">AL 2025-2026</option>
              <option value="2026-2027">AL 2026-2027</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Formação</label>
              <input {...register('formacao')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Profissão</label>
              <input {...register('profissao')} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>URL Foto</label>
            <input {...register('urlFoto')} className={inputCls} placeholder="https://..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
