import { RoomDetail } from "@/types/types";
import { getUserSimilarityProfile } from "@/services/SuggestionService";
import { URL_PPYTHON } from "@/services/Constant";

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

// ... existing code ...
function formatPrice(price: number): string {
  return `${Math.round(price / 1000)}k`;
}


// --- AI RECOMMENDATION INTERFACE ---

// Interface cho response từ AI (matches AIRecommendationBox.tsx)
export interface RoomAnalysis {
  match_score: number;
  why_it_fits: string;
  why_it_doesnt: string;
  real_monthly_cost: {
    base_rent: number;
    hidden_costs: number;
    total: number;
    breakdown: string;
  };
  personal_note: string;
}

export interface MyRecommendation {
  chosen_room: string;
  chosen_room_id: string;
  confidence_level: string;
  personalized_reasons: string[];
  honest_advice: string;
  action_steps: string[];
}

export interface FinancialComparison {
  initial_cost_difference: string;
  long_term_analysis: string;
  value_for_money_verdict: string;
}

export interface WhenToChooseAlternative {
  scenario: string;
  explanation: string;
}

export interface AIPersonalizedResponse {
  greeting: string;
  user_profile_summary: string;
  room_analysis: {
    room_1: RoomAnalysis;
    room_2: RoomAnalysis;
  };
  financial_comparison: FinancialComparison;
  my_recommendation: MyRecommendation;
  when_to_choose_alternative: WhenToChooseAlternative;
  closing_note: string;
}

// Legacy interface for backward compatibility
export interface AIRecommendationResult {
  analysis: string;
  recommendedRoomId: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

/**
 * Gọi API ai_compare_rooms_personalized để lấy gợi ý AI cá nhân hóa
 */
export async function recommendRoomAI(
  room1: RoomDetail,
  room2: RoomDetail,
  currentUserId?: string | null
): Promise<AIPersonalizedResponse | null> {
  
  // Fetch user profile if userId is provided
  let userProfile = null;
  
  if (currentUserId) {
    try {
      userProfile = await getUserSimilarityProfile(currentUserId);
    } catch {
      // Silently ignore profile fetch errors
    }
  }

  // Build request payload matching the API structure (see test_ai_compare_persion.py)
  const requestPayload = {
    rooms: [
      {
        id: "room_1",
        name: room1.title,
        price: room1.priceMonth,
        address: `${room1.address.street}, ${room1.address.ward.name}, ${room1.address.ward.district.name}`,
        area: room1.area,
        amenities: room1.convenients?.map(c => c.name) || [],
        description: room1.description || ""
      },
      {
        id: "room_2",
        name: room2.title,
        price: room2.priceMonth,
        address: `${room2.address.street}, ${room2.address.ward.name}, ${room2.address.ward.district.name}`,
        area: room2.area,
        amenities: room2.convenients?.map(c => c.name) || [],
        description: room2.description || ""
      }
    ],
    user_context: {
      preference: "Best value for money",
      user_location: {
        latitude: 0,
        longitude: 0
      },
      user_profile: userProfile ? {
        favoriteBasedProfile: userProfile.favoriteBasedProfile || {},
        viewHistoryBasedProfile: userProfile.viewHistoryBasedProfile || {}
      } : {}
    }
  };

  // Call Python API - ai_compare_rooms_personalized
  try {
    const response = await fetch(`${URL_PPYTHON}/api/ai_compare_rooms_personalized`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    const apiResponse = await response.json();
    
    // Check success from Python API wrapper
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data as AIPersonalizedResponse;
    } else {
      throw new Error(apiResponse.error || "Unknown API error");
    }

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return null;
  }
}
