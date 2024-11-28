import { createContext, useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Alert } from "react-native";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const prettify = true;

   const [isAuthenticated, setIsAuthenticated] = useState(false);

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [storeName, setStoreName] = useState("");
   const [user, setuser] = useState("");

   // Emulator
   // const baseURL = "http://10.0.2.2:9029";

   // Physical Device
   const baseURL = "http://192.168.1.6:9029";

   const api = axios.create({
      baseURL,
   });

   // Function to handle login, store token, and retrieve token
   async function handleLogin(email, password, storeName) {
      try {
         const loginRequest = {
            email,
            password,
            storeName,
         };
         const response = await axios.post(
            `${baseURL}/api/auth/login`,
            loginRequest
         );

         // Adjust for the typo in the response
         const accessToken = response.data.accessToken;

         if (!accessToken) {
            throw new Error("No access token in response");
         } else {
            console.log("Access token:", accessToken);
         }

         await AsyncStorage.setItem("token", accessToken);

         setEmail(email);
         setPassword(password);
         setStoreName(storeName);
         setuser(response.data.user);

         // timeout for 1 sec then set isAuthenticated to true
         setTimeout(() => {
            setIsAuthenticated(true);
         }, 500);

         return { accessToken };
      } catch (error) {
         console.error("Authentication failed", error);
         Alert.alert("Error", "Invalid credentials. Please try again.");
      }
   }

   // Function to handle logout
   async function handleLogout() {
      try {
         await AsyncStorage.removeItem("token"); // Clear the token
         setIsAuthenticated(false);
      } catch (error) {
         console.error("Failed to logout", error);
      }
   }

   function setAuthorizationHeader() {
      api.interceptors.request.use(
         async (config) => {
            try {
               const token = await AsyncStorage.getItem("token");
               if (token) {
                  config.headers.Authorization = `Bearer ${token}`;
               }
               return config;
            } catch (error) {
               console.error("Failed to set Authorization header", error);
               return Promise.reject(error);
            }
         },
         (error) => {
            console.error("Request interceptor error", error);
            return Promise.reject(error);
         }
      );
   }

   // Functions to fetch data from the API
   async function getData(endpoint) {
      try {
         setAuthorizationHeader();
         const response = await api.get(endpoint);
         console.log("GET:", endpoint);
         if (prettify) {
            console.log(JSON.stringify(response.data, null, 2));
         } else {
            console.log(response.data);
         }
         console.log();
         return response.data;
      } catch (error) {
         console.error(
            `Failed to fetch protected data from ${endpoint}`,
            error.message
         );
      }
   }

   // Function to post data to the API
   async function postData(endpoint, data = {}) {
      try {
         const response = await api.post(endpoint, data);
         console.log("POST:", endpoint);
         if (prettify) {
            console.log(JSON.stringify(data, null, 2));
            console.log(JSON.stringify(response.data, null, 2));
         } else {
            console.log(response.data);
         }
         console.log();
         return response.data;
      } catch (error) {
         console.error(
            `Failed to post protected data to ${endpoint}`,
            error.message
         );
      }
   }

   // Function to delete data from the API
   async function deleteData(endpoint, data = {}) {
      try {
         const response = await api.delete(endpoint, data);
         console.log(JSON.stringify(response.data, null, 2));
         return response.data;
      } catch (error) {
         console.error(`Failed to delete protected data to ${endpoint}`, error);
         throw error;
      }
   }

   // Compare the structure of two objects
   function compareStructure(obj1, obj2) {
      // Check if both arguments are objects
      if (
         typeof obj1 === "object" &&
         obj1 !== null &&
         typeof obj2 === "object" &&
         obj2 !== null
      ) {
         // Get the keys of both objects
         const keys1 = Object.keys(obj1);
         const keys2 = Object.keys(obj2);

         // Check if the number of keys is the same
         if (keys1.length !== keys2.length) {
            return false;
         }

         // Check if all keys are present in both objects and their nested structures match
         for (const key of keys1) {
            if (
               !keys2.includes(key) ||
               !compareStructure(obj1[key], obj2[key])
            ) {
               return false;
            }
         }

         return true;
      } else {
         // If both arguments are not objects, return true since we are only comparing structure
         return true;
      }
   }

   return (
      <AuthContext.Provider
         value={{
            // Values
            storeName,
            email,
            password,
            user,
            isAuthenticated,

            // Functions
            handleLogin,
            handleLogout,
            getData,
            postData,
            deleteData,
            compareStructure,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
};
