import {
  createContext,
  createSignal,
  useContext,
  type Accessor,
  type ParentComponent,
} from 'solid-js';

import {
  type Language,
  type TranslationKey,
  translations,
} from './translations';

interface LanguageContextType {
  language: Accessor<Language>;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>();

export const LanguageProvider: ParentComponent = props => {
  const [language, setLanguage] = createSignal<Language>(
    localStorage.getItem('language') === 'zh' ? 'zh' : 'en',
  );

  const changeLanguage = (lang: Language): void => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: TranslationKey): string => translations[language()][key];

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: changeLanguage, t }}
    >
      {props.children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
