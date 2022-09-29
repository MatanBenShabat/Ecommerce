import { Route, Routes } from "react-router";
import "./App.css";
import ContactUs from "./Core-Components/Contact-Us/ContactUs";
import HomePage from "./Core-Components/Home-page/HomePage";
import Login from "./Core-Components/Login/LoginPage";
import NavBar from "./Core-Components/Nav-Bar/NavBar";
import Products from "./Core-Components/Products/Products";
import Register from "./Core-Components/Register/Register";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <NavBar></NavBar>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact-us" element={<ContactUs />} />
        </Routes>
      </div>
    </QueryClientProvider>
  );
}

export default App;
