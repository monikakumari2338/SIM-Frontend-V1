import React from "react";
import { ImageBackground, StyleSheet } from "react-native";

export default function WithBackground(WrappedComponent) {
   return (props) => (
      <ImageBackground source={require("./bg3.jpg")} style={styles.background}>
         <WrappedComponent {...props} />
      </ImageBackground>
   );
}

const styles = StyleSheet.create({
   background: {
      width: "100%",
      height: "100%",
   },
});
