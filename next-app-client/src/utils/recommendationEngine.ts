// import { RoomDetail } from "@/types/types";

// export interface RecommendationResult {
//   recommendedRoom: RoomDetail;
//   reason: string;
//   saveMoney?: number;
//   isCheaperWithSimilarQuality: boolean;
//   valuePerPrice1: number;
//   valuePerPrice2: number;
// }

// export function recommendRoom(
//   room1: RoomDetail,
//   room2: RoomDetail
// ): RecommendationResult {
//   const priceDiff = Math.abs(room1.priceMonth - room2.priceMonth);
//   const areaDiff = Math.abs((room1.area || 0) - (room2.area || 0));
  
//   const convenientsCount1 = room1.convenients?.length || 0;
//   const convenientsCount2 = room2.convenients?.length || 0;
//   const convenientsCountDiff = Math.abs(convenientsCount1 - convenientsCount2);

//   // Tính "Value Score" = Diện tích + (Tiện nghi × weight)
//   const valueScore1 = (room1.area || 0) + convenientsCount1 * 5;
//   const valueScore2 = (room2.area || 0) + convenientsCount2 * 5;
//   const valueDiff = Math.abs(valueScore1 - valueScore2);

//   const cheaperRoom = room1.priceMonth < room2.priceMonth ? room1 : room2;
//   const expensiveRoom = room1.priceMonth > room2.priceMonth ? room1 : room2;
//   const priceGap = Math.abs(room1.priceMonth - room2.priceMonth);

//   // Tính Value per Price
//   const valuePerPrice1 = valueScore1 / (room1.priceMonth || 1);
//   const valuePerPrice2 = valueScore2 / (room2.priceMonth || 1);

//   // **LOGIC ĐỀ XUẤT**

//   // Case 1: Giá chênh lệch nhỏ (< 500k) + Value gần bằng (< 10 điểm)
//   if (priceDiff < 500000 && valueDiff < 10) {
//     return {
//       recommendedRoom: cheaperRoom,
//       reason: `💰 Tiết kiệm ${formatPrice(priceGap)}/tháng với chất lượng tương tự`,
//       saveMoney: priceGap,
//       isCheaperWithSimilarQuality: true,
//       valuePerPrice1,
//       valuePerPrice2,
//     };
//   }

//   // Case 2: Giá chênh lệch lớn (≥ 500k) + Value chênh lệch lớn (≥ 10 điểm)
//   if (priceDiff >= 500000 && valueDiff >= 10) {
//     if (valuePerPrice1 > valuePerPrice2) {
//       return {
//         recommendedRoom: room1,
//         reason: `✨ Giá trị tốt hơn: ${valuePerPrice1.toFixed(2)} giá trị/đồng vs ${valuePerPrice2.toFixed(2)}`,
//         isCheaperWithSimilarQuality: false,
//         valuePerPrice1,
//         valuePerPrice2,
//       };
//     } else {
//       return {
//         recommendedRoom: room2,
//         reason: `✨ Giá trị tốt hơn: ${valuePerPrice2.toFixed(2)} giá trị/đồng vs ${valuePerPrice1.toFixed(2)}`,
//         isCheaperWithSimilarQuality: false,
//         valuePerPrice1,
//         valuePerPrice2,
//       };
//     }
//   }

//   // Case 3: Mặc định - so sánh Value per Price
//   if (valuePerPrice1 > valuePerPrice2) {
//     return {
//       recommendedRoom: room1,
//       reason: `🏆 Cung cấp giá trị tốt nhất so với giá tiền`,
//       isCheaperWithSimilarQuality: valuePerPrice1 > valuePerPrice2,
//       valuePerPrice1,
//       valuePerPrice2,
//     };
//   } else {
//     return {
//       recommendedRoom: room2,
//       reason: `🏆 Cung cấp giá trị tốt nhất so với giá tiền`,
//       isCheaperWithSimilarQuality: valuePerPrice2 > valuePerPrice1,
//       valuePerPrice1,
//       valuePerPrice2,
//     };
//   }
// }

