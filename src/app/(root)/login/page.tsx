'use client'
import LoginForm from "@/components/loginForm"
import { Suspense } from "react"

export default function Login() {
    return (
        <div>
            <Suspense>
                <LoginForm />
            </Suspense>
        </div>
    )
}
