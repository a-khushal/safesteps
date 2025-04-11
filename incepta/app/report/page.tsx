

"use client"

import React, { useState, useRef } from 'react';
import { Shield, Upload } from 'lucide-react';
import { supabase } from '../supabase';
import { GoogleGenAI } from "@google/genai";
import { summarize } from '@/actions/summary';

type ScamType = 'phishing' | 'investment' | 'romance' | 'tech_support' | 'other';

interface FeedbackForm {
  title: string;
  description: string;
  image: File | null;
  scamType: ScamType;
}

function App() {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FeedbackForm>({
    title: '',
    description: '',
    image: null,
    scamType: 'phishing'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
  
    const { title, description, scamType, image } = form;
  
    if (!title || !description || !scamType) {
      alert("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
  
        let imageUrl = null;
  
        if (image) {
          const fileExt = image.name.split(".").pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `scam-images/${fileName}`;
  
          const { error: uploadError } = await supabase.storage
            .from("scam-images")
            .upload(filePath, image, {
              contentType: image.type,
              cacheControl: "3600",
              upsert: false,
            });
  
          if (uploadError) {
            console.error("Image upload failed:", uploadError);
            alert("Failed to upload image");
            setSubmitting(false);
            return;
          }
  
          const { data: publicUrlData } = supabase.storage
            .from("scam-images")
            .getPublicUrl(filePath);
  
          imageUrl = publicUrlData?.publicUrl;
        }
        
        const ai_summary = await summarize(`You are a summarizer. I just want to have the summary in a 3-4 sentences. Please summarize the following text: ${description}`);
  
        const { error: insertError } = await supabase.from("scams").insert([
          {
            title,
            description,
            type: scamType,
            lat: latitude,
            lng: longitude,
            image_url: imageUrl,
            ai_summary,
            timestamp: new Date().toISOString(),
          },
        ]);
  
        if (insertError) {
          console.error("Error inserting scam report:", insertError);
          alert("Failed to submit scam report");
          setSubmitting(false);
          return;
        }
  
        alert("Scam report submitted!");
        window.location.href = "/";
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Could not get your location. Please allow location access.");
        setSubmitting(false);
      }
    );
  };
   

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }

      setForm(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Scam Spotter</h1>
          <p className="text-gray-600">
            Help us fight scams by reporting suspicious activities. Your feedback helps protect others from falling victim to scams.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="E.g., Suspicious email from bank"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              />
              <p className="mt-1 text-sm text-gray-500">Give your scam report a clear title.</p>
            </div>

            <div>
              <label htmlFor="scamType" className="block text-sm font-medium text-gray-700">
                Type of Scam
              </label>
              <select
                id="scamType"
                name="scamType"
                value={form.scamType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="phishing">Phishing</option>
                <option value="investment">Investment</option>
                <option value="romance">Romance</option>
                <option value="tech_support">Tech Support</option>
                <option value="other">Other</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">Choose the category that best describes this scam.</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={form.description}
                onChange={handleChange}
                placeholder="Please describe the scam in detail. Include any suspicious links, emails, or behaviors you noticed."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
              />
              <p className="mt-1 text-sm text-gray-500">Include as much detail as possible to help others avoid this scam.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Evidence (Optional)
              </label>
              <div
                onClick={handleImageClick}
                className="mt-1 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-md px-6 pt-5 pb-6 cursor-pointer hover:border-gray-500 transition-colors text-center"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600 mt-2">Click to upload an image</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, GIF up to 5MB</p>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-4 max-h-48 object-contain rounded-md"
                  />
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">Upload a screenshot or image related to the scam.</p>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full hover:cursor-pointer flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-800'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600`}
                    >
                    {submitting ? (
                        <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                    ) : null}
                    {submitting ? "Submitting..." : "Submit Feedback"}
                </button>

            </div>
          </form>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          © 2025 Scam Spotter. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default App;