// function formatPrice(price: number): string {
//   return `${Math.round(price / 1000)}k`;
// }

///////////////////////////////////////////////


// import { RoomDetail } from "@/types/types";

// export interface RecommendationResult {
//   recommendedRoom: RoomDetail;
//   reason: string;
//   detailedReason: string;
//   saveMoney?: number;
//   isCheaperWithSimilarQuality: boolean;
//   valuePerPrice1: number;
//   valuePerPrice2: number;
//   recommendationType: 
//     | "cheapest_similar_quality" 
//     | "best_value_for_money" 
//     | "significantly_better_quality"
//     | "more_amenities"
//     | "better_size_to_price"
//     | "balanced_choice";
// }

// export function recommendRoom(
//   room1: RoomDetail,
//   room2: RoomDetail
// ): RecommendationResult {
//   const priceDiff = Math.abs(room1.priceMonth - room2.priceMonth);
//   const areaDiff = Math.abs((room1.area || 0) - (room2.area || 0));
  
//   const convenientsCount1 = room1.convenients?.length || 0;
//   const convenientsCount2 = room2.convenients?.length || 0;
//   const convenientsCountDiff = Math.abs(convenientsCount1 - convenientsCount2);

//   // Tính "Value Score" = Diện tích + (Tiện nghi × weight)
//   const valueScore1 = (room1.area || 0) + convenientsCount1 * 5;
//   const valueScore2 = (room2.area || 0) + convenientsCount2 * 5;
//   const valueDiff = Math.abs(valueScore1 - valueScore2);

//   const cheaperRoom = room1.priceMonth < room2.priceMonth ? room1 : room2;
//   const expensiveRoom = room1.priceMonth > room2.priceMonth ? room1 : room2;
//   const priceGap = Math.abs(room1.priceMonth - room2.priceMonth);

//   // Tính Value per Price
//   const valuePerPrice1 = valueScore1 / (room1.priceMonth || 1);
//   const valuePerPrice2 = valueScore2 / (room2.priceMonth || 1);
//   const valuePerPriceDiff = Math.abs(valuePerPrice1 - valuePerPrice2);

//   // Determine which room is better in each aspect
//   const room1IsCheaper = room1.priceMonth < room2.priceMonth;
//   const room1IsLarger = (room1.area || 0) > (room2.area || 0);
//   const room1HasMoreAmenities = convenientsCount1 > convenientsCount2;
//   const room1HasBetterValue = valuePerPrice1 > valuePerPrice2;

//   // **LOGIC ĐỀ XUẤT - CASE 1: Giá chênh lệch nhỏ (< 300k)**
//   if (priceDiff < 300000) {
//     // Case 1.1: Giá gần như nhau + Chất lượng gần bằng
//     if (valueDiff < 5) {
//       const recommendedRoom = cheaperRoom;
//       return {
//         recommendedRoom,
//         reason: `💰 Tiết kiệm ${formatPrice(priceGap)}/tháng, chất lượng như nhau`,
//         detailedReason: `${recommendedRoom.title} rẻ hơn với cùng diện tích (${recommendedRoom.area}m²) và tiện nghi tương tự`,
//         saveMoney: priceGap,
//         isCheaperWithSimilarQuality: true,
//         valuePerPrice1,
//         valuePerPrice2,
//         recommendationType: "cheapest_similar_quality",
//       };
//     }

//     // Case 1.2: Giá gần như nhau + Phòng rẻ hơn rộng hơn/tiện nghi hơn
//     if (room1IsCheaper && (room1IsLarger || room1HasMoreAmenities)) {
//       const extraFeature = room1IsLarger 
//         ? `rộng hơn ${areaDiff}m²`
//         : `thêm ${convenientsCountDiff} tiện nghi`;
//       return {
//         recommendedRoom: room1,
//         reason: `💰 Rẻ hơn ${formatPrice(priceGap)} nhưng ${extraFeature}`,
//         detailedReason: `${room1.title} vừa rẻ hơn vừa ${extraFeature} - lựa chọn tối ưu`,
//         saveMoney: priceGap,
//         isCheaperWithSimilarQuality: true,
//         valuePerPrice1,
//         valuePerPrice2,
//         recommendationType: "cheapest_similar_quality",
//       };
//     }

