function compressText(text, len) {
   return text.length > len ? text.substring(0, len) + "..." : text;
}

export { compressText };
