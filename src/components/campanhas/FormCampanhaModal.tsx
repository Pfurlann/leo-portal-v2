'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { campanhaSchema, CampanhaFormData } from '@/schemas/campanha.schema'
import { useCreateCampanha, useUpdateCampanha } from '@/hooks/useCampanhas'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const EIXOS = [
  'Serviço à comunidade',
  'Saúde',
  'Meio ambiente',
  'Desenvolvimento jovem',
  'Responsabilidade social',
  'Alívio à fome',
  'Visão',
  'Diabetes',
  'Outro',
]

interface Props {
  open: boolean
  onClose: () => void
  campanha?: any
}

export function FormCampanhaModal({ open, onClose, campanha }: Props) {
  const isEditing = !!campanha
  const create = useCreateCampanha()
  const update = useUpdateCampanha()

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<CampanhaFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(campanhaSchema) as any,
    defaultValues: {
      titulo: '',
      temParceria: false,
    },
  })

  useEffect(() => {
    if (campanha) {
      reset({
        titulo: campanha.titulo ?? '',
        objetivo: campanha.objetivo ?? '',
        eixoD8: campanha.eixoD8 ?? '',
        al: campanha.al ?? '',
        trimestre: campanha.trimestre ?? '',
        dataInicio: campanha.dataInicio ? campanha.dataInicio.split('T')[0] : '',
        dataFim: campanha.dataFim ? campanha.dataFim.split('T')[0] : '',
        coordenador: campanha.coordenador ?? '',
        comissao: campanha.comissao ?? '',
        pessoasImpactadas: campanha.pessoasImpactadas ?? 0,
        custoCampanha: Number(campanha.custoCampanha) ?? 0,
        descricaoCampanha: campanha.descricaoCampanha ?? '',
        fotoOficialUrl: campanha.fotoOficialUrl ?? '',
        videoUrl: campanha.videoUrl ?? '',
        temParceria: campanha.temParceria ?? false,
        entidadeParceira: campanha.entidadeParceira ?? '',
        divulgacao: campanha.divulgacao ?? '',
        feedback: campanha.feedback ?? '',
      })
    } else {
      reset({ titulo: '', temParceria: false })
    }
  }, [campanha, reset, open])

  const temParceria = watch('temParceria')

  async function onSubmit(data: CampanhaFormData) {
    try {
      if (isEditing) {
        await update.mutateAsync({ id: campanha.id, data })
      } else {
        await create.mutateAsync(data)
      }
      onClose()
    } catch {
      alert('Erro ao salvar campanha.')
    }
  }

  const fieldStyle = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #dee2e6',
    borderRadius: 5,
    fontSize: 14,
    boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    display: 'block',
    marginBottom: 4,
    fontSize: 13,
    fontWeight: 500 as const,
    color: '#374151',
  }
  const groupStyle = { marginBottom: 16 }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Campanha' : 'Nova Campanha'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} style={{ paddingTop: 8 }}>
          {/* Basic info */}
          <div style={groupStyle}>
            <label style={labelStyle}>Título *</label>
            <input {...register('titulo')} style={fieldStyle} placeholder="Título da campanha" />
            {errors.titulo && <span style={{ fontSize: 12, color: '#dc3545' }}>{errors.titulo.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...groupStyle }}>
            <div>
              <label style={labelStyle}>Eixo</label>
              <select {...register('eixoD8')} style={fieldStyle}>
                <option value="">Selecione...</option>
                {EIXOS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Objetivo</label>
              <input {...register('objetivo')} style={fieldStyle} placeholder="Objetivo da campanha" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...groupStyle }}>
            <div>
              <label style={labelStyle}>Data Início</label>
              <input type="date" {...register('dataInicio')} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Data Fim</label>
              <input type="date" {...register('dataFim')} style={fieldStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...groupStyle }}>
            <div>
              <label style={labelStyle}>Coordenador</label>
              <input {...register('coordenador')} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>AL</label>
              <input {...register('al')} style={fieldStyle} placeholder="2025-2026" />
            </div>
          </div>

          {/* Numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, ...groupStyle }}>
            <div>
              <label style={labelStyle}>Pessoas Impactadas</label>
              <input type="number" min={0} {...register('pessoasImpactadas')} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Custo (R$)</label>
              <input type="number" min={0} step="0.01" {...register('custoCampanha')} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Presentes (qtd)</label>
              <input type="number" min={0} {...register('qtdAssociadosPresentes')} style={fieldStyle} />
            </div>
          </div>

          {/* Description */}
          <div style={groupStyle}>
            <label style={labelStyle}>Descrição da Campanha</label>
            <textarea {...register('descricaoCampanha')} rows={4} style={fieldStyle} placeholder="Descreva a campanha..." />
          </div>

          {/* Media */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...groupStyle }}>
            <div>
              <label style={labelStyle}>URL Foto Oficial</label>
              <input {...register('fotoOficialUrl')} style={fieldStyle} placeholder="https://..." />
            </div>
            <div>
              <label style={labelStyle}>URL Vídeo</label>
              <input {...register('videoUrl')} style={fieldStyle} placeholder="https://..." />
            </div>
          </div>

          {/* Partnership */}
          <div style={groupStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" {...register('temParceria')} />
              Teve parceria com outra organização?
            </label>
          </div>

          {temParceria && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...groupStyle }}>
              <div>
                <label style={labelStyle}>Entidade Parceira</label>
                <input {...register('entidadeParceira')} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tipo de Parceria</label>
                <input {...register('tipoParceria')} style={fieldStyle} />
              </div>
            </div>
          )}

          {/* Divulgacao / feedback */}
          <div style={groupStyle}>
            <label style={labelStyle}>Divulgação</label>
            <textarea {...register('divulgacao')} rows={2} style={fieldStyle} />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Campanha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
