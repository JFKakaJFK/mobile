import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import de from '../_locales/de.json'
import en from '../_locales/en.json'

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  },
  resources: {
    de,
    en
  }
})

export default i18n