// export const formatPrice = (price: number): string => {
//   return `${price.toLocaleString('vi-VN')}đ/tháng`;
// };

export const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}tr`;
  }
  return `${price.toLocaleString('vi-VN')}đ`;
};