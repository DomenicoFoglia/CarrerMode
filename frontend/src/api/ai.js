import api from './axios'

export const analyzeOffer = (offerText) =>
    api.post('/ai/analyze-offer', { offer_text: offerText })

export const generateCoverLetter = (data) =>
    api.post('/ai/generate-cover-letter', data)