import api from './axios'

export const analyzeOffer = (offerText, provider = null) =>
    api.post('/ai/analyze-offer', {
        offer_text: offerText,
        ...(provider && { provider_override: provider })
    })

export const generateCoverLetter = (data, provider = null) =>
    api.post('/ai/generate-cover-letter', {
        ...data,
        ...(provider && { provider_override: provider })
    })