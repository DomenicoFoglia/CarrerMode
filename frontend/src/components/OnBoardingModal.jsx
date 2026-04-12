import { useState } from 'react'
import { useTranslation } from 'react-i18next'
// import { useNavigate } from 'react-router-dom'
import { completeOnboarding } from '../api/user'
import useAuthStore from '../store/authStore'
import './OnboardingModal.css'

function OnboardingModal({ onClose }) {
    const { t } = useTranslation();
    // const navigate = useNavigate()
    const { user, setUser } = useAuthStore();
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: '🦅',
            title: t('onboarding.step1_title'),
            desc: t('onboarding.step1_desc'),
        },
        {
            icon: '📋',
            title: t('onboarding.step2_title'),
            desc: t('onboarding.step2_desc'),
        },
        {
            icon: '🔔',
            title: t('onboarding.step3_title'),
            desc: t('onboarding.step3_desc'),
        },
        {
            icon: '🚀',
            title: t('onboarding.step4_title'),
            desc: t('onboarding.step4_desc'),
        },
    ];

    const handleFinish = async () => {
        try {
            await completeOnboarding();
            setUser({ ...user, onboarding_completed: true });
        } catch (error) {
            console.error('errore onboarding:', error);
        }
        onClose();
    }

    const handleSkip = async () => {
        await handleFinish()
    }

    const current = steps[step]
    const isLast = step === steps.length - 1

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-modal">

                {/* Header con skip */}
                <div className="onboarding-header">
                    <div className="onboarding-steps">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`onboarding-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
                            />
                        ))}
                    </div>
                    <button className="onboarding-skip" onClick={handleSkip}>
                        {t('onboarding.skip')} ×
                    </button>
                </div>

                {/* Contenuto */}
                <div className="onboarding-body">
                    <div className="onboarding-icon">{current.icon}</div>
                    <h2 className="onboarding-title">{current.title}</h2>
                    <p className="onboarding-desc">{current.desc}</p>
                </div>

                {/* Footer navigazione */}
                <div className="onboarding-footer">
                    <button
                        className="onboarding-btn-ghost"
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 0}
                    >
                        {t('onboarding.prev')}
                    </button>

                    {isLast ? (
                        <button className="onboarding-btn-primary" onClick={handleFinish}>
                            {t('onboarding.finish')} 🎉
                        </button>
                    ) : (
                        <button className="onboarding-btn-primary" onClick={() => setStep(s => s + 1)}>
                            {t('onboarding.next')} →
                        </button>
                    )}
                </div>

            </div>
        </div>
    )
}

export default OnboardingModal