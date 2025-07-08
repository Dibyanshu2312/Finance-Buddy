import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Finance Buddy",
  description: "Your personal finance assistant",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          {/* header */}
          <Header />
          <main className="min-h-screen">{children}</main>
          {/* footer */}
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto text-center text-grey-600">
              <p>Made with Love By Dibyanshu</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
