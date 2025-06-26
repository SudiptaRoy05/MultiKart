"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Upload } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useShop } from "@/app/hooks/shopContext";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Star } from "lucide-react";

interface PricingData {
  price: string;
  salePrice: string;
  quantity: string;
  sku: string;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  pricing: PricingData;
  featured: boolean;
}

const categories = [
  "Select Category",
  "Electronics",
  "Clothing & Fashion",
  "Home & Garden",
  "Books & Media",
  "Sports & Outdoors",
  "Health & Beauty",
  "Toys & Games",
  "Automotive",
  "Food & Beverages",
  "Art & Crafts",
  "Jewelry & Accessories",
];

// Helper to convert File to base64 string (without prefix)
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Upload image to ImgBB
async function uploadImage(file: File): Promise<string | null> {
  try {
    const base64Image = await toBase64(file);
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY!;
    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("image", base64Image);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return data.data.url;
    } else {
      console.error("ImgBB upload failed:", data);
      return null;
    }
  } catch (error) {
    console.error("ImgBB upload error:", error);
    return null;
  }
}

export default function AddProductForm() {
  const { data: session } = useSession();
  const { selectedShop } = useShop();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "Select Category",
    pricing: {
      price: "",
      salePrice: "",
      quantity: "",
      sku: "",
    },
    featured: false,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("pricing.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setSelectedImage(file);

    setUploading(true);
    const uploadedUrl = await uploadImage(file);
    setUploading(false);

    if (uploadedUrl) {
      setImageUrl(uploadedUrl);
      toast.success("Image uploaded successfully!");
    } else {
      toast.error("Failed to upload image.");
      setSelectedImage(null);
      setImageUrl("");
    }
  };

  const handleFeaturedToggle = (pressed: boolean) => {
    setFormData((prev) => ({
      ...prev,
      featured: pressed,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email) {
      toast.error("You must be logged in to add a product.");
      return;
    }

    if (!selectedShop?._id) {
      toast.error("Please select a shop first.");
      return;
    }

    if (
      !formData.name ||
      !formData.description ||
      !formData.pricing.price ||
      !formData.pricing.quantity ||
      formData.category === "Select Category"
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!imageUrl) {
      toast.error("Please upload an image.");
      return;
    }

    // Prepare product data
    const productData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      imageUrl,
      price: Number(formData.pricing.price),
      salePrice: formData.pricing.salePrice
        ? Number(formData.pricing.salePrice)
        : undefined,
      quantity: Number(formData.pricing.quantity),
      sku: formData.pricing.sku || `SKU-${Date.now()}`,
      shopId: selectedShop._id,
      userEmail: session.user.email,
      featured: formData.featured,
    };

    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add product");
      }

      toast.success("Product added successfully!");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "Select Category",
        pricing: { price: "", salePrice: "", quantity: "", sku: "" },
        featured: false,
      });
      setSelectedImage(null);
      setImageUrl("");
      
      // Redirect to products page
      router.push("/dashboard/product");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to add product");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-6"
    >
      <div className="space-y-8">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black text-gray-900 dark:text-white px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Description *
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black text-gray-900 dark:text-white px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black text-gray-900 dark:text-white px-3 py-2 rounded-md"
            required
          >
            {categories.map((cat) => (
              <option
                key={cat}
                value={cat}
                disabled={cat === "Select Category"}
              >
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Price *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="pricing.price"
              value={formData.pricing.price}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black text-gray-900 dark:text-white px-3 py-2 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Sale Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="pricing.salePrice"
              value={formData.pricing.salePrice}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black text-gray-900 dark:text-white px-3 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="0"
              name="pricing.quantity"
              value={formData.pricing.quantity}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black text-gray-900 dark:text-white px-3 py-2 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              SKU
            </label>
            <input
              type="text"
              name="pricing.sku"
              value={formData.pricing.sku}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black text-gray-900 dark:text-white px-3 py-2 rounded-md"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center border rounded border-gray-300 dark:border-neutral-800">
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="w-24 h-24 bg-gray-50 dark:bg-neutral-900 border-dashed border-2 border-gray-300 dark:border-neutral-700 flex items-center justify-center rounded-2xl mb-4">
              <Upload className="text-gray-500 dark:text-white w-10 h-10" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
              <span className="text-red-600 underline">Browse files</span> or drag & drop
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Supports JPG, PNG, GIF (Max 10MB)
            </p>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          {selectedImage && (
            <p className="mt-2 text-green-600 font-medium">{selectedImage.name}</p>
          )}

          {imageUrl && (
            <div className="mt-6 p-2 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-lg max-w-xs">
              <Image
                src={imageUrl}
                alt="Uploaded Product"
                width={200}
                height={150}
                className="mx-auto rounded-md object-contain"
              />
            </div>
          )}
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="featured">Featured Product</Label>
          <Toggle
            id="featured"
            pressed={formData.featured}
            onPressedChange={handleFeaturedToggle}
            className="data-[state=on]:bg-yellow-500"
          >
            <Star className={`h-4 w-4 ${formData.featured ? 'fill-current' : ''}`} />
          </Toggle>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-neutral-800">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm text-gray-700 dark:text-white bg-white dark:bg-neutral-900"
            onClick={() => {
              setFormData({
                name: "",
                description: "",
                category: "Select Category",
                pricing: { price: "", salePrice: "", quantity: "", sku: "" },
                featured: false,
              });
              setSelectedImage(null);
              setImageUrl("");
            }}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Add Product"}
          </button>
        </div>
      </div>
    </form>
  );
}
