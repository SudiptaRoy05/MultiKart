"use client"

import { signIn } from "next-auth/react"
import { useState, ChangeEvent, FormEvent } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface LoginFormData {
    email: string
    password: string
}

export default function LoginForm() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
    })
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const validateForm = () => {
        if (!formData.email.trim()) {
            toast.error("Email is required")
            return false
        }
        // Email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email")
            return false
        }
        if (!formData.password) {
            toast.error("Password is required")
            return false
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return false
        }
        return true
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        try {
            const result = await signIn("credentials", {
                email: formData.email.toLowerCase().trim(), // Normalize email
                password: formData.password,
                redirect: false,
                callbackUrl: "/",
            })

            if (result?.error) {
                // Handle specific error messages
                if (result.error === "Missing required fields") {
                    toast.error("Please fill in all required fields")
                } else if (result.error === "Invalid email format") {
                    toast.error("Please enter a valid email address")
                } else {
                    toast.error("Invalid credentials. Please try again.")
                }
            } else if (result?.ok) {
                toast.success("Login successful!")
                router.push("/")
                router.refresh()
            }
        } catch (error) {
            console.error("Login error:", error)
            toast.error("An unexpected error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-primary">
                        Login to Your Account
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Enter your email and password to access your account
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative mt-1">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="pr-10"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Don't have an account?
                        </span>
                    </div>
                </div>

                <div className="text-center">
                    <Link
                        href="/register"
                        className="text-sm text-primary hover:underline"
                    >
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    )
}
