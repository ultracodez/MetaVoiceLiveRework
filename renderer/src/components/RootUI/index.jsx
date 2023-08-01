import { Toaster, toast } from "react-hot-toast";

export default function Root({ children }) {
  return (
    <>
      <Toaster
        toastOptions={{
          style: { background: "rgb(71 85 105)", color: "white" },
          iconTheme: { secondary: "rgb(71 85 105)" },
          duration: 5000,
        }}
      />
      {children}
    </>
  );
}
export { Root };
