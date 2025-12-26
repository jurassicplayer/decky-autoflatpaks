import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en_US from "./en-US.json"

const i18start = (async ()=>i18n
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      'en-US': en_US
    },
    lng: "en-US"
  })
)
export default i18start