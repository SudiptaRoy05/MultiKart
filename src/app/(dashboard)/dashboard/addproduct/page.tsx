import AddProductForm from "@/components/AddProductForm";
import { ArrowLeft } from "lucide-react";

export default async function AddProduct() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-200" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Add New Product
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 ml-11">
                        Fill in the details to list your product for sale
                    </p>
                </div>

                {/* Form */}
                <AddProductForm />
            </div>
        </div>
    );
}
