"use client";

import { useState } from "react";
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Quote,
  DollarSign,
  Wallet,
  Star,
  MessageCircle,
  Target,
  CheckCircle2,
  Lightbulb,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { AIPersonalizedResponse, RoomAnalysis } from "@/utils/recommendationEngine";

interface AIRecommendationBoxProps {
  aiResult: AIPersonalizedResponse | null;
  isLoading: boolean;
  room1Name?: string;
  room2Name?: string;
}

// Component hiển thị điểm phù hợp
function MatchScoreBadge({ score }: { score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 8) return "from-green-500 to-emerald-500";
    if (s >= 6) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${getScoreColor(score)} text-white font-bold text-sm shadow-lg`}
    >
      <Star className="w-4 h-4" />
      {score}/10
    </div>
  );
}

// Component hiển thị chi phí
function CostBreakdown({
  cost,
}: {
  cost: RoomAnalysis["real_monthly_cost"];
}) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "đ";

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
      <div className="flex items-center gap-2 mb-2 text-amber-700 font-semibold text-sm">
        <Wallet className="w-4 h-4" />
        Chi phí thực tế hàng tháng
      </div>
      <div className="grid grid-cols-3 gap-2 text-center mb-2">
        <div>
          <div className="text-xs text-gray-500">Tiền thuê</div>
          <div className="font-semibold text-gray-700">
            {formatPrice(cost.base_rent)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Chi phí ẩn</div>
          <div className="font-semibold text-red-600">
            +{formatPrice(cost.hidden_costs)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Tổng cộng</div>
          <div className="font-bold text-amber-700">
            {formatPrice(cost.total)}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 italic">{cost.breakdown}</p>
    </div>
  );
}

export default function AIRecommendationBox({
  aiResult,
  isLoading,
  room1Name = "Phòng 1",
  room2Name = "Phòng 2",
}: AIRecommendationBoxProps) {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 mb-8 border border-blue-100 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl relative overflow-hidden">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full animate-pulse">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="h-6 w-48 bg-blue-200 rounded animate-pulse mb-1"></div>
            <div className="h-3 w-32 bg-blue-100 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-4 w-full bg-blue-100 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-blue-100 rounded animate-pulse"></div>
          <div className="h-4 w-5/6 bg-blue-100 rounded animate-pulse"></div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          AI đang phân tích phòng trọ cho bạn...
        </div>
      </div>
    );
  }

  if (!aiResult) return null;

  const { room_1, room_2 } = aiResult.room_analysis;
  const recommendation = aiResult.my_recommendation;
  const isRoom2Recommended = recommendation.chosen_room_id === "room_2";

  return (
    <div className="mb-8 space-y-4">
      {/* Header Card */}
      <div className="p-6 border border-indigo-200 shadow-lg bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl relative">
        <div className="absolute top-0 right-0 -mt-2 -mr-2">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500"></span>
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Phân Tích & Đề Xuất Cá Nhân Hóa
            </h3>
            <p className="text-xs text-gray-500">Powered by Gemini AI</p>
          </div>
        </div>

        {/* Greeting */}
        <div className="mb-4 bg-white/60 p-4 rounded-xl border border-indigo-100 backdrop-blur-sm">
          <div className="flex gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-700">{aiResult.greeting}</p>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="bg-gradient-to-r from-purple-100/50 to-pink-100/50 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-2 text-purple-700 font-semibold text-sm">
            <Target className="w-4 h-4" />
            Hiểu về bạn
          </div>
          <p className="text-sm text-gray-700">{aiResult.user_profile_summary}</p>
        </div>
      </div>

      {/* Room Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Room 1 */}
        <div
          className={`p-5 rounded-xl border-2 transition-all ${
            !isRoom2Recommended
              ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-gray-800">{room1Name}</h4>
              {!isRoom2Recommended && (
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  ✓ Được đề xuất
                </span>
              )}
            </div>
            <MatchScoreBadge score={room_1.match_score} />
          </div>

          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-1">
                <ThumbsUp className="w-4 h-4" />
                Điểm phù hợp
              </div>
              <p className="text-sm text-gray-700">{room_1.why_it_fits}</p>
            </div>

            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-1">
                <ThumbsDown className="w-4 h-4" />
                Điểm cần cân nhắc
              </div>
              <p className="text-sm text-gray-700">{room_1.why_it_doesnt}</p>
            </div>

            <CostBreakdown cost={room_1.real_monthly_cost} />

            <button
              onClick={() =>
                setExpandedRoom(expandedRoom === "room_1" ? null : "room_1")
              }
              className="w-full flex items-center justify-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 py-2"
            >
              {expandedRoom === "room_1" ? (
                <>
                  Thu gọn <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Xem nhận xét cá nhân <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>

            {expandedRoom === "room_1" && (
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <div className="flex gap-2">
                  <Quote className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 italic">
                    {room_1.personal_note}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Room 2 */}
        <div
          className={`p-5 rounded-xl border-2 transition-all ${
            isRoom2Recommended
              ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-gray-800">{room2Name}</h4>
              {isRoom2Recommended && (
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  ✓ Được đề xuất
                </span>
              )}
            </div>
            <MatchScoreBadge score={room_2.match_score} />
          </div>

          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-1">
                <ThumbsUp className="w-4 h-4" />
                Điểm phù hợp
              </div>
              <p className="text-sm text-gray-700">{room_2.why_it_fits}</p>
            </div>

            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-1">
                <ThumbsDown className="w-4 h-4" />
                Điểm cần cân nhắc
              </div>
              <p className="text-sm text-gray-700">{room_2.why_it_doesnt}</p>
            </div>

            <CostBreakdown cost={room_2.real_monthly_cost} />

            <button
              onClick={() =>
                setExpandedRoom(expandedRoom === "room_2" ? null : "room_2")
              }
              className="w-full flex items-center justify-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 py-2"
            >
              {expandedRoom === "room_2" ? (
                <>
                  Thu gọn <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Xem nhận xét cá nhân <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>

            {expandedRoom === "room_2" && (
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <div className="flex gap-2">
                  <Quote className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 italic">
                    {room_2.personal_note}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Comparison */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
        <div className="flex items-center gap-2 mb-4 text-amber-800 font-bold">
          <DollarSign className="w-5 h-5" />
          So sánh tài chính
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/70 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">
              Chênh lệch ban đầu
            </div>
            <p className="text-sm text-gray-700">
              {aiResult.financial_comparison.initial_cost_difference}
            </p>
          </div>
          <div className="bg-white/70 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Phân tích dài hạn</div>
            <p className="text-sm text-gray-700">
              {aiResult.financial_comparison.long_term_analysis}
            </p>
          </div>
          <div className="bg-white/70 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">
              Kết luận giá trị
            </div>
            <p className="text-sm font-medium text-amber-800">
              {aiResult.financial_comparison.value_for_money_verdict}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendation Card */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-6 h-6" />
          <h4 className="font-bold text-lg">Đề xuất của AI</h4>
          <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm">
            {recommendation.confidence_level}
          </span>
        </div>

        <p className="text-lg font-semibold mb-4">
          👉 {recommendation.chosen_room}
        </p>

        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="text-sm font-medium mb-2">Lý do cá nhân hóa:</div>
          <ul className="space-y-2">
            {recommendation.personalized_reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1 w-1.5 h-1.5 bg-white rounded-full flex-shrink-0"></span>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium">
            <Lightbulb className="w-4 h-4" />
            Lời khuyên chân thành
          </div>
          <p className="text-sm">{recommendation.honest_advice}</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <div className="text-sm font-medium mb-2">Các bước tiếp theo:</div>
          <ol className="space-y-2">
            {recommendation.action_steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="bg-white/30 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Alternative Scenario */}
      <div className="p-4 rounded-xl bg-gray-100 border border-gray-200">
        <div className="flex items-center gap-2 mb-2 text-gray-700 font-semibold text-sm">
          <AlertCircle className="w-4 h-4" />
          Khi nào nên chọn phương án còn lại?
        </div>
        <p className="text-sm text-gray-700 mb-1">
          <strong>Tình huống:</strong>{" "}
          {aiResult.when_to_choose_alternative.scenario}
        </p>
        <p className="text-sm text-gray-600">
          {aiResult.when_to_choose_alternative.explanation}
        </p>
      </div>

      {/* Closing Note */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-center">
        <p className="text-sm text-purple-800 font-medium">
          {aiResult.closing_note}
        </p>
      </div>
    </div>
  );
}
