import { useTranslation } from 'react-i18next'
import './ConfirmModal.css'

function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
    const { t } = useTranslation()

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn-cancel" onClick={onCancel}>
                        {t('common.cancel')}
                    </button>
                    <button className="modal-btn-confirm" onClick={onConfirm}>
                        {t('common.delete')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal