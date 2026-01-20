import { Box } from "@mui/material";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <Header />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch", // Ensure content takes width
          justifyContent: "flex-start", // Top align
        }}
      >
        {children}
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        <Footer />
      </Box>
    </Box>
  );
}
