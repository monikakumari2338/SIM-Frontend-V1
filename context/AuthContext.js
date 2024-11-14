import { createContext, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CredentialsContext = createContext();

export const CredentialsProvider = ({ children }) => {
   const [storeName, setStoreName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [userName, setUserName] = useState("Monika");

   const baseURL = "http://10.0.2.2:9029";

   const showToken = true;
   const prettify = true;

   // Function to retrieve the token
   async function getToken() {
      try {
         let token = await AsyncStorage.getItem("token");
         if (!token) {
            const { accessToken } = await handleLogin();
            token = accessToken;
         }
         if (showToken) {
            console.log("Token:", token);
         }

         return token;
      } catch (error) {
         console.error("Failed to get the token", error);
         throw error;
      }
   }

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
         }

         await AsyncStorage.setItem("token", accessToken);

         setEmail(email);
         setPassword(password);
         setStoreName(storeName);

         return { accessToken };
      } catch (error) {
         console.error("Authentication failed", error);
         throw error;
      }
   }

   // Axios instance with interceptor to add the token to headers
   const api = axios.create({
      baseURL,
   });
   api.interceptors.request.use(
      async (config) => {
         try {
            const token = await getToken();
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

   // Functions to fetch data from the API
   async function getData(endpoint) {
      try {
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
      <CredentialsContext.Provider
         value={{
            // Values

            storeName,
            setStoreName,
            email,
            setEmail,
            password,
            setPassword,
            userName,
            setUserName,

            // Functions

            handleLogin,
            getData,
            postData,
            deleteData,
            compareStructure,
         }}
      >
         {children}
      </CredentialsContext.Provider>
   );
};
