import { AnimatePresence, motion } from 'framer-motion'
import { LockKeyhole, X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export const spring = { type: 'spring' as const, stiffness: 300, damping: 25 }

export function SoftButton({
  children,
  className = '',
  onClick,
  label,
  type = 'button',
  disabled = false,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  label?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <motion.button
      type={type}
      aria-label={label}
      className={`soft-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.97,
              boxShadow: 'inset 5px 5px 10px #d1c9be, inset -5px -5px 10px #ffffff',
            }
      }
      transition={spring}
    >
      {children}
    </motion.button>
  )
}

export function Spinner({ label = 'Загрузка' }: { label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />
}

export function LoadingPage({ text = 'Загрузка…' }: { text?: string }) {
  return (
    <div className="page-loading">
      <Spinner />
      <span>{text}</span>
    </div>
  )
}

export function EmptyState({
  title,
  text,
  icon,
}: {
  title: string
  text?: string
  icon?: ReactNode
}) {
  return (
    <div className="empty-state">
      {icon}
      <strong>{title}</strong>
      {text && <span>{text}</span>}
    </div>
  )
}

export function Modal({
  kicker,
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  kicker?: string
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.div
          className={`entry-modal ${wide ? 'entry-modal-wide' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={spring}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="modal-title">
            <div>
              {kicker && <span className="section-index">{kicker}</span>}
              <h2>{title}</h2>
            </div>
            <SoftButton className="icon-button" onClick={onClose} label="Закрыть">
              <X size={19} />
            </SoftButton>
          </div>
          {children}
          {footer && <div className="modal-actions">{footer}</div>}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

export function ConfirmDialog({
  title,
  text,
  confirmLabel = 'Удалить',
  onConfirm,
  onCancel,
  busy = false,
}: {
  title: string
  text: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}) {
  return (
    <Modal
      kicker="ПОДТВЕРЖДЕНИЕ"
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="text-button" onClick={onCancel} disabled={busy}>
            Отмена
          </button>
          <SoftButton className="save-button danger-button" onClick={onConfirm} disabled={busy}>
            {busy ? 'Удаляем…' : confirmLabel}
          </SoftButton>
        </>
      }
    >
      <p className="modal-copy">{text}</p>
    </Modal>
  )
}

export function VisibilityBadge({ visibility }: { visibility: 'public' | 'private' }) {
  return (
    <span className={`visibility-badge visibility-${visibility}`}>
      {visibility === 'private' && <LockKeyhole size={12} />}
      {visibility === 'private' ? 'Приватный' : 'Публичный'}
    </span>
  )
}
