'use client'

import { useState } from "react"
import { toast } from "react-hot-toast"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Upload, Store, Sparkles, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useCurrentUser } from "@/app/hooks/useCurrentUser"
import { useTheme } from "next-themes"

type ShopCategory = "Electronics" | "Fashion" | "Home" | "Books" | "Sports" | "Beauty"

interface ShopDetails {
    name: string
    description: string
    category: ShopCategory
    imageUrl: string
    userName: string
    userEmail: string
}

export default function CreateShopForm() {
    const [category, setCategory] = useState<string>("")
    const [imageUrl, setImageUrl] = useState<string>("")
    const [dragActive, setDragActive] = useState<boolean>(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [uploading, setUploading] = useState<boolean>(false)
    const router = useRouter()
    const { theme } = useTheme()

    const userData = useCurrentUser()
    const userName = userData?.user?.name
    const userEmail = userData?.user?.email

    // const apiKey = process.env.IMG_BB

    const shopInfo = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const form = e.currentTarget
        const formData = new FormData(form)

        const shopName = formData.get("shopName") as string
        const description = formData.get("description") as string

        if (!userName || !userEmail) return toast.error("User not loaded.")
        if (!category) return toast.error("Please select a category")
        if (!imageUrl) return toast.error("Please upload a shop image")

        const shopDetails: ShopDetails = {
            name: shopName,
            description,
            category: category as ShopCategory,
            imageUrl,
            userName,
            userEmail,
        }

        try {
            const response = await fetch("/api/shop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(shopDetails),
            })

            if (!response.ok) throw new Error("Server error")

            toast.success("Shop created successfully!")
            router.push("/dashboard")
        } catch (error) {
            toast.error("Failed to create shop")
            console.error(error)
        }
    }

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0])
        }
    }

    const handleImageFile = async (file: File) => {
        setSelectedImage(file)
        const toastId = toast.loading("Uploading image...")
        setUploading(true)

        try {
            const formData = new FormData()
            formData.append("image", file)

            const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
            if (!apiKey) throw new Error("Missing ImgBB API Key")

            const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: "POST",
                body: formData,
            })

            const data = await res.json()
            if (data?.data?.url) {
                setImageUrl(data.data.url)
                toast.success("Image uploaded!", { id: toastId })
            } else {
                throw new Error("Upload failed")
            }
        } catch (error) {
            toast.error("Error uploading image", { id: toastId })
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleImageFile(e.target.files[0])
        }
    }

    const isSubmitDisabled = !category || !imageUrl || uploading

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background dark:from-background/80 dark:via-background/50 dark:to-background/80 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-rose-600 rounded-full mb-4">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-2">
                        Create Your Shop
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Bring your business vision to life with just a few clicks
                    </p>
                </div>

                <form
                    onSubmit={shopInfo}
                    className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border p-8 space-y-8"
                >
                    {/* Shop Name */}
                    <div className="space-y-2">
                        <Label htmlFor="shopName" className="text-foreground font-semibold flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-red-500" />
                            Shop Name
                        </Label>
                        <Input
                            id="shopName"
                            name="shopName"
                            type="text"
                            placeholder="What's your shop called?"
                            required
                            disabled={uploading}
                            className="h-12 border-2 border-input focus:border-red-400 focus:ring-red-400/20 rounded-xl transition-all duration-200 text-lg bg-background"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-foreground font-semibold">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Tell customers what makes your shop special..."
                            rows={4}
                            disabled={uploading}
                            className="border-2 border-input focus:border-red-400 focus:ring-red-400/20 rounded-xl resize-none transition-all duration-200 bg-background"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-foreground font-semibold flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-red-500" />
                            Shop Image
                        </Label>
                        <div
                            className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                                dragActive
                                    ? 'border-red-400 bg-red-500/10'
                                    : 'border-input hover:border-red-300'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <Input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                required
                                disabled={uploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                            />
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                                    dragActive ? 'bg-red-500/10' : 'bg-muted'
                                }`}>
                                    <Upload className={`w-8 h-8 ${
                                        dragActive ? 'text-red-500' : 'text-muted-foreground'
                                    }`} />
                                </div>

                                {selectedImage ? (
                                    <div className="text-center">
                                        <p className="text-green-600 dark:text-green-400 font-medium">{selectedImage.name}</p>
                                        <p className="text-sm text-muted-foreground">Click to change image</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-foreground font-medium mb-1">
                                            Drop your image here, or <span className="text-red-600 dark:text-red-400">click to browse</span>
                                        </p>
                                        <p className="text-sm text-muted-foreground">Supports JPG, PNG, GIF up to 10MB</p>
                                    </div>
                                )}

                                {imageUrl && (
                                    <Image
                                        fill
                                        src={imageUrl}
                                        alt="Uploaded Shop"
                                        className="mt-4 mx-auto rounded-lg max-h-48 object-contain"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label className="text-foreground font-semibold">
                            Category
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="h-12 border-2 border-input focus:border-red-400 focus:ring-red-400/20 rounded-xl transition-all duration-200 bg-background">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Electronics">Electronics</SelectItem>
                                <SelectItem value="Fashion">Fashion</SelectItem>
                                <SelectItem value="Home">Home</SelectItem>
                                <SelectItem value="Books">Books</SelectItem>
                                <SelectItem value="Sports">Sports</SelectItem>
                                <SelectItem value="Beauty">Beauty</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className={`w-full h-12 text-lg font-semibold rounded-xl transition-all duration-200 ${
                            isSubmitDisabled
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500'
                        }`}
                    >
                        {uploading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Uploading...</span>
                            </div>
                        ) : (
                            'Create Shop'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
