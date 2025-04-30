import { createContext, useContext, ParentComponent } from "solid-js";
import { createStore } from "solid-js/store";
import { Language, TranslationKey, translations } from "./translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType>();

export const LanguageProvider: ParentComponent = (props) => {
  const [state, setState] = createStore({
    language: (localStorage.getItem("language") as Language) || "en",
  });

  const setLanguage = (lang: Language) => {
    setState({ language: lang });
    localStorage.setItem("language", lang);
  };

  const t = (key: TranslationKey) => translations[state.language][key];

  return (
    <LanguageContext.Provider
      value={{
        language: state.language,
        setLanguage,
        t,
      }}
    >
      {props.children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