//     if (!room1IsCheaper && (room1IsLarger || room1HasMoreAmenities)) {
//       return {
//         recommendedRoom: room2,
//         reason: `💰 Rẻ hơn ${formatPrice(priceGap)} với chất lượng tương tự`,
//         detailedReason: `${room2.title} tiết kiệm tiền mà không phải hy sinh chất lượng`,
//         saveMoney: priceGap,
//         isCheaperWithSimilarQuality: true,
//         valuePerPrice1,
//         valuePerPrice2,
//         recommendationType: "cheapest_similar_quality",
//       };
//     }
//   }

//   // **CASE 2: Giá chênh lệch vừa (300k - 800k)**
//   if (priceDiff >= 300000 && priceDiff < 800000) {
//     // Case 2.1: Phòng rẻ hơn rộng hơn + tiện nghi hơn
//     if (room1IsCheaper && room1IsLarger && room1HasMoreAmenities) {
//       return {
//         recommendedRoom: room1,
//         reason: `🏅 Rẻ hơn, rộng hơn, tiện nghi hơn`,
//         detailedReason: `${room1.title} giảm ${formatPrice(priceGap)}, diện tích tăng ${areaDiff}m², thêm ${convenientsCountDiff} tiện nghi - lựa chọn tuyệt vời`,
//         saveMoney: priceGap,
//         isCheaperWithSimilarQuality: true,
//         valuePerPrice1,
//         valuePerPrice2,
//         recommendationType: "significantly_better_quality",
//       };
//     }

//     if (!room1IsCheaper && room1IsLarger && room1HasMoreAmenities) {
//       return {
//         recommendedRoom: room1,
//         reason: `✨ Chỉ đắt hơn ${formatPrice(priceGap)} nhưng lợi ích vượt trội`,
//         detailedReason: `${room1.title} rộng hơn ${areaDiff}m² và có thêm ${convenientsCountDiff} tiện nghi - đáng đầu tư thêm`,
//         isCheaperWithSimilarQuality: false,
//         valuePerPrice1,
//         valuePerPrice2,
//         recommendationType: "significantly_better_quality",
//       };
//     }

//     // Case 2.2: Phòng rẻ hơn nhưng nhỏ hơn + tiện nghi ít hơn
//     if (room1IsCheaper && !room1IsLarger && !room1HasMoreAmenities) {
//       return {
//         recommendedRoom: room2,
//         reason: `⚖️ Đáng giá hơn dù đắt thêm ${formatPrice(priceGap)}`,
//         detailedReason: `${room2.title} rộng hơn ${areaDiff}m² và có thêm ${convenientsCountDiff} tiện nghi - phần thêm đáng để chi thêm`,
//         isCheaperWithSimilarQuality: false,
//         valuePerPrice1,
//         valuePerPrice2,
//         recommendationType: "significantly_better_quality",
//       };
//     }

//     // Case 2.3: So sánh value per price
//     if (valuePerPriceDiff > 0.01) {
//       const betterValueRoom = valuePerPrice1 > valuePerPrice2 ? room1 : room2;
//       return {
//         recommendedRoom: betterValueRoom,
//         reason: `🎯 Giá trị tốt hơn so với chi phí`,
//         detailedReason: `${betterValueRoom.title} cung cấp nhiều hơn trên mỗi đồng bạn chi tiêu`,
//         isCheaperWithSimilarQuality: false,
//         valuePerPrice1,
//         valuePerPrice2,
//         recommendationType: "best_value_for_money",
//       };
//     }
//   }

