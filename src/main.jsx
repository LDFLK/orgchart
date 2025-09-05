import App from "./App.jsx";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/store";

import { ThemeProvider as CustomThemeProvider } from "./themeContext.jsx";
import { ThemeProvider as MUIThemeProvider, createTheme } from "@mui/material/styles";
import { BadgeProvider } from "./badgeContext.jsx";

const theme = createTheme({
  palette: {
    mode: "light", // or "dark"
    background: {
      default: "#ffffff",
    },
    text: {
      primary: "#000000",
    },
    primary: {
      main: "#1976d2",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  //<React.StrictMode>
    <Provider store={store}>
      <CustomThemeProvider>
        <MUIThemeProvider theme={theme}>
          <BadgeProvider>
            <App />
          </BadgeProvider>
        </MUIThemeProvider>
      </CustomThemeProvider>
    </Provider>
//  </React.StrictMode>
);
