import Footer from "./Footer";
import Header from "./Header";

export default function HeaderFooter({ children }) {
   return (
      <>
         <Header />
         {children}
         <Footer />
      </>
   );
}