//   // **CASE 3: Giá chênh lệch lớn (≥ 800k)**
//   if (priceDiff >= 800000) {
//     // Case 3.1: Giá cao hơn nhưng chất lượng cao hơn đáng kể
//     if (!room1IsCheaper && room1IsLarger && room1HasMoreAmenities && valueDiff > 15) {
//       return {
//         recommendedRoom: room1,
//         reason: `⭐ Xứng đáng với giá cao hơn ${formatPrice(priceGap)}`,
//         detailedReason: `${room1.title} rộng hơn ${areaDiff}m² và có tới ${convenientsCountDiff} tiện nghi bổ sung - khoảng cách chất lượng rõ rệt`,
//         isCheaperWithSimilarQuality: false,
//         valuePerPrice1,
//         valuePerPrice2,
//         recommendationType: "significantly_better_quality",
//       };
//     }

//     if (room1IsCheaper && room1IsLarger && room1HasMoreAmenities && valueDiff > 15) {
//       return {
//         recommendedRoom: room1,
//         reason: `🏆 Rẻ hơn mà còn tốt hơn - tuyệt vời!`,
//         detailedReason: `${room1.title} vừa tiết kiệm ${formatPrice(priceGap)}, vừa rộng hơn ${areaDiff}m², lại có thêm ${convenientsCountDiff} tiện nghi - không nên bỏ qua`,
//         saveMoney: priceGap,
//         isCheaperWithSimilarQuality: true,
//         valuePerPrice1,
//         valuePerPrice2,
//         recommendationType: "significantly_better_quality",
//       };
//     }

//     // Case 3.2: Phòng rẻ hơn với chất lượng tương tự
//     if (room1IsCheaper && valueDiff < 15) {
//       return {
//         recommendedRoom: room1,
//         reason: `💚 Tiết kiệm ${formatPrice(priceGap)}/tháng, chất lượng không thua`,
//         detailedReason: `${room1.title} giúp bạn tiết kiệm đáng kể mỗi tháng mà vẫn đáp ứng nhu cầu tốt`,
//         saveMoney: priceGap,
//         isCheaperWithSimilarQuality: true,
//         valuePerPrice1,
//         valuePerPrice2,
//         recommendationType: "best_value_for_money",
//       };
//     }

//     // Case 3.3: Cân bằng giữa 2 phòng - so sánh value per price
//     if (valuePerPriceDiff > 0.005) {
//       const betterValueRoom = valuePerPrice1 > valuePerPrice2 ? room1 : room2;
//       const worsValueRoom = valuePerPrice1 < valuePerPrice2 ? room1 : room2;
//       return {
//         recommendedRoom: betterValueRoom,
//         reason: `📊 Cung cấp giá trị tốt hơn cho mỗi đồng tiêu`,
//         detailedReason: `Dù ${worsValueRoom.title} rẻ hơn ${formatPrice(priceGap)}, nhưng ${betterValueRoom.title} cung cấp nhiều hơn so với chi phí - tính toán lâu dài sẽ có lợi`,
//         isCheaperWithSimilarQuality: false,
//         valuePerPrice1,
//         valuePerPrice2,
//         recommendationType: "best_value_for_money",
//       };
//     }
//   }

//   // **CASE 4: Mặc định - Cân bằng**
//   if (valuePerPrice1 > valuePerPrice2) {
//     return {
//       recommendedRoom: room1,
//       reason: `⚖️ Lựa chọn cân bằng tốt nhất`,
//       detailedReason: `${room1.title} đáp ứng tốt cả 3 tiêu chí: giá, diện tích và tiện nghi`,
//       isCheaperWithSimilarQuality: false,
//       valuePerPrice1,
//       valuePerPrice2,
//       recommendationType: "balanced_choice",
//     };
//   } else {
//     return {
//       recommendedRoom: room2,
//       reason: `⚖️ Lựa chọn cân bằng tốt nhất`,
//       detailedReason: `${room2.title} đáp ứng tốt cả 3 tiêu chí: giá, diện tích và tiện nghi`,
//       isCheaperWithSimilarQuality: false,
//       valuePerPrice1,
//       valuePerPrice2,
//       recommendationType: "balanced_choice",
//     };
//   }
// }

// function formatPrice(price: number): string {
//   return `${Math.round(price / 1000)}k`;
// }



import { RoomDetail } from "@/types/types";

