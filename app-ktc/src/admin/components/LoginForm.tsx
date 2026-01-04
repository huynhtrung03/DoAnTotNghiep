"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../stores/useAuthorStore";

interface ILoginInputs {
  username: string;
  password: string;
}
const schema = yup
  .object({
    username: yup.string().required("Vui lòng nhập số điện thoại hoặc email"),
    password: yup
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự.")
      .required("Vui lòng nhập mật khẩu."),
  })
  .required();

export default function LoginForm() {
  const [loginGeneralErrorMessage, setLoginGeneralErrorMessage] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const navigate = useNavigate();
  const { login, loggedInUser, loading } = useAuthStore((state) => state);

  useEffect(() => {
    if (loggedInUser) {
      navigate("/admin");
    }
  }, [loggedInUser, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ILoginInputs>({
    resolver: yupResolver(schema),
  });

  // Xử lý submit form đăng nhập
  const onLoginSubmit: SubmitHandler<ILoginInputs> = async (data) => {
    setLoginGeneralErrorMessage("");
    
    try {
      await login({
        username: data.username,
        password: data.password,
        navigate,
      });
      
      // Luôn lấy error mới nhất từ store sau khi login
      const latestError = useAuthStore.getState().error;
      
      if (latestError) {
        // Phân loại và hiển thị lỗi cụ thể
        let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";
        
        if (typeof latestError === "string") {
          errorMessage = latestError;
        } else if (latestError?.response) {
          // Lỗi từ server với response
          const status = latestError.response.status;
          
          // Parse server message - xử lý cả string và array
          let serverMessage = latestError.response.data?.message || 
                             latestError.response.data?.error;
          
          // Nếu errors là mảng, lấy phần tử đầu tiên
          if (latestError.response.data?.errors) {
            const errors = latestError.response.data.errors;
            serverMessage = Array.isArray(errors) ? errors[0] : errors;
          }
          
          switch (status) {
            case 400:
              errorMessage = serverMessage || "Tên đăng nhập hoặc mật khẩu không hợp lệ.";
              break;
            case 401:
              errorMessage = serverMessage || "Sai tên đăng nhập hoặc mật khẩu.";
              break;
            case 403:
              errorMessage = serverMessage || "Bạn không có quyền truy cập khu vực quản trị.";
              break;
            case 404:
              errorMessage = serverMessage || "Không tìm thấy người dùng.";
              break;
            case 500:
              // Kiểm tra xem có phải lỗi authentication không (backend trả nhầm 500)
              if (serverMessage && (
                serverMessage.toLowerCase().includes('invalid') ||
                serverMessage.toLowerCase().includes('password') ||
                serverMessage.toLowerCase().includes('username')
              )) {
                errorMessage = "Sai tên đăng nhập hoặc mật khẩu.";
              } else {
                errorMessage = serverMessage || "Lỗi máy chủ. Vui lòng thử lại sau.";
              }
              console.error("Chi tiết lỗi server:", latestError.response.data);
              break;
            default:
              errorMessage = serverMessage || `Lỗi: ${status}`;
          }
        } else if (latestError?.request) {
          // Request đã được gửi nhưng không nhận được response
          errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.";
        } else if (latestError?.message) {
          // Lỗi khác (setup request, etc.)
          errorMessage = latestError.message;
        }
        
        setLoginGeneralErrorMessage(errorMessage);
        console.error("Lỗi đăng nhập:", latestError);
      } else {
        // Đăng nhập thành công
        setLoginGeneralErrorMessage("");
        reset();
      }
    } catch (err: unknown) {
      // Catch lỗi từ Promise.reject trong store
      console.error("Lỗi catch đăng nhập:", err);
      setLoginGeneralErrorMessage(
        typeof err === "string"
          ? err
          : "Đăng nhập thất bại. Vui lòng thử lại."
      );
    }
  };
  return (
    <div className="relative w-full max-w-md p-8 shadow-xl bg-white/20 backdrop-blur-md rounded-xl">
      <form onSubmit={handleSubmit(onLoginSubmit)}>
        {/* Identifier Input (Phone Number or Email) */}
        <div className="mb-4">
          <label htmlFor="loginIdentifier" className="sr-only">
            Tên đăng nhập
          </label>
          <input
            type="text"
            id="loginIdentifier"
            className={`w-full p-3 border ${
              errors.username ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white`}
            placeholder="Số điện thoại hoặc Email"
            {...register("username")}
          />
          {errors.username && (
            <p className="flex items-center mt-1 text-xs text-red-500">
              <MdErrorOutline className="w-4 h-4 mr-1" />
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label htmlFor="loginPassword" className="sr-only">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showLoginPassword ? "text" : "password"}
              id="loginPassword"
              autoComplete="new-password" // Thêm dòng này
              className={`w-full p-3 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white pr-10`}
              placeholder="Mật khẩu"
              {...register("password")}
            />
            <span
              className="absolute right-0 flex items-center pr-3 text-gray-200 transition -translate-y-1/2 cursor-pointer top-1/2 hover:text-gray-400"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
            >
              {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.password && (
            <p className="flex items-center mt-1 text-xs text-red-500">
              <MdErrorOutline className="w-4 h-4 mr-1" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* General Error Message (for API failures) */}
        {loginGeneralErrorMessage && (
          <div
            className="relative px-4 py-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded"
            role="alert"
          >
            <span className="block sm:inline">{loginGeneralErrorMessage}</span>
          </div>
        )}

        {/* Nút Đăng nhập */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-lg font-semibold text-black transition duration-300 rounded-md ${
            loading 
              ? 'bg-gray-300 cursor-not-allowed opacity-70' 
              : 'bg-gray-200 hover:bg-gray-400'
          }`}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      {/* Forgot Password Link and Terms/Privacy */}
      <div className="mt-4 text-center">
        <Link
          to="/auth/forgot-password"
          className="text-sm text-gray-200 hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </div>
      <div className="mt-8 text-xs text-center text-gray-400">
        <p>
          Bằng việc đăng nhập, bạn đồng ý với{" "}
          <Link to="/terms" className="text-white hover:underline">
            điều khoản dịch vụ
          </Link>{" "}
          cũng như{" "}
          <Link to="/privacy" className="text-white hover:underline">
            chính sách bảo mật
          </Link>{" "}
          của chúng tôi
        </p>
      </div>
    </div>
  );
}
