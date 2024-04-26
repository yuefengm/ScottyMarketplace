import React, { Fragment } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Header from "../components/Header";
import Home from "./Home";
import Shop from "./Shop";
import Login from "./Login";
import Sell from "./Sell";
import Cart from "./Cart";
import About from "./About";
import Register from "./Register";
import MyProfile from "./myProfile";
import OtherProfile from "./otherProfile";
import ItemDetail from "./ItemDetail";
import Chat from "./Chat";
import ChatList from "./ChatList";

import { PayPalScriptProvider} from "@paypal/react-paypal-js";

const App = () => {
    return (
        <PayPalScriptProvider options={{ "client-id": "ASahS5l7hSmT5Hn7S6XI7ox3l3PqSXkIHOL1sMoIWPkURC6fB9_pTOgUh4qdIGbmHcHg9cu1yDWFovhK" }}>
        <Router>
            <Header />
            <Toaster position="top-center" />
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route path="/home" element={<Home />}></Route>
                <Route path="/shop" element={<Shop />}></Route>
                <Route path="/shop/category/:categoryId" element={<Shop />}></Route>
                <Route path="/shop/product/:productId" element={<ItemDetail />}></Route>
                <Route path="/sell" element={<Sell />}></Route>
                <Route path="/cart" element={<Cart />}></Route>
                <Route path="/about" element={<About />}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/register" element={<Register />}></Route>
                <Route path="/myprofile" element={<MyProfile />} ></Route>
                <Route path="/profile/:userId" element={<OtherProfile />}></Route>
                <Route path="/item/:itemId" element={<ItemDetail />}></Route>
                <Route path="/chat/:chatId" element={<Chat />}></Route>
                <Route path="/chats" element={<ChatList />}></Route>
            </Routes>
        </Router>
        </PayPalScriptProvider>
    );
};

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);