export interface RecommendationResult {
  recommendedRoom: RoomDetail;
  reason: string;
  detailedReason: string;
  saveMoney?: number;
  isCheaperWithSimilarQuality: boolean;
  valuePerPrice1: number;
  valuePerPrice2: number;
  recommendationType: 
    | "cheapest_similar_quality" 
    | "best_value_for_money" 
    | "significantly_better_quality"
    | "trade_off_neutral"
    | "balanced_choice";
}

export function recommendRoom(
  room1: RoomDetail,
  room2: RoomDetail
): RecommendationResult {
  const priceDiff = Math.abs(room1.priceMonth - room2.priceMonth);
  const areaDiff = Math.abs((room1.area || 0) - (room2.area || 0));
  
  const convenientsCount1 = room1.convenients?.length || 0;
  const convenientsCount2 = room2.convenients?.length || 0;
  const convenientsCountDiff = Math.abs(convenientsCount1 - convenientsCount2);

  // Tính "Value Score" = Diện tích + (Tiện nghi × weight)
  const valueScore1 = (room1.area || 0) + convenientsCount1 * 5;
  const valueScore2 = (room2.area || 0) + convenientsCount2 * 5;
  const valueDiff = Math.abs(valueScore1 - valueScore2);

  const cheaperRoom = room1.priceMonth < room2.priceMonth ? room1 : room2;
  const expensiveRoom = room1.priceMonth > room2.priceMonth ? room1 : room2;
  const priceGap = Math.abs(room1.priceMonth - room2.priceMonth);

  // Tính Value per Price
  const valuePerPrice1 = valueScore1 / (room1.priceMonth || 1);
  const valuePerPrice2 = valueScore2 / (room2.priceMonth || 1);
  const valuePerPriceDiff = Math.abs(valuePerPrice1 - valuePerPrice2);

  // Determine which room is better in each aspect
  const room1IsCheaper = room1.priceMonth < room2.priceMonth;
  const room1IsLarger = (room1.area || 0) > (room2.area || 0);
  const room1HasMoreAmenities = convenientsCount1 > convenientsCount2;
  const room1HasBetterValue = valuePerPrice1 > valuePerPrice2;

  // **CASE 1: Giá gần như nhau (< 500k)**
  if (priceDiff < 500000) {
    // Case 1.1: Giá bằng nhau + Chất lượng gần bằng
    if (valueDiff < 5) {
      const recommendedRoom = cheaperRoom;
      const otherRoom = cheaperRoom.id === room1.id ? room2 : room1;
      return {
        recommendedRoom,
        reason: `💰 Giá gần bằng nhau`,
        detailedReason: `${recommendedRoom.title} (${formatPrice(recommendedRoom.priceMonth)}) và ${otherRoom.title} (${formatPrice(otherRoom.priceMonth)}) có giá chênh lệch chỉ ${formatPrice(priceGap)}. Vì chất lượng gần như nhau, nên chọn ${recommendedRoom.title} để tiết kiệm ${formatPrice(priceGap)}/tháng.`,
        saveMoney: priceGap,
        isCheaperWithSimilarQuality: true,
        valuePerPrice1,
        valuePerPrice2,
        recommendationType: "cheapest_similar_quality",
      };
    }

    // Case 1.2: Giá gần nhau + Phòng rẻ hơn rộng hơn
    if (room1IsCheaper && room1IsLarger) {
      return {
        recommendedRoom: room1,
        reason: `💰 Rẻ hơn + Diện tích lớn hơn`,
        detailedReason: `${room1.title} (${formatPrice(room1.priceMonth)}) rẻ hơn ${formatPrice(priceGap)}/tháng so với ${room2.title} (${formatPrice(room2.priceMonth)}) ĐỒ ĐỀU còn rộng hơn ${areaDiff}m² (${room1.area}m² vs ${room2.area}m²). Đây là lựa chọn tốt hơn trên cả 2 tiêu chí giá và diện tích.`,
        saveMoney: priceGap,
        isCheaperWithSimilarQuality: true,
        valuePerPrice1,
        valuePerPrice2,
        recommendationType: "cheapest_similar_quality",
      };
    }

    if (!room1IsCheaper && room1IsLarger) {
      return {
        recommendedRoom: room1,
        reason: `📐 Diện tích lớn hơn`,
        detailedReason: `${room1.title} (${formatPrice(room1.priceMonth)}) chỉ đắt hơn ${formatPrice(priceGap)}/tháng so với ${room2.title} (${formatPrice(room2.priceMonth)}) nhưng rộng hơn ${areaDiff}m² (${room1.area}m² vs ${room2.area}m²). Đáng để chi thêm một chút cho không gian rộng hơn.`,
        isCheaperWithSimilarQuality: false,
        valuePerPrice1,
        valuePerPrice2,
        recommendationType: "best_value_for_money",
      };
    }

    // Case 1.3: Giá gần nhau + Phòng rẻ hơn tiện nghi hơn
    if (room1IsCheaper && room1HasMoreAmenities) {
      return {
        recommendedRoom: room1,
        reason: `💰 Rẻ hơn + Tiện nghi nhiều hơn`,
        detailedReason: `${room1.title} (${formatPrice(room1.priceMonth)}) rẻ hơn ${formatPrice(priceGap)}/tháng so với ${room2.title} (${formatPrice(room2.priceMonth)}) và có thêm ${convenientsCountDiff} tiện nghi (${convenientsCount1} vs ${convenientsCount2}). Lựa chọn rõ ràng tốt hơn.`,
        saveMoney: priceGap,
        isCheaperWithSimilarQuality: true,
        valuePerPrice1,
        valuePerPrice2,
        recommendationType: "cheapest_similar_quality",
      };
    }

    if (!room1IsCheaper && room1HasMoreAmenities) {
      return {
        recommendedRoom: room1,
        reason: `🏠 Tiện nghi nhiều hơn`,
        detailedReason: `${room1.title} (${formatPrice(room1.priceMonth)}) chỉ đắt hơn ${formatPrice(priceGap)}/tháng so với ${room2.title} (${formatPrice(room2.priceMonth)}) nhưng có thêm ${convenientsCountDiff} tiện nghi (${convenientsCount1} vs ${convenientsCount2}). Nếu bạn quan tâm đến tiện nghi, đây là lựa chọn tốt.`,
        isCheaperWithSimilarQuality: false,
        valuePerPrice1,
        valuePerPrice2,
        recommendationType: "best_value_for_money",
      };
    }

    // // Case 1.4: Giá gần nhau + Chất lượng tương tự
    // const recommendedRoom = cheaperRoom;
    // return {
    //   recommendedRoom,
    //   reason: `⚖️ Giá gần bằng nhau, chất lượng tương tự`,
    //   detailedReason: `${recommendedRoom.title} (${formatPrice(recommendedRoom.priceMonth)}) và ${expensiveRoom.title} (${formatPrice(expensiveRoom.priceMonth)}) chênh lệch chỉ ${formatPrice(priceGap)}/tháng. Cả hai phòng đều có diện tích (${room1.area}m² vs ${room2.area}m²) và tiện nghi tương tự. Chọn ${recommendedRoom.title} để tiết kiệm một chút.`,
    //   saveMoney: priceGap,
    //   isCheaperWithSimilarQuality: true,
    //   valuePerPrice1,
    //   valuePerPrice2,
    //   recommendationType: "cheapest_similar_quality",
    // };
    // Case 1.4: Giá gần nhau + Chất lượng tương tự
const recommendedRoom = cheaperRoom;
return {
  recommendedRoom,
  reason: `⚖️ Hai phòng tương đương nhau`,
  detailedReason: `${room1.title} (${formatPrice(room1.priceMonth)}) và ${room2.title} (${formatPrice(room2.priceMonth)}) chênh lệch giá chỉ ${formatPrice(priceGap)}/tháng với diện tích (${room1.area}m² vs ${room2.area}m²) và tiện nghi tương tự. Lựa chọn nên dựa trên các yếu tố khác như: vị trí, môi trường xung quanh, hoặc sở thích cá nhân của bạn nhé.`,
  saveMoney: priceGap,
  isCheaperWithSimilarQuality: true,
  valuePerPrice1,
  valuePerPrice2,
  recommendationType: "cheapest_similar_quality",
};
  }


  // **CASE 2: Giá cao hơn nhưng diện tích/tiện nghi thua (300k - 1tr)**
  if (priceDiff >= 500000 && priceDiff < 1000000) {
    // Case 2.1: Giá cao hơn nhưng diện tích nhỏ hơn
    if (!room1IsCheaper && !room1IsLarger && areaDiff >= 2) {
      return {
        recommendedRoom: room2,
        reason: `💰 Giá rẻ hơn dù diện tích gần bằng`,
        detailedReason: `${room2.title} (${formatPrice(room2.priceMonth)}) rẻ hơn ${formatPrice(priceGap)}/tháng so với ${room1.title} (${formatPrice(room1.priceMonth)}) chỉ nhỏ hơn ${areaDiff}m² (${room2.area}m² vs ${room1.area}m²). Sự chênh lệch diện tích không đáng để chi thêm đó tiền hàng tháng.`,
        saveMoney: priceGap,
        isCheaperWithSimilarQuality: true,
        valuePerPrice1,
        valuePerPrice2,
        recommendationType: "cheapest_similar_quality",
      };
    }

    // Case 2.2: Giá cao hơn nhưng tiện nghi ít hơn
    if (!room1IsCheaper && !room1HasMoreAmenities && convenientsCountDiff >= 2) {
      return {
        recommendedRoom: room2,
        reason: `💰 Giá rẻ hơn dù tiện nghi ít hơn`,
        detailedReason: `${room2.title} (${formatPrice(room2.priceMonth)}) rẻ hơn ${formatPrice(priceGap)}/tháng so với ${room1.title} (${formatPrice(room1.priceMonth)}) nhưng thiếu ${convenientsCountDiff} tiện nghi (${room2.convenients?.length || 0} vs ${convenientsCount1}). Nếu không yêu cầu tính năng đó, tiết kiệm tiền là ưu tiên.`,
        saveMoney: priceGap,
        isCheaperWithSimilarQuality: true,
        valuePerPrice1,
        valuePerPrice2,
        recommendationType: "cheapest_similar_quality",
      };
    }

    // Case 2.3: Giá cao hơn lớn hơn tiện nghi hơn - TRUNG LẬP
    if (!room1IsCheaper && room1IsLarger && room1HasMoreAmenities) {
      return {
        recommendedRoom: room1,
        reason: `⚖️ Cân nhắc giữa giá và chất lượng`,
        detailedReason: `${room1.title} (${formatPrice(room1.priceMonth)}) đắt hơn ${formatPrice(priceGap)}/tháng so với ${room2.title} (${formatPrice(room2.priceMonth)}), nhưng đổi lại bạn sẽ có diện tích lớn hơn ${areaDiff}m² (${room1.area}m² vs ${room2.area}m²) và thêm ${convenientsCountDiff} tiện nghi. Lựa chọn phụ thuộc vào mức sẵn sàng chi thêm của bạn cho không gian và tiện nghi tốt hơn.`,
        isCheaperWithSimilarQuality: false,
        valuePerPrice1,
        valuePerPrice2,
        recommendationType: "trade_off_neutral",
      };
    }
  }

  // **CASE 3: Giá chênh lệch lớn (≥ 1tr)**
  if (priceDiff >= 1000000) {
    // Case 3.1: Giá cao hơn nhưng diện tích/tiện nghi thua
    if (!room1IsCheaper && (!room1IsLarger || !room1HasMoreAmenities)) {
      return {
        recommendedRoom: room2,
        reason: `💚 Rẻ hơn đáng kể`,
        detailedReason: `${room2.title} (${formatPrice(room2.priceMonth)}) rẻ hơn ${formatPrice(priceGap)}/tháng so với ${room1.title} (${formatPrice(room1.priceMonth)}). ${!room1IsLarger ? `Dù ${room1.title} rộng hơn ${areaDiff}m² nhưng` : `Dù ${room1.title} có thêm ${convenientsCountDiff} tiện nghi nhưng`} sự chênh lệch giá quá lớn. ${room2.title} là lựa chọn thông minh hơn về mặt tài chính.`,
        saveMoney: priceGap,
        isCheaperWithSimilarQuality: true,
        valuePerPrice1,
        valuePerPrice2,
        recommendationType: "best_value_for_money",
      };
    }

    // Case 3.2: Giá cao hơn nhưng chất lượng tốt hơn đáng kể - TRUNG LẬP
    if (!room1IsCheaper && room1IsLarger && room1HasMoreAmenities && valueDiff > 20) {
      return {
        recommendedRoom: room1,
        reason: `⚖️ Đáng cân nhắc dù giá cao hơn`,
        detailedReason: `${room1.title} (${formatPrice(room1.priceMonth)}) đắt hơn ${formatPrice(priceGap)}/tháng so với ${room2.title} (${formatPrice(room2.priceMonth)}), nhưng cung cấp nhiều hơn đáng kể: rộng hơn ${areaDiff}m² (${room1.area}m² vs ${room2.area}m²) và có thêm ${convenientsCountDiff} tiện nghi (${convenientsCount1} vs ${convenientsCount2}). Nếu bạn muốn chất lượng cao hơn, sự chi thêm là xứng đáng.`,
        isCheaperWithSimilarQuality: false,
        valuePerPrice1,
        valuePerPrice2,
        recommendationType: "trade_off_neutral",
      };
    }

    // Case 3.3: Giá rẻ hơn + chất lượng tốt hơn - RỊ RA LUÔN
    if (room1IsCheaper && room1IsLarger && room1HasMoreAmenities) {
      return {
        recommendedRoom: room1,
        reason: `🏆 Vô cùng tốt - Rẻ hơn lại tốt hơn`,
        detailedReason: `${room1.title} (${formatPrice(room1.priceMonth)}) rẻ hơn ${formatPrice(priceGap)}/tháng so với ${room2.title} (${formatPrice(room2.priceMonth)}) MÀ còn rộng hơn ${areaDiff}m² (${room1.area}m² vs ${room2.area}m²) và có thêm ${convenientsCountDiff} tiện nghi (${convenientsCount1} vs ${convenientsCount2}). Đây không phải lựa chọn khó - ${room1.title} rõ ràng tốt hơn.`,
        saveMoney: priceGap,
        isCheaperWithSimilarQuality: true,
        valuePerPrice1,
        valuePerPrice2,
        recommendationType: "significantly_better_quality",
      };
    }
  }

  // **DEFAULT: So sánh value per price**
  if (valuePerPrice1 > valuePerPrice2) {
    return {
      recommendedRoom: room1,
      reason: `📊 Giá trị tốt hơn so với chi phí`,
      detailedReason: `So sánh toàn diện, ${room1.title} (${formatPrice(room1.priceMonth)}) cung cấp giá trị tốt hơn ${room2.title} (${formatPrice(room2.priceMonth)}) khi xét tổng hợp giá, diện tích và tiện nghi.`,
      isCheaperWithSimilarQuality: false,
      valuePerPrice1,
      valuePerPrice2,
      recommendationType: "balanced_choice",
    };
  } else {
    return {
      recommendedRoom: room2,
      reason: `📊 Giá trị tốt hơn so với chi phí`,
      detailedReason: `So sánh toàn diện, ${room2.title} (${formatPrice(room2.priceMonth)}) cung cấp giá trị tốt hơn ${room1.title} (${formatPrice(room1.priceMonth)}) khi xét tổng hợp giá, diện tích và tiện nghi.`,
      isCheaperWithSimilarQuality: false,
      valuePerPrice1,
      valuePerPrice2,
      recommendationType: "balanced_choice",
    };
  }
}

function formatPrice(price: number): string {
  return `${Math.round(price / 1000)}k`;
}