export default {
  generateRandomDigits(length) {
    const chars = "abcdefghijkmnpqrstufwxyzABCDEFGHIJKLMNOPQRSTUFWXYZ23456789";
    let result = "";
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
  }
};
