import { RecommendationResult } from "@/utils/recommendationEngine";
import { Star, TrendingUp, DollarSign, Package } from "lucide-react";

interface RecommendationBoxProps {
  recommendation: RecommendationResult;
}

// export default function RecommendationBox({
//   recommendation,
// }: RecommendationBoxProps) {
//   return (
//     <div className="p-6 mb-8 border-l-4 border-yellow-400 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-4">
//         <div className="p-2 bg-yellow-100 rounded-full">
//           <Star className="w-5 h-5 text-yellow-600" />
//         </div>
//         <h3 className="text-lg font-bold text-gray-800">
//            Khuyến nghị
//         </h3>
//       </div>

//       {/* Recommended Room */}
//       <div className="mb-4">
//         <p className="mb-1 text-sm text-gray-600">Nên chọn:</p>
//         <h4 className="text-xl font-bold text-yellow-700">
//           {recommendation.recommendedRoom.title}
//         </h4>
//       </div>

//       {/* Reason */}
//       <div className="p-3 mb-4 bg-white border border-yellow-200 rounded-lg">
//         <p className="font-medium text-gray-700">{recommendation.reason}</p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-3 gap-3">
//         <div className="p-3 text-center bg-white rounded-lg">
//           <div className="flex items-center justify-center gap-1 mb-1">
//             <DollarSign className="w-4 h-4 text-green-600" />
//           </div>
//           <p className="text-xs text-gray-600">Giá</p>
//           <p className="text-sm font-bold text-green-700">
//             ₫{recommendation.recommendedRoom.priceMonth?.toLocaleString(
//               "vi-VN"
//             )}
//           </p>
//         </div>

//         <div className="p-3 text-center bg-white rounded-lg">
//           <div className="flex items-center justify-center gap-1 mb-1">
//             <TrendingUp className="w-4 h-4 text-blue-600" />
//           </div>
//           <p className="text-xs text-gray-600">Diện tích</p>
//           <p className="text-sm font-bold text-blue-700">
//             {recommendation.recommendedRoom.area}m²
//           </p>
//         </div>

//         <div className="p-3 text-center bg-white rounded-lg">
//           <div className="flex items-center justify-center gap-1 mb-1">
//             <Package className="w-4 h-4 text-purple-600" />
//           </div>
//           <p className="text-xs text-gray-600">Tiện nghi</p>
//           <p className="text-sm font-bold text-purple-700">
//             {recommendation.recommendedRoom.convenients?.length || 0}
//           </p>
//         </div>
//       </div>

//       {/* Save Money Badge (if applicable) */}
//       {recommendation.saveMoney && recommendation.isCheaperWithSimilarQuality && (
//         <div className="p-3 mt-4 bg-green-100 border border-green-300 rounded-lg">
//           <p className="text-sm font-semibold text-green-800">
//             💚 Tiết kiệm ₫{recommendation.saveMoney?.toLocaleString("vi-VN")}/tháng
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }


export default function RecommendationBox({
  recommendation,
}: RecommendationBoxProps) {
  return (
    <div className="p-6 mb-8 border-l-4 border-yellow-400 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-100 rounded-full">
          <Star className="w-5 h-5 text-yellow-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">
           Khuyến nghị
        </h3>
      </div>

      {/* Recommended Room */}
      <div className="mb-4">
        <p className="mb-1 text-sm text-gray-600">Nên chọn:</p>
        <h4 className="text-xl font-bold text-yellow-700">
          {recommendation.recommendedRoom.title}
        </h4>
      </div>

      {/* Reason - Ngắn gọn */}
      <div className="p-3 mb-3 bg-white border border-yellow-200 rounded-lg">
        <p className="font-semibold text-gray-700">{recommendation.reason}</p>
      </div>

      {/* Detailed Reason - Chi tiết */}
      <div className="p-3 mb-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <p className="text-sm text-gray-800">{recommendation.detailedReason}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 text-center bg-white rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xs text-gray-600">Giá</p>
          <p className="text-sm font-bold text-green-700">
            ₫{recommendation.recommendedRoom.priceMonth?.toLocaleString(
              "vi-VN"
            )}
          </p>
        </div>

        <div className="p-3 text-center bg-white rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs text-gray-600">Diện tích</p>
          <p className="text-sm font-bold text-blue-700">
            {recommendation.recommendedRoom.area}m²
          </p>
        </div>

        <div className="p-3 text-center bg-white rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xs text-gray-600">Tiện nghi</p>
          <p className="text-sm font-bold text-purple-700">
            {recommendation.recommendedRoom.convenients?.length || 0}
          </p>
        </div>
      </div>

      {/* Save Money Badge (if applicable) */}
      {recommendation.saveMoney && recommendation.isCheaperWithSimilarQuality && (
        <div className="p-3 mt-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-sm font-semibold text-green-800">
            💚 Tiết kiệm ₫{recommendation.saveMoney?.toLocaleString("vi-VN")}/tháng
          </p>
        </div>
      )}
    </div>
  );
}