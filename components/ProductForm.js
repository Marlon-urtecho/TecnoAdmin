import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [category, setCategory] = useState(assignedCategory || "");
  const [productProperties, setProductProperties] = useState(
    assignedProperties || {}
  );
  const [price, setPrice] = useState(existingPrice || "");
  const [images, setImages] = useState(existingImages || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/categories").then((result) => setCategories(result.data));
  }, []);

  async function saveProduct(ev) {
    ev.preventDefault();
    const data = { title, description, price, images, category, properties: productProperties };
    try {
      if (_id) {
        await axios.put("/api/products", { ...data, _id });
      } else {
        await axios.post("/api/products", data);
      }
      setGoToProducts(true);
    } catch (err) {
      console.error(err);
    }
  }

  if (goToProducts) router.push("/products");

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (!files?.length) return;
    setIsUploading(true);
    const data = new FormData();
    for (const file of files) data.append("file", file);
    const res = await axios.post("/api/upload", data);
    setImages((oldImages) => [...oldImages, ...res.data.links]);
    setIsUploading(false);
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  function setProductProp(propName, value) {
    setProductProperties((prev) => ({ ...prev, [propName]: value }));
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...(catInfo?.properties || []));
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(({ _id }) => _id === catInfo?.parent?._id);
      propertiesToFill.push(...(parentCat?.properties || []));
      catInfo = parentCat;
    }
  }

  return (
    <form
      onSubmit={saveProduct}
      className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6"
    >
      <div className="space-y-1">
        <label className="font-medium text-gray-700">Product Name</label>
        <input
          type="text"
          placeholder="Enter product name"
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
        />
      </div>

      <div className="space-y-1">
        <label className="font-medium text-gray-700">Category</label>
        <select
          value={category}
          onChange={(ev) => setCategory(ev.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
        >
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div key={p.name} className="space-y-1">
            <label className="font-medium text-gray-700">
              {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
            </label>
            <select
              value={productProperties[p.name] || ""}
              onChange={(ev) => setProductProp(p.name, ev.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
            >
              {p.values.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        ))}

      <div className="space-y-1">
        <label className="font-medium text-gray-700">Photos</label>
        <div className="flex flex-wrap gap-3">
          <ReactSortable list={images} setList={updateImagesOrder} className="flex flex-wrap gap-3">
            {images.map((link) => (
              <div
                key={link}
                className="w-28 h-28 border border-gray-300 rounded-lg overflow-hidden shadow-sm relative"
              >
                <img src={link} alt="" className="object-cover w-full h-full" />
              </div>
            ))}
          </ReactSortable>

          {isUploading && (
            <div className="w-28 h-28 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50">
              <Spinner />
            </div>
          )}

          <label className="w-28 h-28 cursor-pointer flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mb-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <span className="text-xs text-center">Add Image</span>
            <input type="file" onChange={uploadImages} className="hidden" multiple />
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <label className="font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
          placeholder="Enter product description"
          className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition resize-none"
          rows={4}
        />
      </div>

      <div className="space-y-1">
        <label className="font-medium text-gray-700">Price (USD)</label>
        <input
          type="number"
          value={price}
          onChange={(ev) => setPrice(ev.target.value)}
          placeholder="0.00"
          className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium shadow transition-all duration-300"
      >
        Save Product
      </button>
    </form>
  );
}
