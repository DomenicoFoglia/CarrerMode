import React, { useEffect, useState } from 'react';
import './Reminders.css';
import './Applications.css';
import { getReminders, createReminder, updateReminder, deleteReminder } from '../api/reminders';
import { getApplications } from '../api/applications';
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import ConfirmModal from '../components/ConfirmModal'

function Reminders() {
    const { t } = useTranslation();
    const [reminders, setReminders] = useState([]);
    const [applications, setApplications] = useState([]);
    const [expandedId, setExpandedId] = useState(null); // Stato per l'accordion
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState(null);

    const [formData, setFormData] = useState({
        id: null,
        title: '',
        remind_at: '',
        application_id: '',
        notes: '',
        sent: false
    });

    const toggleRow = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resReminders, resApps] = await Promise.all([
                getReminders(),
                getApplications()
            ]);
            setReminders(resReminders.data.data || resReminders.data);
            setApplications(resApps.data.data || resApps.data);
        } catch (error) {
            console.error("Errore nel caricamento!", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                // MODIFICA
                await updateReminder(formData.id, formData);
            } else {
                // CREAZIONE
                await createReminder(formData.application_id, formData);
            }
            // RESET FORM
            setFormData({ title: '', remind_at: '', application_id: '', notes: '', sent: false });
            await fetchData(); // Ricarichiamo i dati aggiornati
        } catch (error) {
            console.error("Errore nel salvataggio:", error);
            toast.error(t('common.error'));
        }
    };

    const handleDelete = (id) => {
        setReminderToDelete(id);
        setConfirmOpen(true);
    }

    const handleDeleteConfirmed = async () => {
        setConfirmOpen(false)
        try {
            await deleteReminder(reminderToDelete)
            setReminders(reminders.filter(r => r.id !== reminderToDelete))
            if (expandedId === reminderToDelete) setExpandedId(null)
        } catch (error) {
            toast.error(t('common.error'))
        } finally {
            setReminderToDelete(null)
        }
    }

    const handleEdit = (reminder) => {
        setFormData({
            id: reminder.id,
            title: reminder.title,
            application_id: reminder.application_id,
            remind_at: reminder.remind_at.replace(' ', 'T').substring(0, 16),
            notes: reminder.notes || '',
            sent: reminder.sent
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return <div className="loading">{t('common.loading')}</div>;

    return (
        <div className='applications-container'>
            <div className="apps-header">
                <h1>{t('reminders.title')}</h1>
            </div>

            <div className="reminder-form-card">
                <form onSubmit={handleSubmit} className="modern-form">
                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label>
                                {t('reminders.reminder_title')}
                                {formData.id && <span style={{ color: '#3b82f6' }}> ({t('reminders.edit_title')})</span>}
                            </label>
                            <input
                                type="text"
                                placeholder="Esempio: Chiamata conoscitiva"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group flex-1">
                            <label>{t('reminders.application')}</label>
                            <select
                                value={formData.application_id}
                                onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                                required
                            >
                                <option value="">{t('common.select')}</option>
                                {applications.map(app => (
                                    <option key={app.id} value={app.id}>{app.company}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group flex-1">
                            <label>{t('reminders.remind_at')}</label>
                            <input
                                type="datetime-local"
                                value={formData.remind_at}
                                onChange={(e) => setFormData({ ...formData, remind_at: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-3">
                            <label>{t('reminders.notes')}</label>
                            <textarea
                                placeholder="Dettagli extra..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="2"
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('applications.col_status')}</label>
                            <div className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={formData.sent}
                                    onChange={(e) => setFormData({ ...formData, sent: e.target.checked })}
                                />
                                <span>{formData.sent ? t('reminders.sent') : t('sidebar.waiting')}</span>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-add">
                                {formData.id ? t('reminders.save') : t('reminders.save')}
                            </button>
                            {formData.id && (
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setFormData({ id: null, title: '', remind_at: '', application_id: '', notes: '', sent: false })}
                                    style={{ marginLeft: '10px', background: '#334155' }}
                                >
                                    {t('reminders.cancel')}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {reminders.length > 0 ? (
                <div className="table-container">
                    <table className="apps-table">
                        <thead>
                            <tr>
                                <th>{t('reminders.reminder_title')}</th>
                                <th>{t('reminders.application')}</th>
                                <th>{t('reminders.remind_at')}</th>
                                <th style={{ textAlign: 'center' }}>{t('applications.col_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reminders.map((reminder) => (
                                <React.Fragment key={reminder.id}>
                                    <tr className={expandedId === reminder.id ? 'row-expanded' : ''}>
                                        <td className="company-name" onClick={() => toggleRow(reminder.id)} style={{ cursor: 'pointer' }}>
                                            {expandedId === reminder.id ? '▼ ' : '▶ '}{reminder.title}
                                        </td>
                                        <td>{reminder.application?.company || 'N/A'}</td>
                                        <td>{new Date(reminder.remind_at).toLocaleString('it-IT')}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="action-cell">
                                                <span className={`status-badge ${reminder.sent ? 'sent' : 'waiting'}`}>
                                                    {reminder.sent ? t('reminders.sent') : t('sidebar.waiting')}
                                                </span>
                                                <button className="btn-icon edit" title={t('reminders.edit')} onClick={() => handleEdit(reminder)}>✏️</button>
                                                <button className="btn-icon delete" title={t('reminders.delete')} onClick={() => handleDelete(reminder.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedId === reminder.id && (
                                        <tr className="notes-accordion-row">
                                            <td colSpan="4">
                                                <div className="notes-content">
                                                    <strong>{t('reminders.notes')}:</strong>
                                                    <p>{reminder.notes || t('application_detail.no_notes')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <p>{t('reminders.empty')}</p>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmOpen}
                message={t('reminders.confirm_delete')}
                onConfirm={handleDeleteConfirmed}
                onCancel={() => { setConfirmOpen(false); setReminderToDelete(null) }}
            />

        </div>
    );
}

export default Reminders;