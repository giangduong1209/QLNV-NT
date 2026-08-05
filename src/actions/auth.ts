"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import {
  LoginFormSchema,
  type LoginFormState,
  type UserRole,
} from "@/types";

// ============================================================
// Login Action
// ============================================================

export async function login(
  _: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error?.flatten().fieldErrors,
    };
  }

  const { username, password } = validatedFields.data;

  // 2. Find user in database
  try {
    const user = await prisma.users.findFirst({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        quyen: true,
        active: true,
      },
    });

    if (!user) {
      return {
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      };
    }

    if (!user.active) {
      return {
        message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
      };
    }

    // 3. Verify password
    if (password !== user.password) {
      return {
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      };
    }

    // 4. Create session
    await createSession(user.id, user.quyen as UserRole);
  } catch (error) {
    console.error("Login error:", error);
    return {
      message: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
    };
  }

  // 5. Redirect to dashboard (outside try-catch because redirect throws)
  redirect("/dashboard");
}

// ============================================================
// Logout Action
// ============================================================
export async function logout() {
  await deleteSession();
  redirect("/login");
}
