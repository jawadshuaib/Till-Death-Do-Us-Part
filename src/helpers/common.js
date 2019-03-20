import CryptoJS from "crypto-js";

export default {
  generateRandomDigits(length) {
    const chars = "abcdefghijkmnpqrstufwxyzABCDEFGHIJKLMNOPQRSTUFWXYZ23456789";
    let result = "";
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
  },
  encryptSHA256(str) {
    return CryptoJS.SHA256(str).toString();
  },
  encryptAES(str, key) {
    return CryptoJS.AES.encrypt(str, key).toString();
  }
};
