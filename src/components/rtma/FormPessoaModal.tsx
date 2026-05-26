'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pessoaRtmaSchema, PessoaRtmaFormData } from '@/schemas/rtma.schema'
import { useCreatePessoa, useUpdatePessoa } from '@/hooks/useRtma'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const TIPOS = ['Associado LEO', 'Pré LEO', 'Associado LEO/Leão', 'Associado LEO e LEO/Leão', 'Amigo LEO', 'Amigo LEO e LEO/Leão']
const STATUS = ['Ativo', 'Inativo', 'Transferido', 'Desligado', 'Pós-ativo']

interface Props {
  open: boolean
  onClose: () => void
  pessoa?: any
}

export function FormPessoaModal({ open, onClose, pessoa }: Props) {
  const isEditing = !!pessoa
  const create = useCreatePessoa()
  const update = useUpdatePessoa()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PessoaRtmaFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pessoaRtmaSchema) as any,
    defaultValues: { nome: '', status: 'Ativo' },
  })

  useEffect(() => {
    if (pessoa) {
      reset({
        nome: pessoa.nome ?? '',
        status: pessoa.status ?? 'Ativo',
        tipo: pessoa.tipo ?? '',
        numeroAssociado: pessoa.numeroAssociado ?? '',
        cargo: pessoa.cargo ?? '',
        formacao: pessoa.formacao ?? '',
        profissao: pessoa.profissao ?? '',
        telefone: pessoa.telefone ?? '',
        email: pessoa.email ?? '',
        logradouro: pessoa.logradouro ?? '',
        cidade: pessoa.cidade ?? '',
        cep: pessoa.cep ?? '',
        dataNascimento: pessoa.dataNascimento ? pessoa.dataNascimento.split('T')[0] : '',
        associadoDesde: pessoa.associadoDesde ? pessoa.associadoDesde.split('T')[0] : '',
        dataDesligamento: pessoa.dataDesligamento ? pessoa.dataDesligamento.split('T')[0] : '',
        dataPosseLions: pessoa.dataPosseLions ? pessoa.dataPosseLions.split('T')[0] : '',
        dataInicioPreLeo: pessoa.dataInicioPreLeo ? pessoa.dataInicioPreLeo.split('T')[0] : '',
        acaoTrimestre: pessoa.acaoTrimestre ?? '',
        foraneo: pessoa.foraneo ?? false,
        restricaoAlimentar: pessoa.restricaoAlimentar ?? '',
      })
    } else {
      reset({ nome: '', status: 'Ativo' })
    }
  }, [pessoa, reset, open])

  async function onSubmit(data: PessoaRtmaFormData) {
    try {
      if (isEditing) {
        await update.mutateAsync({ id: pessoa.id, data })
      } else {
        await create.mutateAsync(data)
      }
      onClose()
    } catch {
      alert('Erro ao salvar membro.')
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Membro' : 'Novo Membro'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelCls}>Nome *</label>
            <input {...register('nome')} className={inputCls} placeholder="Nome completo" />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tipo</label>
              <select {...register('tipo')} className={inputCls}>
                <option value="">Selecione...</option>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select {...register('status')} className={inputCls}>
                {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nº Associado</label>
              <input {...register('numeroAssociado')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cargo</label>
              <input {...register('cargo')} className={inputCls} />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Telefone</label>
              <input {...register('telefone')} className={inputCls} placeholder="(xx) xxxxx-xxxx" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" {...register('email')} className={inputCls} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>Logradouro</label>
            <input {...register('logradouro')} className={inputCls} />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Data de Nascimento</label>
              <input type="date" {...register('dataNascimento')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Associado Desde</label>
              <input type="date" {...register('associadoDesde')} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Início como Pré-LEO</label>
              <input type="date" {...register('dataInicioPreLeo')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Posse no Lions</label>
              <input type="date" {...register('dataPosseLions')} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Data de Desligamento</label>
            <input type="date" {...register('dataDesligamento')} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Restrição Alimentar</label>
            <input {...register('restricaoAlimentar')} className={inputCls} placeholder="Descreva se houver" />
          </div>

          <div>
            <label className="flex items-center text-sm gap-2">
              <input type="checkbox" {...register('foraneo')} />
              Membro forâneo (de outro clube)
            </label>
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
