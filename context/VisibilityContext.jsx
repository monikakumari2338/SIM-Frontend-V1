// This is the visibility context for managing the visibility of the overlays and modals in the app.
import { useState } from "react";
import { createContext, useContext } from "react";

const VisibilityContext = createContext();

export const useVisibility = () => {
   return useContext(VisibilityContext);
};

export const VisibilityProvider = ({ children }) => {
   const [submitOptions, setSubmitOptions] = useState(false);

   function toggleSubmitOptionsVisibility() {
      setSubmitOptions(!submitOptions);
   }

   return (
      <VisibilityContext.Provider
         value={{
            submitOptions,
            setSubmitOptions,
            toggleSubmitOptionsVisibility,
         }}
      >
         {children}
      </VisibilityContext.Provider>
   );
};

export default VisibilityContext;
