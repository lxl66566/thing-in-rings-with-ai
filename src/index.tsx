/* @refresh reload */
import { render } from "solid-js/web";
import { Toaster } from "solid-toast";

import "./index.css";
import App from "./App";
import { LanguageProvider } from "./i18n/LanguageContext";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?");
}

render(
  () => (
    <LanguageProvider>
      <App />
      <Toaster position="bottom-right" gutter={8} />
    </LanguageProvider>
  ),
  root!,
);
