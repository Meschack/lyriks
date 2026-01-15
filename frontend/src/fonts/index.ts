import localFont from "next/font/local";

const sfPro = localFont({
  src: [
    {
      path: "./sf-pro-display/regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./sf-pro-display/semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./sf-pro-display/bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
});

export { sfPro };
