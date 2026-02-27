import Header from "./Header";

import "../style/main.css";

export default function Main({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
