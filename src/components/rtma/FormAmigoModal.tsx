'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { amigoConselheiroSchema, AmigoConselheiroFormData } from '@/schemas/rtma.schema'
import { useCreateAmigo, useUpdateAmigo } from '@/hooks/useRtma'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const TIPOS_AMIGO = ['Amigo LEO', 'Conselheiro']

interface Props {
  open: boolean
  onClose: () => void
  amigo?: any
}

export function FormAmigoModal({ open, onClose, amigo }: Props) {
  const isEditing = !!amigo
  const create = useCreateAmigo()
  const update = useUpdateAmigo()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AmigoConselheiroFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(amigoConselheiroSchema) as any,
    defaultValues: { nome: '' },
  })

  useEffect(() => {
    if (amigo) {
      reset({
        nome: amigo.nome ?? '',
        tipo: amigo.tipo ?? '',
        lionsClube: amigo.lionsClube ?? '',
        dataNascimento: amigo.dataNascimento ?? '',
        email: amigo.email ?? '',
        endereco: amigo.endereco ?? '',
        cidade: amigo.cidade ?? '',
        cep: amigo.cep ?? '',
      })
    } else {
      reset({ nome: '' })
    }
  }, [amigo, reset, open])

  async function onSubmit(data: AmigoConselheiroFormData) {
    try {
      if (isEditing) {
        await update.mutateAsync({ id: amigo.id, data })
      } else {
        await create.mutateAsync(data)
      }
      onClose()
    } catch {
      alert('Erro ao salvar amigo/conselheiro.')
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Amigo/Conselheiro' : 'Novo Amigo/Conselheiro'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelCls}>Nome *</label>
            <input {...register('nome')} className={inputCls} placeholder="Nome completo" />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Tipo</label>
            <select {...register('tipo')} className={inputCls}>
              <option value="">Selecione...</option>
              {TIPOS_AMIGO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Lions Clube</label>
            <input {...register('lionsClube')} className={inputCls} placeholder="Clube Lions ao qual é vinculado" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Data de Nascimento</label>
              <input {...register('dataNascimento')} className={inputCls} placeholder="DD/MM/AAAA" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" {...register('email')} className={inputCls} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>Endereço</label>
            <input {...register('endereco')} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Cidade</label>
              <input {...register('cidade')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>CEP</label>
              <input {...register('cep')} className={inputCls} placeholder="00000-000" />
            </div>
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
